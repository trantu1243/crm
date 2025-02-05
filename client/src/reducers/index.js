import ThemeOptions from "./ThemeOptions";
import userReducer from "./userSlice";

const reducer = {
    ThemeOptions,
    user: userReducer,
};

export default reducer;
