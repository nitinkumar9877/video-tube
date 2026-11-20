This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.js`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.




1: Upload video with thumbnail data(video,thumbnailImage)
http://localhost:1111/api/auth/channels/upload-video 

2: Login a user
http://localhost:1111/api/auth/login
{
    "email":"hello123@gmail.com",
    "password":"Hello12345@"
}

3: Register a user
http://localhost:1111/api/auth/register-user
{
    "username":"Hello21",
    "email":"hello123@gmail.com",
    "password":"Hello12345@"
}

4: create a channel but only when the user is login
http://localhost:1111/api/auth/channels
channelName, description, category, channelHandle, channelLogo, channelBanner  from req.body


5: logout user
http://localhost:1111/api/auth/logout

6: gen new access token
http://localhost:1111/api/auth/refresh-token

7: get all video
http://localhost:1111/api/auth/videos

8: get video by _id
http://localhost:1111/api/auth/videos/6afc3c2f2d6de648173d22aa

9: delete video but it will delete only when the user id and user channel are same and the owner of the video is same.
it takes _id from the params of the url.
http://localhost:1111/api/auth/videos/6afd32fa61cddeb6d3e3e56b

10: get all video of the current user channel
http://localhost:1111/api/auth/my-videos

11: Update the video details and take data from the req.body;
http://localhost:1111/api/auth/videos/6afd3de4d084ce9e15d88d6e

12: for like and unlike
/api/auth/videos/:id/like
http://localhost:1111/api/auth/videos/6afd5067b8b1c2481c712e80/like

13: to get the my channel but it is only and only valid when the user is login
http://localhost:1111/api/auth/channels/me

14: Get My profile
http://localhost:1111/api/auth/myProfile

15: Get channel list which is Suscribed by the login user 
http://localhost:1111/api/auth/subscribed-channels