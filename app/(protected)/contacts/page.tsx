// app/contacts/page.tsx - Integrated admin functionality
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Contact } from "@/types";
import { useUserRole } from "@/lib/hooks/useUserRole";

interface EnhancedContact extends Contact {
  email?: string;
  methods: ("sms" | "email")[];
}

export default function ContactsPage() {
  const router = useRouter();
  const { userRole, isAdmin, isLoading: userLoading } = useUserRole();
  const [contacts, setContacts] = useState<EnhancedContact[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingContact, setEditingContact] = useState<EnhancedContact | null>(
    null
  );
  const [newContact, setNewContact] = useState({
    name: "",
    phone: "",
    email: "",
    emoji: "👤",
  });
  const [actionLoading, setActionLoading] = useState(false);
  const [status, setStatus] = useState("");

  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    try {
      const response = await fetch("/api/contacts");

      if (response.ok) {
        const data = await response.json();
        setContacts(data.contacts);
      } else if (response.status === 401) {
        router.push("/login");
      } else {
        console.error("Failed to fetch contacts:", response.status);
      }
    } catch (error) {
      console.error("Failed to fetch contacts:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleMessageContact = (contact: Contact) => {
    router.push(`/messaging?contact=${contact.id}`);
  };

  const saveContact = async (contact: EnhancedContact) => {
    setActionLoading(true);
    try {
      const response = await fetch("/api/contacts", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(contact),
      });

      if (response.ok) {
        setStatus("Contact updated successfully!");
        setEditingContact(null);
        fetchContacts();
        setTimeout(() => setStatus(""), 3000);
      } else {
        setStatus("Failed to update contact");
      }
    } catch (error) {
      setStatus("Error updating contact");
    } finally {
      setActionLoading(false);
    }
  };

  const addContact = async () => {
    if (!newContact.name || !newContact.phone) {
      setStatus("Name and phone are required");
      return;
    }

    setActionLoading(true);
    try {
      const contact: EnhancedContact = {
        id: Date.now().toString(),
        name: newContact.name,
        phone: newContact.phone,
        email: newContact.email || undefined,
        emoji: newContact.emoji,
        approved: true,
        methods: newContact.email ? ["sms", "email"] : ["sms"],
      };

      const response = await fetch("/api/contacts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(contact),
      });

      if (response.ok) {
        setStatus("Contact added successfully!");
        setNewContact({ name: "", phone: "", email: "", emoji: "👤" });
        fetchContacts();
        setTimeout(() => setStatus(""), 3000);
      } else {
        setStatus("Failed to add contact");
      }
    } catch (error) {
      setStatus("Error adding contact");
    } finally {
      setActionLoading(false);
    }
  };

  const handleLogout = () => {
    document.cookie =
      "pait_auth=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    document.cookie =
      "pait_user=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    router.push("/");
  };

  // Show loading while determining user role
  if (userLoading || loading) {
    return (
      <div className="min-h-screen bg-black text-green-400 font-mono flex items-center justify-center">
        <div className="text-center">
          <div className="text-green-400 animate-pulse">
            Loading contacts...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-green-400 font-mono p-2 sm:p-4">
      <div className="max-w-6xl mx-auto">
        {/* Mobile-Friendly Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 sm:mb-6 pb-4 border-b border-green-500/30 space-y-3 sm:space-y-0">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold">
              👥 CONTACTS{" "}
              {isAdmin && <span className="text-yellow-400">[ADMIN]</span>}
            </h1>
            <p className="text-green-400/70 text-sm">
              {isAdmin
                ? "Manage your family contacts"
                : "Your approved contacts"}
            </p>
          </div>

          {/* Mobile Navigation */}
          <div className="flex flex-wrap gap-2">
            <Button
              onClick={() => router.push("/messaging")}
              size="sm"
              variant="outline"
              className="border-green-500/50 text-green-400 hover:bg-green-500/10 font-mono text-xs flex-1 sm:flex-none"
            >
              <span className="sm:hidden">💬</span>
              <span className="hidden sm:inline">💬 MESSAGES</span>
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

        {/* Status */}
        {status && (
          <div className="mb-6 p-3 bg-zinc-900 border border-green-500/30 rounded-lg text-center">
            <span className="text-green-400 font-mono text-sm">{status}</span>
          </div>
        )}

        {/* Add New Contact - Admin Only */}
        {isAdmin && (
          <Card className="mb-6 bg-zinc-900 border-green-500/30">
            <CardHeader>
              <CardTitle className="text-green-400 font-mono">
                ➕ Add New Contact
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                <Input
                  placeholder="Name"
                  value={newContact.name}
                  onChange={(e) =>
                    setNewContact({ ...newContact, name: e.target.value })
                  }
                  className="bg-zinc-800 border-zinc-700 text-green-400 font-mono placeholder:text-zinc-500"
                />
                <Input
                  placeholder="Phone (+1234567890)"
                  value={newContact.phone}
                  onChange={(e) =>
                    setNewContact({ ...newContact, phone: e.target.value })
                  }
                  className="bg-zinc-800 border-zinc-700 text-green-400 font-mono placeholder:text-zinc-500"
                />
                <Input
                  placeholder="Email (optional)"
                  value={newContact.email}
                  onChange={(e) =>
                    setNewContact({ ...newContact, email: e.target.value })
                  }
                  className="bg-zinc-800 border-zinc-700 text-green-400 font-mono placeholder:text-zinc-500"
                />
                <Input
                  placeholder="Emoji"
                  value={newContact.emoji}
                  onChange={(e) =>
                    setNewContact({ ...newContact, emoji: e.target.value })
                  }
                  className="bg-zinc-800 border-zinc-700 text-green-400 font-mono placeholder:text-zinc-500"
                />
                <Button
                  onClick={addContact}
                  disabled={actionLoading}
                  className="bg-green-500 hover:bg-green-600 text-black font-mono font-bold"
                >
                  {actionLoading ? "ADDING..." : "ADD"}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Contacts Display */}
        {isAdmin ? (
          // Admin view - List with edit capabilities
          <Card className="bg-zinc-900 border-green-500/30">
            <CardHeader>
              <CardTitle className="text-green-400 font-mono">
                📝 Manage Contacts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {contacts.map((contact) => (
                  <div
                    key={contact.id}
                    className="p-4 bg-zinc-800 rounded-lg border border-zinc-700 hover:border-green-500/50 transition-colors"
                  >
                    {editingContact?.id === contact.id ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 items-center">
                        <Input
                          value={editingContact.name}
                          onChange={(e) =>
                            setEditingContact({
                              ...editingContact,
                              name: e.target.value,
                            })
                          }
                          className="bg-zinc-700 border-zinc-600 text-green-400 font-mono"
                        />
                        <Input
                          value={editingContact.phone}
                          onChange={(e) =>
                            setEditingContact({
                              ...editingContact,
                              phone: e.target.value,
                            })
                          }
                          className="bg-zinc-700 border-zinc-600 text-green-400 font-mono"
                        />
                        <Input
                          value={editingContact.email || ""}
                          onChange={(e) =>
                            setEditingContact({
                              ...editingContact,
                              email: e.target.value,
                            })
                          }
                          className="bg-zinc-700 border-zinc-600 text-green-400 font-mono"
                          placeholder="Email (optional)"
                        />
                        <Input
                          value={editingContact.emoji}
                          onChange={(e) =>
                            setEditingContact({
                              ...editingContact,
                              emoji: e.target.value,
                            })
                          }
                          className="bg-zinc-700 border-zinc-600 text-green-400 font-mono"
                        />
                        <div className="flex gap-2">
                          <Button
                            onClick={() => saveContact(editingContact)}
                            size="sm"
                            disabled={actionLoading}
                            className="bg-green-500 hover:bg-green-600 text-black font-mono"
                          >
                            {actionLoading ? "SAVING..." : "SAVE"}
                          </Button>
                          <Button
                            onClick={() => setEditingContact(null)}
                            size="sm"
                            variant="outline"
                            className="border-zinc-600 text-zinc-400 hover:bg-zinc-700 font-mono"
                          >
                            CANCEL
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{contact.emoji}</span>
                          <div>
                            <div className="font-bold text-green-400">
                              {contact.name}
                            </div>
                            <div className="text-sm text-green-400/70">
                              {contact.phone}
                            </div>
                            {contact.email && (
                              <div className="text-sm text-blue-400/70">
                                {contact.email}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex gap-1">
                            {contact.methods.map((method) => (
                              <Badge
                                key={method}
                                variant="outline"
                                className={`text-xs font-mono ${
                                  method === "sms"
                                    ? "border-green-500/50 text-green-400"
                                    : "border-blue-500/50 text-blue-400"
                                }`}
                              >
                                {method.toUpperCase()}
                              </Badge>
                            ))}
                          </div>
                          <Button
                            onClick={() => handleMessageContact(contact)}
                            size="sm"
                            className="bg-green-500 hover:bg-green-600 text-black font-mono text-xs"
                          >
                            MESSAGE
                          </Button>
                          <Button
                            onClick={() => setEditingContact(contact)}
                            size="sm"
                            variant="outline"
                            className="border-green-500/50 text-green-400 hover:bg-green-500/10 font-mono text-xs"
                          >
                            EDIT
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ) : (
          // User view - Card grid
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {contacts.map((contact) => (
              <Card
                key={contact.id}
                className="bg-zinc-900 border-green-500/30 hover:border-green-500/60 transition-all duration-300"
              >
                <CardContent className="p-4 sm:p-6">
                  <div className="text-center">
                    <div className="text-3xl sm:text-4xl mb-2 sm:mb-3">
                      {contact.emoji}
                    </div>
                    <h3 className="text-lg sm:text-xl font-bold text-green-400 mb-2">
                      {contact.name}
                    </h3>
                    <p className="text-green-400/70 text-xs sm:text-sm mb-3 sm:mb-4 font-mono">
                      {contact.phone
                        .replace("+1", "")
                        .replace(/(\d{3})(\d{3})(\d{4})/, "($1) $2-$3")}
                    </p>
                    <Button
                      onClick={() => handleMessageContact(contact)}
                      className="w-full bg-green-500 hover:bg-green-600 text-black font-mono font-bold text-sm py-2"
                    >
                      💬 MESSAGE
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {contacts.length === 0 && !loading && (
          <div className="text-center py-12">
            <div className="text-green-400/70">No approved contacts found</div>
          </div>
        )}
      </div>
    </div>
  );
}
