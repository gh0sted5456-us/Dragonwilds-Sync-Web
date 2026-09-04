# Website consolidation audit

The public model is Home / Download / RuneSchema / Changelog / Docs. GitHub is an external utility link. The existing PR's RuneSchema 0.6.0 → 0.6.1E record is retained as historical experimental documentation; current downloads are resolved separately.

## Every published HTML page

| Page | Decision | Destination / purpose |
| --- | --- | --- |
| index.html | KEEP | Short introduction, platform selection CTA, three features, RuneSchema, community support |
| downloads.html | KEEP | GitHub-resolved Windows/AppImage assets and platform checksums; headless release assets |
| runeschema.html | KEEP | Product introduction, authoring areas, folders, Stable/Experimental distinction |
| changelog.html | KEEP | Historical 0.6.1E record, expandable detail and credits; canonical Sync release history |
| docs.html | KEEP | Intent-based directory to all retained guides |
| about.html | RETIRE / CONSOLIDATE | Moved route to Home; prior content remains in Git history |
| experience.html | RETIRE / CONSOLIDATE | Moved route to Setup; prior overview remains in Git history |
| for-modders.html | CONSOLIDATE | Redirect to packaging; RuneSchema fragment links go to the author guide |
| setup.html | KEEP | Installation, dedicated hosting, networking, remote administration, troubleshooting |
| servers.html | KEEP | Public server directory; security-sensitive runtime unchanged |
| invite.html | KEEP | Direct invite entry point; outside content navigation; runtime unchanged |
| helpy.html | KEEP | Interactive help reader and existing help content |
| modding.html | KEEP | Documentation overview separating packaging from runtime authoring |
| mod-packaging.html | KEEP / CONSOLIDATE | ID.txt, HOTLOAD, package distribution; duplicate RuneSchema section moved out |
| runeschema-authoring.html | KEEP (new route) | Retained installation, runtime compatibility, screenshots, and JSON examples, extracted from packaging |
| tech.html | KEEP | Advanced technical architecture and operating boundaries |
| testers.html | KEEP | Experimental/testing reference under Docs |
| world-builder.html | KEEP | Advanced working configuration tool; existing dependencies retained |
| launcher-preview.html | INTERNAL / PREVIEW | Explicitly labeled internal in Docs; absent from primary navigation |

Deep pages receive flat navigation from script.js. Old incoming public links were updated. The three moved routes have usable fallback links without JavaScript. The link validator checks all static HTML href/src/poster targets and fragments in the assembled artifact, including every retained guide.

## Asset audit

Definitely unused and removed: download-flip.css, download-flip.js, top-flow.css, top-flow.js. Their old homepage/download DOM consumers no longer exist, no retained page references them, and their build-time concatenation was removed.

Probably unused, retained pending a separate legacy-bundle pass: downloads-linux.css and release-changelog.css (no remaining direct imports); downloads-linux.js, downloads-flavor.js, release-changelog.js (legacy imports or validation references remain, but old download/changelog hooks are largely absent). No media were deleted on filename inference.

Retained legacy dependencies: styles.css/script.js; modders.css/js and modding-hub.css; downloads.css and runeschema-variant.css/js for the recovered author guide; helpy.css/js; tech.css; testers.css; launcher-preview.css/js and JSON; home-demo.css/js, placards and platform artwork, world-builder controls/runtime and world-draft helpers; server-list.js, world-invite.js, directory configuration and their styles; packaged downloads, documentation Markdown, icons, screenshots, and help assets. The workflow still assembles application artwork, registries, and required world-builder resources.

## Validation

- Pages assembly succeeded using the workflow's commands and live public GitHub artwork/release data. Local adaptation only supplied Windows Python/PATH and a local temporary JSON path.
- Entire workflow validation command block passed locally, including unchanged public-directory/invite security checks and setup port/runtime contracts.
- All 19 HTML documents pass local file and fragment validation; all JSON parses; all packaged ZIPs pass integrity checks and contained JSON parses.
- All assembled JavaScript passes node --check. Four release-resolution tests cover platform selection, missing artifacts, API failure, and rejected untrusted asset URLs.
- Five primary pages checked in Edge/Chromium at 1920×1080, 1366×768, 768×1024, and 360×800: one H1, no horizontal overflow, keyboard mobile menus, Escape/focus return, all changelog accordions keyboard-openable. Retained setup, packaging, authoring, servers, and World Builder passed runtime smoke checks. Authoring overflow was separately fixed and rechecked at 360px.
- Both GitHub repositories and their release URLs/API endpoints returned HTTP 200. Published Windows EXE, Linux AppImage, platform checksum filenames, and newer RuneSchema Experimental metadata were verified.
- PR validation runs without Pages deployment privileges; only main can deploy after build succeeds. Security-sensitive server-list.js, world-invite.js, directory-source.json, and invite.html are unchanged.

## Remaining review

Deep documentation still uses legacy themes, specialized layouts, and larger CSS/JS bundles. This PR preserves functioning tools and consolidates content rather than replacing their runtime implementations. A manual screen-reader pass and real-device/touch review are still useful. The historical changelog's in-game testing caveats remain; website browser tests do not verify game/runtime behavior. Review the 0.6.1E record, archive/install instructions, and retained experimental features before merging. No merge or production deployment is authorized by this cleanup.
