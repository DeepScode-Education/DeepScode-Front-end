import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { createPlacement, updatePlacement } from "@/services/placement.service";

import { PlacementStudent } from "@/types/placement";

interface PlacementFormProps {
  mode: "create" | "edit";

  placement?: PlacementStudent | null;

  onSuccess: () => void;

  onClose: () => void;
}

const PlacementForm = ({
  mode,
  placement,
  onSuccess,
  onClose,
}: PlacementFormProps) => {
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    name: "",
    role: "",
    company: "",
    placementYear: "",
    displayOrder: 0,
  });

  const [image, setImage] = useState<File | null>(null);

  const [offerLetter, setOfferLetter] = useState<File | null>(null);

  useEffect(() => {
    if (mode === "edit" && placement) {
      setForm({
        name: placement.name,

        role: placement.role,

        company: placement.company,

        placementYear: placement.placementYear,

        displayOrder: placement.displayOrder,
      });
    }
  }, [mode, placement]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setLoading(true);

      const formData = new FormData();

      formData.append("name", form.name);

      formData.append("role", form.role);

      formData.append("company", form.company);

      formData.append("placementYear", form.placementYear);

      formData.append("displayOrder", String(form.displayOrder));

      if (image) {
        formData.append("image", image);
      }

      if (offerLetter) {
        formData.append("offerLetter", offerLetter);
      }

      if (mode === "create") {
        await createPlacement(formData);
      } else {
        await updatePlacement(placement!._id, formData);
      }

      onSuccess();

      onClose();
    } catch (error) {
      console.log("Placement save error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        placeholder="Student Name"
        value={form.name}
        onChange={(e) =>
          setForm({
            ...form,
            name: e.target.value,
          })
        }
      />

      <Input
        placeholder="Role"
        value={form.role}
        onChange={(e) =>
          setForm({
            ...form,
            role: e.target.value,
          })
        }
      />

      <Input
        placeholder="Company"
        value={form.company}
        onChange={(e) =>
          setForm({
            ...form,
            company: e.target.value,
          })
        }
      />

      <Input
        placeholder="Placement Year"
        value={form.placementYear}
        onChange={(e) =>
          setForm({
            ...form,
            placementYear: e.target.value,
          })
        }
      />

      <Input
        type="number"
        placeholder="Display Order"
        value={form.displayOrder}
        onChange={(e) =>
          setForm({
            ...form,
            displayOrder: Number(e.target.value),
          })
        }
      />

      <div>
        <label className="text-sm">Student Image</label>

        <Input
          type="file"
          accept="image/*"
          onChange={(e) => setImage(e.target.files?.[0] || null)}
        />
      </div>

      <div>
        <label className="text-sm">Offer Letter PDF</label>

        <Input
          type="file"
          accept="application/pdf"
          onChange={(e) => setOfferLetter(e.target.files?.[0] || null)}
        />
      </div>

      <div className="flex gap-3">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>

        <Button type="submit" disabled={loading} className="text-white">
          {loading
            ? "Saving..."
            : mode === "create"
              ? "Create Placement"
              : "Update Placement"}
        </Button>
      </div>
    </form>
  );
};

export default PlacementForm;
