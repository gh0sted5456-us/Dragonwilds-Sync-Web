# RuneSchema v0.6.1 Variant — Installation

Copy the included `RuneSchema` folder into the UE4SS `Mods` directory:

```text
RSDragonwilds/Binaries/Win64/ue4ss/Mods/RuneSchema/
```

The installed layout should be:

```text
RuneSchema/
├── enabled.txt
├── dlls/
│   └── main.dll
├── config/
│   └── config.json
└── mods/
    └── mods.txt
```

The folder is named `config`, singular, because that is the path RuneSchema reads. Do not rename it to `configs`.

RuneSchema content mods go inside `RuneSchema/mods/<Mod Name>/`. `mods.txt` is updated when new mod folders are discovered, provided its tooling options remain enabled.

The first launch may also create `config/compatibility_report.txt`. If the optional FModel snippet generator is enabled, it uses `config/fmodel-input` and `config/fmodel-snippets`.
