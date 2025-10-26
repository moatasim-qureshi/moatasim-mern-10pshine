import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import NoteCard from "../../components/Noteslist";
import Swal from "sweetalert2";

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
    return <div className="text-center mt-10 text-gray-600">Loading notes...</div>;
  }


  const filteredNotes = notes.filter((n) =>
    n.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto p-6">

      <div className="flex justify-between mb-4">
        <input
          type="text"
          placeholder="Search notes..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-230 p-2 border rounded"
        />
      </div>

      {/* 🗂️ Notes Grid */}
      {filteredNotes.length === 0 ? (
        <p className="text-gray-500 text-center">No notes yet.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredNotes.map((note) => (
            <NoteCard
              key={note.id}
              note={note}
              onClick={() => navigate(`/home/Notes/${note.id}`)}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}
