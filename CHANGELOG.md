# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [5.5.0] - 2026-04-21

### Added
- Visual editor rebuilt on `ha-form` with a declarative schema: native HA entity selectors filtered by domain, expandable sections, themed UI and proper accessibility out of the box.
- `getGridOptions()` for HA 2024.10+ sections layout (in addition to the legacy `getLayoutOptions()` for older dashboards).
- `isHaVersionAtLeast(hass, "MAJOR.MINOR")` helper for clean feature gating.
- `getStubConfig` now matches the camera and the vacuum entity by `device_id` when possible, instead of picking the first of each list.
- CSS `::part()` hooks (`header`, `stats`, `map-wrapper`, `map`, `tabs`, `tab`, `tab-active`, `action-btn`, `action-btn-primary`, `action-btn-secondary`, `mode-chip`) for clean theming via card-mod or themes.
- Three new editor section labels in EN and FR (`map_source`, `display`, `map_behavior`).
- vitest + happy-dom test setup with 23 unit tests covering `utils`, `template-utils` and the local `ha` helpers (`fireEvent`, `hasAction`, `computeStateDomain`, `forwardHaptic`, `handleAction`).
- npm scripts `test`, `test:watch`, `test:coverage`, `typecheck`. The `build` script now chains lint → typecheck → test → rollup so a broken commit cannot ship.

### Changed
- Service calls now pass `entity_id` via the `target` parameter rather than `serviceData` (vacuum/select/homeassistant.toggle), enabling `area_id`/`floor_id`/`label_id` resolution where applicable.
- Camera map `<img>` gets HTML5 perf attributes: `decoding="async"`, `loading="eager"`, `fetchpriority="high"` for non-blocking decode and prioritized network fetches.

### Removed
- Dependency on `custom-card-helpers` (barely maintained upstream). Vendored a minimal `src/ha/` module that re-implements only the helpers we use (`fireEvent`, `forwardHaptic`, `hasAction`, `handleAction`, `computeStateDomain`) plus the typed `ActionConfig` / `LovelaceCard` / `LovelaceCardEditor` / `HomeAssistant` interfaces.

## [5.4.0] - 2026-04-19

### Added
- "+ Add to cleaning" button now appears even when the segment cleaning was started outside the card (Dreame app, HA script, automation). The card reads the `active_segments` attribute exposed by the integration on the vacuum entity, falling back to the local selection memory for older devices.

### Fixed
- Room selection was blocked during an active cleaning because the cleaning-mode render throttle also intercepted user-initiated `requestUpdate()` calls. The throttle now applies only to pure `_hass` coordinator ticks — user interactions (toggle, tab change, button) never get delayed.
- When the integration exposes a degenerate (all-zero) `segment_map` PNG, the pick buffer used to stay black and every room click silently failed. The card now detects this and transparently falls back to the polygon-based pick canvas built from the rooms geometry.

## [5.3.0] - 2026-04-19

### Added
- **"Add to cleaning" button**: when a segment cleaning is already active and you pick new rooms, the primary button switches from "Clean" to "+ Add to cleaning" and relaunches `vacuum_clean_segment` with the union of in-progress + newly selected rooms — no more stop/restart workflow
- Active room selection memory is automatically cleared when the vacuum returns to docked/idle/charging
- Support for `room.segment_id` attribute exposed by the integration: maps raw pixel values of the `segment_map` PNG to `room_id`, enabling correct hit-testing and overlay on devices where `raw ≠ room_id` (e.g. Kitchen `room_id=2` but segment `raw=11`)
- French/English translations for `dreame_ui.action.append`

### Changed
- Resolved all circular import warnings by extracting template helpers into a dedicated `template-utils.ts` module
- Tightened TypeScript types in the main card file: removed the file-wide `eslint-disable no-explicit-any` directive and eliminated all 11 `as any` casts (typed event intersections, public `deselect()` method on `PredefinedMapObject`, proper `EntityRegistryDisplayEntry` usage)
- `_buildPickCanvasFromPolygons` draws with `segment_id` when available instead of `parseInt(roomId)`
- Structure hash for pick canvas cache now includes `segment_id` so it invalidates on re-calibration
- `image-rendering` now uses `crisp-edges` with `pixelated` fallback for sharper map zoom
- Babel plugins migrated from deprecated `@babel/plugin-proposal-*` to `@babel/plugin-transform-*`
- TypeScript bumped to 6.0, `moduleResolution` migrated to `bundler`, and `tsconfig` target/lib bumped to `es2021`
- 10 Dependabot PRs merged (rollup, eslint group, picomatch, flatted, minimatch, custom-card-helpers 2.0, action-gh-release 3, upload-artifact 7, typescript 6)

### Fixed
- `className` deprecation warning in TypeScript 6 (replaced with `getAttribute("class")`)
- 1 moderate `npm audit` vulnerability (brace-expansion)
- CodeQL CI conflict: removed custom workflow because the repo's GitHub Default Setup already analyzes JS/TS and rejected "advanced configuration" SARIF uploads

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
