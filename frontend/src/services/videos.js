import axios from "axios";
import api from "@/services/api";

export const getAllVideos = async () => {
    try {
        const url = `${process.env.NEXT_PUBLIC_API_URL}${process.env.NEXT_PUBLIC_AUTH_API_PATH}videos`;
        const response = await axios.get(url, {
            withCredentials: true
        });
        console.log("Response from getAllVideos:", response.data);
        return response.data;
    }
    catch (error) {
        console.error("Error fetching videos:", error);
    }
};

export const getMyVideos = async () => {
    try {
        const response = await api.get("/api/auth/my-videos", {
            withCredentials: true
        });
        const responseData = response.data;
        return {
            ...responseData,
            videos: Array.isArray(responseData.data) ? responseData.data : []
        };
    }
    catch (error) {
        console.error("Error fetching my videos:", error);
        return {
            success: false,
            videos: [],
            message: error.response?.data?.message || "Failed to fetch your videos"
        };
    }
};

export const uploadVideo = async (videoData) => {
    try {
        const response = await api.post("/api/auth/channels/upload-video", videoData, {
            withCredentials: true,
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });
        return response.data;
    } catch (error) {
        console.error("Error uploading video:", error.message);
        return {
            success: false,
            message:
                error.response?.data?.message ||
                error.response?.data?.error ||
                error.message ||
                "Failed to upload video"
        };
    }
};

export const getVideoById = async (id) => {
    try {
        console.log("1")
        const apiurl = `${process.env.NEXT_PUBLIC_API_URL}${process.env.NEXT_PUBLIC_AUTH_API_PATH}videos/${id}`;
        console.log("2")

        const response = await axios.get(apiurl, {
            withCredentials: true
        });
        console.log("Response from getVideoById:", response.data);
        if (!response.data.success) {
            return { success: false, message: "Failed to fetch video by ID" };
        }
        return response.data;
    } catch (error) {
        console.error("Error fetching video by ID:", error);
        return {
            success: false,
            message: error.response?.data?.message || "Failed to fetch video by ID"
        };
    }
}

export const doLikeVideo = async (videoId) => {
    try {
        const videoUrl = `${process.env.NEXT_PUBLIC_API_URL}${process.env.NEXT_PUBLIC_AUTH_API_PATH}videos/${videoId}/like`;
        const response = await axios.post(videoUrl, {}, {
            withCredentials: true
        });
        if (!response.data.success) {
            return { success: false, message: "Failed to like video" };
        };
        return response.data;
    } catch (error) {
        console.error("Error liking video:", error);
        return {
            success: false,
            message: error.response?.data?.message || "Failed to like video"
        };
    }
};

export const submitVideoComment = async (comment, videoId) => {
    try {
        const commentUrl = `${process.env.NEXT_PUBLIC_API_URL}${process.env.NEXT_PUBLIC_AUTH_API_PATH}videos/${videoId}/comment`;
        const response = await axios.post(commentUrl, { comment }, {
            withCredentials: true
        });
        if (!response.data.success) {
            return { success: false, message: "Failed to submit comment" };
        }
        return response.data;
    } catch (error) {
        console.error("Error submitting comment:", error);
        return {
            success: false,
            message: error.response?.data?.message || "Failed to submit comment"
        };
    }
}

export const getComments = async (videoId) => {
    try {
        const commentsUrl = `${process.env.NEXT_PUBLIC_API_URL}${process.env.NEXT_PUBLIC_AUTH_API_PATH}videos/${videoId}/comments`;
        const response = await axios.get(commentsUrl, {
            withCredentials: true
        });
        if (!response.data.success) {
            return { success: false, message: "Failed to fetch comments" };
        }

        for (const comment of response.data.data) {
            if (comment.user) {
                const userResponse = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}${process.env.NEXT_PUBLIC_AUTH_API_PATH}users/${comment.user}`, {
                    withCredentials: true
                });
                if (userResponse.data.success) {
                    comment.user = userResponse.data.data.user;
                } else {
                    console.error(`Failed to fetch user data for comment ID ${comment._id}`);
                }
            }
        };
        console.log("Response from getComments:", response.data);
        return response.data;
    } catch (error) {
        console.error("Error fetching comments:", error);
        return {
            success: false,
            message: error.response?.data?.message || "Failed to fetch comments"
        };
    }
};

export const commentDelete = async (videoId, commentId) => {
    try {
        const deleteUrl = `${process.env.NEXT_PUBLIC_API_URL}${process.env.NEXT_PUBLIC_AUTH_API_PATH}videos/${videoId}/comment/${commentId}`;
        const response = await axios.delete(deleteUrl, {
            withCredentials: true
        });
        if (!response.data.success) {
            return { success: false, message: "Failed to delete comment" };
        }
        return response.data;
    } catch (error) {
        console.error("Error deleting comment:", error);
        return {
            success: false,
            message: error.response?.data?.message || "Failed to delete comment"
        };
    }
};

// http://localhost:1111/api/auth/my-liked-videos
export const getMyLikedVideos = async () => {
    try {
        const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}${process.env.NEXT_PUBLIC_AUTH_API_PATH}my-liked-videos`, {
            withCredentials: true
        });
        if (!response.data.success) {
            return { success: false, message: "Failed to fetch liked videos" };
        }
        return response.data;
    } catch (error) {
        console.error("Error fetching liked videos:", error);
        return {
            success: false,
            message: error.response?.data?.message || "Failed to fetch liked videos"
        };
    }
};

export const removeLike = async (videoId) => {
    try {
        const removeLikeUrl = `${process.env.NEXT_PUBLIC_API_URL}${process.env.NEXT_PUBLIC_AUTH_API_PATH}videos/${videoId}/remove-like`;
        const response = await axios.delete(removeLikeUrl, {
            withCredentials: true
        });
        if (!response.data.success) {
            return { success: false, message: "Failed to remove like from video" };
        }
        return response.data;
    } catch (error) {
        console.error("Error removing like from video:", error);
        return {
            success: false,
            message: error.response?.data?.message || "Failed to remove like from video"
        };
    }
};

export const editVideoDetails = async (videoId, updatedDetails) => {
    try {
        const editUrl = `${process.env.NEXT_PUBLIC_API_URL}${process.env.NEXT_PUBLIC_AUTH_API_PATH}videos/${videoId}`;
        const response = await axios.patch(editUrl, updatedDetails, {
            withCredentials: true
        });
        if (!response.data.success) {
            return { success: false, message: "Failed to update video details" };
        }
        return response.data;
    } catch (error) {
        console.error("Error updating video details:", error);
        return {
            success: false,
            message: error.response?.data?.message || "Failed to update video details"
        };
    }
};

export const deleteVideo = async (videoId) => {
    try {
        const deleteUrl = `${process.env.NEXT_PUBLIC_API_URL}${process.env.NEXT_PUBLIC_AUTH_API_PATH}videos/${videoId}`;
        const response = await axios.delete(deleteUrl, {
            withCredentials: true
        });
        if (!response.data.success) {
            return { success: false, message: "Failed to delete video" };
        }
        return response.data;
    } catch (error) {
        console.error("Error deleting video:", error);
        return {
            success: false,
            message: error.response?.data?.message || "Failed to delete video"
        };
    }
};
