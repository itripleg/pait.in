// app/mail/page.tsx - Email management for Paitin with real backend
"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import Link from "next/link";
import DOMPurify from "isomorphic-dompurify";

// Types
interface Message {
  id: string | number;
  content: string;
  direction: "incoming" | "outgoing";
  timestamp: string;
  from_number?: string;
  to_number?: string;
  contact_name?: string;
}

interface Contact {
  id: string;
  name: string;
  phone: string;
  email?: string;
  emoji?: string;
  approved: boolean;
  methods: ("sms" | "email")[];
}

interface User {
  id: string;
  name: string;
  role: string;
  emoji?: string;
}

// Icons
const BackIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
  </svg>
);

const InboxIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 13.5h3.86a2.25 2.25 0 012.012 1.244l.256.512a2.25 2.25 0 002.013 1.244h3.218a2.25 2.25 0 002.013-1.244l.256-.512a2.25 2.25 0 012.013-1.244h3.859m-19.5.338V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18v-4.162c0-.224-.034-.447-.1-.661L19.24 5.338a2.25 2.25 0 00-2.15-1.588H6.911a2.25 2.25 0 00-2.15 1.588L2.35 13.177a2.25 2.25 0 00-.1.661z" />
  </svg>
);

const SendIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
  </svg>
);

const RefreshIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
  </svg>
);

const MailOpenIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 9v.906a2.25 2.25 0 01-1.183 1.981l-6.478 3.488M2.25 9v.906a2.25 2.25 0 001.183 1.981l6.478 3.488m8.839 2.51l-4.66-2.51m0 0l-1.023-.55a2.25 2.25 0 00-2.134 0l-1.022.55m0 0l-4.661 2.51m16.5 1.615a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V8.844a2.25 2.25 0 011.183-1.98l7.5-4.04a2.25 2.25 0 012.134 0l7.5 4.04a2.25 2.25 0 011.183 1.98V19.5z" />
  </svg>
);

const CloseIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const LockIcon = () => (
  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
  </svg>
);

const LogoutIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
  </svg>
);

type Tab = "inbox" | "compose";

// Clean up email content for display - remove tracking URLs, hidden characters, etc.
function cleanEmailContent(content: string): string {
  if (!content) return "";

  let cleaned = content
    // Remove soft hyphens and zero-width characters
    .replace(/[\u00AD\u200B-\u200D\uFEFF]/g, "")
    // Remove sequences of whitespace characters used as spacers
    .replace(/[\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200A\u202F\u205F]+/g, " ")
    // Remove tracking URLs (long base64-encoded URLs)
    .replace(/https?:\/\/[^\s]*(?:qs=|click\.)[^\s]*/gi, "[link]")
    // Remove URLs longer than 100 characters (likely tracking)
    .replace(/https?:\/\/[^\s]{100,}/gi, "[link]")
    // Remove repeated whitespace
    .replace(/[ ]{3,}/g, " ")
    // Remove template variables like @productName, @productLink
    .replace(/@\w+/g, "")
    // Clean up multiple newlines
    .replace(/\n{3,}/g, "\n\n")
    // Remove lines that are just "[link]" repeated
    .replace(/(\[link\]\s*){2,}/g, "[link] ")
    // Trim
    .trim();

  return cleaned;
}

