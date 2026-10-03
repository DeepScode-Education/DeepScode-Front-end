import { useState } from "react";
import { X } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface TagInputProps {
  values: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
}

const TagInput = ({ values, onChange, placeholder }: TagInputProps) => {
  const [draft, setDraft] = useState("");

  const add = () => {
    const v = draft.trim();
    if (v && !values.includes(v)) onChange([...values, v]);
    setDraft("");
  };

  return (
    <div className="flex flex-wrap items-center gap-1.5 rounded-md border border-input bg-background px-2.5 py-2 focus-within:ring-1 focus-within:ring-ring">
      {values.map((v) => (
        <Badge key={v} variant="secondary" className="gap-1 pr-1.5">
          {v}
          <button type="button" onClick={() => onChange(values.filter((x) => x !== v))} className="opacity-70 hover:opacity-100">
            <X size={11} />
          </button>
        </Badge>
      ))}
      <input
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            add();
          }
        }}
        placeholder={placeholder}
        className="min-w-[140px] flex-1 border-none bg-transparent py-0.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
      />
    </div>
  );
};

export default TagInput;
