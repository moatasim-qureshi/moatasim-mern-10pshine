import React, { useState } from "react";
import { Editor } from "@tinymce/tinymce-react";
import axios from "axios";
import Swal from "sweetalert2";

export default function AddNote() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const handleSave = async () => {
  try {
    if (!title || !content) {
      Swal.fire("Missing Fields", "Please fill in all fields before saving.", "warning");
      return;
    }

    const user_id = localStorage.getItem("user_id");

    if (!user_id) {
      Swal.fire("Unauthorized", "User not logged in. Please login again.", "error");
      return;
    }

    const res = await axios.post("http://localhost:5000/api/notes/add", {
      title,
      description: content,
      user_id,
    });


    if (res.status === 201) {
      Swal.fire("Success!", res.data.message, "success");
      setTitle("");
      setContent("");
    }

  } catch (err) {
    console.error("Error saving note:", err);

    const message =
      err.response?.data?.error ||
      err.response?.data?.message ||
      "Something went wrong while saving the note.";

    Swal.fire("Error", message, "error");
  }
};


  return (
    <div className="max-w-5xl mx-auto bg-white shadow-lg rounded-lg p-6">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Add a New Note</h2>

      {/* Note Title */}
      <input
        type="text"
        placeholder="Enter note title..."
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="w-full mb-4 p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
      />

      {/* TinyMCE Editor */}
      <Editor
        apiKey="vnyu773hbf5l349o66321lzn28qgolhph7ibh09jucdvu2z2"
        value={content}
        onEditorChange={(newContent) => setContent(newContent)}
        init={{
          height: 400,
          menubar: true,
          plugins: [
            "advlist", "autolink", "lists", "link", "image", "charmap",
            "preview", "anchor", "searchreplace", "visualblocks",
            "code", "fullscreen", "insertdatetime", "media", "table",
            "help", "wordcount"
          ],
          toolbar:
            "undo redo | blocks | bold italic underline forecolor | " +
            "alignleft aligncenter alignright alignjustify | " +
            "bullist numlist outdent indent | removeformat | help",
          content_style:
            "body { font-family:Helvetica,Arial,sans-serif; font-size:14px }",
        }}
      />

      <button
        onClick={handleSave}
        className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded"
      >
        Save Note
      </button>
    </div>
  );
}
