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
    
    // Connect socket with user ID
    connectSocket(res.data.user._id);
    return res.data.user;
  } catch (error) {
    const errorMessage = error.response?.data?.message || "Failed to fetch user";
    return thunkAPI.rejectWithValue(errorMessage);
  }
});

export const logout = createAsyncThunk("user/sign-out", async (_, thunkAPI) => {
  try {
    const res = await axiosInstance.get("/user/sign-out");
    
    // Check if response indicates success
    if (!res.data.success) {
      toast.error(res.data.message || "Logout failed");
      return thunkAPI.rejectWithValue(res.data.message || "Logout failed");
    }
    
    disconnectSocket();
    toast.success(res.data.message || "Logged out successfully");
    return null;
  } catch (error) {
    const errorMessage = error.response?.data?.message || "Logout failed";
    toast.error(errorMessage);
    return thunkAPI.rejectWithValue(errorMessage);
  }
});

export const login = createAsyncThunk(
  "user/sign-in",
  async (data, thunkAPI) => {
    try {
      // Validate input
      if (!data.email || !data.password) {
        const errorMessage = "Please provide email and password";
        toast.error(errorMessage);
        return thunkAPI.rejectWithValue(errorMessage);
      }
      
      const res = await axiosInstance.post("/user/sign-in", data);
      
      // Check if response indicates success
      if (!res.data.success) {
        toast.error(res.data.message || "Login failed");
        return thunkAPI.rejectWithValue(res.data.message);
      }
      
      // Connect socket with user ID
      connectSocket(res.data.user._id);
      toast.success(res.data.message || "Logged in successfully");
      return res.data.user;
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
      // Validate input
      if (!data.fullName || !data.email || !data.password) {
        const errorMessage = "Please provide complete details";
        toast.error(errorMessage);
        return thunkAPI.rejectWithValue(errorMessage);
      }
      
      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(data.email)) {
        const errorMessage = "Invalid email format";
        toast.error(errorMessage);
        return thunkAPI.rejectWithValue(errorMessage);
      }
      
      // Validate password length
      if (data.password.length < 8) {
        const errorMessage = "Password must be at least 8 characters long";
        toast.error(errorMessage);
        return thunkAPI.rejectWithValue(errorMessage);
      }
      
      const res = await axiosInstance.post("/user/sign-up", data);
      
      // Check if response indicates success
      if (!res.data.success) {
        toast.error(res.data.message || "Registration failed");
        return thunkAPI.rejectWithValue(res.data.message);
      }
      
      // Connect socket with user ID
      connectSocket(res.data.user._id);
      toast.success(res.data.message || "Account created successfully");
      return res.data.user;
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
      return res.data.user;
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
        state.authUser = null;
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
        state.authUser = null;
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
        state.authUser = null;
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