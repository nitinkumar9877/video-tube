# PlayTube Backend Agent Guide

## Purpose

This file is the complete working overview of the Express/MongoDB backend. Read this file before inspecting source files. It explains the entry points, routes, middleware, models, storage services, environment requirements, auth behavior, known issues, and safe change practices.

## Runtime and commands

- Runtime: Node.js/CommonJS
- Server: Express 5
- Database: MongoDB through Mongoose
- Authentication: JWT access/refresh cookies
- Password hashing: bcryptjs
- Uploads: Multer
- Storage: AWS S3-compatible SDK, Cloudflare/ImageKit/Cloudinary integrations present
- Working directory: `backend`
- Development server: `npm run dev`
- Start server: `npm start`
- No real test script is configured in `package.json`

Local backend URL:

- `http://localhost:1111`
- API prefix: `/api/auth`

Start:

```bash
cd backend
npm run dev
```

MongoDB connection starts in `server.js` before Express listens.

## Entry points

- `server.js`: loads environment config, connects MongoDB, and listens on `PORT`
- `src/app.js`: creates Express app, CORS, JSON/urlencoded parsing, cookies, and auth route mount
- `src/routes/post.routes.js`: route registry
- `src/mongoDb/connection.mongoDb.js`: MongoDB connection

## Environment variables

Configuration is loaded in `src/config/environment.config.js`.

Confirmed required values:

- `PORT`
- `MONGODBURL`
- `JWT_REFRESH_SECRET`
- `JWT_ACCESS_SECRET`
- `IMAGEKIT_URL_ENDPOINT_URL`
- `IMAGEKIT_PUBLIC_KEY`
- `IMAGEKIT_PRIVATE_KEY`
- `NODE_ENV`
- `FRONTEND_URL` (required for deployed frontend CORS; comma-separated origins supported)
- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_ACCOUNT_ID`
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `AWS_BUCKET_NAME`
- `AWS_REGION`

Other variables read by storage configuration may include:

- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`

Do not read or document actual secret values.
Do not add secrets to source control or response bodies.

Environment config currently throws if all listed required values are missing. A focused signup fix should not require Cloudflare/AWS/ImageKit variables to be present unless signup is later integrated with uploads.

## Express configuration

`src/app.js`:

```js
app.use(cors({
  origin: "http://localhost:3000",
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use("/api/auth", authRoutes);
```

CORS allows `http://localhost:3000` by default and deployed origins from `FRONTEND_URL`.
Credentials are required because access and refresh tokens are HttpOnly cookies.

For deployment, set `FRONTEND_URL` to the exact frontend origin(s), separated by commas if needed, and keep credentials enabled. The backend accepts origins without a trailing slash and trusts one proxy hop for Render IP/session metadata.

Environment loading:

- `src/app.js` loads `environment.config.js` before reading `FRONTEND_URL`, so `backend/.env` and Render environment variables are available to CORS consistently.
- The deployment frontend origin must be HTTPS.
- Vercel preview origins matching `https://video-tube*.vercel.app` are accepted by the CORS matcher. Custom domains must be listed in `FRONTEND_URL`.
- `BASE_URL` belongs to the frontend origin for OAuth/frontend redirects and should not be the Render backend origin.

## Route registry

All routes are mounted at `/api/auth`.

| Method | Route | Middleware | Controller |
|---|---|---|---|
| POST | `/register-user` | None | `signUp` |
| POST | `/login` | None | `login` |
| POST | `/logout` | None | `logout` |
| POST | `/refresh-token` | `refreshTokenValidation` | `refreshToken` |
| POST | `/channels` | `accessTokenValidation`, upload image | `createChannel` |
| GET | `/channels/me` | `accessTokenValidation` | `getMyChannel` |
| POST | `/channels/upload-video` | `accessTokenValidation`, video + thumbnail upload | `videoUpload` |
| GET | `/videos` | None | `getAllVideos` |
| GET | `/videos/:id` | None | `getVideo` |
| DELETE | `/videos/:key` | `accessTokenValidation` | `deleteVideo` |
| PATCH | `/videos/:key` | `accessTokenValidation` | `updateVideoDetails` |
| GET | `/my-videos` | `accessTokenValidation` | `myVideos` |
| POST | `/videos/:id/like` | `accessTokenValidation` | `likeVideo` |

Some README text says `:key` for deletion/update, but controller logic should receive the route parameter consistently.

## Authentication

### Signup

Controller: `src/controllers/auth.controllers.js`

Route: `POST /api/auth/register-user`

Request body:

```json
{
  "username": "Hello21",
  "email": "hello123@gmail.com",
  "password": "Hello12345@"
}
```

Current flow:

