import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import SegmentedControl from "../components/SegmentedControl";
import { CompensationData } from "../types";
import { StepErrors } from "../validation";

interface StepCompensationProps {
  data: CompensationData;
  errors: StepErrors;
  update: (patch: Partial<CompensationData>) => void;
}

const BENEFITS = ["Health Insurance", "401k Matching", "Vision & Dental", "Remote Work Stipend"];

const StepCompensation = ({ data, errors, update }: StepCompensationProps) => {
  const toggleBenefit = (benefit: string) => {
    update({
      benefits: data.benefits.includes(benefit)
        ? data.benefits.filter((b) => b !== benefit)
        : [...data.benefits, benefit],
    });
  };

  return (
    <div>
      <h1 className="text-2xl font-bold">Define Compensation</h1>
      <p className="mt-1 text-sm text-muted-foreground">Specify the pay structure, ranges, and benefits for this position.</p>

      <div className="mt-6 space-y-6 rounded-xl border border-border bg-card p-6">
        <div className="grid grid-cols-2 gap-5">
          <div>
            <Label>
              Compensation Type <span className="text-destructive">*</span>
            </Label>
            <Select value={data.compensationType} onValueChange={(v) => update({ compensationType: v })}>
              <SelectTrigger className="mt-1.5">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Salary">Salary</SelectItem>
                <SelectItem value="Hourly">Hourly</SelectItem>
                <SelectItem value="Contract / Project-based">Contract / Project-based</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>
              Currency <span className="text-destructive">*</span>
            </Label>
            <Select value={data.currency} onValueChange={(v) => update({ currency: v })}>
              <SelectTrigger className="mt-1.5">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="USD ($)">USD ($)</SelectItem>
                <SelectItem value="EUR (€)">EUR (€)</SelectItem>
                <SelectItem value="GBP (£)">GBP (£)</SelectItem>
                <SelectItem value="INR (₹)">INR (₹)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="border-t border-border pt-6">
          <p className="mb-3 text-sm font-semibold">Pay Range</p>
          <div className="grid grid-cols-3 gap-5">
            <div>
              <Label>
                Minimum <span className="text-destructive">*</span>
              </Label>
              <Input
                className="mt-1.5"
                placeholder="$ 65,000"
                value={data.payMin}
                onChange={(e) => update({ payMin: e.target.value })}
              />
              {errors.payMin && <p className="mt-1 text-xs text-destructive">{errors.payMin}</p>}
            </div>
            <div>
              <Label>
                Maximum <span className="text-destructive">*</span>
              </Label>
              <Input
                className="mt-1.5"
                placeholder="$ 85,000"
                value={data.payMax}
                onChange={(e) => update({ payMax: e.target.value })}
              />
              {errors.payMax && <p className="mt-1 text-xs text-destructive">{errors.payMax}</p>}
            </div>
            <div>
              <Label>Pay Period</Label>
              <div className="mt-1.5">
                <SegmentedControl
                  value={data.payPeriod}
                  onChange={(v) => update({ payPeriod: v as CompensationData["payPeriod"] })}
                  options={[
                    { value: "Annual", label: "Annual" },
                    { value: "Monthly", label: "Monthly" },
                  ]}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6 border-t border-border pt-6">
          <div>
            <p className="mb-3 text-sm font-semibold">Benefits</p>
            <div className="space-y-2.5">
              {BENEFITS.map((benefit) => (
                <label key={benefit} className="flex items-center gap-2 text-sm">
                  <Checkbox checked={data.benefits.includes(benefit)} onCheckedChange={() => toggleBenefit(benefit)} />
                  {benefit}
                </label>
              ))}
            </div>
          </div>

          <div>
            <p className="mb-3 text-sm font-semibold">Incentives</p>
            <div className="space-y-3">
              <div>
                <label className="flex items-center gap-2 text-sm">
                  <Checkbox
                    checked={data.performanceBonus}
                    onCheckedChange={(v) => update({ performanceBonus: Boolean(v) })}
                  />
                  Performance Bonus
                </label>
                {data.performanceBonus && (
                  <Input
                    className="mt-2"
                    placeholder="e.g. Up to 15% annual"
                    value={data.performanceBonusValue}
                    onChange={(e) => update({ performanceBonusValue: e.target.value })}
                  />
                )}
              </div>
              <div>
                <label className="flex items-center gap-2 text-sm">
                  <Checkbox checked={data.signOnBonus} onCheckedChange={(v) => update({ signOnBonus: Boolean(v) })} />
                  Sign-on Bonus
                </label>
                {data.signOnBonus && (
                  <Input
                    className="mt-2"
                    placeholder="Amount"
                    value={data.signOnBonusValue}
                    onChange={(e) => update({ signOnBonusValue: e.target.value })}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StepCompensation;
