import React from "react";

export default function NoteCard({ note, onClick, onDelete }) {
  return (
    <div
      className="bg-white shadow border rounded p-4 hover:shadow-md cursor-pointer"
      onClick={onClick}
    >
      <div className="flex justify-between items-center">
        <h3 className="font-semibold text-lg truncate">{note.title}</h3>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(note.id);
          }}
          className="text-red-500 hover:text-red-700"
        >
          🗑️
        </button>
      </div>

      <div
        className="mt-2 text-gray-600 text-sm"
        dangerouslySetInnerHTML={{
          __html:
            note.description.length > 100
              ? note.description.slice(0, 100) + "..."
              : note.description,
        }}
      />
    </div>
  );
}
