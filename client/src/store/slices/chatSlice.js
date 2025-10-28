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
      toast.error(error.response?.data?.message);
      return thunkAPI.rejectWithValue(error.response?.data?.message);
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
      toast.error(error.response.data.message);
      return thunkAPI.rejectWithValue(error.response.data.message);
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
        messageData
      );
      return res.data;
    } catch (error) {
      toast.error(error.response.data.message);
      return thunkAPI.rejectWithValue(error.response.data.message);
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
      toast.error(error.response.data.message);
      return thunkAPI.rejectWithValue(error.response.data.message);
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
        state.messages = action.payload.messages;
        state.isMessagesLoading = false;
      })
      .addCase(getMessages.rejected, (state) => {
        state.isMessagesLoading = false;
      })
      // Remove the sendMessage.fulfilled case to prevent automatic message addition
      // Messages will be added via socket events only
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
