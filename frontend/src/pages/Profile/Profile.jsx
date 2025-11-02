import React, { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";

const Profile = () => {
  const userId = localStorage.getItem("user_id");
  const [user, setUser] = useState(null);
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [profileImage, setProfileImage] = useState(null);
  const [preview, setPreview] = useState("");
  

  // Fetch user details
  useEffect(() => {

    const fetchUser = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/users/${userId}`);
        setUser(res.data);
        setName(res.data.name || "");
        setPreview(res.data.profile_image || "");
      } catch (err) {
        console.error(err);
      }
    };
    fetchUser();
  }, [userId]);

  // Image change handler
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  // Update handler
  const handleUpdate = async () => {
    const formData = new FormData();

    if (name && name !== user?.name) formData.append("name", name);
    if (password.trim()) formData.append("password", password);
    if (profileImage) formData.append("profile_image", profileImage);

    if ([...formData.keys()].length === 0) {
      Swal.fire("No changes", "You haven't updated anything.", "info");
      return;
    }

    try {
      await axios.put(`http://localhost:5000/api/users/${userId}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      Swal.fire({
        icon: "success",
        title: "Profile Updated",
        text: "Your profile has been updated successfully.",
        showConfirmButton: false,
        timer: 1500,
      });

      const updated = await axios.get(`http://localhost:5000/api/users/${userId}`);
      setUser(updated.data);
      setPassword("");
      setProfileImage(null);
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Failed to update profile.", "error");
    }
  };

  if (!user)
    return <div className="text-center mt-10 text-gray-500">Loading...</div>;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 text-gray-800">
      {/* Profile Header */}
      <div className="flex flex-col items-center gap-4">
        <div className="relative group">
          <img
            src={preview || "https://via.placeholder.com/150?text=Profile"}
            alt="Profile"
            className="w-32 h-32 rounded-full object-cover border border-gray-300 shadow-sm transition-transform duration-300 group-hover:scale-105"
          />
          <label className="absolute bottom-1 right-1 bg-gray-900 text-white text-xs rounded-full px-2 py-1 cursor-pointer hover:bg-gray-700 transition">
            Upload
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
          </label>
        </div>
        <h2 className="text-2xl font-semibold">{user.name}</h2>
        <p className="text-gray-500 text-sm">{user.email}</p>
      </div>

      {/* Editable Inputs */}
      <div className="mt-8 w-full max-w-sm space-y-5">
        <div>
          <label className="block text-gray-600 mb-1 font-medium">Name</label>
          <input
            type="text"
            value={name}
            placeholder="Enter your name"
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-gray-100 border border-gray-300 rounded-xl p-2.5 focus:ring-2 focus:ring-gray-400 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-gray-600 mb-1 font-medium">New Password</label>
          <input
            type="password"
            placeholder="Enter new password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-gray-100 border border-gray-300 rounded-xl p-2.5 focus:ring-2 focus:ring-gray-400 focus:outline-none"
          />
        </div>

        <button
          onClick={handleUpdate}
          className="w-full bg-black text-white py-2.5 rounded-xl font-medium hover:opacity-90 transition mt-6"
        >
          Save Changes
        </button>
      </div>
    </div>
  );
};

export default Profile;
