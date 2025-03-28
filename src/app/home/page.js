"use client";
import { signOut, useSession } from "next-auth/react";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { BoldIcon, ItalicIcon, UnderlineIcon } from "@heroicons/react/24/outline";

export default function Header() {
  const { data: session } = useSession();
  const router = useRouter();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const [showEditor, setShowEditor] = useState(false);
  const [text, setText] = useState("");
  const [fontSize, setFontSize] = useState("16px");
  const [textColor, setTextColor] = useState("#000000");
  const [isDarkMode, setIsDarkMode] = useState(false);
  const editorRef = useRef(null);

  const username = session?.userData?.name || session?.user?.name || "User";

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    await signOut({ redirect: false });
    router.replace("/");
  };

  const handleCreateSnippet = () => {
    setShowEditor(true);
  };

  const handleCancel = () => {
    setShowEditor(false);
    setText("");
    setFontSize("16px");
    setTextColor("#000000");
    setIsDarkMode(false);
  };

  const handleSaveDraft = async () => {
    if (!text.trim()) {
      alert("Draft cannot be empty");
      return;
    }
    try {
      const response = await fetch("/api/drafts/save", {
        method: "POST",
        body: JSON.stringify({ draft: text }),
        headers: { "Content-Type": "application/json" },
      });
      const data = await response.json();
      if (response.ok) {
        alert("Draft saved successfully!");
        setShowEditor(false);
        setText("");
        setFontSize("16px");
        setTextColor("#000000");
        setIsDarkMode(false);
      } else {
        alert(data.error || "Failed to save draft");
      }
    } catch (error) {
      console.error("Error saving draft:", error);
      alert("Error saving draft");
    }
  };

  const handleSaveToGoogleDrive = async () => {
    if (!text.trim()) {
      alert("Text cannot be empty");
      return;
    }
    try {
      const response = await fetch("/api/drive/save", {
        method: "POST",
        body: JSON.stringify({
          content: text,
          title: `Snippet - ${new Date().toISOString()}`,
        }),
        headers: { "Content-Type": "application/json" },
      });
      const data = await response.json();
      if (response.ok) {
        alert("Saved to Google Drive successfully!");
        setShowEditor(false);
        setText("");
        setFontSize("16px");
        setTextColor("#000000");
        setIsDarkMode(false);
      } else {
        alert(data.error || "Failed to save to Google Drive");
      }
    } catch (error) {
      console.error("Error saving to Google Drive:", error);
      alert("Error saving to Google Drive");
    }
  };

  const handleViewDrafts = () => {
    router.push("/view-drafts");
  };

  const formatText = (command) => {
    document.execCommand(command, false, null);
    editorRef.current.focus();
    setText(editorRef.current.textContent);
  };

  const handleFontSizeChange = (e) => {
    setFontSize(e.target.value);
    document.execCommand("fontSize", false, e.target.value.replace("px", ""));
    editorRef.current.focus();
    setText(editorRef.current.textContent);
  };

  const handleTextColorChange = (e) => {
    setTextColor(e.target.value);
    document.execCommand("foreColor", false, e.target.value);
    editorRef.current.focus();
    setText(editorRef.current.textContent);
  };

  return (
    <>
      {/* Header */}
      <header className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 shadow-xl fixed top-0 z-50">
        <div className="container mx-auto flex justify-between items-center py-4 px-4 sm:px-6 lg:px-8">
          <motion.h1
            className="text-2xl sm:text-3xl font-extrabold text-white cursor-pointer tracking-wide"
            onClick={() => router.push("/")}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            WarrantyMe
          </motion.h1>
          <div className="flex items-center gap-4 sm:gap-6">
            {session ? (
              <>
                <motion.button
                  onClick={handleCreateSnippet}
                  className="px-4 sm:px-6 py-2 bg-orange-500 text-white rounded-full shadow-md hover:bg-orange-600 transform hover:scale-105 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-orange-400"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.1 }}
                >
                  Create Snippet
                </motion.button>
                <div className="relative" ref={dropdownRef}>
                  <motion.img
                    src={session?.user?.image}
                    alt="Profile"
                    className="w-10 h-10 sm:w-12 sm:h-12 rounded-full cursor-pointer border-2 border-white shadow-md"
                    onClick={() => setDropdownOpen((prev) => !prev)}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                  />
                  {dropdownOpen && (
                    <motion.div
                      className="absolute right-0 mt-3 w-56 bg-white border border-gray-200 rounded-xl shadow-2xl overflow-hidden"
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.3 }}
                    >
                      <button
                        onClick={handleViewDrafts}
                        className="block w-full text-left px-5 py-3 text-gray-800 hover:bg-indigo-50 hover:text-indigo-600 transition-colors duration-150"
                      >
                        View Drafts
                      </button>
                      <button
                        onClick={handleSignOut}
                        className="block w-full text-left px-5 py-3 text-red-500 hover:bg-red-50 hover:text-red-600 transition-colors duration-150"
                      >
                        Sign Out
                      </button>
                    </motion.div>
                  )}
                </div>
              </>
            ) : (
              <motion.button
                onClick={() => router.push("/login")}
                className="px-4 sm:px-6 py-2 bg-blue-500 text-white rounded-full shadow-md hover:bg-blue-600 transform hover:scale-105 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
              >
                Login
              </motion.button>
            )}
          </div>
        </div>
      </header>

      {/* Editor Section */}
      {showEditor ? (
        <motion.div
          className="pt-24 pb-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 min-h-screen flex items-center justify-center"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          transition={{ duration: 0.5 }}
        >
          <div className="max-w-4xl w-full bg-white shadow-2xl rounded-2xl p-6 sm:p-8 border border-gray-200">
            {/* Toolbar */}
            <div className="mb-6 bg-gradient-to-r from-gray-100 to-gray-200 p-4 rounded-xl shadow-md flex flex-wrap items-center gap-4 sm:gap-6 justify-between">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => formatText("bold")}
                  className="p-2 text-gray-700 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  title="Bold"
                >
                  <BoldIcon className="w-6 h-6" />
                </button>
                <button
                  onClick={() => formatText("italic")}
                  className="p-2 text-gray-700 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  title="Italic"
                >
                  <ItalicIcon className="w-6 h-6" />
                </button>
                <button
                  onClick={() => formatText("underline")}
                  className="p-2 text-gray-700 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  title="Underline"
                >
                  <UnderlineIcon className="w-6 h-6" />
                </button>
              </div>
              <div className="flex items-center gap-4">
                <label className="text-gray-700 font-medium">Font Size:</label>
                <select
                  value={fontSize}
                  onChange={handleFontSizeChange}
                  className="px-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
                >
                  <option value="12px">12px</option>
                  <option value="16px">16px</option>
                  <option value="20px">20px</option>
                  <option value="24px">24px</option>
                  <option value="32px">32px</option>
                </select>
              </div>
              <div className="flex items-center gap-4">
                <label className="text-gray-700 font-medium">Text Color:</label>
                <input
                  type="color"
                  value={textColor}
                  onChange={handleTextColorChange}
                  className="w-10 h-10 rounded-full cursor-pointer border-2 border-gray-300 hover:border-indigo-500 transition-all duration-200"
                />
              </div>
              <div className="flex items-center gap-4">
                <label className="text-gray-700 font-medium">Theme:</label>
                <button
                  onClick={() => setIsDarkMode(!isDarkMode)}
                  className={`relative w-16 h-8 rounded-full p-1 transition-all duration-300 ${
                    isDarkMode ? "bg-indigo-600" : "bg-gray-300"
                  }`}
                >
                  <span
                    className={`absolute top-1 w-6 h-6 rounded-full bg-white shadow-md transform transition-transform duration-300 ${
                      isDarkMode ? "translate-x-8" : "translate-x-0"
                    }`}
                  />
                  <span className="sr-only">{isDarkMode ? "Dark" : "Light"}</span>
                </button>
              </div>
            </div>

            {/* Editor */}
            <div
              ref={editorRef}
              contentEditable
              className={`w-full h-64 sm:h-80 p-6 rounded-xl shadow-inner border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors duration-200 overflow-y-auto ${
                isDarkMode
                  ? "bg-gray-900 text-white placeholder-gray-400"
                  : "bg-white text-gray-900 placeholder-gray-500"
              }`}
              style={{ direction: "ltr" }}
              onInput={(e) => setText(e.currentTarget.textContent)}
              placeholder="Write your draft here..."
            />

            {/* Buttons */}
            <div className="mt-6 flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 justify-end">
              <button
                onClick={handleSaveDraft}
                className="bg-gradient-to-r from-green-400 to-green-600 text-white px-6 py-2 rounded-full shadow-md hover:from-green-500 hover:to-green-700 transform hover:scale-105 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                Save Draft
              </button>
              <button
                onClick={handleSaveToGoogleDrive}
                className="bg-gradient-to-r from-blue-400 to-blue-600 text-white px-6 py-2 rounded-full shadow-md hover:from-blue-500 hover:to-blue-700 transform hover:scale-105 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Save to Google Drive
              </button>
              <button
                onClick={handleCancel}
                className="bg-gradient-to-r from-red-400 to-red-600 text-white px-6 py-2 rounded-full shadow-md hover:from-red-500 hover:to-red-700 transform hover:scale-105 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                Cancel
              </button>
            </div>
          </div>
        </motion.div>
      ) : (
        <motion.div
          className="pt-20 pb-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-50 to-blue-100 min-h-screen flex items-center justify-center"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="text-center p-6 sm:p-8 bg-white shadow-2xl rounded-3xl max-w-lg w-full transform transition-all hover:scale-[1.02] duration-300">
            <motion.h1
              className="text-3xl sm:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              Hello, {username}!
            </motion.h1>
            <motion.p
              className="text-gray-600 mt-4 text-lg sm:text-xl"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              Welcome back! Create a snippet and save it to Google Drive or as a draft.
            </motion.p>
            <motion.button
              onClick={handleCreateSnippet}
              className="mt-6 px-6 sm:px-8 py-3 bg-gradient-to-r from-purple-500 to-purple-700 text-white rounded-full shadow-lg hover:from-purple-600 hover:to-purple-800 transform hover:scale-105 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              Create Snippet
            </motion.button>
          </div>
        </motion.div>
      )}
    </>
  );
}