"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Bot, User, Send, Loader2, Trash2 } from "lucide-react";

type Message = {
  role: "user" | "assistant";
  content: string;
};

type ApiMessage = {
  role: "user" | "assistant";
  content: string;
};

export function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;

    const userMsg: Message = { role: "user", content: text };
    const updated = [...messages, userMsg];
    setMessages(updated);
    setInput("");
    setError(null);
    setLoading(true);

    try {
      const apiMessages: ApiMessage[] = updated.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: apiMessages }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Error al conectar con el asistente IA");
        setMessages(updated);
        return;
      }

      setMessages([...updated, { role: "assistant", content: data.content }]);
    } catch {
      setError("Error de conexión. Inténtalo de nuevo.");
      setMessages(updated);
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto pr-2">
        <div className="space-y-4 pb-4">
          {messages.length === 0 && (
            <div className="text-center text-muted-foreground py-12 space-y-3">
              <Bot className="w-12 h-12 mx-auto opacity-30" />
              <p className="text-sm font-medium">Asistente de Flota Aeromanto</p>
              <p className="text-xs max-w-sm mx-auto">
                Puedes preguntarme sobre novedades, mantenimientos o combustible, o pedirme que registre un mantenimiento.
              </p>
              <div className="flex flex-wrap gap-2 justify-center pt-2">
                {[
                  "¿Cuáles son las novedades abiertas?",
                  "Tráeme los últimos mantenimientos",
                  "¿Qué vehículos están fuera de servicio?",
                  "Novedades de alta severidad este mes",
                ].map((hint) => (
                  <button
                    key={hint}
                    onClick={() => setInput(hint)}
                    className="text-xs px-3 py-1.5 rounded-full border border-dashed hover:bg-muted transition-colors text-left"
                  >
                    {hint}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              {msg.role === "assistant" && (
                <div className="w-7 h-7 rounded-full bg-[#2BB6C7]/15 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Bot className="w-4 h-4 text-[#2BB6C7]" />
                </div>
              )}
              <div
                className={`rounded-xl px-4 py-3 max-w-[85%] text-sm ${
                  msg.role === "user"
                    ? "bg-[#2BB6C7] text-white"
                    : "bg-muted/70 text-foreground"
                }`}
              >
                <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
              </div>
              {msg.role === "user" && (
                <div className="w-7 h-7 rounded-full bg-[#2BB6C7] flex items-center justify-center flex-shrink-0 mt-0.5">
                  <User className="w-4 h-4 text-white" />
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex gap-3 justify-start">
              <div className="w-7 h-7 rounded-full bg-[#2BB6C7]/15 flex items-center justify-center flex-shrink-0">
                <Bot className="w-4 h-4 text-[#2BB6C7]" />
              </div>
              <div className="bg-muted/70 rounded-xl px-4 py-3 flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Consultando flota…
              </div>
            </div>
          )}

          {error && (
            <div className="text-center">
              <Badge variant="destructive" className="text-xs">{error}</Badge>
            </div>
          )}

          <div ref={bottomRef} />
        </div>
      </div>

      {/* Input */}
      <div className="border-t pt-3 space-y-2">
        {messages.length > 0 && (
          <div className="flex justify-end">
            <button
              onClick={() => { setMessages([]); setError(null); }}
              className="text-xs text-muted-foreground hover:text-destructive flex items-center gap-1 transition-colors"
            >
              <Trash2 className="w-3 h-3" />
              Limpiar conversación
            </button>
          </div>
        )}
        <div className="flex gap-2 items-end">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Escribe tu consulta… (Enter para enviar, Shift+Enter para nueva línea)"
            className="resize-none min-h-[52px] max-h-32 text-sm"
            disabled={loading}
            rows={2}
          />
          <Button
            onClick={send}
            disabled={!input.trim() || loading}
            size="icon"
            className="h-[52px] w-[52px] bg-[#2BB6C7] hover:bg-[#2BB6C7]/90 flex-shrink-0"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </Button>
        </div>
        <p className="text-[10px] text-muted-foreground text-center">
          IA puede cometer errores. Verifica información crítica antes de actuar.
        </p>
      </div>
    </div>
  );
}
