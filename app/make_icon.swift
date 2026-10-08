// Copyright (c) 2026 Daniel Bates / Bates LLC. All rights reserved.
// help@batesai.org · https://batesai.org
//
// make_icon: turns the web player's square icon (web/icons/icon-512.png) into a 1024 px
// macOS app-icon master: the artwork inside the standard rounded square (824 px, corner
// radius 185 px) with a transparent margin and a soft shadow, as on the macOS icon grid.
// Usage: make_icon <in.png> <out-1024.png>. build_app.sh then makes the .icns with iconutil.

import AppKit

let args = CommandLine.arguments
guard args.count == 3, let src = NSImage(contentsOfFile: args[1]) else {
    FileHandle.standardError.write(Data("usage: make_icon <in.png> <out-1024.png>\n".utf8))
    exit(2)
}
let size = 1024, body: CGFloat = 824, radius: CGFloat = 185
guard let rep = NSBitmapImageRep(bitmapDataPlanes: nil, pixelsWide: size, pixelsHigh: size, bitsPerSample: 8,
                                 samplesPerPixel: 4, hasAlpha: true, isPlanar: false,
                                 colorSpaceName: .deviceRGB, bytesPerRow: 0, bitsPerPixel: 0) else { exit(1) }
NSGraphicsContext.saveGraphicsState()
NSGraphicsContext.current = NSGraphicsContext(bitmapImageRep: rep)
NSGraphicsContext.current?.imageInterpolation = .high
let inset = (CGFloat(size) - body) / 2
let rect = NSRect(x: inset, y: inset + 10, width: body, height: body)  // optical centre: a little high
let path = NSBezierPath(roundedRect: rect, xRadius: radius, yRadius: radius)
let shadow = NSShadow()
shadow.shadowColor = NSColor.black.withAlphaComponent(0.28)
shadow.shadowBlurRadius = 18
shadow.shadowOffset = NSSize(width: 0, height: -8)
NSGraphicsContext.saveGraphicsState()
shadow.set()
NSColor(srgbRed: 0.059, green: 0.463, blue: 0.431, alpha: 1).setFill()  // icon teal under the art
path.fill()
NSGraphicsContext.restoreGraphicsState()
path.addClip()
src.draw(in: rect, from: .zero, operation: .sourceOver, fraction: 1)
NSGraphicsContext.restoreGraphicsState()
guard let png = rep.representation(using: .png, properties: [:]) else { exit(1) }
do { try png.write(to: URL(fileURLWithPath: args[2])) } catch { exit(1) }
