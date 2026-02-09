"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Message = {
  id: number;
  sender_id: string;
  recipient_id: string;
  subject?: string;
  message: string;
  message_type: string;
  is_read: boolean;
  created_at: string;
  sender_name?: string;
};

export default function ParentMessagesPage() {
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);

  useEffect(() => {
    fetchMessages();
  }, []);

  async function fetchMessages() {
    try {
      const response = await fetch("/api/parent/messages");
      if (!response.ok) throw new Error("Failed to fetch messages");
      
      const data = await response.json();
      setMessages(data.messages || []);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching messages:", error);
      setLoading(false);
    }
  }

  async function markAsRead(messageId: number) {
    try {
      const response = await fetch("/api/parent/messages", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messageId }),
      });
      
      if (response.ok) {
        setMessages(messages.map(m => 
          m.id === messageId ? { ...m, is_read: true } : m
        ));
      }
    } catch (error) {
      console.error("Error marking message as read:", error);
    }
  }

  function openMessage(message: Message) {
    setSelectedMessage(message);
    if (!message.is_read) {
      markAsRead(message.id);
    }
  }

  const unreadCount = messages.filter(m => !m.is_read).length;

  if (loading) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-blue-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-blue-50">
      {/* Navigation Header */}
      <nav className="bg-white/80 backdrop-blur-lg border-b border-stone-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <Link 
            href="/dashboard/parent"
            className="inline-flex items-center text-sm font-medium text-stone-600 hover:text-emerald-600"
          >
            <span className="mr-2">←</span>
            <span>Back to Dashboard</span>
          </Link>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-stone-900 mb-2">Messages</h1>
          <p className="text-stone-600">
            {unreadCount > 0 ? `You have ${unreadCount} unread message${unreadCount > 1 ? 's' : ''}` : 'All caught up!'}
          </p>
        </div>

        {/* Messages Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Messages List */}
          <div className="lg:col-span-1 space-y-3">
            {messages.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-lg border border-stone-100 p-8 text-center">
                <span className="text-5xl block mb-3">📬</span>
                <p className="text-stone-600">No messages yet</p>
              </div>
            ) : (
              messages.map((message) => (
                <button
                  key={message.id}
                  onClick={() => openMessage(message)}
                  className={`w-full text-left p-4 rounded-2xl border-2 transition-all hover:shadow-md ${
                    selectedMessage?.id === message.id
                      ? 'bg-emerald-50 border-emerald-300'
                      : message.is_read
                      ? 'bg-white border-stone-200'
                      : 'bg-blue-50 border-blue-300'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {!message.is_read && (
                        <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                      )}
                      <p className="font-semibold text-stone-900">
                        {message.sender_name || 'Teacher'}
                      </p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      message.message_type === 'announcement' 
                        ? 'bg-purple-100 text-purple-700' 
                        : message.message_type === 'alert'
                        ? 'bg-red-100 text-red-700'
                        : 'bg-stone-100 text-stone-600'
                    }`}>
                      {message.message_type}
                    </span>
                  </div>
                  {message.subject && (
                    <p className="text-sm font-medium text-stone-700 mb-1 line-clamp-1">
                      {message.subject}
                    </p>
                  )}
                  <p className="text-xs text-stone-500 line-clamp-2">
                    {message.message}
                  </p>
                  <p className="text-xs text-stone-400 mt-2">
                    {new Date(message.created_at).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      hour: 'numeric',
                      minute: '2-digit'
                    })}
                  </p>
                </button>
              ))
            )}
          </div>

          {/* Message Detail */}
          <div className="lg:col-span-2">
            {selectedMessage ? (
              <div className="bg-white rounded-2xl shadow-lg border border-stone-100 p-8">
                <div className="mb-6 pb-6 border-b border-stone-200">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h2 className="text-2xl font-bold text-stone-900 mb-1">
                        {selectedMessage.subject || 'Message'}
                      </h2>
                      <p className="text-sm text-stone-600">
                        From: <span className="font-medium">{selectedMessage.sender_name || 'Teacher'}</span>
                      </p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      selectedMessage.message_type === 'announcement' 
                        ? 'bg-purple-100 text-purple-700' 
                        : selectedMessage.message_type === 'alert'
                        ? 'bg-red-100 text-red-700'
                        : 'bg-stone-100 text-stone-600'
                    }`}>
                      {selectedMessage.message_type}
                    </span>
                  </div>
                  <p className="text-xs text-stone-500">
                    {new Date(selectedMessage.created_at).toLocaleString('en-US', {
                      weekday: 'long',
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric',
                      hour: 'numeric',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
                
                <div className="prose prose-sm max-w-none">
                  <p className="text-stone-700 leading-relaxed whitespace-pre-wrap">
                    {selectedMessage.message}
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="mt-8 pt-6 border-t border-stone-200 flex gap-3">
                  <button className="flex-1 px-6 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 font-semibold transition-colors">
                    Reply to Teacher
                  </button>
                  <button className="px-6 py-3 border-2 border-stone-300 text-stone-700 rounded-xl hover:bg-stone-50 font-semibold transition-colors">
                    Forward
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-lg border border-stone-100 p-12 text-center">
                <span className="text-6xl block mb-4">💬</span>
                <h3 className="text-xl font-semibold text-stone-900 mb-2">
                  Select a Message
                </h3>
                <p className="text-stone-600">
                  Click on a message from the list to read it
                </p>
              </div>
            )}
          </div>
        </div>

        {/* New Message Button */}
        <div className="mt-8">
          <button className="w-full lg:w-auto px-8 py-4 bg-gradient-to-r from-emerald-600 to-blue-600 text-white rounded-2xl hover:from-emerald-700 hover:to-blue-700 font-semibold text-lg shadow-lg transition-all transform hover:scale-105">
            ✉️ Send New Message to Teacher
          </button>
        </div>
      </div>
    </main>
  );
}
