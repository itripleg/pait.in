// app/contacts/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Contact } from "@/types";

export default function ContactsPage() {
  const router = useRouter();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);

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

  const handleLogout = () => {
    document.cookie =
      "pait_auth=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    document.cookie =
      "pait_optin=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-black text-green-400 font-mono p-2 sm:p-4">
      <div className="max-w-4xl mx-auto">
        {/* Mobile-Friendly Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 sm:mb-6 pb-4 border-b border-green-500/30 space-y-3 sm:space-y-0">
          <h1 className="text-xl sm:text-2xl font-bold">👥 CONTACTS</h1>

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

        {loading ? (
          <div className="text-center py-12">
            <div className="text-green-400">Loading contacts...</div>
          </div>
        ) : (
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
