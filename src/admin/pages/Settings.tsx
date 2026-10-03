import { Shield, Building, Globe, Plug } from "lucide-react";
import AdminLayout from "../components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const roles = [
  { name: "Super Admin", count: 2, perms: "Full access" },
  { name: "Admin", count: 5, perms: "Manage students, courses, payments" },
  { name: "Teacher", count: 18, perms: "Assigned courses & students" },
  { name: "Student", count: 1284, perms: "Own profile & enrolled courses" },
];

const Settings = () => (
  <AdminLayout title="Settings" subtitle="Workspace, roles, branches, and integrations.">
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
      <div className="rounded-xl border border-border bg-card p-5 lg:col-span-2">
        <div className="flex items-center gap-2">
          <Building size={16} className="text-[#0037FF]" />
          <h3 className="text-sm font-semibold">Workspace</h3>
        </div>
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label className="text-xs font-medium">Academy Name</label>
            <Input className="mt-1 h-9" defaultValue="The Slate Academy" />
          </div>
          <div>
            <label className="text-xs font-medium">Default Currency</label>
            <Input className="mt-1 h-9" defaultValue="AED" />
          </div>
          <div>
            <label className="text-xs font-medium">Support Email</label>
            <Input className="mt-1 h-9" defaultValue="hello@slate.academy" />
          </div>
          <div>
            <label className="text-xs font-medium">Timezone</label>
            <Input className="mt-1 h-9" defaultValue="Asia/Dubai (GMT+4)" />
          </div>
        </div>
        <Button size="sm" className="mt-4">Save changes</Button>
      </div>

      <div className="rounded-xl border border-border bg-card p-5">
        <div className="flex items-center gap-2">
          <Globe size={16} className="text-[#0037FF]" />
          <h3 className="text-sm font-semibold">Branches</h3>
        </div>
        <ul className="mt-4 space-y-2 text-sm">
          {["Dubai HQ", "Abu Dhabi", "Sharjah", "Online (Global)"].map((b) => (
            <li key={b} className="flex items-center justify-between rounded-lg border border-border px-3 py-2">
              <span>{b}</span>
              <Button variant="ghost" size="sm">Manage</Button>
            </li>
          ))}
        </ul>
        <Button variant="outline" size="sm" className="mt-3 w-full">+ Add Branch</Button>
      </div>
    </div>

    <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
      <div className="rounded-xl border border-border bg-card p-5">
        <div className="flex items-center gap-2">
          <Shield size={16} className="text-[#0037FF]" />
          <h3 className="text-sm font-semibold">Roles & Permissions</h3>
        </div>
        <div className="mt-4 divide-y divide-border">
          {roles.map((r) => (
            <div key={r.name} className="flex items-center justify-between py-3">
              <div>
                <div className="text-sm font-medium">{r.name}</div>
                <div className="text-xs text-muted-foreground">{r.perms}</div>
              </div>
              <span className="rounded-full bg-secondary px-2 py-0.5 text-[11px] font-medium">{r.count} users</span>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card p-5">
        <div className="flex items-center gap-2">
          <Plug size={16} className="text-[#0037FF]" />
          <h3 className="text-sm font-semibold">Integrations</h3>
        </div>
        <ul className="mt-4 space-y-2">
          {[
            { name: "Zoom", connected: true },
            { name: "Google Meet", connected: false },
            { name: "WhatsApp Business", connected: false },
            { name: "Stripe", connected: false },
            { name: "Mailgun", connected: true },
          ].map((i) => (
            <li key={i.name} className="flex items-center justify-between rounded-lg border border-border px-3 py-2.5">
              <span className="text-sm font-medium">{i.name}</span>
              <Button variant={i.connected ? "outline" : "default"} size="sm">
                {i.connected ? "Connected" : "Connect"}
              </Button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  </AdminLayout>
);

export default Settings;
