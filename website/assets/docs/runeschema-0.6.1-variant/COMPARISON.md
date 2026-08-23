# RuneSchema 0.6.0 vs. RuneSchema 0.6.1 Variant

## Baseline

This comparison uses the official RuneSchema `0.6.0` tag at commit `c36d894b02eb006fafc079325035b924ac49f28d`, published by UnskippableCutscene on August 16, 2026. The variant retains the original author attribution and identifies itself at runtime as version `0.6.1`.

- Official source: https://github.com/UnskippableCutscene/RuneSchema/tree/0.6.0
- Official documentation: https://unskippablecutscene.github.io/RuneSchema-Docs/

## At a glance

| Area | Official 0.6.0 | 0.6.1 variant |
|---|---|---|
| Existing loaders | Assets, blueprints, raw tables, recipes, spawns, strings, journals, courses, buildings, and enums | Preserved |
| Configuration | Three flat settings; missing keys could cause the config to be repaired with defaults | Versioned configuration, default values for missing keys, preservation of recognized old values, and nested tooling controls |
| RuneSchema mod order | Mod folders followed filesystem discovery order | Optional deterministic `mods.txt` order with `1`/`0` activation values |
| `mods.txt` maintenance | Not available | Optional creation and folder reconciliation, strict values, stale-entry cleanup, alphabetical fallback, and comment preservation |
| Compatibility reporting | Not available | Optional startup-only report for cross-mod target, property, and full-array collisions |
| FModel `.0` paths | Supported in some reference-object forms | Centralized normalization for references and top-level asset targets |
| Generated schemas | Utility, enums, and raw data tables | Also generates loaded asset and Blueprint class schemas |
| Unsafe schema fields | No variant-specific filter | Persistence IDs, internal names, GUID-like fields, and runtime component bookkeeping are omitted from generated suggestions |
| FModel conversion aid | Not available | Optional offline-style snippet generation from exported FModel JSON |
| Spawn scale | Not available | Uniform number or X/Y/Z vector for Actor and AI spawn entries |
| Spawn drop scaling | Not available | Explicit `DropIncreasePercent`, or an automatic multiplier based on scale when the field is omitted |
| Runtime tooling overhead | Original behavior | Reports and FModel conversion run at startup; schemas remain user-triggered; no new compatibility-tool polling loop |

## Configuration changes

The official version exposes:

```json
{
  "languageOverride": "",
  "enableAutoReload": false,
  "enableDebugLogging": false
}
```

The variant retains those settings and adds `configVersion` plus a `tooling` object. Tooling has a master switch and individual controls for:

- `mods.txt` creation, reconciliation, comments, and value validation.
- Compatibility report creation and warning categories.
- Asset/Blueprint schema generation.
- FModel snippet generation.

Older valid configuration files are migrated without requiring every new key to be present. Unknown top-level configuration data is retained when the file is rewritten.

## RuneSchema mod order

The variant reads `RuneSchema/mods/mods.txt` from top to bottom:

```text
Example Mod A : 1
Example Mod B : 0
```

`1` enables a mod and `0` disables it without removing its folder. In strict mode, any other value is treated as disabled and produces a warning. If the feature is disabled—or automatic creation is disabled and no file exists—folders load alphabetically for deterministic behavior.

This file controls RuneSchema content mods only. It does not replace UE4SS's root mod activation file.

## Compatibility report

When enabled, RuneSchema scans enabled content mods once during startup and writes:

```text
RuneSchema/config/compatibility_report.txt
```

It reports mods that write the same loader target, the same target property, or the same full array. The report is advisory: it does not automatically reorder, modify, or disable mods. It is a structural check and cannot guarantee that two different properties will not interact in gameplay.

## FModel path handling

The variant treats these top-level asset spellings as equivalent:

```text
/Game/Items/ITEM_Iron
/Game/Items/ITEM_Iron.0
/Game/Items/ITEM_Iron.ITEM_Iron
```

Numeric FModel export suffixes are replaced with the asset name. The same normalization is shared by hard object references, soft object references, class references, and asset-loader targets. Explicit nonnumeric object suffixes and subobject paths are retained.

## Asset and Blueprint schemas

The manual schema generator now produces `assets.schema.json` and `blueprints.schema.json` in addition to the original files. It uses Unreal runtime reflection, so running it after entering a world gives better coverage of loaded objects.

The generated suggestions intentionally omit known identity and runtime bookkeeping fields such as:

- `PersistenceID`
- `InternalName`
- `RootComponent`
- `UberGraphFrame`
- GUID-like properties
- Runtime-created component arrays

This filtering affects generated suggestions, not Unreal itself. RuneSchema still validates and applies properties through runtime reflection.

## FModel snippet generator

The generator is disabled by default. When enabled, exported FModel JSON files placed in:

```text
RuneSchema/config/fmodel-input/
```

produce draft files in:

```text
RuneSchema/config/fmodel-snippets/
```

For data assets, it creates a correctly normalized asset target. For Blueprint exports, it finds the generated class, class-default object, and directly owned component exports. Unsafe identity/bookkeeping fields are recursively removed.

Generated snippets are starting points, not automatically installed mods. Their `$generated` notice tells authors to review and remove unwanted properties before moving them into an `assets` or `blueprints` loader folder.

## Spawn scaling and drops

Spawn entries accept either uniform scale:

```json
"Scale": 2.0
```

or per-axis scale:

```json
"Scale": { "X": 2.0, "Y": 2.0, "Z": 2.0 }
```

All components must be greater than zero. Scale is applied to spawned Actors and to AI associated with the RuneSchema AI spawn point, including AI discovered after its initialization hook.

Drops can be controlled explicitly:

```json
"DropIncreasePercent": 100
```

This doubles supported `MinToDrop` and `MaxToDrop` values. It checks drop data on the actor and the known item-drop, split-drop, and destruction-drop components. Each live actor is adjusted once.

If `DropIncreasePercent` is omitted, the largest scale component becomes the automatic drop multiplier, with a minimum multiplier of `1.0`. Setting `DropIncreasePercent` to `0` keeps normal drops even when the spawn is enlarged.

## Compatibility and limitations

- Existing 0.6.0 mod formats remain supported.
- Tooling features can be disabled without changing the core asset/Blueprint property syntax.
- FModel exports describe cooked data, but Unreal runtime reflection remains authoritative.
- A generated schema or snippet does not guarantee every property is safe to change.
- Drop scaling only affects supported `ItemsToDrop` structures with numeric `MinToDrop` and `MaxToDrop` fields.
- Compatibility analysis detects matching JSON locations, not every possible semantic interaction.

## Build verification

- Variant DLL SHA-256: `3FAB77E786202E5E04F267DB9F055294126EBA87149E2E21A0E886BCFB2B3051`
- Shipping target: `Game__Shipping__Win64`
- `mods.txt` functional tests: passed
- FModel `.0` path-normalization tests: passed
