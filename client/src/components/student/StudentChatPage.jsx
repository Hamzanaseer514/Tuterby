import React, { useEffect, useState } from "react";
import { BASE_URL } from '@/config';
import { useAuth } from '../../hooks/useAuth';

const StudentChatting = () => {
  const { fetchWithAuth, user, getAuthToken } = useAuth();
  const [tutors, setTutors] = useState([]);
  const [selectedTutor, setSelectedTutor] = useState(null);
  const [chatHistory, setChatHistory] = useState([]);
  const [messageText, setMessageText] = useState("");
  const token = getAuthToken();
  
  useEffect(() => {
    fetchAcceptedTutors();
    // Set up polling to check for new messages every 30 seconds
    const interval = setInterval(fetchAcceptedTutors, 30000);
    return () => clearInterval(interval);
  }, []);

  // Fetch tutors who accepted this student with message status
  const fetchAcceptedTutors = async () => {
    try {
      const res = await fetchWithAuth(`${BASE_URL}/api/auth/get-accepted-tutors`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }, token, (newToken) => localStorage.setItem("authToken", newToken) // ✅ setToken
      );
      const data = await res.json();
      if (data.success) {
        // Fetch message status for each tutor
        const tutorsWithStatus = await Promise.all(
          data.data.map(async (tutor) => {
            try {
              const chatRes = await fetchWithAuth(`${BASE_URL}/api/auth/getstudentchat/${tutor.tutorId}`, {
                method: "GET",
                headers: {
                  "Content-Type": "application/json",
                },
              }, token, (newToken) => localStorage.setItem("authToken", newToken));
              
              const chatData = await chatRes.json();
              if (chatData.success) {
                // Count messages with responses (tutor replies)
                const messagesWithResponses = chatData.data.filter(msg => msg.response && msg.status === 'answered');
                const latestResponseTime = messagesWithResponses.length > 0 
                  ? Math.max(...messagesWithResponses.map(msg => new Date(msg.updatedAt || msg.createdAt).getTime()))
                  : 0;
                
                // Check if student has seen the latest response
                const lastSeenKey = `student_last_seen_${tutor.tutorId}`;
                const lastSeenTime = Number(localStorage.getItem(lastSeenKey) || 0);
                
                return {
                  ...tutor,
                  hasNewResponse: latestResponseTime > lastSeenTime,
                  responseCount: messagesWithResponses.length
                };
              }
            } catch (error) {
              // console.error(`Error fetching chat for tutor ${tutor.tutorId}:`, error);
            }
            
            return {
              ...tutor,
              hasNewResponse: false,
              responseCount: 0
            };
          })
        );
        
        setTutors(tutorsWithStatus);
      }
    } catch (error) {
      // console.error(error);
    }
  };

  // Fetch messages with selected tutor
  const fetchChatHistory = async (tutorId) => {
    try {
      const res = await fetchWithAuth(`${BASE_URL}/api/auth/getstudentchat/${tutorId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }, token, (newToken) => localStorage.setItem("authToken", newToken) // ✅ setToken
      );
      const data = await res.json();
      if (data.success) {
        setChatHistory(data.data);
        setSelectedTutor(tutors.find((t) => t.tutorId === tutorId));
        
        // Mark messages as seen by updating the tutor's notification status
        setTutors(prevTutors => 
          prevTutors.map(tutor => 
            tutor.tutorId === tutorId 
              ? { ...tutor, hasNewResponse: false }
              : tutor
          )
        );
        
        // Update last seen time
        const lastSeenKey = `student_last_seen_${tutorId}`;
        localStorage.setItem(lastSeenKey, String(Date.now()));
      }
    } catch (error) {
      // console.error(error);
    }
  };

  // Send message
  const sendMessage = async () => {
    if (!messageText.trim() || !selectedTutor) return;
    try {
      const res = await fetchWithAuth(`${BASE_URL}/api/auth/send-message`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          tutorId: selectedTutor.tutorId,
          message: messageText,
        }),
      }, token, (newToken) => localStorage.setItem("authToken", newToken) // ✅ setToken
      );

      const data = await res.json();
      if (data.success) {
        setChatHistory((prev) => [...prev, data.data]); // append new message
        setMessageText("");
      }
    } catch (error) {
      // console.error(error);
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
              className={`p-3 mb-3 rounded-lg cursor-pointer transition-transform transform hover:scale-[1.02] shadow-sm hover:shadow-md relative ${
                selectedTutor?.tutorId === tutor.tutorId
                  ? "bg-blue-200 shadow-md"
                  : "bg-white"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden relative flex-shrink-0">
                    {tutor.user_id?.photo_url ? (
                      <img src={tutor.user_id.photo_url} alt={tutor.full_name} className="h-full w-full object-cover" loading="lazy" />
                    ) : (
                      <div className="absolute inset-0 animate-pulse bg-gray-300 dark:bg-gray-600" />
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-sm sm:text-md md:text-lg text-gray-800">{tutor.full_name}</p>
                    {/* Red dot notification for new responses */}
                    {tutor.hasNewResponse && (
                      <div className="h-2 w-2 bg-red-500 rounded-full"></div>
                    )}
                  </div>
                  
                </div>
                {tutor.hasNewResponse && (
                  <span className="text-xs text-red-500 font-medium">
                    New
                  </span>
                )}
              </div>
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