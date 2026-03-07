# Changelog

All notable changes to ZenTask Chrome Extension are documented here.

---

## [Unreleased] — 2026-03-07

### Security
- Fixed XSS vulnerability: escape user-supplied task titles before `innerHTML` injection in TaskList and focus view
- Replaced `as any` theme cast with proper `AppTheme` type in SettingsModal

### Fixed
- `DEFAULT_TIMER.remainingSeconds` corrected from 20 min to match the 25 min `focusDuration` default
- Removed duplicate `window` resize listener in `newtab/index.ts`
- Fixed double `render()` call in popup `TIMER_UPDATE` handler
- Removed no-op `updateActiveTaskStatus` stub and its three call sites from `timer.ts`

### Removed
- Collapsed 4 identical `.zen-header.theme-X .logo` CSS rules into a single attribute selector
- Removed unreferenced dead `<canvas id="background-canvas">` from `newtab.html`

---

## [26.3.0] — 2026-02-22

### Changed
- Full asset overhaul with calendar versioning (26.2.22)
- Updated extension icons to a new glowing azure design
- Improved background initialization and global theming consistency

### Fixed
- Bumped version to 26.3.0 to resolve Chrome Web Store version conflict

---

## [1.1.0] — 2026-02-21

### Added
- Lively background effects: Dust Motes and Breathing Pulse animations

### Changed
- Updated README for V2 Scandinavian redesign

### Fixed
- Restored missing components and resolved New Tab build errors

---

## [1.0.0] — 2026-02-18

### Added
- Theme system replacing the previous sound/music system
- Theme-aware button color adjustments

### Changed
- Updated theme aesthetics and visual styling
- Cross-platform build script: replaced Windows `copy` command with a JS equivalent for GitHub Actions compatibility

### Fixed
- Release workflow `sed` syntax error

### Dependencies
- `vite` bumped from 5.4.21 to 7.3.1

---

## [0.1.0] — 2026-02-08

### Added
- Initial release of Zen Task New Tab Chrome Extension
- Task management with Pomodoro-style focus timer
- Privacy Policy document
- Chrome Web Store store listing and app icons
- Automated release workflow with CalVer versioning (YY.MM.DD)
- Chrome Web Store publishing via CI/CD
