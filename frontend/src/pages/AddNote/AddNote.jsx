import React, { useState, useEffect } from "react";
import { Editor } from "@tinymce/tinymce-react";
import axios from "axios";
import Swal from "sweetalert2";
import { useNavigate, useSearchParams } from "react-router-dom";

export default function NotePage() {
  const [searchParams] = useSearchParams();
  const noteId = searchParams.get("id");
  const navigate = useNavigate();

  const [mode, setMode] = useState("add"); // add | read | edit
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  // Load note if id exists
  useEffect(() => {
    if (noteId) {
      setMode("read");
      const fetchNote = async () => {
        const res = await axios.get(`http://localhost:5000/api/notes/${noteId}`);
        const note = res.data;
        setTitle(note.title);
        setContent(note.description);
      };
      fetchNote();
    } else {
      setMode("add");
    }
  }, [noteId]);

  const handleSave = async () => {
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      if (!title || !content)
        return Swal.fire("Error", "Please fill all fields", "error");

      if (mode === "add") {
        const res = await axios.post("http://localhost:5000/api/notes/add", {
          title,
          description: content,
          user_id: user.id,
        });
        Swal.fire("Success!", res.data.message, "success");
      } else if (mode === "edit") {
        await axios.put(`http://localhost:5000/api/notes/update/${noteId}`, {
          title,
          description: content,
        });
        Swal.fire("Updated!", "Note updated successfully", "success");
      }

      navigate("/notes");
    } catch (err) {
      Swal.fire("Error", "Something went wrong", "error");
    }
  };

  return (
    <div className="max-w-5xl mx-auto bg-white shadow rounded-lg p-6">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">
        {mode === "add"
          ? "Add a New Note"
          : mode === "edit"
          ? "Editing Note"
          : "Reading Note"}
      </h2>

      <input
        type="text"
        placeholder="Enter note title..."
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        disabled={mode === "read"}
        className={`w-full mb-4 p-3 border rounded ${
          mode === "read" ? "bg-gray-100 cursor-not-allowed" : ""
        }`}
      />

      <Editor
        apiKey="vnyu773hbf5l349o66321lzn28qgolhph7ibh09jucdvu2z2"
        value={content}
        init={{
          height: 400,
          menubar: true,
          plugins: [
            "advlist",
            "autolink",
            "lists",
            "link",
            "image",
            "charmap",
            "preview",
            "anchor",
            "searchreplace",
            "visualblocks",
            "code",
            "fullscreen",
            "insertdatetime",
            "media",
            "table",
            "help",
            "wordcount",
          ],
          toolbar:
            "undo redo | bold italic underline | alignleft aligncenter alignright | bullist numlist | removeformat",
          readonly: mode === "read",
        }}
        onEditorChange={(newContent) => setContent(newContent)}
        disabled={mode === "read"}
      />

      <div className="mt-4 flex gap-3">
        {mode === "read" && (
          <button
            onClick={() => setMode("edit")}
            className="bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-2 rounded"
          >
            ✏️ Edit
          </button>
        )}
        {mode !== "read" && (
          <button
            onClick={handleSave}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded"
          >
            💾 Save
          </button>
        )}
        <button
          onClick={() => navigate("/notes")}
          className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded"
        >
          🔙 Back
        </button>
      </div>
    </div>
  );
}
