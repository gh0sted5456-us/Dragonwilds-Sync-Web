# Dragonwilds Sync Website

This repository is the standalone public website for [Dragonwilds Sync](https://github.com/gh0sted5456-us/Dragonwilds-Sync).

**Live site:** https://gh0sted5456-us.github.io/Dragonwilds-Sync-Web/

It contains Downloads, Setup Instructions, Experience, World Builder, Launcher Preview, Public Server List, Helpy, Modding/RuneSchema guidance, technical boundaries, and the public-facing V3 release record.

## Source of truth

The application repository remains authoritative for application code, packaged releases, capability contracts, release verification, and `docs/changelog.json`.

The website mirrors user-facing release information from that authority. The Pages workflow also rebuilds the deployed release changelog from the current application-repository V3 changelog so the live site cannot quietly remain on an older release record.

## Publishing

GitHub Pages deploys the contents of `website/` from this repository's `main` branch through `.github/workflows/pages.yml`.

The deployment is intentionally static/read-only. Public World status is read from the sanitized Cloudflare directory API; GitHub Pages never receives server heartbeats, World passwords, or Remote Admin credentials.

Application downloads remain in [Dragonwilds-Sync Releases](https://github.com/gh0sted5456-us/Dragonwilds-Sync/releases).
