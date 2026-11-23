# Why API Calls Happen More Than Once

## Short answer

The calls are not being started by the loading screen itself. In most places, React starts an API call from `useEffect`, and the component runs again when React remounts it or the route changes. The project also checks login separately in several places.

There are three main reasons:

1. **The whole application asks about login on every page mount.**
2. **Each protected page asks about login again.**
3. **The same API call can be made again in Next.js development mode because React Strict Mode repeats mount effects.**

## What is happening

### 1. Loading and route changes start `useEffect` again

Changing loading state does not normally repeat an effect. An empty dependency array means “run when this component mounts”:

```jsx
useEffect(() => {
  fetchData();
}, []);
```

However, moving to another route may unmount the old page and mount the new page. Moving back may run the effect again. This is normal.

The following pages fetch data in mount effects:

| Page | API calls started |
|---|---|
| Home `/` | `getAllVideos()` |
| Video `/dashboard/videos/[id]` | `getVideoById(id)` |
| User profile `/user` | `checkAlreadyLogin()`, `FetchUserData()`, `getMyChannel()` |
| My channel `/user/my-channel` | `checkAlreadyLogin()`, `getMyChannel()`, `getMyVideos()` |
| Create channel `/user/createChannel` | `checkAlreadyLogin()`, `getMyChannel()` |
| Upload `/user/my-channel/upload` | Verification calls when the form is submitted |
| Subscriptions `/user/subscribe` | `fetchSubscribedChannels()` |
| Login and register | `checkAlreadyLogin()` when the page mounts |

Examples:

- `frontend/src/app/page.js:56`
- `frontend/src/app/dashboard/videos/[id]/page.js:44`
- `frontend/src/app/user/page.js:16`
- `frontend/src/app/user/my-channel/page.js:45`
- `frontend/src/app/user/createChannel/page.js:28`
- `frontend/src/app/user/subscribe/page.js:14`

### 2. The application shell checks login on every route

The global shell calls `checkAlreadyLogin()` in `frontend/src/components/common/app-shell.js:96`.

That means login is checked by the shell even if the page also checks login. It is not just a layout check; it is a real API request to the `refresh-token` endpoint.

Example of repeated login checks:

- The user opens `/user/my-channel`
- `AppShell` calls `refresh-token`
- The my-channel page calls `refresh-token`
- The page then calls `channels/me`
- The page then calls `my-videos`

Other protected pages repeat the same pattern:

- `/user` repeats auth, profile, and channel requests
- `/user/createChannel` repeats auth and channel requests
- Login and register repeat auth even though they have their own mount effect

The login page has its own call in `frontend/src/app/(auth)/login/page.js:27`, and the register page does the same in `frontend/src/app/(auth)/register-account/page.js:146`. Those calls may also run together with the shell check.

### 3. React Strict Mode can repeat effects in development

This project uses React 19 and Next.js 16. In Next.js development mode, React may run an effect, clean it up, and run it again for mount testing.

In that situation, code like this can make two network requests in development:

```jsx
useEffect(() => {
  fetchData();
}, []);
```

This is not normally what production React does, but it explains why two identical calls can appear in the browser Network tab during `npm run dev`.

It is worth testing in production mode as well:

```bash
npm run build
npm run start
```

Strict Mode should not be disabled as the main fix. It reveals code that is not safe under remounting.

### 4. Logout, login, or routing can keep starting new requests

Several navigation actions redirect while an effect is still running:

- `/dashboard` redirects to `/user` in `frontend/src/app/dashboard/page.js:7`
- `/dashboard/videos` redirects to `/` in `frontend/src/app/dashboard/videos/page.js:8`
- Login pages redirect after authentication
- Protected pages replace the route with `/login`

That can create a short sequence of old-page and new-page requests.

This is normal routing behavior, but every page should abort or ignore work that belongs to an abandoned route.

### 5. Login submissions are guarded, but channel/upload submissions are not fully guarded

Login and register use a `submitInProgress` ref, so two immediate submit events cannot start two login/register requests.

Channel creation and video upload disable the button with `submitting`, but a programmatic double submit or a submit event arriving before React updates the state could still enter the handler twice.

Relevant code:

- `frontend/src/app/user/createChannel/page.js:96`
- `frontend/src/app/user/my-channel/upload/page.js:142`

### 6. Requests are not deduplicated or cached

The app currently uses raw Axios calls in several services. There is no shared:

- React Query/SWR cache
- in-flight request map
- auth provider
- abort controller
- global Axios response handling

Therefore, every call to `checkAlreadyLogin()` is treated as a separate request, even if five components call it at the same time.

