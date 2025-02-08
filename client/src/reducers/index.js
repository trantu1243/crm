import ThemeOptions from "./ThemeOptions";
import userReducer from "./userSlice";
import transactionsReducer from "./transactionsSlice";
import billsReducer from "./billsSlice";

const reducer = {
    ThemeOptions,
    user: userReducer,
    transactions: transactionsReducer,
    bills: billsReducer
};

export default reducer;
