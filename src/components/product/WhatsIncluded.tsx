import Image from "next/image";
import { cn } from "@/lib/utils";

export interface InclusionItem {
  name: string;
  quantity?: number;
  image?: string;
}

export interface WhatsIncludedProps {
  items: InclusionItem[];
  className?: string;
}

/**
 * MOCK CONTENT. The §44 data model has no inclusions field, so contents are
 * derived from the category rather than stored per product. Replace this with a
 * real `Product.inclusions` array when the data model gains one — the component
 * takes items as a prop precisely so that swap touches nothing else.
 */
const BY_CATEGORY: Record<string, InclusionItem[]> = {
  "cat-albums": [
    { name: "CD", quantity: 1 },
    { name: "Photobook", quantity: 1 },
    { name: "Photocards", quantity: 2 },
    { name: "Folded Poster", quantity: 1 },
    { name: "Lyric Sheet", quantity: 1 },
  ],
  "cat-photocards": [
    { name: "Photocards", quantity: 7 },
    { name: "Protective Sleeve", quantity: 7 },
    { name: "Toploader", quantity: 1 },
  ],
  "cat-lightsticks": [
    { name: "Lightstick", quantity: 1 },
    { name: "Storage Case", quantity: 1 },
    { name: "Batteries", quantity: 3 },
    { name: "Manual", quantity: 1 },
  ],
  "cat-apparel": [
    { name: "Garment", quantity: 1 },
    { name: "Care Card", quantity: 1 },
    { name: "Official Hologram Tag", quantity: 1 },
  ],
  "cat-accessories": [
    { name: "Main Item", quantity: 1 },
    { name: "Dust Bag", quantity: 1 },
  ],
  "cat-official-merch": [
    { name: "Main Item", quantity: 1 },
    { name: "Photocards", quantity: 2 },
    { name: "Sticker Sheet", quantity: 1 },
  ],
};

/**
 * §30 — deterministic, seeded from the product slug so the same product always
 * shows the same tile art across renders and machines (no Math.random at render).
 */
export function inclusionsFor(categoryId: string, productSlug: string): InclusionItem[] {
  const base = BY_CATEGORY[categoryId];
  if (base === undefined) return [];
  return base.map((item) => ({
    ...item,
    image: `https://picsum.photos/seed/${productSlug}-inc-${item.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")}/300/300`,
  }));
}

/** Server Component — pure presentation over props. */
export function WhatsIncluded({ items, className }: WhatsIncludedProps) {
  // Unknown category, or a product type with nothing to unbox: show no section
  // rather than an empty "What's Included" heading, which reads as broken.
  if (items.length === 0) return null;

  return (
    <div className={className}>
      <h2 className="font-display text-heading-md text-foreground">What&rsquo;s Included</h2>

      <ul className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {items.map((item) => (
          <li
            key={item.name}
            // Craft rule 1 — double bezel, concentric 20 − 6 = 14.
            className="rounded-xl bg-surface p-1.5 ring-1 ring-foreground/5"
          >
            <div className="h-full rounded-lg bg-background p-3">
              <div className="relative aspect-square overflow-hidden rounded-md bg-surface">
                {item.image !== undefined && (
                  <Image
                    src={item.image}
                    // Decorative: the name is right below in real text, so alt
                    // would be read twice.
                    alt=""
                    fill
                    sizes="(min-width: 1024px) 18vw, 45vw"
                    className="object-cover"
                  />
                )}
              </div>

              <p className="mt-3 text-body-sm text-foreground">{item.name}</p>

              {item.quantity !== undefined && (
                <p className={cn("mt-0.5 text-caption tabular-nums text-muted")}>
                  &times;{item.quantity}
                </p>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default WhatsIncluded;