1. Trim username and lowercase/trim email.
2. Require username, email, and password.
3. Validate email with `validator.isEmail`.
4. Require:
   - Minimum 8 characters
   - Lowercase
   - Uppercase
   - Number
   - Symbol
5. Check existing email or username.
6. Hash password with bcrypt using cost 10.
7. Create the user.
8. Generate access and refresh JWT cookies.
9. Return public user fields.

Success status: `201`

Duplicate status: `409`

Validation status: `400`

Unexpected status: `500`

Authentication status:

- Signup now generates `{ userId: newUser._id }`, matching login, refresh, and middleware behavior.
- Signup reuses the shared access/refresh cookie helpers and creates a refresh-token database session.
- Signup maps MongoDB duplicate-key `11000` errors to `409` and removes a partially created account when later setup fails.
- Token generation has null checks, and access/refresh token values are not logged by signup or refresh flows.
- Access middleware typo and environment-over-validation issues are resolved.
- The login response exposes public user fields under `data.user`; access and refresh tokens remain in HttpOnly cookies.
- Live validation passed for signup `201`, duplicate signup `409`, login `200`, and refresh `200`; details are in `Bottleneck.md`.

Do not change signup into a login implementation or add email verification unless separately requested.

### Login

Controller: `src/controllers/auth.controllers.js`

Request:

```json
{
  "email": "hello123@gmail.com",
  "password": "Hello12345@"
}
```

Current flow:

1. Require email and password.
2. Lowercase and trim email.
3. Find user and select password.
4. Compare bcrypt hash.
5. Generate tokens with `{ userId: user._id }`.
6. Create a `Token` document.
7. Set HttpOnly access/refresh cookies.
8. Return public user data.

Invalid credentials return `401`.

### Refresh

`refreshTokenValidation` verifies the refresh cookie and loads the user.
`refreshToken` deletes matching refresh sessions and creates a new access/refresh pair plus `Token` row.

The middleware and controller use `decoded.userId` and `userId` on `Token` records.
Signup must match this same token shape.

Refresh middleware also requires a matching, unexpired `Token` record for the exact refresh cookie. A valid JWT whose database session has been deleted is rejected with `401` and both auth cookies are cleared; the refresh controller must not mint replacement tokens for revoked sessions.

The authenticated profile endpoint is `GET /api/auth/myProfile`. Its response shape is `{ success, data: { user } }` to match the frontend profile page.

### Logout

Clears access and refresh cookies using cookie helper functions.
It does not currently revoke database refresh sessions.

## Cookie policy

Cookie helpers:

- `src/utils/cookies.utils.js`
- Access cookie: `accessToken`
- Refresh cookie: `refreshToken`
- Both are HttpOnly
- Access lifetime: 5 minutes
- Refresh lifetime: 7 days
- `Secure` in production
- `SameSite=None` in production for cross-site frontend/backend cookies
- `SameSite=Lax` in local development

Signup, login, refresh, and logout use these shared helpers. Set-cookie and clear-cookie operations must use the same `Secure` and `SameSite` values or browsers will keep or reject cookies inconsistently.

For Render:

- Set `NODE_ENV=production`.
- Set `FRONTEND_URL` to the deployed frontend origin, for example `https://playtube.vercel.app`.
- Set `BASE_URL` to the same deployed frontend origin.
- Set HTTPS backend/frontend origins and enable Axios `withCredentials: true` on browser API calls.
- Do not set a cookie `Domain` between independent Render/Vercel hostnames.
- Render environment variables override `backend/.env`; update the Render dashboard rather than relying on a local `.env` file.
- Cookies work across Render/Vercel only as HTTPS cross-site cookies: `Secure=true` and `SameSite=None`.
- Browsers may block third-party cookies in strict privacy modes, including private browsing. If strict blocking is observed, use a custom domain/subdomains or a reverse proxy so frontend and backend are same-site.

## Middleware

### Access token middleware

`src/middleware/auth.middleware.js`

- Reads `req.cookies.accessToken`
- Verifies `JWT_ACCESS_SECRET`
- Expects decoded `userId`
- Loads the user
- Assigns `req.user`
- Continues to protected controller

Invalid-payload and user-not-found branches now call the correctly named `clearaccessTokenCookie` helper.

### Refresh token middleware

- Reads `req.cookies.refreshToken`
- Verifies `JWT_REFRESH_SECRET`
- Expects decoded `userId`
- Loads the user
- Assigns `req.user`

### Upload middleware

`src/middleware/multer.middleware.js`

- `uploadAvatar`: avatar field
- `uploadImage`: `Image` field
- `uploadVideo`: `video` field
- `uploadVideoAndThumbnail`: fields `video` and `thumbnailImage`

