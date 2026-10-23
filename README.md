# ts-tauri-app-starter

A **TypeScript + React + Tailwind CSS v4 + Tauri 2** application starter for desktop and mobile.

It ships a complete, runnable vertical slice — UI shell, typed API layer, layered Rust backend,
local persistence, i18n, theming and a **Liquid Glass** surface theme — with **no business logic**.
The `Item` domain is a deliberately neutral placeholder: rename it and you have your own app.

---

## Features

| Area | What you get |
| --- | --- |
| Shell | Responsive desktop header + mobile top bar / bottom dock, view persistence |
| Theme | Light / Dark / System, plus `solid` and **Liquid Glass** surface styles |
| i18n | `en` and `zh-CN`, instant switching, OS-locale aware |
| Data | Full CRUD example (`list / create / update / delete`) persisted as JSON |
| Backend | Layered Rust: `commands → service → dao → model`, with unit tests |
| DX | Strict TypeScript, path alias `@/*`, browser mock so `npm run dev` works without Rust |
| Mobile | Safe areas, 16px inputs (no iOS zoom), bottom sheets, Android/iOS icon sets |

---

## Quick start

```bash
npm install

npm run dev          # browser only, uses the built-in mock backend
npm run tauri:dev    # full desktop app (requires the Rust toolchain)

npm run typecheck    # tsc --noEmit
npm run build        # typecheck + production bundle
npm run tauri:build  # installers / bundles
```

> `npm run dev` works **without Rust**: `src/api/client.ts` falls back to a
> localStorage-backed mock whenever `window.__TAURI_INTERNALS__` is absent.

---

## Architecture

```
┌──────────────────────── React (TypeScript) ────────────────────────┐
│  components/views   Dashboard · ItemsView · SettingsView           │
│  components/layout  TopBar · MobileTopBar · MobileBottomNav         │
│  components/ui      tabs · badge · select · modal · bento-grid     │
│  components/theme   SurfaceContext · GlassPanel · AmbientBackground │
│  hooks              useItems · useSettings · useTheme · useMobile  │
│  api                single typed surface + browser mock            │
└───────────────────────────────┬────────────────────────────────────┘
                                │  invoke("create_item", { input })
┌───────────────────────────────▼────────────────────────────────────┐
│  commands.rs   thin #[tauri::command] wrappers, no logic           │
│  service/      validation, business rules, cache updates           │
│  dao/          JSON read/write in the app data dir                 │
│  model/        serde structs (camelCase on the wire)               │
│  util/         constants, time/id helpers                          │
└────────────────────────────────────────────────────────────────────┘
```

**Rules that keep it maintainable**

1. Components never call `invoke` directly — they go through `src/api`.
2. `commands.rs` contains no logic; it only delegates to `service`.
3. Only `dao` touches the filesystem.
4. A `std::sync::Mutex` guard is **never** held across an `.await`.

### Project layout

```
src/
├── api/            client.ts (invoke + mock) · index.ts (typed API)
├── components/
│   ├── common/     ConfirmDialog · EmptyState · ThemeToggle · Toast
│   ├── items/      ItemCard · ItemFormModal
│   ├── layout/     TopBar (floating dock) · MobileTopBar · MobileBottomNav
│   ├── theme/      SurfaceContext · GlassPanel · AmbientBackground
│   ├── ui/         badge · bento-grid · label · modal · select · tabs
│   ├── views/      Dashboard · ItemsView · SettingsView
│   └── App.tsx     shell, routing, modals, toasts
├── hooks/          useItems · useMobile · useSettings · useTheme
├── lib/            platform.ts · utils.ts
├── locales/        en.json · zh-CN.json
├── styles/         mobile.css
├── types/          shared TypeScript contracts
├── i18n.ts  input.css  main.tsx
└── src-tauri/      Rust backend (see above)
```

---

## Liquid Glass theme

