import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { fetchTransactionById, fetchTransactions } from "../services/transactionService";

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

export const getTransactionById = createAsyncThunk(
    "transactions/getTransactionById",
    async (id, { rejectWithValue }) => {
        try {
            return await fetchTransactionById(id);
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

const initialState = {
    transactions: {
        docs: []
    },
    transaction: {
        _id: '',
        amount: 0,
        bankId: null,
        bonus: 0,
        boxId: '',
        content: '',
        fee:'',
        messengerId: '',
        linkQr: '',
        totalAmount: '',
        typeFee: '',
        createdAt: '',
        updatedAt: '',
        status: null
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
            .addCase(getTransactionById.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getTransactionById.fulfilled, (state, action) => {
                state.loading = false;
                state.transaction = action.payload.data;
            })
            .addCase(getTransactionById.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
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
