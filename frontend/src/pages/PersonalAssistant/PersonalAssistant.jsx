import React, { useState, useEffect, useRef } from "react";
// import axios from "axios";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import Swal from "sweetalert2";
import { MdOutlineDeleteOutline } from "react-icons/md";
import axios from "../../axiosConfig.js";

export default function PersonalAssistant() {
  const [pdfFile, setPdfFile] = useState(null);
  const [fileName, setFileName] = useState("");
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploaded, setUploaded] = useState(false);
  const userId = localStorage.getItem("user_id");
  const [sessions, setSessions] = useState([]);
  const [activeSession, setActiveSession] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const chatEndRef = useRef(null);
  const [botTyping, setBotTyping] = useState(false);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const fetchSessions = async () => {
    try {
      const res = await axios.get(`/chats/${userId}`);
      setSessions(res.data);
    } catch (err) {
      console.error("Error fetching chat sessions:", err);
    }
  };

  const fetchMessages = async (sessionId) => {
    try {
      const res = await axios.get(
        `/chats/session/${sessionId}`
      );
      setMessages(
        res.data
          .map((msg) => [
            { role: "user", content: msg.question },
            { role: "bot", content: msg.answer },
          ])
          .flat()
      );
    } catch (err) {
      console.error("Error fetching messages:", err);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  const handleUpload = async () => {
    if (!pdfFile) return alert("Please select a PDF first.");
    const formData = new FormData();
    formData.append("file", pdfFile);

    try {
      setLoading(true);
      await axios.post("/upload_pdf", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const sessionRes = await axios.post(
        "/chats/session/create",
        {
          user_id: userId,
          title: pdfFile.name,
        }
      );

      setActiveSession(sessionRes.data.session);
      setUploaded(true);
      setFileName(pdfFile.name);
      fetchSessions();
    } catch (err) {
      console.error(err);
      alert("Error uploading PDF or creating session.");
    } finally {
      setLoading(false);
    }
  };

  const handleAsk = async () => {
    if (!input.trim()) return;
    if (!activeSession) return alert("No active session. Upload a PDF first.");

    const userMsg = { role: "user", content: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    // setLoading(true);
    setBotTyping(true);


    try {
      const res = await axios.post("/ask_question", {
        user_id: userId,
        question: input,
        session_id: activeSession.id,
      });

      const botMsg = { role: "bot", content: res.data.answer || "No answer." };
      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      console.error(err);
      alert("Error getting answer.");
    } finally {
      // setLoading(false);
      setBotTyping(false);
    }
  };

  const handleNewChat = async () => {
    const result = await Swal.fire({
      title: "Start a new chat?",
      icon: "info",
      showCancelButton: true,
      confirmButtonText: "Yes",
      cancelButtonText: "Back",
      reverseButtons: true,
    });
    if (result.isConfirmed) {
      setMessages([]);
      setUploaded(false);
      setActiveSession(null);
      setPdfFile(null);
      setFileName("");
    }
  };

  const handleDeleteSession = async (sessionId) => {
    const confirm = await Swal.fire({
      title: "Are you sure?",
      text: "This will delete the chat session permanently!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Delete",
      cancelButtonText: "Cancel",
      dangerMode: true,
    });

    if (confirm.isConfirmed) {
      try {
        await axios.delete(`/chats/session/${sessionId}`);
        Swal.fire("Deleted!", "Chat session deleted successfully.", "success");
        fetchSessions();

        if (activeSession?.id === sessionId) {
          setActiveSession(null);
          setMessages([]);
          setUploaded(false);
          setFileName("");
        }
      } catch (err) {
        console.error(err);
        Swal.fire("Error", "Failed to delete chat session.", "error");
      }
    }
  };

  const MessageBubble = ({ role, content }) => {
    const isUser = role === "user";
    return (
      <div className={`flex ${isUser ? "justify-end" : "justify-start"} w-full`}>
        <div
          className={`max-w-[70%] px-4 py-2 rounded-2xl ${
            isUser
              ? "bg-black text-white rounded-br-none"
              : "bg-gray-200 text-gray-800 rounded-bl-none"
          }`}
        >
          {isUser ? (
            content
          ) : (
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                p: ({ children }) => <p className="mb-2">{children}</p>,
                strong: ({ children }) => (
                  <strong className="font-semibold">{children}</strong>
                ),
                li: ({ children }) => <li className="list-disc ml-5">{children}</li>,
                code: ({ children }) => (
                  <code className="bg-gray-300 text-sm px-1 rounded">{children}</code>
                ),
              }}
            >
              {content}
            </ReactMarkdown>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col bg-gray-50 relative" style={{height: 530}}>
      <div className="absolute top-6 left-6">
        <button
          onClick={() => setDropdownOpen((prev) => !prev)}
          className="bg-black text-white px-4 py-2 rounded shadow-md hover:bg-gray-800 transition"
        >
          ☰ Previous Chats
        </button>

        {dropdownOpen && (
          <div className="absolute top-12 left-0 bg-white shadow-lg border rounded w-80 max-h-96 overflow-y-auto z-10 animate-fadeIn">
            {sessions.length === 0 ? (
              <p className="p-3 text-gray-500 text-center">No previous chats</p>
            ) : (
              sessions.map((session) => (
                <div
                  key={session.id}
                  className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-gray-100 transition duration-200"
                >
                  <button
                    onClick={async () => {
                      setDropdownOpen(false);
                      setActiveSession(session);
                      setUploaded(true);
                      setFileName(session.title);
                      await fetchMessages(session.id);
                    }}
                    className="flex-1 text-left"
                  >
                    {session.title}
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteSession(session.id);
                    }}
                    className="ml-2 text-red-500 hover:text-red-700 transition p-2"
                  >
                    <MdOutlineDeleteOutline size={24} color="black"/>
                  </button>
                </div>
              ))
            )}
          </div>
        )}

      </div>

      <h1 className="text-3xl font-bold text-center mb-5">Personal Assistant</h1>

      {!uploaded ? (
        <div className="flex flex-col justify-center items-center flex-1 p-5 rounded-3xl shadow-xl">
          <h1 className="text-3xl font-extrabold text-gray-900 mb-1 text-center">
            This is your Assistant
          </h1>
          <p className="text-gray-500 mb-8 text-center">
            Upload a PDF and take notes Simple.
          </p>

          <label className="cursor-pointer w-full">
            <input
              type="file"
              accept="application/pdf"
              onChange={(e) => {
                const file = e.target.files[0];
                if (file && file.type === "application/pdf") {
                  setPdfFile(file);
                  setFileName(file.name);
                } else {
                  alert("Please upload a valid PDF file.");
                }
              }}
              className="hidden"
            />
            <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-2xl p-10 hover:border-gray-400 hover:bg-gray-50 transition duration-300 ease-in-out">
              <svg
                className="w-12 h-12 text-gray-400 mb-4"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              <p className="text-gray-600 font-medium text-lg">
                {fileName || "Click or drag PDF here"}
              </p>
              <p className="text-gray-400 mt-1 text-sm">Supports only PDF files</p>
            </div>
          </label>

          <button
            onClick={handleUpload}
            disabled={!pdfFile || loading}
            className={`mt-6 w-full py-3 rounded-xl text-white font-semibold shadow-lg transition duration-300 ${
              loading ? "bg-gray-400 cursor-not-allowed" : "bg-black hover:bg-gray-800"
            }`}
          >
            {loading ? "Uploading..." : "Upload PDF & Start Chat"}
          </button>
        </div>
      ) : (
        <div className="flex flex-col flex-1 max-h-[calc(100vh-140px)]">
          <div className="flex items-center justify-between mb-3 mt-4 ml-6">
            <h2 className="font-semibold text-lg">
              Chatting about: <span className="text-gray-500">{fileName}</span>
            </h2>

            <button
              onClick={handleNewChat}
              className="bg-black text-white px-3 py-1 rounded hover:bg-gray-700"
            >
              New Chat
            </button>
          </div>

          <div className="flex-1 overflow-y-auto rounded-lg p-4 space-y-3 bg-white shadow-inner">
            {messages.map((msg, i) => (
              <MessageBubble key={i} role={msg.role} content={msg.content} />
            ))}
            {botTyping && (
              <div className="flex justify-start w-full">
                <div className="max-w-[70%] px-4 py-2 rounded-2xl bg-gray-200 text-gray-800 rounded-bl-none animate-pulse">
                  Thinking...
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          <div className="flex mt-4 space-x-2">
  <input
    type="text"
    value={input}
    onChange={(e) => setInput(e.target.value)}
    onKeyDown={(e) => e.key === "Enter" && handleAsk()}
    placeholder="Ask a question about the PDF..."
    className="flex-1 border border-gray-300 rounded-full px-4 py-2 shadow-sm focus:outline-none 
               focus:ring-2 focus:ring-black/50 focus:border-transparent transition-all duration-200"
  />
  <button
    onClick={handleAsk}
    disabled={loading}
    className="bg-black hover:bg-gray-800 text-white px-5 py-2 rounded-full shadow-md 
               transition-all duration-200 disabled:opacity-50"
  >
    Send
  </button>
          </div>

        </div>
      )}
    </div>
  );
}
