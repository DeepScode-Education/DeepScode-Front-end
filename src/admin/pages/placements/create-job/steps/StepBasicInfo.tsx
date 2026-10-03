
// import { AlertTriangle } from "lucide-react";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Switch } from "@/components/ui/switch";
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
// import { BasicInfoData } from "../types";
// import { StepErrors } from "../validation";

// interface StepBasicInfoProps {
//   data: BasicInfoData;
//   errors: StepErrors;
//   update: (patch: Partial<BasicInfoData>) => void;
// }

// const StepBasicInfo = ({ data, errors, update }: StepBasicInfoProps) => (
//   <div>
//     <h1 className="text-2xl font-bold">Create Job Opportunity</h1>
//     <p className="mt-1 text-sm text-muted-foreground">
//       Define the foundational details for this open position to ensure proper tracking and alignment.
//     </p>

//     <div className="mt-6 rounded-xl border border-border bg-card p-6">
//       <div className="grid grid-cols-2 gap-x-6 gap-y-5">
//         <div>
//           <Label>
//             Company Entity <span className="text-destructive">*</span>
//           </Label>
//           <Select value={data.companyEntity} onValueChange={(v) => update({ companyEntity: v })}>
//             <SelectTrigger className="mt-1.5">
//               <SelectValue placeholder="Select company entity" />
//             </SelectTrigger>
//             <SelectContent>
//               <SelectItem value="Acme Global Innovations">Acme Global Innovations</SelectItem>
//               <SelectItem value="Acme Labs">Acme Labs</SelectItem>
//               <SelectItem value="Acme EU B.V.">Acme EU B.V.</SelectItem>
//             </SelectContent>
//           </Select>
//           {errors.companyEntity && <p className="mt-1 text-xs text-destructive">{errors.companyEntity}</p>}
//         </div>

//         <div>
//           <Label>Internal Job Code</Label>
//           <Input
//             className="mt-1.5"
//             placeholder="e.g. ENG-2024-001"
//             value={data.internalJobCode}
//             onChange={(e) => update({ internalJobCode: e.target.value })}
//           />
//         </div>

//         {/* ── Hiring Manager — now a free-text name field, not a dropdown ── */}
//         <div>
//           <Label>
//             Hiring Manager <span className="text-destructive">*</span>
//           </Label>
//           <Input
//             className="mt-1.5"
//             placeholder="e.g. Robert Chen"
//             value={data.hiringManager}
//             onChange={(e) => update({ hiringManager: e.target.value })}
//           />
//           {errors.hiringManager && <p className="mt-1 text-xs text-destructive">{errors.hiringManager}</p>}
//         </div>

//         {/* ── Department — now a free-text field, not a dropdown ── */}
//         <div>
//           <Label>
//             Department <span className="text-destructive">*</span>
//           </Label>
//           <Input
//             className="mt-1.5"
//             placeholder="e.g. Engineering & Product"
//             value={data.department}
//             onChange={(e) => update({ department: e.target.value })}
//           />
//           {errors.department && <p className="mt-1 text-xs text-destructive">{errors.department}</p>}
//         </div>

//         <div>
//           <Label>
//             Primary Location <span className="text-destructive">*</span>
//           </Label>
//           <Select value={data.primaryLocation} onValueChange={(v) => update({ primaryLocation: v })}>
//             <SelectTrigger className="mt-1.5">
//               <SelectValue placeholder="Select location" />
//             </SelectTrigger>
//             <SelectContent>
//               <SelectItem value="San Francisco, CA (HQ)">San Francisco, CA (HQ)</SelectItem>
//               <SelectItem value="New York, NY">New York, NY</SelectItem>
//               <SelectItem value="Austin, TX">Austin, TX</SelectItem>
//               <SelectItem value="Remote">Remote</SelectItem>
//             </SelectContent>
//           </Select>
//           {errors.primaryLocation && <p className="mt-1 text-xs text-destructive">{errors.primaryLocation}</p>}
//         </div>
//       </div>

//       <div className="mt-6 flex items-center justify-between rounded-lg border border-amber-200/60 bg-amber-50 px-4 py-3.5 dark:bg-amber-950/20">
//         <div>
//           <p className="flex items-center gap-1.5 text-sm font-medium">
//             <AlertTriangle size={13} className="text-amber-500" /> Urgent Requirement
//           </p>
//           <p className="mt-0.5 text-xs text-muted-foreground">
//             Flag this role to bypass standard SLA timelines for immediate sourcing.
//           </p>
//         </div>
//         <Switch checked={data.urgentRequirement} onCheckedChange={(v) => update({ urgentRequirement: v })} />
//       </div>
//     </div>
//   </div>
// );

// export default StepBasicInfo;



import { useEffect, useState, useCallback } from "react";
import { AlertTriangle, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BasicInfoData } from "../types";
import { StepErrors } from "../validation";
import { hiringPartnersApi, HiringPartner } from "@/integrations/client";

interface StepBasicInfoProps {
  data: BasicInfoData;
  errors: StepErrors;
  update: (patch: Partial<BasicInfoData>) => void;
}

