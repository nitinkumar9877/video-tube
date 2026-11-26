# What could make PlayTube crash?

I traced the public home feed, video detail page, login/session checks, and video upload path through the frontend and backend. These were the clearest risks in the code. A production incident still needs to be matched against the host's logs and memory/CPU graphs; code review alone cannot prove the exact cause.

## What I found and changed

### 1. Large uploads could use too much memory

The backend keeps uploaded files in memory before sending them to S3. Its video-upload limit was 500 MB per file, while the upload page already limits videos to 5 MB. A few simultaneous large requests could consume substantial RAM and get the production process killed.

**Changed:** the active backend upload path now caps each file at 5 MB, limits the request to two files and bounded form fields, and returns HTTP 413 for a file that is too large. The limit matches the current frontend upload form. If videos need to grow beyond this, upload directly to S3 or stream them rather than buffering them in the Node.js process.

### 2. The API could accept traffic before its database was ready

The server started listening without waiting for MongoDB. Its connection helper also swallowed connection errors, so a deployment could look healthy while database-backed pages failed.

**Changed:** startup now waits for MongoDB and exits with an explicit error if the initial connection fails. Production `npm start` now uses Node directly; `nodemon` remains for development.

### 3. Logout did not clear the browser's token cookies

Both cookie-clearing helpers returned before calling Express's `clearCookie`, so logout could say it succeeded while the browser retained its tokens.

**Changed:** the premature returns are removed, cookie clearing uses the same path/security/SameSite settings as cookie creation, and logout deletes the matching refresh-token session from MongoDB. If revocation fails, the browser cookies are still cleared and the API reports the failure.

### 4. Session checks could race during login

The shared shell and protected pages can check the session at the same time. The shell also initiated a refresh check on login/registration routes even though those pages perform their own check. Parallel refresh calls can race while the backend rotates refresh tokens.

**Changed:** simultaneous frontend session checks now share one in-flight request, and the shell skips its own check on auth pages. The backend now rotates the matching session atomically rather than deleting sessions by IP/user-agent, and a stale concurrent refresh no longer clears cookies. Database errors during refresh validation now return a server error instead of masquerading as an expired login.

### 5. The frontend had two Next.js configuration files

Both `next.config.js` and `next.config.mjs` were present. Having competing Next configuration files can prevent or complicate a production build.

**Changed:** configuration is consolidated into `frontend/next.config.mjs`, including the existing image configuration and supported React/cache options. Unsupported/obsolete experimental flags were removed.

### 6. Production prerendering failed on a URL-dependent hook

The production build failed on `/dashboard/videos/[id]`: the shared app shell uses `usePathname()` without a Suspense boundary. Development did not show this prerender-time failure.

**Changed:** the root layout now places the app shell inside a Suspense boundary with a small loading fallback. The cache and partial-prefetch options are also configured together, as required by the current Next.js build.

### 7. Public video listing returned the entire collection

The anonymous feed loaded every video at once and did not filter by visibility. That makes each response and database read grow with the catalogue, and could expose private or unlisted videos.

**Changed:** `/videos` now returns only public videos, in cursor-paginated batches, with a maximum batch size of 50. The home page requests 24 at a time and offers a “Load more” button. A compound index supports the feed's visibility and sort order. The API no longer runs a full count query for every feed page.

### 8. Private video details were not protected by visibility

The video detail endpoint was public for every video ID, regardless of its visibility setting.

**Changed:** public and unlisted videos remain accessible without login. Private videos are returned only when the request has a valid access cookie belonging to the owner; unauthorized requests receive 404. Video IDs are validated before querying.

### 9. Comment threads could grow without a limit

Long comment threads were returned in a single response and fetched again in full after a comment was added or deleted. That made video pages and repeated comment actions slower as threads grew.

**Changed:** comments are populated with only the public author fields, fetched in cursor-paginated batches of at most 50, and have a matching compound index. The frontend now loads additional batches only when requested, and updates deleted comments locally. Comment reads and writes also verify that the video is visible to the caller, including owner-only access for private videos; comment text is validated before reaching MongoDB.

### 10. An unauthenticated route could reach a user-only controller

`GET /my-videos/:id` was registered without authentication, but its controller read `req.user._id`. Anonymous requests could therefore fail with an internal error instead of being rejected as unauthenticated.

**Changed:** the route now requires a valid access token, and the controller safely handles a missing user. Invalid video, comment, and user IDs also receive a client error instead of becoming database cast errors.

### 11. Protected requests loaded and logged unnecessary user data

The access-token middleware loaded the complete user document—including the password hash—on every protected request and logged the full document. This adds database and log I/O on common routes and can expose account data in production logs.

**Changed:** the middleware now selects only the user fields required by protected controllers and no longer writes the user document to logs. The shared frontend API client also has a 15-second timeout so a stalled API call cannot leave pages waiting indefinitely.

### 12. Video updates were not restricted to the owner

