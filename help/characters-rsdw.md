# Characters & RSDW Toolkit

Profile → Characters uses the selected character as the hydration source for the integrated RSDW tools and Avatar preview.

![Character save workspace](../renderer/assets/help/29-character-studio.png) "Choose the exact save from Profile and open it directly in the RSDW-L Character Editor."

## Safe editing

- Load the character through Dragonwilds Sync.
- Make supported edits in the integrated Character, Item, Spell, Recipe, or Quest tools.
- Save through Sync so the current checksum is checked first.
- Sync creates a backup and refuses stale writeback if the character changed on disk after loading.

![Current Character Editor](../renderer/assets/help/04-character-editor.png) "The selected save stays visible while the Character, Item, Spell, Recipe, and Quest tools share one guarded draft."

## Character Editor preview

The preview workspace now keeps the working character in one stable three-column editor:

- **Appearance** places Name, Face, Hair, Beard, body type, and save-backed color swatches in the left rail. Raw RSDW asset names remain visible so aliases never hide the value written to the save.
- The center is the persistent live RSDWModel preview. Full, Face, rotate, zoom, and background controls affect the preview without marking the save dirty.
- **Equipped** on the right groups Armour, Attachments, and Weapons. Armour and attachments use the authoritative Item Editor loadout. Weapon rows clearly identify preview mappings. Click a slot for the full repository, or right-click it for a searchable Quick Equip menu with compatible items, Browse All, and Unequip/Clear actions.
- The bottom bar mirrors exactly eight current action slots. Select a slot or **Manage** to continue in the full Item Editor.
- **Equipment** and **Pose** switch their left-side controls without rebuilding the 3D preview. Pose and camera changes are preview-only.

Use **Undo**, **Redo**, or **Revert** before **Save Character**. Save still validates the draft, creates a recovery backup, checks the source checksum, writes the save, and reparses it before reporting success. **Export** uses the existing portable character export flow.

## Item Editor

The item browser uses the current RSDW item catalog for canonical Dragonwilds items. Launcher/server-defined custom items appear under **Modded Items** and carry their own display name, in-game/internal name, PersistenceID, icon, category, and stack metadata.

## Character images

The Avatar surface is the source for full-body and face-card captures when available. A user-selected image remains a valid fallback profile image.
