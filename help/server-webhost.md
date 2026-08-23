# Server & WebHost

Hosted Worlds use profile-owned presentation, save/config snapshots, mod state, Sync settings, and public-safe metadata while sharing the machine-level dedicated Dragonwilds runtime.

Open **Dragonwilds → Hosting** for dedicated paths, validation, setup, and hosted World creation. Hosting is no longer a separate RSDragonwilds navigation item.

![Dragonwilds Hosting setup](../renderer/assets/help/05-server-setup.png) "Dedicated setup remains inside the game-icon Dragonwilds Appy."

## Fluid startup sequence

1. Resolve the selected profile and immutable desired revision.
2. Materialize its save, configuration, and managed mods.
3. Launch and verify the dedicated process.
4. Start and verify the World-owned Sync listener.
5. Publish only after both runtime and Sync evidence pass.

Stop and restart use the same operation guard and verify process-tree cleanup before reporting success.

## WebHost

WebHost can project the public World browser, accept authenticated Sync heartbeats, expose public-safe API routes, and provide paired remote server administration when enabled.

## Declared Worlds

A World is **Declared** only while this host has a live heartbeat for it and the host can verify its Sync fingerprint. The heartbeat registry has a TTL, so disconnected publishers disappear without a manual cleanup step.

## Public safety

The public browser may show World name, description, artwork, badges, tags, player counts, public route information, and Sync capability. Server passwords, owner keys, administrative credentials, and private configuration are not public directory fields.

## Remote administration

Remote management is separate from public discovery and uses an authenticated paired session plus explicit permissions for actions such as start, stop, config editing, Spawner, and console access.
