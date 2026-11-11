import axios from 'axios';
import React from 'react'

export const AuthRegisterUser = async (payload) => {
    try {
        const registeredUserApi = `${process.env.NEXT_PUBLIC_API_URL}${process.env.NEXT_PUBLIC_AUTH_API_PATH}register-user`;
        const response = await axios.post(registeredUserApi, payload);
        return response;
    } catch (error) {
        console.error('Error registering user:', error);
        throw error;
    }
}
