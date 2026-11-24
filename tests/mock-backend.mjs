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
import http from "node:http"
import { randomUUID } from "node:crypto"

const PORT = Number(process.env.MOCK_API_PORT || 8081)

const testUser = {
  email: "test@example.com",
  password: "Password123!",
}

const cities = [
  { id: "1", name: "Casablanca" },
  { id: "2", name: "Rabat" },
  { id: "3", name: "Marrakech" },
]

const categories = [
  {
    id: "c1",
    name: "Femme",
    description: "Articles pour femme",
    image: null,
    parentId: null,
    sizeGroupId: null,
    sizeGroup: null,
    subCategories: [
      {
        id: "c11",
        name: "Robes",
        description: null,
        parentId: "c1",
        subCategories: [],
      },
      {
        id: "c12",
        name: "Tops",
        description: null,
        parentId: "c1",
        subCategories: [],
      },
    ],
  },
  {
    id: "c2",
    name: "Homme",
    description: "Articles pour homme",
    image: null,
    parentId: null,
    sizeGroupId: null,
    sizeGroup: null,
    subCategories: [
      {
        id: "c21",
        name: "T-shirts",
        description: null,
        parentId: "c2",
        subCategories: [],
      },
    ],
  },
]

const categoryGroups = [{ title: "Aukci Style", items: ["c1", "c2"] }]

for (const category of categories) {
  for (const child of category.subCategories ?? []) child.sizeGroupId = "sg1"
}
categories.push(
  { id: "c3", name: "Shoes", parentId: null, sizeGroupId: "sg2", subCategories: [] },
  { id: "c4", name: "Accessories", parentId: null, sizeGroupId: null, subCategories: [] },
)

const sizes = [
  {
    id: "sg1",
    name: "Taille vêtement",
    sizes: [
      { id: "s1", name: "S", categoryId: null, sizeGroup: "sg1" },
      { id: "s2", name: "M", categoryId: null, sizeGroup: "sg1" },
      { id: "s3", name: "L", categoryId: null, sizeGroup: "sg1" },
    ],
  },
]

const sizeNames = { s1: "S", s2: "M", s3: "L" }
sizes.push({ id: "sg2", name: "Shoe sizes", sizes: [
  { id: "shoe40", name: "40", categoryId: null, sizeGroup: "sg2" },
  { id: "shoe41", name: "41", categoryId: null, sizeGroup: "sg2" },
] })
const cityNames = Object.fromEntries(cities.map((c) => [c.id, c.name]))
function findCategory(items, id) {
  for (const category of items) {
    if (category.id === id) return category
    const child = findCategory(category.subCategories ?? [], id)
    if (child) return child
  }
}

function categoryTreeIds(category) {
  return [
    category.id,
    ...(category.subCategories ?? []).flatMap(categoryTreeIds),
  ]
}

const categoryNames = Object.fromEntries(
  categories.flatMap((c) =>
    [c, ...(c.subCategories ?? [])].map((x) => [x.id, x.name]),
  ),
)

function listingSummary(listing) {
  const { id, title, price, condition, status, userId, sellerFirstName, sellerLastName,
    sellerProfileImageKey, createdAt, categoryName } = listing
  return { id, title, price, condition, status, userId, sellerFirstName, sellerLastName,
    sellerProfileImageKey, createdAt, categoryName, descriptionPreview: listing.description?.slice(0, 160) ?? null, coverAssetKey: listing.assetKeys?.[0] ?? null,
    colors: listing.colors ?? [], cityNames: listing.cityNames ?? [], sizeNames: listing.sizeNames ?? [] }
}

