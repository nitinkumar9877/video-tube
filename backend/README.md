npm install express mongoose dotenv cors
npm install bcryptjs jsonwebtoken cookie-parser
npm install multer helmet express-rate-limit
npm install zod morgan compression
npm install nodemailer
npm install fluent-ffmpeg
npm install hls.js
npm install --save-dev nodemon


curl -X GET "https://api.cloudflare.com/client/v4/user/tokens/verify" \
  -H "Authorization: Bearer CLOUDFARE_API_KEY"

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
