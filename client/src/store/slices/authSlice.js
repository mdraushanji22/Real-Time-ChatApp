import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { axiosInstance } from "../../lib/axios";
import { connectSocket, disconnectSocket } from "../../lib/socket";
import { toast } from "react-toastify";

export const getUser = createAsyncThunk("user/me", async (_, thunkAPI) => {
  try {
    const res = await axiosInstance.get("/user/me");
    
    // Check if response indicates success
    if (!res.data.success) {
      return thunkAPI.rejectWithValue(res.data.message || "Failed to fetch user");
    }
    
    connectSocket(res.data.user);
    return res.data.user;
  } catch (error) {
    const errorMessage = error.response?.data?.message || "Failed to fetch user";
    return thunkAPI.rejectWithValue(errorMessage);
  }
});
export const logout = createAsyncThunk("user/sign-out", async (_, thunkAPI) => {
  try {
    await axiosInstance.get("/user/sign-out");
    disconnectSocket();
    return null; //User logout successfully
  } catch (error) {
    toast.error(error.response.data.message);
    return thunkAPI.rejectWithValue(error.response.data.value);
  }
});

export const login = createAsyncThunk(
  "user/sign-in",
  async (data, thunkAPI) => {
    try {
      const res = await axiosInstance.post("/user/sign-in", data);
      
      // Check if response indicates success
      if (!res.data.success) {
        toast.error(res.data.message || "Login failed");
        return thunkAPI.rejectWithValue(res.data.message);
      }
      
      connectSocket(res.data.user || res.data);
      toast.success(res.data.message || "Logged in successfully");
      return res.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Login failed";
      toast.error(errorMessage);
      return thunkAPI.rejectWithValue(errorMessage);
    }
  }
);
export const signup = createAsyncThunk(
  "auth/sign-up",
  async (data, thunkAPI) => {
    try {
      const res = await axiosInstance.post("/user/sign-up", data);
      
      // Check if response indicates success
      if (!res.data.success) {
        toast.error(res.data.message || "Registration failed");
        return thunkAPI.rejectWithValue(res.data.message);
      }
      
      connectSocket(res.data.user || res.data);
      toast.success(res.data.message || "Account created successfully");
      return res.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Registration failed";
      toast.error(errorMessage);
      return thunkAPI.rejectWithValue(errorMessage);
    }
  }
);
export const updateProfile = createAsyncThunk(
  "user/update-profile",
  async (data, thunkAPI) => {
    try {
      const res = await axiosInstance.put("/user/update-profile", data);
      
      // Check if response indicates success
      if (!res.data.success) {
        toast.error(res.data.message || "Profile update failed");
        return thunkAPI.rejectWithValue(res.data.message);
      }
      
      toast.success(res.data.message || "Profile updated successfully");
      return res.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Profile update failed";
      toast.error(errorMessage);
      return thunkAPI.rejectWithValue(errorMessage);
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState: {
    authUser: null,
    isSigningUp: false,
    isLoggingIn: false,
    isUpdatingProfile: false,
    isCheckingAuth: true,
    onlineUsers: [],
  },
  reducers: {
    setOnlineUsers(state, action) {
      state.onlineUsers = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getUser.fulfilled, (state, action) => {
        state.authUser = action.payload;
        state.isCheckingAuth = false;
      })
      .addCase(getUser.rejected, (state) => {
        state.authUser = null;
        state.isCheckingAuth = false;
      })
      .addCase(logout.fulfilled, (state) => {
        state.authUser = null;
      })
      .addCase(logout.rejected, (state) => {
        state.authUser = state.authUser;
      })
      .addCase(login.pending, (state) => {
        state.isLoggingIn = true;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.authUser = action.payload;
        state.isLoggingIn = false;
      })
      .addCase(login.rejected, (state) => {
        state.isLoggingIn = false;
      })
      .addCase(signup.pending, (state) => {
        state.isSigningUp = true;
      })
      .addCase(signup.fulfilled, (state, action) => {
        state.authUser = action.payload;
        state.isSigningUp = false;
      })
      .addCase(signup.rejected, (state) => {
        state.isSigningUp = false;
      })
      .addCase(updateProfile.pending, (state) => {
        state.isUpdatingProfile = true;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.authUser = action.payload;
        state.isUpdatingProfile = false;
      })
      .addCase(updateProfile.rejected, (state) => {
        state.isUpdatingProfile = false;
      });
  },
});
export const { setOnlineUsers } = authSlice.actions;
export default authSlice.reducer;
