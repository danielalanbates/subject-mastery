# Subject Mastery macOS beta

Copyright (c) 2026 Daniel Bates / Bates LLC. All rights reserved.
help@batesai.org · https://batesai.org

A Swift AppKit + WKWebView app with an in-process HTTP server. It is installed at `/Applications/Subject Mastery.app`. The beta bundles the verified static site and its recordings in `Contents/Resources/Site`, so moving or deleting the Downloads workspace does not remove its curriculum.

## Build

From the repository, after building and checking the site:

```sh
SM_APP_SITE=~/Downloads/subject-mastery-build/dist bash app/build_app.sh --server-cli
```

The script stages and compiles in Downloads, creates an icon, bundles a real copy of the site (dereferencing audio links), signs ad hoc, verifies the signature, archives the previous app and installs the new app once. It refuses installation while Subject Mastery is running. `--no-install` builds only. `SM_BUILD` changes the build workspace; `SM_APP_SITE` chooses the verified site.

The packaged app prefers its bundled site. An unbundled development binary falls back to `dist-live`, `dist-review`, then `dist` under the Downloads build root. Reload rechecks the source. Debug logs only exist when the explicit self-test flag is passed.

| Behavior | Implementation |
|---|---|
| Recorded audio seeking | Loopback HTTP server with byte Range, suffix ranges, content types and keep-alive |
| Progress survives launches | Persistent WKWebView store and preferred origin `http://127.0.0.1:47913` |
| Port already taken | Try four subsequent ports; the window indicates the fallback (progress is stored separately for each origin) |
| Single app instance | `LSMultipleInstancesProhibited` |
| Continue in background | App Nap disabled; server remains responsive |
| Google sign-in | Opens the live Account page on an explicit click, since Google rejects embedded webviews |
| Private data | Local beta progress stays on the Mac; the local server refuses account writes |
| Export | User save panel, Downloads by default |
| Menus | Reload, zoom, open live site, show build folder, edit commands, window controls |

## Verification, 2026-10-08

Build `20261008.1421` contains 316 pages in five subjects and 250 recordings. The ad-hoc signature verified. The server CLI was run once against the installed bundled site: the catalog contained Mathematics; a requested MP3 byte range returned 206 and matched the file bytes exactly; unauthenticated API writes/read-progress returned 401, dot traversal returned 404 and foreign Host returned 403. The CLI was then stopped.

The shared player passed headless browser checks. The AppKit window, native save/open panels and audible output were not exercised in this run; no GUI automation or app relaunch loop was used. The historical two-launch WKWebView persistence checks are documented in `archive/2026-10-02/HANDOFF.md` and the previous Downloads logs.

Ad-hoc signing is suitable for the local beta. Developer ID signing/notarization and a universal Intel/Apple Silicon build are separate release pathways. Public GitHub releases currently distribute the website; the installed Mac app remains the local beta.
