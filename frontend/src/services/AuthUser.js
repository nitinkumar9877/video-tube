import axios from "axios";

export const AuthRegisterUser = async (payload) => {
    try {
        const registeredUserApi =`${process.env.NEXT_PUBLIC_API_URL}${process.env.NEXT_PUBLIC_AUTH_API_PATH}register-user`;

        const response = await axios.post(registeredUserApi, payload, {withCredentials: true});
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
        const loginUserApi =`${process.env.NEXT_PUBLIC_API_URL}${process.env.NEXT_PUBLIC_AUTH_API_PATH}login`;

        const response = await axios.post(loginUserApi, payload, {withCredentials: true});
        return response.data;
    } catch (error) {
        console.log(
            "Login failed:",
            error.response?.data || error.message
        );
        throw error;
    }
};
