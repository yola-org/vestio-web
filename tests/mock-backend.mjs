/**
 * Mock backend for e2e tests.
 *
 * All backend calls in this app are made by Server Actions on the Next.js
 * server (see src/lib/api/request.ts), so they cannot be intercepted by
 * Playwright's page.route(). Instead this standalone HTTP server implements
 * the backend contract (shapes follow src/lib/api/schemas.ts) and the Next
 * server is started with API_URL pointing at it — see playwright.config.ts.
 *
 * Plain Node (no dependencies) so it can run anywhere with `node`.
 */
import http from 'node:http';
import { randomUUID } from 'node:crypto';

const PORT = Number(process.env.MOCK_API_PORT || 8081);

const testUser = {
  email: 'test@example.com',
  password: 'Password123!',
};

const cities = [
  { id: '1', name: 'Casablanca' },
  { id: '2', name: 'Rabat' },
  { id: '3', name: 'Marrakech' },
];

const categories = [
  {
    id: 'c1',
    name: 'Femme',
    description: 'Articles pour femme',
    image: null,
    parentId: null,
    sizeGroupId: null,
    sizeGroup: null,
    subCategories: [
      { id: 'c11', name: 'Robes', description: null, parentId: 'c1', subCategories: [] },
      { id: 'c12', name: 'Tops', description: null, parentId: 'c1', subCategories: [] },
    ],
  },
  {
    id: 'c2',
    name: 'Homme',
    description: 'Articles pour homme',
    image: null,
    parentId: null,
    sizeGroupId: null,
    sizeGroup: null,
    subCategories: [
      { id: 'c21', name: 'T-shirts', description: null, parentId: 'c2', subCategories: [] },
    ],
  },
];

const categoryGroups = [
  { title: 'Aukci Style', items: ['c1', 'c2'] },
];

const sizes = [
  {
    id: 'sg1',
    name: 'Taille vêtement',
    sizes: [
      { id: 's1', name: 'S', categoryId: null, sizeGroup: 'sg1' },
      { id: 's2', name: 'M', categoryId: null, sizeGroup: 'sg1' },
      { id: 's3', name: 'L', categoryId: null, sizeGroup: 'sg1' },
    ],
  },
];

const sizeNames = { s1: 'S', s2: 'M', s3: 'L' };
const cityNames = Object.fromEntries(cities.map((c) => [c.id, c.name]));
const categoryNames = Object.fromEntries(
  categories.flatMap((c) => [c, ...(c.subCategories ?? [])].map((x) => [x.id, x.name]))
);

let nextListingId = 4;
const listings = [
  {
    id: '1',
    title: 'Sac en cuir vintage',
    description: 'Magnifique sac en cuir vintage.',
    price: 380,
    colors: ['#8B4513'],
    contactTypes: ['WHATSAPP'],
    condition: 'VERY_GOOD',
    status: 'AVAILABLE',
    quantity: 1,
    cityIds: ['1'],
    categoryId: 'c1',
    cityNames: ['Casablanca'],
    categoryName: 'Femme',
    sizeIds: [],
    sizeNames: [],
    userId: 'user-1',
  },
  {
    id: '2',
    title: 'Hoodie gris essentiel',
    description: null,
    price: 290,
    colors: null,
    contactTypes: ['PHONE', 'WHATSAPP'],
    condition: 'GOOD',
    status: 'AVAILABLE',
    quantity: 3,
    cityIds: ['2'],
    categoryId: 'c2',
    cityNames: ['Rabat'],
    categoryName: 'Homme',
    sizeIds: ['s2'],
    sizeNames: ['M'],
    userId: 'user-1',
  },
  {
    id: '3',
    title: 'Baskets rétro',
    description: 'Pointure 40, comme neuves.',
    price: 520,
    colors: ['#FFFFFF'],
    contactTypes: ['CHAT'],
    condition: 'NEW_WITHOUT_TAG',
    status: 'AVAILABLE',
    quantity: 1,
    cityIds: ['1', '3'],
    categoryId: 'c21',
    cityNames: ['Casablanca', 'Marrakech'],
    categoryName: 'T-shirts',
    sizeIds: null,
    sizeNames: null,
    userId: 'user-1',
  },
];

const profile = {
  id: 'user-1',
  email: testUser.email,
  firstName: 'Test',
  lastName: 'User',
  bio: null,
  phoneNumber: '+212600000000',
  cityId: '1',
  cityName: 'Casablanca',
  createdAt: '2026-01-01T00:00:00.000Z',
};

function json(res, status, data) {
  const body = typeof data === 'string' ? JSON.stringify(data) : JSON.stringify(data ?? null);
  res.writeHead(status, { 'Content-Type': 'application/json' });
  res.end(body);
}

function apiError(res, status, error, message, path) {
  json(res, status, {
    timestamp: new Date().toISOString(),
    status,
    error,
    message,
    path,
    validationErrors: [],
  });
}

async function readBody(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const raw = Buffer.concat(chunks).toString('utf8');
  if (!raw.trim()) return undefined;
  try {
    return JSON.parse(raw);
  } catch {
    return raw;
  }
}

function findListing(id) {
  return listings.find((l) => l.id === id);
}

