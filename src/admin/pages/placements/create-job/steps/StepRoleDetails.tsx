import { Briefcase, Building2, PanelsTopLeft } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import SegmentedControl from "../components/SegmentedControl";
import TagInput from "../components/TagInput";
import { RoleDetailsData } from "../types";
import { StepErrors } from "../validation";

interface StepRoleDetailsProps {
  data: RoleDetailsData;
  errors: StepErrors;
  update: (patch: Partial<RoleDetailsData>) => void;
}

const StepRoleDetails = ({ data, errors, update }: StepRoleDetailsProps) => (
  <div>
    <h1 className="text-2xl font-bold">Role Details</h1>
    <p className="mt-1 text-sm text-muted-foreground">Define the specific requirements and responsibilities for this position.</p>

    <div className="mt-6 space-y-6 rounded-xl border border-border bg-card p-6">
      <div>
        <div className="mb-4 flex items-center gap-2 text-base font-semibold">
          <Briefcase size={16} className="text-[#0037FF]" /> Core Information
        </div>
        <div className="space-y-5">
          <div>
            <Label>
              Job Title <span className="text-destructive">*</span>
            </Label>
            <Input
              className="mt-1.5"
              placeholder="e.g. Senior Frontend Engineer"
              value={data.jobTitle}
              onChange={(e) => update({ jobTitle: e.target.value })}
            />
            {errors.jobTitle && <p className="mt-1 text-xs text-destructive">{errors.jobTitle}</p>}
          </div>

          <div className="grid grid-cols-2 gap-5">
            <div>
              <Label>
                Department / Category <span className="text-destructive">*</span>
              </Label>
              <Select value={data.category} onValueChange={(v) => update({ category: v })}>
                <SelectTrigger className="mt-1.5">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Engineering">Engineering</SelectItem>
                  <SelectItem value="Design">Design</SelectItem>
                  <SelectItem value="Product">Product</SelectItem>
                  <SelectItem value="Marketing">Marketing</SelectItem>
                  <SelectItem value="Sales">Sales</SelectItem>
                </SelectContent>
              </Select>
              {errors.category && <p className="mt-1 text-xs text-destructive">{errors.category}</p>}
            </div>
            <div>
              <Label>
                Employment Type <span className="text-destructive">*</span>
              </Label>
              <Select value={data.employmentType} onValueChange={(v) => update({ employmentType: v })}>
                <SelectTrigger className="mt-1.5">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Full-time">Full-time</SelectItem>
                  <SelectItem value="Part-time">Part-time</SelectItem>
                  <SelectItem value="Contract">Contract</SelectItem>
                  <SelectItem value="Internship">Internship</SelectItem>
                </SelectContent>
              </Select>
              {errors.employmentType && <p className="mt-1 text-xs text-destructive">{errors.employmentType}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-5">
            <div>
              <Label>
                Work Mode <span className="text-destructive">*</span>
              </Label>
              <div className="mt-1.5">
                <SegmentedControl
                  value={data.workMode}
                  onChange={(v) => update({ workMode: v as RoleDetailsData["workMode"] })}
                  options={[
                    { value: "On-site", label: "On-site", icon: Building2 },
                    { value: "Hybrid", label: "Hybrid", icon: PanelsTopLeft },
                    { value: "Remote", label: "Remote" },
                  ]}
                />
              </div>
            </div>
            <div>
              <Label>Number of Openings</Label>
              <Input
                className="mt-1.5"
                type="number"
                min={1}
                value={data.openings}
                onChange={(e) => update({ openings: e.target.value })}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-border pt-6">
        <p className="mb-4 text-base font-semibold">Description & Responsibilities</p>
        <div className="space-y-5">
          <div>
            <Label>
              Job Description <span className="text-destructive">*</span>
            </Label>
            <Textarea
              className="mt-1.5 h-28"
              placeholder="Provide a high-level overview of the role..."
              value={data.description}
              onChange={(e) => update({ description: e.target.value })}
            />
            {errors.description && <p className="mt-1 text-xs text-destructive">{errors.description}</p>}
          </div>
          <div>
            <Label>
              Key Responsibilities <span className="text-destructive">*</span>
            </Label>
            <Textarea
              className="mt-1.5 h-28"
              placeholder="List the day-to-day responsibilities..."
              value={data.responsibilities}
              onChange={(e) => update({ responsibilities: e.target.value })}
            />
            {errors.responsibilities && <p className="mt-1 text-xs text-destructive">{errors.responsibilities}</p>}
          </div>
        </div>
      </div>

      <div className="border-t border-border pt-6">
        <p className="mb-4 text-base font-semibold">Skills & Qualifications</p>
        <div className="space-y-5">
          <div>
            <Label>
              Required Skills <span className="text-destructive">*</span>
            </Label>
            <div className="mt-1.5">
              <TagInput
                values={data.requiredSkills}
                onChange={(v) => update({ requiredSkills: v })}
                placeholder="Type and press enter..."
              />
            </div>
            {errors.requiredSkills && <p className="mt-1 text-xs text-destructive">{errors.requiredSkills}</p>}
          </div>
          <div>
            <Label>Nice-to-have Skills</Label>
            <div className="mt-1.5">
              <TagInput
                values={data.niceToHaveSkills}
                onChange={(v) => update({ niceToHaveSkills: v })}
                placeholder="Type and press enter..."
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default StepRoleDetails;
