Platform and ecosystem marks are bundled for local/offline identification only.
They are shipped with Dragonwilds Sync so Desktop, WebGUI, and the public website
do not depend on third-party CDNs for normal placard rendering.

Current bundled marks include:

- Steam
- Windows
- Linux
- Xbox
- PlayStation
- Nintendo Switch (legacy compatibility mark)
- Nintendo Switch 2
- Epic Games
- Discord
- Nexus Mods
- GitHub
- UE4SS
- RuneSchema
- PAKs
- Adults Only / Kid Friendly presentation badges

Canonical platform compatibility and storefront metadata lives in:

```text
resources/platform-registry.json
```

The public website footer uses only trusted entries from the same platform family and
links platform/store icons to the official RuneScape: Dragonwilds product pages.
Store links are presentation metadata owned by Dragonwilds Sync; they must not come
from arbitrary World telemetry or `.rsdwl` user input.

Nintendo Switch 2 is the canonical supported Nintendo platform key. Existing
`nintendo`, `nintendo switch`, and `switch` values remain readable as legacy aliases
and should normalize to `switch2` in new application/WebGUI/world-builder work.

## Canonical UE4SS and RuneSchema artwork

The exact project-provided logos are authoritative and MUST be used project-wide:

```text
renderer/assets/platforms/ue4ss.webp
renderer/assets/platforms/runeschema.webp
```

These files are lossless WebP encodings of the exact artwork supplied to the project.
They are the canonical source for Desktop, WebGUI, World Builder, public placards,
mod-family chips, documentation/UI previews, and packaged/deployed copies.

Older `ue4ss.svg` and `runeschema.svg` files are legacy compatibility assets only.
Do not use them for new UI. They may be retired after all remaining hard-coded legacy
references have been verified and migrated.

Do not redraw, recolor, invert, trace, or substitute these two canonical marks. UI
containers may size/crop them with `object-fit: contain`, but the artwork itself must
remain unchanged. Missing canonical built-in artwork is a build/release verification
failure, not a reason to fetch a logo from a CDN.

Sources/provenance:

- Steam, Epic Games, PlayStation, Discord: originally sourced from Simple Icons.
- Nintendo Switch and Nexus Mods: originally sourced from Simple Icons 13.x.
- Nintendo Switch 2: bundled local identification treatment derived from the existing Nintendo Switch mark with an explicit Switch 2 identifier for Dragonwilds platform compatibility.
- Xbox: adapted from the Microsoft/Xbox logo asset previously sourced from Wikimedia Commons (`File:Xbox Logo.svg`) and presented in Xbox green for dark-surface visibility.
- Windows: bundled geometric Windows mark using the standard Windows blue presentation.
- GitHub: bundled GitHub mark for local website/download presentation.
- Linux: bundled local platform-identification artwork.
- UE4SS: exact project-provided UE4SS logo, bundled canonically as `ue4ss.webp`; used only to identify the UE4SS runtime/mod family.
- RuneSchema: exact project-provided RuneSchema logo, bundled canonically as `runeschema.webp`; used only to identify the RuneSchema mod family.
- PAKs: original generic Dragonwilds Sync package/cube mark used to identify cooked Unreal PAK/UTOC/UCAS-oriented content; it is not a third-party company logo.

Simple Icons is CC0-1.0. Brand names and logos remain trademarks of their
respective owners. Their inclusion does not imply endorsement or affiliation.
