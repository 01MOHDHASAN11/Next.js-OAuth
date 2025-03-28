"use client";
import { useEffect, useState } from "react";
import { TrashIcon, PencilIcon } from "@heroicons/react/24/outline";
import { useRouter } from "next/navigation";

export default function ViewDrafts() {
  const [drafts, setDrafts] = useState([]);
  const [editingDraft, setEditingDraft] = useState(null);
  const [editedText, setEditedText] = useState("");
  const [savedDraftIds, setSavedDraftIds] = useState({}); 
  const router = useRouter();

  useEffect(() => {
    const fetchDrafts = async () => {
      try {
        const response = await fetch("/api/drafts/get");
        if (!response.ok) throw new Error("Failed to fetch drafts");
        const data = await response.json();
        const validDrafts = Array.isArray(data.drafts)
          ? data.drafts.filter(
              (draft) => draft?.draft && typeof draft.draft === "string" && draft.draft.trim() !== ""
            )
          : [];
        setDrafts(validDrafts);
      } catch (error) {
        console.error("Error fetching drafts:", error);
        alert(`Error fetching drafts: ${error.message}`);
        setDrafts([]);
      }
    };
    fetchDrafts();
  }, []);

  const handleDelete = async (draftToDelete) => {
    if (!confirm("Are you sure you want to delete this draft?")) return;
    try {
      const response = await fetch("/api/drafts/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ draft: draftToDelete }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to delete draft");
      setDrafts((prevDrafts) =>
        prevDrafts.filter((draft) => draft.draft !== draftToDelete)
      );
      setSavedDraftIds((prev) => {
        const updated = { ...prev };
        delete updated[draftToDelete];
        return updated;
      });
    } catch (error) {
      console.error("Error deleting draft:", error);
      alert(`Error deleting draft: ${error.message}`);
    }
  };

  const handleEdit = (draft) => {
    setEditingDraft(draft.draft);
    setEditedText(draft.draft);
  };

  const handleSaveEdit = async () => {
    if (!editedText.trim()) {
      alert("Draft cannot be empty");
      return;
    }
    try {
      const response = await fetch("/api/drafts/edit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ oldDraft: editingDraft, newDraft: editedText }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to save edited draft");
      setDrafts((prevDrafts) =>
        prevDrafts.map((draft) =>
          draft.draft === editingDraft ? { ...draft, draft: editedText } : draft
        )
      );
      setSavedDraftIds((prev) => {
        const updated = { ...prev };
        if (updated[editingDraft]) {
          delete updated[editingDraft];
          updated[editedText] = null; 
        }
        return updated;
      });
      setEditingDraft(null);
      setEditedText("");
    } catch (error) {
      console.error("Error saving edited draft:", error);
      alert(`Error saving edited draft: ${error.message}`);
    }
  };

  const handleCancelEdit = () => {
    setEditingDraft(null);
    setEditedText("");
  };

  const handleBack = () => {
    router.push("/home");
  };

  const handleSaveToGoogleDrive = async (draft) => {
    try {
      const response = await fetch("/api/drive/save", {
        method: "POST",
        body: JSON.stringify({
          content: draft.draft,
          title: `Draft - ${new Date(draft.createdAt).toISOString()}`,
        }),
        headers: { "Content-Type": "application/json" },
      });
      const data = await response.json();
      if (response.ok) {
        alert(
          `Saved to Google Drive successfully! View it here: https://drive.google.com/file/d/${data.fileId}/view`
        );
        setSavedDraftIds((prev) => ({
          ...prev,
          [draft.draft]: data.fileId,
        }));
      } else {
        alert(data.error || "Failed to save to Google Drive");
      }
    } catch (error) {
      console.error("Error saving to Google Drive:", error);
      alert(`Error saving to Google Drive: ${error.message}`);
    }
  };

  const handleViewInDrive = (fileId) => {
    window.open(`https://drive.google.com/file/d/${fileId}/view`, "_blank");
  };

  const truncateText = (text, wordLimit = 10) => {
    if (typeof text !== "string" || !text) {
      return "No content available";
    }
    const words = text.split(" ");
    if (words.length <= wordLimit) return text;
    return words.slice(0, wordLimit).join(" ") + "...";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl w-full bg-white shadow-2xl rounded-2xl p-6 sm:p-8 transform transition-all hover:scale-[1.01] duration-300">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
            Your Drafts
          </h1>
          <button
            onClick={handleBack}
            className="bg-gradient-to-r from-blue-500 to-blue-700 text-white px-4 sm:px-6 py-2 rounded-full shadow-md hover:from-blue-600 hover:to-blue-800 transform hover:scale-105 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 animate-fade-in"
          >
            Back
          </button>
        </div>

        {drafts.length === 0 ? (
          <p className="text-gray-600 text-xl text-center font-medium animate-fade-in">
            No drafts available yet. Start creating!
          </p>
        ) : (
          <div className="space-y-6">
            <div className="overflow-x-auto rounded-lg shadow-md">
              <table className="w-full border-collapse bg-white rounded-lg">
                <thead className="bg-gradient-to-r from-indigo-100 to-purple-100">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-800 uppercase tracking-widest border-b border-gray-200">
                      Draft
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-800 uppercase tracking-widest border-b border-gray-200">
                      Created At
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-800 uppercase tracking-widest border-b border-gray-200">
                      Actions
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-800 uppercase tracking-widest border-b border-gray-200">
                      Save
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {drafts.map((draft, index) => (
                    <tr
                      key={index}
                      className="hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 transition-all duration-200 animate-fade-in-up"
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <td className="px-6 py-4 text-gray-900 text-sm sm:text-base font-medium break-words max-w-[40%]">
                        {truncateText(draft.draft)}
                      </td>
                      <td className="px-6 py-4 text-gray-700 text-sm sm:text-base">
                        {new Date(draft.createdAt).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-sm sm:text-base">
                        <div className="flex space-x-4">
                          <button
                            onClick={() => handleEdit(draft)}
                            className="text-indigo-600 hover:text-indigo-800 transform hover:scale-110 transition-all duration-150 focus:outline-none"
                          >
                            <PencilIcon className="h-6 w-6" />
                          </button>
                          <button
                            onClick={() => handleDelete(draft.draft)}
                            className="text-red-600 hover:text-red-800 transform hover:scale-110 transition-all duration-150 focus:outline-none"
                          >
                            <TrashIcon className="h-6 w-6" />
                          </button>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm sm:text-base">
                        {savedDraftIds[draft.draft] ? (
                          <button
                            onClick={() => handleViewInDrive(savedDraftIds[draft.draft])}
                            className="bg-gradient-to-r from-green-400 to-green-600 text-white px-4 py-2 rounded-lg shadow-md hover:from-green-500 hover:to-green-700 transform hover:scale-105 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-green-500"
                          >
                            View snippet in Drive
                          </button>
                        ) : (
                          <button
                            onClick={() => handleSaveToGoogleDrive(draft)}
                            className="bg-gradient-to-r from-blue-400 to-blue-600 text-white px-4 py-2 rounded-lg shadow-md hover:from-blue-500 hover:to-blue-700 transform hover:scale-105 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            Save to Google Drive
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {editingDraft && (
              <div className="mt-6 p-6 bg-gray-50 rounded-lg shadow-inner animate-fade-in">
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                  Edit Draft
                </h2>
                <textarea
                  className="w-full h-48 p-4 text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-y"
                  value={editedText}
                  onChange={(e) => setEditedText(e.target.value)}
                  placeholder="Edit your draft here..."
                />
                <div className="mt-4 flex space-x-4 justify-end">
                  <button
                    onClick={handleSaveEdit}
                    className="bg-indigo-600 text-white px-6 py-2 rounded-lg shadow-md hover:bg-indigo-700 transform hover:scale-105 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    Save
                  </button>
                  <button
                    onClick={handleCancelEdit}
                    className="bg-gray-400 text-white px-6 py-2 rounded-lg shadow-md hover:bg-gray-500 transform hover:scale-105 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gray-400"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}