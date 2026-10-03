import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Send, Plus, MessageSquare, Mic, Bot, User } from "lucide-react";


interface Message {
  role: "user" | "ai";
  content: string;
}

const suggestedPrompts = [
  "Help me choose a course",
  "Explain UI/UX basics",
  "Create my learning roadmap",
  "Compare Design vs Coding",
];

const AIChatbot = () => {
  const [messages, setMessages] = useState<Message[]>([
    { role: "ai", content: "Hi! I'm your Slate Academy learning assistant. 👋 I can help you choose courses, explain concepts, or build a personalized learning roadmap. What would you like to explore?" },
  ]);
  const [input, setInput] = useState("");
  const [chats, setChats] = useState(["Today's Chat"]);
  const [activeChat, setActiveChat] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const sendMessage = (text: string) => {
    if (!text.trim()) return;
    setMessages((prev) => [...prev, { role: "user", content: text }]);
    setInput("");
    // Simulate AI response
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          content: getAIResponse(text),
        },
      ]);
    }, 800);
  };

  const getAIResponse = (text: string): string => {
    const lower = text.toLowerCase();
    if (lower.includes("choose") || lower.includes("course")) {
      return "Great question! Let me help you choose. What interests you most?\n\n**Design** – Perfect if you're creative and love visual problem-solving\n**Coding** – Great for logical thinkers who want to build products\n**Marketing** – Ideal if you enjoy strategy and communication\n**Data** – Best for analytical minds who love numbers\n\nWhich resonates with you?";
    }
    if (lower.includes("ux") || lower.includes("design")) {
      return "**UI/UX Design** is about creating products that are both beautiful and easy to use.\n\n• **UI** = How it looks (colors, typography, layout)\n• **UX** = How it works (user flows, research, testing)\n\nOur *UI/UX Design Fundamentals* course covers both in 8 weeks with hands-on Figma projects. Want me to tell you more?";
    }
    if (lower.includes("roadmap")) {
      return "Here's a suggested learning roadmap:\n\n1. **Week 1-2**: Foundations – Pick your track\n2. **Week 3-6**: Core skills – Deep dive into tools & concepts\n3. **Week 7-10**: Projects – Build 2-3 portfolio pieces\n4. **Week 11-12**: Career prep – Resume, portfolio, mock interviews\n\nWant me to customize this based on your background?";
    }
    return "That's a great question! I'd love to help you explore that topic further. Could you tell me a bit more about your background and what you're hoping to achieve? This will help me give you the most relevant advice.";
  };

  return (
    <div className="flex h-screen flex-col bg-background">
   
      <div className="flex flex-1 overflow-hidden">
        {sidebarOpen && (
          <div className="w-64 shrink-0 border-r border-border bg-card p-4 flex flex-col">
            <Button
              variant="outline"
              className="w-full justify-start gap-2 mb-4"
              onClick={() => {
                setChats((prev) => [...prev, `Chat ${prev.length + 1}`]);
                setActiveChat(chats.length);
                setMessages([{ role: "ai", content: "Hi! Starting a new conversation. How can I help you learn today?" }]);
              }}
            >
              <Plus className="h-4 w-4" /> New Chat
            </Button>
            <div className="flex-1 space-y-1 overflow-y-auto">
              {chats.map((chat, i) => (
                <button
                  key={i}
                  onClick={() => setActiveChat(i)}
                  className={`flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-sm transition-colors ${
                    activeChat === i ? "bg-accent text-[#0037FF] font-medium" : "text-muted-foreground hover:bg-accent/50"
                  }`}
                >
                  <MessageSquare className="h-4 w-4 shrink-0" />
                  <span className="truncate">{chat}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="flex flex-1 flex-col">
          <div className="flex items-center gap-2 border-b border-border px-4 py-3">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="rounded-md p-1.5 hover:bg-accent">
              <MessageSquare className="h-5 w-5 text-muted-foreground" />
            </button>
            <h2 className="font-semibold text-foreground">AI Learning Assistant</h2>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.map((msg, i) => (
              <div key={i} className={`flex gap-3 ${msg.role === "user" ? "justify-end" : ""}`}>
                {msg.role === "ai" && (
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg gradient-primary">
                    <Bot className="h-4 w-4 text-[#0037FF]-foreground" />
                  </div>
                )}
                <div className={`max-w-[600px] rounded-xl px-4 py-3 text-sm leading-relaxed ${
                  msg.role === "user"
                    ? "gradient-primary text-[#0037FF]-foreground"
                    : "bg-card border border-border text-foreground"
                }`}>
                  {msg.content.split("\n").map((line, j) => (
                    <p key={j} className={j > 0 ? "mt-2" : ""}>
                      {line.split("**").map((part, k) =>
                        k % 2 === 1 ? <strong key={k}>{part}</strong> : part
                      )}
                    </p>
                  ))}
                </div>
                {msg.role === "user" && (
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent">
                    <User className="h-4 w-4 text-[#0037FF]" />
                  </div>
                )}
              </div>
            ))}
          </div>

          {messages.length === 1 && (
            <div className="px-6 pb-2">
              <div className="flex flex-wrap gap-2">
                {suggestedPrompts.map((prompt) => (
                  <button
                    key={prompt}
                    onClick={() => sendMessage(prompt)}
                    className="rounded-lg border border-border bg-card px-4 py-2 text-sm text-foreground hover:bg-accent transition-colors"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="border-t border-border p-4">
            <div className="mx-auto flex max-w-3xl items-center gap-2">
              <div className="relative flex-1">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && sendMessage(input)}
                  className="h-12 w-full rounded-xl border border-input bg-card px-4 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="Ask me anything about learning..."
                />
                <button className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  <Mic className="h-5 w-5" />
                </button>
              </div>
              <Button
                variant="hero"
                size="icon"
                className="h-12 w-12 shrink-0"
                onClick={() => sendMessage(input)}
              >
                <Send className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIChatbot;
