import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface PersonalInfoValues {
  fullName: string;
  email: string;
  mobileNumber: string;
  dob: string;
  gender: string;
}

interface Props {
  values: PersonalInfoValues;
  onChange: (field: keyof PersonalInfoValues, value: string) => void;
}

const PersonalInformation = ({ values, onChange }: Props) => (
  <section>
    <h3 className="text-sm font-semibold text-foreground mb-4 uppercase tracking-wide">Personal Information</h3>
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label>Full Name</Label>
        <Input value={values.fullName} onChange={(e) => onChange("fullName", e.target.value)} />
      </div>
      <div className="space-y-2">
        <Label>Email</Label>
        <Input value={values.email} disabled className="bg-muted/40" />
      </div>
      <div className="space-y-2">
        <Label>Mobile Number</Label>
        <Input value={values.mobileNumber} onChange={(e) => onChange("mobileNumber", e.target.value)} />
      </div>
      <div className="space-y-2">
        <Label>Date of Birth</Label>
        <Input type="date" value={values.dob} onChange={(e) => onChange("dob", e.target.value)} />
      </div>
      <div className="space-y-2">
        <Label>Gender</Label>
        <select
          value={values.gender}
          onChange={(e) => onChange("gender", e.target.value)}
          className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
        >
          <option value="">Select gender</option>
          <option value="Male">Male</option>
          <option value="Female">Female</option>
          <option value="Other">Other</option>
        </select>
      </div>
    </div>
  </section>
);

export default PersonalInformation;