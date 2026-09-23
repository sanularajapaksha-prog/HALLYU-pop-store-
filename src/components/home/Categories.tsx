import { CategoryCard } from "@/components/collection/CategoryCard";
import { Section } from "@/components/layout/Section";
import { Reveal } from "@/components/ui/Reveal";
import { categories } from "@/lib/categories";

const STAGGER_MS = 60;

/**
 * §22 — all six categories in a 2-column grid at every breakpoint. §22's
 * homepage diagram pairs them explicitly (Albums|Photocards, Lightsticks|Apparel,
 * Accessories|Official Merch) and its Mobile note repeats 2-column. Six items
 * divide cleanly into two, so no row is ever left with a single orphan tile.
 */
export function Categories() {
  if (categories.length === 0) return null;

  return (
    <Section id="collections" eyebrow="Browse" title="Shop Collections">
      <ul className="grid grid-cols-2 gap-3 md:gap-6">
        {categories.map((category, index) => (
          <li key={category.id}>
            <Reveal delay={index * STAGGER_MS} className="h-full">
              <CategoryCard
                category={category}
                className="h-full"
                // Two tiles are plausibly near the fold on a tall desktop; the
                // rest lazy-load.
                priority={index < 2}
              />
            </Reveal>
          </li>
        ))}
      </ul>
    </Section>
  );
}

export default Categories;
