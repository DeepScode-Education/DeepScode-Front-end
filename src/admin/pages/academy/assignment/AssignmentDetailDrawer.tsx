import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import AssignmentStatusBadge from "./AssignmentStatusBadge";
import AssignmentReviewForm from "./AssignmentReviewForm";
import type { AssignmentRecord, AssignmentStatus } from "@/types/assignment";
import { Github, Figma, ExternalLink, HardDrive, FileText } from "lucide-react";

interface Props {
  assignment: AssignmentRecord | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onReviewSubmit: (
    id: string,
    payload: { status?: AssignmentStatus; grade?: string; feedback?: string }
  ) => Promise<void>;
}

const LinkRow = ({
  href,
  label,
  icon: Icon,
}: {
  href?: string;
  label: string;
  icon: any;
}) => {
  if (!href) return null;
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="flex items-center gap-2 rounded-md border px-3 py-2 text-sm hover:bg-muted/50"
    >
      <Icon size={14} />
      <span className="truncate">{label}</span>
      <ExternalLink size={12} className="ml-auto text-muted-foreground" />
    </a>
  );
};

const AssignmentDetailDrawer = ({ assignment, open, onOpenChange, onReviewSubmit }: Props) => {
  if (!assignment) return null;

  const studentName =
    typeof assignment.student === "string" ? "Unknown student" : assignment.student.fullName;
  const studentEmail = typeof assignment.student === "string" ? "" : assignment.student.email;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-lg">
        <SheetHeader>
          <SheetTitle className="pr-6">{assignment.title}</SheetTitle>
        </SheetHeader>

        <div className="mt-4 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">{studentName}</p>
              <p className="text-xs text-muted-foreground">{studentEmail}</p>
            </div>
            <AssignmentStatusBadge status={assignment.status} />
          </div>

          <div>
            <h4 className="mb-1 text-xs font-semibold uppercase text-muted-foreground">
              Description
            </h4>
            <p className="whitespace-pre-wrap text-sm">{assignment.description}</p>
          </div>

          {assignment.category && (
            <div>
              <h4 className="mb-1 text-xs font-semibold uppercase text-muted-foreground">
                Category
              </h4>
              <p className="text-sm">{assignment.category}</p>
            </div>
          )}

          {assignment.files?.length > 0 && (
            <div>
              <h4 className="mb-2 text-xs font-semibold uppercase text-muted-foreground">Files</h4>
              <div className="space-y-2">
                {assignment.files.map((f) => (
                  <LinkRow key={f.publicId} href={f.url} label={f.name} icon={FileText} />
                ))}
              </div>
            </div>
          )}

          <div className="space-y-2">
            <h4 className="text-xs font-semibold uppercase text-muted-foreground">Links</h4>
            <LinkRow href={assignment.githubLink} label="GitHub" icon={Github} />
            <LinkRow href={assignment.figmaLink} label="Figma" icon={Figma} />
            <LinkRow href={assignment.liveLink} label="Live demo" icon={ExternalLink} />
            <LinkRow href={assignment.driveLink} label="Drive" icon={HardDrive} />
          </div>

          {assignment.notes && (
            <div>
              <h4 className="mb-1 text-xs font-semibold uppercase text-muted-foreground">
                Student notes
              </h4>
              <p className="whitespace-pre-wrap text-sm text-muted-foreground">{assignment.notes}</p>
            </div>
          )}

          <AssignmentReviewForm
            assignment={assignment}
            onSubmit={(payload) => onReviewSubmit(assignment._id, payload)}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default AssignmentDetailDrawer;