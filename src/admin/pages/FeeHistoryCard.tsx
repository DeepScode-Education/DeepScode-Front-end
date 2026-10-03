// src/admin/components/lead-detail/FeeHistoryCard.tsx
//
// Shared by LeadDetail.tsx (admin) and CounsellorLeadDetail.tsx — read-only
// display of the structured, append-only fee negotiation history
// (Original Fee → Student Requested → Counsellor Updated → ... → Admin
// Approved). History entries come straight from lead.feeHistory, which the
// backend appends to on every negotiatedAmount change — never overwritten,
// never deleted.

import { useState } from "react";
import { History, ChevronDown, ChevronUp } from "lucide-react";
import type { Lead } from "../hooks/useLeads";

interface FeeHistoryCardProps {
  lead: Lead;
}

const fmtAmt = (n: number | null | undefined) =>
  n === null || n === undefined ? "—" : `₹${n.toLocaleString("en-IN")}`;

export const FeeHistoryCard = ({ lead }: FeeHistoryCardProps) => {
  const [expanded, setExpanded] = useState(false);
  const history = lead.feeHistory ?? [];
  const sorted = [...history].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  const visible = expanded ? sorted : sorted.slice(0, 3);

  return (
    <div className="rounded-xl border border-border bg-card p-5 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold flex items-center gap-1.5">
          <History size={14} className="text-[#0037FF]" /> Fee Negotiation History
        </h3>
        {sorted.length > 3 && (
          <button
            onClick={() => setExpanded((e) => !e)}
            className="flex items-center gap-1 text-xs text-[#0037FF] hover:underline"
          >
            {expanded ? (
              <>
                Show less <ChevronUp size={12} />
              </>
            ) : (
              <>
                Show all ({sorted.length}) <ChevronDown size={12} />
              </>
            )}
          </button>
        )}
      </div>

      {sorted.length === 0 ? (
        <p className="text-xs text-muted-foreground">No fee changes recorded yet.</p>
      ) : (
        <ol className="relative border-l border-border ml-3 space-y-0">
          {visible.map((entry, i) => {
            const changedByName =
              typeof entry.changedBy === "object" ? entry.changedBy?.fullName : undefined;
            return (
              <li key={i} className="mb-5 ml-5">
                <span className="absolute -left-2.5 flex h-5 w-5 items-center justify-center rounded-full bg-card border border-border">
                  <span className="h-2 w-2 rounded-full bg-[#0037FF]" />
                </span>
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className="text-sm font-semibold">
                    {fmtAmt(entry.previousAmount)} <span className="text-muted-foreground">→</span>{" "}
                    {fmtAmt(entry.newAmount)}
                  </span>
                  {entry.role && (
                    <span className="rounded-full bg-secondary px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide">
                      {entry.role}
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  {new Date(entry.createdAt).toLocaleString("en-IN")}
                  {changedByName ? ` · by ${changedByName}` : ""}
                </p>
                {entry.reason && <p className="mt-1 text-xs text-foreground">Reason: {entry.reason}</p>}
                {entry.remarks && <p className="mt-0.5 text-xs text-muted-foreground">{entry.remarks}</p>}
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
};

export default FeeHistoryCard;