// app/messaging/page.tsx - Enhanced with filtering
"use client";

import { Suspense } from "react";
import { useState, useEffect, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Contact, Message } from "@/types";

function MessagingInterface() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [showAllMessages, setShowAllMessages] = useState(true);

  // Get password from cookie
  const getPassword = () => {
    const cookies = document.cookie.split(";");
    const authCookie = cookies.find((cookie) =>
      cookie.trim().startsWith("pait_auth=")
    );
    return authCookie ? authCookie.split("=")[1] : "";
  };

  useEffect(() => {
    fetchMessages();
    fetchContacts();
  }, []);

  // Auto-select contact from URL parameter
  useEffect(() => {
    const contactId = searchParams.get("contact");
    if (contactId && contacts.length > 0 && !selectedContact) {
      const contact = contacts.find((c) => c.id === contactId);
      if (contact) {
        setSelectedContact(contact);
        setShowAllMessages(false); // Auto-filter when coming from contacts page
      }
    }
  }, [searchParams, contacts, selectedContact]);

  const fetchMessages = async () => {
    try {
      const response = await fetch("/api/messages");
      if (response.ok) {
        const data = await response.json();
        setMessages(data.messages);
      } else if (response.status === 401) {
        router.push("/login");
      }
    } catch (error) {
      console.error("Failed to fetch messages:", error);
    }
  };

  const fetchContacts = async () => {
    try {
      const response = await fetch("/api/contacts");
      if (response.ok) {
        const data = await response.json();
        setContacts(data.contacts);

        const contactId = searchParams.get("contact");
        if (contactId && !selectedContact) {
          const contact = data.contacts.find(
            (c: Contact) => c.id === contactId
          );
          if (contact) {
            setSelectedContact(contact);
            setShowAllMessages(false);
          }
        }
      } else if (response.status === 401) {
        router.push("/login");
      }
    } catch (error) {
      console.error("Failed to fetch contacts:", error);
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !selectedContact) return;

    setLoading(true);
    try {
      const response = await fetch("/api/send-message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message,
          contactName: selectedContact.name,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setMessage("");
        setStatus(data.message);
        fetchMessages();
        setTimeout(() => setStatus(""), 3000);
      } else if (response.status === 401) {
        router.push("/login");
      } else {
        const error = await response.json();
        setStatus(`Error: ${error.error}`);
      }
    } catch (error) {
      setStatus("Failed to send message");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    document.cookie =
      "pait_auth=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    document.cookie =
      "pait_optin=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    router.push("/");
  };

  // Filter messages based on selection
  const filteredMessages = useMemo(() => {
    if (showAllMessages || !selectedContact) {
      return messages;
    }

    // Filter messages for selected contact
    return messages.filter((msg) => {
      return (
        msg.contact_name === selectedContact.name ||
        msg.from_number === selectedContact.phone ||
        msg.to_number === selectedContact.phone
      );
    });
  }, [messages, selectedContact, showAllMessages]);

  // Get message count per contact for display
  const getContactMessageCount = (contact: Contact) => {
    return messages.filter(
      (msg) =>
        msg.contact_name === contact.name ||
        msg.from_number === contact.phone ||
        msg.to_number === contact.phone
    ).length;
  };

  useEffect(() => {
    const interval = setInterval(fetchMessages, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-black text-green-400 font-mono p-2 sm:p-4">
      <div className="max-w-5xl mx-auto">
        {/* Mobile-Friendly Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 sm:mb-6 pb-4 border-b border-green-500/30 space-y-3 sm:space-y-0">
          <div className="flex-1">
            <h1 className="text-xl sm:text-2xl font-bold">💬 PAIGER</h1>
            <div className="flex items-center gap-2 text-sm text-green-400/70 mt-1">
              <span>
                {showAllMessages
                  ? `All Messages (${messages.length})`
                  : selectedContact
                  ? `${selectedContact.emoji} ${selectedContact.name} (${filteredMessages.length} messages)`
                  : "Select contact to message"}
              </span>
            </div>
          </div>

          {/* Mobile Navigation */}
          <div className="flex flex-wrap gap-2">
            <Button
              onClick={() => router.push("/contacts")}
              size="sm"
              variant="outline"
              className="border-green-500/50 text-green-400 hover:bg-green-500/10 font-mono text-xs flex-1 sm:flex-none"
            >
              <span className="sm:hidden">👥</span>
              <span className="hidden sm:inline">👥 CONTACTS</span>
            </Button>
            <Button
              onClick={() => router.push("/")}
              size="sm"
              variant="outline"
              className="border-green-500/50 text-green-400 hover:bg-green-500/10 font-mono text-xs flex-1 sm:flex-none"
            >
              <span className="sm:hidden">🏠</span>
              <span className="hidden sm:inline">🏠 HOME</span>
            </Button>
            <Button
              onClick={handleLogout}
              size="sm"
              variant="destructive"
              className="font-mono text-xs flex-1 sm:flex-none"
            >
              <span className="sm:hidden">🚪</span>
              <span className="hidden sm:inline">LOGOUT</span>
            </Button>
          </div>
        </div>

        {/* Contact Filter Bar */}
        <Card className="mb-4 sm:mb-6 bg-zinc-900 border-green-500/30">
          <CardContent className="pt-4 sm:pt-6">
            <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
              <div className="flex items-center gap-2">
                <span className="text-sm text-green-400/70 whitespace-nowrap">
                  Filter:
                </span>
                <Button
                  onClick={() => {
                    setShowAllMessages(true);
                    setSelectedContact(null);
                  }}
                  variant={showAllMessages ? "default" : "outline"}
                  size="sm"
                  className={`font-mono text-xs ${
                    showAllMessages
                      ? "bg-green-500 text-black"
                      : "border-green-500/30 text-green-400 hover:bg-green-500/10"
                  }`}
                >
                  All Messages ({messages.length})
                </Button>
              </div>

              <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                {contacts.map((contact) => {
                  const messageCount = getContactMessageCount(contact);
                  const isSelected =
                    selectedContact?.id === contact.id && !showAllMessages;

                  return (
                    <Button
                      key={contact.id}
                      onClick={() => {
                        setSelectedContact(contact);
                        setShowAllMessages(false);
                      }}
                      variant={isSelected ? "default" : "outline"}
                      size="sm"
                      className={`font-mono text-xs ${
                        isSelected
                          ? "bg-green-500 text-black"
                          : "border-green-500/30 text-green-400 hover:bg-green-500/10"
                      }`}
                    >
                      {contact.emoji} {contact.name} ({messageCount})
                    </Button>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Send Message Form - Only show when contact is selected */}
        {selectedContact && !showAllMessages && (
          <Card className="mb-4 sm:mb-6 bg-zinc-900 border-green-500/30">
            <CardHeader className="pb-3">
              <CardTitle className="text-green-400 font-mono text-lg flex items-center gap-2">
                💬 Send to {selectedContact.emoji} {selectedContact.name}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={sendMessage} className="space-y-3">
                <div className="flex flex-col sm:flex-row gap-3">
                  <Input
                    type="text"
                    placeholder={`Message ${selectedContact.name}...`}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    disabled={loading}
                    className="flex-1 bg-zinc-800 border-zinc-700 text-green-400 font-mono placeholder:text-zinc-500 text-sm"
                  />
                  <Button
                    type="submit"
                    disabled={loading || !message.trim()}
                    className="bg-green-500 hover:bg-green-600 text-black font-mono font-bold px-6 sm:px-8 whitespace-nowrap"
                  >
                    {loading ? "SENDING..." : "SEND"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Quick Message for All Messages View */}
        {showAllMessages && (
          <Card className="mb-4 sm:mb-6 bg-zinc-900 border-green-500/30">
            <CardContent className="pt-4 sm:pt-6">
              <div className="text-center text-green-400/70 text-sm">
                💡 Select a contact above to send a new message
              </div>
            </CardContent>
          </Card>
        )}

        {/* Status */}
        {status && (
          <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-zinc-900 border border-green-500/30 rounded-lg text-center">
            <span className="text-green-400 font-mono text-sm">{status}</span>
          </div>
        )}

        {/* Message History */}
        <Card className="bg-zinc-900 border-green-500/30">
          <CardHeader className="pb-3">
            <CardTitle className="text-green-400 font-mono text-lg flex items-center justify-between">
              <span>📜 MESSAGE HISTORY</span>
              <span className="text-xs text-green-400/60">
                {filteredMessages.length} messages
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-[60vh] sm:max-h-96 overflow-y-auto">
              {filteredMessages.length === 0 ? (
                <p className="text-zinc-500 text-center font-mono text-sm py-8">
                  {showAllMessages
                    ? "No messages yet..."
                    : `No messages with ${
                        selectedContact?.name || "this contact"
                      } yet...`}
                </p>
              ) : (
                filteredMessages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`p-3 sm:p-4 rounded-lg border transition-all hover:scale-[1.01] ${
                      msg.direction === "outgoing"
                        ? "bg-green-950/30 border-green-500/50 ml-0 sm:ml-8"
                        : "bg-blue-950/30 border-blue-500/50 mr-0 sm:mr-8"
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-2 space-y-1 sm:space-y-0">
                      <span
                        className={`text-xs font-mono font-bold ${
                          msg.direction === "outgoing"
                            ? "text-green-400"
                            : "text-blue-400"
                        }`}
                      >
                        {msg.direction === "outgoing" ? "→ TO" : "← FROM"}{" "}
                        {msg.contact_name || "Unknown"}
                        {showAllMessages && (
                          <span className="ml-2 text-green-400/50">
                            via{" "}
                            {msg.from_number?.includes("@") ? "EMAIL" : "SMS"}
                          </span>
                        )}
                      </span>
                      <span className="text-xs text-zinc-500 font-mono">
                        {new Date(msg.timestamp).toLocaleString()}
                      </span>
                    </div>
                    <div className="text-green-400 font-mono text-sm break-words leading-relaxed">
                      {msg.content}
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function MessagingPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-black flex items-center justify-center">
          <div className="text-green-400 font-mono">Loading messaging...</div>
        </div>
      }
    >
      <MessagingInterface />
    </Suspense>
  );
}
