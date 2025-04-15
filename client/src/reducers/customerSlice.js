import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { fetchCustomers } from "../services/customerService";

export const getCustomers = createAsyncThunk(
    "customers/getCustomers",
    async (filters, { rejectWithValue }) => {
        try {
            const response = await fetchCustomers(filters);
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
    loading: false,
    error: null,
    customers: {
        docs: []
    },
    filters: {
        tags: [],
        page: 1,
        limit: 10,
        sortField: 'createdAt',
        facebookId: '',
        list: ''
    }
};

const customerSlice = createSlice({
    name: "customers",
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
            .addCase(getCustomers.pending, (state) => {
                state.loading = true;
            })
            .addCase(getCustomers.fulfilled, (state, action) => {
                state.loading = false;
                state.customers = action.payload;
            })
            .addCase(getCustomers.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

export const { setFilters, resetFilters } = customerSlice.actions;
export default customerSlice.reducer;

