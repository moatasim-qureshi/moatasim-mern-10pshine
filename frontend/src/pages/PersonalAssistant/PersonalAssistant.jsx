  import React, { useState, useEffect, useRef } from "react";
  import axios from "axios";

  export default function PersonalAssistant() {
    const [pdfFile, setPdfFile] = useState(null);
    const [fileName, setFileName] = useState("");
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [uploaded, setUploaded] = useState(false);
    const chatEndRef = useRef(null);

    // Scroll to bottom when a new message is added
    useEffect(() => {
      chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    // Handle PDF upload
    const handleUpload = async () => {
      if (!pdfFile) return alert("Please select a PDF first.");

      const formData = new FormData();
      formData.append("file", pdfFile);

      try {
        setLoading(true);
        await axios.post("http://localhost:5000/api/upload_pdf", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        setUploaded(true);
      } catch (err) {
        console.error(err);
        alert("Error uploading PDF. Check backend connection.");
      } finally {
        setLoading(false);
      }
    };

    // Handle asking a question
    const handleAsk = async () => {
      if (!input.trim()) return;

      const userMsg = { role: "user", content: input };
      setMessages((prev) => [...prev, userMsg]);
      setInput("");
      setLoading(true);

      try {
        const res = await axios.post("http://localhost:5000/api/ask_question", {
          question: input,
        });

        const botMsg = {
          role: "bot",
          content: res.data.answer || "No answer received.",
        };
        setMessages((prev) => [...prev, botMsg]);
      } catch (err) {
        console.error(err);
        alert("Error getting answer. Check backend.");
      } finally {
        setLoading(false);
      }
    };

    // Message bubble component
    const MessageBubble = ({ role, content }) => {
      const isUser = role === "user";
      return (
        <div className={`flex ${isUser ? "justify-end" : "justify-start"} w-full`}>
          <div
            className={`max-w-[70%] px-4 py-2 rounded-2xl ${
              isUser
                ? "bg-blue-500 text-white rounded-br-none"
                : "bg-gray-200 text-gray-800 rounded-bl-none"
            }`}
          >
            {content}
          </div>
        </div>
      );
    };

    return (
      <div className="p-6 min-h-screen bg-gray-50 flex flex-col">
        <h1 className="text-3xl font-bold mb-6 text-center">Personal Assistant</h1>

        {!uploaded ? (
          <div className="border-dashed border-2 border-gray-400 rounded-lg p-10 text-center bg-white shadow-sm">
            <p className="mb-4 text-gray-600">
              Upload a PDF to start chatting about its content.
            </p>
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
              className="cursor-pointer mb-4"
            />
            {fileName && <p className="mb-3 text-blue-600">{fileName}</p>}
            <button
              onClick={handleUpload}
              disabled={!pdfFile || loading}
              className={`${
                loading ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"
              } text-white px-6 py-2 rounded`}
            >
              {loading ? "Uploading..." : "Upload PDF"}
            </button>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-lg">
                Chatting about: <span className="text-blue-600">{fileName}</span>
              </h2>
              <button
                onClick={() => {
                  setPdfFile(null);
                  setUploaded(false);
                  setMessages([]);
                }}
                className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
              >
                Change PDF
              </button>
            </div>

            <div className="flex-1 overflow-y-auto border rounded p-4 space-y-3 bg-white shadow-inner">
              {messages.length === 0 ? (
                <p className="text-gray-500 text-center mt-10">
                  Start by asking a question about your PDF...
                </p>
              ) : (
                messages.map((msg, i) => (
                  <MessageBubble key={i} role={msg.role} content={msg.content} />
                ))
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
                className="flex-1 border rounded p-2"
              />
              <button
                onClick={handleAsk}
                disabled={loading}
                className={`${
                  loading ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"
                } text-white px-4 rounded`}
              >
                {loading ? "Thinking..." : "Send"}
              </button>
            </div>
          </>
        )}
      </div>
    );
  }
