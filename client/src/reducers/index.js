import ThemeOptions from "./ThemeOptions";
import userReducer from "./userSlice";
import transactionsReducer from "./transactionsSlice";


const reducer = {
    ThemeOptions,
    user: userReducer,
    transactions: transactionsReducer,
};

export default reducer;
