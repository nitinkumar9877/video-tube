# PlayTube Frontend Agent Guide

## Purpose

This file is the complete working overview of the Next.js frontend. Read this file before inspecting source files. It describes the app structure, routes, API usage, styling conventions, authentication behavior, current demo/fallback behavior, and known broken areas.

## Runtime and commands

- Framework: Next.js 16.4.6
- UI: React 19.3.0
- Styling: Tailwind CSS 4 with global CSS and CSS Modules
- HTTP: Axios
- Icons: `react-icons`
- Fonts: Geist and Geist Mono
- Working directory: `frontend`
- Start development server: `npm run dev`
- Lint: `npm run lint`
- Production build: `npm run build`
- Production server: `npm start`
- Local frontend URL: `http://localhost:3000`

The app has no separate frontend build package or monorepo package command. Run npm commands inside `frontend`.

## Environment variables

Required in `frontend/.env.local`:

- `NEXT_PUBLIC_API_URL`: backend origin, normally `http://localhost:1111/`
- `NEXT_PUBLIC_AUTH_API_PATH`: API prefix, normally `api/auth/`

Do not add secrets to this folder. Variables prefixed with `NEXT_PUBLIC_` are exposed to browser code.

API examples:

- `NEXT_PUBLIC_API_URL + NEXT_PUBLIC_AUTH_API_PATH + "register-user"`
- Local result: `http://localhost:1111/api/auth/register-user`

## Source structure

- `src/app/layout.js`: root layout and global `AppShell`
- `src/app/globals.css`: Tailwind import and global variables/reset
- `src/app/page.js`: public home feed
- `src/app/(auth)/login/page.js`: login
- `src/app/(auth)/register-account/page.js`: two-step registration
- `src/app/dashboard/createChannel/page.js`: channel creation
- `src/app/dashboard/upload/page.js`: video and thumbnail upload
- `src/app/dashboard/videos/page.js`: redirects to home in the current implementation
- `src/app/dashboard/videos/[id]/page.js`: video player
- `src/app/dashboard/videos/[id]/edit/page.js`: currently empty and should not be treated as implemented
- `src/app/dashboard/channel/page.js`: public-style channel demo page
- `src/app/user/page.js`: logged-in profile page
- `src/app/user/my-channel/page.js`: channel owner dashboard
- `src/app/user/history/page.js`: watch history demo
- `src/app/user/liked/page.js`: liked videos demo
- `src/app/user/subscriptions/page.js`: subscriptions demo
- `src/components/common/app-shell.js`: header and sidebar shell
- `src/components/styleSheets/*.module.css`: page/component CSS modules
- `src/services/AuthUser.js`: signup, login, logout, and auth refresh
- `src/services/api.js`: Axios instance with credentials
- `src/services/videos.js`: video fetch helper
- `src/services/channel.services.js`: my-channel helper

## Root layout and navigation

`src/app/layout.js` wraps every page in `AppShell`.

`AppShell` provides:

- Fixed PlayTube header
- Desktop sidebar
- Collapsed sidebar around 1100px
- Mobile bottom navigation around 720px
- Login/profile menu
- Route-aware active navigation

Authentication pages are detected in `AppShell` and bypass the shell.

Main navigation:

- `/`: home
- `/user/subscriptions`
- `/user/history`
- `/user/liked`
- `/settings`
- `/report-history`
- `/help`

Use existing `Link`, `useRouter`, and `react-icons/md` patterns unless a focused change requires otherwise.

## Styling rules

Use the existing combination of Tailwind and CSS Modules:

```jsx
import styles from "@/components/styleSheets/example.module.css";

<main className="w-full bg-white">
  <div className={styles.page}>...</div>
</main>
```

Global styles:

- `src/app/globals.css`
- Defines `--surface`, `--surface-soft`, `--text`, `--muted`, `--border`, and `--brand`
- Brand red is `#ff0033`
- Base font is Arial/Helvetica unless the Next Geist variables are selected by a component

CSS Modules are the primary page-specific styling mechanism.
Tailwind utilities may be used for layout wrappers.
Do not duplicate global reset rules in a component stylesheet.
Keep responsive behavior aligned with existing breakpoints around 1050px, 820px, 760px, 680px, and 430px.

## API client behavior

### `AuthUser.js`

- `AuthRegisterUser(payload)`: POST `/register-user`
- `AuthLoginUser(payload)`: POST `/login`
- `logoutUser()`: POST `/logout`
- `checkAlreadyLogin()`: POST `/refresh-token`

Calls use `withCredentials: true` so HttpOnly cookies can be exchanged with the backend.

### `api.js`

`api` is an Axios instance configured with:

- `baseURL = NEXT_PUBLIC_API_URL`
- `withCredentials = true`
- JSON request headers

For multipart uploads, override the request content type only in the upload call. The app currently does this with `formData`.

Cookie/auth requests require both Axios credentials and matching backend CORS credentials.

## Authentication flow

### Registration page

File: `src/app/(auth)/register-account/page.js`

It is a two-step form:

1. Basic information: username and email
2. Security: password and confirmation

Frontend username rules:

- Required
- 3–20 characters
- Letters, numbers, and underscores only

Frontend email rules:

- Required
- Simple `name@domain` format

Frontend password rules:

- Required
- At least 8 characters
- One uppercase letter
- One lowercase letter
- One number
- One symbol
- Must match confirmation

Payload:

```js
{
  username,
  email,
  password
}
```

