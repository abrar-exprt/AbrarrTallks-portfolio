# Firestore Database Structure — Abrarr Tallks Portfolio

Complete reference for all Firestore collections and document fields.

---

## Collection: `projects`

Each document is one portfolio project. Documents are auto-ID'd by Firestore.

| Field         | Type      | Required | Notes |
|---------------|-----------|----------|-------|
| `title`       | string    | ✅       | Display name of the project |
| `category`    | string    | ✅       | One of: `travel`, `hotel`, `agency`, `sports`, `ecommerce`, `business` |
| `status`      | string    | ✅       | `"live"` or `"draft"` |
| `description` | string    | —        | Short paragraph about the project (up to ~200 chars shown) |
| `tags`        | string[]  | —        | Array of strings, e.g. `["HTML/CSS/JS", "SEO", "Travel"]` |
| `url`         | string    | —        | Full live URL, e.g. `https://aaditourandtravel.com/` |
| `image`       | string    | ✅       | Any image URL — Cloudinary, Unsplash, Imgur, Google Drive, etc. |
| `order`       | number    | —        | Lower number = shown first. Default: `100` |
| `createdAt`   | timestamp | auto     | Set by `serverTimestamp()` on `addDoc` |
| `updatedAt`   | timestamp | auto     | Set by `serverTimestamp()` on every write |

### Example document (`/projects/abc123`)
```json
{
  "title":       "Aadi Tour & Travel",
  "category":    "travel",
  "status":      "live",
  "description": "Full-featured Kashmir tour & travel agency website with SEO...",
  "tags":        ["HTML/CSS/JS", "SEO", "Travel", "WhatsApp Booking"],
  "url":         "https://aaditourandtravel.com/",
  "image":       "https://images.unsplash.com/photo-1506905925346?w=800&q=80",
  "order":       1,
  "createdAt":   "<Timestamp>",
  "updatedAt":   "<Timestamp>"
}
```

### Supported image URL formats
| Source       | Example URL format |
|--------------|--------------------|
| Unsplash     | `https://images.unsplash.com/photo-...?w=800&q=80` |
| Cloudinary   | `https://res.cloudinary.com/YOUR_CLOUD/image/upload/...` |
| Google Drive | `https://drive.google.com/file/d/FILE_ID/view` ← auto-converted by `normalizeImageUrl()` |
| Imgur        | `https://i.imgur.com/XXXXXX.jpg` |
| Any direct   | Any URL ending in `.jpg`, `.png`, `.webp`, `.jpeg` |

---

## Collection: `updates`

News / announcements shown on the site. Documents are auto-ID'd.

| Field       | Type      | Required | Notes |
|-------------|-----------|----------|-------|
| `title`     | string    | ✅       | Headline of the update |
| `date`      | string    | ✅       | ISO date string: `"YYYY-MM-DD"` — used for ordering |
| `body`      | string    | ✅       | Short paragraph body text |
| `createdAt` | timestamp | auto     | Set on `addDoc` |
| `updatedAt` | timestamp | auto     | Set on every write |

### Example document (`/updates/xyz789`)
```json
{
  "title":     "New Travel Project Launched",
  "date":      "2025-09-12",
  "body":      "Kashmir Glide shikara website is live with WhatsApp booking.",
  "createdAt": "<Timestamp>",
  "updatedAt": "<Timestamp>"
}
```

---

## Collection: `site` — Config Documents

Two fixed documents in this collection: `hero` and `stats`.

---

### Document: `/site/hero`

Controls the top scrolling marquee image strip on the home page.

| Field       | Type      | Notes |
|-------------|-----------|-------|
| `images`    | string[]  | Array of image URLs (any supported format). Order = display order. |
| `updatedAt` | timestamp | Updated on every change |

### Example
```json
{
  "images": [
    "https://images.unsplash.com/photo-1506905925346?w=600&q=80",
    "https://images.unsplash.com/photo-1469854523086?w=600&q=80",
    "https://res.cloudinary.com/abrar/image/upload/v1/hero1.webp"
  ],
  "updatedAt": "<Timestamp>"
}
```

---

### Document: `/site/stats`

Numbers displayed on the home hero and portfolio stats bar.

| Field          | Type    | Notes |
|----------------|---------|-------|
| `years`        | number  | Years of experience (displayed as `4+`) |
| `projects`     | number  | Live websites count (displayed as `20+`) |
| `companies`    | number  | Companies run |
| `satisfaction` | number  | Client satisfaction percentage (displayed as `100%`) |
| `updatedAt`    | timestamp | Updated on every save |

### Example
```json
{
  "years":        4,
  "projects":     20,
  "companies":    2,
  "satisfaction": 100,
  "updatedAt":    "<Timestamp>"
}
```

---

## Firestore Indexes

The following composite indexes are needed for ordered queries. Firebase will usually prompt you to create these automatically when you first load the site, or you can add them manually in the Firebase console under **Firestore → Indexes**.

| Collection | Fields indexed | Order |
|------------|---------------|-------|
| `projects` | `order` ASC   | Ascending |
| `updates`  | `date` DESC   | Descending |

---

## Quick Setup Steps

1. **Create project** at [console.firebase.google.com](https://console.firebase.google.com/)
2. **Add Web App** → copy config → paste into `firebase-config.js`
3. **Enable Authentication** → Sign-in method → Email/Password → Enable
4. **Create admin user** → Authentication → Users → Add User → use `abrar@abrartallks-portfolio.co.in`
5. **Paste Firestore Rules** from `firestore.rules` → Firestore → Rules → Publish
6. **Open the site** — projects load from fallback automatically until you add data via `admin.html`
7. **Login at** `/admin.html` and start adding projects, hero images and stats

---

*Last updated: 2025 — Abrarr Tallks Portfolio*