The two Axios styles also make behavior inconsistent:

- `frontend/src/services/api.js` uses one Axios instance
- `frontend/src/services/AuthUser.js` creates separate Axios calls directly
- `frontend/src/services/videos.js` mixes both styles

## The recommended solution

### Priority 1: Create one authentication provider

Create a provider near the root layout that owns:

- the current user
- login state
- loading state
- one shared `checkAlreadyLogin()` request
- invalidation after login and logout

The AppShell and protected pages should read auth state from the provider instead of calling the refresh API themselves.

Example structure:

```jsx
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [status, setStatus] = useState("loading");
  const [user, setUser] = useState(null);

  useEffect(() => {
    let active = true;

    checkAlreadyLogin().then((result) => {
      if (!active) return;
      if (result?.success) {
        setUser(result.data?.user ?? result.data ?? null);
        setStatus("authenticated");
      } else {
        setStatus("anonymous");
      }
    });

    return () => {
      active = false;
    };
  }, []);

  return (
    <AuthContext.Provider value={{ status, user }}>
      {children}
    </AuthContext.Provider>
  );
}
```

Wrap `AppShell` with this provider in `frontend/src/app/layout.js`.

Do not automatically call `checkAlreadyLogin()` inside individual protected pages. Redirect based on the provider's auth state.

### Priority 2: Deduplicate simultaneous auth requests

For a fast fix, make `checkAlreadyLogin()` share one in-flight promise:

```js
let authPromise = null;

export const checkAlreadyLogin = () => {
  if (authPromise) return authPromise;

  authPromise = axios.post(checkLoginApi, {}, {
    withCredentials: true,
    timeout: 15000,
  })
    .then((response) => response?.data?.success
      ? response.data
      : { success: false, message: "User is not logged in" })
    .catch((error) => {
      if (error.response?.status === 401) {
        return { success: false, message: "User is not logged in" };
      }
      throw error;
    })
    .finally(() => {
      authPromise = null;
    });

  return authPromise;
};
```

This prevents two components started in the same millisecond from creating two refresh requests.

Clear or update the cache after login and logout. Otherwise, a successful login may still appear logged out until remount.

### Priority 3: Use a data cache

The cleanest frontend fix is React Query or SWR. It provides:

- one request per key
- shared loading/error state
- caching
- automatic deduplication
- manual refresh invalidation

Suggested keys:

- `["current-user"]`
- `["my-channel"]`
- `["my-videos"]`
- `["subscribed-channels"]`
- `["videos"]`
- `["video", videoId]`

For example:

```jsx
const { data, isLoading, error } = useQuery({
  queryKey: ["videos"],
  queryFn: getAllVideos,
  staleTime: 60_000,
});
```

This stops a page from sending the same request on every unrelated rerender.

### Priority 4: Add request cancellation

Effects that start data requests should use an `AbortController` or an `active` flag.

```jsx
useEffect(() => {
  let active = true;

  getAllVideos().then((response) => {
    if (active) setVideos(response.data);
  });

  return () => {
    active = false;
  };
}, []);
```

Axios also supports aborting a request with `AbortController.signal`, which is better than only ignoring the response.

### Priority 5: Stop repeated validation inside submit handlers

For channel creation and video upload:

```jsx
const submitInProgress = useRef(false);

const submit = async (event) => {
  event.preventDefault();
  if (submitInProgress.current) return;

  submitInProgress.current = true;
  setSubmitting(true);

  try {
    await uploadVideoToDb(payload);
  } finally {
    submitInProgress.current = false;
    setSubmitting(false);
  }
};
```

Keep the button disabled, but retain the ref guard for immediate and programmatic double submits.

### Priority 6: One Axios client

Update `frontend/src/services/AuthUser.js` and `frontend/src/services/videos.js` to use the shared client from `frontend/src/services/api.js`.

Configure once:

- `baseURL`
- `withCredentials`
- default timeout
- response/error handling
- auth refresh behavior
- `AbortController` support

Avoid repeating `withCredentials: true` in every call if the shared client already sets it.

## How to confirm the cause

Open the browser Network tab and filter by `refresh-token`, `myProfile`, `channels/me`, or `my-videos`.

Check:

- Does the call occur once or twice in development?
- Does it happen every route change?
- Does the call happen in AppShell and the page together?
- Does it happen again after a redirect?
- Is the request status `(canceled)` or `(aborted)`?
- Is the first call followed by an identical second call?

A normal route change to a page that owns a request should make that request once. It should not make the same auth request repeatedly in the same route visit.
