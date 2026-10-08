// Copyright (c) 2026 Daniel Bates / Bates LLC. All rights reserved.
// help@batesai.org · https://batesai.org
//
// Subject Mastery.app: the local beta of the Subject Mastery web player.
//
// A native macOS window (AppKit + WKWebView) around the static build that the content
// pipeline writes to ~/Downloads/subject-mastery-build/. A small HTTP server inside the
// app serves that folder on a FIXED loopback port, so the page origin, and with it the
// localStorage that holds progress, profile and study plan, is the same on every launch.
// The server answers HTTP Range requests, so <audio> can seek.
//
// Build: app/build_app.sh. How it works and how it was verified: app/README.md.
// Compiling with -D SM_SERVER_CLI builds only the server as a command-line tool for tests.

import Foundation
import Network
#if !SM_SERVER_CLI
import Cocoa
import WebKit
#endif

// MARK: - Constants

/// Build folders to serve, in order; the first one that contains an index.html wins.
///   dist-live:   the exact build that is (or will be) deployed to batesai.org/subjectmastery/
///   dist-review: a reviewed release candidate
///   dist:        the content pipeline's latest build (pipeline/build.py)
/// "Reload" (Cmd-R) searches again, so a folder that appears later is picked up.
let kBuildSearchOrder = [
    "~/Downloads/subject-mastery-build/dist-live",
    "~/Downloads/subject-mastery-build/dist-review",
    "~/Downloads/subject-mastery-build/dist",
]
/// Parent of every build folder. Symlinks inside a build may point anywhere under it.
let kBuildRoot = "~/Downloads/subject-mastery-build"
/// The page origin is http://127.0.0.1:<port>. localStorage is keyed by origin, so this port
/// must never change, or the learner's progress would seem to vanish.
let kPreferredPort: UInt16 = 47913
/// When another program holds the preferred port, try this many ports after it. The window
/// title then says so, because progress saved under another port is kept separately.
let kFallbackPortCount: UInt16 = 4
let kLiveSiteURL = URL(string: "https://batesai.org/subjectmastery/")!
/// Google refuses OAuth inside embedded web views, so "Sign in" opens the live site instead.
let kAccountURL = URL(string: "https://batesai.org/subjectmastery/#/account")!
/// Hidden debug launch argument: run the in-page self-test and write its result here.
let kSelfTestFlag = "--sm-selftest"
let kLogDir = "~/Downloads/subject-mastery-build/logs-app"
let kAppVersionLabel = "beta"

func expand(_ path: String) -> String { (path as NSString).expandingTildeInPath }

/// The first build folder in kBuildSearchOrder that has an index.html, or nil.
func findBuildFolder() -> URL? {
    // A packaged beta is usable offline even after the Downloads workspace moves.
    if let bundled = Bundle.main.resourceURL?.appendingPathComponent("Site"),
       FileManager.default.fileExists(atPath: bundled.appendingPathComponent("index.html").path) {
        return bundled
    }
    for p in kBuildSearchOrder {
        let dir = expand(p)
        if FileManager.default.fileExists(atPath: dir + "/index.html") {
            return URL(fileURLWithPath: dir, isDirectory: true)
        }
    }
    return nil
}

/// macOS privacy (TCC) guards ~/Downloads: the app's first read there waits until the user
/// answers "Subject Mastery would like to access files in your Downloads folder". So the app
/// probes with one read, off the main thread, before it loads the player. An ad-hoc signed app
/// gets a new code identity on every rebuild, so a rebuilt app can ask once more.
enum FolderAccess {
    case unknown, checking, granted
    case denied(String)
}

func probeReadAccess(_ folder: URL, completion: @escaping (FolderAccess) -> Void) {
    DispatchQueue.global(qos: .userInitiated).async {
        let fd = open(folder.appendingPathComponent("index.html").path, O_RDONLY)
        var result = FolderAccess.granted
        if fd < 0 {
            result = .denied(String(cString: strerror(errno)))
        } else {
            var byte: UInt8 = 0
            if read(fd, &byte, 1) < 0 { result = .denied(String(cString: strerror(errno))) }
            close(fd)
        }
        DispatchQueue.main.async { completion(result) }
    }
}

// MARK: - Local HTTP server

/// A minimal HTTP/1.1 file server bound to 127.0.0.1 only. GET and HEAD for files, single
/// byte ranges (206 / 416), keep-alive, and two stub API answers so the player runs
/// local-only: GET /api/subjectmastery/me -> {"signedIn":false}; any other /api/* -> 401.
final class LocalServer {
    struct Stats {
        var requests = 0
        var rangeRequests = 0
        var partialResponses = 0
        var notFound = 0
        var rejected = 0
        var api = 0
    }

    private let queue = DispatchQueue(label: "org.batesai.subjectmastery.server")
    private var listener: NWListener?
    private var _root: URL?
    private var _stats = Stats()
    private(set) var port: UInt16 = 0
    /// Ports that were already taken by another program when we started.
    private(set) var skippedPorts: [UInt16] = []
    var log: (String) -> Void = { _ in }

    /// The folder being served. nil = no build yet: "/" then shows a notice page.
    var root: URL? {
        get { queue.sync { _root } }
        set { queue.sync { _root = newValue } }
    }
    var stats: Stats { queue.sync { _stats } }

    /// Binds the preferred port, else the next free one. Calls back on the main queue with
    /// the port, or nil and a reason.
    func start(completion: @escaping (UInt16?, String?) -> Void) {
        tryPort(kPreferredPort, completion: completion)
    }

    private func tryPort(_ p: UInt16, completion: @escaping (UInt16?, String?) -> Void) {
        guard p <= kPreferredPort + kFallbackPortCount else {
            DispatchQueue.main.async {
                completion(nil, "Ports \(kPreferredPort)–\(kPreferredPort + kFallbackPortCount) are all in use.")
            }
            return
        }
        // allowLocalEndpointReuse lets a quick relaunch bind past the old TIME_WAIT sockets,
        // but it would also let us share a port with another listener. So probe first:
        // if anything accepts a connection on the port, it belongs to someone else.
        if Self.somethingListens(on: p) {
            log("port \(p) is in use by another program; trying \(p + 1)")
            skippedPorts.append(p)
            tryPort(p + 1, completion: completion)
            return
        }
        let params = NWParameters.tcp
        params.allowLocalEndpointReuse = true
        params.requiredLocalEndpoint = .hostPort(host: .ipv4(.loopback), port: NWEndpoint.Port(rawValue: p)!)
        let l: NWListener
        do { l = try NWListener(using: params) } catch {
            log("listener on \(p) failed: \(error)")
            skippedPorts.append(p)
            tryPort(p + 1, completion: completion)
            return
        }
        var settled = false
        l.newConnectionHandler = { [weak self] c in self?.accept(c) }
        l.stateUpdateHandler = { [weak self] state in
            guard let self, !settled else { return }
            switch state {
            case .ready:
                settled = true
                self.port = p
                self.log("listening on 127.0.0.1:\(p)")
                DispatchQueue.main.async { completion(p, nil) }
            case .failed(let error):
                settled = true
                l.cancel()
                self.log("port \(p) failed: \(error)")
                self.skippedPorts.append(p)
                self.tryPort(p + 1, completion: completion)
            default:
                break
            }
        }
        listener = l
        l.start(queue: queue)
    }