const unwrap = (res: any) => (res?.data !== undefined && res?.success === undefined ? res.data : res);

const StepBasicInfo = ({ data, errors, update }: StepBasicInfoProps) => {
  const [partners, setPartners] = useState<HiringPartner[]>([]);
  const [loadingPartners, setLoadingPartners] = useState(true);
  const [partnersError, setPartnersError] = useState<string | null>(null);

  const fetchPartners = useCallback(async () => {
    setLoadingPartners(true);
    setPartnersError(null);
    try {
      const res = unwrap(await hiringPartnersApi.getAll({ isActive: "true", limit: 100 }));
      if (!res?.success) throw new Error(res?.message || "Failed to load hiring partners");
      setPartners(res.data || []);
    } catch (err: any) {
      setPartnersError(err?.message || "Failed to load hiring partners");
      setPartners([]);
    } finally {
      setLoadingPartners(false);
    }
  }, []);

  useEffect(() => {
    fetchPartners();
  }, [fetchPartners]);

  const handleCompanySelect = (partnerId: string) => {
    const partner = partners.find((p) => p._id === partnerId);
    update({
      hiringPartner: partnerId,
      companyEntity: partner?.companyName || "",
    });
  };

  return (
    <div>
      <h1 className="text-2xl font-bold">Create Job Opportunity</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Define the foundational details for this open position to ensure proper tracking and alignment.
      </p>

      <div className="mt-6 rounded-xl border border-border bg-card p-6">
        <div className="grid grid-cols-2 gap-x-6 gap-y-5">
          <div>
            <Label>
              Company Entity <span className="text-destructive">*</span>
            </Label>

            {loadingPartners ? (
              <div className="mt-1.5 flex h-10 items-center gap-2 rounded-md border border-border px-3 text-sm text-muted-foreground">
                <Loader2 size={14} className="animate-spin" /> Loading companies...
              </div>
            ) : partnersError ? (
              <div className="mt-1.5 flex items-center justify-between gap-2 rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2">
                <span className="text-xs text-destructive">{partnersError}</span>
                <Button type="button" size="sm" variant="outline" onClick={fetchPartners}>
                  Retry
                </Button>
              </div>
            ) : partners.length === 0 ? (
              <div className="mt-1.5 flex items-center justify-between gap-2 rounded-md border border-border px-3 py-2">
                <span className="text-xs text-muted-foreground">No active hiring partners found.</span>
                <Button type="button" size="sm" variant="outline" onClick={fetchPartners}>
                  Refresh
                </Button>
              </div>
            ) : (
              <Select value={data.hiringPartner} onValueChange={handleCompanySelect}>
                <SelectTrigger className="mt-1.5">
                  <SelectValue placeholder="Select company entity" />
                </SelectTrigger>
                <SelectContent>
                  {partners.map((partner) => (
                    <SelectItem key={partner._id} value={partner._id}>
                      {partner.companyName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            {errors.hiringPartner && <p className="mt-1 text-xs text-destructive">{errors.hiringPartner}</p>}
          </div>

          <div>
            <Label>Internal Job Code</Label>
            <Input
              className="mt-1.5"
              placeholder="e.g. ENG-2024-001"
              value={data.internalJobCode}
              onChange={(e) => update({ internalJobCode: e.target.value })}
            />
          </div>

          <div>
            <Label>
              Hiring Manager <span className="text-destructive">*</span>
            </Label>
            <Input
              className="mt-1.5"
              placeholder="e.g. Robert Chen"
              value={data.hiringManager}
              onChange={(e) => update({ hiringManager: e.target.value })}
            />
            {errors.hiringManager && <p className="mt-1 text-xs text-destructive">{errors.hiringManager}</p>}
          </div>

          <div>
            <Label>
              Department <span className="text-destructive">*</span>
            </Label>
            <Input
              className="mt-1.5"
              placeholder="e.g. Engineering & Product"
              value={data.department}
              onChange={(e) => update({ department: e.target.value })}
            />
            {errors.department && <p className="mt-1 text-xs text-destructive">{errors.department}</p>}
          </div>

         <div>
  <Label>
    Primary Location <span className="text-destructive">*</span>
  </Label>
  <Input
    className="mt-1.5"
    placeholder="e.g. San Francisco, CA (HQ) or Remote"
    value={data.primaryLocation}
    onChange={(e) => update({ primaryLocation: e.target.value })}
  />
  {errors.primaryLocation && <p className="mt-1 text-xs text-destructive">{errors.primaryLocation}</p>}
</div>
        </div>

        <div className="mt-6 flex items-center justify-between rounded-lg border border-amber-200/60 bg-amber-50 px-4 py-3.5 dark:bg-amber-950/20">
          <div>
            <p className="flex items-center gap-1.5 text-sm font-medium">
              <AlertTriangle size={13} className="text-amber-500" /> Urgent Requirement
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Flag this role to bypass standard SLA timelines for immediate sourcing.
            </p>
          </div>
          <Switch checked={data.urgentRequirement} onCheckedChange={(v) => update({ urgentRequirement: v })} />
        </div>
      </div>
    </div>
  );
};

export default StepBasicInfo;