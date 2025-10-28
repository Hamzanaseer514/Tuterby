import React, { useEffect, useState } from "react";
import { BASE_URL } from "@/config";
import { useAuth } from "@/hooks/useAuth";

const Chatting = () => {
  const { getAuthToken, fetchWithAuth } = useAuth();
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [selectedStudentName, setSelectedStudentName] = useState("");
  const [selectedStudentPhoto, setSelectedStudentPhoto] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const [responseText, setResponseText] = useState("");
  const [selectedMessageId, setSelectedMessageId] = useState(null);

  const token = getAuthToken();

  useEffect(() => {
    fetchAllMessages();
    // Set up polling to check for new messages every 30 seconds
    const interval = setInterval(fetchAllMessages, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchAllMessages = async () => {
    try {
      const res = await fetchWithAuth(
        `${BASE_URL}/api/tutor/getallmessages`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
        },
        token,
        (newToken) => localStorage.setItem("authToken", newToken)
      );
      const data = await res.json();

      if (data.success) {
        const studentMap = new Map();

        // Process all messages to group by student and count unanswered
        data.data.forEach((msg) => {
          const studentId = msg.studentId._id;
          
          if (!studentMap.has(studentId)) {
            studentMap.set(studentId, {
              studentId: studentId,
              name: msg.studentId.full_name,
              photo_url: msg.studentId.photo_url || "",
              latestMessage: msg.message,
              latestMessageTime: msg.createdAt,
              unansweredCount: 0,
              hasUnansweredMessages: false
            });
          }

          const student = studentMap.get(studentId);
          
          // Update latest message if this one is newer
          if (new Date(msg.createdAt) > new Date(student.latestMessageTime)) {
            student.latestMessage = msg.message;
            student.latestMessageTime = msg.createdAt;
          }

          // Count unanswered messages
          if (msg.status === 'unanswered' && !msg.response) {
            student.unansweredCount++;
            student.hasUnansweredMessages = true;
          }
        });

        // Convert map to array and sort by latest message time
        const uniqueStudents = Array.from(studentMap.values()).sort((a, b) => 
          new Date(b.latestMessageTime) - new Date(a.latestMessageTime)
        );

        setStudents(uniqueStudents);
      }
    } catch (error) {
      // console.error(error);
    }
  };

  // ✅ accepts studentPhoto and stores it
  const fetchChatHistory = async (studentId, studentName, studentPhoto) => {
    try {
      const res = await fetchWithAuth(
        `${BASE_URL}/api/tutor/getallmessages/${studentId}`,
        { method: "GET", headers: { "Content-Type": "application/json" } },
        token,
        (newToken) => localStorage.setItem("authToken", newToken)
      );
      const data = await res.json();

      if (data.success) {
        setChatHistory(data.data);
        setSelectedStudent(studentId);
        setSelectedStudentName(studentName);
        setSelectedStudentPhoto(studentPhoto || "");
        setSelectedMessageId(null);
        setResponseText("");
        
        // Mark messages as seen by updating the student's unanswered count
        setStudents(prevStudents => 
          prevStudents.map(student => 
            student.studentId === studentId 
              ? { ...student, hasUnansweredMessages: false, unansweredCount: 0 }
              : student
          )
        );
      }
    } catch (error) {
      // console.error(error);
    }
  };

  const sendResponse = async () => {
    if (!responseText.trim()) return;
    try {
      const res = await fetchWithAuth(
        `${BASE_URL}/api/tutor/messages/reply`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messageId: selectedMessageId,
            response: responseText,
          }),
        },
        token,
        (newToken) => localStorage.setItem("authToken", newToken)
      );

      const data = await res.json();

      if (data.success) {
        setChatHistory((prev) =>
          prev.map((msg) =>
            msg._id === selectedMessageId
              ? { ...msg, response: responseText, status: "answered" }
              : msg
          )
        );
        setResponseText("");
        setSelectedMessageId(null);
        
        // Refresh the student list to update notification counts
        fetchAllMessages();
      }
    } catch (error) {
      // console.error(error);
    }
  };

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      {/* Sidebar – only visible on large screens */}
      <div className="hidden lg:block w-64 p-4 bg-white border-r border-gray-200 overflow-y-auto">
        <h2 className="text-xl font-bold mb-4 text-blue-600">Students</h2>
        {students.length ? (
          students.map((student) => (
            <div
              key={student.studentId}
              onClick={() =>
                fetchChatHistory(
                  student.studentId,
                  student.name,
                  student.photo_url
                )
              }
              className={`p-3 mb-3 rounded-lg cursor-pointer transition hover:shadow-md relative ${
                selectedStudent === student.studentId
                  ? "bg-blue-200 shadow-md"
                  : "bg-white"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="relative">
                  {student.photo_url ? (
                    <img
                      src={`${student.photo_url}`}
                      alt={student.name}
                      className="h-8 w-8 rounded-full object-cover"
                    />
                  ) : (
                    <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-sm font-bold">
                      {student.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  {/* Red dot notification for unanswered messages */}
                  {student.hasUnansweredMessages && (
                    <div className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full flex items-center justify-center">
                      <span className="text-xs text-white font-bold">
                        {student.unansweredCount > 9 ? '9+' : student.unansweredCount}
                      </span>
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-gray-800">{student.name}</p>
                    {student.hasUnansweredMessages && (
                      <span className="text-xs text-red-500 font-medium">
                        New
                      </span>
                    )}
                  </div>
                  <p className="text-gray-500 text-sm truncate">
                    {student.latestMessage}
                  </p>
                </div>
              </div>
            </div>
          ))
        ) : (
          <p className="text-gray-500">No students found</p>
        )}
      </div>

      {/* Right Chat Window */}
      <div className="flex-1 flex flex-col w-full">
        {/* Mobile dropdown to choose student */}
        <div className="lg:hidden p-3 bg-white border-b border-gray-200">
          <select
            className="w-full border border-gray-300 rounded-lg p-2"
            onChange={(e) => {
              const s = students.find((st) => st.studentId === e.target.value);
              if (s) fetchChatHistory(s.studentId, s.name, s.photo_url);
            }}
            value={selectedStudent || ""}
          >
            <option value="">Select a student</option>
            {students.map((s) => (
              <option key={s.studentId} value={s.studentId}>
                {s.name} {s.hasUnansweredMessages ? '(New Messages)' : ''}
              </option>
            ))}
          </select>
        </div>

        {selectedStudent ? (
          <>
            {/* Chat Header */}
            <div className="flex items-center gap-3 bg-white shadow p-4 border-b border-gray-200">
              {selectedStudentPhoto ? (
                <img
                  src={`${selectedStudentPhoto}`}
                  alt={selectedStudentName}
                  className="h-10 w-10 rounded-full object-cover ring-2 ring-gray-100 flex-shrink-0"
                />
              ) : (
                <div className="h-10 w-10 rounded-full bg-blue-300 flex items-center justify-center text-white font-bold">
                  {selectedStudentName.charAt(0).toUpperCase()}
                </div>
              )}
              <div>
                <h3 className="text-lg font-semibold text-gray-800">
                  {selectedStudentName}
                </h3>
                <p className="text-sm text-gray-500">Online</p>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 bg-gradient-to-b from-blue-50 to-white">
              {chatHistory.map((msg) => (
                <div key={msg._id} className="mb-4 flex flex-col">
                  {/* Student message */}
                  <div className="flex justify-start">
                    <div className="bg-white shadow p-3 rounded-xl max-w-xs sm:max-w-md text-gray-800 border border-gray-200">
                      <p className="text-sm break-words">{msg.message}</p>
                    </div>
                  </div>

                  {/* Tutor response */}
                  {msg.response && (
                    <div className="flex justify-end mt-2">
                      <div className="bg-green-500 text-white shadow p-3 rounded-xl max-w-xs sm:max-w-md">
                        <p className="text-sm break-words">{msg.response}</p>
                      </div>
                    </div>
                  )}

                  {/* Reply option */}
                  {!msg.response && msg.status === "unanswered" && (
                    <div
                      className="text-right text-blue-500 text-sm mt-1 cursor-pointer"
                      onClick={() => setSelectedMessageId(msg._id)}
                    >
                      Reply
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Response Box */}
            {selectedMessageId && (
              <div className="p-3 border-t border-gray-300 bg-white flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  value={responseText}
                  onChange={(e) => setResponseText(e.target.value)}
                  placeholder="Type your response..."
                  className="flex-1 border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring focus:ring-blue-300"
                />
                <button
                  onClick={sendResponse}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition"
                >
                  Send
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="flex items-center justify-center flex-1 text-gray-400 text-center p-4">
            Select a student to view chat
          </div>
        )}
      </div>
    </div>
  );
};

export default Chatting;