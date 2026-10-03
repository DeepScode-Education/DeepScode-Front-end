import { useState } from "react";
import { Calendar, AtSign, Bell } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { X } from "lucide-react";
import SegmentedControl from "../components/SegmentedControl";
import { SettingsData } from "../types";
import { StepErrors } from "../validation";

interface StepSettingsProps {
  data: SettingsData;
  errors: StepErrors;
  update: (patch: Partial<SettingsData>) => void;
}

const StepSettings = ({ data, errors, update }: StepSettingsProps) => {
  const [draftRecipient, setDraftRecipient] = useState("");

  const addRecipient = () => {
    const v = draftRecipient.trim();
    if (v && !data.alertRecipients.includes(v)) {
      update({ alertRecipients: [...data.alertRecipients, v] });
    }
    setDraftRecipient("");
  };

  return (
    <div>
      <h1 className="text-2xl font-bold">Configuration</h1>
      <p className="mt-1 text-sm text-muted-foreground">Set application process parameters and notifications.</p>

      <div className="mt-6 grid grid-cols-2 gap-5">
        <div className="rounded-xl border border-border bg-card p-6">
          <div className="mb-4 flex items-center gap-2 text-base font-semibold">
            <Calendar size={16} className="text-[#0037FF]" /> Timeline & Capacity
          </div>
          <div className="space-y-5">
            <div>
              <Label>
                Application Deadline <span className="text-destructive">*</span>
              </Label>
              <Input
                className="mt-1.5"
                type="datetime-local"
                value={data.applicationDeadline}
                onChange={(e) => update({ applicationDeadline: e.target.value })}
              />
              {errors.applicationDeadline && (
                <p className="mt-1 text-xs text-destructive">{errors.applicationDeadline}</p>
              )}
            </div>
            <div>
              <Label>Application Limit</Label>
              <Input
                className="mt-1.5"
                type="number"
                placeholder="e.g. 50"
                value={data.applicationLimit}
                onChange={(e) => update({ applicationLimit: e.target.value })}
              />
              <p className="mt-1 text-xs text-muted-foreground">Leave blank for unlimited.</p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-6">
          <div className="mb-4 flex items-center gap-2 text-base font-semibold">
            <AtSign size={16} className="text-[#0037FF]" /> Access & Screening
          </div>
          <div className="space-y-5">
            <div>
              <p className="mb-1 text-sm font-medium">Visibility</p>
              <p className="mb-2 text-xs text-muted-foreground">Who can see this job posting?</p>
              <SegmentedControl
                value={data.visibility}
                onChange={(v) => update({ visibility: v as SettingsData["visibility"] })}
                options={[
                  { value: "Internal", label: "Internal" },
                  { value: "Public", label: "Public" },
                ]}
              />
            </div>
            <div className="flex items-center justify-between border-t border-border pt-4">
              <div>
                <p className="text-sm font-medium">Auto-screening</p>
                <p className="text-xs text-muted-foreground">Automatically filter candidates based on eligibility.</p>
              </div>
              <Switch checked={data.autoScreening} onCheckedChange={(v) => update({ autoScreening: v })} />
            </div>
          </div>
        </div>

        <div className="col-span-2 rounded-xl border border-border bg-card p-6">
          <div className="mb-4 flex items-center gap-2 text-base font-semibold">
            <Bell size={16} className="text-[#0037FF]" /> Notification Preferences
          </div>
          <p className="mb-2 text-sm font-medium">Alert Recipients</p>
          <div className="mb-3 flex flex-wrap gap-2">
            {data.alertRecipients.map((recipient) => (
              <Badge key={recipient} className="gap-1.5 bg-[#0037FF] pr-1.5 hover:bg-[#0037FF]">
                {recipient}
                <button
                  type="button"
                  onClick={() => update({ alertRecipients: data.alertRecipients.filter((r) => r !== recipient) })}
                  className="opacity-80 hover:opacity-100"
                >
                  <X size={12} />
                </button>
              </Badge>
            ))}
          </div>
          <div className="flex gap-2">
            <Input
              className="flex-1"
              placeholder="Add email or team name..."
              value={draftRecipient}
              onChange={(e) => setDraftRecipient(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addRecipient())}
            />
            <Button variant="outline" size="sm" onClick={addRecipient}>
              Add
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StepSettings;
