import ThemeOptions from "./ThemeOptions";
import userReducer from "./userSlice";
import transactionsReducer from "./transactionsSlice";
import billsReducer from "./billsSlice";
import boxReducer from "./boxSlice";
import customerReducer from "./customerSlice";

const reducer = {
    ThemeOptions,
    user: userReducer,
    transactions: transactionsReducer,
    bills: billsReducer,
    box: boxReducer,
    customer: customerReducer
};

export default reducer;
