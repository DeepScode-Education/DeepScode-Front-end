import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Search, FileText } from "lucide-react";

import AdminLayout from "../../components/AdminLayout";
import DataTable, { StatusBadge } from "../../components/DataTable";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import PlacementForm from "./PlacementForm";

import { getPlacements, deletePlacement } from "@/services/placement.service";

import { PlacementStudent } from "@/types/placement";

const StudentPlacements = () => {
  const [placements, setPlacements] = useState<PlacementStudent[]>([]);

  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");

  const [open, setOpen] = useState(false);

  const [mode, setMode] = useState<"create" | "edit">("create");

  const [selectedPlacement, setSelectedPlacement] =
    useState<PlacementStudent | null>(null);

  const fetchPlacements = async () => {
    try {
      setLoading(true);

      const res = await getPlacements();

      setPlacements(res.data || []);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlacements();
  }, []);

  const filteredPlacements = placements.filter((item) => {
    const value = search.toLowerCase();

    return (
      item.name.toLowerCase().includes(value) ||
      item.company.toLowerCase().includes(value) ||
      item.role.toLowerCase().includes(value)
    );
  });

  const handleAdd = () => {
    setMode("create");

    setSelectedPlacement(null);

    setOpen(true);
  };

  const handleEdit = (data: PlacementStudent) => {
    setMode("edit");

    setSelectedPlacement(data);

    setOpen(true);
  };

  const handleDelete = async (id: string) => {
    const confirm = window.confirm("Are you sure you want to delete?");

    if (!confirm) return;

    try {
      await deletePlacement(id);

      fetchPlacements();
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <AdminLayout
      title="Student Placements"
      subtitle="Placement journey from interview to joining."
      actions={
        <Button className="text-white" size="sm" onClick={handleAdd}>
          <Plus size={14} />
          Log Placement
        </Button>
      }
    >
      {/* Search */}

      <div className="mb-5">
        <div className="relative max-w-sm">
          <Search
            size={16}
            className="
            absolute
            left-3
            top-1/2
            -translate-y-1/2
            text-muted-foreground
            "
          />

          <Input
            placeholder="
            Search student, company, role...
            "
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {loading ? (
        <div className="py-10 text-center">Loading placements...</div>
      ) : (
        <DataTable
          rows={filteredPlacements}
          columns={[
            {
              key: "name",

              label: "Student",

              render: (r) => (
                <div
                  className="
                  flex
                  items-center
                  gap-3
                  "
                >
                  <img
                    src={r.image?.url}
                    className="
                    h-10
                    w-10
                    rounded-full
                    object-cover
                    "
                  />

                  <span className="font-medium">{r.name}</span>
                </div>
              ),
            },

            {
              key: "company",

              label: "Company",
            },

            {
              key: "role",

              label: "Role",
            },

            {
              key: "placementYear",

              label: "Year",
            },

          {
  key: "offerLetter",
  label: "Offer Letter",

  render: (r) => (
    r.offerLetter?.url ? (

      <button
        type="button"
        onClick={() => {
          window.open(
            r.offerLetter.url,
            "_blank",
            "noopener,noreferrer"
          );
        }}
        className="
        flex
        items-center
        gap-1
        text-blue-600
        text-sm
        hover:underline
        "
      >
        <FileText size={14} />
        View PDF
      </button>

    ) : (

      <span className="text-muted-foreground text-sm">
        Not Available
      </span>

    )
  )
},

            {
              key: "isActive",

              label: "Status",

              render: (r) => (
                <StatusBadge>{r.isActive ? "Active" : "Inactive"}</StatusBadge>
              ),
            },

            {
              key: "actions",

              label: "Actions",

              render: (r) => (
                <div
                  className="
                  flex
                  gap-2
                  "
                >
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={() => handleEdit(r)}
                  >
                    <Pencil size={15} />
                  </Button>

                  <Button
                    size="icon"
                    variant="destructive"
                    onClick={() => handleDelete(r._id)}
                  >
                    <Trash2 size={15} />
                  </Button>
                </div>
              ),
            },
          ]}
        />
      )}

      {/* Add/Edit Dialog */}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          className="
          max-w-lg
          "
        >
          <DialogHeader>
            <DialogTitle>
              {mode === "create"
                ? "Add Placement Student"
                : "Edit Placement Student"}
            </DialogTitle>
          </DialogHeader>

          <PlacementForm
            mode={mode}
            placement={selectedPlacement}
            onSuccess={fetchPlacements}
            onClose={() => setOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default StudentPlacements;
