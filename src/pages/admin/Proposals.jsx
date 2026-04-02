import { useEffect, useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import {
  FileSignature, Plus, Search, Trash2, Edit3, Eye, FileDown, Clock, CheckCircle2, XCircle, ChevronRight, Send
} from "lucide-react";

const STATUS_META = {
  draft: { label: "Draft", color: "#94a3b8", bg: "rgba(148,163,184,0.1)", icon: Edit3 },
  sent: { label: "Sent", color: "#60a5fa", bg: "rgba(59,130,246,0.1)", icon: Send },
  accepted: { label: "Accepted", color: "#4ade80", bg: "rgba(34,197,94,0.1)", icon: CheckCircle2 },
  rejected: { label: "Rejected", color: "#f87171", bg: "rgba(239,68,68,0.1)", icon: XCircle },
};

export default function Proposals() {
  const [proposals, setProposals] = useState([]);
  const [clients, setClients] = useState({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => { fetchAll(); }, []);

  async function fetchAll() {
    const [p, c] = await Promise.all([
      supabase.from("proposals").select("*").order("created_at", { ascending: false }),
      supabase.from("clients").select("id, name, company")
    ]);
    
    if (c.data) {
      const cmap = {};
      c.data.forEach(client => cmap[client.id] = client.company || client.name);
      setClients(cmap);
    }
    
    if (p.data) setProposals(p.data);
    setLoading(false);
  }

  async function createDraft() {
    const newProposal = {
      title: "Untitled Proposal",
      status: "draft",
      content: {
        overview: "Provide a brief overview of the project here.",
        scope: ["Initial consultation and strategy", "Design and development phase"],
        timeline: [{ milestone: "Project Kickoff", date: "" }],
        pricing: [{ desc: "Standard Web Development", cost: 0 }],
        terms: "Payment terms: 50% upfront, 50% upon completion."
      },
      total_estimate: 0
    };

    const { data, error } = await supabase.from("proposals").insert(newProposal).select().single();
    if (data && !error) {
      navigate(`/admin/proposals/${data.id}`);
    } else {
      alert("Failed to create proposal.");
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    
    const { error } = await supabase.from("proposals").delete().eq("id", deleteTarget.id);
    if (error) {
       console.error("Delete error:", error);
       alert("Could not delete proposal: " + error.message);
    } else {
       setProposals(prev => prev.filter(p => p.id !== deleteTarget.id));
    }
    
    setDeleting(false);
    setDeleteTarget(null);
  }

  const filtered = proposals.filter(p => 
    (p.title || "").toLowerCase().includes(search.toLowerCase()) || 
    (clients[p.client_id] || "").toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div className="flex h-64 items-center justify-center"><div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <FileSignature className="text-blue-500" /> Proposals
          </h1>
          <p className="text-sm mt-1" style={{ color: "#94a3b8" }}>{proposals.length} total proposals generated</p>
        </div>
        
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search proposals..." className="w-full pl-9 pr-4 py-2 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50" style={{ background: "#111827", border: "1px solid #334155", color: "#f1f5f9" }} />
          </div>
          <button onClick={createDraft} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 text-white text-sm font-semibold hover:opacity-90 transition-opacity shadow-lg shadow-blue-500/20 whitespace-nowrap">
            <Plus size={16} /> New Proposal
          </button>
        </div>
      </div>

      {/* List */}
      <div className="rounded-2xl overflow-hidden shadow-2xl" style={{ background: "#1e293b", border: "1px solid #334155" }}>
        <table className="w-full text-left">
          <thead>
            <tr style={{ borderBottom: "1px solid #334155", background: "#0f172a" }}>
              <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-400">Title & Client</th>
              <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-400">Status</th>
              <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-400">Estimate</th>
              <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-400">Valid Until</th>
              <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-right text-slate-400">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#334155]">
            {filtered.length === 0 ? (
              <tr><td colSpan={5} className="px-6 py-12 text-center text-sm text-slate-400">No proposals found. Create one to land a client!</td></tr>
            ) : filtered.map(proposal => {
              const meta = STATUS_META[proposal.status] || STATUS_META.draft;
              const StatusIcon = meta.icon;
              return (
                <tr key={proposal.id} className="group hover:bg-slate-800/50 transition-colors">
                  <td className="px-6 py-4">
                    <Link to={`/admin/proposals/${proposal.id}`} className="block">
                      <p className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors flex items-center gap-1.5">{proposal.title} <ChevronRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" /></p>
                      <p className="text-xs mt-1 text-slate-400 font-medium">For: {proposal.client_id ? clients[proposal.client_id] : "Unassigned"}</p>
                    </Link>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold tracking-wide" style={{ background: meta.bg, color: meta.color }}>
                      <StatusIcon size={12} /> {meta.label}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-semibold text-slate-300">
                      ₹{Number(proposal.total_estimate || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-xs text-slate-400">
                    {proposal.valid_until ? (
                      <span className="flex items-center gap-1.5"><Clock size={12} /> {new Date(proposal.valid_until).toLocaleDateString()}</span>
                    ) : "—"}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link to={`/admin/proposals/${proposal.id}`} className="p-2 rounded-lg hover:bg-blue-500/10 text-slate-400 hover:text-blue-400 transition-colors"><Edit3 size={16} /></Link>
                      <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); setDeleteTarget(proposal); }} className="p-2 rounded-lg hover:bg-red-500/10 text-slate-400 hover:text-red-400 transition-colors"><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Delete Dialog */}
      {deleteTarget && (
        <>
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[70]" onClick={() => setDeleteTarget(null)} />
          <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-sm rounded-2xl p-6 z-[71] space-y-4 shadow-2xl" style={{ background: "#1e293b", border: "1px solid #334155" }}>
            <div className="w-12 h-12 rounded-full mx-auto flex items-center justify-center bg-red-500/10"><Trash2 size={24} className="text-red-400" /></div>
            <div className="text-center">
              <h3 className="text-lg font-bold text-white">Delete Proposal</h3>
              <p className="text-sm mt-2 text-slate-400">Are you sure you want to delete <span className="text-white">"{deleteTarget.title}"</span>?</p>
            </div>
            <div className="flex gap-3 mt-4">
              <button onClick={() => setDeleteTarget(null)} className="flex-1 py-2.5 rounded-xl border border-slate-600 text-slate-300 font-medium hover:bg-slate-800">Cancel</button>
              <button onClick={handleDelete} disabled={deleting} className="flex-1 py-2.5 rounded-xl bg-red-500 text-white font-bold hover:bg-red-600 disabled:opacity-50">Delete</button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
