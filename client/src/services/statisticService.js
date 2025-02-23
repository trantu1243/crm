import axios from "axios";
import { SERVER_URL } from "./url";

const API_URL = `${SERVER_URL}/v1/statistic`;

export const getMonthlyStatsService = async ({ month, year } = {}) => {
    try {
        const response = await axios.get(`${API_URL}/monthly`, {
            params: { month, year }, 
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${localStorage.getItem("token")}`
            }
        });

        console.log(response.data);
        return response.data;
    } catch (error) {
        console.error("Error fetching monthly stats", error);

        if (error.response?.status === 401 || error.response?.status === 403) {
            localStorage.removeItem("token");
            window.location.href = "/login";
        }

        throw error.response?.data?.message || "Failed to fetch monthly stats!";
    }
};

export const getDailyStatsService = async ({ day, month, year } = {}) => {
    try {
        const response = await axios.get(`${API_URL}/daily`, {
            params: { day, month, year },
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${localStorage.getItem("token")}`
            }
        });

        console.log(response.data);
        return response.data;
    } catch (error) {
        console.error("Error fetching daily stats", error);

        if (error.response?.status === 401 || error.response?.status === 403) {
            localStorage.removeItem("token");
            window.location.href = "/login";
        }

        throw error.response?.data?.message || "Failed to fetch daily stats!";
    }
};

export const getBalanceService = async () => {
    try {
        const response = await axios.get(`${API_URL}/balance`, {
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${localStorage.getItem("token")}`
            }
        });

        console.log(response.data);
        return response.data;
    } catch (error) {
        console.error("Error fetching daily stats", error);

        if (error.response?.status === 401 || error.response?.status === 403) {
            localStorage.removeItem("token");
            window.location.href = "/login";
        }

        throw error.response?.data?.message || "Failed to fetch daily stats!";
    }
};