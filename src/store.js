import { configureStore } from "@reduxjs/toolkit";
import customerReducer from "./features/customer/customerSlice";

import accountReducer from "./features/account/accountSlice";

const store = configureStore({
  reducer: {
    account: accountReducer,
    customer: customerReducer,
  },
});
export default store;
