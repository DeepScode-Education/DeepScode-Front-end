import { Download } from "lucide-react";
import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import AdminLayout from "../../components/AdminLayout";
import StatCard from "../../components/StatCard";
import { Button } from "@/components/ui/button";
import { placementAnalytics } from "../../data/mock";

const PlacementAnalytics = () => (
  <AdminLayout
    title="Placement Analytics"
    subtitle="Hiring funnel, offers, and student readiness."
    actions={<Button variant="outline" size="sm"><Download size={14} /> Export</Button>}
  >
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <StatCard label="Placement Rate" value="87%" delta="+2.1%" trend="up" />
      <StatCard label="Avg CTC" value="₹12.4 LPA" delta="+8%" trend="up" />
      <StatCard label="Highest CTC" value="₹28 LPA" delta="+12%" trend="up" />
      <StatCard label="Offers (YTD)" value="234" delta="+34" trend="up" />
    </div>

    <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
      <div className="rounded-xl border border-border bg-card p-5">
        <h3 className="text-sm font-semibold">Monthly Placements</h3>
        <p className="text-xs text-muted-foreground">Placed vs Offers</p>
        <div className="mt-4 h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={placementAnalytics} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
              <Bar dataKey="offers" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
              <Bar dataKey="placed" fill="hsl(160 70% 45%)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="rounded-xl border border-border bg-card p-5">
        <h3 className="text-sm font-semibold">Placement Trend</h3>
        <p className="text-xs text-muted-foreground">Cumulative placements</p>
        <div className="mt-4 h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={placementAnalytics} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
              <Line type="monotone" dataKey="placed" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>

    <div className="mt-6 rounded-xl border border-border bg-card p-5">
      <h3 className="text-sm font-semibold">Student Readiness</h3>
      <p className="text-xs text-muted-foreground">Portfolio · Resume · Mock Interview · Project Showcase</p>
      <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Portfolio Ready", value: 84 },
          { label: "Resume Reviewed", value: 92 },
          { label: "Mock Interview", value: 68 },
          { label: "Project Showcase", value: 76 },
        ].map((r) => (
          <div key={r.label}>
            <div className="flex items-center justify-between">
              <span className="text-xs">{r.label}</span>
              <span className="text-xs font-semibold">{r.value}%</span>
            </div>
            <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-secondary">
              <div className="h-full rounded-full bg-[#0037FF]" style={{ width: `${r.value}%` }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  </AdminLayout>
);

export default PlacementAnalytics;
