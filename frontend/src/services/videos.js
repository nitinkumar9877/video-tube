import axios from "axios";
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