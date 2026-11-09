import { useState } from "react";
import { supabase } from "../lib/supabase";
import { FiMail, FiGithub, FiLinkedin, FiMapPin, FiSend, FiCheck, FiArrowRight } from "react-icons/fi";

export default function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSending(true);

    try {
      setErrorMsg("");
      const { error } = await supabase.from("messages").insert([
        {
          name: formData.name,
          email: formData.email,
          subject: formData.subject,
          message: formData.message,
          status: "new",
        },
      ]);

      if (error) throw error;

      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        setFormData({ name: "", email: "", subject: "", message: "" });
      }, 3500);
    } catch (err) {
      console.error("Error sending message:", err);
      setErrorMsg("Failed to send message. Please reach out directly at harshgupta24716@gmail.com");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <section id="contact" className="py-24 sm:py-32 bg-[#240029] text-white relative overflow-hidden">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          {/* Left Column: Heading, Pitch & Direct channels (6 cols) */}
          <div className="lg:col-span-6 space-y-8">
            <div>
              <span className="font-mono text-xs font-semibold tracking-[0.10em] text-[#d4ccd4] uppercase mb-3 block">
                // 07 · GET IN TOUCH
              </span>
              <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.08] mb-6">
                Let's build something real together.
              </h2>
              <p className="text-base sm:text-lg text-[#d4ccd4] leading-relaxed max-w-xl font-normal">
                Whether you need a high-speed web application, custom cloud workers, or embedded IoT hardware with rapid 3D physical prototyping — I'm ready to bring your vision into production.
              </p>
            </div>

            {/* Direct Channel Cards */}
            <div className="space-y-3.5 pt-2 max-w-md">
              <a
                href="mailto:harshgupta24716@gmail.com"
                className="flex items-center gap-4 p-4 rounded-[14px] bg-white/5 border border-white/10 hover:border-white/25 hover:bg-white/10 transition-all text-white group"
              >
                <div className="w-10 h-10 rounded-full bg-[#df37a7] flex items-center justify-center shrink-0 shadow-xs">
                  <FiMail size={18} className="text-white" />
                </div>
                <div>
                  <div className="text-xs font-mono uppercase tracking-wider text-[#d4ccd4]">Direct Email</div>
                  <div className="text-sm font-semibold text-white group-hover:text-[#ffbdd3] transition-colors">
                    harshgupta24716@gmail.com
                  </div>
                </div>
              </a>

              <div className="flex items-center gap-4 p-4 rounded-[14px] bg-white/5 border border-white/10 text-white">
                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                  <FiMapPin size={18} className="text-[#ffbdd3]" />
                </div>
                <div>
                  <div className="text-xs font-mono uppercase tracking-wider text-[#d4ccd4]">Location & Availability</div>
                  <div className="text-sm font-semibold text-white">
                    Mumbai, India · Available for Global Remote Contracts
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <a
                  href="https://github.com/harsh-gupta-10"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 inline-flex items-center justify-center gap-2 py-3 px-4 rounded-[6px] border border-white/15 bg-white/5 hover:bg-white/10 text-sm font-medium text-white transition-colors"
                >
                  <FiGithub size={16} />
                  GitHub Profile
                </a>
                <a
                  href="https://linkedin.com/in/harsh-gupta-2b41692b1"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 inline-flex items-center justify-center gap-2 py-3 px-4 rounded-[6px] border border-white/15 bg-white/5 hover:bg-white/10 text-sm font-medium text-white transition-colors"
                >
                  <FiLinkedin size={16} />
                  LinkedIn
                </a>
              </div>
            </div>
          </div>

          {/* Right Column: Outseta Form Card (6 cols) */}
          <div className="lg:col-span-6">
            <div className="bg-white rounded-[14px] p-7 sm:p-9 text-[#240029] shadow-2xl border border-[rgba(41,0,41,0.15)]">
              <div className="mb-6">
                <h3 className="font-display font-bold text-2xl text-[#240029]">
                  Send a Direct Message
                </h3>
                <p className="text-sm text-[#6d526d] mt-1">
                  Leave a note with your project details or inquiries.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="name" className="block text-xs font-semibold text-[#240029] uppercase tracking-wider mb-1.5 font-mono">
                      Your Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      autoComplete="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      placeholder="e.g. Alex"
                      className="w-full px-3.5 py-2.5 rounded-[3px] border border-[#767676] bg-white text-[#240029] text-sm placeholder-[#6d526d] focus:outline-none focus:border-[#df37a7] transition-colors"
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-xs font-semibold text-[#240029] uppercase tracking-wider mb-1.5 font-mono">
                      Email Address
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      autoComplete="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      placeholder="alex@company.com"
                      className="w-full px-3.5 py-2.5 rounded-[3px] border border-[#767676] bg-white text-[#240029] text-sm placeholder-[#6d526d] focus:outline-none focus:border-[#df37a7] transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="subject" className="block text-xs font-semibold text-[#240029] uppercase tracking-wider mb-1.5 font-mono">
                    Subject / Project Type
                  </label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    placeholder="Web Development, IoT Hardware, Consulting"
                    className="w-full px-3.5 py-2.5 rounded-[3px] border border-[#767676] bg-white text-[#240029] text-sm placeholder-[#6d526d] focus:outline-none focus:border-[#df37a7] transition-colors"
                  />
                </div>

                <div>
                  <label htmlFor="message" className="block text-xs font-semibold text-[#240029] uppercase tracking-wider mb-1.5 font-mono">
                    Message
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={4}
                    placeholder="Tell me what you're looking to build..."
                    className="w-full px-3.5 py-2.5 rounded-[3px] border border-[#767676] bg-white text-[#240029] text-sm placeholder-[#6d526d] focus:outline-none focus:border-[#df37a7] transition-colors resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSending || submitted}
                  className="btn-primary-fuchsia w-full py-3.5 px-6 text-sm font-semibold inline-flex items-center justify-center gap-2 mt-2 cursor-pointer"
                >
                  {submitted ? (
                    <>
                      <FiCheck size={18} />
                      Message Received!
                    </>
                  ) : isSending ? (
                    "Sending Message..."
                  ) : (
                    <>
                      <FiSend size={15} />
                      Submit Inquiry
                    </>
                  )}
                </button>

                {errorMsg && (
                  <p className="text-xs text-red-600 mt-2 font-medium" role="alert">
                    {errorMsg}
                  </p>
                )}
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
