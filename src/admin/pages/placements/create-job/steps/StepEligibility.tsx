import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { EligibilityData } from "../types";
import { StepErrors } from "../validation";

interface StepEligibilityProps {
  data: EligibilityData;
  errors: StepErrors;
  update: (patch: Partial<EligibilityData>) => void;
}

const StepEligibility = ({ data, errors, update }: StepEligibilityProps) => (
  <div>
    <h1 className="text-2xl font-bold">Eligibility</h1>
    <p className="mt-1 text-sm text-muted-foreground">Set the experience, education, and candidate requirements for this role.</p>

    <div className="mt-6 space-y-6 rounded-xl border border-border bg-card p-6">
      <div className="grid grid-cols-2 gap-5">
        <div>
          <Label>
            Experience Level <span className="text-destructive">*</span>
          </Label>
          <Select value={data.experienceLevel} onValueChange={(v) => update({ experienceLevel: v })}>
            <SelectTrigger className="mt-1.5">
              <SelectValue placeholder="Select level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Entry-level (0-2 years)">Entry-level (0-2 years)</SelectItem>
              <SelectItem value="Mid-level (2-5 years)">Mid-level (2-5 years)</SelectItem>
              <SelectItem value="Senior (5-8 years)">Senior (5-8 years)</SelectItem>
              <SelectItem value="Lead / Principal (8+ years)">Lead / Principal (8+ years)</SelectItem>
            </SelectContent>
          </Select>
          {errors.experienceLevel && <p className="mt-1 text-xs text-destructive">{errors.experienceLevel}</p>}
        </div>
        <div>
          <Label>Minimum Years of Experience</Label>
          <Input
            className="mt-1.5"
            type="number"
            min={0}
            placeholder="e.g. 5"
            value={data.minYears}
            onChange={(e) => update({ minYears: e.target.value })}
          />
        </div>
      </div>

      <div>
        <Label>
          Education Requirement <span className="text-destructive">*</span>
        </Label>
        <Select value={data.education} onValueChange={(v) => update({ education: v })}>
          <SelectTrigger className="mt-1.5">
            <SelectValue placeholder="Select requirement" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="No formal requirement">No formal requirement</SelectItem>
            <SelectItem value="Bachelor's Degree">Bachelor's Degree</SelectItem>
            <SelectItem value="Master's Degree">Master's Degree</SelectItem>
            <SelectItem value="PhD">PhD</SelectItem>
          </SelectContent>
        </Select>
        {errors.education && <p className="mt-1 text-xs text-destructive">{errors.education}</p>}
      </div>

      <div>
        <Label>Candidate Eligibility Notes</Label>
        <Textarea
          className="mt-1.5 h-24"
          placeholder="e.g. Must be authorized to work in the US. Open to sponsoring visas for exceptional candidates..."
          value={data.notes}
          onChange={(e) => update({ notes: e.target.value })}
        />
      </div>

      <div className="border-t border-border pt-5">
        <p className="mb-3 text-sm font-semibold">Additional Requirements</p>
        <div className="space-y-2.5">
          <label className="flex items-center gap-2 text-sm">
            <Checkbox
              checked={data.workAuthRequired}
              onCheckedChange={(v) => update({ workAuthRequired: Boolean(v) })}
            />
            Requires existing work authorization
          </label>
          <label className="flex items-center gap-2 text-sm">
            <Checkbox checked={data.backgroundCheck} onCheckedChange={(v) => update({ backgroundCheck: Boolean(v) })} />
            Background check required
          </label>
        </div>
      </div>
    </div>
  </div>
);

export default StepEligibility;
