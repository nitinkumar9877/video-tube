# Frontend Agent Memory

## Purpose

This file is the persistent implementation memory for the `frontend/` portion of the YouTubeClone project. Read this file before changing frontend code. Keep it accurate after every frontend change. For changes that affect backend requests or responses, also update `../backend/Agent.md`.

## Runtime and Entry Points

- Framework: Next.js 16 App Router.
- UI: React 19 client components and server-rendered App Router pages.
- Package scripts:
  - `npm run dev`: start Next.js development server.
  - `npm run build`: create a production build.
  - `npm run start`: serve a production build.
  - `npm run lint`: run ESLint.
- `src/app/layout.js`: root HTML/body layout, Geist fonts, Google OAuth provider, and global AppShell.
- `src/app/globals.css`: global styles.
- `src/app/page.js`: public/home route.
- Alias `@/*` maps to `src/*` through `jsconfig.json`.
- The Google provider requires `NEXT_PUBLIC_GOOGLE_CLIENT_ID`.

## App Router Structure

- `(auth)/login`: login page.
- `(auth)/register-account`: two-step registration page and Google login button.
- `/`: main home/video feed route.
- `/user`: profile page.
- `/user/createChannel`: channel creation page.
- `/user/history`: watch history UI.
- `/user/liked`: liked videos UI.
- `/user/my-channel`: channel overview.
- `/user/my-channel/my-videos`: owner's video list.
- `/user/my-channel/upload`: video upload form.
- `/user/subscribe`: subscribed channels.
- `/dashboard`: dashboard overview.
- `/dashboard/channel`: channel dashboard/management.
- `/dashboard/videos`: video dashboard list.
- `/dashboard/videos/[id]`: dynamic video detail route.
- `/dashboard/videos/[id]/edit`: dynamic video edit route.
- `(main)/help`: help route.
- `(main)/info`: info route.
- `(main)/report-history`: report-history route.
- `(main)/settings`: settings route.
- `(main)/terms-of-service`: terms route.

Route groups `(auth)` and `(main)` organize pages without changing URL paths.

## Source Map

- `src/app/`: App Router pages and layout styles.
- `src/components/common/app-shell.js`: shared header, sidebar, login state, and logout UI.
- `src/components/common/header.js`: shared header component.
- `src/components/common/footer.js`: shared footer component.
- `src/components/auth/GoogleAuth.jsx`: Google credential login button.
- `src/components/video/`: video components (content evolves with implementation).
- `src/components/channel/`: channel components.
- `src/components/styleSheets/`: CSS Modules used by pages/components.
- `src/services/api.js`: shared Axios instance.
- `src/services/AuthUser.js`: authentication and profile API calls.
- `src/services/channel.services.js`: channel/subscription API calls.
- `src/services/videos.js`: video list/detail/upload/like API calls.
- `src/assets/playTube.webp`: PlayTube logo image.
- `public/images/`: public static image assets.
- `public/`: additional public files.

## Root Layout and AppShell

`src/app/layout.js`:
- loads Geist and Geist Mono;
- imports global CSS;
- wraps every page with `GoogleOAuthProvider`;
- wraps every page with `AppShell`.

`AppShell`:
- is a client component;
- detects `/login` and `/register-account` and bypasses the normal shell for auth pages;
- calls `checkAlreadyLogin()` during mount to determine login state;
- displays login/signup links when logged out;
- displays profile/logout controls when logged in;
- closes profile menus on outside mouse events and Escape;
- calls `logoutUser()` and clears the local logged-in shell state.

The shell does not currently render a real uploaded profile picture in the profile trigger; that display may be changed deliberately.

## Authentication and Session Frontend

`src/services/AuthUser.js` owns direct authentication APIs.

Environment URL convention:
- `NEXT_PUBLIC_API_URL` is the backend origin.
- `NEXT_PUBLIC_AUTH_API_PATH` is the API prefix, normally `/api/auth/` or equivalent.
- Calls combine these values before endpoint names.