async function handle(req, res, pathname, query) {
  const route = `${req.method} ${pathname}`;
  const body = await readBody(req);

  switch (route) {
    case 'GET /healthz':
      return json(res, 200, { ok: true });

    case 'POST /api/auth/login': {
      if (body?.email === testUser.email && body?.password === testUser.password) {
        return json(res, 200, {
          accessToken: 'mock-access-token',
          refreshToken: 'mock-refresh-token',
          idToken: 'mock-id-token',
          expiresIn: 3600,
          tokenType: 'Bearer',
        });
      }
      return apiError(res, 401, 'ERR_UNAUTHORIZED', 'Invalid credentials', '/api/auth/login');
    }

    case 'POST /api/auth/signup':
      return json(res, 200, 'Registration successful');

    case 'GET /api/profile':
      return json(res, 200, profile);

    case 'PUT /api/profile': {
      const updated = {
        ...profile,
        ...(typeof body === 'object' && body ? body : {}),
        id: profile.id,
        email: profile.email,
      };
      if (updated.city && typeof updated.city === 'object') {
        updated.cityId = updated.city.id ?? updated.cityId;
        updated.cityName = updated.city.name ?? updated.cityName;
      }
      delete updated.city;
      return json(res, 200, updated);
    }

    case 'GET /api/profile/onboarding-status':
      return json(res, 200, {
        accountCreated: true,
        additionalDataAdded: true,
        preferencesAdded: true,
        publishedSomething: false,
      });

    case 'GET /api/profile/preferences':
      return json(res, 200, { categoryIds: ['c1', 'c11'], gender: null });

    case 'POST /api/profile/preferences':
      res.writeHead(204);
      return res.end();

    case 'GET /api/categories':
      return json(res, 200, categories);

    case 'GET /api/categories/groups':
      return json(res, 200, categoryGroups);

    case 'GET /api/cities':
      return json(res, 200, cities);

    case 'GET /api/sizes':
      return json(res, 200, sizes);

    case 'GET /api/listings': {
      const page = Number(query.get('page') ?? '0');
      const size = Number(query.get('size') ?? '12');
      const start = page * size;
      const content = listings.slice(start, start + size);
      return json(res, 200, {
        content,
        totalPages: Math.max(1, Math.ceil(listings.length / size)),
        totalElements: listings.length,
        size,
        number: page,
      });
    }

    case 'POST /api/listings': {
      const input = typeof body === 'object' && body ? body : {};
      const listing = {
        id: String(nextListingId++),
        title: input.title ?? 'Untitled',
        description: input.description ?? null,
        price: input.price ?? 0,
        colors: input.colors ?? null,
        contactTypes: input.contactTypes ?? ['WHATSAPP'],
        condition: input.condition ?? 'GOOD',
        status: input.status ?? 'AVAILABLE',
        quantity: input.quantity ?? 1,
        cityIds: input.cityIds ?? (Array.isArray(input.cities) ? input.cities.map((c) => c.id) : []),
        categoryId: input.categoryId ?? input.category?.id ?? 'c1',
        cityNames: (input.cityIds ?? []).map((id) => cityNames[id]).filter(Boolean),
        categoryName: categoryNames[input.categoryId ?? input.category?.id] ?? null,
        sizeIds: input.sizeIds ?? (Array.isArray(input.sizes) ? input.sizes.map((s) => s.id) : []),
        sizeNames: (input.sizeIds ?? []).map((id) => sizeNames[id]).filter(Boolean),
        userId: profile.id,
      };
      listings.push(listing);
      return json(res, 200, listing);
    }

    default:
      break;
  }

  const listingMatch = pathname.match(/^\/api\/listings\/([^/]+)$/);
  if (listingMatch) {
    const id = decodeURIComponent(listingMatch[1]);
    const listing = findListing(id);

    if (req.method === 'GET') {
      if (!listing) {
        return apiError(res, 404, 'NOT_FOUND', 'Listing not found', pathname);
      }
      return json(res, 200, listing);
    }

    if (req.method === 'PUT') {
      if (!listing) {
        return apiError(res, 404, 'NOT_FOUND', 'Listing not found', pathname);
      }
      const input = typeof body === 'object' && body ? body : {};
      const updated = {
        ...listing,
        ...input,
        id: listing.id,
        cityIds: input.cityIds ?? (Array.isArray(input.cities) ? input.cities.map((c) => c.id) : listing.cityIds),
        categoryId: input.categoryId ?? input.category?.id ?? listing.categoryId,
        sizeIds: input.sizeIds ?? (Array.isArray(input.sizes) ? input.sizes.map((s) => s.id) : listing.sizeIds),
      };
      delete updated.category;
      delete updated.cities;
      delete updated.sizes;
      Object.assign(listing, updated);
      return json(res, 200, listing);
    }

    if (req.method === 'DELETE') {
      const index = listings.findIndex((l) => l.id === id);
      if (index === -1) {
        return apiError(res, 404, 'NOT_FOUND', 'Listing not found', pathname);
      }
      listings.splice(index, 1);
      res.writeHead(204);
      return res.end();
    }
  }

  return apiError(res, 404, 'NOT_FOUND', `No mock route for ${route}`, pathname);
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url ?? '/', `http://localhost:${PORT}`);
  handle(req, res, url.pathname, url.searchParams).catch((error) => {
    // Never crash the mock; surface JSON errors that match the backend shape.
    console.error('[mock-backend] unhandled error:', error);
    if (!res.headersSent) {
      apiError(res, 500, 'MOCK_ERROR', 'Mock backend error', url.pathname);
    } else {
      res.end();
    }
  });
});

// Node's default keepAliveTimeout (5s) lets the server close an idle
// keep-alive socket right before a client (Next's fetch) reuses it, which
// surfaces as sporadic ECONNRESET in the client. Keep sockets open longer
// than any realistic test idle gap, and headersTimeout above that.
server.keepAliveTimeout = 90_000;
server.headersTimeout = 95_000;

server.listen(PORT, () => {
  console.log(`[mock-backend] listening on http://localhost:${PORT}`);
});
