/**
 * Assert-based render check for the app shell + footer. No test runner in the
 * repo (no-new-deps), so this mirrors the other *.check files: run with
 *   npx tsx src/components/__checks__/shell.check.tsx
 */
import assert from "node:assert";
import { renderToStaticMarkup } from "react-dom/server";
import { Footer } from "@/components/layout/Footer";
import { FOOTER_GROUPS, SOCIAL_LINKS, SITE_NAME } from "@/lib/constants";

const html = renderToStaticMarkup(<Footer />);

// Every seed link actually renders — a mis-wired map would silently drop a column.
const linkCount = FOOTER_GROUPS.reduce((n, g) => n + g.links.length, 0);
for (const group of FOOTER_GROUPS) {
  assert.ok(html.includes(`aria-label="${group.title}"`), `missing nav ${group.title}`);
  for (const link of group.links) {
    assert.ok(html.includes(`href="${link.href}"`), `missing link ${link.href}`);
  }
}
assert.equal(
  (html.match(/<a /g) ?? []).length,
  // group links + brand wordmark + 3 social + Privacy + Terms
  linkCount + 1 + SOCIAL_LINKS.length + 2,
  "unexpected anchor count",
);

// The hardcoded year must be literal — a Date call would make this drift.
assert.ok(html.includes("2026"), "copyright year missing");
assert.ok(!/20(2[7-9]|[3-9]\d)/.test(html), "a non-2026 year leaked in");

// Social links open off-site: rel must carry noopener or it's a tabnabbing hole.
for (const s of SOCIAL_LINKS) {
  assert.ok(html.includes(`aria-label="${SITE_NAME} on ${s.label}"`), `social label ${s.label}`);
}
assert.equal(
  (html.match(/rel="noreferrer noopener"/g) ?? []).length,
  SOCIAL_LINKS.length,
  "every external social link needs rel=noopener",
);
assert.equal(
  (html.match(/target="_blank"/g) ?? []).length,
  SOCIAL_LINKS.length,
  "social links should open in a new tab",
);

// Icons must be decorative (the <a> carries the name) — otherwise SRs read twice.
assert.ok(!/<svg(?![^>]*aria-hidden)/.test(html), "an svg is missing aria-hidden");
assert.ok(!/stroke-width="[2-9]/.test(html), "icon stroke-width exceeds 1.5");

// Headings must be real headings, not styled spans.
for (const group of FOOTER_GROUPS) {
  assert.ok(
    new RegExp(`<h2[^>]*>${group.title}</h2>`).test(html),
    `${group.title} is not an <h2>`,
  );
}

// No hardcoded hex colors — tokens only.
assert.ok(!/#[0-9a-fA-F]{6}/.test(html), "hardcoded hex color in footer markup");

console.log(
  `shell.check OK: ${FOOTER_GROUPS.length} groups, ${linkCount} links, ${SOCIAL_LINKS.length} social`,
);
