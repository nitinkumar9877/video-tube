// http://localhost:1111/api/auth/channels/me
import axios from "axios";
export const getMyChannel = async () => {
    try {
        const myChannelApi = `${process.env.NEXT_PUBLIC_API_URL}${process.env.NEXT_PUBLIC_AUTH_API_PATH}channels/me`;
        const response = await axios.get(myChannelApi, {}, {
            credentials: "true",
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        };
        console.log("My Channel Data:", response.data);
        return response.data;
    } catch (error) {
        console.error("Error fetching my channel:", error);
        throw error;
    }
};
