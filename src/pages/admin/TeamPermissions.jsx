import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import { usePermissions } from "../../hooks/usePermissions";
import PermissionGrid from "../../components/admin/PermissionGrid";
import { getPresetPermissions, MODULES, ROLE_COLORS } from "../../lib/permissions";
import {
  ArrowLeft, Save, Shield, ShieldAlert, ShieldCheck, Eye, RotateCcw, Loader2
} from "lucide-react";

export default function TeamPermissions() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isOwner } = usePermissions();
  const [member, setMember] = useState(null);
  const [perms, setPerms] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => { fetchMember(); }, [id]);

  async function fetchMember() {
    setLoading(true);
    const { data: prof } = await supabase.from("profiles").select("*").eq("id", id).single();
    if (prof) {
      setMember(prof);
      const { data: permRows } = await supabase.from("permissions").select("*").eq("profile_id", id);
      const permMap = {};
      (permRows || []).forEach(p => {
        permMap[p.module] = { can_view: p.can_view, can_create: p.can_create, can_edit: p.can_edit, can_delete: p.can_delete };
      });
      // Fill missing modules with false
      MODULES.forEach(m => {
        if (!permMap[m.key]) permMap[m.key] = { can_view: false, can_create: false, can_edit: false, can_delete: false };
      });
      setPerms(permMap);
    }
    setLoading(false);
  }

  const handleToggle = (moduleKey, action, value) => {
    setPerms(prev => ({
      ...prev,
      [moduleKey]: { ...prev[moduleKey], [action]: value },
    }));
  };

  const applyPreset = (role) => {
    const preset = getPresetPermissions(role);
    setPerms(preset);
  };

  const handleRoleChange = async (newRole) => {
    if (!isOwner) return;
    await supabase.from("profiles").update({ role: newRole }).eq("id", id);
    setMember(prev => ({ ...prev, role: newRole }));
    applyPreset(newRole);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Upsert all permissions
      const rows = MODULES.map(m => ({
        profile_id: id,
        module: m.key,
        can_view: perms[m.key]?.can_view || false,
        can_create: perms[m.key]?.can_create || false,
        can_edit: perms[m.key]?.can_edit || false,
        can_delete: perms[m.key]?.can_delete || false,
      }));

      const { error } = await supabase.from("permissions").upsert(rows, {
        onConflict: "profile_id,module",
      });

      if (error) throw error;
      alert("Permissions saved successfully!");
    } catch (err) {
      alert("Error saving: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-blue-500" size={32} /></div>;
  if (!member) return <div className="text-center py-20 text-slate-400">Member not found.</div>;

  const isOwnerMember = member.role === "owner";
  const rc = ROLE_COLORS[member.role] || ROLE_COLORS.viewer;

  const ROLE_ICONS = { owner: ShieldAlert, admin: ShieldCheck, manager: Shield, viewer: Eye };
  const RoleIcon = ROLE_ICONS[member.role] || Eye;

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button onClick={() => navigate("/admin/team")} className="p-2 rounded-lg hover:bg-white/10 text-slate-400"><ArrowLeft size={20} /></button>
        <div>
          <h1 className="text-2xl font-bold text-white">Edit Permissions</h1>
          <p className="text-sm text-slate-400">Manage access for {member.full_name || member.email}</p>
        </div>
      </div>

      {/* Member Info Card */}
      <div className="p-6 rounded-2xl flex items-center gap-6" style={{ background: "linear-gradient(135deg, #1e293b, #0f172a)", border: "1px solid #334155" }}>
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xl font-bold">
          {member.avatar_url ? (
            <img src={member.avatar_url} alt="" className="w-full h-full rounded-2xl object-cover" />
          ) : (
            (member.full_name || member.email || "?").charAt(0).toUpperCase()
          )}
        </div>
        <div className="flex-1">
          <h2 className="text-lg font-bold text-white">{member.full_name || "Unnamed"}</h2>
          <p className="text-sm text-slate-400">{member.email}</p>
        </div>

        {/* Role Selector */}
        <div className="flex flex-col items-end gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Role</span>
          {isOwnerMember ? (
            <span className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold capitalize" style={{ background: rc.bg, color: rc.color, border: `1px solid ${rc.border}` }}>
              <RoleIcon size={14} /> {member.role}
            </span>
          ) : (
            <select
              value={member.role}
              onChange={e => handleRoleChange(e.target.value)}
              disabled={!isOwner}
              className="px-4 py-2 rounded-xl text-sm font-bold bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-blue-500 capitalize"
            >
              <option value="admin">Admin</option>
              <option value="manager">Manager</option>
              <option value="viewer">Viewer</option>
            </select>
          )}
        </div>
      </div>

      {/* Apply Preset Button */}
      {!isOwnerMember && (
        <div className="flex items-center justify-between">
          <p className="text-xs text-slate-400">Checkboxes below can be customized after applying a preset.</p>
          <button
            onClick={() => applyPreset(member.role)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-slate-300 hover:text-white border border-slate-700 hover:bg-slate-800 transition-colors"
          >
            <RotateCcw size={14} /> Reset to {member.role} Preset
          </button>
        </div>
      )}

      {/* Permission Grid */}
      <PermissionGrid
        permissions={perms}
        onChange={handleToggle}
        readOnly={isOwnerMember}
      />

      {/* Save Button */}
      {!isOwnerMember && (
        <div className="flex justify-end pt-4 sticky bottom-6 z-10">
          <div className="p-4 rounded-2xl flex gap-4 bg-slate-900 border border-slate-700 shadow-2xl backdrop-blur-xl bg-opacity-80">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-8 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 text-white text-sm font-bold shadow-lg shadow-blue-500/25 hover:opacity-90 transition-opacity disabled:opacity-50 min-w-[200px] justify-center"
            >
              {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
              {saving ? "Saving..." : "Save Permissions"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
