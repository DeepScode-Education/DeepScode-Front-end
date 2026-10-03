import { Mail, MessageCircle, Send } from "lucide-react";
import AdminLayout from "../components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const automations = [
  { name: "Trial Reminder", channel: "Email", trigger: "24h before trial", status: "Active" },
  { name: "Follow-up after Trial", channel: "WhatsApp", trigger: "2h after trial", status: "Active" },
  { name: "Payment Reminder", channel: "Email", trigger: "3d before due", status: "Paused" },
  { name: "Welcome Series", channel: "Email", trigger: "On enrollment", status: "Active" },
];

const Communication = () => (
  <AdminLayout
    title="Communication"
    subtitle="Email automations, WhatsApp notifications, and chat."
  >
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
      <div className="rounded-xl border border-border bg-card p-5 lg:col-span-2">
        <h3 className="text-sm font-semibold">Automations</h3>
        <div className="mt-4 space-y-2">
          {automations.map((a) => (
            <div key={a.name} className="flex items-center gap-3 rounded-lg border border-border p-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent text-[#0037FF]">
                {a.channel === "Email" ? <Mail size={15} /> : <MessageCircle size={15} />}
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-medium">{a.name}</div>
                <div className="text-xs text-muted-foreground">{a.channel} • {a.trigger}</div>
              </div>
              <span className={`text-[11px] font-medium ${a.status === "Active" ? "text-emerald-600" : "text-muted-foreground"}`}>
                {a.status}
              </span>
              <Button variant="ghost" size="sm">Edit</Button>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-col rounded-xl border border-border bg-card">
        <div className="border-b border-border p-4">
          <h3 className="text-sm font-semibold">Internal Chat</h3>
          <p className="text-xs text-muted-foreground">Dr. Anjali Rao · Aarav Mehta</p>
        </div>
        <div className="flex-1 space-y-3 overflow-y-auto p-4 text-sm">
          <div className="max-w-[80%] rounded-2xl rounded-bl-md bg-secondary px-3 py-2 text-sm">
            Aarav, please submit yesterday's worksheet by 8 PM.
          </div>
          <div className="ml-auto max-w-[80%] rounded-2xl rounded-br-md bg-[#0037FF] px-3 py-2 text-sm text-[#0037FF]-foreground">
            Yes ma'am, uploading shortly!
          </div>
          <div className="max-w-[80%] rounded-2xl rounded-bl-md bg-secondary px-3 py-2 text-sm">
            Great. Let me know if you need help with Q4.
          </div>
        </div>
        <div className="flex items-center gap-2 border-t border-border p-3">
          <Input placeholder="Type a message…" className="h-9" />
          <Button size="icon" className="h-9 w-9"><Send size={14} /></Button>
        </div>
      </div>
    </div>
  </AdminLayout>
);

export default Communication;
