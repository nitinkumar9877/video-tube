import api from "@/services/api";

export const getMyChannel = async () => {
    try {
        const response = await api.get("/api/auth/channels/me");
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
