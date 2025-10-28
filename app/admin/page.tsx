// app/admin/page.tsx - Admin dashboard with contact management
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EnhancedContact } from "@/lib/contacts";

export default function AdminPage() {
  const router = useRouter();
  const [contacts, setContacts] = useState<EnhancedContact[]>([]);
  const [editingContact, setEditingContact] = useState<EnhancedContact | null>(
    null
  );
  const [newContact, setNewContact] = useState({
    name: "",
    phone: "",
    email: "",
    emoji: "👤",
  });
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");

  useEffect(() => {
    checkAdminAccess();
    fetchContacts();
  }, []);

  const checkAdminAccess = async () => {
    try {
      const response = await fetch("/api/auth");
      if (response.ok) {
        const data = await response.json();
        if (data.user?.role !== "admin") {
          router.push("/");
        }
      } else {
        router.push("/login?redirect=/admin");
      }
    } catch (error) {
      router.push("/login?redirect=/admin");
    }
  };

  const fetchContacts = async () => {
    try {
      const response = await fetch("/api/contacts");
      if (response.ok) {
        const data = await response.json();
        setContacts(data.contacts);
      }
    } catch (error) {
      console.error("Failed to fetch contacts:", error);
    }
  };

  const saveContact = async (contact: EnhancedContact) => {
    setLoading(true);
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
      setLoading(false);
    }
  };

  const addContact = async () => {
    if (!newContact.name || !newContact.phone) {
      setStatus("Name and phone are required");
      return;
    }

    setLoading(true);
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
      setLoading(false);
    }
  };

  const handleLogout = () => {
    document.cookie =
      "pait_auth=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    document.cookie =
      "pait_user=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    // Clear splash flag so user sees splash on next visit
    sessionStorage.removeItem("splash_shown");
    // Force full page reload to clear all React state
    window.location.href = "/";
  };

  return (
    <div className="min-h-screen bg-black text-primary font-mono p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 pb-4 border-b border-primary/30">
          <div>
            <h1 className="text-2xl font-bold">⚙️ ADMIN DASHBOARD</h1>
            <p className="text-primary/70 text-sm">
              Contact Management & System Administration
            </p>
          </div>
          <div className="flex gap-2 mt-3 sm:mt-0">
            <Button
              onClick={() => router.push("/messaging")}
              variant="outline"
              className="border-primary/50 text-primary hover:bg-primary/10 font-mono text-xs"
            >
              💬 MESSAGES
            </Button>
            <Button
              onClick={() => router.push("/")}
              variant="outline"
              className="border-primary/50 text-primary hover:bg-primary/10 font-mono text-xs"
            >
              🏠 HOME
            </Button>
            <Button
              onClick={handleLogout}
              variant="destructive"
              className="font-mono text-xs"
            >
              LOGOUT
            </Button>
          </div>
        </div>

        {/* Status */}
        {status && (
          <div className="mb-6 p-3 bg-zinc-900 border border-primary/30 rounded-lg text-center">
            <span className="text-muted-foreground font-mono text-sm">{status}</span>
          </div>
        )}

        {/* Add New Contact */}
        <Card className="mb-6 bg-zinc-900 border-primary/30">
          <CardHeader>
            <CardTitle className="text-primary font-mono">
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
                className="bg-zinc-800 border-zinc-700 text-primary font-mono placeholder:text-muted-foreground"
              />
              <Input
                placeholder="Phone (+1234567890)"
                value={newContact.phone}
                onChange={(e) =>
                  setNewContact({ ...newContact, phone: e.target.value })
                }
                className="bg-zinc-800 border-zinc-700 text-primary font-mono placeholder:text-muted-foreground"
              />
              <Input
                placeholder="Email (optional)"
                value={newContact.email}
                onChange={(e) =>
                  setNewContact({ ...newContact, email: e.target.value })
                }
                className="bg-zinc-800 border-zinc-700 text-primary font-mono placeholder:text-muted-foreground"
              />
              <Input
                placeholder="Emoji"
                value={newContact.emoji}
                onChange={(e) =>
                  setNewContact({ ...newContact, emoji: e.target.value })
                }
                className="bg-zinc-800 border-zinc-700 text-primary font-mono placeholder:text-muted-foreground"
              />
              <Button
                onClick={addContact}
                disabled={loading}
                className="bg-primary hover:bg-primary/90 text-black font-mono font-bold"
              >
                {loading ? "ADDING..." : "ADD"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Contacts List */}
        <Card className="bg-zinc-900 border-primary/30">
          <CardHeader>
            <CardTitle className="text-primary font-mono">
              👥 Manage Contacts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {contacts.map((contact) => (
                <div
                  key={contact.id}
                  className="p-4 bg-zinc-800 rounded-lg border border-zinc-700 hover:border-primary/50 transition-colors"
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
                        className="bg-zinc-700 border-zinc-600 text-primary font-mono"
                      />
                      <Input
                        value={editingContact.phone}
                        onChange={(e) =>
                          setEditingContact({
                            ...editingContact,
                            phone: e.target.value,
                          })
                        }
                        className="bg-zinc-700 border-zinc-600 text-primary font-mono"
                      />
                      <Input
                        value={editingContact.email || ""}
                        onChange={(e) =>
                          setEditingContact({
                            ...editingContact,
                            email: e.target.value,
                          })
                        }
                        className="bg-zinc-700 border-zinc-600 text-primary font-mono placeholder:text-muted-foreground"
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
                        className="bg-zinc-700 border-zinc-600 text-primary font-mono"
                      />
                      <div className="flex gap-2">
                        <Button
                          onClick={() => saveContact(editingContact)}
                          size="sm"
                          className="bg-primary hover:bg-primary/90 text-black font-mono"
                        >
                          SAVE
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
                          <div className="font-bold text-primary">
                            {contact.name}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {contact.phone}
                          </div>
                          {contact.email && (
                            <div className="text-sm text-muted-foreground/70">
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
                                  ? "border-primary/50 text-primary"
                                  : "border-blue-500/50 text-blue-400"
                              }`}
                            >
                              {method.toUpperCase()}
                            </Badge>
                          ))}
                        </div>
                        <Button
                          onClick={() => setEditingContact(contact)}
                          size="sm"
                          variant="outline"
                          className="border-primary/50 text-primary hover:bg-primary/10 font-mono text-xs"
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
      </div>
    </div>
  );
}
