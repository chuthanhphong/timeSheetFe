import { createSlice } from "@reduxjs/toolkit";

const initData = {
  name: "",
  roleCode: "",
  accessToken: ""
};
export default createSlice({
  name: "user",
  initialState: initData,
  reducers: {
    login: (state, action) => {
      state = action.payload;
    },
    logout: (state) => {
      state = initData;
    }
  }
});
