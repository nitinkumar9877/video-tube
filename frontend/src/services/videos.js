import api from "@/services/api";

export const getAllVideos = async (cursor = null, limit = 24) => {
    try {
        const response = await api.get("/api/auth/videos", {
            params: { cursor: cursor || undefined, limit }
        });
        return response.data;
    }
    catch (error) {
        console.error("Error fetching videos:", error);
        throw error;
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
        const response = await api.get(`/api/auth/videos/${id}`);
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
        const response = await api.post(`/api/auth/videos/${videoId}/like`, {});
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
        const response = await api.post(`/api/auth/videos/${videoId}/comment`, { comment });
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

export const getComments = async (videoId, cursor = null, limit = 50) => {
    try {
        const response = await api.get(`/api/auth/videos/${videoId}/comments`, {
            params: { cursor: cursor || undefined, limit }
        });
        if (!response.data.success) {
            return { success: false, message: "Failed to fetch comments" };
        }

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
        const response = await api.delete(`/api/auth/videos/${videoId}/comment/${commentId}`);
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
        const response = await api.get("/api/auth/my-liked-videos");
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
        const response = await api.delete(`/api/auth/videos/${videoId}/remove-like`);
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
        const response = await api.patch(`/api/auth/videos/${videoId}`, updatedDetails);
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
        const response = await api.delete(`/api/auth/videos/${videoId}`);
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
