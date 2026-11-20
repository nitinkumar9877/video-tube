# Signup Bottlenecks and Recommended Fixes

## Resolution status

Updated on 2026-11-20:

- Signup now uses `{ userId }` JWT payloads, shared access/refresh cookie helpers, and MongoDB duplicate-key handling.
- Signup creates and stores a refresh-token session, removes only the newly created account if setup fails, and does not log token values.
- Protected-route middleware typo is fixed, CORS uses `FRONTEND_URL` with localhost fallback, and upload-only environment requirements no longer block auth startup.
- Registration and login now use stable auth-check effects and synchronous submit guards.
- Live validation passed: signup `201`, duplicate signup `409`, login `200`, and refresh `200`.
- Login now unwraps the backend user from `response.data.user` instead of reading a nonexistent `response.user`; this prevents a post-login runtime `TypeError`.
- `checkAlreadyLogin` now treats `401` refresh responses as a normal unauthenticated state and no longer treats missing cookies as an application error.
- Create-channel startup/export crash fixed; `channel.controller.js` now exports `createChannel` and `getMyChannel` consistently.
- Fixed `Cannot read properties of undefined (reading 'push')`: user ownership is stored in `user.channels`, not the nonexistent `user.channel` field. Existing demo1 channel creation returns `201`; duplicate creation returns `409`.
- Create-channel validation uses `400`, existing channel/handle conflicts use `409`, unauthenticated requests use `401`, and unexpected failures use `500`.

## Scope

This document covers the signup API and the registration page only. The recommended changes are limited to signup/auth behavior and should preserve the existing two-step registration flow and account creation logic.

## Priority findings

| Priority | Location | Bottleneck | Risk | Recommended change |
|---|---|---|---|---|
| Critical | `backend/src/controllers/auth.controllers.js:95-96` | Signup generates tokens with `{ id: newUser._id }`, while authentication middleware reads `decoded.userId`. | The new account is created and a 201 response may be returned, but the access and refresh cookies cannot identify the new user. Protected routes and automatic login can return invalid token or user-not-found errors. | Keep the existing token generation, but pass `{ userId: newUser._id }`, matching login and refresh behavior. |
| Critical | `backend/src/middleware/auth.middleware.js:49` and `:128` | Protected-route middleware and refresh middleware expect `decoded.userId`. | Signup currently produces unusable tokens because the signup payload uses `id` instead. | After correcting signup payload, verify both access and refresh middleware with a newly registered account. |
| Critical | `backend/src/controllers/auth.controllers.js:108-121` | Signup writes cookies directly instead of using the existing cookie helpers and uses `secure: false` plus `sameSite: "lax"` unconditionally. | Production cookies may remain insecure or behave differently from login/refresh cookies, which use environment-aware and `Strict` cookie settings. | Reuse `setaccessTokenCookie` and `setrefreshTokenCookie` so signup, login, and refresh use the same cookie policy. |
| High | `backend/src/controllers/auth.controllers.js:133-141` | Unexpected signup failures always become a 500 response. | MongoDB duplicate races, token generation failures, and database errors can return a generic message and leave confusing page states. | Map only known duplicate-key and validation errors to 409/400 responses. Keep unexpected database errors as 500 responses. |
| High | `backend/src/controllers/auth.controllers.js:50-65` and `backend/src/controllers/auth.controllers.js:86` | Duplicate checking happens before insert and is not combined with the insert in a transaction or handled as a MongoDB duplicate-key error. | Two requests can both pass the existing-user check. A duplicate-key insert can then be returned as the generic signup 500 response. | Preserve the existing check for a clear result, and also handle MongoDB error code `11000` in the catch block with a 409 response and field-specific duplicate message. |
| High | `backend/src/controllers/auth.controllers.js:83-96` | Account creation happens before token generation. | If JWT generation or a later signup step fails, the database may contain an account while the API returns failure. A retry may then show an account-already-exists conflict. | Generate the tokens before creating the user, or if that is not compatible with the current logic, remove only the newly created account if token setup fails. |
| High | `backend/src/app.js:10` | CORS is hardcoded to `http://localhost:3000`. | A deployed frontend or a frontend started on another port will be blocked and signup requests cannot send or receive credentials. | Configure the allowed frontend origin from an environment variable while retaining `http://localhost:3000` as the local default. |
| High | `frontend/src/app/(auth)/register-account/page.js:145-157` | The `useEffect` that checks login status has no dependency array. | The redirect check is executed after every page render. | Add `[]` to the dependency array and retain the existing router redirect logic unchanged. |
| Medium | `backend/src/config/environment.config.js` | Startup requires AWS, Cloudflare, ImageKit, Cloudinary-adjacent, MongoDB, JWT, and other variables even though signup is a separate route. | Signup cannot start or run in an environment where only authentication variables are configured. | For the signup fix, do not require all third-party variables globally unless those services are actually used. Validate only environment variables required by the active service, or make non-auth upload variables optional. |
| Medium | `backend/src/controllers/auth.controllers.js:99-100` | JWT access and refresh tokens are logged with `console.log`. | Tokens appear in server logs and may be copied or exposed during debugging. | Remove token-value logging; keep only non-sensitive status or error messages. |
| Medium | `backend/src/controllers/auth.controllers.js:95-103` | `generateToken` can return `null`, but signup destructures its result immediately. | A token-generation error can become a secondary JavaScript destructuring error instead of a clear signup failure. | Check whether `generateToken` returned tokens before destructuring, or add the null check before use; keep the existing catch as the final 500 fallback. |
| Medium | `backend/src/models/user.model.js:4-14` | `username` and `email` are only marked unique and required. | Basic values are not normalized consistently at the schema level, so casing, spaces, or unexpected value shapes may differ between requests or existing records. | Keep the backend's existing validation and trim/lowercase behavior; optionally add schema `trim`, lowercase for email, and username limits to match the current page validation. |
| Medium | `frontend/src/app/(auth)/register-account/page.js:199-289` | The create-account handler validates locally but does not normalize username/email before the full submit beyond trimming in the payload. | Leading or trailing spaces are not consistent in every path, and API errors rely partly on response parsing. | Keep the current payload shape, but use the already-normalized username/email values consistently and preserve the existing field/general error UI. |
| Medium | `frontend/src/services/AuthUser.js:18` | Signup uses a separate Axios call without a timeout or shared API instance. | A stalled network request can leave the submit button loading until the browser closes or the request fails. | Add a small request timeout and/or reuse the existing Axios API instance; do not add retries that could create duplicate signup submissions. |
| Medium | `frontend/src/app/(auth)/register-account/page.js:199-204` | A duplicate submission is guarded by React state, which updates asynchronously. | Rapid repeated presses or resubmits before re-render could issue more than one signup request. | If needed, use a simple synchronous in-flight guard in the existing handler. Do not disable the button globally or change the two-step form. |
| Low | `frontend/src/app/(auth)/register-account/page.js:245-256` | Success handling redirects immediately after a successful signup. | It does not set or display `successMessage`, but the redirect itself is intentional. | Keep the redirect behavior and remove success-message state only if it is unused; otherwise keep the existing UI without changing navigation. |
| Low | `backend/src/controllers/auth.controllers.js:3-13` | Signup imports unused image/auth dependencies such as ImageKit code and hashing-related imports. | It increases noise and makes debugging signup harder, but does not directly block account creation. | This is cleanup only; do not replace or restructure working authentication logic for it. |

