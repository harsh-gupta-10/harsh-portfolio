import { useState } from "react";
import { supabase } from "../lib/supabase";
import { motion } from "framer-motion";
import {
  FiMail,
  FiGithub,
  FiLinkedin,
  FiMapPin,
  FiSend,
  FiCheck,
} from "react-icons/fi";

export default function Contact({ isDark }) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSending(true);

    try {
      const { error } = await supabase.from("messages").insert([{
        name: formData.name,
        email: formData.email,
        subject: formData.subject,
        message: formData.message,
        status: "new"
      }]);

      if (error) throw error;

      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        setFormData({ name: "", email: "", subject: "", message: "" });
      }, 3000);
    } catch (err) {
      console.error("Error sending message:", err);
      alert("Failed to send message. Please try again later.");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <section
      id="contact"
      className={`py-24 ${isDark ? "bg-[#0B1120]" : "bg-[#F8FAFC]"}`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <span className="text-[#3B82F6] font-semibold text-sm uppercase tracking-wider">
            Get in Touch
          </span>
          <h2
            className={`mt-3 text-3xl sm:text-4xl font-display font-bold ${isDark ? "text-white" : "text-[#1E293B]"}`}
          >
            Let's Build{" "}
            <span className="bg-gradient-to-r from-[#1E3A8A] to-[#3B82F6] bg-clip-text text-transparent">
              Something Together
            </span>
          </h2>
          <p
            className={`mt-4 max-w-2xl mx-auto ${isDark ? "text-[#94A3B8]" : "text-[#64748B]"}`}
          >
            Have a project in mind? Whether it's a web app, embedded system, or
            physical product — I'd love to hear about it.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-5 gap-12">
          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.5 }}
            className="lg:col-span-3"
          >
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid sm:grid-cols-2 gap-5">
                <div>
                  <label
                    htmlFor="name"
                    className={`block text-sm font-medium mb-2 ${isDark ? "text-[#CBD5E1]" : "text-[#374151]"}`}
                  >
                    Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className={`w-full px-4 py-3 rounded-xl border text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/50 ${
                      isDark
                        ? "bg-[#1E293B] border-[#334155] text-white placeholder-[#64748B] focus:border-[#3B82F6]"
                        : "bg-white border-[#E2E8F0] text-[#1E293B] placeholder-[#94A3B8] focus:border-[#3B82F6]"
                    }`}
                    placeholder="Your name"
                  />
                </div>
                <div>
                  <label
                    htmlFor="email"
                    className={`block text-sm font-medium mb-2 ${isDark ? "text-[#CBD5E1]" : "text-[#374151]"}`}
                  >
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className={`w-full px-4 py-3 rounded-xl border text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/50 ${
                      isDark
                        ? "bg-[#1E293B] border-[#334155] text-white placeholder-[#64748B] focus:border-[#3B82F6]"
                        : "bg-white border-[#E2E8F0] text-[#1E293B] placeholder-[#94A3B8] focus:border-[#3B82F6]"
                    }`}
                    placeholder="your@email.com"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="subject"
                  className={`block text-sm font-medium mb-2 ${isDark ? "text-[#CBD5E1]" : "text-[#374151]"}`}
                >
                  Subject
                </label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                  className={`w-full px-4 py-3 rounded-xl border text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/50 ${
                    isDark
                      ? "bg-[#1E293B] border-[#334155] text-white placeholder-[#64748B] focus:border-[#3B82F6]"
                      : "bg-white border-[#E2E8F0] text-[#1E293B] placeholder-[#94A3B8] focus:border-[#3B82F6]"
                  }`}
                  placeholder="Project inquiry, collaboration, etc."
                />
              </div>

              <div>
                <label
                  htmlFor="message"
                  className={`block text-sm font-medium mb-2 ${isDark ? "text-[#CBD5E1]" : "text-[#374151]"}`}
                >
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows={5}
                  className={`w-full px-4 py-3 rounded-xl border text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/50 resize-none ${
                    isDark
                      ? "bg-[#1E293B] border-[#334155] text-white placeholder-[#64748B] focus:border-[#3B82F6]"
                      : "bg-white border-[#E2E8F0] text-[#1E293B] placeholder-[#94A3B8] focus:border-[#3B82F6]"
                  }`}
                  placeholder="Tell me about your project..."
                />
              </div>

              <button
                type="submit"
                disabled={isSending || submitted}
                className={`inline-flex items-center gap-2 px-8 py-3.5 font-semibold rounded-xl transition-all ${
                  submitted
                    ? "bg-green-500 text-white"
                    : isSending
                    ? "bg-blue-400 text-white opacity-75 cursor-not-allowed"
                    : "bg-gradient-to-r from-[#1E3A8A] to-[#3B82F6] text-white hover:shadow-xl hover:shadow-blue-500/25 hover:scale-105"
                }`}
              >
                {submitted ? (
                  <>
                    <FiCheck size={18} />
                    Message Sent!
                  </>
                ) : isSending ? (
                  "Sending..."
                ) : (
                  <>
                    <FiSend size={18} />
                    Send Message
                  </>
                )}
              </button>
            </form>
          </motion.div>

          {/* Contact Info */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.5 }}
            className="lg:col-span-2 space-y-6"
          >
            {/* Info Cards */}
            {[
              {
                icon: FiMail,
                label: "Email",
                value: "harshgupta24716@gmail.com",
                href: "mailto:harshgupta24716@gmail.com",
              },
              {
                icon: FiGithub,
                label: "GitHub",
                value: "github.com/harsh-gupta-10",
                href: "https://github.com/harsh-gupta-10",
              },
              {
                icon: FiLinkedin,
                label: "LinkedIn",
                value: "linkedin.com/in/harsh-gupta-2b41692b1",
                href: "https://linkedin.com/in/harsh-gupta-2b41692b1",
              },
              {
                icon: FiMapPin,
                label: "Location",
                value: "Mumbai, India",
                href: null,
              },
            ].map((item) => (
              <div
                key={item.label}
                className={`flex items-center gap-4 p-5 rounded-2xl border transition-all ${
                  isDark
                    ? "bg-[#1E293B] border-[#334155] hover:border-[#3B82F6]/30"
                    : "bg-white border-[#E2E8F0] hover:border-[#3B82F6]/30 hover:shadow-lg hover:shadow-blue-500/5"
                }`}
              >
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#1E3A8A]/10 to-[#3B82F6]/10 flex items-center justify-center flex-shrink-0">
                  <item.icon size={20} className="text-[#3B82F6]" />
                </div>
                <div>
                  <div
                    className={`text-xs font-medium uppercase tracking-wider ${isDark ? "text-[#64748B]" : "text-[#94A3B8]"}`}
                  >
                    {item.label}
                  </div>
                  {item.href ? (
                    <a
                      href={item.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`text-sm font-medium hover:text-[#3B82F6] transition-colors ${isDark ? "text-white" : "text-[#1E293B]"}`}
                    >
                      {item.value}
                    </a>
                  ) : (
                    <span
                      className={`text-sm font-medium ${isDark ? "text-white" : "text-[#1E293B]"}`}
                    >
                      {item.value}
                    </span>
                  )}
                </div>
              </div>
            ))}

            {/* CTA Card */}
            <div className="p-6 rounded-2xl bg-gradient-to-br from-[#1E3A8A] to-[#3B82F6] text-white">
              <h3 className="font-display font-bold text-lg">
                Ready to start a project?
              </h3>
              <p className="mt-2 text-sm text-blue-100 leading-relaxed">
                I'm available for freelance work, full-time roles, and technical
                consulting across software and hardware domains.
              </p>
              <a
                href="mailto:harshgupta24716@gmail.com"
                className="inline-flex items-center gap-2 mt-4 px-5 py-2.5 bg-white text-[#1E3A8A] text-sm font-semibold rounded-xl hover:bg-blue-50 transition-colors"
              >
                <FiMail size={16} />
                Get in Touch
              </a>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
