import axios from "axios";

const API_URL = "http://localhost:3000/v1";

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
        console.log(error)
        throw error.response?.data?.message || "Đăng nhập thất bại!";
    }
};

export const verifyToken = async (token) => {
    try {
        const response = await axios.post(`${API_URL}/auth/verify-token`, {}, {
            headers: { Authorization: `Bearer ${token}` }
        });        
        console.log(response.data)
        return response.data;
    } catch (error) {
        localStorage.removeItem("token");
        window.location.href = "/login";
        throw new Error("Token không hợp lệ");
    }
};