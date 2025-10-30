import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { axiosInstance } from "../../lib/axios";
import { toast } from "react-toastify";

export const getUsers = createAsyncThunk(
  "chat/getUsers",
  async (_, thunkAPI) => {
    try {
      const res = await axiosInstance.get("/message/users");
      return res.data.users;
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fetch users");
      return thunkAPI.rejectWithValue(error.response?.data?.message || "Failed to fetch users");
    }
  }
);

export const getMessages = createAsyncThunk(
  "chat/getMessages",
  async (userId, thunkAPI) => {
    try {
      const res = await axiosInstance.get(`/message/${userId}`);
      return res.data;
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fetch messages");
      return thunkAPI.rejectWithValue(error.response?.data?.message || "Failed to fetch messages");
    }
  }
);

export const sendMessage = createAsyncThunk(
  "chat/sendMessage",
  async (messageData, thunkAPI) => {
    try {
      const { chat } = thunkAPI.getState();
      const res = await axiosInstance.post(
        `/message/send/${chat.selectedUser?._id}`,
        messageData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      return res.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Failed to send message";
      toast.error(errorMessage);
      return thunkAPI.rejectWithValue(errorMessage);
    }
  }
);

// Add delete message thunk
export const deleteMessage = createAsyncThunk(
  "chat/deleteMessage",
  async (messageId, thunkAPI) => {
    try {
      const res = await axiosInstance.delete(`/message/${messageId}`);
      return { messageId, success: res.data.success };
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete message");
      return thunkAPI.rejectWithValue(error.response?.data?.message || "Failed to delete message");
    }
  }
);

const chatSlice = createSlice({
  name: "chat",
  initialState: {
    messages: [],
    users: [],
    selectedUser: null,
    isUsersLoading: false,
    isMessagesLoading: false,
  },
  reducers: {
    setSelectedUser: (state, action) => {
      state.selectedUser = action.payload;
    },
    pushNewMessage: (state, action) => {
      // Check if message already exists to prevent duplicates
      const messageExists = state.messages.some(
        (message) => message._id === action.payload._id
      );

      if (!messageExists) {
        state.messages.push(action.payload);
      }
    },
    // Add reducer to remove deleted message
    removeMessage: (state, action) => {
      state.messages = state.messages.filter(
        (message) => message._id !== action.payload.messageId
      );
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getUsers.pending, (state) => {
        state.isUsersLoading = true;
      })
      .addCase(getUsers.fulfilled, (state, action) => {
        state.users = action.payload;
        state.isUsersLoading = false;
      })
      .addCase(getUsers.rejected, (state) => {
        state.isUsersLoading = false;
      })
      .addCase(getMessages.pending, (state) => {
        state.isMessagesLoading = true;
      })
      .addCase(getMessages.fulfilled, (state, action) => {
        state.messages = action.payload.messages || [];
        state.isMessagesLoading = false;
      })
      .addCase(getMessages.rejected, (state) => {
        state.isMessagesLoading = false;
        state.messages = [];
      })
      .addCase(sendMessage.fulfilled, (state, action) => {
        // Add the sent message to the messages array
        if (action.payload && action.payload._id) {
          state.messages.push(action.payload);
        }
      })
      .addCase(deleteMessage.fulfilled, (state, action) => {
        if (action.payload.success) {
          state.messages = state.messages.filter(
            (message) => message._id !== action.payload.messageId
          );
        }
      });
  },
});

export const { setSelectedUser, pushNewMessage, removeMessage } =
  chatSlice.actions;
export default chatSlice.reducer;