The update endpoint required a login but did not check that the logged-in user owned the video. Invalid IDs and empty updates could also become avoidable server errors or no-op writes.

**Changed:** updates now validate the video ID, enforce ownership, and reject empty updates. The delete path validates IDs too.

### 13. Video deletion left the original video object in S3

The database record and thumbnail were deleted, but the video-object delete call was commented out. Deleted videos could therefore leave large files accumulating in the bucket.

**Changed:** video and thumbnail objects are now deleted together before the database record is removed.

### 14. Startup required unrelated configuration values

The active API requires `GOOGLE_CLIENT_ID` for Google sign-in and `FRONTEND_URL` in production. It also rejected startup when `BASE_URL` or `GOOGLE_CLIENT_SECRET` was missing even though the active routes do not use those values.

**Changed:** those unused values are no longer hard startup requirements. Production still requires `FRONTEND_URL`; configure the frontend origin there so credentialed browser requests pass CORS.
The authentication controller also no longer initializes an unused ImageKit client during backend startup.

### 15. Failed database saves could leave uploaded files behind

The upload path sends the video and thumbnail to S3 before saving the database record. If that save failed, the S3 objects remained and accumulated as orphaned storage.

**Changed:** when the database write fails, the backend attempts to delete both newly uploaded objects and logs any cleanup failures explicitly.

### 16. A channel-count error could leave a video pointing at files that were rolled back

Saving a video and incrementing its channel's video count are separate MongoDB writes. If the second write failed, the upload controller treated the whole operation as failed and removed the S3 objects, but the already-saved video record could remain.

**Changed:** the upload service now removes the saved video record if the channel-count update fails, then rethrows the original error so the controller can roll back the S3 objects.

### 17. Expired access cookies could hide an owner's private video

The access token expires before the refresh token. The video page originally requested the video before refreshing the session, so an owner with a valid refresh token but an expired access token could be treated as anonymous and receive a not-found response for their private video.

**Changed:** the video page now attempts the session refresh before loading the video, while allowing public video loading to continue if the session check itself fails.

### 18. Expired refresh-session records could accumulate in MongoDB

Refresh sessions had an expiry timestamp, but no TTL index, so expired records were never automatically cleaned up.

**Changed:** a MongoDB TTL index now removes expired token-session records. MongoDB applies TTL cleanup asynchronously, so it is not an exact-to-the-second deletion guarantee.

### 19. Some production error responses included raw exception objects

The comment and liked-video handlers included raw backend exceptions in JSON responses. That can expose internal implementation details and makes production errors harder to distinguish from safe, expected API responses.

**Changed:** those endpoints now return a stable generic error message in production and only include the exception message in development.

## Important production checks still needed

- The live URL in the repository README currently responds with HTTP 404 from Vercel: `DEPLOYMENT_NOT_FOUND` (“The deployment could not be found on Vercel.”). This is a hosting/deployment-alias problem, not an application route or backend exception. Verify the Vercel project/domain assignment and deploy a successful production build before testing the live app.
- Confirm production environment variables are present, especially `MONGODBURL`, JWT secrets, `FRONTEND_URL`, AWS bucket/region/credentials, and the frontend's `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_AUTH_API_PATH`, and Google client ID.
- Confirm the deployed MongoDB database has created the public-feed index declared in `backend/src/models/video.model.js` and the session index declared in `backend/src/models/Token.model.js`.
- Check the production platform's request-body limit and timeout settings; they must permit the current 5 MB multipart upload.
- Exercise the deployed CORS and cookie flow over HTTPS: anonymous home/video browsing, anonymous access to protected routes, login, owner-only private video access, refresh, and logout.
- Monitor memory during a permitted upload and verify oversized requests return 413 without restarting the process.
- Use production logs and host metrics to identify whether any reported crash was an out-of-memory kill, failed database connection, build/config error, or a different runtime exception.

This report documents code-level risks and fixes; it does not claim that every possible production error is eliminated. Deployment-specific behavior still needs validation in the actual hosting environment.

## Remaining scale considerations

- Uploads are still buffered in Node.js memory, although the active upload path now caps each file at 5 MB. At high concurrency, monitor memory and move to streaming or presigned S3 uploads before increasing the cap.
- The signed-in video list and liked-video list are not yet paginated. They are typically smaller than the public feed, but could become slow for accounts with very large histories.
- The frontend build can only verify that production routes compile and prerender. It cannot confirm live MongoDB connectivity, AWS permissions, browser cookie policy, environment variables, or production hosting limits.

## Checks run

- Frontend production build: passed, including prerendering and route generation.
- Frontend ESLint: passed with 12 warnings and no lint errors.
- Backend JavaScript syntax checks (application source only) and package JSON parse: passed.
- `git diff --check`: passed.
- No automated backend or frontend test files were present in the repository.
- Live login, database, S3 upload, and production cookie flows could not be exercised because the frontend URL currently resolves to Vercel `DEPLOYMENT_NOT_FOUND`; those flows also require the deployment's MongoDB, AWS, and OAuth configuration.
