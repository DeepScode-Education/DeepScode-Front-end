import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface AddressValues {
  city: string;
  state: string;
  pincode: string;
  address: string;
}

interface Props {
  values: AddressValues;
  onChange: (field: keyof AddressValues, value: string) => void;
}

const AddressSection = ({ values, onChange }: Props) => (
  <section>
    <h3 className="text-sm font-semibold text-foreground mb-4 uppercase tracking-wide">Address</h3>
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div className="space-y-2 sm:col-span-2">
        <Label>Address</Label>
        <Input value={values.address} onChange={(e) => onChange("address", e.target.value)} />
      </div>
      <div className="space-y-2">
        <Label>City</Label>
        <Input value={values.city} onChange={(e) => onChange("city", e.target.value)} />
      </div>
      <div className="space-y-2">
        <Label>State</Label>
        <Input value={values.state} onChange={(e) => onChange("state", e.target.value)} />
      </div>
      <div className="space-y-2">
        <Label>Pincode</Label>
        <Input value={values.pincode} onChange={(e) => onChange("pincode", e.target.value)} />
      </div>
    </div>
  </section>
);

export default AddressSection;