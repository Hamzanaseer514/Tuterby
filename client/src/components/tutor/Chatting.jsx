import React, { useEffect, useState, useRef } from "react";
import { BASE_URL } from "@/config";
import { useAuth } from "@/hooks/useAuth";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  MessageSquare,
  Send,
  Users,
  Clock,
  CheckCircle,
  CheckCheck,
  User,
  X,
  Reply,
  Mail,
  Phone
} from 'lucide-react';

const Chatting = () => {
  const { getAuthToken, fetchWithAuth } = useAuth();
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [selectedStudentName, setSelectedStudentName] = useState("");
  const [selectedStudentPhoto, setSelectedStudentPhoto] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const [responseText, setResponseText] = useState("");
  const [selectedMessageId, setSelectedMessageId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [showStudents, setShowStudents] = useState(false);

  const token = getAuthToken();
  const pollRef = useRef(null);
  const lastMsgTimeRef = useRef({});
  const messagesEndRef = useRef(null);
  const prevStudentsRef = useRef(null);

  useEffect(() => {
    fetchAllMessages();
    // background polls silent and less frequent to avoid visible loader
    const interval = setInterval(() => fetchAllMessages(true), 60000);
    return () => clearInterval(interval);
  }, []);

  const fetchAllMessages = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      const res = await fetchWithAuth(
        `${BASE_URL}/api/tutor/getallmessages`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        },
        token,
        (newToken) => localStorage.setItem("authToken", newToken)
      );
      const data = await res.json();

      if (data.success) {
        const studentMap = new Map();

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
              hasUnansweredMessages: false,
              lastMessage: msg // Store last message for preview
            });
          }

          const student = studentMap.get(studentId);
          
          if (new Date(msg.createdAt) > new Date(student.latestMessageTime)) {
            student.latestMessage = msg.message;
            student.latestMessageTime = msg.createdAt;
            student.lastMessage = msg;
          }

          if (msg.status === 'unanswered' && !msg.response) {
            student.unansweredCount++;
            student.hasUnansweredMessages = true;
          }
        });

        const uniqueStudents = Array.from(studentMap.values()).sort((a, b) => 
          new Date(b.latestMessageTime) - new Date(a.latestMessageTime)
        );

        // compact snapshot to detect meaningful changes and avoid unnecessary setState
        const snapshot = uniqueStudents.map(s => `${s.studentId}:${s.lastMessage?._id || ''}:${s.unansweredCount}`).join('|');
        if (prevStudentsRef.current !== snapshot) {
          setStudents(uniqueStudents);
          prevStudentsRef.current = snapshot;
        }
      }
    } catch (error) {
      // console.error(error);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  const fetchChatHistory = async (studentId, studentName, studentPhoto, silent = false) => {
    try {
      const res = await fetchWithAuth(
        `${BASE_URL}/api/tutor/getallmessages/${studentId}`,
        { method: "GET", headers: { "Content-Type": "application/json" } },
        token,
        (newToken) => localStorage.setItem("authToken", newToken)
      );
      const data = await res.json();

      if (data.success) {
        const msgs = data.data || [];

        if (silent) {
          const lastKnown = lastMsgTimeRef.current[studentId] || 0;
          const newMsgs = msgs.filter(m => {
            const t = new Date(m.updatedAt || m.createdAt).getTime();
            return t > lastKnown;
          });
          if (newMsgs.length > 0) {
            setChatHistory(prev => [...prev, ...newMsgs]);
            setStudents(prevStudents => 
              prevStudents.map(student => 
                student.studentId === studentId
                  ? { ...student, hasUnansweredMessages: false, unansweredCount: 0 }
                  : student
              )
            );
            lastMsgTimeRef.current[studentId] = Math.max(...newMsgs.map(m => new Date(m.updatedAt || m.createdAt).getTime()));
          }
          return;
        }

        setChatHistory(msgs);
        setSelectedStudent(studentId);
        setSelectedStudentName(studentName);
        setSelectedStudentPhoto(studentPhoto || "");
        setSelectedMessageId(null);
        setResponseText("");

        setStudents(prevStudents => 
          prevStudents.map(student => 
            student.studentId === studentId 
              ? { ...student, hasUnansweredMessages: false, unansweredCount: 0 }
              : student
          )
        );

        if (msgs.length > 0) {
          lastMsgTimeRef.current[studentId] = Math.max(...msgs.map(m => new Date(m.updatedAt || m.createdAt).getTime()));
        } else {
          lastMsgTimeRef.current[studentId] = 0;
        }

        startPollingForStudent(studentId);
      }
    } catch (error) {
      // console.error(error);
    }
  };

  const startPollingForStudent = (studentId) => {
    stopPolling();
    pollRef.current = setInterval(() => fetchChatHistory(studentId, null, null, true), 3000);
  };

  const stopPolling = () => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  };

  const sendResponse = async () => {
    if (!responseText.trim()) return;
    try {
      setSending(true);
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
        // Optimistically update the students sidebar so the reply appears immediately
        setStudents(prevStudents => prevStudents.map(s => {
          if (s.studentId === selectedStudent) {
            const updatedLastMessage = s.lastMessage
              ? { ...s.lastMessage, response: responseText, updatedAt: new Date().toISOString(), status: 'answered' }
              : { _id: selectedMessageId, response: responseText, updatedAt: new Date().toISOString(), message: responseText };

            return {
              ...s,
              lastMessage: updatedLastMessage,
              latestMessage: responseText,
              latestMessageTime: updatedLastMessage.updatedAt,
              unansweredCount: 0,
              hasUnansweredMessages: false
            };
          }
          return s;
        }));

        // still refresh in background to ensure server-consistent state
        fetchAllMessages(true);
        lastMsgTimeRef.current[selectedStudent] = Math.max(
          lastMsgTimeRef.current[selectedStudent] || 0,
          Date.now()
        );
      }
    } catch (error) {
      // console.error(error);
    } finally {
      setSending(false);
    }
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
      });
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  };

  const getLastMessagePreview = (student) => {
    if (!student.lastMessage) return "No messages yet";
    return student.lastMessage.message.substring(0, 25) + 
           (student.lastMessage.message.length > 25 ? '...' : '');
  };

  useEffect(() => {
    return () => stopPolling();
  }, []);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  }, [chatHistory]);

  return (
    <div className="flex flex-col lg:flex-row h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      {/* Students List Sidebar (desktop) */}
      <Card className="hidden lg:block w-full lg:w-[35%] xl:w-[25%]  flex-shrink-0 m-4 lg:m-0 lg:rounded-none shadow-lg lg:shadow-xl h-full overflow-hidden">
        <CardContent className="p-4  h-full flex flex-col">
          {/* Header */}
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-200">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800">Your Students</h2>
              <p className="text-sm text-gray-500">{students.length} connected</p>
            </div>
          </div>

          {/* Students List */}
          <div className="flex-1 overflow-y-auto space-y-3">
            {loading ? (
              <div className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : students.length > 0 ? (
              students.map((student) => (
                <div
                  key={student.studentId}
                  onClick={() => fetchChatHistory(student.studentId, student.name, student.photo_url)}
                  className={`p-4 rounded-xl cursor-pointer transition-all duration-200 border-2 ${
                    selectedStudent === student.studentId
                      ? "border-blue-500 bg-blue-50 shadow-md"
                      : "border-transparent bg-white hover:border-blue-200 hover:shadow-md"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {/* Avatar */}
                    <div className="relative flex-shrink-0">
                      <Avatar className="w-8 h-8 border-2 border-white shadow-sm">
                        {student.photo_url ? (
                          <img 
                            src={student.photo_url} 
                            alt={student.name} 
                            className="h-full w-full object-cover" 
                          />
                        ) : (
                          <div className="h-full w-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold">
                            <User className="h-5 w-5" />
                          </div>
                        )}
                      </Avatar>
                      {/* Online Indicator */}
                      <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                    </div>

                    {/* Student Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-gray-800 text-sm truncate">
                          {student.name}
                        </h3>
                        {student.hasUnansweredMessages && (
                          <Badge variant="destructive" className="px-1.5 py-0 text-xs">
                            {student.unansweredCount > 9 ? '9+' : student.unansweredCount}
                          </Badge>
                        )}
                      </div>
                      
                      <p className="text-xs text-gray-600 mb-1">
                        {getLastMessagePreview(student)}
                      </p>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-400">
                          {student.lastMessage ? formatTime(student.lastMessage.createdAt) : ''}
                        </span>
                        {student.hasUnansweredMessages && (
                          <Badge variant="secondary" className="text-[9px] bg-orange-100 text-orange-800">
                            Needs reply
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 text-sm">No students yet</p>
                <p className="text-gray-400 text-xs mt-1">Student messages will appear here</p>
              </div>
            )}
          </div>

          {/* Sidebar Footer Text */}
          <div className="mt-6 pt-4 border-t border-gray-200">
            <p className="text-xs text-gray-500 text-center">
              💡 <strong>Quick Tips:</strong> Click on a student to view messages and reply to their questions.
            </p>
          </div>
        </CardContent>
      </Card>

        {/* Mobile inline students list (visible by default on small screens) */}
        <div className="lg:hidden p-4 bg-white border-b">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Your Students</h3>
                <p className="text-xs text-gray-500">{students.length} connected</p>
              </div>
            </div>
          </div>
          <div className="space-y-3">
            {loading ? (
              <div className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : students.length > 0 ? (
              students.map((student) => (
                <div
                  key={student.studentId}
                  onClick={() => { fetchChatHistory(student.studentId, student.name, student.photo_url); }}
                  className={`p-3 rounded-lg cursor-pointer transition-all duration-150 border ${
                    selectedStudent === student.studentId ? 'border-blue-300 bg-blue-50' : 'border-transparent bg-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="w-10 h-10">
                      {student.photo_url ? (
                        <img src={student.photo_url} alt={student.name} className="h-full w-full object-cover" />
                      ) : (
                        <div className="h-full w-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold">
                          <User className="h-5 w-5" />
                        </div>
                      )}
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="font-medium text-sm truncate">{student.name}</p>
                        {student.hasUnansweredMessages && <Badge variant="destructive" className="text-xs">!</Badge>}
                      </div>
                      <p className="text-xs text-gray-500 truncate">{getLastMessagePreview(student)}</p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-6 text-gray-500">
                <MessageSquare className="h-10 w-10 mx-auto mb-2 text-gray-300" />
                <div>No students yet</div>
              </div>
            )}
          </div>
        </div>

      {/* Chat Window */}
      <div className="flex-1 flex flex-col m-4 lg:m-0 lg:rounded-none h-full overflow-hidden">
        {selectedStudent ? (
          <Card className="flex-1 flex flex-col shadow-lg lg:shadow-xl h-full">
            {/* Chat Header */}
            <div className="p-4 lg:p-6 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                <div className="flex items-center gap-4">
                  {/* On small screens show a Close list button when chat is open */}
                  {selectedStudent && (
                    <button
                      onClick={() => setSelectedStudent(null)}
                      className="lg:hidden mr-2 p-2 rounded-md bg-white/10 hover:bg-white/20"
                      aria-label="Close chat"
                    >
                      <X className="h-5 w-5 text-white" />
                    </button>
                  )}
                <Avatar className="w-12 h-12 border-2 border-white shadow-lg">
                  {selectedStudentPhoto ? (
                    <img 
                      src={selectedStudentPhoto} 
                      alt={selectedStudentName} 
                      className="h-full w-full object-cover" 
                    />
                  ) : (
                    <div className="h-full w-full bg-white/20 flex items-center justify-center text-white font-bold">
                      <User className="h-6 w-6" />
                    </div>
                  )}
                </Avatar>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold">{selectedStudentName}</h3>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <p className="text-sm text-blue-100">Online • Active now</p>
                  </div>
                </div>
                <div className="hidden sm:flex items-center gap-2 text-blue-100">
                  <Clock className="h-4 w-4" />
                  <span className="text-sm">{new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 lg:p-6 bg-gradient-to-b from-white to-gray-50/50">
              {chatHistory.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-gray-400">
                  <MessageSquare className="h-16 w-16 mb-4 text-gray-300" />
                  <p className="text-lg font-medium text-gray-500">No messages yet</p>
                  <p className="text-sm text-gray-400 mt-1">Start a conversation with {selectedStudentName}</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {chatHistory.map((msg) => (
                    <div key={msg._id} className="space-y-3">
                      {/* Student Message */}
                      <div className="flex justify-start">
                        <div className="flex flex-col max-w-[70%] break-words whitespace-pre-wrap">
                          <div className="bg-white border border-gray-200 p-3 lg:p-4 rounded-2xl rounded-bl-none shadow-lg break-words whitespace-pre-wrap">
                            <p className="text-sm lg:text-base text-gray-800">{msg.message}</p>
                          </div>
                          <div className="flex justify-start items-center gap-1 mt-1">
                            <span className="text-xs text-gray-500">
                              {formatTime(msg.createdAt)}
                            </span>
                            <CheckCircle className="h-3 w-3 text-green-500" />
                          </div>
                        </div>
                      </div>

                      {/* Tutor Response or Reply Button */}
                      {msg.response ? (
                        <div className="flex justify-end">
                          <div className="flex flex-col max-w-[70%] break-words whitespace-pre-wrap">
                            <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-3 lg:p-4 rounded-2xl rounded-br-none shadow-lg break-words whitespace-pre-wrap">
                              <p className="text-sm lg:text-base">{msg.response}</p>
                            </div>
                            <div className="flex justify-end items-center gap-1 mt-1">
                              <span className="text-xs text-gray-500">
                                {formatTime(msg.updatedAt)}
                              </span>
                              <CheckCheck className="h-3 w-3 text-blue-500" />
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="flex justify-end">
                          <Button
                            onClick={() => setSelectedMessageId(msg._id)}
                            variant="outline"
                            size="sm"
                            className="rounded-full bg-orange-50 text-orange-600 border-orange-200 hover:bg-orange-100"
                          >
                            <Reply className="h-4 w-4 mr-2" />
                            Reply to Student
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>

            {/* Response Input */}
            {selectedMessageId && (
              <div className="p-4 lg:p-6 border-t border-gray-200 bg-white">
                <div className="flex gap-3 mb-3">
                  <div className="flex-1 relative">
                    <Input
                      type="text"
                      value={responseText}
                      onChange={(e) => setResponseText(e.target.value)}
                      placeholder={`Reply to ${selectedStudentName}...`}
                      className="pr-12 py-3 lg:py-4 text-base rounded-2xl border-2 border-orange-200 focus:border-orange-500 focus:ring-0 transition-colors"
                      disabled={sending}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          sendResponse();
                        }
                      }}
                    />
                    {responseText && (
                      <button
                        onClick={() => setResponseText('')}
                        className="absolute right-12 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        ×
                      </button>
                    )}
                  </div>
                  <Button
                    onClick={sendResponse}
                    disabled={!responseText.trim() || sending}
                    className="px-6 lg:px-8 rounded-2xl bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                    size="lg"
                  >
                    {sending ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    ) : (
                      <Send className="h-5 w-5" />
                    )}
                  </Button>
                </div>
                <p className="text-xs text-gray-400 text-center">
                  Press Enter to send • Click outside to cancel reply
                </p>
              </div>
            )}

            {/* No Message Selected State */}
            {!selectedMessageId && chatHistory.length > 0 && (
              <div className="p-4 border-t border-gray-200 bg-gray-50">
                <p className="text-sm text-gray-500 text-center">
                  💬 Click "Reply" on any student message to respond
                </p>
              </div>
            )}
          </Card>
        ) : (
          <Card className="flex-1 flex items-center justify-center bg-gradient-to-br from-white to-blue-50/50">
            <CardContent className="text-center p-8">
              <div className="max-w-md mx-auto">
                <MessageSquare className="h-20 w-20 text-gray-300 mx-auto mb-6" />
                <h3 className="text-2xl font-bold text-gray-600 mb-3">Welcome to Tutor Chat</h3>
                <p className="text-gray-500 mb-6">
                  Select a student from the list to view their messages and provide responses. 
                  You can answer questions, provide guidance, and support their learning journey.
                </p>
                <div className="flex items-center justify-center gap-4 text-sm text-gray-400">
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    <span>{students.length} students</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Mail className="h-4 w-4" />
                    <span>{students.filter(s => s.hasUnansweredMessages).length} need replies</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Chatting;