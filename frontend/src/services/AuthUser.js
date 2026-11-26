import axios from "axios";

let loginCheckPromise = null;

export const AuthRegisterUser = async (payload) => {
    try {
        const registeredUserApi = `${process.env.NEXT_PUBLIC_API_URL}${process.env.NEXT_PUBLIC_AUTH_API_PATH}register-user`;
        const response = await axios.post(registeredUserApi, payload, {
            withCredentials: true,
            timeout: 15000
        });
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

        const response = await axios.post(loginUserApi, payload, {
            withCredentials: true,
            timeout: 15000
        });
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
    if (loginCheckPromise) {
        return loginCheckPromise;
    }

    const checkLoginApi = `${process.env.NEXT_PUBLIC_API_URL}${process.env.NEXT_PUBLIC_AUTH_API_PATH}refresh-token`;

    loginCheckPromise = axios.post(checkLoginApi, {}, {
        withCredentials: true,
        timeout: 15000
    }).then((response) => {
        if (response?.data?.success) {
            return response.data;
        }

        return { success: false, message: "User is not logged in" };
    }).catch((error) => {
        if (error.response?.status === 401) {
            return { success: false, message: "User is not logged in" };
        }
        throw error;
    }).finally(() => {
        loginCheckPromise = null;
    });

    return loginCheckPromise;
};

export const FetchUserData = async () => {
    const fetchUserApi = `${process.env.NEXT_PUBLIC_API_URL}${process.env.NEXT_PUBLIC_AUTH_API_PATH}myProfile`;

    try {
        const response = await axios.get(fetchUserApi, {
            withCredentials: true,
            timeout: 15000
        });

        if (response?.data?.success) {
            return response.data;
        }
    } catch (error) {
        console.error("Fetching user data failed:", error.response?.data || error.message);
        return { success: false };
    }

    return null;
};

export const AuthGoogleUser = async (credential) => {
    try {
        const googleLoginApi =
            `${process.env.NEXT_PUBLIC_API_URL}` +
            `${process.env.NEXT_PUBLIC_AUTH_API_PATH}Google-Register`;

        const response = await axios.post(
            googleLoginApi,
            { credential },
            {
                withCredentials: true,
                timeout: 15000,
            }
        );

        return response.data;

    } catch (error) {
        console.error(
            "Google authentication failed:",
            error.response?.data || error.message
        );
        throw error;
    }
};