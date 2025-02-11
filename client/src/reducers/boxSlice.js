import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { fetchBoxTransactionById, undoBoxService } from "../services/boxService";

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

const initialState = {
    box: null,
    loading: false,
    error: null,
};

const boxSlice = createSlice({
    name: "box",
    initialState,
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
    },
});

export default boxSlice.reducer;
