import axios from "axios";
import api from "@/services/api";
export const getAllVideos = async () => {
    try {
        const url = `${process.env.NEXT_PUBLIC_API_URL}${process.env.NEXT_PUBLIC_AUTH_API_PATH}videos`;
        const response = await axios.get(url);
        console.log("Response from getAllVideos:", response.data);
        return response.data;
    }
    catch (error) {
        console.error("Error fetching videos:", error);
    }
};

// http://localhost:1111/api/auth/my-videos
export const getMyVideos = async () => {
    try {
        const response = await api.get("/api/auth/my-videos");
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