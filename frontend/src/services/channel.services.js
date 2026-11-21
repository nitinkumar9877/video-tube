import api from "@/services/api";

export const getMyChannel = async () => {
    try {
        const response = await api.get("api/auth/channels/me", {
            withCredentials: true
        });
        const responseData = response.data;
        const channel = responseData.data?.channel ?? null;

        return { ...responseData, channel };
    } catch (error) {
        console.error("Error fetching my channel:", error);
        return {
            success: false,
            channel: null,
            message: error.response?.data?.message || "Failed to fetch channel data"
        };
    }
};

export const fetchSubscribedChannels = async () => {
    try {     
        // http://localhost:1111/api/auth/subscribed-channels
        const response = await api.get("api/auth/subscribed-channels", {
            withCredentials: true
        });
        const responseData = response.data;
        return responseData;
    } catch (error) {
        console.error("Error fetching subscribed channels:", error);
        return {
            success: false,
            data: [],
            message: error.response?.data?.message || "Failed to fetch subscribed channels"
        };
    }
};