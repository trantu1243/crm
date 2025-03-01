import axios from "axios";
import { SERVER_URL } from "./url";

const API_URL = `${SERVER_URL}/v1/bank-account`;

export const fetchBankAccounts = async () => {
    try {

        const response = await axios.get(API_URL, {
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${localStorage.getItem("token")}`
            }
        });

        return response.data;
    } catch (error) {
        console.error("Error fetching bankAccounts", error);

        if (error.response?.status === 401 || error.response?.status === 403) {
            localStorage.removeItem("token");
            window.location.href = "/login";
        }

        throw error.response?.data?.message || "Failed to fetch bankAccounts!";
    }
};

export const createBankAccount = async (data) => {
    try {
        const response = await axios.post(`${API_URL}/create`, data, {
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${localStorage.getItem("token")}`
            },
        });
        return response.data;
    } catch (error) {
        console.error("Error creating bankAccount", error);

        if (error.response?.status === 401 || error.response?.status === 403) {
            localStorage.removeItem("token");
            window.location.href = "/login";
        }

        throw error.response?.data?.message || "Failed to creating bankAccount!";
    }  
};

export const updateBankAccount = async (id, data) => {
    try {
        const response = await axios.post(`${API_URL}/${id}/update`, data, {
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${localStorage.getItem("token")}`
            },
        });
        return response.data;
    } catch (error) {
        console.error("Error updating bankAccount", error);

        if (error.response?.status === 401 || error.response?.status === 403) {
            localStorage.removeItem("token");
            window.location.href = "/login";
        }

        throw error.response?.data?.message || "Failed to updating bankAccount!";
    }  
};

export const deleteBankAccount = async (id) => {
    try {
        const response = await axios.post(`${API_URL}/${id}/delete`, {}, {
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${localStorage.getItem("token")}`
            },
        });
        return response.data;
    } catch (error) {
        console.error("Error deleting bankAccount", error);

        if (error.response?.status === 401 || error.response?.status === 403) {
            localStorage.removeItem("token");
            window.location.href = "/login";
        }

        throw error.response?.data?.message || "Failed to deleting bankAccount!";
    }  
};
