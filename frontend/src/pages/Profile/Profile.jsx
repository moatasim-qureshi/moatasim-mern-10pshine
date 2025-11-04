import React, { useState, useEffect } from "react";
// import axios from "axios";
import Swal from "sweetalert2";
import VerificationScreen from "../../components/Verfication";
import axios from "../../axiosConfig.js";


const Profile = () => {
  const userId = localStorage.getItem("user_id");
  const [user, setUser] = useState(null);
  const [name, setName] = useState("");
  const [profileImage, setProfileImage] = useState(null);
  const [preview, setPreview] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [verificationCode, setVerificationCode] = useState(["", "", "", "", "", ""]);
  const [newPassword, setNewPassword] = useState("");
  const [codeSent, setCodeSent] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get(`/users/${userId}`);
        setUser(res.data);
        setName(res.data.name || "");
        setPreview(res.data.profile_image || "");
      } catch (err) {
        console.error(err);
      }
    };
    fetchUser();
  }, [userId]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  // const handleUpdate = async () => {
  //   if (!newPassword.trim()) {
  //     Swal.fire("Error", "Please enter a new password first.", "error");
  //     return;
  //   }

  //   try {
  //     await axios.post(`/users/${userId}/request-password-change`);
  //     setCodeSent(true);
  //     setIsChangingPassword(true);
  //   } catch (err) {
  //     Swal.fire("Error", "Failed to send verification code.", "error");
  //   }
  // };

  const handleUpdate = async () => {
  try {
    if (newPassword.trim()) {
      await axios.post(`/users/${userId}/request-password-change`);
      setCodeSent(true);
      setIsChangingPassword(true);
      Swal.fire("Verification Sent", "A code has been sent to your email.", "info");
      return;
    }


    const formData = new FormData();
    if (name.trim()) formData.append("name", name);
    if (profileImage) formData.append("profile_image", profileImage);

    const res = await axios.put(`/users/${userId}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    Swal.fire("Updated", "Profile updated successfully!", "success");
    setUser(res.data.user);
  } catch (err) {
    console.error(err);
    Swal.fire("Error", err.response?.data?.error || "Failed to update profile.", "error");
  }
};


  const handleCodeChange = (index, value) => {
    if (/^[0-9]?$/.test(value)) {
      const updated = [...verificationCode];
      updated[index] = value;
      setVerificationCode(updated);

      // Move to next box automatically
      const nextInput = document.getElementById(`code-input-${index + 1}`);
      if (value && nextInput) nextInput.focus();

      // If all filled
      if (updated.every((digit) => digit !== "")) {
        verifyCode(updated.join(""));
      }
    }
  };

  const verifyCode = async (code) => {
    try {
      await axios.post(`/users/${userId}/verify-password-change`, {
        code,
        newPassword,
      });

      Swal.fire({
        icon: "success",
        title: "Password Updated",
        text: "Your password has been changed successfully.",
        showConfirmButton: false,
        timer: 2000,
      });

      // Reset UI
      setCodeSent(false);
      setIsChangingPassword(false);
      setVerificationCode(["", "", "", "", "", ""]);
      setNewPassword("");
    } catch (err) {
      Swal.fire("Error", err.response?.data?.error || "Invalid code.", "error");
    }
  };

  const handleResend = async () => {
    try {
      await axios.post(`/users/${userId}/request-password-change`);
      Swal.fire("Sent!", "Verification code resent successfully.", "success");
    } catch {
      Swal.fire("Error", "Failed to resend code.", "error");
    }
  };

  if (!user)
    return <div className="text-center mt-10 text-gray-500">Loading...</div>;

  // --- Verification Screen ---
  if (isChangingPassword && codeSent) {
    return (
      <VerificationScreen
      verificationCode={verificationCode}
      handleCodeChange={handleCodeChange}
      handleResend={handleResend}
    />
  );
  }

  return (
    <div className="flex flex-col items-center justify-center h-132">
      <div className="flex flex-col items-center gap-4">
        <div className="relative group">
          <img
            src={preview || "https://avatar.iran.liara.run/public/8"}
            alt="Profile"
            className="w-32 h-32 rounded-full object-cover border border-gray-300 shadow-sm"
          />
          <label className="absolute bottom-1 right-1 bg-gray-900 text-white text-xs rounded-full px-2 py-1 cursor-pointer hover:bg-gray-700">
            Upload
            <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
          </label>
        </div>
        <h2 className="text-2xl font-semibold">{user.name}</h2>
        <p className="text-gray-500 text-sm">{user.email}</p>
      </div>

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
            value={newPassword}
            placeholder="Enter new password"
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full bg-gray-100 border border-gray-300 rounded-xl p-2.5 focus:ring-2 focus:ring-gray-400 focus:outline-none"
          />
        </div>

        <button
          onClick={handleUpdate}
          className="w-full bg-black text-white py-2.5 rounded-xl font-medium hover:opacity-90 transition mt-4"
        >
          Save Changes
        </button>

      </div>
    </div>
  );
};

export default Profile;
