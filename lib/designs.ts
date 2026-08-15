import { Artist, Design, Mock } from "@/types";

const API_BASE_URL = "https://berrystamp-backend.onrender.app";

interface BackendImage {
  url?: string;
  path?: string;
}

interface BackendDesigner {
  id?: number;
  name?: string;
  userName?: string;
  profileImage?: BackendImage | null;
  profilePic?: string | null;
}

interface BackendMock {
  id: number;
  name?: string;
  category?: string;
  image?: BackendImage | null;
  imageUrl?: string;
  availableQty?: number;
  colours?: string[];
  sizes?: string[];
}


interface BackendDesign {
  id: number;
  name?: string;
  title?: string;
  description?: string;
  slug?: string;
  coverImage?: BackendImage | null;
  imageUrlFront?: string;
  designer?: BackendDesigner | null;
  profile?: {
    id?: number;
    firstName?: string;
    lastName?: string;
    username?: string;
    profilePicturePath?: string;
  } | null;
  mocks?: BackendMock[];
  amount?: number;
  tags?: string[];
  categories?: string[];
  designIsLiked?: boolean;
  liked?: boolean;
  likes?: number;
  views?: number;
  createdDate?: string;
  createdAt?: string;
  updatedAt?: string;
}

function toAbsoluteUrl(value?: string | null) {
  if (!value) return "";
  if (value.startsWith("http")) return value;
  return `${API_BASE_URL}/${value.replace(/^\/+/, "")}`;
}

function splitDisplayName(displayName?: string) {
  const safeName = (displayName || "").trim();

  if (!safeName) {
    return {
      firstName: "Berry",
      lastName: "Designer",
    };
  }

  const [firstName, ...rest] = safeName.split(/\s+/);

  return {
    firstName,
    lastName: rest.join(" ") || "Designer",
  };
}

export function normalizeArtist(input?: BackendDesigner | null): Artist {
  const displayName = input?.name || input?.userName || "Berry Designer";
  const { firstName, lastName } = splitDisplayName(displayName);
  const profilePicturePath =
    input?.profileImage?.url || input?.profilePic || undefined;

  return {
    id: input?.id || 0,
    firstName,
    lastName,
    username: input?.userName || displayName,
    shopName: input?.name || input?.userName || displayName,
    profilePicturePath: profilePicturePath
      ? toAbsoluteUrl(profilePicturePath)
      : undefined,
    rating: 5,
    totalDesigns: 0,
    bio: "",
    location: "",
    profileType: "DESIGNER",
  };
}

export function normalizeMock(mock: BackendMock, amount = 0): Mock {
  return {
    id: mock.id,
    name: mock.name || "Mock",
    category: mock.category || "",
    imagePath: toAbsoluteUrl(
      mock.image?.url || mock.image?.path || mock.imageUrl || "",
    ),
    price: amount,
    available: (mock.availableQty || 0) > 0,
    availableQty: mock.availableQty,
    colours: mock.colours || [],
    sizes: mock.sizes || [],
  };
}

export function normalizeDesign(input: BackendDesign): Design {
  const profile = input.profile
    ? {
      id: input.profile.id || input.designer?.id || 0,
      firstName:
        input.profile.firstName ||
        splitDisplayName(input.profile.username).firstName,
      lastName:
        input.profile.lastName ||
        splitDisplayName(input.profile.username).lastName,
      username:
        input.profile.username ||
        `${input.profile.firstName || ""} ${input.profile.lastName || ""}`.trim(),
      profilePicturePath: input.profile.profilePicturePath,
    }
    : (() => {
      const artist = normalizeArtist(input.designer);
      return {
        id: artist.id,
        firstName: artist.firstName,
        lastName: artist.lastName,
        username: artist.username,
        profilePicturePath: artist.profilePicturePath,
      };
    })();

  const imagePath = toAbsoluteUrl(
    input.imageUrlFront ||
    input.coverImage?.url ||
    input.coverImage?.path ||
    "",
  );
  const title = input.title || input.name || "Untitled design";
  const amount = input.amount || 0;

  return {
    id: input.id,
    title,
    description: input.description || title,
    slug: input.slug || String(input.id),
    imagePath,
    category: input.categories?.[0] || "Design",
    liked: input.designIsLiked ?? input.liked ?? false,
    likes: input.likes || 0,
    views: input.views || 0,
    mocks: (input.mocks || []).map((mock) => normalizeMock(mock, amount)),
    profile,
    createdAt: input.createdDate || input.createdAt || "",
    updatedAt: input.updatedAt || input.createdDate || input.createdAt || "",
    amount,
    tags: input.tags || [],
    categories: input.categories || [],
    designerId: input.designer?.id || profile.id,
    designerName:
      input.designer?.name ||
      input.designer?.userName ||
      `${profile.firstName} ${profile.lastName}`.trim(),
    designerShopName: input.designer?.name || input.designer?.userName,
  };
}

export function normalizeDesignListResponse(response: any): Design[] {
  const content =
    response?.responseBody?.content ||
    response?.content ||
    response?.data ||
    response ||
    [];
  const list = Array.isArray(content) ? content : [];
  return list.map((item) => normalizeDesign(item));
}

export function extractArtistsFromDesigns(designs: Design[]): Artist[] {
  const artists = new Map<number, Artist>();
  const counts = new Map<number, number>();

  designs.forEach((design) => {
    const artistId = design.designerId || design.profile.id;
    if (!artistId) return;

    counts.set(artistId, (counts.get(artistId) || 0) + 1);

    if (!artists.has(artistId)) {
      artists.set(artistId, {
        id: artistId,
        firstName: design.profile.firstName,
        lastName: design.profile.lastName,
        username: design.designerName || design.profile.username,
        shopName:
          design.designerShopName ||
          design.designerName ||
          design.profile.username,
        profilePicturePath: design.profile.profilePicturePath,
        rating: 5,
        totalDesigns: 0,
        bio: "",
        location: "",
        profileType: "DESIGNER",
      });
    }
  });

  return Array.from(artists.values()).map((artist) => ({
    ...artist,
    totalDesigns: counts.get(artist.id) || 0,
  }));
}

export function buildSearchParams(
  filters: Record<string, string | number | undefined | null>,
) {
  const params = new URLSearchParams();

  Object.entries(filters).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") {
      return;
    }
    params.append(key, String(value));
  });

  return params.toString();
}
