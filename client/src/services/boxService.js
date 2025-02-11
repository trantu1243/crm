import axios from "axios";
import { SERVER_URL } from "./url";

const API_URL = `${SERVER_URL}/v1/box-transaction`;

export const fetchBoxTransactionById = async (id) => {
    try {
        const response = await axios.get(`${API_URL}/${id}`, {
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${localStorage.getItem("token")}`
            }
        });
        console.log(response.data)
        return response.data;
    } catch (error) {
        console.error("Error fetching box transaction", error);

        if (error.response?.status === 401 || error.response?.status === 403) {
            localStorage.removeItem("token");
            window.location.href = "/login";
        }

        throw error.response?.data?.message || "Failed to fetch box transaction!";
    }
};

export const undoBoxService = async (id) => {
    try {
        const response = await axios.post(`${API_URL}/${id}/undo`, {}, {
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${localStorage.getItem("token")}`
            },
        });
        return response.data;
    } catch (error) {
        console.error("Error creating transactions", error);

        if (error.response?.status === 401 || error.response?.status === 403) {
            localStorage.removeItem("token");
            window.location.href = "/login";
        }

        throw error.response?.data?.message || "Failed to creating transaction!";
    }  
};