const favoriteIds = new Set()
const listings = [
  {
    id: "00000000-0000-4000-8000-000000000001",
    title: "Sac en cuir vintage",
    description: "Magnifique sac en cuir vintage.",
    price: 380,
    colors: ["#8B4513", "Brown"],
    contactTypes: ["DELIVERY"],
    condition: "VERY_GOOD",
    status: "AVAILABLE",
    quantity: 1,
    cityIds: ["1"],
    categoryId: "c1",
    cityNames: ["Casablanca"],
    categoryName: "Femme",
    sizeIds: [],
    sizeNames: [],
    userId: "user-1",
  },
  {
    id: "00000000-0000-4000-8000-000000000002",
    title: "Hoodie gris essentiel",
    description: null,
    price: 290,
    colors: ["Gray", "Blue"],
    contactTypes: ["MEETUP", "DELIVERY"],
    condition: "GOOD",
    status: "AVAILABLE",
    quantity: 3,
    cityIds: ["2"],
    categoryId: "c2",
    cityNames: ["Rabat"],
    categoryName: "Homme",
    sizeIds: ["s2"],
    sizeNames: ["M"],
    userId: "user-1",
  },
  {
    id: "00000000-0000-4000-8000-000000000003",
    title: "Baskets rétro",
    description: "Pointure 40, comme neuves.",
    price: 520,
    colors: ["#FFFFFF", "White"],
    contactTypes: ["PARCEL"],
    condition: "NEW_WITHOUT_TAGS",
    status: "AVAILABLE",
    quantity: 1,
    cityIds: ["1", "3"],
    categoryId: "c21",
    cityNames: ["Casablanca", "Marrakech"],
    categoryName: "T-shirts",
    sizeIds: null,
    sizeNames: null,
    userId: "user-1",
  },
]

const profile = {
  id: "user-1",
  email: testUser.email,
  firstName: "Test",
  lastName: "User",
  bio: null,
  phoneNumber: "+212600000000",
  cityId: "1",
  cityName: "Casablanca",
  createdAt: "2026-01-01T00:00:00.000Z",
}

function json(res, status, data) {
  const body =
    typeof data === "string"
      ? JSON.stringify(data)
      : JSON.stringify(data ?? null)
  res.writeHead(status, { "Content-Type": "application/json" })
  res.end(body)
}

function apiError(res, status, error, message, path) {
  json(res, status, {
    timestamp: new Date().toISOString(),
    status,
    error,
    message,
    path,
    validationErrors: [],
  })
}

async function readBody(req) {
  const chunks = []
  for await (const chunk of req) chunks.push(chunk)
  const raw = Buffer.concat(chunks).toString("utf8")
  if (!raw.trim()) return undefined
  try {
    return JSON.parse(raw)
  } catch {
    return raw
  }
}

function findListing(id) {
  return listings.find((l) => l.id === id)
}

const profileImages = new Map()
const notificationInboxes = new Map()
const offerInboxes = new Map()
const chatInboxes = new Map()

