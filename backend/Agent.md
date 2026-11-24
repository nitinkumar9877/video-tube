# Backend Agent Memory

## Purpose

This file is the persistent implementation memory for the `backend/` portion of the YouTubeClone project. Read this file before changing backend code. Keep it accurate after every backend change. For changes that affect the frontend contract, also update `../frontend/Agent.md`.

## Runtime and Entry Points

- Runtime: Node.js CommonJS (`"type": "commonjs"` in `package.json`).
- Start commands: `npm start` and `npm run dev` both run `nodemon server.js`.
- `server.js` imports `src/app.js`, loads environment configuration, connects to MongoDB, then listens on `configData.PORT`.
- `src/app.js` creates the Express app, enables CORS and cookie parsing, and mounts all application routes at `/api/auth`.
- Production/development behavior is controlled by `NODE_ENV` and cookie settings in `src/utils/cookies.utils.js`.

## Source Map

- `server.js`: process entry point; database connection and HTTP listener.
- `src/app.js`: Express setup, CORS policy, JSON/form parsing, cookies, and route mount.
- `src/routes/post.routes.js`: single central API route table.
- `src/controllers/`: HTTP request orchestration and response shaping.
- `src/middleware/`: access/refresh token validation and Multer upload handling.
- `src/models/`: Mongoose schemas and models.
- `src/services/`: channel, video, S3, ImageKit, Cloudflare, and MongoDB operations.
- `src/config/`: environment, JWT, database-independent clients, S3, ImageKit, Cloudinary, Multer, and Passport setup.
- `src/utils/`: cookies, password/token hashing helpers, and error logging.
- `src/mongoDb/connection.mongoDb.js`: Mongoose connection helper.
- `storage/`, `uploads/`: local temporary/upload storage areas; do not treat as source of truth.
- `public/`: backend public/static files.
- `test-cloudinary.js`: Cloudinary integration test script.

## API Mount and Route Table

Base route: `/api/auth`.

Public routes:
- `POST /register-user`: create a local account.
- `POST /login`: authenticate email/password and create cookie-backed sessions.
- `POST /logout`: clear access and refresh cookies.
- `POST /refresh-token`: refresh/validate the user session using refresh-token middleware.
- `POST /Google-Register`: verify a Google credential and create/link a user/session.
- `GET /videos`: list videos.
- `GET /videos/:id`: retrieve and increment a video's view count.

Access-token-protected routes:
- `POST /channels`: create a channel; accepts multipart field `Image`.
- `POST /channels/upload-video`: upload video plus thumbnail; accepts multipart fields `video` and `thumbnailImage`.
- `POST /videos/:key/like`: like a video by video key/id.
- `GET /myProfile`: return the authenticated user profile.
- `GET /channels/me`: return the authenticated user's channel, or `channel: null`.
- `GET /subscribed-channels`: return valid subscribed channels and remove stale subscriptions.
- `GET /my-videos`: return videos owned by the authenticated user.
- `PATCH /videos/:key`: update video details.
- `DELETE /videos/:key`: delete a video and associated stored objects/data.

The comments and route names show that the project evolved over time. Preserve or explicitly document route compatibility when changing route names.

## Authentication Logic

### Local signup

`signUp` in `src/controllers/auth.controllers.js`:
- trims username and lowercases email;
- requires username, email, and password;
- validates email format and strong password rules using `validator`;
- rejects existing email or username with HTTP 409;
- hashes passwords with `bcryptjs`;
- creates the user;
- generates access and refresh JWTs;
- stores a refresh-token session in `Token`;
- sets access and refresh cookies;
- returns the public user fields.

Rolls back the newly created user if token generation or later setup fails.

### Local login

`login`:
- requires email and password;
- normalizes the email;
- finds the user and compares the password hash;
- generates access/refresh tokens;
- stores a refresh-token session;
- sets both cookies;
- returns public user fields.

### Google login/signup

`googleAuthSignup` verifies the Google ID credential with `google-auth-library`, validates `email_verified`, looks up or creates a user, generates session tokens, stores the refresh session, sets cookies, and returns public user fields.

The current implementation requires Google environment configuration and the frontend `GoogleOAuthProvider` client ID. Treat this as a credential exchange: the frontend sends a Google credential, not the raw Google user password.

### JWT and cookies

- Access-token lifetime: 5 minutes.
- Refresh-token lifetime: 7 days.
- Both are HTTP-only cookies.
- Development: `secure: false`, `sameSite: lax`.
- Production: `secure: true`, `sameSite: none`.
- Access cookie name: `accessToken`.
- Refresh cookie name: `refreshToken`.

`src/config/token.config.js` creates JWTs from payloads. `src/middleware/auth.middleware.js` verifies cookies and attaches the MongoDB user document to `req.user`.

Refresh validation:
- verifies the refresh JWT;
- finds the user;
- confirms a matching, unexpired `Token` session in MongoDB;
- attaches `req.user`.

When logout or session invalidation occurs, clear both cookies. Do not expose refresh or access tokens in JSON responses.

## Mongoose Models

### User

Fields:
- `username`: required, unique, trimmed.
- `email`: required, unique, lowercase, trimmed.
- `password`: optional because Google users may not have a password.
- `googleId`: unique, sparse.
- `profilePictureUrl`: default empty string.
- `subscribedChannels`: array of Channel references.
- `channels`: array of Channel references.
- timestamps enabled.

### Channel

Fields include:
- `channelName`, `description`, `category`, `channelHandle`;
- `channelLogo` and `channelLogoKey`;
- `owner` as a User reference;
- subscribers and subscriber count behavior;
- timestamps and creation metadata.