Multer configuration is in `src/config/multer.config.js`.

Allowed:

- Images: JPEG, PNG, WebP
- Videos: MP4, AVI, MOV
- 15 MB video limit
- 2 MB image limit

## MongoDB models

### User

File: `src/models/user.model.js`

Fields:

- `username`: required, unique
- `email`: required, unique
- `password`: required
- `profilePictureUrl`: default empty string
- `channels`: array of owned Channel IDs, default `[]`
- `subscribedChannels`: array of subscribed Channel IDs, default `[]`
- timestamps

Do not return password or refresh-token fields in public responses.

### Channel

Channel creation is `POST /api/auth/channels`, protected by access-token validation and `uploadImage` middleware. The multipart image field is exactly `Image`; accepted types are JPEG, PNG, and WebP, up to 5 MB. The frontend handle format is lowercase letters, digits, and hyphens, matching `createChannelService` validation.

`GET /api/auth/channels/me` returns `{ success: true, data: { channel } }`; `data.channel` is `null` when the user has not created a channel. Keep this response shape consistent for both cases. The frontend channel service also normalizes the response for existing consumers.

Create-channel controller status: missing data/logo/handle returns `400`, missing authentication returns `401`, an existing user channel or duplicate handle returns `409`, and unexpected upload/database failures return `500`. The controller exports `{ createChannel, getMyChannel }`; removing the stale commented duplicate implementation prevents `createChannel is not defined` startup crashes.

Channel ownership must use `user.channels`, not `user.channel`. Channel lookup and video-upload ownership selection now read `channels`, and Mongoose initializes the array as `[]`. Live test with `demo1@gmail.com`: channel creation returned `201`, lookup returned `200`, and duplicate creation returned `409`.

File: `src/models/channel.model.js`

Fields:

- `channelName`
- `channelHandle`: required, lowercase, unique
- `description`
- `category`
- `channelLogo`
- `channelLogoKey`
- `owner`
- `subscribersCount`
- `totalVideos`
- `totalViews`

### Video metrics

`GET /api/auth/my-videos` returns the authenticated user's video array in `data` and its count in `totalVideos`. `GET /api/auth/videos/:id` atomically increments the video's `views` field when the video is found, then returns the updated video. This counts successful detail requests, not unique viewers. The frontend my-channel page calculates total views by summing those per-video values and renders real zero counts without demo fallbacks.
- timestamps

### Video

File: `src/models/video.model.js`

Fields:

- `title`
- `description`
- `videoUrl`
- `videoKey`
- `thumbnailUrl`
- `thumbnailKey`
- `category`
- `duration`
- `views`
- `likes`
- `dislikes`
- `comments`
- `tags`
- `visibility`
- `publishedAt`
- `owner`
- `channel`
- timestamps

Allowed categories:

- Education
- Entertainment
- Music
- Sports
- News
- Gaming
- Lifestyle
- Other

Allowed visibility:

- public
- private
- unlisted

### Token

File: `src/models/Token.model.js`

Fields:

- `_id`: string
- `userId`
- `refreshToken`
- `expiresAt`
- `userAgent`
- `ipAddress`
- timestamps

### Comment

File: `src/models/comments.model.js`

- Comment text belongs to one user and video
- Supports optional `parentComment`
- Maximum text length: 2000

### Like

File: `src/models/likes.model.js`

- Unique `(user, video)` index
- Prevents duplicate like records

The video model also stores a user ID array in `likes`; if changing like behavior, keep array and Like model logic synchronized.

## Controllers

### Auth

`src/controllers/auth.controllers.js`

- `signUp`
- `login`
- `logout`
- `refreshToken`

Most functions contain detailed console logging. Remove sensitive token/password logs, but preserve useful status/error logs only when needed.

### Channel

`src/controllers/channel.controller.js`

- `createChannel`
- `getMyChannel`

Create channel:

1. Requires authenticated user
2. Requires name, handle, description, and category
3. Requires `Image` upload
4. Uploads image to S3
5. Uses `createChannelService`
6. Adds channel ID to `User.channel`

Get own channel finds the channel ID in `req.user.channel[0]` and verifies ownership.

### Video

`src/controllers/video.controller.js`

- `videoUpload`
- `getAllVideos`
- `getVideo`
- `deleteVideo`
- `updateVideoDetails`
- `myVideos`
- `likeVideo`

Video upload uses `Promise.allSettled` for video and thumbnail uploads and attempts rollback for partial S3 failure.

Delete, update, and ownership checks rely on the associated channel.

## Services

### Channel service

`src/services/channel.services.js`

