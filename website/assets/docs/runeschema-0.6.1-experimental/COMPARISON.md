# RuneSchema: Official 0.6.0 vs. 0.6.3 Experimental

> Experimental release codename: **Registry Identity**. The published release identity remains `RuneSchema 0.6.3 Experimental`; this label does not indicate an official or upstream RuneSchema branch.

## What is being compared

This document compares the official RuneSchema `0.6.0` release with `RuneSchema 0.6.3 Experimental`. It contains the user-confirmed v8 behavior, but remains a community variant rather than an official upstream RuneSchema release.

The baseline is official tag `0.6.0`, commit `c36d894b02eb006fafc079325035b924ac49f28d`, released by UnskippableCutscene on August 16, 2026.

Credits are preserved in the compiled mod metadata: Okaetsu created PalSchema, Snorkles created RuneSchema, and Jonesing4Space created the additional experimental features.

- Official source: https://github.com/UnskippableCutscene/RuneSchema/tree/0.6.0
- Official release: https://github.com/UnskippableCutscene/RuneSchema/releases/tag/0.6.0
- Official documentation: https://unskippablecutscene.github.io/RuneSchema-Docs/

## Short version

The experimental build keeps the official content loaders and mod formats, then adds management and authoring tools around them. Its largest user-facing additions are an expanded UE4SS RuneSchema tab, deterministic RuneSchema mod ordering through `mods.txt`, compatibility reports, broader schema generation, FModel path cleanup, spawn scaling, and registry-aware identity overrides.

The existing persistent `Actor` spawn system is inherited from official 0.6.0. This build does not claim to have invented that system. It extends those spawn entries with `Scale` and extends AI spawn points so the spawned AI can also receive the configured scale.

RuneSchema 0.6.3 Experimental provides optional spawn drop multiplication as an explicitly experimental feature. Size and drops are independent: `Scale` never changes drops, while an explicit `DropIncreasePercent` changes supported live-instance drop rows. The feature can be disabled without disabling spawn scale.

## At a glance

| Area | Official 0.6.0 | 0.6.3 Experimental |
|---|---|---|
| Core loaders | Assets, Blueprints, raw tables, recipes, spawns, strings, journals, courses, buildings, and enums | Preserved |
| Existing mod JSON | Official 0.6.0 formats | Intended to remain compatible |
| RuneSchema mod order | Directory discovery order | Deterministic `mods.txt` order when enabled |
| Enable/disable a content mod | Remove or move its folder | Set its `mods.txt` value to `1` or `0` |
| UE4SS RuneSchema tab | Schema-generation control | Overview, Settings, Generators, Load Order, and Compatibility pages |
| Visual load-order editor | Not available | Checkboxes plus Up/Down controls; saves to `mods.txt` |
| Configuration | Three core settings | Core settings plus optional tooling controls; no visible config version field |
| Compatibility analysis | Not available | Optional one-time collision report |
| Generated schemas | Utility, enums, and raw data tables | Also loaded asset, Blueprint class, recipe, and journal schemas |
| FModel `.0` paths | Not consistently normalized at every entry point | Centralized normalization for asset targets and object references |
| FModel conversion helper | Not available | Optional sanitized draft-snippet generator |
| Persistent `Actor` spawns | Supported | Preserved |
| `RemoveActor` entries | Supported | Preserved |
| AI spawn settings and respawn timer | Supported | Preserved |
| Spawn `Scale` | Not available | Added to `Actor` and `AISpawnPoint` entries |
| Spawn drop increases | Not available | Optional explicit `DropIncreasePercent`; independent of `Scale` |
| `PersistenceID` / `InternalName` authoring | Not exposed as a targeted extension | Optional for asset, recipe, and journal entries; collisions rejected and live lookup maps synchronized |

## What remains unchanged

The experimental build is still RuneSchema. It retains the official loaders and the normal folder-based content-mod structure. Existing asset, Blueprint, table, recipe, string, journal, course, building, enum, and spawn files do not need to be converted merely to load under this build.

Official 0.6.0 already includes the expanded spawn loader with:

- `AISpawnPoint` entries and AI behavior/respawn fields.
- Save-persistent `Actor` entries using a stable `Id` and an actor class with `SpudGuid`.
- `RemoveActor` entries for removing qualifying runtime-spawned actors in a radius.
- Stable spawn identities, streamed-world handling, and orphan cleanup.

Those are baseline features, not experimental-build additions.

## Expanded UE4SS RuneSchema tab

When the UE4SS debugging console and ImGui are enabled, the experimental build expands the RuneSchema tab into five pages:

| Page | Purpose |
|---|---|
| Overview | Shows the RuneSchema version, detected content-mod count, tooling state, and relevant paths |
| Settings | Edits core settings and optional tooling switches, then saves `config/config.json` |
| Generators | Runs JSON schema generation or the optional FModel snippet generator on request |
| Load Order | Reconciles, refreshes, enables/disables, reorders, and saves RuneSchema content mods |
| Compatibility | Configures and runs the optional compatibility report |

