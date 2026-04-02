import { useEffect, useState, useMemo } from "react";
import { supabase } from "../../lib/supabase";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line
} from "recharts";
import { DollarSign, TrendingUp, AlertCircle, Briefcase } from "lucide-react";

const COLORS = ["#3b82f6", "#10b981", "#8b5cf6", "#f59e0b", "#ef4444", "#06b6d4"];

export default function Analytics() {
  const [loading, setLoading] = useState(true);
  const [invoices, setInvoices] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [clients, setClients] = useState([]);
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    async function fetchData() {
      const [iRes, eRes, cRes, pRes] = await Promise.all([
        supabase.from("invoices").select("id, client_id, total, status, issue_date"),
        supabase.from("expenses").select("id, amount, date"),
        supabase.from("clients").select("id, name"),
        supabase.from("projects").select("id, status")
      ]);
      if (iRes.data) setInvoices(iRes.data);
      if (eRes.data) setExpenses(eRes.data);
      if (cRes.data) setClients(cRes.data);
      if (pRes.data) setProjects(pRes.data);
      setLoading(false);
    }
    fetchData();
  }, []);

  // 1. Summary Cards Logic
  const stats = useMemo(() => {
    let totalRevenue = 0;
    let thisMonthRevenue = 0;
    let pendingAmount = 0;
    let totalExpenses = 0;

    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    invoices.forEach(inv => {
      const amount = Number(inv.total) || 0;
      if (inv.status === "paid") {
        totalRevenue += amount;
        const d = new Date(inv.issue_date);
        if (d.getMonth() === currentMonth && d.getFullYear() === currentYear) {
          thisMonthRevenue += amount;
        }
      } else if (["sent", "draft"].includes(inv.status)) {
        pendingAmount += amount;
      }
    });

    expenses.forEach(exp => {
      totalExpenses += Number(exp.amount) || 0;
    });

    return {
      revenue: totalRevenue,
      thisMonth: thisMonthRevenue,
      pending: pendingAmount,
      profit: totalRevenue - totalExpenses
    };
  }, [invoices, expenses]);

  // 2. Monthly Revenue Bar Chart (Last 12 Months)
  const monthlyRevenueData = useMemo(() => {
    const dataMap = {};
    for (let i = 11; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      dataMap[key] = { month: d.toLocaleString('default', { month: 'short' }), revenue: 0 };
    }
    invoices.forEach(inv => {
      if (inv.status === "paid" && inv.issue_date) {
        const d = new Date(inv.issue_date);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
        if (dataMap[key]) dataMap[key].revenue += Number(inv.total) || 0;
      }
    });
    return Object.values(dataMap);
  }, [invoices]);

  // 3. Revenue by Client Pie Chart (Top 5)
  const clientRevenueData = useMemo(() => {
    const map = {};
    const clientLookup = Object.fromEntries(clients.map(c => [c.id, c.name]));
    
    invoices.forEach(inv => {
      if (inv.status === "paid" && inv.client_id) {
        map[inv.client_id] = (map[inv.client_id] || 0) + (Number(inv.total) || 0);
      }
    });
    
    return Object.entries(map)
      .map(([id, value]) => ({ name: clientLookup[id] || "Unknown Client", value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
  }, [invoices, clients]);

  // 4. Project Status Donut Chart
  const projectStatusData = useMemo(() => {
    const counts = { lead: 0, in_progress: 0, review: 0, completed: 0, cancelled: 0 };
    projects.forEach(p => {
      if (counts[p.status] !== undefined) counts[p.status]++;
    });
    return [
      { name: "Lead", value: counts.lead, color: "#60a5fa" },
      { name: "In Progress", value: counts.in_progress, color: "#f59e0b" },
      { name: "Review", value: counts.review, color: "#c084fc" },
      { name: "Completed", value: counts.completed, color: "#22c55e" },
      { name: "Cancelled", value: counts.cancelled, color: "#ef4444" }
    ].filter(d => d.value > 0);
  }, [projects]);

  // 5. Expense vs Revenue Line Chart (Last 6 Months)
  const lineChartData = useMemo(() => {
    const dataMap = {};
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      dataMap[key] = { month: d.toLocaleString('default', { month: 'short' }), revenue: 0, expenses: 0 };
    }
    
    invoices.forEach(inv => {
      if (inv.status === "paid" && inv.issue_date) {
        const d = new Date(inv.issue_date);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
        if (dataMap[key]) dataMap[key].revenue += Number(inv.total) || 0;
      }
    });
    
    expenses.forEach(exp => {
      if (exp.date) {
        const d = new Date(exp.date);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
        if (dataMap[key]) dataMap[key].expenses += Number(exp.amount) || 0;
      }
    });
    
    return Object.values(dataMap);
  }, [invoices, expenses]);

  // 6. Invoice Status Breakdown (Horizontal Bar)
  const invoiceStatusData = useMemo(() => {
    const counts = { paid: 0, sent: 0, overdue: 0, draft: 0, cancelled: 0 };
    invoices.forEach(inv => {
      if (counts[inv.status] !== undefined) counts[inv.status]++;
    });
    return [
      { name: "Paid", count: counts.paid, fill: "#22c55e" },
      { name: "Sent", count: counts.sent, fill: "#3b82f6" },
      { name: "Overdue", count: counts.overdue, fill: "#ef4444" },
      { name: "Draft", count: counts.draft, fill: "#94a3b8" }
    ].filter(d => d.count > 0);
  }, [invoices]);

  if (loading) return <div className="flex h-[80vh] items-center justify-center"><div className="w-8 h-8 rounded-full border-4 border-blue-500 border-t-transparent animate-spin"/></div>;

  // Custom generic tooltip for dark mode
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#0f172a] border border-[#334155] p-3 rounded-lg shadow-xl">
          <p className="text-white text-sm font-semibold mb-2">{label}</p>
          {payload.map((p, i) => (
            <p key={i} className="text-xs" style={{ color: p.color || p.fill }}>
              {p.name}: <span className="font-mono ml-2">{p.value.toLocaleString()}</span>
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6 flex flex-col min-h-screen">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <TrendingUp className="text-blue-500" /> Revenue Analytics
        </h1>
        <p className="text-sm mt-1 text-slate-400">Comprehensive overview of financial and operational performance.</p>
      </div>

      {/* 1. Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { title: "Total Revenue", val: `₹${stats.revenue.toLocaleString()}`, color: "text-emerald-400", icon: DollarSign, bg: "from-emerald-500/20 to-emerald-500/5" },
          { title: "This Month", val: `₹${stats.thisMonth.toLocaleString()}`, color: "text-blue-400", icon: TrendingUp, bg: "from-blue-500/20 to-blue-500/5" },
          { title: "Pending", val: `₹${stats.pending.toLocaleString()}`, color: "text-amber-400", icon: AlertCircle, bg: "from-amber-500/20 to-amber-500/5" },
          { title: "Net Profit", val: `₹${stats.profit.toLocaleString()}`, color: stats.profit >= 0 ? "text-purple-400" : "text-red-400", icon: Briefcase, bg: "from-purple-500/20 to-purple-500/5" },
        ].map((c, i) => (
          <div key={i} className={`p-6 rounded-2xl bg-gradient-to-br ${c.bg} border border-[#1e293b] backdrop-blur-sm relative overflow-hidden`}>
            <div className="relative z-10 flex flex-col gap-2">
              <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">{c.title}</span>
              <span className={`text-3xl font-bold tracking-tight ${c.color}`}>{c.val}</span>
            </div>
            <c.icon className={`absolute right-4 top-1/2 -translate-y-1/2 w-16 h-16 opacity-10 ${c.color}`} />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1">
        
        {/* 2. Monthly Revenue Bar Chart */}
        <div className="p-6 rounded-2xl bg-[#111827] border border-[#1e293b] flex flex-col h-96">
          <h2 className="text-white text-sm font-semibold mb-6 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-blue-500" /> Monthly Revenue (Last 12 Month)
          </h2>
          <div className="flex-1 min-h-0 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyRevenueData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                <XAxis dataKey="month" stroke="#64748b" tick={{ fill: "#64748b", fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis stroke="#64748b" tick={{ fill: "#64748b", fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={v => `₹${v/1000}k`} />
                <RechartsTooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
                <Bar dataKey="revenue" fill="#3b82f6" radius={[4, 4, 0, 0]} maxBarSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 6. Invoice Status Breakdown (Horizontal Bar) */}
        <div className="p-6 rounded-2xl bg-[#111827] border border-[#1e293b] flex flex-col h-96">
          <h2 className="text-white text-sm font-semibold mb-6 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-purple-500" /> Invoice Volumes by Status
          </h2>
          <div className="flex-1 min-h-0 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart layout="vertical" data={invoiceStatusData} margin={{ top: 0, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" horizontal={false} />
                <XAxis type="number" stroke="#64748b" tick={{ fill: "#64748b", fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis dataKey="name" type="category" stroke="#64748b" tick={{ fill: "#64748b", fontSize: 12 }} axisLine={false} tickLine={false} width={80} />
                <RechartsTooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
                <Bar dataKey="count" radius={[0, 4, 4, 0]} barSize={24}>
                  {invoiceStatusData.map((e, index) => <Cell key={`cell-${index}`} fill={e.fill} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 5. Expense vs Revenue Line Chart */}
        <div className="p-6 rounded-2xl bg-[#111827] border border-[#1e293b] flex flex-col h-96 lg:col-span-2">
          <h2 className="text-white text-sm font-semibold mb-6 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500" /> Revenue vs Expenses Profit Margin (Last 6 Months)
          </h2>
          <div className="flex-1 min-h-0 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={lineChartData} margin={{ top: 5, right: 30, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                <XAxis dataKey="month" stroke="#64748b" tick={{ fill: "#64748b", fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis stroke="#64748b" tick={{ fill: "#64748b", fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={v => `₹${v/1000}k`} />
                <RechartsTooltip content={<CustomTooltip />} />
                <Legend iconType="circle" wrapperStyle={{ paddingTop: "20px" }} />
                <Line type="monotone" name="Revenue" dataKey="revenue" stroke="#10b981" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                <Line type="monotone" name="Expenses" dataKey="expenses" stroke="#ef4444" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 3. Revenue by Client Pie Chart */}
        <div className="p-6 rounded-2xl bg-[#111827] border border-[#1e293b] flex flex-col h-[420px]">
          <h2 className="text-white text-sm font-semibold mb-2 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-amber-500" /> Revenue by Client (Top 5)
          </h2>
          <div className="flex-1 min-h-0 w-full relative">
            {clientRevenueData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={clientRevenueData} cx="50%" cy="50%" labelLine={false} outerRadius={120} fill="#8884d8" dataKey="value" stroke="none">
                    {clientRevenueData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                  </Pie>
                  <RechartsTooltip content={<CustomTooltip />} />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            ) : <div className="absolute inset-0 flex items-center justify-center text-slate-500 text-sm">No revenue data found</div>}
          </div>
        </div>

        {/* 4. Project Status Donut Chart */}
        <div className="p-6 rounded-2xl bg-[#111827] border border-[#1e293b] flex flex-col h-[420px]">
          <h2 className="text-white text-sm font-semibold mb-2 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-cyan-500" /> Project Status Distribution
          </h2>
          <div className="flex-1 min-h-0 w-full relative">
            {projectStatusData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={projectStatusData} cx="50%" cy="50%" innerRadius={70} outerRadius={120} fill="#8884d8" dataKey="value" stroke="none" cornerRadius={6} paddingAngle={2}>
                    {projectStatusData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                  </Pie>
                  <RechartsTooltip content={<CustomTooltip />} />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            ) : <div className="absolute inset-0 flex items-center justify-center text-slate-500 text-sm">No projects found</div>}
          </div>
        </div>

      </div>
    </div>
  );
}
