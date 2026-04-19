# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [5.2.2] - 2026-04-19

### Added
- Accessibility: ARIA labels, `role="button"`, `tabindex`, `aria-pressed` on map overlay icons, keyboard activation (Enter/Space), `:focus-visible` styles
- Theme-aware action button colors via CSS custom properties (`--success-color`, `--warning-color`, `--error-color`)
- French/English translation keys for map controls (`dreame_ui.map.*`)
- Missing `lv` (Latvian) language registration in translation map

### Changed
- Map rendering performance during active cleaning: pick canvas cache is now keyed on structure hash (segment_map or rooms geometry) instead of `camera.last_updated`, avoiding rebuilds on every robot movement tick
- `_updateCalibration` memoized on calibration points — `CoordinatesConverter` matrices no longer recreated on each render
- `getImageData` result cached on pick canvas key — eliminates repeated GPU→CPU readbacks in room selection overlay
- Runtime validation of `SelectionType` / `RepeatsType` enums parsed from YAML config, with fallback on invalid values
- `console.warn` / `console.error` output now gated behind `config.debug`
- Modernized clipboard API (`navigator.clipboard.writeText`) with execCommand fallback
- Resolved 24 eslint warnings (dead code, unused imports, `any` types, stale directives)

### Fixed
- Memory leak in `PinchZoom`: `MutationObserver` and `PointerTracker` are now detached in `disconnectedCallback`
- `stringReplaceAll` polyfill: regex metacharacters are now escaped, avoiding unintended pattern interpretation
- `evaluateJinjaTemplate` now unsubscribes from the WebSocket message stream on first response (stream leak)
- No longer mutates `watchedEntities` inside `render()` (anti-pattern causing potential re-render loops)
- Null-check on camera `entity_picture` attribute in `_getMapSrc`
- Removed arbitrary `setTimeout(100)` delays in favor of `updateComplete`
- Deduplicated `currentPreset` assignment
- Obstacle `possibility` value of `0` now displays correctly (was falsy)
- Invalid character class in room CSS id regex (trailing hyphen, stale `m` flag)
- Defensive copy before `sort()` in `findTopLeft` (was mutating caller's array)
- Safer DOM target casts in manual rectangle drag handlers

## [5.2.1] - 2026-02-03

### Fixed
- Action buttons now have uniform height regardless of label length
- Added haptic feedback and subtle scale effect on button press

## [5.2.0] - 2026-02-03

### Added
- Lock button on map overlay to prevent accidental pan/zoom interactions
- Map is always locked by default when loading the page

## [5.1.3] - 2026-02-03

### Fixed
- CI and release workflows updated for fixed output filename

## [5.1.2] - 2026-02-03

### Changed
- Use fixed output filename instead of content hash for simpler updates

## [5.1.1] - 2026-02-03

### Fixed
- Card not filling allocated space in HA sections layout (grid_rows was too small)

## [5.1.0] - 2026-02-03

### Added
- Responsive design with CSS container queries (<350px compact, >500px spacious)
- `getLayoutOptions()` for HA sections layout support (2024.3+)
- Enhanced visual editor with map lock, two-finger pan, clear selection on start and language override options
- Editor sections organized in collapsible `ha-expansion-panel` panels
- Editor translation keys for English and French

## [5.0.0] - 2026-02-03

### Added
- Cache-busting with content hash in filename for Android app compatibility

### Changed

**BREAKING CHANGE**: The output filename pattern has changed from `dreame-vacuum-card.js` to `dreame-vacuum-card-[hash].js` (e.g., `dreame-vacuum-card-a1b2c3d.js`).

This change is necessary for proper cache-busting in the Home Assistant Android app. If you reference the card file directly by its old name, you will need to update your configuration to use the new filename pattern or let HACS handle the automatic updates.

## [4.2.0] - 2026-02-03

### Added
- Automatic cache-busting with content hash in filename for Android app compatibility

## [4.1.0] - 2026-02-03

### Added
- Lottie robot animation component with state sensor support

### Changed
- Prettier formatting in robot-animation and Lottie assets

## [4.0.0] - 2026-02-02

### Added
- Room mode with Dreame-style overlay and smoothed canvas

### Changed
- Renamed project to dreame-vacuum-card
- Code review fixes and UI component cleanup
- Updated integration requirement to foXaCe/dreame-vacuum fork
- Rewritten README for Dreame-style card overhaul
- CI/CD setup with prettier formatting and hacs/action update
- Added pre-commit configuration
- Bumped dependencies (home-assistant-js-websocket, babel, eslint, rollup, GitHub Actions)

### Fixed
- Trailing whitespace and end-of-file issues