Functions:
- `AuthRegisterUser(payload)`: POST `register-user` with credentials and cookies.
- `AuthLoginUser(payload)`: POST `login`.
- `logoutUser()`: POST `logout`.
- `checkAlreadyLogin()`: POST `refresh-token`; returns `{ success: false }` on HTTP 401.
- `FetchUserData()`: GET `myProfile`; catches failures and returns a failed shape.
- `AuthGoogleUser(credential)`: POST `Google-Register` with `{ credential }`.

All browser authentication requests use `withCredentials: true` so HTTP-only cookies can be sent and updated.

`checkAlreadyLogin()` is used by the AppShell and auth pages to determine whether to show authenticated UI or redirect.

The login and register pages store some public user fields in `localStorage` under `playtube_user` after successful local auth. This is UI data only; authentication authority remains in HTTP-only cookies. Never store access or refresh tokens in localStorage.

## Register Account Page

File: `src/app/(auth)/register-account/page.js`.

- is a client page;
- has a two-step state machine:
  1. username and email;
  2. password and confirmation;
- validates username length 3-20 and allowed characters `[a-zA-Z0-9_]`;
- validates email format;
- requires password length >= 8 and uppercase, lowercase, number, and symbol;
- requires confirmation to match;
- calls `AuthRegisterUser` only after both validation stages pass;
- prevents duplicate submit using loading state and `submitInProgress` ref;
- sends trimmed username/email and raw password to the backend;
- parses API duplicate errors and returns email/username field-specific messages;
- stores `playtube_user` on success;
- redirects to `/` on success;
- renders `GoogleAuth.jsx` as the Google login control;
- disables back while loading or on step 1.

Do not change validation rules only in the frontend; keep them synchronized with backend validator rules.

## Login Page

File: `src/app/(auth)/login/page.js`.

- validates email and required password;
- calls `AuthLoginUser`;
- stores public user fields in `playtube_user` when a successful user payload is returned;
- redirects to `/user` after login;
- catches API errors and shows a general login error.

## Google Auth Component

File: `src/components/auth/GoogleAuth.jsx`.

- client component;
- uses `GoogleLogin` from `@react-oauth/google`;
- receives a credential in `onSuccess`;
- calls `AuthGoogleUser(credential)`;
- assigns the browser to `/user` after successful backend cookie creation;
- renders loading/error text for Google flows.

The register page must import this actual component as `GoogleAuth.jsx`, not any old/deleted Google login filename.

## Shared Axios Layer

`src/services/api.js` creates an Axios instance:
- `baseURL: NEXT_PUBLIC_API_URL`;
- `withCredentials: true`;
- JSON content type by default.

Use this instance for API paths that can be built relative to `NEXT_PUBLIC_API_URL`. Video upload overrides the content type to `multipart/form-data`.

Most service methods catch errors and return a predictable frontend fallback shape rather than throwing. When changing one, preserve or intentionally update the shape used by its page.

## Channel Services

`src/services/channel.services.js`:
- `getMyChannel()` GETs `api/auth/channels/me` and returns `channel: null` on missing channel or failure.
- `fetchSubscribedChannels()` GETs `api/auth/subscribed-channels`.

Callers should tolerate:
- 401 unauthorized responses;
- `channel: null`;
- empty subscriptions;
- stale-channel cleanup responses.

## Video Services

`src/services/videos.js`:
- `getAllVideos()`: GET public video list.
- `getMyVideos()`: GET protected `/api/auth/my-videos` and normalizes `videos` to an array.
- `uploadVideo(videoData)`: POST multipart protected `/api/auth/channels/upload-video`.
- `getVideoById(id)`: GET public/dynamic video endpoint and increments backend view count.
- `doLikeVideo(videoId)`: POST protected like endpoint.

Video page callers should handle `success: false`, missing `data`, and backend error text. Multipart upload payload fields must match:
- `video`;
- `thumbnailImage`;
- title, description, category, duration, tags, visibility, and optional channelId.

## Main Content Pages

