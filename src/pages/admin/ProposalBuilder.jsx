import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import {
  ArrowLeft, Save, Send, Printer, Plus, Trash2, CheckCircle2, ChevronDown, AlignLeft, Download, DollarSign
} from "lucide-react";
import { BlobProvider } from "@react-pdf/renderer";
import ProposalPDF from "./ProposalPDF";

export default function ProposalBuilder() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [proposal, setProposal] = useState(null);
  const [clients, setClients] = useState([]);
  const [saving, setSaving] = useState(false);
  
  // Split pane state
  const [activeTab, setActiveTab] = useState("editor"); // 'editor' or 'preview' on mobile

  useEffect(() => {
    fetchData();
  }, [id]);

  async function fetchData() {
    const [pRes, cRes] = await Promise.all([
      supabase.from("proposals").select("*").eq("id", id).single(),
      supabase.from("clients").select("*").order("name")
    ]);
    if (pRes.data) {
      if (!pRes.data.content) {
        pRes.data.content = { overview: "", scope: [], timeline: [], pricing: [], terms: "" };
      }
      setProposal(pRes.data);
    }
    if (cRes.data) setClients(cRes.data);
  }

  const updateField = (field, value) => {
    setProposal(prev => ({ ...prev, [field]: value }));
  };

  const updateContent = (field, value) => {
    setProposal(prev => {
      const newContent = { ...(prev.content || {}), [field]: value };
      // Auto-calculate estimate if pricing changed
      let newEstimate = prev.total_estimate;
      if (field === 'pricing') {
        newEstimate = newContent.pricing.reduce((sum, item) => sum + (Number(item.cost) || 0), 0);
      }
      return { ...prev, content: newContent, total_estimate: newEstimate };
    });
  };

  const handleSave = async () => {
    setSaving(true);
    const { error } = await supabase.from("proposals").update({
      title: proposal.title,
      client_id: proposal.client_id,
      valid_until: proposal.valid_until,
      content: proposal.content,
      total_estimate: proposal.total_estimate,
      status: proposal.status
    }).eq("id", id);
    setSaving(false);
    if (error) alert("Failed to save.");
  };

  const markStatus = async (status) => {
    await supabase.from("proposals").update({ status }).eq("id", id);
    setProposal(prev => ({ ...prev, status }));
  };



  const handleSend = () => {
    const c = clients.find(cl => cl.id === proposal.client_id);
    if (!c?.email) return alert("Client has no email.");
    const subject = encodeURIComponent(`Proposal: ${proposal.title}`);
    const body = encodeURIComponent(`Hi ${c.name},\n\nPlease find our proposal attached.\n\nThank you,\nHarsh Gupta`);
    window.open(`mailto:${c.email}?subject=${subject}&body=${body}`);
  };

  if (!proposal) return <div className="flex h-64 items-center justify-center"><div className="w-8 h-8 rounded-full border-4 border-blue-500 border-t-transparent animate-spin"/></div>;

  const content = proposal.content || {};

  return (
    <div className="flex flex-col h-[calc(100vh-theme(spacing.16))] -m-8">
      {/* Top Action Bar */}
      <div className="flex items-center justify-between px-8 py-4 bg-[#0f172a] border-b border-[#334155] shrink-0 print:hidden">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate("/admin/proposals")} className="p-2 rounded-lg hover:bg-white/10 text-slate-400">
            <ArrowLeft size={20} />
          </button>
          <div>
            <input 
              value={proposal.title} 
              onChange={e => updateField("title", e.target.value)}
              className="text-xl font-bold text-white bg-transparent border-none outline-none focus:ring-0 p-0 hover:bg-[#1e293b] rounded px-2 -ml-2"
            />
            <div className="text-xs text-slate-400 font-medium px-2 -ml-2 flex items-center gap-2 mt-1">
              Status: <span className="uppercase text-blue-400">{proposal.status}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {proposal.status === 'draft' && <button onClick={() => markStatus('sent')} className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm bg-blue-500/10 text-blue-400 hover:bg-blue-500/20"><Send size={14}/> Mark Sent</button>}
          {proposal.status === 'sent' && <button onClick={() => markStatus('accepted')} className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm bg-green-500/10 text-green-400 hover:bg-green-500/20"><CheckCircle2 size={14}/> Mark Accepted</button>}
          {proposal.status === 'accepted' && (
            <Link to="/admin/invoices/new" state={{ clientId: proposal.client_id, invoiceTotal: proposal.total_estimate, proposalRef: proposal.title }} className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm bg-purple-500/10 text-purple-400 hover:bg-purple-500/20 font-bold shadow-[0_0_15px_rgba(168,85,247,0.2)] border border-purple-500/30 transition-all hover:scale-105">
              <DollarSign size={14} /> Generate Invoice
            </Link>
          )}
          <button onClick={handleSend} className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm bg-slate-800 text-slate-300 hover:bg-slate-700 border border-[#334155]"><Send size={14} /> Email</button>
          
          <BlobProvider document={<ProposalPDF proposal={proposal} client={clients.find(c => c.id === proposal.client_id)} />}>
            {({ url, loading }) => (
              <a
                href={url}
                download={`${proposal.title || 'Proposal'}.pdf`}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm bg-gradient-to-r from-blue-600 to-blue-500 text-white font-semibold hover:opacity-90 transition-opacity ml-1 ${loading ? 'opacity-50 pointer-events-none' : ''}`}
              >
                <Download size={14} /> {loading ? "..." : "Download PDF"}
              </a>
            )}
          </BlobProvider>

          <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm bg-blue-600 hover:bg-blue-500 text-white font-medium ml-2">
            <Save size={14} /> {saving ? "Saving..." : "Save Draft"}
          </button>
        </div>
      </div>

      {/* Main Split Layout */}
      <div className="flex flex-1 overflow-hidden print:overflow-visible">
        
        {/* LEFT PANE: EDITOR */}
        <div className="w-1/2 overflow-y-auto p-8 border-r border-[#334155] print:hidden bg-[#0f172a]" style={{ height: "calc(100vh - 128px)" }}>
          <div className="max-w-xl mx-auto space-y-8">
            
            {/* Metadata row */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase text-slate-400">Client</label>
                <select value={proposal.client_id || ""} onChange={e => updateField("client_id", e.target.value)} className="w-full bg-[#1e293b] border border-[#334155] text-slate-200 rounded-lg p-2.5 text-sm focus:outline-none focus:border-blue-500">
                  <option value="">Select a Client...</option>
                  {clients.map(c => <option key={c.id} value={c.id}>{c.company || c.name}</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase text-slate-400">Valid Until</label>
                <input type="date" value={proposal.valid_until || ""} onChange={e => updateField("valid_until", e.target.value)} className="w-full bg-[#1e293b] border border-[#334155] text-slate-200 rounded-lg p-2.5 text-sm focus:outline-none focus:border-blue-500" />
              </div>
            </div>

            {/* Overview markdown */}
            <div className="space-y-1.5" data-color-mode="dark">
              <label className="text-xs font-semibold uppercase text-slate-400 flex items-center gap-2"><AlignLeft size={14}/> Executive Summary</label>
              <textarea 
                value={content.overview || ""} 
                onChange={e => updateContent('overview', e.target.value)}
                className="w-full h-48 bg-[#1e293b] border border-[#334155] text-slate-200 rounded-lg p-3 text-sm focus:outline-none focus:border-blue-500 resize-y"
                placeholder="Enter executive summary here..."
              />
            </div>

            {/* Scope of Work */}
            <div className="space-y-3 p-5 rounded-xl border border-[#334155] bg-[#1e293b]/50">
              <div className="flex justify-between items-center">
                <label className="text-xs font-semibold uppercase text-slate-400">Scope of Work</label>
                <button onClick={() => updateContent("scope", [...(content.scope || []), ""])} className="text-blue-400 hover:text-blue-300 text-sm flex items-center gap-1"><Plus size={14}/> Add Item</button>
              </div>
              <div className="space-y-2">
                {(content.scope || []).map((item, i) => (
                  <div key={i} className="flex gap-2">
                    <input value={item} onChange={e => {
                      const s = [...content.scope]; s[i] = e.target.value; updateContent("scope", s);
                    }} className="flex-1 bg-[#0f172a] border border-[#334155] text-slate-200 rounded-lg py-1.5 px-3 text-sm focus:outline-none focus:border-blue-500" placeholder="e.g. Design 5 core pages..." />
                    <button onClick={() => updateContent("scope", content.scope.filter((_, idx) => idx !== i))} className="p-1.5 text-slate-500 hover:text-red-400"><Trash2 size={16}/></button>
                  </div>
                ))}
                {(!content.scope || content.scope.length === 0) && <p className="text-sm text-slate-500 italic">No scope items added.</p>}
              </div>
            </div>

            {/* Timeline */}
            <div className="space-y-3 p-5 rounded-xl border border-[#334155] bg-[#1e293b]/50">
              <div className="flex justify-between items-center">
                <label className="text-xs font-semibold uppercase text-slate-400">Timeline & Milestones</label>
                <button onClick={() => updateContent("timeline", [...(content.timeline || []), { milestone: "", date: "" }])} className="text-blue-400 hover:text-blue-300 text-sm flex items-center gap-1"><Plus size={14}/> Add Milestone</button>
              </div>
              <div className="space-y-2">
                {(content.timeline || []).map((item, i) => (
                  <div key={i} className="flex gap-2">
                    <input value={item.milestone} onChange={e => {
                      const t = [...content.timeline]; t[i].milestone = e.target.value; updateContent("timeline", t);
                    }} className="flex-1 bg-[#0f172a] border border-[#334155] text-slate-200 rounded-lg py-1.5 px-3 text-sm focus:outline-none focus:border-blue-500" placeholder="Milestone description" />
                    <input value={item.date} onChange={e => {
                      const t = [...content.timeline]; t[i].date = e.target.value; updateContent("timeline", t);
                    }} className="w-32 bg-[#0f172a] border border-[#334155] text-slate-200 rounded-lg py-1.5 px-3 text-sm focus:outline-none focus:border-blue-500" placeholder="e.g. Week 2" />
                    <button onClick={() => updateContent("timeline", content.timeline.filter((_, idx) => idx !== i))} className="p-1.5 text-slate-500 hover:text-red-400"><Trash2 size={16}/></button>
                  </div>
                ))}
              </div>
            </div>

            {/* Pricing */}
            <div className="space-y-3 p-5 rounded-xl border border-blue-500/20 bg-blue-500/5">
              <div className="flex justify-between items-center">
                <label className="text-xs font-semibold uppercase text-blue-400">Pricing Estimate</label>
                <button onClick={() => updateContent("pricing", [...(content.pricing || []), { desc: "", cost: 0 }])} className="text-blue-400 hover:text-blue-300 text-sm flex items-center gap-1"><Plus size={14}/> Add Cost</button>
              </div>
              <div className="space-y-2">
                {(content.pricing || []).map((item, i) => (
                  <div key={i} className="flex gap-2">
                    <input value={item.desc} onChange={e => {
                      const p = [...content.pricing]; p[i].desc = e.target.value; updateContent("pricing", p);
                    }} className="flex-1 bg-[#0f172a] border border-[#334155] text-slate-200 rounded-lg py-1.5 px-3 text-sm focus:outline-none focus:border-blue-500" placeholder="Standard Web Build" />
                    <div className="relative w-32">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">₹</span>
                      <input type="number" value={item.cost || ""} onChange={e => {
                        const p = [...content.pricing]; p[i].cost = Number(e.target.value); updateContent("pricing", p);
                      }} className="w-full bg-[#0f172a] border border-[#334155] text-slate-200 rounded-lg py-1.5 pl-7 pr-3 text-sm focus:outline-none focus:border-blue-500" placeholder="0" />
                    </div>
                    <button onClick={() => updateContent("pricing", content.pricing.filter((_, idx) => idx !== i))} className="p-1.5 text-slate-500 hover:text-red-400"><Trash2 size={16}/></button>
                  </div>
                ))}
              </div>
              <div className="text-right pt-2 border-t border-[#334155] text-white">
                Total Estimate: <span className="font-bold text-lg">₹{Number(proposal.total_estimate).toLocaleString("en-IN")}</span>
              </div>
            </div>

            {/* Terms markdown */}
            <div className="space-y-1.5 pb-20" data-color-mode="dark">
              <label className="text-xs font-semibold uppercase text-slate-400">Terms & Conditions</label>
              <textarea 
                value={content.terms || ""} 
                onChange={e => updateContent('terms', e.target.value)}
                className="w-full h-32 bg-[#1e293b] border border-[#334155] text-slate-200 rounded-lg p-3 text-sm focus:outline-none focus:border-blue-500 resize-y"
                placeholder="Enter terms and conditions here..."
              />
            </div>

          </div>
        </div>


        {/* RIGHT PANE: PREVIEW */}
        <div className="w-1/2 overflow-y-auto bg-slate-100 print:w-full print:bg-white" style={{ height: "calc(100vh - 128px)" }}>
          <div className="max-w-[800px] mx-auto my-12 bg-white min-h-[1056px] shadow-2xl print:shadow-none print:m-0 print:h-full">
            
            {/* Print Header */}
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-12 text-white print:!bg-slate-900 !print:text-black">
              <div className="flex justify-between items-end mb-16">
                <div>
                  <h1 className="text-4xl font-bold tracking-tight">PROPOSAL</h1>
                  <p className="text-xl text-slate-400 mt-2">{proposal.title}</p>
                </div>
                <div className="text-right">
                  <h3 className="text-lg font-bold">Harsh Gupta</h3>
                  <p className="text-sm text-slate-400">Frontend Developer & Designer</p>
                  <p className="text-sm text-slate-400">harshgupta24716@gmail.com</p>
                </div>
              </div>
              
              <div className="flex justify-between items-center pt-8 border-t border-slate-700">
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Prepared For</p>
                  <p className="text-lg font-medium mt-1">{clients.find(c => c.id === proposal.client_id)?.name || "—"}</p>
                  <p className="text-sm text-slate-400">{clients.find(c => c.id === proposal.client_id)?.company}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Valid Until</p>
                  <p className="text-lg font-medium mt-1">{proposal.valid_until ? new Date(proposal.valid_until).toLocaleDateString() : "—"}</p>
                </div>
              </div>
            </div>

            {/* Print Body */}
            <div className="p-12 space-y-16 text-slate-800">
              
              {/* Executive Summary */}
              {content.overview && (
                <section>
                  <h2 className="text-xl font-bold text-slate-900 tracking-tight border-b-2 border-slate-200 pb-2 mb-6">1. Executive Summary</h2>
                  <div className="prose prose-slate max-w-none text-sm text-slate-600 whitespace-pre-wrap">
                    {content.overview}
                  </div>
                </section>
              )}

              {/* Scope of Work */}
              {content.scope?.length > 0 && (
                <section>
                  <h2 className="text-xl font-bold text-slate-900 tracking-tight border-b-2 border-slate-200 pb-2 mb-6">2. Scope of Work</h2>
                  <ul className="space-y-3">
                    {content.scope.map((s, i) => (
                      <li key={i} className="flex items-start gap-4">
                        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold mt-0.5">{i+1}</span>
                        <p className="text-sm text-slate-600 leading-relaxed pt-0.5">{s}</p>
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              {/* Timeline */}
              {content.timeline?.length > 0 && (
                <section>
                  <h2 className="text-xl font-bold text-slate-900 tracking-tight border-b-2 border-slate-200 pb-2 mb-6">3. Project Timeline</h2>
                  <div className="relative border-l-2 border-slate-200 ml-3 space-y-8 py-4">
                    {content.timeline.map((t, i) => (
                      <div key={i} className="relative pl-8">
                        <div className="absolute w-4 h-4 rounded-full bg-blue-500 border-4 border-white -left-[9px] top-1"></div>
                        <p className="text-xs font-bold text-blue-600 uppercase tracking-widest">{t.date}</p>
                        <p className="text-sm text-slate-700 font-medium mt-1">{t.milestone}</p>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Pricing */}
              {content.pricing?.length > 0 && (
                <section className="print:break-inside-avoid">
                  <h2 className="text-xl font-bold text-slate-900 tracking-tight border-b-2 border-slate-200 pb-2 mb-6">4. Investment</h2>
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-200">
                        <th className="text-left font-bold text-slate-500 uppercase py-3">Description</th>
                        <th className="text-right font-bold text-slate-500 uppercase py-3 w-32">Estimated Cost</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {content.pricing.map((p, i) => (
                        <tr key={i}>
                          <td className="py-4 text-slate-600">{p.desc || "Untitled Item"}</td>
                          <td className="py-4 text-right font-medium text-slate-800">₹{Number(p.cost).toLocaleString("en-IN")}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="border-t-2 border-slate-900">
                        <td className="py-4 flex justify-end"></td>
                        <td className="py-4 text-right">
                          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Total Estimate</p>
                          <p className="text-2xl font-black text-slate-900 mt-1">₹{Number(proposal.total_estimate).toLocaleString("en-IN")}</p>
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </section>
              )}

              {/* Terms */}
              {content.terms && (
                <section className="print:break-inside-avoid">
                  <h2 className="text-xl font-bold text-slate-900 tracking-tight border-b-2 border-slate-200 pb-2 mb-6">5. Terms & Conditions</h2>
                  <div className="prose prose-slate max-w-none text-xs text-slate-500 whitespace-pre-wrap">
                    {content.terms}
                  </div>
                </section>
              )}

            </div>
          </div>
        </div>
      </div>

      {/* Print CSS Injection */}
      <style>{`
        @media print {
          @page { margin: 0; size: auto; }
          body * { visibility: hidden; }
          .print\\:w-full, .print\\:w-full * { 
            visibility: visible; 
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .print\\:w-full { 
            position: absolute; 
            left: 0; 
            top: 0; 
            width: 100%; 
            height: auto;
            overflow: visible !important;
          }
          .print\\:hidden { display: none !important; }
        }
      `}</style>
    </div>
  );
}
