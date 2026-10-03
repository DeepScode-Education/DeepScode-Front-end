// import { Plus, Building2 } from "lucide-react";
// import AdminLayout from "../../components/AdminLayout";
// import DataTable from "../../components/DataTable";
// import { Button } from "@/components/ui/button";
// import { hiringPartners } from "../../data/mock";

// const HiringPartners = () => (
//   <AdminLayout
//     title="Hiring Partners"
//     subtitle="Companies actively hiring Slate Academy graduates."
//     actions={<Button size="sm"><Plus size={14} /> Add Partner</Button>}
//   >
//     <div className="mb-4 grid grid-cols-2 gap-3 md:grid-cols-4">
//       {[
//         { label: "Total Partners", value: "84" },
//         { label: "Premier Partners", value: "32" },
//         { label: "Open Roles", value: "142" },
//         { label: "Total Hires", value: "428" },
//       ].map((s) => (
//         <div key={s.label} className="rounded-xl border border-border bg-card p-4">
//           <div className="text-xs text-muted-foreground">{s.label}</div>
//           <div className="mt-1 text-xl font-bold">{s.value}</div>
//         </div>
//       ))}
//     </div>
//     <DataTable
//       rows={hiringPartners}
//       columns={[
//         { key: "company", label: "Company", render: (r) => (
//           <div className="flex items-center gap-2"><div className="flex h-8 w-8 items-center justify-center rounded-lg bg-secondary"><Building2 size={14} /></div><span className="font-medium">{r.company}</span></div>
//         ) },
//         { key: "industry", label: "Industry" },
//         { key: "openRoles", label: "Open Roles" },
//         { key: "hires", label: "Total Hires" },
//         { key: "tier", label: "Tier", render: (r) => (
//           <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${r.tier === "Premier" ? "bg-[#0037FF]/10 text-[#0037FF]" : "bg-secondary text-muted-foreground"}`}>{r.tier}</span>
//         ) },
//       ]}
//     />
//   </AdminLayout>
// );

// export default HiringPartners;




import { useCallback, useEffect, useMemo, useState } from "react";
import { Plus, Building2, Pencil, Trash2, Loader2, Search, RefreshCw } from "lucide-react";
import AdminLayout from "../../components/AdminLayout";
import DataTable from "../../components/DataTable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
// ⚠️ Adjust this import path to wherever hiringPartnersApi actually lives in your client.ts
import { hiringPartnersApi } from "@/integrations/client";

// ─── Types ──────────────────────────────────────────────────────────────────
type PartnerTier = "Premier" | "Standard";

interface HiringPartner {
  _id: string;
  companyName: string;
  slug?: string;
  industry?: string;
  logo?: string;
  description?: string;
  website?: string;
  tier: PartnerTier;
  isActive: boolean;
  openRoles?: number;
  totalHires?: number;
  stats?: { totalHires?: number };
  createdAt?: string;
  updatedAt?: string;
}

interface HiringPartnerPayload {
  companyName: string;
  industry?: string;
  logo?: string;
  description?: string;
  website?: string;
  tier?: PartnerTier;
  isActive?: boolean;
  totalHires?: number;
}

interface DashboardStats {
  totalPartners: number;
  premierPartners: number;
  openRoles: number;
  totalHires: number;
}

interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

const EMPTY_FORM: HiringPartnerPayload = {
  companyName: "",
  industry: "",
  website: "",
  logo: "",
  description: "",
  tier: "Standard",
  isActive: true,
  totalHires: 0,
};

const LIMIT = 10;

