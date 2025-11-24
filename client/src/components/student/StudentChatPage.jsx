import React, { useEffect, useState, useRef } from "react";
import { BASE_URL } from '@/config';
import { useAuth } from '../../hooks/useAuth';
import { Avatar } from '../ui/avatar';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import {
  MessageSquare,
  Send,
  Users,
  Clock,
  CheckCircle,
  CheckCheck,
  User,
  X
} from 'lucide-react';

const StudentChatting = () => {
  const { fetchWithAuth, user, getAuthToken } = useAuth();
  const [tutors, setTutors] = useState([]);
  const [selectedTutor, setSelectedTutor] = useState(null);
  const [chatHistory, setChatHistory] = useState([]);
  const [messageText, setMessageText] = useState("");
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const token = getAuthToken();
  const pollRef = useRef(null);
  const lastMsgTimeRef = useRef({});
  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetchAcceptedTutors();
    const interval = setInterval(() => fetchAcceptedTutors(true), 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchAcceptedTutors = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      const res = await fetchWithAuth(`${BASE_URL}/api/auth/get-accepted-tutors`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }, token, (newToken) => localStorage.setItem("authToken", newToken)
      );
      const data = await res.json();
      if (data.success) {
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
                const messagesWithResponses = chatData.data.filter(msg => msg.response && msg.status === 'answered');
                const latestResponseTime = messagesWithResponses.length > 0
                  ? Math.max(...messagesWithResponses.map(msg => new Date(msg.updatedAt || msg.createdAt).getTime()))
                  : 0;

                const lastSeenKey = `student_last_seen_${tutor.tutorId}`;
                const lastSeenTime = Number(localStorage.getItem(lastSeenKey) || 0);

                return {
                  ...tutor,
                  hasNewResponse: latestResponseTime > lastSeenTime,
                  responseCount: messagesWithResponses.length,
                  lastMessage: chatData.data[chatData.data.length - 1] // Get last message for preview
                };
              }
            } catch (error) {
              // console.error(`Error fetching chat for tutor ${tutor.tutorId}:`, error);
            }

            return {
              ...tutor,
              hasNewResponse: false,
              responseCount: 0,
              lastMessage: null
            };
          })
        );

        setTutors(tutorsWithStatus);
      }
    } catch (error) {
      // console.error(error);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  const fetchChatHistory = async (tutorId, silent = false) => {
    try {
      const res = await fetchWithAuth(`${BASE_URL}/api/auth/getstudentchat/${tutorId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }, token, (newToken) => localStorage.setItem("authToken", newToken)
      );
      const data = await res.json();
      if (data.success) {
        const msgs = data.data || [];

        if (silent) {
          const lastKnown = lastMsgTimeRef.current[tutorId] || 0;
          const newMsgs = msgs.filter(m => {
            const t = new Date(m.updatedAt || m.createdAt).getTime();
            return t > lastKnown;
          });
          if (newMsgs.length > 0) {
            setChatHistory(prev => {
              const existingIds = new Set(prev.map(p => p._id));
              const newMap = new Map(newMsgs.map(m => [m._id, m]));
              const updated = prev.map(p => newMap.has(p._id) ? { ...p, ...newMap.get(p._id) } : p);
              const uniqueNew = newMsgs.filter(m => !existingIds.has(m._id));
              if (uniqueNew.length === 0 && updated.every((v, i) => v === prev[i])) return prev;
              return [...updated, ...uniqueNew];
            });
            setTutors(prevTutors => prevTutors.map(t => t.tutorId === tutorId ? { ...t, hasNewResponse: false } : t));
            const lastSeenKey = `student_last_seen_${tutorId}`;
            localStorage.setItem(lastSeenKey, String(Date.now()));
            const maxNew = Math.max(...newMsgs.map(m => new Date(m.updatedAt || m.createdAt).getTime()));
            lastMsgTimeRef.current[tutorId] = Math.max(lastKnown, maxNew);
          }
          return;
        }

        setChatHistory(msgs);

        setTutors(prevTutors =>
          prevTutors.map(tutor =>
            tutor.tutorId === tutorId
              ? { ...tutor, hasNewResponse: false }
              : tutor
          )
        );

        const lastSeenKey = `student_last_seen_${tutorId}`;
        localStorage.setItem(lastSeenKey, String(Date.now()));

        if (msgs.length > 0) {
          lastMsgTimeRef.current[tutorId] = Math.max(...msgs.map(m => new Date(m.updatedAt || m.createdAt).getTime()));
        } else {
          lastMsgTimeRef.current[tutorId] = 0;
        }

        startPollingForTutor(tutorId);
      }
    } catch (error) {
      // console.error(error);
    }
  };

  const startPollingForTutor = (tutorId) => {
    stopPolling();
    pollRef.current = setInterval(() => fetchChatHistory(tutorId, true), 3000);
  };

  const stopPolling = () => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  };

  const sendMessage = async () => {
    if (!messageText.trim() || !selectedTutor) return;

    try {
      setSending(true);
      const res = await fetchWithAuth(`${BASE_URL}/api/auth/send-message`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          tutorId: selectedTutor.tutorId,
          message: messageText,
        }),
      }, token, (newToken) => localStorage.setItem("authToken", newToken)
      );

      const data = await res.json();
      if (data.success) {
        setChatHistory((prev) => [...prev, data.data]);
        setMessageText("");
        try {
          const msg = data.data;
          const t = new Date(msg.updatedAt || msg.createdAt || Date.now()).getTime();
          const tutorId = selectedTutor?.tutorId;
          if (tutorId) {
            lastMsgTimeRef.current[tutorId] = Math.max(lastMsgTimeRef.current[tutorId] || 0, t);
          }
        } catch (e) {
          // ignore
        }
      }
    } catch (error) {
      // console.error(error);
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
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

  const getLastMessagePreview = (tutor) => {
    if (!tutor.lastMessage) return "No messages yet";

    const lastMsg = tutor.lastMessage;
    if (lastMsg.response) {
      return `Tutor: ${lastMsg.response.substring(0, 30)}${lastMsg.response.length > 30 ? '...' : ''}`;
    }
    return `You: ${lastMsg.message.substring(0, 30)}${lastMsg.message.length > 30 ? '...' : ''}`;
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
      {/* Tutors List Sidebar (desktop) */}
      <Card className="hidden lg:block w-full lg:w-[35%] xl:w-[25%] flex-shrink-0 m-4 lg:m-0 lg:rounded-none shadow-lg lg:shadow-xl h-full overflow-hidden">
        <CardContent className="p-4 h-full flex flex-col">
          {/* Header */}
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-200">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800">Your Tutors</h2>
              <p className="text-sm text-gray-500">{tutors.length} connected</p>
            </div>
          </div>

          {/* Tutors List */}
          <div className="flex-1 overflow-y-auto space-y-3">
            {loading ? (
              <div className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : tutors.length > 0 ? (
              tutors.map((tutor) => (
                <div
                  key={tutor.tutorId}
                  onClick={() => { setSelectedTutor(tutor); fetchChatHistory(tutor.tutorId); }}
                  className={`p-4 rounded-xl cursor-pointer transition-all duration-200 border-2 ${selectedTutor?.tutorId === tutor.tutorId
                      ? "border-blue-500 bg-blue-50 shadow-md"
                      : "border-transparent bg-white hover:border-blue-200 hover:shadow-md"
                    }`}
                >
                  <div className="flex items-start gap-3">
                    {/* Avatar */}
                    <div className="relative flex-shrink-0">
                      <Avatar className="w-8 h-8 border-2 border-white shadow-sm">
                        {tutor.user_id?.photo_url ? (
                          <img
                            src={tutor.user_id.photo_url}
                            alt={tutor.full_name || 'Tutor'}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="h-full w-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold">
                            <User className="h-6 w-6" />
                          </div>
                        )}
                      </Avatar>
                      {/* Online Indicator */}
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
                    </div>

                    {/* Tutor Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-gray-800 text-sm truncate">
                          {tutor.full_name}
                        </h3>
                        {tutor.hasNewResponse && (
                          <Badge variant="destructive" className="px-1.5 py-0 text-xs">
                            New
                          </Badge>
                        )}
                      </div>

                      <p className="text-xs text-gray-600 mb-1 truncate">
                        {getLastMessagePreview(tutor)}
                      </p>

                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-400">
                          {tutor.lastMessage ? formatTime(tutor.lastMessage.updatedAt || tutor.lastMessage.createdAt) : ''}
                        </span>
                        {tutor.responseCount > 0 && (
                          <Badge variant="secondary" className="text-[8px]">
                            {tutor.responseCount} replies
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
                <p className="text-gray-500 text-sm">No tutors available</p>
                <p className="text-gray-400 text-xs mt-1">Your accepted tutors will appear here</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Mobile inline list (visible by default on small screens) */}
      <div className="lg:hidden p-4 bg-white border-b">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Your Tutors</h3>
              <p className="text-xs text-gray-500">{tutors.length} connected</p>
            </div>
          </div>
          {/* Optional: a Close Chat button will appear in chat header to hide chat */}
        </div>
        <div className="space-y-3">
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : tutors.length > 0 ? (
            tutors.map((tutor) => (
              <div
                key={tutor.tutorId}
                onClick={() => { setSelectedTutor(tutor); fetchChatHistory(tutor.tutorId); }}
                className={`p-3 rounded-lg cursor-pointer transition-all duration-150 border ${selectedTutor?.tutorId === tutor.tutorId ? 'border-blue-300 bg-blue-50' : 'border-transparent bg-white'
                  }`}
              >
                <div className="flex items-center gap-3">
                  <Avatar className="w-10 h-10">
                    {tutor.user_id?.photo_url ? (
                      <img src={tutor.user_id.photo_url} alt={tutor.full_name} className="h-full w-full object-cover" />
                    ) : (
                      <div className="h-full w-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold">
                        <User className="h-5 w-5" />
                      </div>
                    )}
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-sm truncate">{tutor.full_name}</p>
                      {tutor.hasNewResponse && <Badge variant="destructive" className="text-xs">New</Badge>}
                    </div>
                    <p className="text-xs text-gray-500 truncate">{getLastMessagePreview(tutor)}</p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-6 text-gray-500">
              <MessageSquare className="h-10 w-10 mx-auto mb-2 text-gray-300" />
              <div>No tutors available</div>
            </div>
          )}
        </div>
      </div>

      {/* Chat Window */}
      <div className="flex-1 flex flex-col m-4 lg:m-0 lg:rounded-none h-full overflow-hidden">
        {selectedTutor ? (
          <Card className="flex-1 flex flex-col shadow-lg lg:shadow-xl h-full">
            {/* Chat Header */}
            <div className="p-4 lg:p-6 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
              <div className="flex items-center gap-4">
                {/* On small screens show a 'Close list' button when a tutor is selected */}
                {selectedTutor && (
                  <button
                    onClick={() => setSelectedTutor(null)}
                    className="lg:hidden mr-2 p-2 rounded-md bg-white/10 hover:bg-white/20"
                    aria-label="Close chat"
                  >
                    <X className="h-5 w-5 text-white" />
                  </button>
                )}
                <Avatar className="w-12 h-12 border-2 border-white shadow-lg">
                  {selectedTutor.user_id?.photo_url ? (
                    <img
                      src={selectedTutor.user_id.photo_url}
                      alt={selectedTutor.full_name || 'Tutor'}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="h-full w-full bg-white/20 flex items-center justify-center text-white font-bold">
                      <User className="h-6 w-6" />
                    </div>
                  )}
                </Avatar>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold">{selectedTutor.full_name}</h3>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <p className="text-sm text-blue-100">Online • Ready to help</p>
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
                  <p className="text-sm text-gray-400 mt-1">Start a conversation with {selectedTutor.full_name}</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {chatHistory.map((msg) => (
                    <div key={msg._id} className="space-y-2">
                      {/* Student Message */}
                      <div className="flex justify-end">
                        <div className="flex flex-col max-w-[70%] break-words whitespace-pre-wrap">
                          <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-3 lg:p-4 rounded-2xl rounded-br-none shadow-lg break-words whitespace-pre-wrap">
                            <p className="text-sm lg:text-base">{msg.message}</p>
                          </div>
                          <div className="flex justify-end items-center gap-1 mt-1">
                            <span className="text-xs text-gray-500">
                              {formatTime(msg.createdAt)}
                            </span>
                            <CheckCheck className="h-3 w-3 text-blue-500" />
                          </div>
                        </div>
                      </div>

                      {/* Tutor Response */}
                      {msg.response && (
                        <div className="flex justify-start">
                          <div className="flex flex-col max-w-[70%] break-words whitespace-pre-wrap">
                            <div className="bg-white border border-gray-200 p-3 lg:p-4 rounded-2xl rounded-bl-none shadow-lg break-words whitespace-pre-wrap">
                              <p className="text-sm lg:text-base text-gray-800">{msg.response}</p>
                            </div>
                            <div className="flex justify-start items-center gap-1 mt-1">
                              <span className="text-xs text-gray-500">
                                {formatTime(msg.updatedAt)}
                              </span>
                              <CheckCircle className="h-3 w-3 text-green-500" />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>

            {/* Message Input */}
            <div className="p-4 lg:p-6 border-t border-gray-200 bg-white">
              <div className="flex gap-3">
                <div className="flex-1 relative">
                  <Input
                    type="text"
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder={`Message ${selectedTutor.full_name}...`}
                    className="pr-12 py-3 lg:py-4 text-base rounded-2xl border-2 border-gray-200 focus:border-blue-500 focus:ring-0 transition-colors"
                    disabled={sending}
                  />
                  {messageText && (
                    <button
                      onClick={() => setMessageText('')}
                      className="absolute right-12 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      ×
                    </button>
                  )}
                </div>
                <Button
                  onClick={sendMessage}
                  disabled={!messageText.trim() || sending}
                  className="px-6 lg:px-8 rounded-2xl bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                  size="lg"
                >
                  {sending ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    <Send className="h-5 w-5" />
                  )}
                </Button>
              </div>
              <p className="text-xs text-gray-400 text-center mt-3">
                Press Enter to send • Shift + Enter for new line
              </p>
            </div>
          </Card>
        ) : (
          <Card className="flex-1 flex items-center justify-center bg-gradient-to-br from-white to-blue-50/50">
            <CardContent className="text-center p-8">
              <div className="max-w-md mx-auto">
                <MessageSquare className="h-20 w-20 text-gray-300 mx-auto mb-6" />
                <h3 className="text-2xl font-bold text-gray-600 mb-3">Welcome to Chat</h3>
                <p className="text-gray-500 mb-6">
                  Select a tutor from the list to start a conversation. You can ask questions about assignments,
                  schedule sessions, or discuss your learning progress.
                </p>
                <div className="flex items-center justify-center gap-2 text-sm text-gray-400">
                  <Users className="h-4 w-4" />
                  <span>{tutors.length} tutors available</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default StudentChatting;