export default function MailPage() {
  const [mounted, setMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [activeTab, setActiveTab] = useState<Tab>("inbox");
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Auth state
  const [password, setPassword] = useState("");
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Compose state
  const [composeToEmail, setComposeToEmail] = useState("");
  const [composeToContact, setComposeToContact] = useState("");
  const [composeSubject, setComposeSubject] = useState("");
  const [composeBody, setComposeBody] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [sendSuccess, setSendSuccess] = useState<string | null>(null);

  // Read/unread tracking (stored in localStorage)
  const [readMessages, setReadMessages] = useState<Set<string | number>>(new Set());

  useEffect(() => {
    setMounted(true);
    checkAuth();
    // Load read messages from localStorage
    try {
      const stored = localStorage.getItem("pait_read_messages");
      if (stored) {
        setReadMessages(new Set(JSON.parse(stored)));
      }
    } catch (e) {
      console.error("Failed to load read messages:", e);
    }
  }, []);

  // Auto-refresh messages every 10 seconds when authenticated
  useEffect(() => {
    if (!user) return;

    const interval = setInterval(() => {
      fetchMessages();
    }, 10000);

    return () => clearInterval(interval);
  }, [user]);

  // Check authentication status
  const checkAuth = async () => {
    try {
      const res = await fetch("/api/auth");
      if (res.ok) {
        const data = await res.json();
        if (data.authenticated) {
          setUser(data.user);
          await Promise.all([fetchMessages(), fetchContacts()]);
        }
      }
    } catch (err) {
      console.error("Auth check failed:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAuthenticating(true);
    setAuthError(null);

    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setUser(data.user);
        setPassword("");
        await Promise.all([fetchMessages(), fetchContacts()]);
      } else {
        setAuthError(data.error || "Invalid password");
      }
    } catch (err) {
      setAuthError("Login failed. Please try again.");
    } finally {
      setIsAuthenticating(false);
    }
  };

  // Logout
  const handleLogout = () => {
    document.cookie = "pait_auth=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    document.cookie = "pait_user=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    setUser(null);
    setMessages([]);
    setContacts([]);
  };

  // Fetch messages
  const fetchMessages = async () => {
    try {
      const res = await fetch("/api/messages");
      if (res.ok) {
        const data = await res.json();
        setMessages(data.messages || []);
      } else if (res.status === 401) {
        setUser(null);
      }
    } catch (err) {
      console.error("Failed to fetch messages:", err);
      setError("Failed to load messages");
    }
  };

  // Fetch contacts
  const fetchContacts = async () => {
    try {
      const res = await fetch("/api/contacts");
      if (res.ok) {
        const data = await res.json();
        // Get contacts with email method
        const emailContacts = (data.contacts || []).filter(
          (c: Contact) => c.email && c.methods.includes("email") && c.approved
        );
        setContacts(emailContacts);
      }
    } catch (err) {
      console.error("Failed to fetch contacts:", err);
    }
  };

  const formatTimestamp = useCallback((timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 7) {
      return date.toLocaleDateString();
    } else if (diffDays > 0) {
      return `${diffDays}d ago`;
    } else if (diffHours > 0) {
      return `${diffHours}h ago`;
    } else {
      const diffMinutes = Math.floor(diffMs / (1000 * 60));
      return diffMinutes > 0 ? `${diffMinutes}m ago` : "Just now";
    }
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    setError(null);
    await fetchMessages();
    setIsRefreshing(false);
  };

  const handleSelectMessage = (message: Message) => {
    setSelectedMessage(message);
    // Mark as read
    if (!readMessages.has(message.id)) {
      const newReadMessages = new Set(readMessages);
      newReadMessages.add(message.id);
      setReadMessages(newReadMessages);
      // Persist to localStorage
      try {
        localStorage.setItem("pait_read_messages", JSON.stringify([...newReadMessages]));
      } catch (e) {
        console.error("Failed to save read messages:", e);
      }
    }
  };

  // Handle contact selection - auto-fill email
  const handleContactSelect = (contactName: string) => {
    setComposeToContact(contactName);
    if (contactName) {
      const contact = contacts.find((c) => c.name === contactName);
      if (contact?.email) {
        setComposeToEmail(contact.email);
      }
    } else {
      setComposeToEmail("");
    }
  };

  const handleSend = async () => {
    if (!composeToEmail || !composeBody) return;

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(composeToEmail)) {
      setError("Please enter a valid email address");
      return;
    }

    setIsSending(true);
    setError(null);
    setSendSuccess(null);

    try {
      const res = await fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          to: composeToEmail,
          subject: composeSubject,
          message: composeBody,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setSendSuccess(`Message sent to ${composeToEmail}!`);
        setComposeToEmail("");
        setComposeToContact("");
        setComposeSubject("");
        setComposeBody("");
        await fetchMessages();
        setTimeout(() => {
          setActiveTab("inbox");
          setSendSuccess(null);
        }, 2000);
      } else {
        setError(data.error || "Failed to send message");
      }
    } catch (err) {
      setError("Failed to send message. Please try again.");
    } finally {
      setIsSending(false);
    }
  };

  // Get contact info for a message
  const getContactForMessage = (message: Message): { name: string; initial: string } => {
    if (message.contact_name) {
      return {
        name: message.contact_name,
        initial: message.contact_name.charAt(0).toUpperCase(),
      };
    }
    const email = message.direction === "incoming" ? message.from_number : message.to_number;
    if (email) {
      const contact = contacts.find((c) => c.email === email);
      if (contact) {
        return { name: contact.name, initial: contact.name.charAt(0).toUpperCase() };
      }
      // Extract name from email
      const name = email.split("@")[0];
      return { name: email, initial: name.charAt(0).toUpperCase() };
    }
    return { name: "Unknown", initial: "?" };
  };

  // Filter to only show email messages (those with @ in from/to)
  const emailMessages = messages.filter(
    (m) => m.from_number?.includes("@") || m.to_number?.includes("@")
  );

  const incomingCount = emailMessages.filter((m) => m.direction === "incoming").length;

  if (!mounted) return null;

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          className="w-8 h-8 border-3 border-purple-300 border-t-purple-600 rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
      </div>
    );
  }

  // Login screen
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-sm"
        >
          <div className="glass-card rounded-3xl p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white shadow-lg shadow-purple-300/40">
              <LockIcon />
            </div>

            <h1 className="text-2xl font-semibold text-foreground mb-2">Welcome Back</h1>
            <p className="text-muted-foreground mb-8">Enter your password to access your mail</p>

            <form onSubmit={handleLogin} className="space-y-4">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Your password"
                className="w-full px-4 py-3 rounded-xl bg-white/50 border border-purple-200/50 text-foreground text-center placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-purple-400/50 transition-all"
                autoFocus
              />

              {authError && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-sm text-red-500"
                >
                  {authError}
                </motion.p>
              )}

              <button
                type="submit"
                disabled={!password || isAuthenticating}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-400 to-pink-400 text-white font-medium hover:from-purple-500 hover:to-pink-500 transition-all shadow-lg shadow-purple-300/30 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isAuthenticating ? (
                  <motion.span
                    className="inline-block w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  />
                ) : (
                  "Sign In"
                )}
              </button>
            </form>

            <Link
              href="/"
              className="inline-block mt-6 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Back to home
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  // Main mail interface
  return (
    <div className="min-h-screen">
      {/* Main Content */}
      <main className="pt-8 pb-24 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Navigation Bar */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between mb-6"
          >
            <Link
              href="/"
              className="flex items-center gap-2 text-purple-600 hover:text-purple-700 transition-colors"
            >
              <BackIcon />
              <span className="text-sm font-medium">Back</span>
            </Link>

            <div className="flex items-center gap-2">
              <motion.button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="p-2 rounded-xl hover:bg-purple-100/50 transition-colors text-purple-500 disabled:opacity-50"
                animate={isRefreshing ? { rotate: 360 } : {}}
                transition={{ duration: 1, repeat: isRefreshing ? Infinity : 0, ease: "linear" }}
                title="Refresh"
              >
                <RefreshIcon />
              </motion.button>
              <button
                onClick={handleLogout}
                className="p-2 rounded-xl hover:bg-purple-100/50 transition-colors text-muted-foreground hover:text-foreground"
                title="Sign out"
              >
                <LogoutIcon />
              </button>
            </div>
          </motion.div>
          {/* Error display */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 p-4 rounded-xl bg-red-100/80 text-red-700 text-sm"
            >
              {error}
              <button onClick={() => setError(null)} className="ml-2 font-medium">
                Dismiss
              </button>
            </motion.div>
          )}

          {/* Success display */}
          {sendSuccess && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 p-4 rounded-xl bg-green-100/80 text-green-700 text-sm"
            >
              {sendSuccess}
            </motion.div>
          )}

          {/* Tab Navigation */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex justify-center gap-2 mb-6"
          >
            <button
              onClick={() => setActiveTab("inbox")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all ${
                activeTab === "inbox"
                  ? "bg-gradient-to-r from-purple-400 to-pink-400 text-white shadow-lg shadow-purple-300/30"
                  : "glass-card text-muted-foreground hover:text-foreground"
              }`}
            >
              <InboxIcon />
              Inbox
              {(() => {
                const unreadCount = emailMessages.filter(
                  (m) => m.direction === "incoming" && !readMessages.has(m.id)
                ).length;
                return unreadCount > 0 ? (
                  <span className="px-2 py-0.5 text-xs rounded-full bg-white/20">
                    {unreadCount}
                  </span>
                ) : null;
              })()}
            </button>
            <button
              onClick={() => setActiveTab("compose")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all ${
                activeTab === "compose"
                  ? "bg-gradient-to-r from-purple-400 to-pink-400 text-white shadow-lg shadow-purple-300/30"
                  : "glass-card text-muted-foreground hover:text-foreground"
              }`}
            >
              <SendIcon />
              Compose
            </button>
          </motion.div>

          <AnimatePresence mode="wait">
            {activeTab === "inbox" ? (
              <motion.div
                key="inbox"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="flex gap-4 flex-col lg:flex-row"
              >
                {/* Message List */}
                <div className={`w-full ${selectedMessage ? "hidden lg:block lg:w-2/5" : ""}`}>
                  <div className="glass-card rounded-2xl overflow-hidden">
                    <div className="divide-y divide-purple-100/50 max-h-[70vh] overflow-y-auto">
                      {emailMessages.length === 0 ? (
                        <div className="p-12 text-center">
                          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-purple-100 flex items-center justify-center text-purple-400">
                            <MailOpenIcon />
                          </div>
                          <p className="text-muted-foreground">No emails yet</p>
                          <p className="text-sm text-muted-foreground/60 mt-2">
                            Send an email to get started!
                          </p>
                        </div>
                      ) : (
                        emailMessages.map((message, index) => {
                          const contact = getContactForMessage(message);
                          const isIncoming = message.direction === "incoming";
                          const isRead = readMessages.has(message.id);

                          return (
                            <motion.button
                              key={message.id}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: Math.min(index * 0.03, 0.3) }}
                              onClick={() => handleSelectMessage(message)}
                              className={`w-full p-4 text-left hover:bg-purple-50/50 transition-colors ${
                                selectedMessage?.id === message.id ? "bg-purple-100/50" : ""
                              } ${!isRead && isIncoming ? "bg-purple-50/30" : ""}`}
                            >
                              <div className="flex items-start gap-3">
                                {/* Unread indicator */}
                                <div className="flex items-center">
                                  {!isRead && isIncoming && (
                                    <div className="w-2 h-2 rounded-full bg-purple-500 mr-2" />
                                  )}
                                  <div
                                    className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-medium shrink-0 ${
                                      isIncoming
                                        ? "bg-gradient-to-br from-purple-400 to-pink-400"
                                        : "bg-gradient-to-br from-blue-400 to-cyan-400"
                                    }`}
                                  >
                                    {contact.initial}
                                  </div>
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center justify-between gap-2 mb-1">
                                    <span className={`truncate ${!isRead && isIncoming ? "font-semibold text-foreground" : "font-medium text-foreground"}`}>
                                      {isIncoming ? contact.name : `To: ${contact.name}`}
                                    </span>
                                    <span className="text-xs text-muted-foreground shrink-0">
                                      {formatTimestamp(message.timestamp)}
                                    </span>
                                  </div>
                                  <p className={`text-sm truncate ${!isRead && isIncoming ? "text-foreground/80" : "text-muted-foreground"}`}>
                                    {cleanEmailContent(message.content).substring(0, 60)}
                                    {cleanEmailContent(message.content).length > 60 && "..."}
                                  </p>
                                  <div className="mt-1">
                                    <span
                                      className={`inline-block px-2 py-0.5 text-xs rounded-full ${
                                        isIncoming
                                          ? "bg-purple-100 text-purple-600"
                                          : "bg-blue-100 text-blue-600"
                                      }`}
                                    >
                                      {isIncoming ? "Received" : "Sent"}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </motion.button>
                          );
                        })
                      )}
                    </div>
                  </div>
                </div>

                {/* Message Detail */}
                <AnimatePresence>
                  {selectedMessage && (
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className="w-full lg:w-3/5"
                    >
                      <div className="glass-card rounded-2xl overflow-hidden max-h-[70vh] flex flex-col">
                        {/* Message Header */}
                        <div className="p-4 border-b border-purple-100/50 shrink-0">
                          <div className="flex items-center justify-between mb-4">
                            <button
                              onClick={() => setSelectedMessage(null)}
                              className="lg:hidden p-2 -ml-2 rounded-xl hover:bg-purple-100/50 transition-colors text-purple-600"
                            >
                              <BackIcon />
                            </button>
                            <button
                              onClick={() => setSelectedMessage(null)}
                              className="hidden lg:block p-2 rounded-xl hover:bg-purple-100/50 transition-colors text-muted-foreground ml-auto"
                            >
                              <CloseIcon />
                            </button>
                          </div>

                          {(() => {
                            const contact = getContactForMessage(selectedMessage);
                            const isIncoming = selectedMessage.direction === "incoming";

                            return (
                              <>
                                <div className="flex items-start gap-3">
                                  <div
                                    className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold ${
                                      isIncoming
                                        ? "bg-gradient-to-br from-purple-400 to-pink-400"
                                        : "bg-gradient-to-br from-blue-400 to-cyan-400"
                                    }`}
                                  >
                                    {contact.initial}
                                  </div>
                                  <div>
                                    <h2 className="font-semibold text-foreground">
                                      {isIncoming ? contact.name : `To: ${contact.name}`}
                                    </h2>
                                    <p className="text-sm text-muted-foreground">
                                      {isIncoming
                                        ? selectedMessage.from_number
                                        : selectedMessage.to_number}
                                    </p>
                                  </div>
                                </div>

                                <div className="mt-4 flex items-center gap-3">
                                  <span
                                    className={`px-3 py-1 text-xs rounded-full ${
                                      isIncoming
                                        ? "bg-purple-100 text-purple-600"
                                        : "bg-blue-100 text-blue-600"
                                    }`}
                                  >
                                    {isIncoming ? "Received" : "Sent"}
                                  </span>
                                  <p className="text-sm text-muted-foreground">
                                    {new Date(selectedMessage.timestamp).toLocaleString()}
                                  </p>
                                </div>
                              </>
                            );
                          })()}
                        </div>

                        {/* Message Body */}
                        <div className="p-6 overflow-y-auto flex-1">
                          {selectedMessage.content.includes("<") &&
                           selectedMessage.content.includes(">") ? (
                            // Render as HTML if it looks like HTML
                            <div
                              className="text-foreground leading-relaxed prose prose-sm max-w-none prose-p:my-2 prose-a:text-purple-600"
                              dangerouslySetInnerHTML={{
                                __html: DOMPurify.sanitize(selectedMessage.content, {
                                  ALLOWED_TAGS: ['p', 'br', 'b', 'i', 'em', 'strong', 'a', 'ul', 'ol', 'li', 'span', 'div', 'h1', 'h2', 'h3', 'table', 'tr', 'td', 'th', 'tbody', 'thead'],
                                  ALLOWED_ATTR: ['href', 'style', 'class']
                                })
                              }}
                            />
                          ) : (
                            // Render as cleaned plain text
                            <div className="text-foreground leading-relaxed whitespace-pre-wrap break-words">
                              {cleanEmailContent(selectedMessage.content)}
                            </div>
                          )}
                        </div>

                        {/* Actions */}
                        {selectedMessage.direction === "incoming" && (
                          <div className="p-4 border-t border-purple-100/50 shrink-0">
                            <button
                              onClick={() => {
                                const replyTo = selectedMessage.from_number || "";
                                setComposeToEmail(replyTo);
                                setComposeToContact("");
                                setComposeSubject("");
                                setActiveTab("compose");
                                setSelectedMessage(null);
                              }}
                              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-purple-400 to-pink-400 text-white font-medium hover:from-purple-500 hover:to-pink-500 transition-all shadow-lg shadow-purple-300/30"
                            >
                              <SendIcon />
                              Reply
                            </button>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ) : (
              <motion.div
                key="compose"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <div className="glass-card rounded-2xl p-6">
                  <h2 className="text-xl font-semibold text-foreground mb-6">New Email</h2>

                  <div className="space-y-4">
                    {/* Quick contact selector (if contacts with email exist) */}
                    {contacts.length > 0 && (
                      <div>
                        <label className="block text-sm font-medium text-muted-foreground mb-2">
                          Quick Select
                        </label>
                        <select
                          value={composeToContact}
                          onChange={(e) => handleContactSelect(e.target.value)}
                          className="w-full px-4 py-3 rounded-xl bg-white/50 border border-purple-200/50 text-foreground focus:outline-none focus:ring-2 focus:ring-purple-400/50 transition-all"
                        >
                          <option value="">Choose a contact or type email below...</option>
                          {contacts.map((contact) => (
                            <option key={contact.id} value={contact.name}>
                              {contact.emoji} {contact.name} ({contact.email})
                            </option>
                          ))}
                        </select>
                      </div>
                    )}

                    <div>
                      <label className="block text-sm font-medium text-muted-foreground mb-2">
                        To (Email Address)
                      </label>
                      <input
                        type="email"
                        value={composeToEmail}
                        onChange={(e) => {
                          setComposeToEmail(e.target.value);
                          setComposeToContact(""); // Clear contact selection when typing
                        }}
                        placeholder="email@example.com"
                        className="w-full px-4 py-3 rounded-xl bg-white/50 border border-purple-200/50 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-purple-400/50 transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-muted-foreground mb-2">
                        Subject (optional)
                      </label>
                      <input
                        type="text"
                        value={composeSubject}
                        onChange={(e) => setComposeSubject(e.target.value)}
                        placeholder="What's this about?"
                        className="w-full px-4 py-3 rounded-xl bg-white/50 border border-purple-200/50 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-purple-400/50 transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-muted-foreground mb-2">
                        Message
                      </label>
                      <textarea
                        value={composeBody}
                        onChange={(e) => setComposeBody(e.target.value)}
                        placeholder="Write your message..."
                        rows={8}
                        className="w-full px-4 py-3 rounded-xl bg-white/50 border border-purple-200/50 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-purple-400/50 transition-all resize-none"
                      />
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                      <button
                        onClick={() => setActiveTab("inbox")}
                        className="px-6 py-3 rounded-xl text-muted-foreground hover:text-foreground hover:bg-purple-100/50 transition-all font-medium"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSend}
                        disabled={!composeToEmail || !composeBody || isSending}
                        className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-purple-400 to-pink-400 text-white font-medium hover:from-purple-500 hover:to-pink-500 transition-all shadow-lg shadow-purple-300/30 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isSending ? (
                          <>
                            <motion.div
                              className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                              animate={{ rotate: 360 }}
                              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            />
                            Sending...
                          </>
                        ) : (
                          <>
                            <SendIcon />
                            Send Email
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
