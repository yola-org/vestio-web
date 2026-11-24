import {
  expect,
  test,
  type APIRequestContext,
  type Page,
} from "@playwright/test"
import { randomUUID } from "node:crypto"

const backend = "http://localhost:8081"

test.describe.configure({ mode: "serial" })

async function session(page: Page, token = "mock-access-token") {
  await page.context().addCookies([
    { name: "vestio_locale", value: "en", domain: "localhost", path: "/" },
    {
      name: "vestio_authenticated",
      value: "1",
      domain: "localhost",
      path: "/",
    },
    { name: "vestio_token", value: token, domain: "localhost", path: "/" },
  ])
}

async function seed(
  request: APIRequestContext,
  count: number,
  status = "AVAILABLE",
) {
  const prefix = `Pagination-${randomUUID()}`
  const items: {
    id: string
    title: string
  }[] = []
  for (let index = 0; index < count; index++) {
    const title = `${prefix}-${String(index).padStart(2, "0")}`
    const response = await request.post(`${backend}/api/listings`, {
      data: {
        title,
        status,
        price: 100,
        cityIds: ["1"],
        categoryId: "c1",
        colors: [index < 7 ? "Blue" : "Red"],
      },
    })
    items.push(await response.json())
  }
  return { prefix, items }
}

async function cleanup(request: APIRequestContext, items: { id: string }[]) {
  for (const { id } of items)
    await request.delete(`${backend}/api/listings/${id}`)
}

test("search pages preserve filters, stop at the last page, and recover stale URLs", async ({
  page,
  request,
}) => {
  const { prefix, items } = await seed(request, 13)
  try {
    await session(page)
    await page.goto(`/search?query=${prefix}&cityIds=1`)
    const pagination = page.getByRole("navigation", {
      name: "Pagination",
      exact: true,
    })
    await expect(
      page.getByRole("img", { name: items[0].title, exact: true }),
    ).toBeVisible()
    await pagination
      .getByRole("link", { name: "Next page", exact: true })
      .click()
    await expect(page).toHaveURL(new RegExp(`query=${prefix}&cityIds=1&page=1`))
    await expect(
      page.getByRole("img", { name: items[12].title, exact: true }),
    ).toBeVisible()
    await expect(
      page.getByRole("img", { name: items[0].title, exact: true }),
    ).toHaveCount(0)
    await expect(
      pagination.getByRole("button", { name: "Next page", exact: true }),
    ).toBeDisabled()
    await pagination
      .getByRole("link", { name: "Previous page", exact: true })
      .click()
    await expect(page).not.toHaveURL(/page=/)
    await page.goto(`/search?query=${prefix}&cityIds=1&colors=Blue`)
    await expect(
      page.getByRole("img", { name: items[0].title, exact: true }),
    ).toBeVisible()
    await expect(pagination).toHaveCount(0)
    await page.goto(`/search?query=${prefix}&page=99`)
    await expect(page).toHaveURL(new RegExp(`query=${prefix}&page=1$`))
    await expect(
      page.getByRole("img", { name: items[12].title, exact: true }),
    ).toBeVisible()
  } finally {
    await cleanup(request, items)
  }
})

test("favorites return to the preceding page when its last saved item is removed", async ({
  page,
  request,
}) => {
  const { items } = await seed(request, 13)
  try {
    for (const { id } of items)
      await request.post(`${backend}/api/listings/${id}/favorite`, {
        headers: { Authorization: "Bearer mock-access-token" },
      })
    await session(page)
    await page.goto("/favorites")
    const pagination = page.getByRole("navigation", {
      name: "Pagination",
      exact: true,
    })
    await pagination
      .getByRole("button", { name: "Next page", exact: true })
      .click()
    await expect(
      page.getByRole("img", { name: items[0].title, exact: true }),
    ).toBeVisible()
    await page.getByRole("button", { name: /remove.*favorites/i }).click()
    await expect(
      page.getByRole("img", { name: items[0].title, exact: true }),
    ).toHaveCount(0)
    await expect(
      page.getByRole("img", { name: items[12].title, exact: true }),
    ).toBeVisible()
    await expect(pagination).toHaveCount(0)
  } finally {
    await cleanup(request, items)
  }
})

test("signed-in home and profile expose all pages and profile filters by owner", async ({
  page,
  request,
}) => {
  const { items } = await seed(request, 25)
  const other = await request.post(`${backend}/api/listings`, {
    data: {
      title: "Other seller pagination",
      price: 10,
      cityIds: ["1"],
      categoryId: "c1",
    },
  })
  const stranger = await other.json()
  await request.put(`${backend}/api/listings/${stranger.id}`, {
    data: { userId: "other-user" },
  })
  try {
    await session(page)
    await page.goto("/")
    const pagination = page.getByRole("navigation", {
      name: "Pagination",
      exact: true,
    })
    await pagination
      .getByRole("button", { name: "Next page", exact: true })
      .click()
    await expect(
      page.getByRole("img", { name: items[24].title, exact: true }),
    ).toBeVisible()
    await page.goto("/profile")
    await pagination
      .getByRole("button", { name: /^Page \d+$/ })
      .last()
      .click()
    await expect(
      page.getByRole("img", { name: items[24].title, exact: true }),
    ).toBeVisible()
    await expect(
      page.getByRole("img", { name: stranger.title, exact: true }),
    ).toHaveCount(0)
  } finally {
    await cleanup(request, [...items, stranger])
  }
})

test("pending listing pages and offer drawer pages are reachable on mobile", async ({
  page,
  request,
}) => {
  const { items } = await seed(request, 13, "PENDING")
  const token = `notification-test-${randomUUID()}`
  const offers = Array.from({ length: 13 }, (_, index) => ({
    offer: {
      id: randomUUID(),
      listingId: randomUUID(),
      price: 100,
      deliveryTypes: ["MEETUP"],
      message: "",
      status: "ACCEPTED",
      createdAt: "2026-01-01T00:00:00Z",
    },
    listingTitle: `Paged offer ${index}`,
    listingStatus: "AVAILABLE",
    direction: "received",
  }))
  await request.post(`${backend}/__test/offers`, {
    headers: { Authorization: `Bearer ${token}` },
    data: { items: offers },
  })
  try {
    await session(page, token)
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto("/listings/pending")
    const pagination = page.getByRole("navigation", {
      name: "Pagination",
      exact: true,
    })
    await pagination
      .getByRole("button", { name: "Next page", exact: true })
      .click()
    await expect(
      page.getByRole("img", { name: items[12].title, exact: true }),
    ).toBeVisible()
    // The header's offer entry opens the same paginated inbox on mobile.
    await page.locator("#header-mobile-toggle").click()
    await page
      .locator("[data-offers-trigger]")
      .filter({ visible: true })
      .first()
      .click()
    const dialog = page.getByRole("dialog")
    await dialog.getByRole("button", { name: "Next page", exact: true }).click()
    await expect(
      dialog.getByRole("link", { name: "Paged offer 12", exact: true }),
    ).toBeVisible()
    await expect(
      dialog.getByRole("link", { name: "Paged offer 0", exact: true }),
    ).toHaveCount(0)
  } finally {
    await cleanup(request, items)
  }
})
