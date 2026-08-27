# Quick Launch & Headless Servers

Configure and validate a World or Server Profile in the full Dragonwilds Sync application first. Quick Launch and the headless CLI then reuse that exact stable profile ID and the same backend authority.

## Desktop shortcuts

- **Open Quick** opens the focused World manager without loading the rest of the application.
- **Open Quick + Start** opens that focused manager and starts the selected profile.
- **Headless Start** is server-only and runs the saved Server Profile without opening Electron.

GUI shortcuts target the exact normal application EXE that created them. Headless shortcuts target the matching `Dragonwilds Sync Headless-<version>.exe` beside it. Windows stores an absolute target in every shortcut, so keep both downloads together in their final folder and recreate shortcuts after moving them.

## Headless operations

The standalone program supports profile listing, status, start/run, play, stop, restart, update, update-and-restart, logs, broadcast, and routed console commands. These operations call the same lifecycle controller used by the graphical application; they do not create a parallel server manager.
