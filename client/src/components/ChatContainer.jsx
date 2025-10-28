import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getMessages, removeMessage } from "../store/slices/chatSlice";
import { getSocket } from "../lib/socket";
import ChatHeader from "./ChatHeader";
import MessageSkeleton from "./skeletons/MessageSkeleton";
import MessageInput from "./MessageInput";
import { Trash2 } from "lucide-react";
import { toast } from "react-toastify";

const ChatContainer = () => {
  const { messages, isMessagesLoading, selectedUser } = useSelector(
    (state) => state.chat
  );
  const { authUser } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const messageEndRef = useRef(null);
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    if (selectedUser?._id) {
      dispatch(getMessages(selectedUser._id));
    }
  }, [selectedUser?._id, dispatch]);

  useEffect(() => {
    if (messageEndRef.current && messages) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  function formatMessageTime(date) {
    return new Date(date).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  }

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    const handleNewMessage = (newMessage) => {
      // Check if this message is for the current chat
      if (
        selectedUser &&
        (newMessage.senderId === selectedUser._id ||
          newMessage.receiverId === selectedUser._id) &&
        authUser &&
        (newMessage.senderId === authUser._id ||
          newMessage.receiverId === authUser._id)
      ) {
        // Check if message already exists to prevent duplicates
        const messageExists = messages.some(
          (message) => message._id === newMessage._id
        );

        if (!messageExists) {
          dispatch({ type: "chat/pushNewMessage", payload: newMessage });
        }
      }
    };

    const handleMessageDeleted = (data) => {
      dispatch(removeMessage({ messageId: data.messageId }));
    };

    socket.on("newMessage", handleNewMessage);
    socket.on("messageDeleted", handleMessageDeleted);

    return () => {
      socket.off("newMessage", handleNewMessage);
      socket.off("messageDeleted", handleMessageDeleted);
    };
  }, [selectedUser, authUser, messages, dispatch]);

  const handleDeleteMessage = (messageId) => {
    if (window.confirm("Are you sure you want to delete this message?")) {
      dispatch(removeMessage({ messageId }));
    }
  };

  const handleImageClick = (imageUrl) => {
    setSelectedImage(imageUrl);
    setShowImageModal(true);
  };

  const handleDownloadImage = async (imageUrl) => {
    try {
      // Extract filename from URL or use a default name
      const urlParts = imageUrl.split("/");
      const filename =
        urlParts[urlParts.length - 1].split("?")[0] || "chat-image.jpg";

      // Create a toast notification for download start
      const toastId = toast.info("Downloading image...", {
        autoClose: false,
        closeOnClick: false,
        pauseOnHover: false,
      });

      // Fetch the image as a blob
      const response = await fetch(imageUrl);
      if (!response.ok) {
        throw new Error("Failed to download image");
      }

      const blob = await response.blob();

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;

      // Trigger download
      document.body.appendChild(link);
      link.click();

      // Clean up
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      // Update toast notification
      toast.update(toastId, {
        render: "Image downloaded successfully!",
        type: "success",
        autoClose: 3000,
        closeOnClick: true,
        pauseOnHover: true,
      });
    } catch (error) {
      console.error("Download failed:", error);
      toast.error("Failed to download image. Please try again.");
    }
  };

  if (isMessagesLoading) {
    return (
      <div className="flex-1 flex flex-col overflow-auto">
        <ChatHeader />
        <MessageSkeleton />
        <MessageInput />
      </div>
    );
  }

  return (
    <>
      <div className="flex-1 flex flex-col overflow-hidden bg-white">
        <ChatHeader />

        {/* messages */}

        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {messages &&
            messages.length > 0 &&
            messages.map((message, index) => {
              const isSender = message.senderId === authUser?._id;

              return (
                <div
                  key={message._id}
                  className={`flex items-end ${
                    isSender ? "justify-end" : "justify-start"
                  } relative group`}
                  ref={index === messages.length - 1 ? messageEndRef : null}
                >
                  {/* Delete button for sender and receiver */}
                  <div className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleDeleteMessage(message._id)}
                      className="p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  {/* Avatar */}
                  <div
                    className={`w-10 h-10 rounded-full overflow-hidden border shrink-0 ${
                      isSender ? "order-2 ml-3" : "order-1 mr-3"
                    }`}
                  >
                    <img
                      src={
                        isSender
                          ? authUser?.avatar?.url || "/avatar-holder.avif"
                          : selectedUser?.avatar?.url || "/avatar-holder.avif"
                      }
                      alt="/avatar-holder.avif"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  {/* Bubble */}

                  <div
                    className={`max-w-xs sm:max-w-sm md:max-w-md px-4 py-2 rounded-xl text-sm relative ${
                      isSender
                        ? "bg-blue-400/20 text-black order-1"
                        : "bg-gray-200 text-black order-2"
                    } `}
                  >
                    {message.media && (
                      <>
                        {message.media.includes(".mp4") ||
                        message.media.includes(".webm") ||
                        message.media.includes(".mov") ? (
                          <video
                            src={message.media}
                            controls
                            className="w-full max-w-xs sm:max-w-sm md:max-w-md rounded-md mb-2 max-h-60 object-contain"
                          />
                        ) : (
                          <div className="relative">
                            <img
                              src={message.media}
                              alt="Attachment"
                              className="w-full max-w-xs sm:max-w-sm md:max-w-md rounded-md mb-2 max-h-60 object-contain cursor-pointer"
                              onClick={() => handleImageClick(message.media)}
                            />
                            {/* Only show download button for receiver, not sender */}
                            {!isSender && (
                              <button
                                onClick={() =>
                                  handleDownloadImage(message.media)
                                }
                                className="absolute bottom-2 right-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-xs"
                              >
                                Download
                              </button>
                            )}
                          </div>
                        )}
                      </>
                    )}
                    <div>
                      {message.text && <p>{message.text}</p>}
                      <span className="block text-[10px] mt-1 text-right text-gray-400">
                        {formatMessageTime(message.createdAt)}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}

          {/* Show empty state when no messages */}
          {messages && messages.length === 0 && (
            <div className="flex-1 flex items-center justify-center h-full">
              <p className="text-gray-500">
                No messages yet. Start the conversation!
              </p>
            </div>
          )}
        </div>
        <MessageInput />
      </div>

      {/* Image Preview Modal */}
      {showImageModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
          onClick={() => setShowImageModal(false)}
        >
          <div className="relative max-w-full max-h-full flex items-center justify-center">
            <img
              src={selectedImage}
              alt="Preview"
              className="max-w-full max-h-full object-contain rounded-lg"
              style={{ maxHeight: "90vh", maxWidth: "90vw" }}
            />
            {/* Only show download button for receiver, not sender */}
            {messages &&
              !messages.some(
                (msg) =>
                  msg.media === selectedImage && msg.senderId === authUser?._id
              ) && (
                <button
                  onClick={() => handleDownloadImage(selectedImage)}
                  className="absolute bottom-4 right-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                  Download Image
                </button>
              )}
            <button
              onClick={() => setShowImageModal(false)}
              className="absolute top-4 right-4 text-white text-2xl"
            >
              &times;
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatContainer;
