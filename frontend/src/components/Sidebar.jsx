import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { FaStickyNote, FaPlus, FaUser, FaUpload, FaSignOutAlt } from "react-icons/fa";
import { CiLogout } from "react-icons/ci";
import Swal from "sweetalert2";

const Sidebar = () => {
  const navigate = useNavigate();

  const navItems = [
    { path: "/home/AllNotes", icon: <FaStickyNote />, label: "All Notes" },
    { path: "/home/Notes", icon: <FaPlus />, label: "Add a Note" },
    { path: "/home/Profile", icon: <FaUser />, label: "Profile" },
    { path: "/home/PersonalAssistant", icon: <FaUpload />, label: "Upload Document" },
  ];

  const handleLogout = () => {
    Swal.fire({
      title: "Are you sure?",
      text: "You’ll be logged out of your account.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes",
    }).then((result) => {
      if (result.isConfirmed) {
        localStorage.removeItem("user_id");
        Swal.fire("Logged Out!", "You’ve been successfully logged out.", "success").then(() => {
          navigate("/");
        });
      }
    });
  };

  return (
    <div className="relative w-64 bg-gray-900 text-white flex flex-col py-8">
      <h1 className="text-2xl font-bold text-center mb-10">NoteIt</h1>

      <nav className="flex flex-col gap-2 flex-grow">
        {navItems.map((item, i) => (
          <NavLink
            key={i}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-6 py-3 hover:bg-gray-700 transition ${
                isActive ? "bg-gray-700" : ""
              }`
            }
          >
            {item.icon}
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <button
        onClick={handleLogout}
        className="absolute top-129 right-5 flex items-center gap-2 text-white px-4 py-2 shadow-md transition"
      >
        <CiLogout size={38} />
      </button>
    </div>
  );
};

export default Sidebar;
