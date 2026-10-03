import { Pencil } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { CreateJobFormState } from "../types";

interface StepReviewProps {
  form: CreateJobFormState;
  goTo: (index: number) => void;
}

const Field = ({ label, value }: { label: string; value?: string }) => (
  <div>
    <p className="text-xs text-muted-foreground">{label}</p>
    <p className="mt-0.5 font-medium">{value || "—"}</p>
  </div>
);

const ReviewCard = ({
  title,
  onEdit,
  children,
}: {
  title: string;
  onEdit: () => void;
  children: React.ReactNode;
}) => (
  <div className="rounded-xl border border-border bg-card p-6">
    <div className="mb-4 flex items-center justify-between">
      <h3 className="text-lg font-bold">{title}</h3>
      <button onClick={onEdit} className="text-muted-foreground hover:text-[#0037FF]">
        <Pencil size={15} />
      </button>
    </div>
    <div className="grid grid-cols-2 gap-x-6 gap-y-3.5 text-sm">{children}</div>
  </div>
);

const StepReview = ({ form, goTo }: StepReviewProps) => {
  const { basic, role, compensation, eligibility, settings } = form;

  return (
    <div>
      <h1 className="text-2xl font-bold">Review & Publish</h1>
      <p className="mt-1 text-sm text-muted-foreground">Please review the details below before publishing the opportunity.</p>

      <div className="mt-6 grid grid-cols-2 gap-5">
        <ReviewCard title="Basic Info" onEdit={() => goTo(0)}>
          <Field label="Company" value={basic.companyEntity} /> 
          <Field label="Job Title" value={role.jobTitle} />
          <Field label="Department" value={basic.department} />
          <Field label="Location" value={basic.primaryLocation} />
          <Field label="Employment Type" value={role.employmentType} />
          <Field label="Hiring Manager" value={basic.hiringManager} />
          <Field label="Urgent" value={basic.urgentRequirement ? "Yes" : "No"} />
        </ReviewCard>

        <ReviewCard title="Compensation" onEdit={() => goTo(2)}>
          <Field
            label="Salary Range"
            value={compensation.payMin && compensation.payMax ? `${compensation.payMin} - ${compensation.payMax} ${compensation.currency}` : undefined}
          />
          <Field label="Pay Period" value={compensation.payPeriod} />
          <Field label="Bonus Potential" value={compensation.performanceBonusValue} />
          <Field label="Benefits" value={compensation.benefits.join(", ")} />
        </ReviewCard>

        <ReviewCard title="Role Details" onEdit={() => goTo(1)}>
          <div className="col-span-2">
            <p className="text-xs text-muted-foreground">Description Overview</p>
            <p className="mt-0.5 line-clamp-2 font-medium">{role.description || "—"}</p>
          </div>
          <Field label="Experience Level" value={eligibility.experienceLevel} />
          <Field label="Work Mode" value={role.workMode} />
          <div className="col-span-2">
            <p className="text-xs text-muted-foreground">Key Skills</p>
            <div className="mt-1 flex flex-wrap gap-1.5">
              {role.requiredSkills.length ? (
                role.requiredSkills.map((skill) => (
                  <Badge key={skill} variant="secondary">
                    {skill}
                  </Badge>
                ))
              ) : (
                <span className="text-sm text-muted-foreground">—</span>
              )}
            </div>
          </div>
        </ReviewCard>

        <ReviewCard title="Settings" onEdit={() => goTo(4)}>
          <Field label="Visibility" value={settings.visibility === "Public" ? "Publicly listed" : "Internal only"} />
          <Field label="Auto-screening" value={settings.autoScreening ? "Enabled" : "Disabled"} />
          <Field label="Application Deadline" value={settings.applicationDeadline} />
          <Field label="Application Limit" value={settings.applicationLimit || "Unlimited"} />
        </ReviewCard>
      </div>
    </div>
  );
};

export default StepReview;


