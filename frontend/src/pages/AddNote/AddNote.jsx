import React, { useState } from "react";
import { Editor } from "@tinymce/tinymce-react";

export default function AddNote() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const handleEditorChange = (newContent) => {
    setContent(newContent);
  };

  const handleSave = async () => {
    console.log("Title:", title);
    console.log("Content:", content); // This will be HTML text
    alert("Note saved successfully!");
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
        apiKey="vnyu773hbf5l349o66321lzn28qgolhph7ibh09jucdvu2z2" // replace this with your key
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
            "undo redo | blocks | " +
            "bold italic underline forecolor | alignleft aligncenter " +
            "alignright alignjustify | bullist numlist outdent indent | " +
            "removeformat | help",
          content_style:
            "body { font-family:Helvetica,Arial,sans-serif; font-size:14px }",
        }}
        value={content}
        onEditorChange={handleEditorChange}
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
