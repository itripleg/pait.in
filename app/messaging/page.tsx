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
      const password = getPassword();
      const response = await fetch(
        `/api/messages?password=${encodeURIComponent(password)}`
      );
      if (response.ok) {
        const data = await response.json();
        setMessages(data.messages);
      }
    } catch (error) {
      console.error("Failed to fetch messages:", error);
    }
  };

  const fetchContacts = async () => {
    try {
      const password = getPassword();
      const response = await fetch(
        `/api/contacts?password=${encodeURIComponent(password)}`
      );
      if (response.ok) {
        const data = await response.json();
        setContacts(data.contacts);

        // Auto-select contact from URL after contacts are loaded
        const contactId = searchParams.get("contact");
        if (contactId && !selectedContact) {
          const contact = data.contacts.find(
            (c: Contact) => c.id === contactId
          );
          if (contact) {
            setSelectedContact(contact);
          }
        }
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
      const password = getPassword();
      const response = await fetch("/api/send-message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message,
          password,
          contactName: selectedContact.name,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setMessage("");
        setStatus(data.message);
        fetchMessages();
        setTimeout(() => setStatus(""), 3000);
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
    <div className="min-h-screen bg-black text-green-400 font-mono p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6 pb-4 border-b border-green-500/30">
          <div>
            <h1 className="text-2xl font-bold">💬 PAIGER</h1>
            {selectedContact && (
              <p className="text-green-400/70">
                Messaging: {selectedContact.emoji} {selectedContact.name}
              </p>
            )}
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => router.push("/contacts")}
              variant="outline"
              className="border-green-500/50 text-green-400 hover:bg-green-500/10 font-mono"
            >
              👥 CONTACTS
            </Button>
            <Button
              onClick={() => router.push("/")}
              variant="outline"
              className="border-green-500/50 text-green-400 hover:bg-green-500/10 font-mono"
            >
              🏠 HOME
            </Button>
            <Button
              onClick={handleLogout}
              variant="destructive"
              className="font-mono"
            >
              LOGOUT
            </Button>
          </div>
        </div>

        {/* Contact Selection */}
        {!selectedContact && (
          <Card className="mb-6 bg-zinc-900 border-green-500/30">
            <CardHeader>
              <CardTitle className="text-green-400 font-mono">
                SELECT CONTACT
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {contacts.map((contact) => (
                  <Button
                    key={contact.id}
                    onClick={() => setSelectedContact(contact)}
                    variant="outline"
                    className="h-20 flex flex-col border-green-500/30 hover:border-green-500/60 text-green-400"
                  >
                    <div className="text-2xl">{contact.emoji}</div>
                    <div className="text-xs">{contact.name}</div>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Send Message Form */}
        {selectedContact && (
          <Card className="mb-6 bg-zinc-900 border-green-500/30">
            <CardContent className="pt-6">
              <div className="flex gap-4 mb-4">
                <Input
                  type="text"
                  placeholder={`Message ${selectedContact.name}...`}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  disabled={loading}
                  className="flex-1 bg-zinc-800 border-zinc-700 text-green-400 font-mono placeholder:text-zinc-500"
                />
                <Button
                  onClick={sendMessage}
                  disabled={loading || !message.trim()}
                  className="bg-green-500 hover:bg-green-600 text-black font-mono font-bold px-8"
                >
                  {loading ? "SENDING..." : "SEND"}
                </Button>
              </div>
              {/* <Button
                onClick={() => setSelectedContact(null)}
                variant="outline"
                size="sm"
                className="border-green-500/30 text-green-400 hover:bg-green-500/10"
              >
                Change Contact
              </Button> */}
            </CardContent>
          </Card>
        )}

        {/* Status */}
        {status && (
          <div className="mb-6 p-4 bg-zinc-900 border border-green-500/30 rounded-lg text-center">
            <span className="text-green-400 font-mono">{status}</span>
          </div>
        )}

        {/* Message History */}
        <Card className="bg-zinc-900 border-green-500/30">
          <CardHeader>
            <CardTitle className="text-green-400 font-mono">
              MESSAGE HISTORY
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {messages.length === 0 ? (
                <p className="text-zinc-500 text-center font-mono">
                  No messages yet...
                </p>
              ) : (
                messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`p-4 rounded-lg border ${
                      msg.direction === "outgoing"
                        ? "bg-green-950/30 border-green-500/50"
                        : "bg-blue-950/30 border-blue-500/50"
                    }`}
                  >
                    <div className="flex justify-between items-center mb-2">
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
                    <div className="text-green-400 font-mono">
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