const HiringPartners = () => {
  const { toast } = useToast();

  // ── List state ──────────────────────────────────────────────────────────
  const [partners, setPartners] = useState<HiringPartner[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<Pagination | null>(null);

  // ── Filters ─────────────────────────────────────────────────────────────
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [tierFilter, setTierFilter] = useState<"" | PartnerTier>("");
  const [page, setPage] = useState(1);

  // ── Stats state ─────────────────────────────────────────────────────────
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);

  // ── Dialog state ────────────────────────────────────────────────────────
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPartner, setEditingPartner] = useState<HiringPartner | null>(null);
  const [form, setForm] = useState<HiringPartnerPayload>(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);

  // ── Delete confirm state ────────────────────────────────────────────────
  const [deleteTarget, setDeleteTarget] = useState<HiringPartner | null>(null);
  const [deleting, setDeleting] = useState(false);

  const getErrorMessage = (err: any, fallback: string) =>
    err?.response?.data?.message || err?.message || fallback;

  // Handles either "already unwrapped JSON body" or "axios response" shapes
  const unwrap = (res: any) => (res?.data !== undefined && res?.success === undefined ? res.data : res);

  // ── Debounce search ─────────────────────────────────────────────────────
  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearch(search.trim());
      setPage(1);
    }, 400);
    return () => clearTimeout(t);
  }, [search]);

  // ── Fetch partners ──────────────────────────────────────────────────────
  const fetchPartners = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params: Record<string, any> = { page, limit: LIMIT };
      if (debouncedSearch) params.search = debouncedSearch;
      if (tierFilter) params.tier = tierFilter;

      const res = unwrap(await hiringPartnersApi.getAll(params));
      if (!res?.success) throw new Error(res?.message || "Failed to load hiring partners");

      setPartners(res.data || []);
      setPagination(res.pagination || null);
    } catch (err: any) {
      const msg = getErrorMessage(err, "Failed to load hiring partners");
      setError(msg);
      setPartners([]);
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch, tierFilter]);

  // ── Fetch dashboard stats ───────────────────────────────────────────────
  const fetchStats = useCallback(async () => {
    setStatsLoading(true);
    try {
      const res = unwrap(await hiringPartnersApi.getDashboardStats());
      if (res?.success) {
        setStats(res.data);
      }
    } catch (err) {
      // Non-fatal — stats cards just won't populate
      console.error("Failed to load hiring partner stats:", err);
    } finally {
      setStatsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPartners();
  }, [fetchPartners]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const refreshAll = () => {
    fetchPartners();
    fetchStats();
  };

  // ── Add / Edit dialog handlers ──────────────────────────────────────────
  const openAddDialog = () => {
    setEditingPartner(null);
    setForm(EMPTY_FORM);
    setDialogOpen(true);
  };

  const openEditDialog = (partner: HiringPartner) => {
    setEditingPartner(partner);
    setForm({
      companyName: partner.companyName || "",
      industry: partner.industry || "",
      website: partner.website || "",
      logo: partner.logo || "",
      description: partner.description || "",
      tier: partner.tier || "Standard",
      isActive: partner.isActive ?? true,
      totalHires: partner.totalHires ?? partner.stats?.totalHires ?? 0,
    });
    setDialogOpen(true);
  };

  const closeDialog = () => {
    if (submitting) return;
    setDialogOpen(false);
    setEditingPartner(null);
    setForm(EMPTY_FORM);
  };

  const handleFormChange = <K extends keyof HiringPartnerPayload>(
    key: K,
    value: HiringPartnerPayload[K]
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async () => {
    if (!form.companyName.trim()) {
      toast({
        title: "Company name required",
        description: "Please enter a company name before saving.",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);
    try {
      const payload: HiringPartnerPayload = {
        companyName: form.companyName.trim(),
        industry: form.industry?.trim() || "",
        website: form.website?.trim() || "",
        logo: form.logo?.trim() || "",
        description: form.description?.trim() || "",
        tier: form.tier || "Standard",
        isActive: form.isActive ?? true,
        totalHires: Number(form.totalHires) || 0,
      };

      const res = unwrap(
        editingPartner
          ? await hiringPartnersApi.update(editingPartner._id, payload)
          : await hiringPartnersApi.create(payload)
      );

      if (!res?.success) {
        throw new Error(res?.message || "Something went wrong");
      }

      toast({
        title: editingPartner ? "Partner updated" : "Partner added",
        description: `${payload.companyName} has been ${editingPartner ? "updated" : "added"} successfully.`,
      });

      closeDialog();
      refreshAll();
    } catch (err: any) {
      toast({
        title: editingPartner ? "Failed to update partner" : "Failed to add partner",
        description: getErrorMessage(err, "Please try again."),
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  // ── Delete handlers ─────────────────────────────────────────────────────
  const requestDelete = (partner: HiringPartner) => setDeleteTarget(partner);
  const cancelDelete = () => {
    if (deleting) return;
    setDeleteTarget(null);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = unwrap(await hiringPartnersApi.remove(deleteTarget._id));
      if (!res?.success) throw new Error(res?.message || "Failed to delete partner");

      toast({
        title: "Partner deleted",
        description: `${deleteTarget.companyName} has been removed.`,
      });

      setDeleteTarget(null);
      refreshAll();
    } catch (err: any) {
      toast({
        title: "Failed to delete partner",
        description: getErrorMessage(err, "Please try again."),
        variant: "destructive",
      });
    } finally {
      setDeleting(false);
    }
  };

  // ── Stat cards ───────────────────────────────────────────────────────────
  const statCards = useMemo(
    () => [
      { label: "Total Partners", value: stats?.totalPartners ?? "—" },
      { label: "Premier Partners", value: stats?.premierPartners ?? "—" },
      { label: "Open Roles", value: stats?.openRoles ?? "—" },
      { label: "Total Hires", value: stats?.totalHires ?? "—" },
    ],
    [stats]
  );

  return (
    <AdminLayout
      title="Hiring Partners"
      subtitle="Companies actively hiring Slate Academy graduates."
      actions={
        <Button size="sm" className="text-white" onClick={openAddDialog}>
          <Plus size={14} /> Add Partner
        </Button>
      }
    >
      {/* Stats */}
      <div className="mb-4 grid grid-cols-2 gap-3 md:grid-cols-4">
        {statCards.map((s) => (
          <div key={s.label} className="rounded-xl border border-border bg-card p-4">
            <div className="text-xs text-muted-foreground">{s.label}</div>
            <div className="mt-1 text-xl font-bold">
              {statsLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : s.value}
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search company or industry..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        <div className="flex items-center gap-2">
          <Select
            value={tierFilter || "all"}
            onValueChange={(v) => {
              setTierFilter(v === "all" ? "" : (v as PartnerTier));
              setPage(1);
            }}
          >
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="All Tiers" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Tiers</SelectItem>
              <SelectItem value="Premier">Premier</SelectItem>
              <SelectItem value="Standard">Standard</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" size="icon" onClick={refreshAll} title="Refresh">
            <RefreshCw size={14} />
          </Button>
        </div>
      </div>

      {/* Table / states */}
      {loading ? (
        <div className="flex h-40 items-center justify-center rounded-xl border border-border bg-card text-muted-foreground">
          <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading hiring partners...
        </div>
      ) : error ? (
        <div className="flex h-40 flex-col items-center justify-center gap-3 rounded-xl border border-border bg-card text-center">
          <p className="text-sm text-destructive">{error}</p>
          <Button size="sm" variant="outline" onClick={fetchPartners}>
            Retry
          </Button>
        </div>
      ) : partners.length === 0 ? (
        <div className="flex h-40 flex-col items-center justify-center gap-2 rounded-xl border border-border bg-card text-center text-muted-foreground">
          <Building2 size={24} />
          <p className="text-sm">No hiring partners found.</p>
          <Button size="sm" onClick={openAddDialog}>
            <Plus size={14} /> Add your first partner
          </Button>
        </div>
      ) : (
        <>
          <DataTable
            rows={partners}
            columns={[
              {
                key: "company",
                label: "Company",
                render: (r: HiringPartner) => (
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-secondary overflow-hidden">
                      {r.logo ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={r.logo} alt={r.companyName} className="h-full w-full object-cover" />
                      ) : (
                        <Building2 size={14} />
                      )}
                    </div>
                    <span className="font-medium">{r.companyName}</span>
                  </div>
                ),
              },
              { key: "industry", label: "Industry", render: (r: HiringPartner) => r.industry || "—" },
              { key: "openRoles", label: "Open Roles", render: (r: HiringPartner) => r.openRoles ?? 0 },
              {
                key: "hires",
                label: "Total Hires",
                render: (r: HiringPartner) => r.totalHires ?? r.stats?.totalHires ?? 0,
              },
              {
                key: "tier",
                label: "Tier",
                render: (r: HiringPartner) => (
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                      r.tier === "Premier" ? "bg-[#0037FF]/10 text-[#0037FF]" : "bg-secondary text-muted-foreground"
                    }`}
                  >
                    {r.tier}
                  </span>
                ),
              },
              {
                key: "status",
                label: "Status",
                render: (r: HiringPartner) => (
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                      r.isActive ? "bg-emerald-500/10 text-emerald-600" : "bg-red-500/10 text-red-600"
                    }`}
                  >
                    {r.isActive ? "Active" : "Inactive"}
                  </span>
                ),
              },
              {
                key: "actions",
                label: "",
                render: (r: HiringPartner) => (
                  <div className="flex items-center justify-end gap-1">
                    <Button variant="ghost" size="icon" onClick={() => openEditDialog(r)} title="Edit">
                      <Pencil size={14} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => requestDelete(r)}
                      title="Delete"
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 size={14} />
                    </Button>
                  </div>
                ),
              },
            ]}
          />

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
              <span>
                Page {pagination.page} of {pagination.totalPages} ({pagination.total} total)
              </span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= pagination.totalPages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Add / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={(open) => (!open ? closeDialog() : setDialogOpen(true))}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingPartner ? "Edit Hiring Partner" : "Add Hiring Partner"}</DialogTitle>
            <DialogDescription>
              {editingPartner
                ? "Update this hiring partner's details."
                : "Add a new company that hires Slate Academy graduates."}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-2">
            <div className="grid gap-2">
              <Label htmlFor="companyName">Company Name *</Label>
              <Input
                id="companyName"
                value={form.companyName}
                onChange={(e) => handleFormChange("companyName", e.target.value)}
                placeholder="e.g. Adobe India"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="industry">Industry</Label>
                <Input
                  id="industry"
                  value={form.industry}
                  onChange={(e) => handleFormChange("industry", e.target.value)}
                  placeholder="e.g. Software"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="tier">Tier</Label>
                <Select
                  value={form.tier}
                  onValueChange={(v) => handleFormChange("tier", v as PartnerTier)}
                >
                  <SelectTrigger id="tier">
                    <SelectValue placeholder="Select tier" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Premier">Premier</SelectItem>
                    <SelectItem value="Standard">Standard</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  value={form.website}
                  onChange={(e) => handleFormChange("website", e.target.value)}
                  placeholder="https://example.com"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="totalHires">Total Hires</Label>
                <Input
                  id="totalHires"
                  type="number"
                  min={0}
                  value={form.totalHires ?? 0}
                  onChange={(e) => handleFormChange("totalHires", Number(e.target.value))}
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="logo">Logo URL</Label>
              <Input
                id="logo"
                value={form.logo}
                onChange={(e) => handleFormChange("logo", e.target.value)}
                placeholder="https://..."
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <textarea
                id="description"
                value={form.description}
                onChange={(e) => handleFormChange("description", e.target.value)}
                rows={3}
                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                placeholder="Short description of the company..."
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="isActive">Status</Label>
              <Select
                value={form.isActive ? "active" : "inactive"}
                onValueChange={(v) => handleFormChange("isActive", v === "active")}
              >
                <SelectTrigger id="isActive">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={closeDialog} disabled={submitting}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={submitting}>
              {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {editingPartner ? "Save Changes" : "Add Partner"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && cancelDelete()}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete hiring partner?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove <strong>{deleteTarget?.companyName}</strong> from your hiring partners list. This
              action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting} onClick={cancelDelete}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                confirmDelete();
              }}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
};

export default HiringPartners;
