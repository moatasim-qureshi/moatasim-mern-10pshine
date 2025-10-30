import React from "react";
import { MdOutlineDeleteOutline } from "react-icons/md";

export default function NoteCard({ note, onClick, onDelete }) {
  return (
    <div
      className="bg-white shadow-md border border-gray-200 rounded-xl p-5 hover:shadow-lg transition-shadow duration-300 cursor-pointer"
      onClick={onClick}
    >
      <div className="flex justify-between items-start">
        <h3 className="font-semibold text-lg text-gray-800 truncate pr-2">
          {note.title}
        </h3>

        {/* Delete button with hover animation */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(note.id);
          }}
          className="text-gray-400 hover:text-red-500 hover:scale-110 transition-transform duration-200"
          title="Delete Note"
        >
          <MdOutlineDeleteOutline size={22} />
        </button>
      </div>

      <div
        className="mt-3 text-gray-600 text-sm leading-relaxed"
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
