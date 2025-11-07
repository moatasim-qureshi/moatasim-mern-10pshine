import React from "react";
import { MdOutlineDeleteOutline } from "react-icons/md";

export default function NoteCard({ note, onClick, onDelete }) {
  return (
    <div
      onClick={onClick}
      className="flex flex-col justify-between bg-white/90 backdrop-blur-md border border-gray-200 
                 rounded-2xl p-4 hover:shadow-lg shadow-sm transition-all duration-300 cursor-pointer 
                 h-48 w-full"
    >
      {/* Title + Delete button */}
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-semibold text-lg text-gray-800 truncate pr-2">
          {note.title}
        </h3>

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
        className="text-gray-700 text-sm leading-relaxed overflow-hidden relative"
        style={{
          display: "-webkit-box",
          WebkitLineClamp: 3,
          WebkitBoxOrient: "vertical",
        }}
        dangerouslySetInnerHTML={{
          __html: note.description,
        }}
      />

      <div className="absolute bottom-0 left-0 right-0 h-10 bg-gradient-to-t from-white/95 to-transparent pointer-events-none rounded-b-2xl"></div>
    </div>
  );
}
