import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import NoteCard from "../../components/Noteslist";
import Swal from "sweetalert2";
import { FiSearch } from "react-icons/fi";
import { motion } from "framer-motion";

export default function AllNotes() {
  const [notes, setNotes] = useState([]);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  const fetchNotes = async () => {
    try {
      const user_id = localStorage.getItem("user_id");
      if (!user_id) {
        Swal.fire("Error", "User not logged in", "error");
        return;
      }

      const res = await axios.post("http://localhost:5000/api/notes/get", {
        user_id,
      });

      setNotes(res.data);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching notes:", err);
      Swal.fire("Error", "Failed to fetch notes", "error");
    }
  };

  useEffect(() => {
    fetchNotes();
  }, []);

  const handleDelete = async (id) => {
    const confirm = await Swal.fire({
      title: "Are you sure?",
      text: "This note will be permanently deleted!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    });

    if (!confirm.isConfirmed) return;

    try {
      await axios.delete(`http://localhost:5000/api/notes/${id}`);
      Swal.fire("Deleted!", "Note has been deleted.", "success");
      setNotes((prev) => prev.filter((n) => n.id !== id));
    } catch (err) {
      console.error("Error deleting note:", err);
      Swal.fire("Error", "Failed to delete note", "error");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-80 text-gray-500 text-lg">
        <div className="animate-pulse">Loading your notes...</div>
      </div>
    );
  }

  const filteredNotes = notes.filter((n) =>
    n.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto p-8 bg-gradient-to-br from-gray-50 to-gray-100">

      <div className="w-full mb-8">
        <div className="relative">
          <FiSearch className="absolute left-4 top-3.5 text-gray-400 text-lg" />
          <input
            type="text"
            placeholder="Search notes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-5 py-3 rounded-2xl border border-gray-200 bg-white/80 shadow-sm 
                      focus:outline-none focus:ring-2 focus:ring-gray-300 transition-all duration-300"
          />
        </div>
      </div>

      {filteredNotes.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center text-gray-500 mt-16"
        >
          <p className="text-lg">No notes yet.</p>
          <p className="text-sm text-gray-400 mt-2">
            Create your first note to get started.
          </p>
        </motion.div>
      ) : (
        <motion.div
          layout
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
        >
          {filteredNotes.map((note) => (
            <motion.div
              key={note.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              transition={{ duration: 0.2 }}
            >
              <NoteCard
                note={note}
                onClick={() => navigate(`/home/Notes/${note.id}`)}
                onDelete={handleDelete}
              />
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}
