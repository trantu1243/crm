import axios from "axios";
import { SERVER_URL } from "./url";

const API_URL = `${SERVER_URL}/v1/transaction`;

export const fetchTransactions = async (filters) => {
    try {
        const formattedFilters = new URLSearchParams();

        Object.entries(filters).forEach(([key, value]) => {
            if (Array.isArray(value)) {
                value.forEach(item => formattedFilters.append(`${key}[]`, item));
            } else if (value) {
                formattedFilters.append(key, value);
            }
        });
        const response = await axios.get(`${API_URL}?${formattedFilters.toString()}`, {
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${localStorage.getItem("token")}`
            }
        });

        return response.data;
    } catch (error) {
        console.error("Error fetching transactions", error);

        if (error.response?.status === 401 || error.response?.status === 403) {
            localStorage.removeItem("token");
            window.location.href = "/login";
        }

        throw error.response?.data?.message || "Failed to fetch transactions!";
    }
};

export const fetchTransactionById = async (id) => {
    try {
        const response = await axios.get(`${API_URL}/${id}`, {
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${localStorage.getItem("token")}`
            }
        });
        return response.data;
    } catch (error) {
        console.error("Error fetching transaction", error);

        if (error.response?.status === 401 || error.response?.status === 403) {
            localStorage.removeItem("token");
            window.location.href = "/login";
        }

        throw error.response?.data?.message || "Failed to fetch transaction!";
    }
};

export const createTransaction = async (transactionData) => {
    try {
        const response = await axios.post(`${API_URL}/create`, transactionData, {
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${localStorage.getItem("token")}`
            },
        });
        return response.data;
    } catch (error) {
        console.error("Error creating transaction", error);

        if (error.response?.status === 401 || error.response?.status === 403) {
            localStorage.removeItem("token");
            window.location.href = "/login";
        }

        throw error.response?.data?.message || "Failed to creating transaction!";
    }  
};

export const confirmTransaction = async (id) => {
    try {
        const response = await axios.post(`${API_URL}/${id}/confirm`, {}, {
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${localStorage.getItem("token")}`
            },
        });
        return response.data;
    } catch (error) {
        console.error("Error confirming transactions", error);

        if (error.response?.status === 401 || error.response?.status === 403) {
            localStorage.removeItem("token");
            window.location.href = "/login";
        }

        throw error.response?.data?.message || "Failed to confirming transaction!";
    }  
};

export const updateTransaction = async (id, data) => {
    try {
        const response = await axios.post(`${API_URL}/${id}/update`, data, {
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${localStorage.getItem("token")}`
            },
        });
        return response.data;
    } catch (error) {
        console.error("Error updating transactions", error);

        if (error.response?.status === 401 || error.response?.status === 403) {
            localStorage.removeItem("token");
            window.location.href = "/login";
        }

        throw error.response?.data?.message || "Failed to updating transaction!";
    }  
};

export const cancelTransaction = async (id) => {
    try {
        const response = await axios.post(`${API_URL}/${id}/cancel`, {}, {
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${localStorage.getItem("token")}`
            },
        });
        return response.data;
    } catch (error) {
        console.error("Error cancel transactions", error);

        if (error.response?.status === 401 || error.response?.status === 403) {
            localStorage.removeItem("token");
            window.location.href = "/login";
        }

        throw error.response?.data?.message || "Failed to cancel transaction!";
    }  
};