    func stop() {
        listener?.cancel()
        listener = nil
    }

    /// True when a TCP connect to 127.0.0.1:port succeeds (a loopback connect answers at once).
    static func somethingListens(on port: UInt16) -> Bool {
        let fd = socket(AF_INET, SOCK_STREAM, 0)
        guard fd >= 0 else { return false }
        defer { close(fd) }
        var addr = sockaddr_in()
        addr.sin_len = UInt8(MemoryLayout<sockaddr_in>.size)
        addr.sin_family = sa_family_t(AF_INET)
        addr.sin_port = port.bigEndian
        addr.sin_addr.s_addr = inet_addr("127.0.0.1")
        let r = withUnsafePointer(to: &addr) {
            $0.withMemoryRebound(to: sockaddr.self, capacity: 1) {
                connect(fd, $0, socklen_t(MemoryLayout<sockaddr_in>.size))
            }
        }
        return r == 0
    }

    // MARK: Connections

    private struct Request {
        var method = ""
        var target = ""
        var version = ""
        var headers: [String: String] = [:]
    }

    private func accept(_ c: NWConnection) {
        c.start(queue: queue)
        receive(c, buffer: Data())
    }

    /// Reads one request head (up to the blank line), then handles it.
    private func receive(_ c: NWConnection, buffer: Data) {
        if let end = buffer.range(of: Data("\r\n\r\n".utf8)) {
            let head = buffer.subdata(in: buffer.startIndex..<end.lowerBound)
            let rest = buffer.subdata(in: end.upperBound..<buffer.endIndex)
            handle(c, head: head, leftover: rest)
            return
        }
        guard buffer.count < 32 * 1024 else { c.cancel(); return }
        c.receive(minimumIncompleteLength: 1, maximumLength: 64 * 1024) { [weak self] data, _, done, error in
            guard let self else { c.cancel(); return }
            var buf = buffer
            if let data { buf.append(data) }
            if error != nil || (done && (data?.isEmpty ?? true)) { c.cancel(); return }
            self.receive(c, buffer: buf)
        }
    }

    private func parse(_ head: Data) -> Request? {
        guard let text = String(data: head, encoding: .utf8) ?? String(data: head, encoding: .isoLatin1) else { return nil }
        var lines = text.components(separatedBy: "\r\n")
        let first = lines.removeFirst().split(separator: " ", omittingEmptySubsequences: true)
        guard first.count == 3 else { return nil }
        var r = Request(method: String(first[0]), target: String(first[1]), version: String(first[2]))
        for line in lines {
            guard let colon = line.firstIndex(of: ":") else { continue }
            let name = line[..<colon].trimmingCharacters(in: .whitespaces).lowercased()
            r.headers[name] = line[line.index(after: colon)...].trimmingCharacters(in: .whitespaces)
        }
        return r
    }