The panel caches its displayed filesystem state. It refreshes on opening, an explicit refresh, or a requested action instead of repeatedly scanning every frame.

## `mods.txt` and load order

The experimental build can create and maintain `RuneSchema/mods/mods.txt`:

```text
Base Balance : 1
Harder Enemies : 1
Optional Visual Changes : 0
```

Entries are read from top to bottom. `1` enables a RuneSchema content mod and `0` disables it without deleting its folder. In strict mode, another value is treated as disabled and produces a warning.

The Load Order page is a visual editor for this same file; it does not replace it with a hidden database. Checkboxes change `1`/`0`, Up/Down changes line order, and **Save Load Order** writes the result to `mods.txt`. Manual editing remains supported, and **Refresh Load Order** reads those manual changes back into the panel. Preserved comments remain in the file.

Saved order and enable-state changes apply on the next RuneSchema load. This file controls content folders inside `Mods/RuneSchema/mods`; it does not replace UE4SS's root `Mods/mods.txt`, which enables the RuneSchema DLL itself.

When multiple enabled content mods edit the same scalar property, the later RuneSchema mod normally supplies the final value. Arrays and loader-specific operations can have replacement or merge semantics, so “last wins” is useful guidance rather than a universal guarantee.

## Configuration

Official 0.6.0 exposes three settings:

```json
{
  "languageOverride": "",
  "enableAutoReload": false,
  "enableDebugLogging": false
}
```

The experimental build retains them and adds optional tooling controls:

```json
{
  "languageOverride": "",
  "enableAutoReload": false,
  "enableDebugLogging": false,
  "enableExperimentalDropScaling": true,
  "tooling": {
    "enabled": true,
    "modsTxt": {
      "enabled": true,
      "autoCreate": true,
      "reconcileFolders": true,
      "preserveComments": true,
      "strictValues": true
    },
    "compatibilityReports": {
      "enabled": false,
      "writeFile": false,
      "warnSameTarget": true,
      "warnSameProperty": true,
      "warnArrayReplacement": true
    },
    "enableSchemaGeneration": true,
    "enableFModelSnippetGenerator": false
  }
}
```

There is intentionally no user-facing `configVersion`. The loader can read an older experimental config containing that migration marker, but removes it when the config is next saved. Valid configuration files are not rewritten on every launch, and the loader clears an accidental read-only attribute before a required write.

The tooling master switch and its individual features can be turned off without changing RuneSchema's normal property-editing syntax.

## Compatibility reports

When enabled, the report performs a bounded scan of enabled content-mod JSON and can write `RuneSchema/config/compatibility_report.txt`. It can warn when multiple mods appear to edit:

- The same loader target.
- The same property on the same target.
- A full array where replacement order may matter.

The report is advisory. It does not reorder, merge, disable, or rewrite content mods, and it cannot detect every semantic gameplay interaction.

## Schema generation

The manual generator retains the official schema outputs and adds loaded asset and Blueprint class schemas. The additional files improve editor autocomplete for existing reflected properties, especially when generation is run after entering a world and more game data is loaded.

Generated suggestions continue to omit GUID-like and runtime-bookkeeping properties such as root components, graph frames, and runtime-created component arrays. `PersistenceID` and `InternalName` are exposed only in the supported asset, recipe, and journal authoring contexts. This filtering reduces dangerous suggestions; it is not a promise that every remaining Unreal property is safe to edit.

## FModel support

The experimental build treats common FModel spellings such as these as the same top-level asset:

```text
/Game/Items/ITEM_Iron
/Game/Items/ITEM_Iron.0
/Game/Items/ITEM_Iron.ITEM_Iron
```

A numeric export suffix is normalized to the asset name. Explicit nonnumeric object suffixes and subobject paths are retained. The shared normalization is used for top-level asset targets and supported hard, soft, and class-reference paths.

The optional snippet generator reads exported JSON from `RuneSchema/config/fmodel-input/` and writes reviewable drafts to `RuneSchema/config/fmodel-snippets/`. Top-level asset drafts may retain supported identity fields; nested and Blueprint drafts continue to filter them with the other runtime-bookkeeping fields.

These drafts are authoring aids, not installed mods. Runtime reflection remains authoritative, and every generated snippet still requires review.

## Registry-aware identity overrides

Version 0.6.3 allows optional `PersistenceID` and `InternalName` values in supported `assets`, `recipes`, and singular `journal` loader files. Recipe identity may be top-level or inside `Properties`; a top-level value wins when both are present.

Omitting a field—or setting it to `null`, an empty string, or whitespace—preserves the loaded value for an existing object or the RuneSchema-generated default for a new entry. Explicit values must be strings, unique across both identity namespaces, and stable once saves depend on them.