async function handle(req, res, pathname, query) {
  const route = `${req.method} ${pathname}`
  const body = await readBody(req)

  if (pathname === "/__test/chats" || pathname.startsWith("/api/chats")) {
    const token = req.headers.authorization
    if (!token?.startsWith("Bearer notification-test-"))
      return apiError(
        res,
        401,
        "ERR_UNAUTHORIZED",
        "Invalid access token",
        pathname,
      )
    if (route === "POST /__test/chats") {
      chatInboxes.set(token, { ...body, calls: [] })
      return json(res, 200, {})
    }
    const state = chatInboxes.get(token) || {
      chats: [],
      messages: [],
      calls: [],
    }
    if (route === "GET /__test/chats") return json(res, 200, state)
    const sort = (items) =>
      [...items].sort(
        (a, b) =>
          Date.parse(b.createdAt) - Date.parse(a.createdAt) ||
          b.id.localeCompare(a.id),
      )
    const paginate = (items) => {
      const page = Number(query.get("page") || 0)
      const size = Number(query.get("size") || 20)
      return {
        items: items.slice(page * size, (page + 1) * size),
        page,
        size,
        totalElements: items.length,
        totalPages: Math.ceil(items.length / size),
      }
    }
    const summary = (chat) => ({
      ...chat,
      listingCoverAssetKey: chat.listingCoverAssetKey ?? null,
      lastMessage:
        sort(
          state.messages.filter((message) => message.chatId === chat.id),
        )[0] || null,
    })
    if (route === "GET /api/chats") {
      const chats = state.chats
        .map(summary)
        .sort(
          (a, b) =>
            Date.parse(b.lastMessage?.createdAt || b.createdAt) -
              Date.parse(a.lastMessage?.createdAt || a.createdAt) ||
            b.id.localeCompare(a.id),
        )
      return json(res, 200, paginate(chats))
    }
    const match = pathname.match(/^\/api\/chats\/([^/]+)(\/messages)?$/)
    const chat = state.chats.find((item) => item.id === match?.[1])
    if (!chat)
      return apiError(
        res,
        404,
        "ERR_RESOURCE_NOT_FOUND",
        "Chat not found",
        pathname,
      )
    if (req.method === "GET")
      return json(
        res,
        200,
        match[2]
          ? paginate(
              sort(
                state.messages.filter((message) => message.chatId === chat.id),
              ),
            )
          : summary(chat),
      )
    if (req.method === "POST" && match[2]) {
      state.calls.push(body)
      if (state.failNext) {
        state.failNext = false
        return apiError(res, 503, "NETWORK_ERROR", "Try again", pathname)
      }
      const message = {
        id: randomUUID(),
        chatId: chat.id,
        senderId: state.senderId,
        content: body.content,
        system: false,
        systemType: null,
        params: null,
        createdAt: new Date().toISOString(),
      }
      state.messages.push(message)
      return json(res, 201, message)
    }
  }

  const decisionMatch = pathname.match(
    /^\/api\/listings\/([^/]+)\/offers\/([^/]+)\/(accept|refuse)$/,
  )
  if (
    pathname === "/__test/offers" ||
    /^\/api\/offers\/(sent|received)$/.test(pathname) ||
    decisionMatch
  ) {
    const token = req.headers.authorization
    if (
      !token?.startsWith("Bearer notification-test-") &&
      token !== "Bearer mock-access-token"
    ) {
      return apiError(
        res,
        401,
        "ERR_UNAUTHORIZED",
        "Invalid access token",
        pathname,
      )
    }
    if (route === "POST /__test/offers") {
      offerInboxes.set(token, {
        items: body.items,
        failNext: body.failNext || false,
        staleNext: body.staleNext || false,
        delay: body.delay || 0,
        calls: [],
      })
      return json(res, 200, {})
    }
    const state = offerInboxes.get(token) || { items: [], calls: [] }
    if (route === "GET /__test/offers") return json(res, 200, state)
    if (req.method === "GET" && pathname.startsWith("/api/offers/")) {
      const direction = pathname.split("/").at(-1)
      return json(
        res,
        200,
        state.items.filter(
          (item) => (item.direction || "received") === direction,
        ),
      )
    }
    if (req.method === "PUT" && decisionMatch) {
      const [, listingId, offerId, action] = decisionMatch
      const item = state.items.find(
        (item) =>
          item.offer.id === offerId && item.offer.listingId === listingId,
      )
      if (!item)
        return apiError(
          res,
          404,
          "ERR_RESOURCE_NOT_FOUND",
          "Offer not found",
          pathname,
        )
      if (item.direction === "sent")
        return apiError(
          res,
          401,
          "ERR_UNAUTHORIZED",
          "Only the owner can respond",
          pathname,
        )
      state.calls.push({ listingId, offerId, action })
      if (state.delay)
        await new Promise((resolve) => setTimeout(resolve, state.delay))
      if (state.failNext) {
        state.failNext = false
        return apiError(
          res,
          500,
          "ERR_INTERNAL_SERVER_ERROR",
          "Try again",
          pathname,
        )
      }
      if (state.staleNext) {
        state.staleNext = false
        item.offer.status = "ACCEPTED"
        return apiError(
          res,
          400,
          "ERR_OFFER_NOT_PENDING",
          "Offer already answered",
          pathname,
        )
      }
      const status = action === "accept" ? "ACCEPTED" : "REFUSED"
      if (item.offer.status !== "PENDING" && item.offer.status !== status) {
        return apiError(
          res,
          400,
          "ERR_OFFER_NOT_PENDING",
          "Offer already answered",
          pathname,
        )
      }
      item.offer.status = status
      return json(res, 200, item.offer)
    }
  }

  if (
    pathname === "/__test/notifications" ||
    pathname.startsWith("/api/notifications")
  ) {
    const token = req.headers.authorization
    if (
      !token ||
      (!["Bearer mock-access-token", "Bearer refreshed-access-token"].includes(
        token,
      ) &&
        !token.startsWith("Bearer notification-test-"))
    ) {
      return apiError(
        res,
        401,
        "ERR_UNAUTHORIZED",
        "Invalid access token",
        pathname,
      )
    }
    const inbox = notificationInboxes.get(token) || []
    if (route === "POST /__test/notifications") {
      notificationInboxes.set(token, body)
      return json(res, 200, {})
    }
    if (route === "GET /api/notifications") {
      const page = Number(query.get("page") || 0)
      const size = Number(query.get("size") || 20)
      const unread = inbox.filter((item) => !item.readAt)
      const items = (
        query.get("unreadOnly") === "true" ? unread : [...inbox]
      ).sort(
        (a, b) =>
          Date.parse(b.createdAt) - Date.parse(a.createdAt) ||
          b.id.localeCompare(a.id),
      )
      return json(res, 200, {
        items: items.slice(page * size, (page + 1) * size),
        page,
        size,
        totalElements: items.length,
        totalPages: Math.ceil(items.length / size),
        unreadCount: unread.length,
      })
    }
    if (route === "GET /api/notifications/unread-count")
      return json(res, 200, {
        unreadCount: inbox.filter((item) => !item.readAt).length,
      })
    if (route === "PUT /api/notifications/read-all") {
      for (const item of inbox) item.readAt ||= new Date().toISOString()
      res.writeHead(204)
      return res.end()
    }
    const read = pathname.match(/^\/api\/notifications\/([^/]+)\/read$/)
    if (read && req.method === "PUT") {
      const item = inbox.find((item) => item.id === read[1])
      if (!item)
        return apiError(
          res,
          404,
          "NOT_FOUND",
          "Notification not found",
          pathname,
        )
      item.readAt ||= new Date().toISOString()
      return json(res, 200, item)
    }
  }

  const favoriteMatch = pathname.match(/^\/api\/listings\/([^/]+)\/favorite$/)
  const listsFavorites = route === "GET /api/listings/favorites"
  if (
    listsFavorites ||
    (favoriteMatch && ["POST", "DELETE"].includes(req.method))
  ) {
    if (
      !["Bearer mock-access-token", "Bearer refreshed-access-token"].includes(
        req.headers.authorization,
      ) &&
      !req.headers.authorization?.startsWith("Bearer notification-test-")
    ) {
      return apiError(
        res,
        401,
        "ERR_UNAUTHORIZED",
        "Invalid access token",
        pathname,
      )
    }

    if (listsFavorites) {
      return json(res, 200, [...favoriteIds].reverse().map(findListing).filter(Boolean).map(listingSummary))
    }

    const id = favoriteMatch[1]
    if (!findListing(id)) {
      return apiError(res, 404, "NOT_FOUND", "Listing not found", pathname)
    }

    if (req.method === "POST") {
      favoriteIds.add(id)
    } else {
      favoriteIds.delete(id)
    }
    res.writeHead(200)
    return res.end()
  }

  switch (route) {
    case "GET /healthz":
      return json(res, 200, { ok: true })

    case "POST /api/auth/login": {
      if (
        body?.email === testUser.email &&
        body?.password === testUser.password
      ) {
        return json(res, 200, {
          accessToken: "mock-access-token",
          refreshToken: "mock-refresh-token",
          idToken: "mock-id-token",
          expiresIn: 3600,
          tokenType: "Bearer",
        })
      }
      return apiError(
        res,
        401,
        "ERR_UNAUTHORIZED",
        "Invalid credentials",
        "/api/auth/login",
      )
    }

    case "POST /api/auth/refresh":
      if (body?.refreshToken !== "mock-refresh-token") {
        return apiError(
          res,
          401,
          "ERR_UNAUTHORIZED",
          "Invalid refresh token",
          pathname,
        )
      }
      return json(res, 200, {
        accessToken: "refreshed-access-token",
        idToken: "refreshed-id-token",
        refreshToken: null,
        expiresIn: 3600,
        tokenType: "Bearer",
      })

    case "POST /api/auth/confirm-email":
      if (body?.pin !== "012345") return apiError(res, 400, "ERR_INVALID_VERIFICATION_PIN", "Invalid or expired PIN", pathname)
      return json(res, 200, "Email verified")

    case "POST /api/auth/resend-confirmation":
      return json(res, 200, "Confirmation sent")

    case "POST /api/auth/signup":
      return json(res, 200, "Registration successful")

    case "GET /api/profile":
      if (
        !["Bearer mock-access-token", "Bearer refreshed-access-token"].includes(
          req.headers.authorization,
        ) &&
        !req.headers.authorization?.startsWith("Bearer notification-test-")
      ) {
        return apiError(
          res,
          401,
          "ERR_UNAUTHORIZED",
          "Invalid access token",
          pathname,
        )
      }
      return json(res, 200, {
        ...profile,
        profileImageKey: profileImages.get(req.headers.authorization) ?? null,
        id: chatInboxes.get(req.headers.authorization)?.senderId || profile.id,
      })

    case "POST /api/profile/image": {
      if (!req.headers.authorization) return apiError(res, 401, "ERR_UNAUTHORIZED", "Unauthorized", pathname)
      if (typeof body !== "string" || !body.includes('name="image"')) return apiError(res, 400, "ERR_BAD_REQUEST", "Missing image", pathname)
      if (body.includes('filename="fail.png"')) return apiError(res, 503, "ERR_STORAGE", "Storage unavailable", pathname)
      const key = `00000000-0000-4000-8000-000000000001/profile/${randomUUID()}.png`
      profileImages.set(req.headers.authorization, key)
      return json(res, 200, { ...profile, profileImageKey: key })
    }

    case "PUT /api/profile": {
      const updated = {
        ...profile,
        ...(typeof body === "object" && body ? body : {}),
        id: profile.id,
        email: profile.email,
      }
      if (updated.city && typeof updated.city === "object") {
        updated.cityId = updated.city.id ?? updated.cityId
        updated.cityName = updated.city.name ?? updated.cityName
      }
      delete updated.city
      return json(res, 200, updated)
    }

    case "GET /api/profile/onboarding-status":
      return json(res, 200, {
        accountCreated: true,
        additionalDataAdded: true,
        preferencesAdded: true,
        publishedSomething: false,
      })

    case "GET /api/profile/preferences":
      return json(res, 200, { categoryIds: ["c1", "c11"], gender: null })

    case "POST /api/profile/preferences":
      res.writeHead(204)
      return res.end()

    case "GET /api/categories":
      return json(res, 200, categories)

    case "GET /api/categories/groups":
      return json(res, 200, categoryGroups)

    case "GET /api/cities":
      return json(res, 200, cities)

    case "GET /api/sizes":
      return json(res, 200, sizes)

    case "GET /api/listings/pending": {
      if (
        !["Bearer mock-access-token", "Bearer refreshed-access-token"].includes(
          req.headers.authorization,
        ) &&
        !req.headers.authorization?.startsWith("Bearer notification-test-")
      ) {
        return apiError(
          res,
          401,
          "ERR_UNAUTHORIZED",
          "Invalid access token",
          pathname,
        )
      }

      const page = Number(query.get("page") ?? "0")
      const size = Number(query.get("size") ?? "12")
      const pendingListings = [
        {
          ...listings[0],
          id: "00000000-0000-4000-8000-000000000099",
          title: "Veste en cours de traitement",
          status: "PENDING",
        },
      ]
      return json(
        res,
        200,
        pendingListings.slice(page * size, (page + 1) * size).map(listingSummary),
      )
    }

    case "GET /api/listings/search": {
      const page = Number(query.get("page") ?? "0")
      const size = Number(query.get("size") ?? "12")
      const term = (query.get("query") ?? "").trim().toLowerCase()
      const selected = (key) => query.getAll(key).flatMap((value) => value.split(",")).filter(Boolean)
      const colors = selected("colors").map((color) => color.trim().toLowerCase())
      const cityIds = selected("cityIds")
      const sizeIds = selected("sizeIds")
      const contactTypes = selected("contactTypes")
      const categoryId = query.get("categoryId")
      const category = findCategory(categories, categoryId)
      const categoryIds =
        category && query.get("includeSubcategories") === "true"
          ? categoryTreeIds(category)
          : [categoryId]
      const conditions = selected("conditions")
      const minPrice = Number(query.get("minPrice") ?? 0)
      const maxPrice = Number(query.get("maxPrice") ?? Infinity)
      const matches = listings.filter(
        (listing) =>
          listing.status === "AVAILABLE" &&
          `${listing.title} ${listing.description ?? ""}`
            .toLowerCase()
            .includes(term) &&
          (!colors.length || listing.colors?.some((color) => colors.includes(color.toLowerCase()))) &&
          (!cityIds.length || cityIds.some((id) => listing.cityIds.includes(id))) &&
          (!categoryId || categoryIds.includes(listing.categoryId)) &&
          (!conditions.length || conditions.includes(listing.condition)) &&
          (!sizeIds.length || sizeIds.some((id) => listing.sizeIds?.includes(id))) &&
          (!contactTypes.length || contactTypes.some((type) => listing.contactTypes.includes(type))) &&
          listing.price >= minPrice &&
          listing.price <= maxPrice,
      )
      return json(res, 200, matches.slice(page * size, (page + 1) * size).map(listingSummary))
    }

    case "GET /api/listings": {
      const page = Number(query.get("page") ?? "0")
      const size = Number(query.get("size") ?? "12")
      const start = page * size
      const content = listings.slice(start, start + size).map(listingSummary)
      return json(res, 200, {
        content,
        totalPages: Math.max(1, Math.ceil(listings.length / size)),
        totalElements: listings.length,
        size,
        number: page,
      })
    }

    case "POST /api/listings": {
      const input = typeof body === "object" && body ? body : {}
      const listing = {
        id: randomUUID(),
        title: input.title ?? "Untitled",
        description: input.description ?? null,
        price: input.price ?? 0,
        colors: input.colors ?? null,
        contactTypes: input.contactTypes ?? ["DELIVERY"],
        condition: input.condition ?? "GOOD",
        status: input.status ?? "AVAILABLE",
        quantity: input.quantity ?? 1,
        cityIds:
          input.cityIds ??
          (Array.isArray(input.cities) ? input.cities.map((c) => c.id) : []),
        categoryId: input.categoryId ?? input.category?.id ?? "c1",
        cityNames: (input.cityIds ?? [])
          .map((id) => cityNames[id])
          .filter(Boolean),
        categoryName:
          categoryNames[input.categoryId ?? input.category?.id] ?? null,
        sizeIds:
          input.sizeIds ??
          (Array.isArray(input.sizes) ? input.sizes.map((s) => s.id) : []),
        sizeNames: (input.sizeIds ?? [])
          .map((id) => sizeNames[id])
          .filter(Boolean),
        userId: profile.id,
      }
      listings.push(listing)
      return json(res, 200, listing)
    }

    default:
      break
  }

  const listingMatch = pathname.match(/^\/api\/listings\/([^/]+)$/)
  if (listingMatch) {
    const id = decodeURIComponent(listingMatch[1])
    const listing = findListing(id)

    if (req.method === "GET") {
      if (!listing) {
        return apiError(res, 404, "NOT_FOUND", "Listing not found", pathname)
      }
      return json(res, 200, listing)
    }

    if (req.method === "PUT") {
      if (!listing) {
        return apiError(res, 404, "NOT_FOUND", "Listing not found", pathname)
      }
      const input = typeof body === "object" && body ? body : {}
      const updated = {
        ...listing,
        ...input,
        id: listing.id,
        cityIds:
          input.cityIds ??
          (Array.isArray(input.cities)
            ? input.cities.map((c) => c.id)
            : listing.cityIds),
        categoryId:
          input.categoryId ?? input.category?.id ?? listing.categoryId,
        sizeIds:
          input.sizeIds ??
          (Array.isArray(input.sizes)
            ? input.sizes.map((s) => s.id)
            : listing.sizeIds),
      }
      delete updated.category
      delete updated.cities
      delete updated.sizes
      Object.assign(listing, updated)
      return json(res, 200, listing)
    }

    if (req.method === "DELETE") {
      const index = listings.findIndex((l) => l.id === id)
      if (index === -1) {
        return apiError(res, 404, "NOT_FOUND", "Listing not found", pathname)
      }
      listings.splice(index, 1)
      favoriteIds.delete(id)
      res.writeHead(204)
      return res.end()
    }
  }

  return apiError(res, 404, "NOT_FOUND", `No mock route for ${route}`, pathname)
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url ?? "/", `http://localhost:${PORT}`)
  handle(req, res, url.pathname, url.searchParams).catch((error) => {
    // Never crash the mock; surface JSON errors that match the backend shape.
    console.error("[mock-backend] unhandled error:", error)
    if (!res.headersSent) {
      apiError(res, 500, "MOCK_ERROR", "Mock backend error", url.pathname)
    } else {
      res.end()
    }
  })
})

// Node's default keepAliveTimeout (5s) lets the server close an idle
// keep-alive socket right before a client (Next's fetch) reuses it, which
// surfaces as sporadic ECONNRESET in the client. Keep sockets open longer
// than any realistic test idle gap, and headersTimeout above that.
server.keepAliveTimeout = 90_000
server.headersTimeout = 95_000

server.listen(PORT, () => {
  console.log(`[mock-backend] listening on http://localhost:${PORT}`)
})