    private func handle(_ c: NWConnection, head: Data, leftover: Data) {
        _stats.requests += 1
        guard let req = parse(head) else {
            respond(c, 400, "Bad Request", text: "Bad request\n", keepAlive: false, leftover: Data())
            return
        }
        let hasBody = (Int(req.headers["content-length"] ?? "0") ?? 1) > 0 || req.headers["transfer-encoding"] != nil
        let wantsClose = req.headers["connection"]?.lowercased() == "close" || req.version == "HTTP/1.0"
        let keepAlive = !hasBody && !wantsClose
        let next = keepAlive ? leftover : Data()

        // DNS-rebinding guard: only our own origin may talk to us.
        let host = (req.headers["host"] ?? "").lowercased()
        guard host == "127.0.0.1:\(port)" || host == "localhost:\(port)" else {
            _stats.rejected += 1
            respond(c, 403, "Forbidden", text: "Forbidden\n", keepAlive: false, leftover: Data())
            return
        }
        let rawPath = String(req.target.split(separator: "?", maxSplits: 1, omittingEmptySubsequences: false)[0])
        guard let path = rawPath.removingPercentEncoding, path.hasPrefix("/") else {
            respond(c, 400, "Bad Request", text: "Bad request\n", keepAlive: false, leftover: Data())
            return
        }

        if path == "/api" || path.hasPrefix("/api/") {
            _stats.api += 1
            if path == "/api/subjectmastery/me" && (req.method == "GET" || req.method == "HEAD") {
                respond(c, 200, "OK", json: #"{"signedIn":false}"#, head: req.method == "HEAD", keepAlive: keepAlive, leftover: next)
            } else {
                respond(c, 401, "Unauthorized",
                        json: #"{"error":"Not signed in. The Subject Mastery app keeps progress on this Mac; sign in at https://batesai.org/subjectmastery/ to sync."}"#,
                        head: req.method == "HEAD", keepAlive: keepAlive, leftover: next)
            }
            return
        }
        guard req.method == "GET" || req.method == "HEAD" else {
            respond(c, 405, "Method Not Allowed", text: "Method not allowed\n", extra: [("Allow", "GET, HEAD")],
                    keepAlive: false, leftover: Data())
            return
        }
        // No build yet: answer "/" with the notice page. (The app looks again on Reload.)
        guard let root = _root else {
            if path == "/" {
                respond(c, 200, "OK", html: noBuildPage(), head: req.method == "HEAD", keepAlive: keepAlive, leftover: next)
            } else {
                _stats.notFound += 1
                respond(c, 404, "Not Found", text: "Not found\n", keepAlive: keepAlive, leftover: next)
            }
            return
        }
        guard let file = resolve(path, in: root) else {
            _stats.notFound += 1
            respond(c, 404, "Not Found", text: "Not found\n", keepAlive: keepAlive, leftover: next)
            return
        }
        serveFile(c, file: file, request: req, keepAlive: keepAlive, leftover: next)
    }

    /// Maps a decoded URL path to a file inside root. Rejects dot segments (no traversal, no
    /// hidden files). Symlinks are followed, but only to targets under kBuildRoot.
    private func resolve(_ path: String, in root: URL) -> URL? {
        guard !path.contains("\0"), !path.contains("\\") else { return nil }
        var url = root
        for part in path.split(separator: "/") {
            if part.hasPrefix(".") { return nil }
            url.appendPathComponent(String(part))
        }
        let fm = FileManager.default
        var isDir: ObjCBool = false
        if fm.fileExists(atPath: url.path, isDirectory: &isDir), isDir.boolValue {
            url.appendPathComponent("index.html")
        }
        let real = url.resolvingSymlinksInPath().path
        let allowed = URL(fileURLWithPath: expand(kBuildRoot)).resolvingSymlinksInPath().path + "/"
        let servedRoot = root.resolvingSymlinksInPath().path + "/"
        guard real.hasPrefix(servedRoot) || real.hasPrefix(allowed) else { return nil }
        guard fm.fileExists(atPath: real, isDirectory: &isDir), !isDir.boolValue, fm.isReadableFile(atPath: real) else { return nil }
        return URL(fileURLWithPath: real)
    }

    static let mimeTypes: [String: String] = [
        "html": "text/html; charset=utf-8", "htm": "text/html; charset=utf-8",
        "js": "text/javascript; charset=utf-8", "mjs": "text/javascript; charset=utf-8",
        "css": "text/css; charset=utf-8", "json": "application/json; charset=utf-8",
        "webmanifest": "application/manifest+json", "txt": "text/plain; charset=utf-8",
        "md": "text/markdown; charset=utf-8", "svg": "image/svg+xml", "png": "image/png",
        "jpg": "image/jpeg", "jpeg": "image/jpeg", "webp": "image/webp", "gif": "image/gif",
        "ico": "image/x-icon", "mp3": "audio/mpeg", "m4a": "audio/mp4", "wav": "audio/wav",
        "ogg": "audio/ogg", "woff": "font/woff", "woff2": "font/woff2", "pdf": "application/pdf",
    ]

    /// Parses a single "bytes=a-b" / "bytes=a-" / "bytes=-n" range. nil = ignore the header
    /// (serve the whole file); .some(nil) = unsatisfiable (416).
    static func byteRange(_ header: String, size: UInt64) -> ClosedRange<UInt64>?? {
        let h = header.trimmingCharacters(in: .whitespaces)
        guard h.lowercased().hasPrefix("bytes=") else { return nil }
        let spec = h.dropFirst(6).split(separator: ",")[0].trimmingCharacters(in: .whitespaces)
        let parts = spec.split(separator: "-", maxSplits: 1, omittingEmptySubsequences: false).map(String.init)
        guard parts.count == 2 else { return nil }
        if parts[0].isEmpty {
            guard let n = UInt64(parts[1]), n > 0 else { return .some(nil) }
            guard size > 0 else { return .some(nil) }
            return .some((size - min(n, size))...(size - 1))
        }
        guard let start = UInt64(parts[0]) else { return nil }
        guard start < size else { return .some(nil) }
        var end = size - 1
        if !parts[1].isEmpty {
            guard let e = UInt64(parts[1]), e >= start else { return nil }
            end = min(e, size - 1)
        }
        return .some(start...end)
    }

    private func serveFile(_ c: NWConnection, file: URL, request: Request, keepAlive: Bool, leftover: Data) {
        // stat(), not FileManager.attributesOfItem(), which also reads every extended attribute.
        var st = stat()
        let size = stat(file.path, &st) == 0 ? UInt64(st.st_size) : 0
        let type = Self.mimeTypes[file.pathExtension.lowercased()] ?? "application/octet-stream"
        var status = 200, reason = "OK"
        var range: ClosedRange<UInt64>? = size > 0 ? 0...(size - 1) : nil
        var extra: [(String, String)] = [("Accept-Ranges", "bytes")]
        if let rh = request.headers["range"] {
            _stats.rangeRequests += 1
            switch Self.byteRange(rh, size: size) {
            case .none:
                break
            case .some(.none):
                respond(c, 416, "Range Not Satisfiable", text: "", extra: [("Content-Range", "bytes */\(size)")],
                        keepAlive: keepAlive, leftover: leftover)
                return
            case .some(.some(let r)):
                status = 206; reason = "Partial Content"; range = r
                extra.append(("Content-Range", "bytes \(r.lowerBound)-\(r.upperBound)/\(size)"))
                _stats.partialResponses += 1
            }
        }
        let length = range.map { $0.upperBound - $0.lowerBound + 1 } ?? 0
        var head = "HTTP/1.1 \(status) \(reason)\r\nContent-Type: \(type)\r\nContent-Length: \(length)\r\n"
        head += "Cache-Control: no-cache\r\nX-Content-Type-Options: nosniff\r\n"
        for (k, v) in extra { head += "\(k): \(v)\r\n" }
        head += "Connection: \(keepAlive ? "keep-alive" : "close")\r\n\r\n"
        c.send(content: Data(head.utf8), completion: .contentProcessed { [weak self] error in
            guard let self else { return }
            if error != nil { c.cancel(); return }
            guard request.method != "HEAD", let range, length > 0, let fh = try? FileHandle(forReadingFrom: file) else {
                self.finish(c, keepAlive: keepAlive, leftover: leftover)
                return
            }
            do { try fh.seek(toOffset: range.lowerBound) } catch { try? fh.close(); c.cancel(); return }
            self.pump(c, fh, remaining: length, keepAlive: keepAlive, leftover: leftover)
        })
    }

    /// Streams the file in 256 KB chunks, so large audio never sits in memory whole.
    private func pump(_ c: NWConnection, _ fh: FileHandle, remaining: UInt64, keepAlive: Bool, leftover: Data) {
        if remaining == 0 {
            try? fh.close()
            finish(c, keepAlive: keepAlive, leftover: leftover)
            return
        }
        let want = Int(min(remaining, 256 * 1024))
        guard let chunk = try? fh.read(upToCount: want), !chunk.isEmpty else {
            try? fh.close()
            c.cancel()  // file shrank under us (a rebuild swapped it): drop the connection
            return
        }
        c.send(content: chunk, completion: .contentProcessed { [weak self] error in
            if error != nil { try? fh.close(); c.cancel(); return }
            self?.pump(c, fh, remaining: remaining - UInt64(chunk.count), keepAlive: keepAlive, leftover: leftover)
        })
    }

    private func finish(_ c: NWConnection, keepAlive: Bool, leftover: Data) {
        if keepAlive { receive(c, buffer: leftover) } else { c.cancel() }
    }

    private func respond(_ c: NWConnection, _ status: Int, _ reason: String, text: String? = nil, json: String? = nil,
                         html: String? = nil, head: Bool = false, extra: [(String, String)] = [],
                         keepAlive: Bool, leftover: Data) {
        let type = json != nil ? "application/json; charset=utf-8" : html != nil ? "text/html; charset=utf-8" : "text/plain; charset=utf-8"
        let body = Data((json ?? html ?? text ?? "").utf8)
        var h = "HTTP/1.1 \(status) \(reason)\r\nContent-Type: \(type)\r\nContent-Length: \(body.count)\r\n"
        h += "Cache-Control: no-store\r\nX-Content-Type-Options: nosniff\r\n"
        for (k, v) in extra { h += "\(k): \(v)\r\n" }
        h += "Connection: \(keepAlive ? "keep-alive" : "close")\r\n\r\n"
        var out = Data(h.utf8)
        if !head { out.append(body) }
        c.send(content: out, completion: .contentProcessed { [weak self] error in
            if error != nil { c.cancel(); return }
            self?.finish(c, keepAlive: keepAlive, leftover: leftover)
        })
    }

    /// Shown when no build folder exists yet. Plain HTML, no scripts.
    func noBuildPage() -> String {
        let list = kBuildSearchOrder.map { "<li><code>\($0)</code></li>" }.joined()
        return """
        <!doctype html><html lang="en"><head><meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1"><meta name="color-scheme" content="light dark">
        <title>Subject Mastery: no build yet</title>
        <style>
          :root { --bg:#f6f5f1; --fg:#1d2327; --muted:#5b6670; --card:#fff; --line:#e3e0d8; --accent:#0f766e; }
          @media (prefers-color-scheme: dark) { :root { --bg:#0f1415; --fg:#e7ecee; --muted:#9aa7ae; --card:#171e20; --line:#26302f; --accent:#2dd4bf; } }
          body { margin:0; background:var(--bg); color:var(--fg); font:16px/1.55 -apple-system, system-ui, sans-serif; }
          main { max-width:40rem; margin:0 auto; padding:48px 16px; }
          .card { background:var(--card); border:1px solid var(--line); border-radius:14px; padding:24px; }
          h1 { font-size:1.6rem; margin:0 0 8px; } p, li { color:var(--muted); } code { color:var(--fg); font-size:.92em; }
          pre { background:var(--bg); border:1px solid var(--line); border-radius:8px; padding:12px; overflow:auto; }
          a { color:var(--accent); }
        </style></head><body><main><div class="card">
        <h1>No Subject Mastery build yet</h1>
        <p>This app plays the local beta build of Subject Mastery. It looks for the first of these folders that has an <code>index.html</code>:</p>
        <ol>\(list)</ol>
        <p>Build one with the content pipeline, from the repo:</p>
        <pre>python3 -B pipeline/build.py</pre>
        <p>Then choose <b>View &gt; Reload</b> (Cmd-R), or <a href="/?check">check again</a>.
        Meanwhile you can use the live site: <a href="https://batesai.org/subjectmastery/">batesai.org/subjectmastery</a>.</p>
        <p>Help: <a href="mailto:help@batesai.org">help@batesai.org</a> · <a href="https://batesai.org">batesai.org</a></p>
        </div></main></body></html>
        """
    }
}

// MARK: - Debug log (only with --sm-selftest)

final class DebugLog {
    let enabled: Bool
    private let url: URL
    private let lock = NSLock()