- Normalizes channel name and handle
- Requires handle pattern `^[a-z0-9-]+$`
- Checks handle uniqueness
- Creates Channel
- Adds Channel ID to User

### Video service

`src/services/mongoDB-video.services.js`

- Verifies user and channel ownership
- Creates video record
- Increments/decrements channel video count
- Updates allowed fields
- Toggles likes

Important: delete logic has video deletion and S3 thumbnail deletion; S3 video deletion is currently commented.

### Storage services

- `src/services/videosS3.services.js`: video upload/delete
- `src/services/imageS3.services.js`: image/thumbnail upload/delete
- `src/services/imageKit.services.js`: ImageKit integration
- `src/services/cloudfare.services.js`: Cloudflare integration

Treat storage and database operations as separate resources:

- Successful object upload + failed MongoDB insert can leave orphan objects
- Successful MongoDB insert + failed object delete can leave orphan metadata/files
- Prefer existing rollback patterns for focused fixes

## Upload fields

Channel:

- Field name: `Image`
- URL: `/api/auth/channels`

Video:

- Field name: `video`
- Thumbnail field: `thumbnailImage`
- URL: `/api/auth/channels/upload-video`

Text fields:

- `title`
- `description`
- `category`
- `duration`
- `tags`
- `visibility`
- `channelId`

## Response conventions

Most controllers return JSON with:

- `success`
- `message`
- `data`, `channel`, `user`, or `totalVideos`

Use status codes:

- `200`: retrieved or updated successfully
- `201`: user/channel created
- `400`: validation/request error
- `401`: authentication failure
- `404`: resource not found
- `409`: duplicate/conflict
- `500`: server failure

Do not expose raw database errors or secrets in production responses.

## Common implementation bugs to preserve awareness of

1. Signup payload mismatch: `id` versus middleware `userId`.
2. Signup cookie setup is inconsistent with login/refresh cookie helpers.
3. Signup duplicate race and duplicate-key `11000` handling.
4. Signup account creation occurs before token setup.
5. Access middleware typo: `clearAccessTokenCookie` may reference an undefined helper.
6. Refresh middleware sometimes reads `decodedrefreshToken.userId` while signup currently emits `id`.
7. `deleteVideo` in the video controller only verifies ownership by channel and user in certain paths; inspect before extending.
8. Video delete does not currently delete the S3 video object.
9. `videoSchema.index({ visibility: 1, status: 1 })` references a `status` field that is not declared.
10. Environment validation is broad and blocks startup for unrelated services.
11. Detailed logs and token logging may expose sensitive values.
12. No test script exists beyond a placeholder.

## Safe change guidelines

- Keep existing route paths and controller exports unless intentionally changing the API.
- Preserve `{ userId: ... }` JWT payload shape consistently.
- Preserve HttpOnly cookie authentication.
- For signup, make only narrow fixes: payload, cookies, duplicate handling, token null check.
- For auth middleware, fix the helper typo only if observed and relevant.
- Validate ownership in channel/video operations.
- Avoid unnecessary schema migrations.
- Use existing services rather than duplicating S3/MongoDB logic.
- Roll back uploaded objects when MongoDB creation fails.
- Return structured JSON and appropriate HTTP status.
- Do not log passwords, JWTs, cookies, IP-sensitive values, or third-party credentials.
- Do not expose `error.message` to production clients.

## Verification

There is no configured test suite. Minimum manual validation:

1. Register a valid user and confirm `201`.
2. Confirm signup cookies identify the user on `/channels/me`.
3. Confirm duplicate email/username returns `409`.
4. Login valid credentials and confirm access/refresh cookies.
5. Refresh `/refresh-token` and confirm new cookies.
6. Create a channel with an authenticated user.
7. Upload a video and thumbnail.
8. Fetch public videos and the created video.
9. Update and delete only the authenticated owner's video.
10. Verify signup/login/refresh remain functional after CORS changes.

## Before editing

Read only these files unless the task targets another feature:

- Signup/auth: `src/controllers/auth.controllers.js`, `src/middleware/auth.middleware.js`, `src/config/token.config.js`, `src/utils/cookies.utils.js`
- Routes: `src/routes/post.routes.js`
- User model: `src/models/user.model.js`
- Channel: `src/controllers/channel.controller.js`, `src/services/channel.services.js`, `src/models/channel.model.js`
- Video: `src/controllers/video.controller.js`, `src/services/mongoDB-video.services.js`, `src/models/video.model.js`
- Upload: `src/middleware/multer.middleware.js`, relevant S3 service
- Startup/CORS/config: `server.js`, `src/app.js`, `src/config/environment.config.js`
- Frontend contract: frontend `Agent.md` and root `Bottleneck.md`