## Signup flow bottleneck summary

### Frontend

1. The registration page validates username, email, and password in two steps.
2. The page calls `AuthRegisterUser(payload)` with credentials enabled.
3. The frontend maps HTTP 409 and MongoDB duplicate details into field-specific errors.
4. On success, the page clears form state and redirects to `/`.

The page logic is mostly consistent. The most important frontend correction is to stabilize the already-running login-status check and ensure one signup request is sent during submission.

### Backend

1. The `/api/auth/register-user` route calls `signUp`.
2. The controller trims and normalizes the request, validates fields and password, checks duplicates, hashes the password, and creates the user.
3. It creates access and refresh tokens and sets cookies.
4. It returns a 201 response with the public user fields.

The main backend failures are the incorrect signup token payload, inconsistent cookie setup, duplicate race handling, orphan-account risk, and excessive startup environment requirements.

## Required fix order

1. Change signup token payload from `id` to `userId`.
2. Reuse the existing access/refresh cookie helpers in signup.
3. Add duplicate-key `11000` handling to the signup catch block.
4. Add a simple null check for `generateToken`.
5. Add the missing `useEffect` dependency in the registration page.
6. Configure CORS through environment-specific allowed origins.
7. Remove token values from logs.
8. Add a request timeout only if network hang behavior is observed.

## Simple validation after fixes

The smallest validation should cover only these cases:

- Valid account signup returns 201 and redirects to the home page.
- The same account email or username returns 409 with the correct field error.
- A second signup with the same details does not leave an orphan or partial account.
- The signup-created access cookie works on a protected route.
- The signup-created refresh cookie works at `/api/auth/refresh-token`.
- Signup works in local development and in the configured production origin.
- No token or password value appears in application logs.

## Changes intentionally not recommended

- Do not replace the existing two-step registration UI.
- Do not change the existing user, login, or channel database models unless a signup-specific field rule is being added.
- Do not add OAuth, email verification, or rate limiting as part of this bottleneck fix unless separately requested.
- Do not add signup retries or duplicate submission queues that could create repeated accounts.
- Do not redesign the frontend state or backend response format beyond the narrow auth fixes above.
