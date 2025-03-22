import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    user: null,
    token: null,
    loading: false,
    error: null,
    isLogout: false,
};

const userSlice = createSlice({
    name: "user",
    initialState,
    reducers: {
        loginStart: (state) => {
            state.loading = true;
            state.error = null;
        },
        loginSuccess: (state, action) => {
            state.token = action.payload.token;
            state.isLogout = false;
            state.loading = false;
        },
        loginFailure: (state, action) => {
            state.loading = false;
            state.error = action.payload;
        },
        authStart: (state) => {
            state.loading = true;
            state.error = null;
        },
        authSuccess: (state, action) => {
            state.user = action.payload.user;
            state.loading = false;
        },
        authFailure: (state, action) => {
            state.loading = false;
            state.error = action.payload;
        },
        logout: (state) => {
            state.user = null;
            state.isLogout = true;
            localStorage.removeItem("token");
            state.token = null;
            window.location.href = "/login";
        },
    },
});

export const { loginStart, loginSuccess, loginFailure, logout, authStart, authSuccess, authFailure } = userSlice.actions;
export default userSlice.reducer;
