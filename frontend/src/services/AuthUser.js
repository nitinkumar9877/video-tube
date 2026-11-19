import axios from "axios";

export const AuthRegisterUser = async (payload) => {

    // 3: Register a user
    // http://localhost:1111/api/auth/register-user
    // {
    //     "username":"Hello21",
    //     "email":"hello123@gmail.com",
    //     "password":"Hello12345@"
    // }

    try {

        const registeredUserApi = `${process.env.NEXT_PUBLIC_API_URL}${process.env.NEXT_PUBLIC_AUTH_API_PATH}register-user`;
        // console.log("Registered User API :: ", registeredUserApi);
        // console.log("Payload :: ", payload);
        const response = await axios.post(registeredUserApi, payload, { withCredentials: true });
        console.log("Response from register user API :: ", response.data);
        return response.data;
    } catch (error) {
        console.log(
            "Registration failed:",
            error.response?.data || error.message
        );
        throw error;
    }
};

export const AuthLoginUser = async (payload) => {
    try {
        const loginUserApi = `${process.env.NEXT_PUBLIC_API_URL}${process.env.NEXT_PUBLIC_AUTH_API_PATH}login`;

        const response = await axios.post(loginUserApi, payload, { withCredentials: true });
        return response.data;
    } catch (error) {
        console.log(
            "Login failed:",
            error.response?.data || error.message
        );
        throw error;
    }
};

export const logoutUser = async () => {
    try {
        const logoutApi = `${process.env.NEXT_PUBLIC_API_URL}${process.env.NEXT_PUBLIC_AUTH_API_PATH}logout`;

        // http://localhost:1111/api/auth/logout
        const response = await axios.post(logoutApi, {}, { withCredentials: true });
        console.log("Response from logout API :: ", response.data);
        return response.data;
    } catch (error) {
        console.error("Logout failed:", error.response?.data || error.message);
        throw error;
    }
};

export const checkAlreadyLogin = async () => {
    const checkLoginApi = `${process.env.NEXT_PUBLIC_API_URL}${process.env.NEXT_PUBLIC_AUTH_API_PATH}refresh-token`;
    const response = await axios.post(checkLoginApi, {}, { withCredentials: true });
    console.log("Response from checkAlreadyLogin API :: ", response);
    if (response?.data?.success) {
        return response.data;
    }
    return { success: false, message: "User is not logged in" };
};