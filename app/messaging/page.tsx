// app/messaging/page.tsx
"use client";

import { Suspense } from "react";
import { useState, useEffect } from "react";
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

  useEffect(() => {
    const interval = setInterval(fetchMessages, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-black text-green-400 font-mono p-2 sm:p-4">
      <div className="max-w-4xl mx-auto">
        {/* Mobile-Friendly Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 sm:mb-6 pb-4 border-b border-green-500/30 space-y-3 sm:space-y-0">
          <div className="flex-1">
            <h1 className="text-xl sm:text-2xl font-bold">💬 PAIGER</h1>
            {selectedContact && (
              <p className="text-green-400/70 text-sm">
                Messaging: {selectedContact.emoji} {selectedContact.name}
              </p>
            )}
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

        {/* Contact Selection */}
        {!selectedContact && (
          <Card className="mb-4 sm:mb-6 bg-zinc-900 border-green-500/30">
            <CardHeader className="pb-3">
              <CardTitle className="text-green-400 font-mono text-lg">
                SELECT CONTACT
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {contacts.map((contact) => (
                  <Button
                    key={contact.id}
                    onClick={() => setSelectedContact(contact)}
                    variant="outline"
                    className="h-26 sm:h-20 flex flex-col border-green-500/30 hover:border-green-500/60 text-green-400 p-2"
                  >
                    <div className="text-xl sm:text-2xl">{contact.emoji}</div>
                    <div className="text-xs truncate w-full">
                      {contact.name}
                    </div>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Send Message Form */}
        {selectedContact && (
          <Card className="mb-4 sm:mb-6 bg-zinc-900 border-green-500/30">
            <CardContent className="pt-4 sm:pt-6">
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
                <Button
                  type="button"
                  onClick={() => setSelectedContact(null)}
                  variant="outline"
                  size="sm"
                  className="border-green-500/30 text-green-400 hover:bg-green-500/10 text-xs"
                >
                  Change Contact
                </Button>
              </form>
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
            <CardTitle className="text-green-400 font-mono text-lg">
              MESSAGE HISTORY
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-[60vh] sm:max-h-96 overflow-y-auto">
              {messages.length === 0 ? (
                <p className="text-zinc-500 text-center font-mono text-sm">
                  No messages yet...
                </p>
              ) : (
                messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`p-3 sm:p-4 rounded-lg border ${
                      msg.direction === "outgoing"
                        ? "bg-green-950/30 border-green-500/50"
                        : "bg-blue-950/30 border-blue-500/50"
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-2 space-y-1 sm:space-y-0">
                      <span
                        className={`text-xs font-mono ${
                          msg.direction === "outgoing"
                            ? "text-green-400"
                            : "text-blue-400"
                        }`}
                      >
                        {msg.direction === "outgoing" ? "→ TO" : "← FROM"}{" "}
                        {msg.contact_name || "Unknown"}
                      </span>
                      <span className="text-xs text-zinc-500 font-mono">
                        {new Date(msg.timestamp).toLocaleString()}
                      </span>
                    </div>
                    <div className="text-green-400 font-mono text-sm break-words">
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