The `glass` surface uses [`liquid-glass-react`](https://github.com/rdev/liquid-glass-react)
(Apple-style refraction via SVG displacement maps). Switch it in **Settings → Appearance → Surface style**.

`GlassPanel` wraps the library and degrades gracefully:

| surface | `refract` | Rendering |
| --- | --- | --- |
| `glass` | `true` | real `liquid-glass-react` displacement (floating dock) |
| `glass` | `false` | `.glass-surface` CSS glass: blur + saturate + specular edge |
| `solid` | – | `.panel` opaque card |

### Why it actually looks like glass

Frosted plastic blurs *uniformly*. Apple's Liquid Glass is **clear in the middle and
bends light hard at the edges** — and a `blur()` can never reproduce that.

So the starter ships its own lens in `components/theme/GlassFilters.tsx`:

```
feImage  (gradient map)  →  feDisplacementMap ×2  →  feGaussianBlur
```

Two generated gradient maps drive `feDisplacementMap`, where `128` means "no shift".
Each map ramps only within the outer ~20% of the box and sits flat at `128` through the
middle. Result: **warped borders, sharp centre.** It is wired in via
`backdrop-filter: url(#lg-panel)`, so it warps the *backdrop*, not the element.

Supporting cues:

- **Bevel** — bright `inset 1.5px 1.5px`, dark `inset -1px -1px`: a pane with thickness.
- **Specular** — a narrow highlight raking the top-left corner.
- **Low tint** — `0.14` light / `0.07` dark. The lens does the work, not a white veil.
- **A backdrop worth refracting** — `AmbientBackground` renders drifting orbs *and* a
  crisp 30px grid. Straight lines are what make the bending legible.

Tuning knobs:

```css
--glass-blur: 3px;    /* residual blur after warping */
--glass-sat:  180%;   /* colour punch through the panel */
--glass-tint: 0.14;   /* white veil — raise if text contrast suffers */
--glass-rim:  0.75;   /* border brightness */
```

`EDGE` and `scale` in `GlassFilters.tsx` control the refraction band and its strength.

> **Browser support.** Chromium and Safari apply SVG filters in `backdrop-filter`.
> Firefox does not, so an `@supports not (backdrop-filter: url(#lg-panel))` block falls
> back to a stronger frost. `prefers-reduced-transparency` drops the effect entirely.

```tsx
<GlassPanel cornerRadius={16} blurAmount={0.04} elasticity={0.2}>
  <YourContent />
</GlassPanel>
```

The library is `React.lazy`-loaded, so its ~53 kB chunk is only fetched when glass is enabled.

> ⚠️ Two integration details worth knowing:
> - `liquid-glass-react` renders an internal `.glass` element and hardcodes `text-white`
>   plus a 20px font; `input.css` neutralises that under `.liquid-panel`.
> - `.panel` is declared with `@utility`, and Tailwind's utilities layer beats the
>   components layer. The `[data-surface='glass']` overrides are therefore **unlayered**
>   on purpose — putting them in `@layer components` silently does nothing.

---

## Showcase: GitHub-style UI demo

`demo/` contains a standalone entry that renders a GitHub-style repository page with the
same glass system — useful for judging the effect against dense, realistic UI rather than
an empty page.

```bash
npm run dev          # then open http://localhost:1420/demo/
```

It ships its own Vite entry (`demo/index.html`), so **the starter itself stays clean** —
nothing in `src/` knows the demo exists.

The demo includes a `glass` / `solid` switch and a light/dark toggle in its top bar, so you
can A/B the surface treatment live.

Why GitHub as the test case: the effect is only convincing over **high-frequency content**.
The demo deliberately packs in a file list, a contribution heatmap (182 cells), a language
bar, a diff block and code samples — all of which give the lens something to bend.

| File | Purpose |
| --- | --- |
| `demo/index.html` | Vite entry |
| `demo/main.tsx` | Mounts the demo |
| `demo/GitHubDemo.tsx` | The UI (fictional `octo-labs/aurora-ui` repo) |
| `demo/github.css` | GitHub-flavoured layout primitives (heatmap, language bar, diff) |

---

## Adding your own domain feature

Replace `Item` end-to-end in six steps:

1. **model** — `src-tauri/src/model/<entity>.rs` (serde struct + input struct)
2. **dao** — `src-tauri/src/dao/<entity>.rs` (`load_*` / `save_*` via `storage::read_json/write_json`)
3. **service** — `src-tauri/src/service/<entity>.rs` (validation + cache mutation + `persist`)
4. **command** — add thin wrappers in `commands.rs` and register them in `lib.rs`
5. **api** — add the methods to `src/api/index.ts` (and a mock branch in `client.ts`)
6. **ui** — a `use<Entity>()` hook plus a view under `components/views/`

---

## Customization checklist

| What | Where |
| --- | --- |
| App name / tagline | `src/locales/*.json` → `app.name`, `app.tagline` |
| Window title, identifier, version | `src-tauri/tauri.conf.json` |
| Crate name (`*_lib` must match `main.rs`) | `src-tauri/Cargo.toml` |
| Brand colors | `src/input.css` → `@theme { --color-brand-* }` |
| Background orbs | `src/input.css` → `.orb-a` … `.orb-d` |
| Logo | `public/logo.svg` |
| Icons | edit the SVG, then `npm run tauri icon public/logo.svg` |
| Default settings | `src-tauri/src/model/settings.rs` + `src/api/client.ts` |

---

## Data & storage

Settings and items are stored as JSON in the Tauri app data directory:

| OS | Path |
| --- | --- |
| Windows | `%APPDATA%\com.example.tauri-starter\` |
| macOS | `~/Library/Application Support/com.example.tauri-starter/` |
| Linux | `~/.local/share/com.example.tauri-starter/` |

Files: `settings.json`, `items.json`.

---

## Mobile

```bash
npm run tauri:android:init && npm run tauri:android:dev
npm run tauri:ios:init     && npm run tauri:ios:dev
```

The mobile shell activates via `html.app-mobile` (set by `useMobile`), so phones keep the mobile
layout in landscape too. Desktop-only plugins such as `window-state` are gated behind
`#[cfg(not(any(target_os = "android", target_os = "ios")))]`, with separate
`capabilities/desktop.json` and `capabilities/mobile.json`.

---

## License

MIT — see [LICENSE](./LICENSE).
