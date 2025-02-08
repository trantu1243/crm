import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { fetchBills } from "../services/billService";

// Action async để fetch bills
export const getBills = createAsyncThunk(
    "bills/getBills",
    async (filters, { rejectWithValue }) => {
        try {
            const response = await fetchBills(filters);
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
    bills: {
        docs: []
    },
    loading: false,
    error: null,
    filters: {
        staffId: [],
        status: [],
        bankCode: [],
        minAmount: "",
        maxAmount: "",
        startDate: "",
        endDate: "",
        content: "",
        page: 1,
        limit: 10,
    }
};

const billsSlice = createSlice({
    name: "bills",
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
            .addCase(getBills.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getBills.fulfilled, (state, action) => {
                state.loading = false;
                state.bills = action.payload;
            })
            .addCase(getBills.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

export const { setFilters, resetFilters } = billsSlice.actions;
export default billsSlice.reducer;
