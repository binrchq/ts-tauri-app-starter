import { useEffect, useMemo, useState } from 'react';
import {
  BellIcon,
  CheckCircleIcon,
  ChevronDownIcon,
  ClockIcon,
  CodeBracketIcon,
  CubeIcon,
  DocumentTextIcon,
  EyeIcon,
  FolderIcon,
  GlobeAltIcon,
  MagnifyingGlassIcon,
  MoonIcon,
  PlusIcon,
  ScaleIcon,
  StarIcon,
  SunIcon,
  TagIcon,
  UsersIcon,
} from '@heroicons/react/24/outline';
import { StarIcon as StarSolid } from '@heroicons/react/24/solid';
import { AmbientBackground } from '../src/components/theme/AmbientBackground';
import { GlassFilters } from '../src/components/theme/GlassFilters';
import { SurfaceProvider, useIsGlass } from '../src/components/theme/SurfaceContext';
import type { SurfaceStyle } from '../src/types';
import { cn } from '../src/lib/utils';
import './github.css';

/* ------------------------------------------------------------------ data -- */

const REPO = { owner: 'octo-labs', name: 'aurora-ui', branch: 'main' };

const FILES = [
  { dir: true, name: '.github', msg: 'ci: cache cargo artefacts', time: '2 days ago' },
  { dir: false, name: 'src', msg: 'feat: edge lensing filter', time: '4 hours ago' },
  { dir: false, name: 'README.md', msg: 'docs: explain the displacement map', time: '1 day ago' },
  { dir: false, name: 'package.json', msg: 'chore(deps): bump vite to 7.1', time: '3 days ago' },
  { dir: false, name: 'tsconfig.json', msg: 'chore: enable strict mode', time: '2 weeks ago' },
  { dir: false, name: 'vite.config.ts', msg: 'fix: ignore src-tauri in watcher', time: '5 days ago' },
];

const COMMITS = [
  { msg: 'feat(glass): SVG edge-lensing filter', who: 'logan', sha: '659a3ff', time: '4 hours ago' },
  { msg: 'fix: stop Vite crawling src-tauri/target', who: 'logan', sha: '2f821f0', time: '6 hours ago' },
  { msg: 'style: lower glass tint, raise saturation', who: 'logan', sha: 'a91c04d', time: '1 day ago' },
];

const TABS = ['Code', 'Issues', 'Pull requests', 'Actions', 'Projects', 'Security', 'Insights'];

const LANGUAGES = [
  { name: 'TypeScript', pct: 61.4, color: '#3178c6' },
  { name: 'Rust', pct: 24.8, color: '#dea584' },
  { name: 'CSS', pct: 9.3, color: '#563d7c' },
  { name: 'HTML', pct: 4.5, color: '#e34c26' },
];

function useHeatmap(weeks = 26) {
  return useMemo(
    () =>
      Array.from({ length: weeks * 7 }, (_, i) => {
        const seed = Math.sin(i * 12.9898) * 43758.5453;
        const v = seed - Math.floor(seed);
        return v < 0.44 ? 0 : v < 0.64 ? 1 : v < 0.81 ? 2 : v < 0.94 ? 3 : 4;
      }),
    [weeks],
  );
}

/* --------------------------------------------------------------- chrome -- */

function GitHubMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" fill="currentColor" className={className} aria-hidden>
      <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82a7.4 7.4 0 0 1 2-.27c.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8Z" />
    </svg>
  );
}

function Avatar({ label, className }: { label: string; className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-sky-500 font-bold text-white',
        className,
      )}
    >
      {label}
    </span>
  );
}

/* A panel that follows the active surface style. */
function Panel({
  children,
  className,
  radius = 16,
}: {
  children: React.ReactNode;
  className?: string;
  radius?: number;
}) {
  return (
    <section className={cn('glass-surface gh-panel', className)} style={{ borderRadius: radius }}>
      {children}
    </section>
  );
}

/* ---------------------------------------------------------------- topbar -- */

