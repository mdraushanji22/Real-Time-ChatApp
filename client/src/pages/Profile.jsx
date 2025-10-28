import { Camera, Loader2, Mail, User, X } from "lucide-react";
import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { updateProfile } from "../store/slices/authSlice";

const Profile = () => {
  const { authUser, isUpdatingProfile } = useSelector((state) => state.auth);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [formData, setFormData] = useState({
    fullName: authUser?.fullName,
    email: authUser?.email,
    avatar: authUser?.avatar?.url,
  });
  const dispatch = useDispatch();

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Check if file is an image
    if (!file.type.startsWith("image/")) {
      alert("Please select an image file");
      return;
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const base64Image = reader.result;
      setImagePreview(base64Image);
      setSelectedImage(file);
      setFormData({ ...formData, avatar: file });
    };
  };

  const handleRemoveImage = () => {
    // Reset image states
    setImagePreview(null);
    setSelectedImage(null);

    // If user had an existing avatar, we'll set a flag to remove it
    // Otherwise, we just clear the preview
    if (authUser?.avatar?.url) {
      setFormData({ ...formData, avatar: null });
    } else {
      setFormData({ ...formData, avatar: "" });
    }

    // Clear the file input
    const fileInput = document.getElementById("avatar-upload");
    if (fileInput) {
      fileInput.value = "";
    }
  };

  const handleUpdateProfile = () => {
    const data = new FormData();
    data.append("fullName", formData.fullName);
    data.append("email", formData.email);

    // Handle avatar differently based on what the user wants to do
    if (selectedImage) {
      // User selected a new image
      data.append("avatar", selectedImage);
    } else if (formData.avatar === null) {
      // User wants to remove their avatar (set to empty string to indicate removal)
      data.append("avatar", "");
    }
    // If formData.avatar is a URL, we don't append anything, which means keep existing avatar

    dispatch(updateProfile(data));
  };

  // Determine which image to display (preview, selected, or existing)
  const displayImage =
    imagePreview ||
    (selectedImage ? URL.createObjectURL(selectedImage) : null) ||
    formData.avatar ||
    "/avatar-holder.avif";

  return (
    <>
      <div className="min-h-screen pt-20 bg-gray-50">
        <div className="max-w-2xl mx-auto p-4 py-8">
          <div className="bg-white rounded-xl shadow-md p-6 space-y-8">
            <div className="text-center">
              <h1 className="text-2xl font-semibold text-gray-800">
                My Profile
              </h1>
              <p className="mt-2 text-gray-500">Your Profile Information</p>
              {/* Avatar upload */}

              <div className="flex flex-col items-center gap-4">
                <div className="relative group">
                  <img
                    src={displayImage}
                    alt="Profile"
                    className="w-32 h-32 rounded-full object-cover object-center border-4 border-gray-200"
                  />
                  {/* Remove button - only show if there's an image to remove */}
                  {/* {(imagePreview || formData.avatar) && (
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 shadow-md transition-all duration-200 opacity-0 group-hover:opacity-100 focus:opacity-100"
                      aria-label="Remove image"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )} */}
                  <label
                    htmlFor="avatar-upload"
                    className={`absolute bottom-0 right-0 bg-gray-800 hover:scale-105 p-2 rounded-full cursor-pointer transition-all duration-200 ${
                      isUpdatingProfile
                        ? "animate-pulse pointer-events-none"
                        : ""
                    }`}
                  >
                    <Camera className="w-5 h-5 text-white" />
                    <input
                      type="file"
                      id="avatar-upload"
                      onChange={handleImageUpload}
                      className="hidden"
                      accept="image/*"
                      disabled={isUpdatingProfile}
                    />
                  </label>
                </div>
                <div className="flex flex-col items-center">
                  <p className="text-sm text-gray-400">
                    {isUpdatingProfile
                      ? "uploading..."
                      : "Click the camera icon to upload your photos."}
                  </p>
                  {(imagePreview || formData.avatar) && (
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="mt-2 text-xs text-red-500 hover:text-red-700 underline"
                    >
                      Remove profile picture
                    </button>
                  )}
                </div>
              </div>
              <div className="space-y-6">
                <div className="space-y-1.5">
                  <div className="text-sm text-gray-500 flex items-center gap-2">
                    <User className="w-4 h-4" /> FullName
                  </div>
                  <input
                    type="text"
                    value={formData.fullName}
                    onChange={(e) =>
                      setFormData({ ...formData, fullName: e.target.value })
                    }
                    className="px-4 py-2.5 bg-gray-100 rounded-lg border border-gray-300 text-gray-800 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="space-y-1.5">
                  <div className="text-sm text-gray-500 flex items-center gap-2">
                    <Mail className="w-4 h-4" /> Email Address
                  </div>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className="px-4 py-2.5 bg-gray-100 rounded-lg border border-gray-300 text-gray-800 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Update Profile Button */}
              <div className="mt-6">
                <button
                  onClick={handleUpdateProfile}
                  disabled={isUpdatingProfile}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-md transition duration-200 flex justify-center items-center gap-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  {isUpdatingProfile ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" /> Saving...
                    </>
                  ) : (
                    "Update Profile"
                  )}
                </button>
              </div>
              {/* Account Info */}
              <div className="mt-6 bg-gray-50 border border-gray-200 rounded-xl p-6">
                <h2 className="text-lg font-medium text-gray-800 mb-4">
                  Account Information
                </h2>
                <div className="space-y-3 text-sm text-gray-600">
                  <div className="flex items-center justify-between py-2 border-b border-gray-200">
                    <span>Member Since</span>
                    <span>
                      {new Date(authUser?.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <span>Account Status</span>
                    <span className="text-green-600 font-medium">Active</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Profile;
