import { MODULES, ACTIONS } from "../../lib/permissions";
import { Check, Lock } from "lucide-react";

const ACTION_LABELS = {
  can_view: "View",
  can_create: "Create",
  can_edit: "Edit",
  can_delete: "Delete",
};

export default function PermissionGrid({ permissions, onChange, readOnly = false }) {
  const handleToggle = (moduleKey, action) => {
    if (readOnly) return;
    const current = permissions[moduleKey]?.[action] || false;
    onChange(moduleKey, action, !current);
  };

  return (
    <div className="rounded-xl overflow-hidden" style={{ border: "1px solid #334155" }}>
      {/* Header */}
      <div className="grid grid-cols-5 gap-0" style={{ background: "#0f172a" }}>
        <div className="px-4 py-3">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Module</span>
        </div>
        {ACTIONS.map(a => (
          <div key={a} className="px-3 py-3 text-center">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">{ACTION_LABELS[a]}</span>
          </div>
        ))}
      </div>

      {/* Rows */}
      {MODULES.map((mod, i) => {
        const modPerms = permissions[mod.key] || {};
        return (
          <div
            key={mod.key}
            className="grid grid-cols-5 gap-0 items-center transition-colors hover:bg-slate-800/50"
            style={{
              background: i % 2 === 0 ? "#1e293b" : "#1a2332",
              borderTop: "1px solid #334155",
            }}
          >
            <div className="px-4 py-3">
              <span className="text-sm font-medium text-slate-200">{mod.label}</span>
            </div>
            {ACTIONS.map(action => {
              const checked = !!modPerms[action];
              return (
                <div key={action} className="flex justify-center py-3">
                  <button
                    type="button"
                    onClick={() => handleToggle(mod.key, action)}
                    disabled={readOnly}
                    className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all ${
                      readOnly ? "cursor-not-allowed opacity-60" : "cursor-pointer hover:scale-110"
                    } ${
                      checked
                        ? "bg-blue-500/20 border-blue-500/50 text-blue-400"
                        : "bg-slate-700/30 border-slate-600/50 text-slate-600"
                    }`}
                    style={{ border: `1.5px solid ${checked ? "rgba(59,130,246,0.5)" : "rgba(71,85,105,0.5)"}` }}
                  >
                    {checked ? <Check size={14} strokeWidth={3} /> : null}
                    {readOnly && !checked && <Lock size={10} />}
                  </button>
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}
