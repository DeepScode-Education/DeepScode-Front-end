import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import AdminLayout from "../components/AdminLayout";
import StatCard from "../components/StatCard";
import { revenueSeries, courses } from "../data/mock";

const PIE_COLORS = ["hsl(var(--primary))", "hsl(160 70% 45%)", "hsl(30 90% 55%)", "hsl(280 70% 60%)"];

const popularity = courses.slice(0, 6).map((c) => ({ name: c.name.split(" ").slice(-2).join(" "), value: c.students }));

const Analytics = () => (
  <AdminLayout title="Analytics & Reports" subtitle="Conversion, revenue, and performance insights.">
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <StatCard label="Trial → Paid" value="44.2%" delta="+3.8%" trend="up" />
      <StatCard label="Avg. Time to Convert" value="6.4 days" delta="-12%" trend="up" />
      <StatCard label="Course Completion" value="82%" delta="+4%" trend="up" />
      <StatCard label="NPS" value="68" delta="+5" trend="up" />
    </div>

    <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
      <div className="rounded-xl border border-border bg-card p-5 lg:col-span-2">
        <h3 className="text-sm font-semibold">Revenue trend</h3>
        <div className="mt-4 h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={revenueSeries}>
              <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
              <Line type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" strokeWidth={2.5} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card p-5">
        <h3 className="text-sm font-semibold">Top courses</h3>
        <div className="mt-4 h-72">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={popularity} dataKey="value" nameKey="name" innerRadius={50} outerRadius={90} paddingAngle={2}>
                {popularity.map((_, i) => (
                  <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>

    <div className="mt-6 rounded-xl border border-border bg-card p-5">
      <h3 className="text-sm font-semibold">Course popularity</h3>
      <div className="mt-4 h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={courses.map((c) => ({ name: c.name.split(" ").slice(0, 2).join(" "), students: c.students }))}>
            <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
            <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
            <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
            <Bar dataKey="students" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  </AdminLayout>
);

export default Analytics;
