import {
  coreColors,
  accentColor,
  semanticColors,
  typeScale,
  spacingScale,
  radiusScale,
} from "@/lib/tokens";

// Verification page for change 001-frontend-foundation.
// Renders every token from kpop_marketplace_design_system.md §5-8 so they
// can be checked by eye against the doc (spec.md AC2-AC5). Not a page
// that ships in the storefront nav — remove or gate behind dev-only once
// later changes land, if desired.

export default function DesignTokensPage() {
  return (
    <main className="mx-auto max-w-5xl px-6 py-16 space-y-16">
      <header className="space-y-2">
        <p className="text-caption uppercase tracking-wide text-muted">
          Change 001-frontend-foundation
        </p>
        <h1 className="text-display-md">Design tokens</h1>
        <p className="text-body text-muted">
          Colors, typography, spacing, and radius values from
          kpop_marketplace_design_system.md §5–8.
        </p>
      </header>

      {/* Colors — AC2 */}
      <section className="space-y-4">
        <h2 className="text-heading-lg">Core colors</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
          {coreColors.map((c) => (
            <div key={c.name} className="space-y-2">
              <div
                className={`h-16 rounded-md border border-border ${c.className}`}
              />
              <p className="text-body-sm font-medium">{c.name}</p>
              <p className="text-caption text-muted">{c.hex}</p>
            </div>
          ))}
        </div>

        <h3 className="text-heading-sm pt-4">Brand accent</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
          <div className="space-y-2">
            <div
              className={`h-16 rounded-md ${accentColor.className}`}
            />
            <p className="text-body-sm font-medium">{accentColor.name}</p>
            <p className="text-caption text-muted">{accentColor.hex}</p>
          </div>
        </div>

        <h3 className="text-heading-sm pt-4">Semantic colors</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
          {semanticColors.map((c) => (
            <div key={c.name} className="space-y-2">
              <div
                className={`h-16 rounded-md ${c.className}`}
              />
              <p className="text-body-sm font-medium">{c.name}</p>
              <p className="text-caption text-muted">{c.hex}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Typography — AC3, AC4 */}
      <section className="space-y-6">
        <h2 className="text-heading-lg">Typography scale</h2>
        <p className="text-body-sm text-muted">
          Display/heading tokens use Space Grotesk; body/caption/micro use
          Inter. Resize the window past 768px to see the desktop step-up.
        </p>
        <div className="space-y-6 border-t border-border pt-6">
          {typeScale.map((t) => (
            <div
              key={t.token}
              className="grid grid-cols-1 md:grid-cols-[140px_1fr] gap-2 md:gap-6 items-baseline"
            >
              <p className="text-caption text-muted">
                {t.token} · {t.mobile}/{t.desktop}px · {t.weight}
              </p>
              <p className={t.className}>{t.usage}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Spacing — AC5 */}
      <section className="space-y-4">
        <h2 className="text-heading-lg">Spacing scale (4px base grid)</h2>
        <div className="space-y-2">
          {spacingScale.map((px) => (
            <div key={px} className="flex items-center gap-4">
              <p className="text-caption text-muted w-12 text-right">
                {px}px
              </p>
              <div
                className="bg-accent h-3 rounded-sm"
                style={{ width: `${px}px` }}
              />
            </div>
          ))}
        </div>
      </section>

      {/* Radius — AC5 */}
      <section className="space-y-4">
        <h2 className="text-heading-lg">Border radius</h2>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
          {radiusScale.map((r) => (
            <div key={r.name} className="space-y-2">
              <div
                className={`h-16 bg-surface border border-border ${r.className}`}
              />
              <p className="text-body-sm font-medium">{r.name}</p>
              <p className="text-caption text-muted">{r.px}px</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
