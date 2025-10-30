import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { axiosInstance } from "../../lib/axios";
import { connectSocket, disconnectSocket } from "../../lib/socket";
import { toast } from "react-toastify";

export const getUser = createAsyncThunk("user/me", async (_, thunkAPI) => {
  try {
    console.log("Fetching user data...");
    const res = await axiosInstance.get("/user/me");
    console.log("User data response:", res.data);
    
    // Check if response indicates success
    if (!res.data.success) {
      console.log("User data fetch failed:", res.data.message);
      return thunkAPI.rejectWithValue(res.data.message || "Failed to fetch user");
    }
    
    // Connect socket with user ID
    connectSocket(res.data.user._id);
    return res.data.user;
  } catch (error) {
    console.error("Error fetching user:", error);
    const errorMessage = error.response?.data?.message || "Failed to fetch user";
    return thunkAPI.rejectWithValue(errorMessage);
  }
});

export const logout = createAsyncThunk("user/sign-out", async (_, thunkAPI) => {
  try {
    console.log("Logging out...");
    const res = await axiosInstance.get("/user/sign-out");
    console.log("Logout response:", res.data);
    
    // Check if response indicates success
    if (!res.data.success) {
      toast.error(res.data.message || "Logout failed");
      return thunkAPI.rejectWithValue(res.data.message || "Logout failed");
    }
    
    disconnectSocket();
    toast.success(res.data.message || "Logged out successfully");
    return null;
  } catch (error) {
    console.error("Error logging out:", error);
    const errorMessage = error.response?.data?.message || "Logout failed";
    toast.error(errorMessage);
    return thunkAPI.rejectWithValue(errorMessage);
  }
});

export const login = createAsyncThunk(
  "user/sign-in",
  async (data, thunkAPI) => {
    try {
      console.log("Logging in with data:", data);
      // Validate input
      if (!data.email || !data.password) {
        const errorMessage = "Please provide email and password";
        toast.error(errorMessage);
        return thunkAPI.rejectWithValue(errorMessage);
      }
      
      const res = await axiosInstance.post("/user/sign-in", data);
      console.log("Login response:", res.data);
      
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
      console.error("Error logging in:", error);
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
      console.log("Signing up with data:", data);
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
      console.log("Signup response:", res.data);
      
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
      console.error("Error signing up:", error);
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
      console.log("Updating profile with data:", data);
      const res = await axiosInstance.put("/user/update-profile", data);
      console.log("Profile update response:", res.data);
      
      // Check if response indicates success
      if (!res.data.success) {
        toast.error(res.data.message || "Profile update failed");
        return thunkAPI.rejectWithValue(res.data.message);
      }
      
      toast.success(res.data.message || "Profile updated successfully");
      return res.data.user;
    } catch (error) {
      console.error("Error updating profile:", error);
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
        console.log("User fetch fulfilled:", action.payload);
        state.authUser = action.payload;
        state.isCheckingAuth = false;
      })
      .addCase(getUser.rejected, (state, action) => {
        console.log("User fetch rejected:", action.payload);
        state.authUser = null;
        state.isCheckingAuth = false;
      })
      .addCase(logout.fulfilled, (state) => {
        console.log("Logout fulfilled");
        state.authUser = null;
      })
      .addCase(logout.rejected, (state) => {
        console.log("Logout rejected");
        state.authUser = null;
      })
      .addCase(login.pending, (state) => {
        console.log("Login pending");
        state.isLoggingIn = true;
      })
      .addCase(login.fulfilled, (state, action) => {
        console.log("Login fulfilled:", action.payload);
        state.authUser = action.payload;
        state.isLoggingIn = false;
      })
      .addCase(login.rejected, (state, action) => {
        console.log("Login rejected:", action.payload);
        state.isLoggingIn = false;
        state.authUser = null;
      })
      .addCase(signup.pending, (state) => {
        console.log("Signup pending");
        state.isSigningUp = true;
      })
      .addCase(signup.fulfilled, (state, action) => {
        console.log("Signup fulfilled:", action.payload);
        state.authUser = action.payload;
        state.isSigningUp = false;
      })
      .addCase(signup.rejected, (state, action) => {
        console.log("Signup rejected:", action.payload);
        state.isSigningUp = false;
        state.authUser = null;
      })
      .addCase(updateProfile.pending, (state) => {
        console.log("Profile update pending");
        state.isUpdatingProfile = true;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        console.log("Profile update fulfilled:", action.payload);
        state.authUser = action.payload;
        state.isUpdatingProfile = false;
      })
      .addCase(updateProfile.rejected, (state) => {
        console.log("Profile update rejected");
        state.isUpdatingProfile = false;
      });
  },
});

export const { setOnlineUsers } = authSlice.actions;
export default authSlice.reducer;