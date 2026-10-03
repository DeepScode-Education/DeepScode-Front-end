import { Plus, Menu as MenuIcon, GripVertical } from "lucide-react";
import AdminLayout from "../../components/AdminLayout";
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { navMenus } from "../../data/mock";

const HEADER_ITEMS = ["Home", "Courses", "Mentors", "Placements", "Blog", "About"];

const NavigationMenus = () => (
  <AdminLayout
    title="Navigation Menus"
    subtitle="Header, footer, and mobile drawer menus."
    actions={<Button size="sm"><Plus size={14} /> New Menu</Button>}
  >
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
      <div className="rounded-xl border border-border bg-card lg:col-span-1">
        {navMenus.map((m, i) => (
          <button key={m.id} className={`flex w-full items-center justify-between border-border px-5 py-4 text-left ${i !== navMenus.length - 1 ? "border-b" : ""} ${i === 0 ? "bg-secondary/40" : "hover:bg-secondary/40"}`}>
            <div className="flex items-center gap-3">
              <MenuIcon size={14} className="text-muted-foreground" />
              <div>
                <div className="text-sm font-medium">{m.location}</div>
                <div className="text-[11px] text-muted-foreground">{m.items} items · edited {m.lastEdited}</div>
              </div>
            </div>
          </button>
        ))}
      </div>

      <div className="rounded-xl border border-border bg-card p-5 lg:col-span-2">
        <h3 className="text-sm font-semibold">Header Menu — Items</h3>
        <p className="text-xs text-muted-foreground">Drag to reorder</p>
        <ul className="mt-4 space-y-2">
          {HEADER_ITEMS.map((it) => {
            // assume slug is lowercase, hyphen-separated
            const slug = it.toLowerCase().replace(/\s+/g, '-');
            return (
              <li key={it} className="flex items-center gap-3 rounded-lg border border-border bg-secondary/30 px-3 py-2.5">
                <GripVertical size={14} className="text-muted-foreground" />
                <span className="flex-1 text-sm font-medium">{it}</span>
                <Link to={`/admin/cms?page=${encodeURIComponent(slug)}`} className="text-xs text-muted-foreground hover:text-foreground">Edit</Link>
              </li>
            );
          })}
        </ul>
        <Button variant="outline" size="sm" className="mt-3"><Plus size={14} /> Add Item</Button>
      </div>
    </div>
  </AdminLayout>
);

export default NavigationMenus;
