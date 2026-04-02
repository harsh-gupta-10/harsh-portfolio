import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../hooks/useAuth";
import { Save, Upload, User, Building2, Landmark, FileText, ImageIcon, Loader2 } from "lucide-react";

const INITIAL_STATE = {
  full_name: "",
  company_name: "",
  email: "",
  phone: "",
  address: "",
  city: "",
  gstin: "",
  bank_name: "",
  account_number: "",
  ifsc_code: "",
  upi_id: "",
  logo_url: "",
  invoice_prefix: "INV",
  invoice_footer_note: "",
  default_currency: "INR",
  default_tax_percent: 18
};

export default function Settings() {
  const { user } = useAuth();
  const [form, setForm] = useState(INITIAL_STATE);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);

  useEffect(() => {
    if (user) fetchSettings();
  }, [user]);

  async function fetchSettings() {
    setLoading(true);
    const { data, error } = await supabase.from("settings").select("*").eq("user_id", user.id).single();
    if (data) {
      setForm({ ...INITIAL_STATE, ...data });
      if (data.logo_url) setLogoPreview(data.logo_url);
    }
    setLoading(false);
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(p => ({ ...p, [name]: value }));
  };

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setLogoFile(file);
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    
    let uploadedLogoUrl = form.logo_url;

    try {
      if (logoFile) {
        const ext = logoFile.name.split('.').pop();
        const filename = `${user.id}_${Date.now()}.${ext}`;
        const { error: uploadErr } = await supabase.storage.from("settings-logo").upload(filename, logoFile, { upsert: true });
        if (uploadErr) throw uploadErr;
        
        const { data: urlData } = supabase.storage.from("settings-logo").getPublicUrl(filename);
        uploadedLogoUrl = urlData.publicUrl;
      }

      const payload = {
        ...form,
        user_id: user.id,
        logo_url: uploadedLogoUrl,
        default_tax_percent: Number(form.default_tax_percent) || 0
      };

      const { data: exist } = await supabase.from("settings").select("id").eq("user_id", user.id).single();

      if (exist) {
        await supabase.from("settings").update(payload).eq("user_id", user.id);
      } else {
        await supabase.from("settings").insert(payload);
      }
      
      setForm(p => ({ ...p, logo_url: uploadedLogoUrl }));
      setLogoFile(null);
      alert("Settings saved successfully!");
    } catch (err) {
      console.error(err);
      alert("Error saving settings: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  const SectionForm = ({ title, icon: Icon, children }) => (
    <div className="p-6 rounded-2xl mb-6 shadow-xl" style={{ background: "linear-gradient(135deg, #1e293b, #0f172a)", border: "1px solid #334155" }}>
      <div className="flex items-center gap-3 mb-6 pb-4" style={{ borderBottom: "1px solid #334155" }}>
        <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-blue-500/10 text-blue-400">
          <Icon size={20} />
        </div>
        <h2 className="text-lg font-bold text-white tracking-wide">{title}</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {children}
      </div>
    </div>
  );

  const FormInput = ({ label, name, type = "text", placeholder, options, span2 }) => (
    <div className={span2 ? "md:col-span-2" : ""}>
      <label className="block text-xs font-semibold uppercase tracking-wider mb-2 text-slate-400">{label}</label>
      {type === "textarea" ? (
         <textarea name={name} value={form[name]} onChange={handleChange} rows={3} className="w-full px-4 py-3 rounded-xl text-sm bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-blue-500 resize-none" placeholder={placeholder} />
      ) : options ? (
         <select name={name} value={form[name]} onChange={handleChange} className="w-full px-4 py-3 rounded-xl text-sm bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-blue-500">
           {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
         </select>
      ) : (
        <input type={type} name={name} value={form[name]} onChange={handleChange} className="w-full px-4 py-3 rounded-xl text-sm bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-blue-500 placeholder-slate-600" placeholder={placeholder} />
      )}
    </div>
  );

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-blue-500" size={32} /></div>;

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Settings & Profile</h1>
          <p className="text-sm mt-1 text-slate-400">Manage your business profile, bank details, and invoice preferences.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Brand Assets */}
        <SectionForm title="Brand Assets" icon={ImageIcon}>
           <div className="md:col-span-2 flex items-start gap-6">
             <div className="w-32 h-32 rounded-2xl bg-slate-900 border-2 border-dashed border-slate-700 flex flex-col items-center justify-center relative overflow-hidden group">
               {logoPreview ? (
                 <img src={logoPreview} alt="Logo" className="w-full h-full object-contain p-2" />
               ) : (
                 <ImageIcon size={32} className="text-slate-600 mb-2" />
               )}
               <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                 <label className="cursor-pointer bg-blue-600 text-white px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2">
                   <Upload size={14} /> Upload
                   <input type="file" accept="image/*" onChange={handleLogoChange} className="hidden" />
                 </label>
               </div>
             </div>
             <div className="flex-1 py-2">
               <h3 className="text-sm font-semibold text-white">Company Logo</h3>
               <p className="text-xs text-slate-400 mt-1">This logo will be displayed on all your PDF proposals and invoices. Recommended size: 400x400px.</p>
               {logoPreview && (
                  <label className="cursor-pointer mt-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 transition-colors border border-slate-700">
                    <Upload size={14} /> Change Logo
                    <input type="file" accept="image/*" onChange={handleLogoChange} className="hidden" />
                  </label>
               )}
             </div>
           </div>
        </SectionForm>

        {/* Personal & Business Info */}
        <SectionForm title="Personal & Business Info" icon={User}>
          <FormInput label="Full Name" name="full_name" placeholder="John Doe" />
          <FormInput label="Company Name" name="company_name" placeholder="Acme Corp" />
          <FormInput label="Email Address" name="email" type="email" placeholder="john@example.com" />
          <FormInput label="Phone Number" name="phone" placeholder="+91 9876543210" />
          <FormInput label="City" name="city" placeholder="Mumbai, IN" />
          <FormInput label="GSTIN" name="gstin" placeholder="22AAAAA0000A1Z5" />
          <FormInput label="Full Address" name="address" type="textarea" span2 placeholder="123 Business Avenue..." />
        </SectionForm>

        {/* Bank & Payment Details */}
        <SectionForm title="Bank & Payment Details" icon={Landmark}>
          <FormInput label="Bank Name" name="bank_name" placeholder="HDFC Bank" />
          <FormInput label="Account Number" name="account_number" placeholder="5010000000000" />
          <FormInput label="IFSC Code" name="ifsc_code" placeholder="HDFC0001234" />
          <FormInput label="UPI ID" name="upi_id" placeholder="john@upi" />
        </SectionForm>

        {/* Invoice Preferences */}
        <SectionForm title="Invoice Preferences" icon={FileText}>
          <FormInput label="Invoice Prefix" name="invoice_prefix" placeholder="INV" />
          <FormInput label="Default Currency" name="default_currency" options={[
            {value: "INR", label: "INR (₹)"},
            {value: "USD", label: "USD ($)"},
            {value: "EUR", label: "EUR (€)"},
            {value: "GBP", label: "GBP (£)"}
          ]} />
          <FormInput label="Default Tax (%)" name="default_tax_percent" type="number" placeholder="18" />
          <FormInput label="Invoice Footer Note" name="invoice_footer_note" type="textarea" span2 placeholder="Thank you for your business!" />
        </SectionForm>

        <div className="flex justify-end pt-4 sticky bottom-6 z-10">
           <div className="p-4 rounded-2xl flex gap-4 bg-slate-900 border border-slate-700 shadow-2xl backdrop-blur-xl bg-opacity-80">
             <button type="submit" disabled={saving} className="flex items-center gap-2 px-8 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 text-white text-sm font-bold shadow-lg shadow-blue-500/25 hover:opacity-90 transition-opacity disabled:opacity-50 min-w-[200px] justify-center">
               {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
               {saving ? "Saving Changes..." : "Save All Settings"}
             </button>
           </div>
        </div>

      </form>
    </div>
  );
}
