import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { fetchTransactions } from "../services/transactionService";

// Action async để fetch transactions
export const getTransactions = createAsyncThunk(
    "transactions/getTransactions",
    async (filters, { rejectWithValue }) => {
        try {
            const response = await fetchTransactions(filters);
            return response.data;
        } catch (error) {
            if (error.response?.status === 401 || error.response?.status === 403) {
                window.location.href = "/login"; 
            }
            return rejectWithValue(error.message);
        }
    }
);

const initialState = {
    transactions: {
        docs: []
    },
    loading: false,
    error: null,
    filters: {
        staffId: [],
        status: [],
        bankId: [],
        minAmount: "",
        maxAmount: "",
        startDate: "",
        endDate: "",
        content: "",
        page: 1,
        limit: 10,
    }
};

const transactionsSlice = createSlice({
    name: "transactions",
    initialState,
    reducers: {
        setFilters: (state, action) => {
            state.filters = { ...state.filters, ...action.payload };
        },
        resetFilters: (state) => {
            state.filters = { ...initialState.filters };
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(getTransactions.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getTransactions.fulfilled, (state, action) => {
                state.loading = false;
                state.transactions = action.payload;
            })
            .addCase(getTransactions.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

export const { setFilters, resetFilters } = transactionsSlice.actions;
export default transactionsSlice.reducer;