This implementation treats identity as a registry operation rather than an ordinary reflected-property write. It checks loaded objects and live registry maps for collisions, rejects conflicting changes, then updates the object and both persistence/internal-name lookup maps together. It performs this work during normal mod loading and adds no polling or per-frame tick.

## Spawn scaling

The experimental build adds `Scale` to existing `Actor` and `AISpawnPoint` entries. It accepts a uniform number:

```json
"Scale": 2.0
```

or a positive per-axis vector:

```json
"Scale": {
  "X": 2.0,
  "Y": 2.0,
  "Z": 2.0
}
```

For `Actor`, scale is applied to the persistent spawned actor. For `AISpawnPoint`, scale is applied to AI associated with that spawn point, including AI found during normal world processing and through the AI initialization hook.

Scale changes size only. It does not change drops, health, damage, or other statistics. AI navigation, animation, collision, and gameplay behavior remain subject to the underlying game class.

The official persistent-actor rules still apply: an `Actor` class must expose the required `SpudGuid`, and the entry's `Id` must remain stable if it is expected to refer to the same saved world actor. Harvested or destroyed resource behavior ultimately depends on the game's persistence data for that actor class.

## Experimental drop scaling

The feature has a separate master switch:

```json
"enableExperimentalDropScaling": true
```

When enabled, a spawn entry can specify an explicit percentage:

```json
"Scale": 2.0,
"DropIncreasePercent": 100
```

`100` means a `2.0x` multiplier, `50` means `1.5x`, and `0` retains normal drops. If `DropIncreasePercent` is omitted, drops remain unchanged regardless of `Scale`.

The multiplier rounds each positive `MinToDrop` and `MaxToDrop` value upward. It only targets `ItemsToDrop` on the spawned actor itself or these known live-instance components:

- `ItemDropComponent`
- `ItemDropOnSplitComponent`
- `ItemDropOnDestructionComponent`

Each live actor is adjusted once after a supported row is found. Shared Blueprint class defaults are not changed. This makes the feature narrower than the discarded implementation, but it also means unsupported enemy loot assets or differently named components remain unchanged.

## Performance model

The management tools are action-driven:

- `mods.txt` is read during load and when explicitly refreshed or reconciled.
- Compatibility analysis runs at startup only when configured, or when manually requested.
- Schema and FModel generation run only when requested, except optional configured FModel generation during startup.
- The UE4SS panel uses cached status rather than continuous directory polling.

The existing spawn loader still uses its official streamed-world and engine-callback mechanisms. The experimental build adds an event hook for AI scale and applies scale while processing relevant actors; it does not add a separate broad JSON polling loop.

## Known limitations and deliberately excluded behavior

- This is an experimental community build and is not supported as an official RuneSchema release.
- Load-order edits require a RuneSchema reload/restart before content is reapplied in the new order.
- The compatibility report finds structural overlap, not every gameplay conflict.
- FModel conversion produces drafts and cannot prove runtime edit safety.
- Generated schemas expose reflected fields conservatively but cannot guarantee gameplay-safe values.
- Identity collision checks protect the live registries, but changing an ID already stored in a save can still break that save's reference; use stable values and test on a backup.
- `Scale` does not imply stat scaling.
- Drop multiplication remains experimental and only affects supported `ItemsToDrop` layouts. It does not guarantee that every enemy or resource class stores drops in one of those locations.
- `RemoveActor` retains the official safety behavior and does not indiscriminately delete every level-placed actor.

## Build verification

This document describes the published `RuneSchema 0.6.3 Experimental — Registry Identity` release and `RuneSchema-0.6.3-Experimental.zip` package.

- Shipping target: `Game__Shipping__Win64`
- Clean source baseline: official `0.6.0` commit `c36d894b02eb006fafc079325035b924ac49f28d`
- Consolidated targeted source head: `bfe982c9ee961702990638317fe69a4e9949b44f`
- Published release: `RuneSchema 0.6.3 Experimental — Registry Identity`
- Prerelease tag: `0.6.3-experimental.1`
- DLL size: `2,320,384` bytes
- UE4SS source/build commit: `0bfec09ee30b7c4cda8aa151e2fdb15cbe6c10c9` (`3.0.1-941-g0bfec09e`), matching the official RuneSchema 0.6.0 source pin
- DLL SHA-256: `D08F755C7A68E7864D631B034251113DDDEBF3232FECECF5BC4E5A7B27AC68AD`
- RuneSchema package SHA-256: `577DD6750E6ABF9B9889AD4752AB84065482F4FFFE34A43DDD257770D8D79317`
- Matching UE4SS package SHA-256: `35352FE295F54FF289C20175D634522A5D1A97D80935BA6A31A00B3AE7971940`
- `mods.txt` creation, ordering, enable-state, comment-preservation, and UI round-trip tests: passed
- FModel numeric-suffix normalization tests: passed
- Shipping DLL compilation: passed
- Runtime spawn behavior inherited from v8: user-confirmed
- Registry-aware identity implementation: shipping compilation passed; in-game validation remains required before treating it as stable

