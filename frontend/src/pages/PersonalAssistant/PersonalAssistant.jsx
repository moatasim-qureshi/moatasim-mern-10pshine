import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function PersonalAssistant() {
  const [pdfFile, setPdfFile] = useState(null);
  const [fileName, setFileName] = useState("");
  const [messages, setMessages] = useState(() => {
    const saved = localStorage.getItem("chatMessages");
    return saved ? JSON.parse(saved) : [];
  });
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploaded, setUploaded] = useState(
    localStorage.getItem("pdfUploaded") === "true"
  );
  const chatEndRef = useRef(null);

  // Scroll to bottom on new message
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Save chat history
  useEffect(() => {
    localStorage.setItem("chatMessages", JSON.stringify(messages));
  }, [messages]);

  // Save PDF upload state
  useEffect(() => {
    localStorage.setItem("pdfUploaded", uploaded ? "true" : "false");
  }, [uploaded]);

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
      localStorage.setItem("uploadedFileName", pdfFile.name);
      setFileName(pdfFile.name);
    } catch (err) {
      console.error(err);
      alert("Error uploading PDF. Check backend connection.");
    } finally {
      setLoading(false);
    }
  };

  // Handle question ask
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

  // New chat reset
  const handleNewChat = () => {
    if (window.confirm("Start a new chat? This will clear previous messages.")) {
      setMessages([]);
      localStorage.removeItem("uploadedFileName");
      localStorage.removeItem("pdfUploaded");
      setUploaded(false);
    }
  };

  // Message bubble with Markdown
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
                  <code className="bg-gray-300 text-sm px-1 rounded">
                    {children}
                  </code>
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
              Chatting about:{" "}
              <span className="text-gray-400">
                {fileName || localStorage.getItem("uploadedFileName")}
              </span>
            </h2>

            <div className="flex gap-2">
              <button
                onClick={handleNewChat}
                className="bg-black text-white px-3 py-1 rounded hover:bg-black-600"
              >
                New Chat
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto rounded-lg p-4 space-y-3 bg-white shadow-inner">
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
                loading ? "bg-gray-400" : "bg-black hover:bg-gray-700"
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
