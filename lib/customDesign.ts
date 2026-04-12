import type { Design } from "@/types";

export interface CustomDesignDraft {
  designFor: string;
  designTheme: string;
  items: string[];
}

export interface CustomDesignRecord {
  id: string;
  title: string;
  designerName: string;
  price: number;
  createdAt: string;
  imagePath: string;
  designId: number;
}

export const DEFAULT_DESIGN_CATEGORIES = [
  "Birthday Ceremony",
  "Matriculation",
  "Personal Item",
  "Fashion Show",
  "Business Promotion",
  "Retreat",
  "Workshop",
  "Game/Sport",
  "Graduation Ceremony",
  "Wedding Ceremony",
  "Naming Ceremony",
] as const;

export const DEFAULT_DESIGN_THEMES = [
  "Fun",
  "Nature",
  "Conception",
  "Abstract",
  "Minimal",
  "Typography",
  "Feminine",
  "Masculine",
  "Kiddies",
] as const;

export const DEFAULT_PRINT_ITEMS = [
  "Flier",
  "Tshirt",
  "Socks",
  "Bag",
  "Pillow",
  "Equipment",
  "Sweat shirt",
  "Flask",
  "Pen",
  "Sticker",
  "Picture Frame",
  "Hoodie",
  "Umbrella",
  "Books",
] as const;

const absoluteImage = (path?: string) => {
  if (!path) return "";
  if (path.startsWith("http")) return path;
  return `https://backend-prod-api.berrystamp.com/${path.replace(/^\/+/, "")}`;
};

export const toCustomDesignRecord = (design: Design): CustomDesignRecord => {
  const createdDate =
    design.createdAt || design.updatedAt || new Date().toISOString();
  const mockPrice = design.mocks
    .map((m) => m.price)
    .filter((price) => price > 0);
  const price = mockPrice.length ? Math.min(...mockPrice) : design.amount || 0;

  return {
    id: String(design.id),
    title: design.title,
    designerName:
      design.designerName ||
      `${design.profile.firstName} ${design.profile.lastName}`.trim() ||
      design.profile.username,
    price,
    createdAt: createdDate,
    imagePath: absoluteImage(design.imagePath),
    designId: design.id,
  };
};

export const encodeDraft = (draft: CustomDesignDraft) =>
  encodeURIComponent(JSON.stringify(draft));

export const decodeDraft = (value?: string): CustomDesignDraft | null => {
  if (!value) return null;

  try {
    const parsed = JSON.parse(decodeURIComponent(value));
    if (!parsed || typeof parsed !== "object") return null;

    return {
      designFor: typeof parsed.designFor === "string" ? parsed.designFor : "",
      designTheme:
        typeof parsed.designTheme === "string" ? parsed.designTheme : "",
      items: Array.isArray(parsed.items)
        ? parsed.items.filter(
            (item: unknown): item is string => typeof item === "string",
          )
        : [],
    };
  } catch {
    return null;
  }
};
