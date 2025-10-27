// app/messaging/page.tsx - Enhanced with safe role-based filtering and admin functionality
"use client";
import { AuthDebug } from "@/components/AuthDebug";
import { Suspense } from "react";
import { useState, useEffect, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Contact, Message } from "@/types";
import { useUserRole } from "@/lib/hooks/useUserRole";

function MessagingInterface() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { userRole, isAdmin, isLoading: userLoading } = useUserRole();
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [showAllMessages, setShowAllMessages] = useState(true);

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
      "pait_user=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    router.push("/");
  };

  // Filter messages based on selection and user role
  const filteredMessages = useMemo(() => {
    let messagesToShow = messages;

    // If user is not admin, filter out unknown contacts
    if (!isAdmin) {
      messagesToShow = messages.filter((msg) => {
        // Only show messages from known contacts
        // Filter out messages that:
        // 1. Have contact_name starting with "Unknown"
        // 2. Have no contact_name (incoming messages from unknown numbers/emails)
        // 3. Are from phone numbers or emails not in our contacts list
        if (msg.contact_name?.startsWith("Unknown")) return false;
        if (!msg.contact_name && msg.direction === "incoming") return false;

        // Additional check: ensure the from_number/to_number matches a known contact
        if (msg.direction === "incoming" && msg.from_number) {
          const isKnownContact = contacts.some(
            (contact) =>
              contact.phone === msg.from_number ||
              contact.email === msg.from_number
          );
          if (!isKnownContact) return false;
        }

        return true;
      });
    }

    // Apply contact filter if selected
    if (showAllMessages || !selectedContact) {
      return messagesToShow;
    }

    // Special handling for "Unknown" contacts filter (admin only)
    if (selectedContact.name === "Unknown") {
      return messages.filter((msg) => {
        // Show messages from unknown sources
        if (msg.contact_name?.startsWith("Unknown")) return true;
        if (!msg.contact_name && msg.direction === "incoming") return true;

        if (msg.direction === "incoming" && msg.from_number) {
          const isKnownContact = contacts.some(
            (contact) =>
              contact.phone === msg.from_number ||
              contact.email === msg.from_number
          );
          return !isKnownContact;
        }

        return false;
      });
    }

    // Filter messages for selected contact
    return messagesToShow.filter((msg) => {
      return (
        msg.contact_name === selectedContact.name ||
        msg.from_number === selectedContact.phone ||
        msg.to_number === selectedContact.phone
      );
    });
  }, [messages, selectedContact, showAllMessages, isAdmin]);

  // Get message count per contact for display (filtered by user role)
  const getContactMessageCount = (contact: Contact) => {
    let messagesToCount = messages;

    // If not admin, exclude unknown contacts from count
    if (!isAdmin) {
      messagesToCount = messages.filter((msg) => {
        // Same filtering logic as above
        if (msg.contact_name?.startsWith("Unknown")) return false;
        if (!msg.contact_name && msg.direction === "incoming") return false;

        if (msg.direction === "incoming" && msg.from_number) {
          const isKnownContact = contacts.some(
            (c) => c.phone === msg.from_number || c.email === msg.from_number
          );
          if (!isKnownContact) return false;
        }

        return true;
      });
    }

    return messagesToCount.filter(
      (msg) =>
        msg.contact_name === contact.name ||
        msg.from_number === contact.phone ||
        msg.to_number === contact.phone
    ).length;
  };

  // Get count of messages from unknown contacts (admin only)
  const getUnknownMessageCount = () => {
    if (!isAdmin) return 0;
    return messages.filter((msg) => {
      // Count messages that are from unknown sources:
      // 1. Contact name starts with "Unknown"
      // 2. No contact name and incoming message
      // 3. Incoming message from number/email not in contacts
      if (msg.contact_name?.startsWith("Unknown")) return true;
      if (!msg.contact_name && msg.direction === "incoming") return true;

      if (msg.direction === "incoming" && msg.from_number) {
        const isKnownContact = contacts.some(
          (contact) =>
            contact.phone === msg.from_number ||
            contact.email === msg.from_number
        );
        return !isKnownContact;
      }

      return false;
    }).length;
  };

  useEffect(() => {
    const interval = setInterval(fetchMessages, 5000);
    return () => clearInterval(interval);
  }, []);

  // Show loading while determining user role
  if (userLoading) {
    return (
      <div className="min-h-screen bg-black text-green-400 font-mono flex items-center justify-center">
        <div className="text-center">
          <div className="text-green-400 animate-pulse">
            Loading user information...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-green-400 font-mono p-2 sm:p-4">
      {process.env.NODE_ENV === "production" && <AuthDebug />}
      <div className="max-w-5xl mx-auto">
        {/* Mobile-Friendly Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 sm:mb-6 pb-4 border-b border-green-500/30 space-y-3 sm:space-y-0">
          <div className="flex-1">
            <h1 className="text-xl sm:text-2xl font-bold">💬 PAIGER</h1>
            <div className="flex items-center gap-2 text-sm text-green-400/70 mt-1">
              <span>
                {showAllMessages
                  ? `All Messages (${filteredMessages.length})`
                  : selectedContact
                  ? `${selectedContact.emoji} ${selectedContact.name} (${filteredMessages.length} messages)`
                  : "Select contact to message"}
              </span>
              {isAdmin && (
                <span className="text-yellow-400/70 text-xs">[ADMIN VIEW]</span>
              )}
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
                  All Messages ({filteredMessages.length})
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

                {/* Admin: Show unknown contacts filter */}
                {isAdmin && getUnknownMessageCount() > 0 && (
                  <Button
                    onClick={() => {
                      setSelectedContact({
                        id: "unknown",
                        name: "Unknown",
                        phone: "",
                        emoji: "❓",
                        approved: false,
                      } as Contact);
                      setShowAllMessages(false);
                    }}
                    variant={
                      selectedContact?.name === "Unknown"
                        ? "default"
                        : "outline"
                    }
                    size="sm"
                    className={`font-mono text-xs ${
                      selectedContact?.name === "Unknown"
                        ? "bg-yellow-500 text-black"
                        : "border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/10"
                    }`}
                  >
                    ❓ Unknown ({getUnknownMessageCount()})
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Send Message Form - Only show when contact is selected and not "Unknown" */}
        {selectedContact &&
          !showAllMessages &&
          selectedContact.name !== "Unknown" && (
            <Card className="mb-4 sm:mb-6 bg-zinc-900 border-green-500/30">
              <CardHeader className="pb-3">
                <CardTitle className="text-green-400 font-mono text-lg flex items-center gap-2">
                  💬 Send to {selectedContact.emoji} {selectedContact.name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={sendMessage}>
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
                {isAdmin && getUnknownMessageCount() > 0 && (
                  <span className="block mt-2 text-yellow-400/70">
                    ⚠️ {getUnknownMessageCount()} messages from unknown contacts
                    (Admin view only)
                  </span>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Admin notice for Unknown contacts */}
        {selectedContact?.name === "Unknown" && (
          <Card className="mb-4 sm:mb-6 bg-yellow-950/30 border-yellow-500/30">
            <CardContent className="pt-4 sm:pt-6">
              <div className="text-center text-yellow-400 text-sm">
                ⚠️ Viewing messages from unknown contacts (Admin only)
                <br />
                <span className="text-yellow-400/70 text-xs">
                  These are messages from phone numbers/emails not in your
                  contact list
                </span>
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
            <div className="space-y-3 max-h-[60vh] sm:max-h-96 overflow-y-auto scrollbar-thin scrollbar-track-zinc-800 scrollbar-thumb-green-500/50 hover:scrollbar-thumb-green-500/70 px-2">
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
                    className={`p-3 sm:p-4 rounded-lg border transition-all hover:scale-[1.01] w-full ${
                      msg.direction === "outgoing"
                        ? "bg-green-950/30 border-green-500/50"
                        : msg.contact_name?.startsWith("Unknown")
                        ? "bg-yellow-950/30 border-yellow-500/50"
                        : "bg-blue-950/30 border-blue-500/50"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2 flex-wrap gap-1">
                      <span
                        className={`text-xs font-mono font-bold ${
                          msg.direction === "outgoing"
                            ? "text-green-400"
                            : msg.contact_name?.startsWith("Unknown")
                            ? "text-yellow-400"
                            : "text-blue-400"
                        }`}
                      >
                        {msg.direction === "outgoing" ? "→ TO" : "← FROM"}{" "}
                        <span
                          className={
                            msg.contact_name?.startsWith("Unknown")
                              ? "text-yellow-400"
                              : ""
                          }
                        >
                          {msg.contact_name || "Unknown"}
                        </span>
                        {showAllMessages && (
                          <span className="ml-2 text-green-400/50">
                            via{" "}
                            {msg.from_number?.includes("@") ? "EMAIL" : "SMS"}
                          </span>
                        )}
                        {/* Show phone/email for unknown contacts in admin view */}
                        {isAdmin && msg.contact_name?.startsWith("Unknown") && (
                          <span className="ml-2 text-yellow-400/60 text-xs break-all">
                            (
                            {msg.direction === "outgoing"
                              ? msg.to_number
                              : msg.from_number}
                            )
                          </span>
                        )}
                      </span>
                      <span className="text-xs text-zinc-500 font-mono whitespace-nowrap">
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
