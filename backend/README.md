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