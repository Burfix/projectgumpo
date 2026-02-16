"use client";

import { useEffect, useState } from "react";

interface Message {
  id: number;
  sender_id: string;
  recipient_id: string | null;
  subject: string | null;
  body: string;
  message_type: string;
  priority: string;
  is_read: boolean;
  read_at: string | null;
  created_at: string;
  sender: {
    id: string;
    name: string;
    email: string;
  } | null;
  recipient: {
    id: string;
    name: string;
    email: string;
  } | null;
}

export default function MessagesPage() {
  const [activeTab, setActiveTab] = useState<"inbox" | "sent">("inbox");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCompose, setShowCompose] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);

  const [composeForm, setComposeForm] = useState({
    recipientId: "",
    subject: "",
    body: "",
    priority: "normal",
  });

  useEffect(() => {
    fetchMessages();
  }, [activeTab]);

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const type = activeTab === "inbox" ? "received" : "sent";
      const response = await fetch(`/api/messages?type=${type}`);
      if (!response.ok) throw new Error("Failed to fetch messages");
      const data = await response.json();
      setMessages(data);
    } catch (error) {
      console.error("Error:", error);
      alert("Failed to load messages");
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipientId: composeForm.recipientId,
          subject: composeForm.subject,
          body: composeForm.body,
          priority: composeForm.priority,
          messageType: "direct",
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to send message");
      }

      alert("Message sent successfully!");
      setShowCompose(false);
      setComposeForm({
        recipientId: "",
        subject: "",
        body: "",
        priority: "normal",
      });
      
      if (activeTab === "sent") {
        await fetchMessages();
      }
    } catch (error: any) {
      console.error("Error:", error);
      alert(error.message || "Failed to send message");
    }
  };

  const handleMarkAsRead = async (messageId: number) => {
    try {
      const response = await fetch(`/api/messages/${messageId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isRead: true }),
      });

      if (!response.ok) throw new Error("Failed to mark as read");
      
      await fetchMessages();
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const openMessage = (message: Message) => {
    setSelectedMessage(message);
    if (activeTab === "inbox" && !message.is_read) {
      handleMarkAsRead(message.id);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "bg-red-100 text-red-800";
      case "high":
        return "bg-orange-100 text-orange-800";
      case "low":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-blue-100 text-blue-800";
    }
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Messages</h1>
        <button
          onClick={() => setShowCompose(!showCompose)}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          {showCompose ? "Cancel" : "✉️ Compose Message"}
        </button>
      </div>

      {/* Compose Form */}
      {showCompose && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">New Message</h2>
          <form onSubmit={handleSendMessage} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Recipient ID *
              </label>
              <input
                type="text"
                required
                value={composeForm.recipientId}
                onChange={(e) =>
                  setComposeForm({ ...composeForm, recipientId: e.target.value })
                }
                placeholder="Enter recipient user ID"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                Note: In production, you would select from a list of users
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Subject *
              </label>
              <input
                type="text"
                required
                value={composeForm.subject}
                onChange={(e) =>
                  setComposeForm({ ...composeForm, subject: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Priority
              </label>
              <select
                value={composeForm.priority}
                onChange={(e) =>
                  setComposeForm({ ...composeForm, priority: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="low">Low</option>
                <option value="normal">Normal</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Message *
              </label>
              <textarea
                required
                value={composeForm.body}
                onChange={(e) =>
                  setComposeForm({ ...composeForm, body: e.target.value })
                }
                rows={6}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <button
              type="submit"
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Send Message
            </button>
          </form>
        </div>
      )}

      {/* Tabs */}
      <div className="mb-6 border-b border-gray-200">
        <div className="flex space-x-8">
          <button
            onClick={() => setActiveTab("inbox")}
            className={`pb-4 px-1 border-b-2 font-medium transition-colors ${
              activeTab === "inbox"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            📥 Inbox
          </button>
          <button
            onClick={() => setActiveTab("sent")}
            className={`pb-4 px-1 border-b-2 font-medium transition-colors ${
              activeTab === "sent"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            📤 Sent
          </button>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      )}

      {/* Messages List */}
      {!loading && (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {messages.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No messages in your {activeTab}
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {messages.map((message) => (
                <div
                  key={message.id}
                  onClick={() => openMessage(message)}
                  className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                    !message.is_read && activeTab === "inbox"
                      ? "bg-blue-50"
                      : ""
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        {!message.is_read && activeTab === "inbox" && (
                          <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                        )}
                        <span className="font-medium text-gray-900">
                          {activeTab === "inbox"
                            ? message.sender?.name || "Unknown Sender"
                            : message.recipient?.name || "Unknown Recipient"}
                        </span>
                        <span
                          className={`px-2 py-1 text-xs font-semibold rounded ${getPriorityColor(
                            message.priority
                          )}`}
                        >
                          {message.priority}
                        </span>
                      </div>
                      <h3 className="text-sm font-semibold text-gray-900 mb-1">
                        {message.subject || "(No Subject)"}
                      </h3>
                      <p className="text-sm text-gray-600 truncate">
                        {message.body}
                      </p>
                    </div>
                    <div className="text-xs text-gray-500 ml-4">
                      {new Date(message.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Message Detail Modal */}
      {selectedMessage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h2 className="text-xl font-bold text-gray-900 mb-2">
                    {selectedMessage.subject || "(No Subject)"}
                  </h2>
                  <div className="text-sm text-gray-600">
                    <p>
                      <strong>From:</strong>{" "}
                      {selectedMessage.sender?.name || "Unknown"} (
                      {selectedMessage.sender?.email || "N/A"})
                    </p>
                    {selectedMessage.recipient && (
                      <p>
                        <strong>To:</strong> {selectedMessage.recipient.name} (
                        {selectedMessage.recipient.email})
                      </p>
                    )}
                    <p>
                      <strong>Date:</strong>{" "}
                      {new Date(selectedMessage.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedMessage(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
              
              <div className="mb-4">
                <span
                  className={`px-2 py-1 text-xs font-semibold rounded ${getPriorityColor(
                    selectedMessage.priority
                  )}`}
                >
                  {selectedMessage.priority} priority
                </span>
              </div>

              <div className="prose max-w-none">
                <p className="text-gray-800 whitespace-pre-wrap">
                  {selectedMessage.body}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