- Home: loads all videos and presents video cards/feed behavior.
- User/profile: loads profile/user-facing data and provides account navigation.
- Channel creation: submits a multipart channel payload and channel logo.
- My channel: reads the current user's channel and handles no-channel state.
- My videos: loads the owner's video list.
- Upload: builds a `FormData` payload for video and thumbnail upload.
- Subscriptions: fetches subscribed channel data.
- History/liked: page-specific local or API-driven UI based on current implementation.
- Dashboard routes: management surfaces for channel and videos, including dynamic edit/detail pages.

Read the specific page before changing its behavior because route logic and UI state are not centralized.

## Components and Styling

- CSS Modules live in `src/components/styleSheets/*.module.css`.
- Page components import only the stylesheet they own unless a shared shell class is needed.
- Shared shell uses `app-shell.module.css`.
- Images use Next.js `Image` where static/local assets are involved.
- Icons come from `react-icons` (`fa`, `fa6`, and `md` families).
- Loading spinners use `react-spinners`.

Keep class names and module imports stable unless changing a page's style. Next.js CSS Modules do not allow dynamically invented class names.

## Next.js Image Configuration

`next.config.js` currently allows Next.js `<Image>` optimization for remote image URLs over both HTTP and HTTPS from any hostname using wildcard `remotePatterns`. Static/local imports and Next.js assets continue to work normally. This broad setting supports external profile, channel, thumbnail, and media resources, but also means remote image sources should be validated by the application before use.

## Environment Variables

Frontend variables visible to browser code:
- `NEXT_PUBLIC_API_URL`: backend origin/base URL.
- `NEXT_PUBLIC_AUTH_API_PATH`: auth route prefix.
- `NEXT_PUBLIC_GOOGLE_CLIENT_ID`: Google OAuth web client ID.

Never put backend secrets or private AWS/ImageKit credentials in `NEXT_PUBLIC_*` variables.

## Backend Contract Summary

Backend base is `http://localhost:1111/api/auth` in local comments, but use environment variables instead of hardcoding ports.

Current important contracts:
- auth responses use `success`, `message`, and `user`;
- protected requests rely on HTTP-only cookies and CORS credentials;
- channel APIs use `channel`, `channels`, or `data.channel` shapes in different responses;
- video list/detail/upload APIs use `data` arrays/objects;
- duplicate auth failures should return HTTP 409 and may include `code`/`keyPattern`;
- Google auth expects `{ credential }` and returns a public user shape plus a cookie session.

When a backend contract changes, update this file and `../backend/Agent.md` together.

## Route and Auth Behavior

- Auth routes hide the normal AppShell.
- Public `/` and dashboard routes still run AppShell login checks.
- Protected page actions should return or show an unauthorized state instead of silently assuming success.
- Successful login/registration is cookie-backed; page redirects are not authentication themselves.
- `checkAlreadyLogin` should remain the session check when adding protected navigation.

## Change Discipline

Before editing:
1. Identify the owning App Router page/component.
2. Trace its API call through `src/services/*` into `../backend/src/routes/post.routes.js`.
3. Preserve response parsing, cookie behavior, and route contracts unless intentionally changing them.
4. Use existing CSS Modules and React patterns.
5. Check auth pages, AppShell, and the Google provider together when changing session logic.

After every frontend change:
1. Update this `Agent.md` with new/removed pages, components, routes, API shapes, environment variables, and state behavior.
2. Update `../backend/Agent.md` for request/response or route changes.
3. Run `npm run lint` or the narrowest relevant check.
4. Run `npm run build` after App Router, imports, providers, or shared layout changes.
5. Remove stale documentation instead of leaving contradictory memory.

## Recent Confirmed State

- The dynamic video player page uses `video.channel.channelName` for the channel label, checks authentication before subscription actions, and passes `video.channel._id` to the subscribe API.
- The video page and like service synchronize like state/count from the backend `data.isLiked` and `data.likesCount` response fields.
- Remote `next/image` sources are allowed over HTTP and HTTPS from wildcard hostnames in `next.config.js`.
- The production build previously failed because the register page imported nonexistent `GoogleLogin.jsx` and rendered `<handleGoogleSuccess />`.
- The register page now imports `GoogleAuth.jsx` and renders `<GoogleLoginButton />` as the actual component.
- `npm run build` has successfully completed after that import correction.
