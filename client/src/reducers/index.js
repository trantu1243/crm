import ThemeOptions from "./ThemeOptions";
import userReducer from "./userSlice";
import transactionsReducer from "./transactionsSlice";
import billsReducer from "./billsSlice";
import boxReducer from "./boxSlice";

const reducer = {
    ThemeOptions,
    user: userReducer,
    transactions: transactionsReducer,
    bills: billsReducer,
    box: boxReducer
};

export default reducer;
