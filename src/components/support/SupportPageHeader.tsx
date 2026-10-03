import { Search } from "lucide-react";
import { useState } from "react";

interface SupportPageHeaderProps {
  title: string;
  description: string;
}

const SupportPageHeader = ({ title, description }: SupportPageHeaderProps) => {
  const [search, setSearch] = useState("");

  return (
    <section className="bg-accent/50 border-b border-border py-12">
      <div className="container">
        <h1 className="text-3xl font-bold text-foreground lg:text-4xl">{title}</h1>
        <p className="mt-2 text-muted-foreground max-w-lg">{description}</p>
        <div className="mt-6 max-w-md relative">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-11 w-full rounded-xl border border-input bg-card pl-11 pr-4 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-ring"
            placeholder="Search help articles..."
          />
        </div>
      </div>
    </section>
  );
};

export default SupportPageHeader;
