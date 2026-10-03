import { Image as ImageIcon, Upload } from "lucide-react";
import AdminLayout from "../components/AdminLayout";
import { Button } from "@/components/ui/button";

const items = Array.from({ length: 12 }).map((_, i) => ({
  id: `m-${i}`,
  name: `asset-${i + 1}.${i % 3 === 0 ? "mp4" : "jpg"}`,
  size: `${(Math.random() * 4 + 0.2).toFixed(1)} MB`,
  hue: 200 + i * 15,
}));

const Media = () => (
  <AdminLayout
    title="Media Library"
    subtitle="Images, videos, and documents."
    actions={<Button size="sm"><Upload size={14} /> Upload</Button>}
  >
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
      {items.map((m) => (
        <div key={m.id} className="overflow-hidden rounded-xl border border-border bg-card">
          <div
            className="aspect-square w-full"
            style={{ background: `linear-gradient(135deg, hsl(${m.hue} 70% 70%), hsl(${m.hue + 30} 70% 50%))` }}
          >
            <div className="flex h-full items-center justify-center text-white/80">
              <ImageIcon size={28} />
            </div>
          </div>
          <div className="p-2.5">
            <div className="truncate text-xs font-medium">{m.name}</div>
            <div className="text-[10px] text-muted-foreground">{m.size}</div>
          </div>
        </div>
      ))}
    </div>
  </AdminLayout>
);

export default Media;
