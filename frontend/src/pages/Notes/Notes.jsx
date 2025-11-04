import React, { useState, useEffect } from "react";
import { Editor } from "@tinymce/tinymce-react";
// import axios from "axios";
import Swal from "sweetalert2";
import { useNavigate, useParams } from "react-router-dom";
import axios from "../../axiosConfig.js";

export default function AEDNotes() {
  const { id: noteId } = useParams();
  const navigate = useNavigate();

  const [mode, setMode] = useState("add");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [originalTitle, setOriginalTitle] = useState("");
  const [originalContent, setOriginalContent] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNote = async () => {
      if (noteId) {
        try {
          const res = await axios.get(`/notes/${noteId}`);
          const note = res.data;
          setTitle(note.title || "");
          setContent(note.description || "");
          setOriginalTitle(note.title || "");
          setOriginalContent(note.description || "");
          setMode("read");
        } catch (err) {
          Swal.fire("Error", "Failed to load note", "error");
        }
      } else {
        setMode("add");
      }
      setLoading(false);
    };
    fetchNote();
  }, [noteId]);

  const handleSave = async () => {
    try {
      const user_id = localStorage.getItem("user_id");
      if (!title || !content)
        return Swal.fire("Error", "Please fill all fields", "error");

      if (mode === "add") {
        const res = await axios.post("/notes/add", {
          title,
          description: content,
          user_id,
        });
        Swal.fire("Success", res.data.message, "success");
      } else if (mode === "edit") {
        await axios.put(`/notes/${noteId}`, {
          title,
          description: content,
        });
        Swal.fire("Updated", "Note updated successfully", "success");
      }

      navigate("/home/allnotes");
    } catch (err) {
      Swal.fire("Error", "Something went wrong", "error");
    }
  };

  const handleCancel = () => {
    setTitle(originalTitle);
    setContent(originalContent);
    setMode("read");
  };

  if (loading) {
    return <div className="text-center mt-10 text-gray-600">Loading note...</div>;
  }

  return (
    <div className="max-w-5xl mx-auto bg-white shadow rounded-lg p-6 relative">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">
        {mode === "add"
          ? "Add a New Note"
          : mode === "edit"
          ? "Editing Note"
          : "Viewing Note"}
      </h2>

      <input
        type="text"
        placeholder="Enter note title..."
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onDoubleClick={() => {
          if (mode === "read") {
            setOriginalTitle(title);
            setOriginalContent(content);
            setMode("edit");
          }
        }}
        disabled={mode === "read"}
        className={`w-full mb-4 p-3 border rounded transition-all ${
          mode === "read"
            ? "bg-gray-100 cursor-not-allowed"
            : "bg-white border-gray-400"
        }`}
      />

      <div className="relative">
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

        {mode === "read" && (
          <div
            className="absolute inset-0 cursor-pointer"
            onDoubleClick={() => {
              setOriginalTitle(title);
              setOriginalContent(content);
              setMode("edit");
            }}
            title="Double-click to edit"
          />
        )}
      </div>

      <div className="mt-4 flex gap-3">
        {mode === "edit" && (
          <>
            <button
              onClick={handleSave}
              className="bg-black hover:bg-gray-800 text-white px-6 py-2 rounded"
            >
              Save
            </button>
            <button
              onClick={handleCancel}
              className="bg-gray-300 hover:bg-gray-400 text-black px-6 py-2 rounded"
            >
              Cancel
            </button>
          </>
        )}

        {mode === "add" && (
          <button
            onClick={handleSave}
            className="bg-black hover:bg-gray-800 text-white px-6 py-2 rounded"
          >
            Save
          </button>
        )}

        {mode === "read" && (
          <button
            onClick={() => navigate("/home/allnotes")}
            className="bg-black hover:bg-gray-800 text-white px-6 py-2 rounded"
          >
            Back
          </button>
        )}
      </div>
    </div>
  );
}
