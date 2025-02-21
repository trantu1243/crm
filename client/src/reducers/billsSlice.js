import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { confirmBillService, fetchBillById, fetchBills, switchBillService } from "../services/billService";

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

export const searchBills = createAsyncThunk(
    "bills/searchBills",
    async (search, { rejectWithValue }) => {
        try {
            const response = await fetchBills(search);
            return response.data;
        } catch (error) {
            if (error.response?.status === 401 || error.response?.status === 403) {
                window.location.href = "/login"; 
            }
            return rejectWithValue(error.message);
        }
    }
);

export const getBillsNoLoad = createAsyncThunk(
    "bills/getBillsNoLoad",
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

export const getBillById = createAsyncThunk(
    "transactions/getBillById",
    async (id, { rejectWithValue }) => {
        try {
            return await fetchBillById(id);
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const getBillByIdNoLoad = createAsyncThunk(
    "transactions/getBillByIdNoLoad",
    async (id, { rejectWithValue }) => {
        try {
            return await fetchBillById(id);
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);


export const switchBill = createAsyncThunk(
    "bills/switchBill",
    async (id, { rejectWithValue }) => {
        try {
            const response = await switchBillService(id); 
            return response.data;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const confirmBill = createAsyncThunk(
    "bills/confirmBill",
    async (id, { rejectWithValue }) => {
        try {
            const response = await confirmBillService(id); 
            return response.data;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

const initialState = {
    bills: {
        docs: []
    },
    bill: null,
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
            .addCase(getBillById.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getBillById.fulfilled, (state, action) => {
                state.loading = false;
                state.bill = action.payload.data;
            })
            .addCase(getBillById.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(getBillByIdNoLoad.pending, (state) => {
                state.error = null;
            })
            .addCase(getBillByIdNoLoad.fulfilled, (state, action) => {
                state.bill = action.payload.data;
            })
            .addCase(getBillByIdNoLoad.rejected, (state, action) => {
                state.error = action.payload;
            })
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
            })
            .addCase(searchBills.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(searchBills.fulfilled, (state, action) => {
                state.loading = false;
                state.bills = action.payload;
            })
            .addCase(searchBills.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(switchBill.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(switchBill.fulfilled, (state, action) => {
                state.loading = false;
            })
            .addCase(switchBill.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(getBillsNoLoad.pending, (state) => {
                state.error = null;
            })
            .addCase(getBillsNoLoad.fulfilled, (state, action) => {
                state.bills = action.payload;
            })
            .addCase(getBillsNoLoad.rejected, (state, action) => {
                state.error = action.payload;
            });
    },
});

export const { setFilters, resetFilters } = billsSlice.actions;
export default billsSlice.reducer;