The current API call is `AuthRegisterUser(payload)`.
On success, form state is reset and the page redirects to `/`.
On HTTP 409 or duplicate MongoDB errors, the page attempts to map duplicate email/username to field errors.

Known signup issue:

- The page runs `checkAlreadyLogin()` in `useEffect` without an empty dependency array.
- The signup endpoint has a backend token-payload mismatch; see `Bottleneck.md`.

Do not change this flow into a single-step form unless explicitly requested.

### Login page

File: `src/app/(auth)/login/page.js`

- Validates email and required password
- POSTs to `/login`
- Stores returned public user data in `localStorage["playtube_user"]`
- Redirects to `/user`
- Uses `checkAlreadyLogin()` to redirect an already authenticated user

The login page `useEffect` also lacks a dependency array. Preserve auth behavior but avoid broad refactors.

### Logout

The logout call clears backend cookies. The AppShell then sets local login state to false and redirects to `/login`.

## User and channel pages

### Profile

`src/app/user/page.js`

- Loads public user data from `localStorage["playtube_user"]`
- Calls `/api/auth/channels/me`
- Shows create-channel or channel management links
- Displays subscriber/video/view values when returned by the backend

### My channel

`src/app/user/my-channel/page.js`

- Fetches `/api/auth/channels/me`
- Falls back to demo channel values if no channel exists
- Uses demo videos for the content grid
- Supports local search and grid/list view toggles
- Provides links to upload, customize channel, and manage videos

Do not present demo metrics as live API data if adding real API integration.

### Channel creation

`src/app/dashboard/createChannel/page.js`

- Fetches `/api/auth/channels/me`
- Shows channel creation or existing-channel state
- Sends channel name, handle, description, category, and `Image` multipart field
- After success, sets the created channel state

Channel handle is generated from channel name but can be manually changed in the form. Existing UI validation follows the backend lowercase letter/number/hyphen pattern.

### Video upload

`src/app/dashboard/upload/page.js`

- Fetches the current channel
- Requires a video and thumbnail
- Video limit: 15 MB
- Thumbnail limit: 2 MB
- Browser MIME types:
  - Video: MP4, AVI, MOV
  - Thumbnail: JPG, PNG, WebP
- Sends fields and files through `FormData`
- Fields:
  - `title`
  - `description`
  - `category`
  - `duration`
  - `tags` as JSON
  - `visibility`
  - `channelId`
  - `video`
  - `thumbnailImage`
- POST: `/api/auth/channels/upload-video`

## Video routes

`src/app/dashboard/videos/[id]/page.js`

- Reads the dynamic ID from `window.location.pathname`
- Gets `/api/auth/videos/:id`
- Falls back to demo `demoVideo` if the API request fails
- Supports client video controls
- POSTs `/api/auth/videos/:id/like`

`src/app/dashboard/videos/[id]/edit/page.js` is empty and currently causes a Next.js prerender/export error if included by static page generation. Treat it as unfinished, not as an existing feature.

`src/app/dashboard/videos/page.js` currently redirects to `/`. It should not be assumed to be a video-management implementation.

## Demo data and fallback behavior

Several pages use local demo data or fallback values:

- Home feed: `src/app/page.js`
- Channel page: `src/app/dashboard/channel/page.js`
- My-channel dashboard: `src/app/user/my-channel/page.js`
- Subscriptions, liked videos, history
- Video player fallback

Do not remove demos unless explicitly replacing a page with real API data. For any API integration, preserve loading/error/empty states and existing route behavior.

## Asset and image conventions

- Static logo: `src/assets/playTube.webp`
- Public assets: `public/`
- Use `next/image` for local or configured remote images
- Use existing string CSS backgrounds only when a thumbnail is intentional demo art
- The channel, upload, and video pages support URL/object preview patterns

Before adding remote image domains, update `next.config.mjs` if required by Next.js image optimization.

## Known frontend issues

1. `dashboard/videos/[id]/edit/page.js` has no React export.
2. Registration and login `useEffect` auth checks have no dependency array.
3. Registration success redirects immediately and does not use `successMessage`.
4. `src/services/channel.services.js` incorrectly mixes Axios and `fetch` response checks.
5. `src/services/videos.js` catches errors but does not rethrow or return a consistent empty shape.
6. Several pages are demos and do not fetch the backend.
7. Full build currently reaches but can be blocked by the empty edit route.

## Safe change guidelines

- Make focused changes; do not rewrite whole pages.
- Preserve existing API payload names and route paths.
- Preserve existing two-step registration and login redirect behavior.
- Preserve server cookie credentials.
- Use CSS Modules for page-specific visual changes.
- Use Tailwind only for wrappers/shared utility layout.
- Use one loading state and one error state per existing form.
- Do not add automatic retries to signup or payment-like repeated actions.
- Do not log passwords, tokens, cookies, or sensitive response bodies.
- Run `npm run lint -- <changed-file>` after focused changes.
- Run `npm run build` for route/config changes.

## Before editing

Read only these files unless the task targets another feature:

- Global shell changes: `src/components/common/app-shell.js`
- Auth changes: `src/app/(auth)/...`, `src/services/AuthUser.js`, `src/services/api.js`
- Channel changes: `src/app/dashboard/createChannel/page.js`, `src/app/user/my-channel/page.js`
- Upload changes: `src/app/dashboard/upload/page.js`
- Video changes: `src/app/dashboard/videos/[id]/page.js`
- Page layout: matching page plus matching CSS module
- API route changes: `Bottleneck.md` and the backend `Agent.md`
