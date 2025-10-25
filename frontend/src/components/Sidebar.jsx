import React from "react";
import { NavLink } from "react-router-dom";
import { FaStickyNote, FaPlus, FaUser, FaUpload } from "react-icons/fa";

const Sidebar = () => {
  const navItems = [
  { path: "/home/AllNotes", icon: <FaStickyNote />, label: "All Notes" },
  { path: "/home/AddNote", icon: <FaPlus />, label: "Add a Note" },
  { path: "/home/Profile", icon: <FaUser />, label: "Profile" },
  { path: "/home/UploadDoc", icon: <FaUpload />, label: "Upload Document" },
];


  return (
    <div className="w-64 bg-gray-900 text-white flex flex-col py-8">
      <h1 className="text-2xl font-bold text-center mb-10">NoteKeeper</h1>

      <nav className="flex flex-col gap-2">
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
    </div>
  );
};

export default Sidebar;
