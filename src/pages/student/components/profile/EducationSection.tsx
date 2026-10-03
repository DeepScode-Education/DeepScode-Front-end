import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface EducationValues {
  qualification: string;
  college: string;
  degree: string;
  passingYear: string;
}

interface Props {
  values: EducationValues;
  onChange: (field: keyof EducationValues, value: string) => void;
}

const EducationSection = ({ values, onChange }: Props) => (
  <section>
    <h3 className="text-sm font-semibold text-foreground mb-4 uppercase tracking-wide">Education</h3>
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label>Qualification</Label>
        <Input value={values.qualification} onChange={(e) => onChange("qualification", e.target.value)} />
      </div>
      <div className="space-y-2">
        <Label>College</Label>
        <Input value={values.college} onChange={(e) => onChange("college", e.target.value)} />
      </div>
      <div className="space-y-2">
        <Label>Degree</Label>
        <Input value={values.degree} onChange={(e) => onChange("degree", e.target.value)} />
      </div>
      <div className="space-y-2">
        <Label>Passing Year</Label>
        <Input value={values.passingYear} onChange={(e) => onChange("passingYear", e.target.value)} placeholder="e.g. 2023" />
      </div>
    </div>
  </section>
);

export default EducationSection;