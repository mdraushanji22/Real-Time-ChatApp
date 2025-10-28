import { Image, Send, Smile, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { getSocket } from "../lib/socket";
import { sendMessage } from "../store/slices/chatSlice";
import Picker from "@emoji-mart/react";
import data from "@emoji-mart/data";

const MessageInput = () => {
  const [text, setText] = useState("");
  const [mediaPreview, setMediaPreview] = useState(null);
  const [media, setMedia] = useState(null);
  const [mediaType, setMediaType] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const fileInputRef = useRef();
  const emojiPickerRef = useRef();
  const dispatch = useDispatch();
  const { selectedUser } = useSelector((state) => state.chat);

  // Close emoji picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        emojiPickerRef.current &&
        !emojiPickerRef.current.contains(event.target)
      ) {
        setShowEmojiPicker(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleMediaChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setMedia(file);

    const type = file.type;

    if (type.startsWith("image/")) {
      setMediaType("image");
      const reader = new FileReader();
      reader.onload = () => {
        setMediaPreview(reader.result);
      };
      reader.readAsDataURL(file);
    } else if (type.startsWith("video/")) {
      setMediaType("video");
      const videoURL = URL.createObjectURL(file);
      setMediaPreview(videoURL);
    } else {
      toast.error("Please select a video or image file.");
      setMedia(null);
      setMediaPreview(null);
      setMediaType("");
      return;
    }
  };

  const removeMedia = () => {
    setMedia(null);
    setMediaPreview(null);
    setMediaType("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!text.trim() && !media) return;

    const formData = new FormData();
    formData.append("text", text.trim());
    if (media) {
      formData.append("media", media);
    }

    // Dispatch the sendMessage action but don't rely on it to update the UI
    dispatch(sendMessage(formData));

    // Reset All
    setText("");
    setMedia(null);
    setMediaPreview(null);
    setMediaType("");
    setShowEmojiPicker(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const addEmoji = (emoji) => {
    setText(text + emoji.native);
  };

  // Removed the useEffect hook that was handling socket events
  // This prevents duplicate message handling
  // Socket events are now handled exclusively in ChatContainer

  return (
    <>
      <div className="p-4 w-full">
        {mediaPreview && (
          <div className="mb-3 flex items-center gap-2">
            <div className="relative">
              {mediaType === "image" ? (
                <img
                  src={mediaPreview}
                  alt="Preview"
                  className="max-w-full max-h-32 object-contain rounded-lg border border-gray-700"
                />
              ) : (
                <video
                  src={mediaPreview}
                  controls
                  className="max-w-full max-h-32 object-contain rounded-lg border border-gray-700"
                />
              )}
              <button
                onClick={removeMedia}
                type="button"
                className="absolute -top-2 right-2 w-5 h-5 bg-zinc-800 text-white rounded-full flex items-center justify-center hover:bg-black"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          </div>
        )}
        <form
          onSubmit={handleSendMessage}
          className="flex items-center gap-2 relative"
        >
          <div className="flex-1 flex gap-2">
            <input
              type="text"
              placeholder="Type a message..."
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
            <input
              type="file"
              accept="image/*,video/*"
              ref={fileInputRef}
              className="hidden"
              onChange={handleMediaChange}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className={`hidden sm:flex items-center justify-center w-10 h-10 rounded-full border border-gray-300 hover:border-gray-100 transition ${
                mediaPreview ? "text-emerald-500" : "text-gray-400"
              }`}
            >
              <Image size={20} />
            </button>
            <button
              type="button"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className="flex items-center justify-center w-10 h-10 rounded-full border border-gray-300 hover:border-gray-100 transition text-gray-400"
            >
              <Smile size={20} />
            </button>
          </div>
          <button
            type="submit"
            className="w-10 h-10 flex items-center justify-center rounded-full bg-blue-600 text-white hover:bg-blue-700 transition disabled:opacity-50 "
            disabled={!text.trim() && !media}
          >
            <Send size={22} />
          </button>
        </form>
        {showEmojiPicker && (
          <div ref={emojiPickerRef} className="absolute bottom-16 right-0 z-10">
            <Picker data={data} onEmojiSelect={addEmoji} />
          </div>
        )}
      </div>
    </>
  );
};

export default MessageInput;
