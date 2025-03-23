import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  balance: 0,
  loan: 0,
  loanPurpose: "",
  isLoading: false,
};

const accountSlice = createSlice({
  name: "account",
  initialState,
  reducers: {
    deposit(state, action) {
      state.balance = state.balance + action.payload;
      state.isLoading = false;
    },
    withdraw(state, action) {
      state.balance = state.balance - action.payload;
    },
    payLoan(state, action) {
      state.balance = state.balance - state.loan;
      state.loanPurpose = "";
      state.loan = 0;
    },
    requestLoan: {
      prepare(amount, purpose) {
        return { payload: { amount, purpose } };
      },
      reducer(state, action) {
        if (state.loan > 0) return;
        state.loan = action.payload;
        state.balance = action.payload.amount + state.balance;
        state.loanPurpose = action.payload.loanPurpose;
      },
    },
    convertingCurrency(state) {
      state.isLoading = true;
    },
  },
});

export const { withdraw, payLoan, requestLoan } = accountSlice.actions;

export function deposit(amount, currency) {
  if (currency === "USD") {
    return { type: "account/deposit", payload: amount };
  }

  return async function (dispatch, getState) {
    dispatch({ type: "account/convertingCurrency" });

    try {
      const res = await fetch(
        `https://api.frankfurter.app/latest?amount=${amount}&from=${currency}&to=USD`
      );
      if (!res.ok) {
        throw new Error(`HTTP error! Status: ${res.status}`);
      }
      const data = await res.json();
      const rate = data.rates?.USD;

      if (!rate) {
        throw new Error("Conversion rate not found.");
      }

      // const convertedAmount = (amount * rate).toFixed(2);
      dispatch({ type: "account/deposit", payload: rate });
    } catch (err) {
      console.error("Error fetching currency data:", err.message);
    } finally {
      dispatch({ type: "account/conversionComplete" });
    }
  };
}

export default accountSlice.reducer;

// export default function accountReducer(state = initialStateAccount, action) {
//   switch (action.type) {
//     case "account/deposit":
//       return {
//         ...state,
//         balance: state.balance + action.payload,
//         isLoading: false,
//       };
//     case "account/withdraw":
//       return {
//         ...state,
//         balance: state.balance - action.payload,
//       };
//     case "account/requestLoan":
//       if (state.loan > 0) {
//         return state;
//       }
//       return {
//         ...state,
//         loan: action.payload.amount,
//         balance: action.payload.amount + state.balance,
//         loanPurpose: action.payload.purpose,
//       };
//     case "account/payLoan":
//       return {
//         ...state,
//         loan: 0,
//         loanPurpose: "",
//         balance: state.balance - state.loan,
//       };
//     case "account/convertingCurrency":
//       return {
//         ...state,
//         isLoading: true,
//       };
//     case "account/conversionComplete":
//       return {
//         ...state,
//         isLoading: false,
//       };
//     default:
//       return state;
//   }
// }

// export function deposit(amount, currency) {
//   if (currency === "USD") {
//     return { type: "account/deposit", payload: amount };
//   }

//   return async function (dispatch, getState) {
//     dispatch({ type: "account/convertingCurrency" });

//     try {
//       const res = await fetch(
//         `https://api.frankfurter.app/latest?amount=${amount}&from=${currency}&to=USD`
//       );
//       if (!res.ok) {
//         throw new Error(`HTTP error! Status: ${res.status}`);
//       }
//       const data = await res.json();
//       const rate = data.rates?.USD;

//       if (!rate) {
//         throw new Error("Conversion rate not found.");
//       }

//       // const convertedAmount = (amount * rate).toFixed(2);
//       dispatch({ type: "account/deposit", payload: rate });
//     } catch (err) {
//       console.error("Error fetching currency data:", err.message);
//     } finally {
//       dispatch({ type: "account/conversionComplete" });
//     }
//   };
// }
// export function withdraw(amount) {
//   return { type: "account/withdraw", payload: amount };
// }
// export function requestLoan(amount, purpose) {
//   return { type: "account/requestLoan", payload: { amount, purpose } };
// }
// export function payLoan() {
//   return { type: "account/payLoan" };
// }
