1: Upload video with thumbnail data(video,thumbnailImage) Done
http://localhost:1111/api/auth/channels/upload-video 

2: Login a user Done
http://localhost:1111/api/auth/login
{
    "email":"hello123@gmail.com",
    "password":"Hello12345@"
}

3: Register a user Done
http://localhost:1111/api/auth/register-user
{
    "username":"Hello21",
    "email":"hello123@gmail.com",
    "password":"Hello12345@"
}

4: create a channel but only when the user is login Done
http://localhost:1111/api/auth/channels
channelName, description, category, channelHandle, channelLogo, channelBanner  from req.body

5: logout user Done
http://localhost:1111/api/auth/logout

6: gen new access token Done
http://localhost:1111/api/auth/refresh-token

7: get all video Done
http://localhost:1111/api/auth/videos

8: get video by _id Done
http://localhost:1111/api/auth/videos/6afc3c2f2d6de648173d22aa

9: delete video but it will delete only when the user id and user channel are same and the owner of the video is same. Done
it takes _id from the params of the url.
http://localhost:1111/api/auth/videos/6afd32fa61cddeb6d3e3e56b

10: get all video of the current user channel Done
http://localhost:1111/api/auth/my-videos

11: Update the video details and take data from the req.body; DONE
http://localhost:1111/api/auth/videos/6afd3de4d084ce9e15d88d6e

12: for like and unlike Done
/api/auth/videos/:id/like
http://localhost:1111/api/auth/videos/6afd5067b8b1c2481c712e80/like

13: to get the my channel but it is only and only valid when the user is login Done
http://localhost:1111/api/auth/channels/me

14: Get My profile DONE
http://localhost:1111/api/auth/myProfile

15: Get channel list which is Suscribed by the login user DONE
http://localhost:1111/api/auth/subscribed-channels

16: SignUp with Google Method: Post DONE
http://localhost:1111/api/auth/Google-Register
<!-- Need an API to create the Login with Google -->

17: For do a comments Method: Post DONE
http://localhost:1111/api/auth/videos/6b0035e9b032860cf4e28976/comment

18: To get all comments from one video method: Get DONE
http://localhost:1111/api/auth/videos/6b0035e9b032860cf4e28976/comments

19: delete comment from the video DONE
http://localhost:1111/api/auth/videos/:videoId/comment/:commentId

20: GetAnyUserSome Details DONE with Get All Comments API
http://localhost:1111/api/auth/users/:userId

21: Get my liked Video after login DONE
http://localhost:1111/api/auth/my-liked-videos

22: Only remove likes DONE
http://localhost:1111/api/auth/videos/6b003a9cb032860cf4e289cb/remove-like


