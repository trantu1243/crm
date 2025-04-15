import axios from "axios";
import { SERVER_URL } from "./url";

const API_URL = `${SERVER_URL}/v1/customer`;

export const fetchCustomer = async () => {
    try {
        const response = await axios.get(API_URL, {
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${localStorage.getItem("token")}`
            }
        });

        return response.data;
    } catch (error) {
        console.error("Error fetching customers", error);

        if (error.response?.status === 401 || error.response?.status === 403) {
            localStorage.removeItem("token");
            window.location.href = "/login";
        }

        throw error.response?.data?.message || "Failed to fetch customers!";
    }
};

export const toggleWhitelistCustomer = async (id) => {
    try {
        const response = await axios.post(`${API_URL}/toggle-white-list/${id}`, {}, {
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${localStorage.getItem("token")}`
            },
        });
        return response.data;
    } catch (error) {
        console.error("Error fetching customers", error);

        if (error.response?.status === 401 || error.response?.status === 403) {
            localStorage.removeItem("token");
            window.location.href = "/login";
        }

        throw error.response?.data?.message || "Failed to toggle white list!";
    }
}

export const toggleBlacklistCustomer = async (id) => {
    try {
        const response = await axios.post(`${API_URL}/toggle-black-list/${id}`, {}, {
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${localStorage.getItem("token")}`
            },
        });
        return response.data;
    } catch (error) {
        console.error("Error fetching customers", error);

        if (error.response?.status === 401 || error.response?.status === 403) {
            localStorage.removeItem("token");
            window.location.href = "/login";
        }

        throw error.response?.data?.message || "Failed to toggle black list!";
    }
}

export const updateTagCustomer = async (data) => {
    try {
        const response = await axios.post(`${API_URL}/update-tag`, data, {
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${localStorage.getItem("token")}`
            },
        });
        return response.data;
    }catch (error) {
        console.error("Error fetching customers", error);

        if (error.response?.status === 401 || error.response?.status === 403) {
            localStorage.removeItem("token");
            window.location.href = "/login";
        }

        throw error.response?.data?.message || "Failed to update tags list!";
    }
}