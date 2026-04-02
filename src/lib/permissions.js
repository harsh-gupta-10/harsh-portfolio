// All permission modules used across the admin panel
export const MODULES = [
  { key: "dashboard", label: "Dashboard" },
  { key: "analytics", label: "Analytics" },
  { key: "clients", label: "Clients" },
  { key: "projects", label: "Projects" },
  { key: "tasks", label: "Tasks" },
  { key: "invoices", label: "Invoices" },
  { key: "proposals", label: "Proposals" },
  { key: "leads", label: "Leads" },
  { key: "messages", label: "Messages" },
  { key: "email_tracker", label: "Email Tracker" },
  { key: "expenses", label: "Expenses" },
  { key: "settings", label: "Settings" },
  { key: "team_settings", label: "Team Settings" },
  { key: "notes", label: "Notes & Whiteboard" },
];

export const ACTIONS = ["can_view", "can_create", "can_edit", "can_delete"];

// Preset definitions: true = checked, false = unchecked
const FULL = { can_view: true, can_create: true, can_edit: true, can_delete: true };
const VIEW_ONLY = { can_view: true, can_create: false, can_edit: false, can_delete: false };
const VCE = { can_view: true, can_create: true, can_edit: true, can_delete: false };
const NONE = { can_view: false, can_create: false, can_edit: false, can_delete: false };

export const ROLE_PRESETS = {
  owner: Object.fromEntries(MODULES.map(m => [m.key, { ...FULL }])),
  admin: Object.fromEntries(MODULES.map(m => [
    m.key,
    m.key === "team_settings" ? { ...VCE } : { ...FULL }
  ])),
  manager: Object.fromEntries(MODULES.map(m => {
    const k = m.key;
    if (["clients", "projects", "tasks", "messages", "notes"].includes(k)) return [k, { ...VCE }];
    if (["invoices", "analytics", "leads", "dashboard", "proposals", "email_tracker", "settings"].includes(k)) return [k, { ...VIEW_ONLY }];
    // expenses, team_settings → no access
    return [k, { ...NONE }];
  })),
  viewer: Object.fromEntries(MODULES.map(m => [
    m.key,
    m.key === "team_settings" ? { ...NONE } : { ...VIEW_ONLY }
  ])),
};

/**
 * Get the preset permission set for a role
 * Returns an object: { module_key: { can_view, can_create, can_edit, can_delete } }
 */
export function getPresetPermissions(role) {
  return ROLE_PRESETS[role] || ROLE_PRESETS.viewer;
}

/**
 * Route path → module key mapping
 */
export const ROUTE_MODULE_MAP = {
  "/admin": "dashboard",
  "/admin/analytics": "analytics",
  "/admin/projects": "projects",
  "/admin/tasks": "tasks",
  "/admin/messages": "messages",
  "/admin/leads": "leads",
  "/admin/clients": "clients",
  "/admin/proposals": "proposals",
  "/admin/invoices": "invoices",
  "/admin/expenses": "expenses",
  "/admin/email-tracker": "email_tracker",
  "/admin/settings": "settings",
  "/admin/team": "team_settings",
  "/admin/notes": "notes",
};

export const ROLE_COLORS = {
  owner: { bg: "rgba(234,179,8,0.1)", color: "#eab308", border: "rgba(234,179,8,0.3)" },
  admin: { bg: "rgba(59,130,246,0.1)", color: "#60a5fa", border: "rgba(59,130,246,0.3)" },
  manager: { bg: "rgba(34,197,94,0.1)", color: "#4ade80", border: "rgba(34,197,94,0.3)" },
  viewer: { bg: "rgba(148,163,184,0.1)", color: "#94a3b8", border: "rgba(148,163,184,0.3)" },
};
