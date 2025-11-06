import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Sidebar from "../../components/Sidebar";
import AEDNotes from "../Notes/Notes";
import PersonalAssistant from "../PersonalAssistant/PersonalAssistant";
import Profile from "../Profile/Profile";
import AllNotes from "../AllNotes/AllNotes";

export default function Home() {
  return (
    <div className="flex h-screen overflow-hidden bg-gray-100">
      {/* Sidebar - fixed on the left */}
      <div className="fixed left-0 top-0 h-screen w-64 bg-gray-900 text-white overflow-y-auto">
        <Sidebar />
      </div>

      {/* Main Content Area (scrolls independently) */}
      <div className="ml-64 flex-1 overflow-y-auto p-6 h-screen">
        <Routes>
          <Route path="/" element={<Navigate to="/home/AllNotes" replace />} />
          <Route path="/AllNotes" element={<AllNotes />} />
          <Route path="/Notes" element={<AEDNotes />} />
          <Route path="/Notes/:id" element={<AEDNotes />} />
          <Route path="/PersonalAssistant" element={<PersonalAssistant />} />
          <Route path="/Profile" element={<Profile />} />
        </Routes>
      </div>
    </div>
  );
}
