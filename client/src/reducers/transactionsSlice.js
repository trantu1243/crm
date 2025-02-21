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

export const searchTransactions = createAsyncThunk(
    "transactions/searchTransactions",
    async (search, { rejectWithValue }) => {
        try {
            const response = await fetchTransactions(search);
            return response.data;
        } catch (error) {
            if (error.response?.status === 401 || error.response?.status === 403) {
                window.location.href = "/login"; 
            }
            return rejectWithValue(error.message);
        }
    }
);

export const getTransactionsNoLoad = createAsyncThunk(
    "transactions/getTransactionsNoLoad",
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
        setTransaction: (state, action) => {
            state.transaction = action.payload;
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
            })
            .addCase(searchTransactions.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(searchTransactions.fulfilled, (state, action) => {
                state.loading = false;
                state.transactions = action.payload;
            })
            .addCase(searchTransactions.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(getTransactionsNoLoad.pending, (state) => {
                state.error = null;
            })
            .addCase(getTransactionsNoLoad.fulfilled, (state, action) => {
                state.transactions = action.payload;
            })
            .addCase(getTransactionsNoLoad.rejected, (state, action) => {
                state.error = action.payload;
            });
    },
});

export const { setFilters, resetFilters, setTransaction } = transactionsSlice.actions;
export default transactionsSlice.reducer;
