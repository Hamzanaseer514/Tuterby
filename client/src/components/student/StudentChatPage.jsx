import React, { useEffect, useState } from "react";
import { BASE_URL } from '@/config';

const StudentChatting = () => {
  const [tutors, setTutors] = useState([]);
  const [selectedTutor, setSelectedTutor] = useState(null);
  const [chatHistory, setChatHistory] = useState([]);
  const [messageText, setMessageText] = useState("");

  useEffect(() => {
    fetchAcceptedTutors();
  }, []);

  // Fetch tutors who accepted this student
  const fetchAcceptedTutors = async () => {
    try {
      const res = await fetch(`${BASE_URL}/api/auth/get-accepted-tutors`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
      });
      const data = await res.json();
      if (data.success) {
        setTutors(data.data);
      }
    } catch (error) {
      console.error(error);
    }
  };

  // Fetch messages with selected tutor
  const fetchChatHistory = async (tutorId) => {
    try {
      const res = await fetch(`${BASE_URL}/api/auth/getstudentchat/${tutorId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
      });
      const data = await res.json();
      if (data.success) {
        setChatHistory(data.data);
        setSelectedTutor(tutors.find((t) => t.tutorId === tutorId));
      }
    } catch (error) {
      console.error(error);
    }
  };

  // Send message
  const sendMessage = async () => {
    if (!messageText.trim() || !selectedTutor) return;
    try {
      const res = await fetch(`${BASE_URL}/api/auth/send-message`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
        body: JSON.stringify({
          tutorId: selectedTutor.tutorId,
          message: messageText,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setChatHistory((prev) => [...prev, data.data]); // append new message
        setMessageText("");
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Tutors List */}
      <div className="w-1/4 bg-white shadow-lg p-4 overflow-y-auto border-r border-gray-200">
        <h2 className="text-xl font-bold mb-4 text-blue-600">Tutors</h2>
        {tutors.length > 0 ? (
          tutors.map((tutor) => (
            <div
              key={tutor.tutorId}
              onClick={() => fetchChatHistory(tutor.tutorId)}
              className={`p-3 mb-3 rounded-lg cursor-pointer transition-transform transform hover:scale-[1.02] shadow-sm hover:shadow-md ${
                selectedTutor?.tutorId === tutor.tutorId
                  ? "bg-blue-200 shadow-md"
                  : "bg-white"
              }`}
            >
              <p className="font-semibold text-gray-800">{tutor.full_name}</p>
              <p className="text-gray-500 text-sm truncate">
                {tutor.email}
              </p>
            </div>
          ))
        ) : (
          <p className="text-gray-500">No tutors found</p>
        )}
      </div>

      {/* Chat Window */}
      <div className="w-3/4 flex flex-col">
        {selectedTutor ? (
          <>
            {/* Header */}
            <div className="flex items-center gap-3 bg-white shadow p-4 border-b border-gray-200">
              <div className="w-10 h-10 rounded-full bg-blue-300 flex items-center justify-center text-white font-bold">
                {selectedTutor.full_name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800">
                  {selectedTutor.full_name}
                </h3>
                <p className="text-sm text-gray-500">Online</p>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 bg-gradient-to-b from-blue-50 to-white">
              {chatHistory.map((msg) => (
                <div key={msg._id} className="mb-4">
                  {/* Student's own message RIGHT */}
                  <div className="flex justify-end">
                    <div className="bg-green-500 text-white shadow p-3 rounded-xl max-w-xs">
                      <p className="text-sm">{msg.message}</p>
                    </div>
                  </div>

                  {/* Tutor's reply LEFT */}
                  {msg.response && (
                    <div className="flex justify-start mt-2">
                      <div className="bg-white shadow p-3 rounded-xl max-w-xs border border-gray-200 text-gray-800">
                        <p className="text-sm">{msg.response}</p>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Send box */}
            <div className="p-3 border-t border-gray-300 bg-white flex">
              <input
                type="text"
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring focus:ring-blue-300"
              />
              <button
                onClick={sendMessage}
                className="ml-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition"
              >
                Send
              </button>
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center flex-1 text-gray-400">
            Select a tutor to view chat
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentChatting;
