import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { fetchBoxTransactionById, undoBoxService, updateBoxService } from "../services/boxService";

export const getBoxById = createAsyncThunk(
    "boxs/getBoxById",
    async (id, { rejectWithValue }) => {
        try {
            return await fetchBoxTransactionById(id);
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const undoBox = createAsyncThunk(
    "boxs/undoBox",
    async (id, { rejectWithValue }) => {
        try {
            const response = await undoBoxService(id); 
            return response.data;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const updateBox = createAsyncThunk(
    "boxs/updateBox",
    async ({ id, data }, { rejectWithValue }) => {
        try {
            const response = await updateBoxService(id, data); 
            return response.data;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

const initialState = {
    box: {
        _id: '',
        name: '',
        messengerId: '',
        createdAt: '',
        amount: 0,
        notes: [],
        buyerCustomer: null,
        sellerCustomer: null,
        transactions: [],
        bills: []
    },
    loading: false,
    error: null,
};

const boxSlice = createSlice({
    name: "box",
    initialState,
    reducers: {
        addNote: (state, action) => {
            state.box.notes.push(action.payload)
        },
        deleteNote: (state, action) => {
            const index = state.box.notes.indexOf(action.payload);
            if (index !== -1) {
                state.box.notes.splice(index, 1);
            }
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(getBoxById.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getBoxById.fulfilled, (state, action) => {
                state.loading = false;
                state.box = action.payload.data;
            })
            .addCase(getBoxById.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(undoBox.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(undoBox.fulfilled, (state, action) => {
                state.loading = false;
            })
            .addCase(undoBox.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(updateBox.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updateBox.fulfilled, (state, action) => {
                state.loading = false;
            })
            .addCase(updateBox.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
    },
});

export const { addNote, deleteNote } = boxSlice.actions;
export default boxSlice.reducer;
