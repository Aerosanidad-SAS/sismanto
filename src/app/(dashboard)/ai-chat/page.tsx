import { redirect } from "next/navigation";
import { getProfile } from "@/app/api/actions/auth";
import { ChatInterface } from "@/components/ai/ChatInterface";

export default async function AIChatPage() {
  const profile = await getProfile();
  if (!profile || !["ADMIN", "GERENCIAL"].includes(profile.role_codigo)) {
    redirect("/");
  }

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] max-h-[calc(100vh-4rem)] p-4 md:p-6">
      <div className="mb-4 flex-shrink-0">
        <h1 className="text-xl font-semibold">Chat IA</h1>
        <p className="text-sm text-muted-foreground">
          Consulta información de la flota y registra operaciones en lenguaje natural.
        </p>
      </div>
      <div className="flex-1 min-h-0">
        <ChatInterface />
      </div>
    </div>
  );
}
