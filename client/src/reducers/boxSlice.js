import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { fetchBoxTransactionById, fetchNoteBoxTransaction, undoBoxService, updateBoxService } from "../services/boxService";

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

export const getBoxByIdNoLoad = createAsyncThunk(
    "boxs/getBoxByIdNoLoad",
    async (id, { rejectWithValue }) => {
        try {
            return await fetchBoxTransactionById(id);
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const getNoteBoxTransactions = createAsyncThunk(
    "boxs/getNoteBoxTransactions",
    async (payload, { rejectWithValue }) => {
        try {
            const response = await fetchNoteBoxTransaction(payload);
            return response.data;
        } catch (error) {
            if (error.response?.status === 401 || error.response?.status === 403) {
                window.location.href = "/login"; 
            }
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
            return rejectWithValue(error);
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
    noteBoxes: [],
    sender: [],
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
                state.sender = action.payload.sender;
                state.box = action.payload.data;
            })
            .addCase(getBoxById.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(getBoxByIdNoLoad.pending, (state) => {
                state.error = null;
            })
            .addCase(getBoxByIdNoLoad.fulfilled, (state, action) => {
                state.sender = action.payload.sender;
                state.box = action.payload.data;
            })
            .addCase(getBoxByIdNoLoad.rejected, (state, action) => {
                state.error = action.payload;
            })
            .addCase(getNoteBoxTransactions.pending, (state) => {
                state.error = null;
            })
            .addCase(getNoteBoxTransactions.fulfilled, (state, action) => {
                state.noteBoxes = action.payload;
            })
            .addCase(getNoteBoxTransactions.rejected, (state, action) => {
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
