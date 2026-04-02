import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { usePermissions } from "../../hooks/usePermissions";
import { useNavigate } from "react-router-dom";
import {
  UserPlus, Shield, ShieldAlert, ShieldCheck, Eye, MoreVertical,
  User, Trash2, UserX, UserCheck, Clock, Loader2, ChevronDown
} from "lucide-react";
import InviteMemberModal from "../../components/admin/InviteMemberModal";
import { ROLE_COLORS } from "../../lib/permissions";

export default function Team() {
  const { profile, isOwner, isAdmin, hasPermission } = usePermissions();
  const navigate = useNavigate();
  const [members, setMembers] = useState([]);
  const [invites, setInvites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showInvite, setShowInvite] = useState(false);
  const [actionMenu, setActionMenu] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  useEffect(() => { fetchData(); }, []);

  async function fetchData() {
    setLoading(true);
    const [mRes, iRes] = await Promise.all([
      supabase.from("profiles").select("*").order("created_at"),
      supabase.from("team_invites").select("*").eq("accepted", false).order("created_at", { ascending: false }),
    ]);
    if (mRes.data) setMembers(mRes.data);
    if (iRes.data) setInvites(iRes.data);
    setLoading(false);
  }

  async function toggleActive(member) {
    if (member.role === "owner") return;
    await supabase.from("profiles").update({ is_active: !member.is_active }).eq("id", member.id);
    fetchData();
  }

  async function removeMember(member) {
    if (member.role === "owner") return;
    // Remove profile + permissions (cascade) - keep auth.users for audit
    await supabase.from("profiles").delete().eq("id", member.id);
    setConfirmDelete(null);
    fetchData();
  }

  async function revokeInvite(inviteId) {
    await supabase.from("team_invites").delete().eq("id", inviteId);
    fetchData();
  }

  const ROLE_ICONS = {
    owner: ShieldAlert,
    admin: ShieldCheck,
    manager: Shield,
    viewer: Eye,
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-blue-500" size={32} /></div>;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Team Management</h1>
          <p className="text-sm mt-1 text-slate-400">Manage team members and their access permissions.</p>
        </div>
        {(isOwner || isAdmin) && (
          <button
            onClick={() => setShowInvite(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 text-white text-sm font-bold shadow-lg shadow-blue-500/25 hover:opacity-90 transition-opacity"
          >
            <UserPlus size={16} /> Invite Member
          </button>
        )}
      </div>

      {/* Members Table */}
      <div className="rounded-2xl overflow-hidden shadow-xl" style={{ background: "linear-gradient(135deg, #1e293b, #0f172a)", border: "1px solid #334155" }}>
        <div className="px-6 py-4" style={{ borderBottom: "1px solid #334155" }}>
          <h2 className="text-sm font-bold text-white uppercase tracking-wider">Active Members ({members.length})</h2>
        </div>
        <div className="divide-y" style={{ borderColor: "#334155" }}>
          {members.map(member => {
            const rc = ROLE_COLORS[member.role] || ROLE_COLORS.viewer;
            const RoleIcon = ROLE_ICONS[member.role] || Eye;
            const isMe = member.id === profile?.id;
            return (
              <div key={member.id} className="flex items-center justify-between px-6 py-4 hover:bg-slate-800/30 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold">
                    {member.avatar_url ? (
                      <img src={member.avatar_url} alt="" className="w-full h-full rounded-full object-cover" />
                    ) : (
                      (member.full_name || member.email || "?").charAt(0).toUpperCase()
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-white">{member.full_name || "Unnamed"}</span>
                      {isMe && <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-blue-500/20 text-blue-400">YOU</span>}
                    </div>
                    <span className="text-xs text-slate-400">{member.email}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {/* Role Badge */}
                  <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold capitalize" style={{ background: rc.bg, color: rc.color, border: `1px solid ${rc.border}` }}>
                    <RoleIcon size={12} /> {member.role}
                  </span>
                  
                  {/* Status */}
                  <span className={`px-2 py-1 rounded-lg text-xs font-semibold ${member.is_active ? "bg-green-500/10 text-green-400 border border-green-500/30" : "bg-red-500/10 text-red-400 border border-red-500/30"}`}>
                    {member.is_active ? "Active" : "Inactive"}
                  </span>

                  {/* Actions */}
                  {(isOwner || (isAdmin && member.role !== "owner")) && !isMe && (
                    <div className="relative">
                      <button
                        onClick={() => setActionMenu(actionMenu === member.id ? null : member.id)}
                        className="p-2 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
                      >
                        <MoreVertical size={16} />
                      </button>
                      {actionMenu === member.id && (
                        <div className="absolute right-0 top-10 w-48 rounded-xl shadow-2xl py-1 z-50" style={{ background: "#1e293b", border: "1px solid #334155" }}>
                          <button
                            onClick={() => { navigate(`/admin/team/${member.id}`); setActionMenu(null); }}
                            className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
                          >
                            <Shield size={14} /> Edit Permissions
                          </button>
                          {member.role !== "owner" && (
                            <>
                              <button
                                onClick={() => { toggleActive(member); setActionMenu(null); }}
                                className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
                              >
                                {member.is_active ? <UserX size={14} /> : <UserCheck size={14} />}
                                {member.is_active ? "Deactivate" : "Reactivate"}
                              </button>
                              {isOwner && (
                                <button
                                  onClick={() => { setConfirmDelete(member); setActionMenu(null); }}
                                  className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                                >
                                  <Trash2 size={14} /> Remove Member
                                </button>
                              )}
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Pending Invites */}
      {invites.length > 0 && (
        <div className="rounded-2xl overflow-hidden shadow-xl" style={{ background: "linear-gradient(135deg, #1e293b, #0f172a)", border: "1px solid #334155" }}>
          <div className="px-6 py-4" style={{ borderBottom: "1px solid #334155" }}>
            <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Clock size={14} className="text-amber-400" /> Pending Invites ({invites.length})
            </h2>
          </div>
          <div className="divide-y" style={{ borderColor: "#334155" }}>
            {invites.map(inv => {
              const rc = ROLE_COLORS[inv.role] || ROLE_COLORS.viewer;
              const isExpired = new Date(inv.expires_at) < new Date();
              return (
                <div key={inv.id} className="flex items-center justify-between px-6 py-4">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center text-slate-400">
                      <User size={18} />
                    </div>
                    <div>
                      <span className="text-sm font-medium text-white">{inv.email}</span>
                      <div className="text-xs text-slate-400 mt-0.5">
                        Invited {new Date(inv.created_at).toLocaleDateString()} • 
                        {isExpired ? <span className="text-red-400 ml-1">Expired</span> : <span className="text-amber-400 ml-1">Pending</span>}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="px-2.5 py-1 rounded-lg text-xs font-bold capitalize" style={{ background: rc.bg, color: rc.color, border: `1px solid ${rc.border}` }}>
                      {inv.role}
                    </span>
                    <button onClick={() => revokeInvite(inv.id)} className="p-2 rounded-lg hover:bg-red-500/10 text-slate-400 hover:text-red-400 transition-colors">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {confirmDelete && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setConfirmDelete(null)} />
          <div className="relative w-full max-w-sm rounded-2xl p-6 shadow-2xl" style={{ background: "#1e293b", border: "1px solid #334155" }}>
            <h3 className="text-lg font-bold text-white mb-2">Remove Team Member?</h3>
            <p className="text-sm text-slate-400 mb-6">This will permanently remove <strong className="text-white">{confirmDelete.full_name || confirmDelete.email}</strong> from the team. Their permissions and profile will be deleted.</p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmDelete(null)} className="flex-1 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-white border border-slate-700 hover:bg-slate-800 transition-colors">Cancel</button>
              <button onClick={() => removeMember(confirmDelete)} className="flex-1 py-2.5 rounded-xl text-sm font-bold bg-red-600 text-white hover:bg-red-500 transition-colors">Remove</button>
            </div>
          </div>
        </div>
      )}

      <InviteMemberModal
        open={showInvite}
        onClose={() => setShowInvite(false)}
        onInvited={fetchData}
        currentUserProfileId={profile?.id}
      />
    </div>
  );
}
