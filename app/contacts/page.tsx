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
      const getPassword = () => {
        const cookies = document.cookie.split(";");
        const authCookie = cookies.find((cookie) =>
          cookie.trim().startsWith("pait_auth=")
        );
        return authCookie ? authCookie.split("=")[1] : "";
      };

      const password = getPassword();
      const response = await fetch(
        `/api/contacts?password=${encodeURIComponent(password)}`
      );

      if (response.ok) {
        const data = await response.json();
        setContacts(data.contacts);
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
    // Navigate to messaging with contact ID in URL
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
    <div className="min-h-screen bg-black text-green-400 font-mono p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6 pb-4 border-b border-green-500/30">
          <h1 className="text-2xl font-bold">👥 CONTACTS</h1>
          <div className="flex gap-2">
            <Button
              onClick={() => router.push("/messaging")}
              variant="outline"
              className="border-green-500/50 text-green-400 hover:bg-green-500/10 font-mono"
            >
              💬 MESSAGES
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

        {loading ? (
          <div className="text-center py-12">
            <div className="text-green-400">Loading contacts...</div>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {contacts.map((contact) => (
              <Card
                key={contact.id}
                className="bg-zinc-900 border-green-500/30 hover:border-green-500/60 transition-all duration-300"
              >
                <CardContent className="p-6">
                  <div className="text-center">
                    <div className="text-4xl mb-3">{contact.emoji}</div>
                    <h3 className="text-xl font-bold text-green-400 mb-2">
                      {contact.name}
                    </h3>
                    <p className="text-green-400/70 text-sm mb-4 font-mono">
                      {contact.phone
                        .replace("+1", "")
                        .replace(/(\d{3})(\d{3})(\d{4})/, "($1) $2-$3")}
                    </p>
                    <Button
                      onClick={() => handleMessageContact(contact)}
                      className="w-full bg-green-500 hover:bg-green-600 text-black font-mono font-bold"
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