function DemoTopBar({
  surface,
  onSurface,
  dark,
  onDark,
}: {
  surface: SurfaceStyle;
  onSurface: (s: SurfaceStyle) => void;
  dark: boolean;
  onDark: (v: boolean) => void;
}) {
  const isGlass = useIsGlass();

  const chip = cn(
    'pointer-events-auto flex items-center',
    isGlass
      ? 'glass-surface glass-chrome'
      : 'border border-white/10 bg-slate-900/90 shadow-sm backdrop-blur-xl',
  );

  const iconBtn =
    'rounded-lg p-1.5 text-white/70 transition-colors hover:bg-white/10 hover:text-white';

  return (
    <div className="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-slate-950/45 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-[1400px] items-center gap-3 px-5">
        <GitHubMark className="h-7 w-7 shrink-0 text-white" />

        <div className="relative hidden min-w-0 flex-1 md:block md:max-w-sm">
          <MagnifyingGlassIcon className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/50" />
          <input
            placeholder="Search or jump to…"
            className="h-8 w-full rounded-md border border-white/15 bg-white/5 pl-8 pr-3 text-sm text-white placeholder:text-white/45 focus:border-brand-400/60 focus:outline-none focus:ring-2 focus:ring-brand-500/25"
          />
        </div>

        <nav className="hidden items-center gap-1 text-sm font-medium text-white/85 lg:flex">
          {['Pull requests', 'Issues', 'Marketplace', 'Explore'].map((item) => (
            <a key={item} href="#!" className="rounded-lg px-2.5 py-1.5 hover:bg-white/10">
              {item}
            </a>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-1.5">
          <button type="button" className={iconBtn} aria-label="Notifications">
            <BellIcon className="h-5 w-5" />
          </button>
          <button type="button" className={iconBtn} aria-label="Create new">
            <PlusIcon className="h-5 w-5" />
          </button>

          {/* Surface switch — this is the point of the demo. */}
          <div className={cn(chip, 'ml-1 gap-1 rounded-xl p-1')}>
            {(['glass', 'solid'] as SurfaceStyle[]).map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => onSurface(option)}
                className={cn(
                  'rounded-lg px-2.5 py-1 text-[11px] font-semibold capitalize transition-colors',
                  surface === option
                    ? 'bg-brand-600 text-white'
                    : 'text-white/70 hover:bg-white/10 hover:text-white',
                )}
              >
                {option}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => onDark(!dark)}
            className={cn(chip, 'rounded-xl p-1.5 text-white/80 hover:text-white')}
            aria-label="Toggle theme"
          >
            {dark ? <SunIcon className="h-4 w-4" /> : <MoonIcon className="h-4 w-4" />}
          </button>

          <Avatar label="L" className="h-8 w-8 text-xs" />
        </div>
      </div>
    </div>
  );
}

/* ----------------------------------------------------------- repo header -- */

function RepoHeader() {
  const [starred, setStarred] = useState(true);

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2 text-xl">
        <GitHubMark className="h-6 w-6 opacity-80" />
        <a href="#!" className="gh-link font-normal">
          {REPO.owner}
        </a>
        <span className="gh-muted">/</span>
        <a href="#!" className="font-bold">
          {REPO.name}
        </a>
        <span className="rounded-full border border-current px-2 py-0.5 text-xs font-medium gh-muted">
          Public
        </span>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <div className="flex">
          <button className="flex items-center gap-2 rounded-l-md border px-3 py-1.5 text-xs font-semibold gh-divider hover:bg-white/5">
            <EyeIcon className="h-4 w-4" /> Watch
            <span className="gh-counter">3</span>
          </button>
          <button className="flex items-center gap-2 border-y px-3 py-1.5 text-xs font-semibold gh-divider hover:bg-white/5">
            <UsersIcon className="h-4 w-4" /> Fork
            <span className="gh-counter">12</span>
          </button>
          <button
            onClick={() => setStarred((v) => !v)}
            className="flex items-center gap-2 rounded-r-md border px-3 py-1.5 text-xs font-semibold gh-divider hover:bg-white/5"
          >
            {starred ? (
              <StarSolid className="h-4 w-4 text-amber-400" />
            ) : (
              <StarIcon className="h-4 w-4" />
            )}
            {starred ? 'Starred' : 'Star'}
            <span className="gh-counter">{starred ? 1284 : 1283}</span>
          </button>
        </div>
      </div>

      <nav className="mt-5 flex gap-1 overflow-x-auto text-sm">
        {TABS.map((tab, i) => (
          <button
            key={tab}
            className={cn(
              'flex shrink-0 items-center gap-2 px-3 py-2.5 font-medium transition-colors',
              i === 0
                ? 'gh-tab-active'
                : 'gh-muted hover:rounded-md hover:bg-white/5',
            )}
          >
            {i === 0 && <CodeBracketIcon className="h-4 w-4" />}
            {tab}
            {tab === 'Issues' && <span className="gh-counter">7</span>}
            {tab === 'Pull requests' && <span className="gh-counter">3</span>}
          </button>
        ))}
      </nav>
      <div className="gh-sep" />
    </div>
  );
}

/* ------------------------------------------------------------ file list -- */

function FileBrowser() {
  return (
    <Panel className="overflow-hidden">
      <div className="flex flex-wrap items-center gap-2 p-3.5">
        <button className="flex items-center gap-2 rounded-md border px-3 py-1.5 text-xs font-semibold gh-divider hover:bg-white/5">
          <CodeBracketIcon className="h-4 w-4" />
          {REPO.branch}
          <ChevronDownIcon className="h-3.5 w-3.5" />
        </button>
        <button className="hidden items-center gap-2 rounded-md border px-3 py-1.5 text-xs gh-muted gh-divider hover:bg-white/5 sm:flex">
          <FolderIcon className="h-4 w-4" /> Branches
          <span className="gh-counter">4</span>
        </button>
        <button className="hidden items-center gap-2 rounded-md border px-3 py-1.5 text-xs gh-muted gh-divider hover:bg-white/5 sm:flex">
          <TagIcon className="h-4 w-4" /> Tags
        </button>

        <div className="ml-auto flex items-center gap-2">
          <button className="rounded-md border px-3 py-1.5 text-xs font-semibold gh-divider hover:bg-white/5">
            Go to file
          </button>
          <button className="flex items-center gap-1.5 rounded-md bg-[#1f883d] px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-[#1a7f37]">
            <CodeBracketIcon className="h-4 w-4" /> Code
            <ChevronDownIcon className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      <div className="gh-sep" />

      {/* Latest commit banner */}
      <div className="flex items-center gap-3 px-4 py-3">
        <Avatar label="L" className="h-7 w-7 text-[11px]" />
        <span className="truncate text-sm font-semibold">logan</span>
        <span className="truncate text-sm gh-muted">{COMMITS[0].msg}</span>
        <span className="ml-auto hidden shrink-0 items-center gap-1.5 text-xs gh-muted sm:flex">
          <ClockIcon className="h-3.5 w-3.5" />4 hours ago
        </span>
        <span className="hidden shrink-0 font-mono text-xs gh-muted md:inline">
          {COMMITS[0].sha}
        </span>
      </div>

      <div className="gh-sep" />

      {FILES.map((file, i) => (
        <div key={file.name}>
          <div className="gh-file-row px-4 py-2.5 transition-colors hover:bg-white/5">
            {file.dir ? (
              <FolderIcon className="h-4 w-4 text-sky-400" />
            ) : (
              <DocumentTextIcon className="h-4 w-4 gh-muted" />
            )}
            <span className="truncate text-sm font-medium">{file.name}</span>
            <span className="gh-file-msg truncate text-xs gh-muted">{file.msg}</span>
            <span className="text-right text-xs gh-muted">{file.time}</span>
          </div>
          {i < FILES.length - 1 && <div className="gh-sep" />}
        </div>
      ))}
    </Panel>
  );
}

/* --------------------------------------------------------------- readme -- */

function ReadmePanel() {
  return (
    <Panel className="overflow-hidden">
      <div className="flex items-center gap-2 border-b px-4 py-3 gh-divider">
        <DocumentTextIcon className="h-4 w-4 gh-muted" />
        <span className="text-sm font-semibold">README.md</span>
      </div>

      <div className="space-y-4 p-6 text-sm leading-7">
        <h1 className="border-b pb-2 text-2xl font-bold gh-divider">aurora-ui</h1>
        <p className="gh-muted">
          A desktop &amp; mobile starter built with Tauri 2, React and Tailwind CSS v4, featuring a
          physically-plausible Liquid Glass surface.
        </p>

        <div className="space-y-2">
          <h2 className="text-lg font-semibold">Install</h2>
          <pre className="overflow-x-auto rounded-lg border p-3 font-mono text-xs gh-divider">
            <code>{`npm install
npm run tauri:dev`}</code>
          </pre>
        </div>

        <div className="space-y-2">
          <h2 className="text-lg font-semibold">How the glass works</h2>
          <p className="gh-muted">
            A uniform <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-xs">blur()</code>{' '}
            can only produce frosted plastic. Real refraction needs a displacement map:
          </p>
          <div className="gh-diff overflow-x-auto rounded-lg border gh-divider">
            <div className="gh-diff-del px-3">- backdrop-filter: blur(24px);</div>
            <div className="gh-diff-add px-3">
              + backdrop-filter: url(#lg-panel) saturate(180%) blur(3px);
            </div>
          </div>
          <p className="gh-muted">
            Two generated gradient maps drive{' '}
            <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-xs">
              feDisplacementMap
            </code>
            , warping only the outer band so the centre stays sharp.
          </p>
        </div>

        <div className="flex flex-wrap gap-2 pt-2">
          {['tauri', 'react', 'typescript', 'tailwindcss', 'glassmorphism'].map((topic) => (
            <span
              key={topic}
              className="rounded-full bg-sky-500/15 px-3 py-1 text-xs font-medium gh-link"
            >
              {topic}
            </span>
          ))}
        </div>
      </div>
    </Panel>
  );
}

/* ------------------------------------------------------------- sidebar -- */

function AboutPanel() {
  return (
    <Panel className="p-4">
      <h3 className="text-sm font-semibold">About</h3>
      <p className="mt-2 text-sm leading-6 gh-muted">
        Tauri + React starter with an SVG edge-lensing Liquid Glass implementation.
      </p>

      <a href="#!" className="mt-3 inline-block text-sm gh-link hover:underline">
        aurora-ui.dev
      </a>

      <div className="mt-3 flex flex-wrap gap-2">
        {['tauri', 'react', 'glass'].map((t) => (
          <span key={t} className="rounded-full bg-sky-500/15 px-2.5 py-0.5 text-xs gh-link">
            {t}
          </span>
        ))}
      </div>

      <div className="gh-sep my-4" />

      <div className="space-y-2.5 text-sm gh-muted">
        <div className="flex items-center gap-2">
          <DocumentTextIcon className="h-4 w-4" /> Readme
        </div>
        <div className="flex items-center gap-2">
          <ScaleIcon className="h-4 w-4" /> MIT license
        </div>
        <div className="flex items-center gap-2">
          <GlobeAltIcon className="h-4 w-4" /> 1.3k stars
        </div>
        <div className="flex items-center gap-2">
          <UsersIcon className="h-4 w-4" /> 12 forks
        </div>
      </div>
    </Panel>
  );
}

function LanguagesPanel() {
  return (
    <Panel className="p-4">
      <h3 className="text-sm font-semibold">Languages</h3>

      <div className="gh-lang-bar mt-3">
        {LANGUAGES.map((lang) => (
          <i key={lang.name} style={{ width: `${lang.pct}%`, background: lang.color }} />
        ))}
      </div>

      <ul className="mt-3 space-y-1.5 text-xs">
        {LANGUAGES.map((lang) => (
          <li key={lang.name} className="flex items-center gap-2">
            <span
              className="h-2.5 w-2.5 shrink-0 rounded-full"
              style={{ background: lang.color }}
            />
            <span className="font-medium">{lang.name}</span>
            <span className="ml-auto gh-muted">{lang.pct}%</span>
          </li>
        ))}
      </ul>
    </Panel>
  );
}

function ContributionPanel() {
  const heat = useHeatmap();

  return (
    <Panel className="p-4">
      <h3 className="text-sm font-semibold">1,284 contributions in the last year</h3>

      <div className="mt-3 overflow-x-auto pb-1">
        <div className="gh-heat">
          {heat.map((level, i) => (
            <span key={i} className={level ? `l${level}` : undefined} />
          ))}
        </div>
      </div>

      <div className="mt-3 flex items-center gap-1.5 text-[11px] gh-muted">
        <span>Less</span>
        {[0, 1, 2, 3, 4].map((level) => (
          <span key={level} className={cn('h-2.5 w-2.5 rounded-sm', level && `l${level}`)} />
        ))}
        <span>More</span>
      </div>
    </Panel>
  );
}

function ReleasesPanel() {
  return (
    <Panel className="p-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">Releases</h3>
        <CubeIcon className="h-4 w-4 gh-muted" />
      </div>

      <div className="mt-3 space-y-3">
        {[
          { tag: 'v0.1.0', note: 'First public preview', when: '2 days ago' },
          { tag: 'v0.0.9', note: 'Glass filter prototype', when: '1 week ago' },
        ].map((rel) => (
          <div key={rel.tag} className="text-xs">
            <div className="flex items-center gap-2">
              <TagIcon className="h-3.5 w-3.5 gh-muted" />
              <span className="font-semibold gh-link">{rel.tag}</span>
              <span className="rounded-full border px-1.5 text-[10px] gh-divider gh-muted">
                Latest
              </span>
            </div>
            <div className="ml-[22px] mt-0.5 gh-muted">
              {rel.note} · {rel.when}
            </div>
          </div>
        ))}
      </div>
    </Panel>
  );
}

function CommitsPanel() {
  return (
    <Panel className="overflow-hidden">
      <div className="flex items-center gap-2 border-b px-4 py-3 gh-divider">
        <ClockIcon className="h-4 w-4 gh-muted" />
        <span className="text-sm font-semibold">Recent commits</span>
      </div>

      {COMMITS.map((commit, i) => (
        <div key={commit.sha}>
          <div className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-white/5">
            <Avatar label="L" className="h-7 w-7 text-[11px]" />
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-medium">{commit.msg}</div>
              <div className="mt-0.5 text-xs gh-muted">
                {commit.who} · {commit.time}
              </div>
            </div>
            <span className="hidden shrink-0 font-mono text-xs gh-muted sm:inline">
              {commit.sha}
            </span>
            <CheckCircleIcon className="h-4 w-4 shrink-0 text-emerald-400" />
          </div>
          {i < COMMITS.length - 1 && <div className="gh-sep" />}
        </div>
      ))}
    </Panel>
  );
}

/* ----------------------------------------------------------------- page -- */

export function GitHubDemo() {
  const [surface, setSurface] = useState<SurfaceStyle>('glass');
  const [dark, setDark] = useState(true);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
    document.documentElement.style.colorScheme = dark ? 'dark' : 'light';
  }, [dark]);

  return (
    <SurfaceProvider surface={surface}>
      <div data-surface={surface} className="gh-page relative min-h-dvh">
        <GlassFilters />
        <AmbientBackground />

        <DemoTopBar surface={surface} onSurface={setSurface} dark={dark} onDark={setDark} />

        <main className="mx-auto w-full max-w-[1400px] px-5 pb-20 pt-24">
          <RepoHeader />

          <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_304px]">
            <div className="space-y-6">
              <FileBrowser />
              <CommitsPanel />
              <ReadmePanel />
            </div>

            <aside className="space-y-5">
              <AboutPanel />
              <ContributionPanel />
              <LanguagesPanel />
              <ReleasesPanel />
            </aside>
          </div>

          <footer className="mt-10 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs gh-muted">
            <GitHubMark className="h-5 w-5" />
            <span>GitHub-style UI demo — fictional repository, rendered with the starter&apos;s glass system.</span>
          </footer>
        </main>
      </div>
    </SurfaceProvider>
  );
}