import React from "react";
import { Routes, Route, NavLink } from "react-router-dom";
import Sidebar from "../../components/Sidebar";
import AEDNotes from "../Notes/Notes";
import UploadDoc from "../UploadDoc/UploadDoc";
import Profile from "../Profile/Profile";
import AllNotes from "../AllNotes/AllNotes";
import { Navigate } from "react-router-dom";
// import UploadDocument from "../UploadDocument";



export default function Home() {
  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar stays fixed */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 p-6">
        <Routes>
            <Route path="/" element={<Navigate to="/home/all-notes" replace />} />
          <Route path="/AllNotes" element={<AllNotes />} />
          <Route path="/Notes" element={<AEDNotes />} />
          <Route path="/Notes/:id" element={<AEDNotes />} />
          <Route path="/UploadDoc" element={<UploadDoc />} />
          <Route path="/Profile" element={<Profile />} />
        </Routes>
      </div>
    </div>
  );
}