Channel handles are validated with `/^[a-z0-9-]+$/`. The channel service creates the channel and adds its ID to the owner's `channels` array.

### Video

Fields:
- title, description, category, duration;
- video URL/key and thumbnail URL/key;
- tags, visibility, published date;
- views and likes;
- comments reference;
- `owner` and `channel` references;
- timestamps.

Categories: `Education`, `Entertainment`, `Music`, `Sports`, `News`, `Gaming`, `Lifestyle`, `Other`.

Visibility: `public`, `private`, `unlisted`.

Likes are stored as an array of User ObjectIds.

### Token

Fields:
- `_id`: session ObjectId;
- `userId`;
- refresh token string;
- expiration date;
- optional user agent and IP address;
- timestamps.

### Comment and Like

`comments.model.js` and `likes.model.js` provide model definitions for comment/like data where used. Keep references consistent with the Mongoose names `Comment`, `Like`, `Video`, `Channel`, and `User`.

## Controllers and Services

- `auth.controllers.js`: signup, login, logout, refresh, and profile operations.
- `googleAuth.controller.js`: Google credential verification and Google-backed sessions.
- `channel.controller.js`: channel creation and channel/subscription reads.
- `channel.services.js`: channel database operations and User/Channel relationship updates.
- `video.controller.js`: upload, list, retrieve, delete, update, my-videos, and like operations.
- `mongoDB-video.services.js`: video MongoDB creation, deletion, updates, and like logic.
- `videosS3.services.js`: put/get/delete video objects in S3.
- `imageS3.services.js`: put/get/delete thumbnails/profile/channel images in S3.
- `cloudfare.services.js`: legacy Cloudflare upload service, currently not mounted in the active video upload path.
- `imageKit.services.js`: ImageKit upload/deletion helper.
- `cloudinary.config.js`: Cloudinary upload helper.

## File Upload Logic

Multer configuration in `src/config/multer.config.js` and `src/middleware/multer.middleware.js`:
- image field `Image` for channel creation;
- image field `avatar` for the optional avatar middleware;
- video field `video` and thumbnail field `thumbnailImage` for video upload;
- allowed images: JPEG, PNG, WebP;
- allowed videos: MP4, AVI, MOV;
- uploads use memory storage and are passed to external object storage.

Video upload flow:
1. Access middleware validates the user.
2. Multipart middleware validates and exposes files.
3. Controller validates metadata, tags, category, duration, and visibility.
4. Video and thumbnail upload to S3 with `Promise.allSettled`.
5. If one upload fails, successfully uploaded objects are deleted as rollback.
6. MongoDB video data is created through `uploadVideoDataToMongoDB`.

Channel upload flow:
1. Access middleware validates the user.
2. Image middleware validates `Image`.
3. Profile/channel image is uploaded to S3.
4. Channel data is inserted and linked to the user.

## Environment Variables

Required or validated by `src/config/environment.config.js`:
- `PORT`
- `MONGODBURL`
- `JWT_REFRESH_SECRET`
- `JWT_ACCESS_SECRET`
- `NODE_ENV`
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `BASE_URL`

Optional/feature-specific:
- `FRONTEND_URL`: required by environment validation in production.
- `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`
- `IMAGEKIT_URL_ENDPOINT_URL`, `IMAGEKIT_PUBLIC_KEY`, `IMAGEKIT_PRIVATE_KEY`
- `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`
- `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_REGION`, `AWS_BUCKET_NAME`

Never commit real secrets. `.env` is local configuration and must not be copied into source documentation or commits.

## CORS and Cookie Integration

- Express allows origins from comma-separated `FRONTEND_URL` values.
- Vercel preview URLs matching `video-tube-*.vercel.app` are also allowed.
- Without an Origin header, CORS permits the request.
- CORS credentials are enabled.
- Frontend requests that depend on cookies must use `withCredentials: true`.
- Cross-origin production deployments require `secure: true` and `sameSite: none`.

## Response Conventions

Most success responses include `success: true` and a `message`. Data varies by endpoint: `data`, `channel`, `channels`, `video`, `user`, or `total...` fields.

Most validation/auth/server failures include `success: false` plus `message` or `error`. Status codes should remain HTTP-appropriate:
- 400: missing/invalid input;
- 401: missing/invalid/expired authentication;
- 409: duplicate identity or conflict;
- 404: missing entity;
- 500: backend/internal failure.

Use `printCatchBlockError` for consistent controller/service logging where that utility is already used.

## Current Known Implementation Notes

- `src/routes/post.routes.js` imports `passport` but does not currently mount Passport routes; Google uses the credential controller instead.
- Route/key naming includes inconsistent video identifiers: public routes use `:id`, while update/delete/like routes use `:key`.
- `videoSchema.index({ visibility: 1, status: 1 })` references a `status` field that is not declared in the current schema.
- The Google auth controller should be checked whenever Google behavior changes because it depends on several imports and token/session conventions.
- Several controllers contain large `console.log` diagnostics. Preserve or remove deliberately, not incidentally.

## Change Discipline

Before editing:
1. Identify the owning route/controller/model/service.
2. Check whether the change affects cookies, JWT payloads, Mongoose relationships, S3 keys, or frontend response parsing.
3. Make the smallest focused change.
4. Preserve public response shapes unless the contract is intentionally updated.
5. Validate with `npm run dev` or a focused route/script test.

After every backend change:
1. Update this `Agent.md` with new files, routes, fields, logic, environment variables, dependencies, and known limitations.
2. Update `../frontend/Agent.md` for any request, response, cookie, route, or environment contract change.
3. Run `npm run dev` startup or the narrowest available test/check.
4. Remove stale documentation instead of leaving contradictory memory.
