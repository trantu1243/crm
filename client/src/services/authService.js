import axios from "axios";
import { SERVER_URL } from "./url";

const API_URL = `${SERVER_URL}/v1`;

export const login = async (email, password) => {
    try {
        const response = await axios.post(`${API_URL}/auth/login`, 
            { email, password },
            {
                headers: {
                  "Content-Type": "application/json",
                },
            }
        );
        return response.data; // Giả sử server trả về `{ user, token }`
    } catch (error) {
        throw error.response?.data?.message || "Đăng nhập thất bại!";
    }
};

export const verifyToken = async (token) => {
    try {
        const response = await axios.post(`${API_URL}/auth/verify-token`, {}, {
            headers: { Authorization: `Bearer ${token}` }
        });    
        return response.data;
    } catch (error) {
        localStorage.removeItem("token");
        window.location.href = "/login";
        throw new Error("Token không hợp lệ");
    }
};

export const changePasswordService = async (data) => {
    try {
        const response = await axios.post(`${API_URL}/auth/change-password`, 
            data,
            {
                headers: {
                  "Content-Type": "application/json",
                  "Authorization": `Bearer ${localStorage.getItem("token")}`
                },
            }
        );
        return response.data;
    } catch (error) {
        console.error("Error change password", error.response);

        if (error.response?.status === 401 || error.response?.status === 403) {
            localStorage.removeItem("token");
            window.location.href = "/login";
        }

        throw error.response?.data?.message || "Thay đổi mật khẩu thất bại!";
    }
};