    init(enabled: Bool) {
        self.enabled = enabled
        url = URL(fileURLWithPath: expand(kLogDir)).appendingPathComponent("app.log")
        if enabled { try? FileManager.default.createDirectory(at: url.deletingLastPathComponent(), withIntermediateDirectories: true) }
    }

    func write(_ line: String) {
        guard enabled else { return }
        lock.lock(); defer { lock.unlock() }
        let stamp = ISO8601DateFormatter().string(from: Date())
        let data = Data("\(stamp) \(line)\n".utf8)
        if let fh = try? FileHandle(forWritingTo: url) {
            fh.seekToEndOfFile(); fh.write(data); try? fh.close()
        } else {
            try? data.write(to: url)
        }
    }

    func writeFile(_ name: String, _ data: Data) {
        guard enabled else { return }
        try? data.write(to: url.deletingLastPathComponent().appendingPathComponent(name), options: .atomic)
    }
}

#if SM_SERVER_CLI

// MARK: - Command-line server for tests: SubjectMasteryServer [root]

let cliServer = LocalServer()
cliServer.log = { FileHandle.standardError.write(Data("[server] \($0)\n".utf8)) }
if CommandLine.arguments.count > 1 {
    cliServer.root = URL(fileURLWithPath: CommandLine.arguments[1], isDirectory: true)
} else {
    cliServer.root = findBuildFolder()
}
cliServer.start { port, error in
    if let port { print("PORT \(port)"); fflush(stdout) } else { print("ERROR \(error ?? "?")"); exit(1) }
}
signal(SIGTERM) { _ in exit(0) }
dispatchMain()

#else

// MARK: - App

/// JavaScript run by --sm-selftest inside the page (isolated content world). It checks that
/// the player rendered, that localStorage kept the marker from the previous launch, the API
/// stubs, byte ranges, and <audio> seeking and background playback (muted: no sound).
let kSelfTestJS = #"""
const out = { startedAt: new Date().toISOString(), href: location.href, errors: [] };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const within = (p, ms, what) => Promise.race([p, new Promise((_, rej) => setTimeout(() => rej(new Error(what + ' timed out')), ms))]);
try {
  const t0 = Date.now();
  while (Date.now() - t0 < 15000) {
    const app = document.getElementById('app');
    if (app && app.children.length && document.body.innerText.trim().length > 80) break;
    await sleep(250);
  }
  const app = document.getElementById('app');
  out.render = {
    appChildren: app ? app.children.length : 0,
    textLength: document.body.innerText.trim().length,
    title: document.title,
    h1: (document.querySelector('h1') || {}).textContent || null,
    subjectCards: document.querySelectorAll('a[href^="#/s/"]').length,
    visibilityState: document.visibilityState,
  };

  const KEY = 'sm.apptest.v1';
  out.persistence = {
    previous: JSON.parse(localStorage.getItem(KEY) || 'null'),
    progressKeys: Object.keys(JSON.parse(localStorage.getItem('sm.progress.v1') || '{}')).length,
    prefs: localStorage.getItem('sm.prefs.v1'),
  };
  const id = (crypto.randomUUID ? crypto.randomUUID() : String(Math.random()).slice(2));
  const marker = { launchId: id, at: new Date().toISOString() };
  localStorage.setItem(KEY, JSON.stringify(marker));
  out.persistence.wrote = marker;

  const me = await fetch('/api/subjectmastery/me', { cache: 'no-store' });
  out.api = { meStatus: me.status, me: await me.json() };
  const pr = await fetch('/api/subjectmastery/progress', { cache: 'no-store' });
  out.api.progressStatus = pr.status;
  out.api.progressBody = await pr.json();
  const put = await fetch('/api/subjectmastery/progress', { method: 'PUT', headers: { 'content-type': 'application/json' }, body: '{"items":[]}' });
  out.api.putStatus = put.status;

  const cat = await (await fetch('data/catalog.json', { cache: 'no-store' })).json();
  let lessonKey = null;
  for (const s of cat.subjects.filter((x) => x.status === 'available')) {
    const subj = await (await fetch('data/subjects/' + s.id + '.json', { cache: 'no-store' })).json();
    const walk = (n) => { for (const l of n.lessons || []) if (l.hasAudio && !lessonKey) lessonKey = l.key; for (const m of n.modules || []) walk(m); };
    walk(subj);
    if (lessonKey) break;
  }
  if (!lessonKey) throw new Error('no lesson with audio in this build');
  const lesson = await (await fetch('data/lessons/' + lessonKey + '.json', { cache: 'no-store' })).json();
  const audioUrl = lesson.audio;

  const headRes = await fetch(audioUrl, { method: 'HEAD', cache: 'no-store' });
  const total = Number(headRes.headers.get('content-length'));
  const whole = new Uint8Array(await (await fetch(audioUrl, { cache: 'no-store' })).arrayBuffer());
  const same = (buf, off) => { const u = new Uint8Array(buf); if (!u.length) return false; for (let i = 0; i < u.length; i++) if (u[i] !== whole[off + i]) return false; return true; };
  const r1 = await fetch(audioUrl, { headers: { Range: 'bytes=1000-1999' }, cache: 'no-store' }); const b1 = await r1.arrayBuffer();
  const r2 = await fetch(audioUrl, { headers: { Range: 'bytes=-500' }, cache: 'no-store' }); const b2 = await r2.arrayBuffer();
  const r3 = await fetch(audioUrl, { headers: { Range: 'bytes=' + (total + 10) + '-' }, cache: 'no-store' });
  out.range = {
    lessonKey, audioUrl, total, wholeBytes: whole.length,
    acceptRanges: headRes.headers.get('accept-ranges'), contentType: headRes.headers.get('content-type'),
    mid: { status: r1.status, contentRange: r1.headers.get('content-range'), bytes: b1.byteLength, matchesWhole: same(b1, 1000) },
    suffix: { status: r2.status, contentRange: r2.headers.get('content-range'), bytes: b2.byteLength, matchesWhole: same(b2, total - 500) },
    unsatisfiable: { status: r3.status, contentRange: r3.headers.get('content-range') },
  };

  const a = new Audio();
  a.muted = true;
  a.preload = 'auto';
  a.src = audioUrl;
  await within(new Promise((res, rej) => { a.onloadedmetadata = res; a.onerror = () => rej(new Error('audio error ' + (a.error && a.error.code))); }), 20000, 'loadedmetadata');
  const target = Math.max(1, Math.floor(a.duration * 0.6));
  const t1 = performance.now();
  a.currentTime = target;
  await within(new Promise((res) => { a.onseeked = res; }), 20000, 'seeked');
  out.audio = {
    duration: a.duration, seekTarget: target, afterSeek: a.currentTime, seekMs: Math.round(performance.now() - t1),
    seekableEnd: a.seekable.length ? a.seekable.end(0) : null,
  };
  await within(a.play(), 10000, 'play');
  await sleep(3000);
  out.audio.after3sPlay = a.currentTime;
  out.audio.advancedSeconds = Math.round((a.currentTime - out.audio.afterSeek) * 100) / 100;
  out.audio.paused = a.paused;
  out.audio.muted = a.muted;
  out.audio.visibilityState = document.visibilityState;
  out.audio.documentHasFocus = document.hasFocus();
  a.pause();
  a.removeAttribute('src');
  a.load();

  const link = document.createElement('a');
  link.href = '/api/auth/oauth/google?return_to=/';
  document.body.append(link);
  link.click();
  link.remove();
  await sleep(1000);
  out.afterSignInClick = { href: location.href };
} catch (e) {
  out.errors.push(String((e && e.stack) || e));
}
out.finishedAt = new Date().toISOString();
return JSON.stringify(out);
"""#

final class AppDelegate: NSObject, NSApplicationDelegate, NSWindowDelegate, WKNavigationDelegate, WKUIDelegate, WKDownloadDelegate {
    let server = LocalServer()
    let selfTest = CommandLine.arguments.contains(kSelfTestFlag)
    lazy var debug = DebugLog(enabled: selfTest)
    var window: NSWindow!
    var webView: WKWebView!
    var buildFolder: URL?
    var access = FolderAccess.unknown
    var serverError: String?
    var activity: NSObjectProtocol?
    var termSource: DispatchSourceSignal?
    var selfTestStarted = false
    var interceptedAuth: [String] = []
    var frameAtLaunch: NSRect = .zero
    let frameName = "SubjectMasteryMainWindow"

    func applicationDidFinishLaunching(_ note: Notification) {
        debug.write("launch pid \(ProcessInfo.processInfo.processIdentifier) args \(CommandLine.arguments.dropFirst()) active=\(NSApp.isActive)")
        buildMenu()
        buildWindow()
        // The server runs in this process: keep App Nap from slowing it while audio plays
        // with the window in the background. System sleep stays allowed.
        activity = ProcessInfo.processInfo.beginActivity(options: [.userInitiatedAllowingIdleSystemSleep],
                                                         reason: "Serving lessons to the player")
        // `kill <pid>` (SIGTERM) quits cleanly too, so the window frame and storage are saved.
        signal(SIGTERM, SIG_IGN)
        let src = DispatchSource.makeSignalSource(signal: SIGTERM, queue: .main)
        src.setEventHandler { NSApp.terminate(nil) }
        src.resume()
        termSource = src

        buildFolder = findBuildFolder()
        server.root = buildFolder
        server.log = { [weak self] line in self?.debug.write("server: " + line) }
        server.start { [weak self] port, error in
            guard let self else { return }
            if let port {
                self.debug.write("serving \(self.buildFolder?.path ?? "(no build)") on port \(port)")
                self.updateTitle()
                self.loadContent()
            } else {
                self.serverError = error
                self.debug.write("server failed: \(error ?? "?")")
                self.updateTitle()
                self.webView.loadHTMLString(self.serverFailedPage(error ?? "unknown error"), baseURL: nil)
            }
        }
    }

    func applicationShouldTerminateAfterLastWindowClosed(_ app: NSApplication) -> Bool { true }

    func applicationWillTerminate(_ note: Notification) {
        window?.saveFrame(usingName: frameName)
        server.stop()
        if let activity { ProcessInfo.processInfo.endActivity(activity) }
        debug.write("quit")
    }

    func origin() -> URL { URL(string: "http://127.0.0.1:\(server.port)/")! }

    /// Loads the player once the build folder is readable (see FolderAccess), or a page that
    /// explains what is missing. Never blocks the main thread.
    func loadContent() {
        guard serverError == nil, server.port != 0 else { return }
        guard let folder = buildFolder else {
            webView.load(URLRequest(url: origin()))  // the server's "no build yet" page
            return
        }
        switch access {
        case .granted:
            webView.load(URLRequest(url: origin()))
        case .checking:
            break
        case .unknown, .denied:
            access = .checking
            // Explain only if the check takes a moment, which means macOS is asking the user.
            let explain = DispatchWorkItem { [weak self] in
                guard let self, case .checking = self.access else { return }
                self.debug.write("waiting for permission to read \(folder.path)")
                self.webView.loadHTMLString(self.noticePage(
                    title: "Waiting for permission",
                    body: "<p>The beta build lives in your Downloads folder, and macOS is asking whether "
                        + "Subject Mastery may read it. Choose <b>Allow</b> in that dialog.</p>"
                        + "<p>The app only reads the build folder <code>\(self.tilde(folder))</code>; it never changes anything there.</p>"),
                    baseURL: nil)
            }
            DispatchQueue.main.asyncAfter(deadline: .now() + 0.5, execute: explain)
            probeReadAccess(folder) { [weak self] result in
                guard let self else { return }
                explain.cancel()
                self.access = result
                switch result {
                case .granted:
                    self.debug.write("read access to \(folder.path): granted")
                    self.webView.load(URLRequest(url: self.origin()))
                case .denied(let why):
                    self.debug.write("read access to \(folder.path): denied (\(why))")
                    self.webView.loadHTMLString(self.noticePage(
                        title: "Subject Mastery cannot read its build folder",
                        body: "<p>macOS refused access to <code>\(self.tilde(folder))</code> (\(why)).</p>"
                            + "<p>Open <b>System Settings &gt; Privacy &amp; Security &gt; Files and Folders</b>, find "
                            + "<b>Subject Mastery</b> and turn on <b>Downloads Folder</b>. Then choose <b>View &gt; Reload</b> (Cmd-R).</p>"),
                        baseURL: nil)
                default:
                    break
                }
            }
        }
    }

    func tilde(_ url: URL) -> String { (url.path as NSString).abbreviatingWithTildeInPath }

    func noticePage(title: String, body: String) -> String {
        """
        <!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="color-scheme" content="light dark">
        <title>\(title)</title>
        <style>
          :root { --bg:#f6f5f1; --fg:#1d2327; --muted:#5b6670; --card:#fff; --line:#e3e0d8; --accent:#0f766e; }
          @media (prefers-color-scheme: dark) { :root { --bg:#0f1415; --fg:#e7ecee; --muted:#9aa7ae; --card:#171e20; --line:#26302f; --accent:#2dd4bf; } }
          body { margin:0; background:var(--bg); color:var(--fg); font:16px/1.55 -apple-system, system-ui, sans-serif; }
          main { max-width:40rem; margin:0 auto; padding:48px 16px; }
          .card { background:var(--card); border:1px solid var(--line); border-radius:14px; padding:24px; }
          h1 { font-size:1.5rem; margin:0 0 8px; } p { color:var(--muted); } code, b { color:var(--fg); } a { color:var(--accent); }
        </style></head><body><main><div class="card"><h1>\(title)</h1>\(body)
        <p>Help: <a href="mailto:help@batesai.org">help@batesai.org</a> · <a href="https://batesai.org">batesai.org</a></p>
        </div></main></body></html>
        """
    }

    // MARK: Window

    func buildWindow() {
        let config = WKWebViewConfiguration()
        config.websiteDataStore = .default()                 // persistent: ~/Library/WebKit/<bundle id>
        config.mediaTypesRequiringUserActionForPlayback = []  // pages autoplay one after another
        config.allowsAirPlayForMediaPlayback = true
        config.applicationNameForUserAgent = "SubjectMasteryApp/\(Bundle.main.object(forInfoDictionaryKey: "CFBundleShortVersionString") as? String ?? "0")"
        if #available(macOS 12.3, *) { config.preferences.isElementFullscreenEnabled = true }

        webView = WKWebView(frame: NSRect(x: 0, y: 0, width: 1180, height: 820), configuration: config)
        webView.navigationDelegate = self
        webView.uiDelegate = self
        webView.allowsBackForwardNavigationGestures = true
        webView.allowsMagnification = true
        if #available(macOS 13.3, *) { webView.isInspectable = true }  // Safari > Develop, for beta testing

        window = NSWindow(contentRect: NSRect(x: 0, y: 0, width: 1180, height: 820),
                          styleMask: [.titled, .closable, .miniaturizable, .resizable],
                          backing: .buffered, defer: false)
        window.isRestorable = false
        window.minSize = NSSize(width: 360, height: 480)
        window.contentView = webView
        window.delegate = self
        window.tabbingMode = .disallowed
        window.center()
        window.setFrameUsingName(frameName)    // remembered size and position, if any
        window.setFrameAutosaveName(frameName)  // and keep remembering
        frameAtLaunch = window.frame
        updateTitle()
        // With `open -g` the app is not active, and the window stays behind the active app.
        window.makeKeyAndOrderFront(nil)
        debug.write("window \(window.windowNumber) frame \(NSStringFromRect(window.frame))")
    }

    func updateTitle() {
        var t = "Subject Mastery (\(kAppVersionLabel))"
        if let f = buildFolder { t += " · \(f.lastPathComponent)" } else { t += " · no build yet" }
        if serverError != nil {
            t += " · server not running"
        } else if server.port != 0 && server.port != kPreferredPort {
            t += " · port \(server.port), not \(kPreferredPort) (in use): progress here is kept separately"
        }
        window?.title = t
    }

    func serverFailedPage(_ why: String) -> String {
        noticePage(title: "Subject Mastery could not start its local server",
                   body: "<p>\(why)</p><p>Quit the program that uses ports \(kPreferredPort)–\(kPreferredPort + kFallbackPortCount), "
                       + "then open the app again. The live site works meanwhile: "
                       + "<a href=\"https://batesai.org/subjectmastery/\">batesai.org/subjectmastery</a>.</p>")
    }

    // MARK: Menu

    func buildMenu() {
        let main = NSMenu()

        let appMenu = NSMenu()
        appMenu.addItem(withTitle: "About Subject Mastery", action: #selector(showAbout(_:)), keyEquivalent: "")
        appMenu.addItem(.separator())
        appMenu.addItem(withTitle: "Hide Subject Mastery", action: #selector(NSApplication.hide(_:)), keyEquivalent: "h")
        appMenu.addItem(withTitle: "Hide Others", action: #selector(NSApplication.hideOtherApplications(_:)), keyEquivalent: "h")
            .keyEquivalentModifierMask = [.command, .option]
        appMenu.addItem(withTitle: "Show All", action: #selector(NSApplication.unhideAllApplications(_:)), keyEquivalent: "")
        appMenu.addItem(.separator())
        appMenu.addItem(withTitle: "Quit Subject Mastery", action: #selector(NSApplication.terminate(_:)), keyEquivalent: "q")
        addSubmenu(appMenu, "Subject Mastery", to: main)

        let file = NSMenu(title: "File")
        file.addItem(withTitle: "Open Live Site", action: #selector(openLiveSite(_:)), keyEquivalent: "l")
            .keyEquivalentModifierMask = [.command, .shift]
        file.addItem(withTitle: "Show Build Folder", action: #selector(showBuildFolder(_:)), keyEquivalent: "b")
            .keyEquivalentModifierMask = [.command, .shift]
        file.addItem(.separator())
        file.addItem(withTitle: "Close Window", action: #selector(NSWindow.performClose(_:)), keyEquivalent: "w")
        addSubmenu(file, "File", to: main)

        let edit = NSMenu(title: "Edit")
        edit.addItem(withTitle: "Undo", action: Selector(("undo:")), keyEquivalent: "z")
        edit.addItem(withTitle: "Redo", action: Selector(("redo:")), keyEquivalent: "Z")
        edit.addItem(.separator())
        edit.addItem(withTitle: "Cut", action: #selector(NSText.cut(_:)), keyEquivalent: "x")
        edit.addItem(withTitle: "Copy", action: #selector(NSText.copy(_:)), keyEquivalent: "c")
        edit.addItem(withTitle: "Paste", action: #selector(NSText.paste(_:)), keyEquivalent: "v")
        edit.addItem(withTitle: "Paste and Match Style", action: #selector(NSTextView.pasteAsPlainText(_:)), keyEquivalent: "V")
            .keyEquivalentModifierMask = [.command, .option, .shift]
        edit.addItem(withTitle: "Delete", action: #selector(NSText.delete(_:)), keyEquivalent: "")
        edit.addItem(withTitle: "Select All", action: #selector(NSText.selectAll(_:)), keyEquivalent: "a")
        addSubmenu(edit, "Edit", to: main)

        let view = NSMenu(title: "View")
        view.addItem(withTitle: "Reload", action: #selector(reload(_:)), keyEquivalent: "r")
        view.addItem(.separator())
        view.addItem(withTitle: "Actual Size", action: #selector(zoomReset(_:)), keyEquivalent: "0")
        view.addItem(withTitle: "Zoom In", action: #selector(zoomIn(_:)), keyEquivalent: "+")
        view.addItem(withTitle: "Zoom Out", action: #selector(zoomOut(_:)), keyEquivalent: "-")
        view.addItem(.separator())
        view.addItem(withTitle: "Enter Full Screen", action: #selector(NSWindow.toggleFullScreen(_:)), keyEquivalent: "f")
            .keyEquivalentModifierMask = [.command, .control]
        addSubmenu(view, "View", to: main)

        let win = NSMenu(title: "Window")
        win.addItem(withTitle: "Minimize", action: #selector(NSWindow.performMiniaturize(_:)), keyEquivalent: "m")
        win.addItem(withTitle: "Zoom", action: #selector(NSWindow.performZoom(_:)), keyEquivalent: "")
        win.addItem(.separator())
        win.addItem(withTitle: "Bring All to Front", action: #selector(NSApplication.arrangeInFront(_:)), keyEquivalent: "")
        addSubmenu(win, "Window", to: main)
        NSApp.windowsMenu = win

        let help = NSMenu(title: "Help")
        help.addItem(withTitle: "Email help@batesai.org", action: #selector(emailHelp(_:)), keyEquivalent: "")
        help.addItem(withTitle: "batesai.org", action: #selector(openBatesAI(_:)), keyEquivalent: "")
        addSubmenu(help, "Help", to: main)
        NSApp.helpMenu = help

        NSApp.mainMenu = main
    }

    private func addSubmenu(_ menu: NSMenu, _ title: String, to main: NSMenu) {
        let item = NSMenuItem(title: title, action: nil, keyEquivalent: "")
        menu.title = title
        item.submenu = menu
        main.addItem(item)
    }

    @objc func reload(_ sender: Any?) {
        // Look for a build folder again: dist-live or dist-review may have appeared since launch.
        let folder = findBuildFolder()
        if folder != buildFolder {
            buildFolder = folder
            server.root = folder
            access = .unknown
        }
        updateTitle()
        if case .granted = access, webView.url.map(isLocal) == true {
            webView.reloadFromOrigin()
        } else {
            loadContent()
        }
    }

    @objc func openLiveSite(_ sender: Any?) { NSWorkspace.shared.open(kLiveSiteURL) }
    @objc func emailHelp(_ sender: Any?) { NSWorkspace.shared.open(URL(string: "mailto:help@batesai.org")!) }
    @objc func openBatesAI(_ sender: Any?) { NSWorkspace.shared.open(URL(string: "https://batesai.org")!) }

    @objc func showBuildFolder(_ sender: Any?) {
        if let f = findBuildFolder() {
            NSWorkspace.shared.activateFileViewerSelecting([f])
        } else if FileManager.default.fileExists(atPath: expand(kBuildRoot)) {
            NSWorkspace.shared.open(URL(fileURLWithPath: expand(kBuildRoot)))
        } else {
            let a = NSAlert()
            a.messageText = "No build folder yet"
            a.informativeText = "Expected one of:\n" + kBuildSearchOrder.joined(separator: "\n")
            a.beginSheetModal(for: window)
        }
    }

    @objc func zoomIn(_ sender: Any?) { webView.pageZoom = min(webView.pageZoom + 0.1, 3) }
    @objc func zoomOut(_ sender: Any?) { webView.pageZoom = max(webView.pageZoom - 0.1, 0.5) }
    @objc func zoomReset(_ sender: Any?) { webView.pageZoom = 1 }

    @objc func showAbout(_ sender: Any?) {
        let serving = buildFolder.map { ($0.path as NSString).abbreviatingWithTildeInPath } ?? "no build yet"
        let credits = NSAttributedString(
            string: "Local beta. Serving \(serving) at http://127.0.0.1:\(server.port)/\n\n"
                + "Copyright (c) 2026 Daniel Bates / Bates LLC. All rights reserved.\n"
                + "help@batesai.org · https://batesai.org",
            attributes: [.font: NSFont.systemFont(ofSize: NSFont.smallSystemFontSize), .foregroundColor: NSColor.secondaryLabelColor])
        NSApp.orderFrontStandardAboutPanel(options: [.credits: credits])
    }

    // MARK: Navigation

    func isLocal(_ url: URL) -> Bool {
        (url.host == "127.0.0.1" || url.host == "localhost") && url.port.map { UInt16($0) } == server.port
    }

    func webView(_ webView: WKWebView, decidePolicyFor action: WKNavigationAction,
                 decisionHandler: @escaping (WKNavigationActionPolicy) -> Void) {
        guard let url = action.request.url, let scheme = url.scheme?.lowercased() else { decisionHandler(.cancel); return }
        if action.shouldPerformDownload { decisionHandler(.download); return }
        if scheme == "about" || scheme == "blob" || scheme == "data" { decisionHandler(.allow); return }
        let userClick = action.navigationType == .linkActivated || action.navigationType == .formSubmitted
        if isLocal(url) {
            if url.query == "check" {  // "check again" on the no-build page
                decisionHandler(.cancel)
                reload(nil)
                return
            }
            if url.path.hasPrefix("/api/auth/") {
                // "Sign in with Google": Google blocks OAuth in embedded web views.
                decisionHandler(.cancel)
                interceptedAuth.append(url.absoluteString)
                debug.write("sign-in link intercepted: \(url.path) (type \(action.navigationType.rawValue))")
                if userClick && !selfTest { NSWorkspace.shared.open(kAccountURL) }
                return
            }
            decisionHandler(.allow)
            return
        }
        // Every other destination (batesai.org, mailto:) opens outside the app, and only on a click.
        decisionHandler(.cancel)
        if userClick && !selfTest { NSWorkspace.shared.open(url) }
    }

    func webView(_ webView: WKWebView, decidePolicyFor response: WKNavigationResponse,
                 decisionHandler: @escaping (WKNavigationResponsePolicy) -> Void) {
        decisionHandler(response.canShowMIMEType ? .allow : .download)
    }

    func webView(_ webView: WKWebView, navigationAction: WKNavigationAction, didBecome download: WKDownload) {
        download.delegate = self
    }

    func webView(_ webView: WKWebView, navigationResponse: WKNavigationResponse, didBecome download: WKDownload) {
        download.delegate = self
    }

    func webView(_ webView: WKWebView, didFinish navigation: WKNavigation!) {
        guard selfTest, !selfTestStarted, webView.url.map(isLocal) == true else { return }
        selfTestStarted = true
        DispatchQueue.main.asyncAfter(deadline: .now() + 1.0) { [weak self] in self?.runSelfTest() }
    }

    /// The page's web content process died (memory pressure, crash): load it again.
    func webViewWebContentProcessDidTerminate(_ webView: WKWebView) {
        debug.write("web content process terminated; reloading")
        webView.reload()
    }

    // target="_blank" and window.open(): open in the default browser on a click.
    func webView(_ webView: WKWebView, createWebViewWith configuration: WKWebViewConfiguration,
                 for action: WKNavigationAction, windowFeatures: WKWindowFeatures) -> WKWebView? {
        if let url = action.request.url, action.navigationType == .linkActivated, !selfTest {
            NSWorkspace.shared.open(isLocal(url) && url.path.hasPrefix("/api/auth/") ? kAccountURL : url)
        }
        return nil
    }

    // <input type="file"> (avatar picture).
    func webView(_ webView: WKWebView, runOpenPanelWith parameters: WKOpenPanelParameters,
                 initiatedByFrame frame: WKFrameInfo, completionHandler: @escaping ([URL]?) -> Void) {
        let panel = NSOpenPanel()
        panel.allowsMultipleSelection = parameters.allowsMultipleSelection
        panel.canChooseDirectories = false
        panel.beginSheetModal(for: window) { r in completionHandler(r == .OK ? panel.urls : nil) }
    }

    func webView(_ webView: WKWebView, runJavaScriptAlertPanelWithMessage message: String,
                 initiatedByFrame frame: WKFrameInfo, completionHandler: @escaping () -> Void) {
        let a = NSAlert()
        a.messageText = message
        a.beginSheetModal(for: window) { _ in completionHandler() }
    }

    func webView(_ webView: WKWebView, runJavaScriptConfirmPanelWithMessage message: String,
                 initiatedByFrame frame: WKFrameInfo, completionHandler: @escaping (Bool) -> Void) {
        let a = NSAlert()
        a.messageText = message
        a.addButton(withTitle: "OK")
        a.addButton(withTitle: "Cancel")
        a.beginSheetModal(for: window) { r in completionHandler(r == .alertFirstButtonReturn) }
    }

    // MARK: Downloads ("Export my progress")

    func download(_ download: WKDownload, decideDestinationUsing response: URLResponse,
                  suggestedFilename: String, completionHandler: @escaping (URL?) -> Void) {
        let panel = NSSavePanel()
        panel.nameFieldStringValue = suggestedFilename
        panel.directoryURL = FileManager.default.urls(for: .downloadsDirectory, in: .userDomainMask).first
        panel.beginSheetModal(for: window) { r in
            guard r == .OK, let url = panel.url else { completionHandler(nil); return }
            try? FileManager.default.removeItem(at: url)  // the panel already confirmed replacing it
            completionHandler(url)
        }
    }

    func download(_ download: WKDownload, didFailWithError error: Error, resumeData: Data?) {
        let a = NSAlert(error: error)
        a.beginSheetModal(for: window)
    }

    // MARK: Self-test (--sm-selftest)

    func runSelfTest() {
        debug.write("self-test: start")
        webView.callAsyncJavaScript(kSelfTestJS, arguments: [:], in: nil, in: .defaultClient) { [weak self] result in
            guard let self else { return }
            var report: [String: Any] = [:]
            switch result {
            case .success(let value):
                if let s = value as? String, let d = s.data(using: .utf8),
                   let obj = try? JSONSerialization.jsonObject(with: d) as? [String: Any] {
                    report["page"] = obj
                } else {
                    report["page"] = ["unexpected": String(describing: value)]
                }
            case .failure(let error):
                report["page"] = ["javascriptError": String(describing: error)]
            }
            let st = self.server.stats
            report["server"] = [
                "port": Int(self.server.port), "preferredPort": Int(kPreferredPort),
                "skippedPorts": self.server.skippedPorts.map { Int($0) },
                "buildFolder": self.buildFolder?.path ?? NSNull(),
                "requests": st.requests, "rangeRequests": st.rangeRequests,
                "partialResponses": st.partialResponses, "notFound": st.notFound,
                "rejected": st.rejected, "apiRequests": st.api,
            ]
            report["signInLinksIntercepted"] = self.interceptedAuth
            report["app"] = [
                "pid": Int(ProcessInfo.processInfo.processIdentifier),
                "bundleId": Bundle.main.bundleIdentifier ?? "",
                "version": Bundle.main.object(forInfoDictionaryKey: "CFBundleShortVersionString") as? String ?? "",
                "build": Bundle.main.object(forInfoDictionaryKey: "CFBundleVersion") as? String ?? "",
                "appIsActive": NSApp.isActive,
                "windowNumber": self.window.windowNumber,
                "windowTitle": self.window.title,
                "windowFrameAtLaunch": NSStringFromRect(self.frameAtLaunch),
                "windowOcclusionVisible": self.window.occlusionState.contains(.visible),
                "mediaTypesRequiringUserAction": Int(self.webView.configuration.mediaTypesRequiringUserActionForPlayback.rawValue),
                "websiteDataStorePersistent": self.webView.configuration.websiteDataStore.isPersistent,
                "buildFolderAccess": String(describing: self.access),
            ]
            // Change the window size so the next launch can prove the frame was remembered.
            var f = self.frameAtLaunch
            f.size = NSSize(width: f.width == 1101 ? 1180 : 1101, height: f.height == 761 ? 820 : 761)
            f.origin.y += self.frameAtLaunch.height - f.height  // keep the top edge in place
            self.window.setFrame(f, display: true)
            self.window.saveFrame(usingName: self.frameName)
            report["windowFrameSetForNextLaunch"] = NSStringFromRect(self.window.frame)
            report["finishedAt"] = ISO8601DateFormatter().string(from: Date())

            let snapConfig = WKSnapshotConfiguration()
            self.webView.takeSnapshot(with: snapConfig) { image, error in
                if let image, let tiff = image.tiffRepresentation, let rep = NSBitmapImageRep(data: tiff),
                   let png = rep.representation(using: .png, properties: [:]) {
                    self.debug.writeFile("snapshot.png", png)
                    report["snapshot"] = "snapshot.png \(Int(image.size.width))x\(Int(image.size.height))"
                } else {
                    report["snapshot"] = "failed: \(String(describing: error))"
                }
                if let data = try? JSONSerialization.data(withJSONObject: report, options: [.prettyPrinted, .sortedKeys]) {
                    self.debug.writeFile("selftest.json", data)
                }
                self.debug.write("self-test: done")
            }
        }
    }
}

let app = NSApplication.shared
let delegate = AppDelegate()
app.delegate = delegate
app.setActivationPolicy(.regular)
app.run()

#endif
