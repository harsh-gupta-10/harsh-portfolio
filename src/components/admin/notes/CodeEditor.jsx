import { useState } from "react";
import Editor from "@monaco-editor/react";
import { Loader2, Copy, Check } from "lucide-react";

const LANGUAGES = [
  { id: "javascript", label: "JavaScript" },
  { id: "typescript", label: "TypeScript" },
  { id: "python", label: "Python" },
  { id: "html", label: "HTML" },
  { id: "css", label: "CSS" },
  { id: "json", label: "JSON" },
  { id: "sql", label: "SQL" },
  { id: "markdown", label: "Markdown" },
];

export default function CodeEditor({ initialContent, onChange }) {
  const defaultCode = typeof initialContent?.code === "string" ? initialContent.code : "";
  const defaultLang = initialContent?.language || "javascript";

  const [language, setLanguage] = useState(defaultLang);
  const [code, setCode] = useState(defaultCode);
  const [copied, setCopied] = useState(false);

  const handleEditorChange = (value) => {
    setCode(value);
    onChange({ code: value, language });
  };

  const handleLanguageChange = (newLang) => {
    setLanguage(newLang);
    onChange({ code, language: newLang });
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full h-full flex flex-col bg-slate-900 rounded-xl border border-slate-700/50 overflow-hidden shadow-inner">
      {/* Top Bar */}
      <div className="flex items-center justify-between px-4 py-3 bg-[#1e1e1e] border-b border-slate-700/50">
        <select 
          value={language}
          onChange={(e) => handleLanguageChange(e.target.value)}
          className="bg-slate-800 text-slate-300 text-sm rounded-lg px-3 py-1.5 outline-none border border-slate-700 focus:border-blue-500 font-mono"
        >
          {LANGUAGES.map(lang => (
            <option key={lang.id} value={lang.id}>{lang.label}</option>
          ))}
        </select>

        <button 
          onClick={copyToClipboard}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-colors text-slate-400 hover:text-white hover:bg-slate-800"
        >
          {copied ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
          {copied ? <span className="text-green-400">Copied!</span> : "Copy Code"}
        </button>
      </div>

      {/* Editor */}
      <div className="flex-1">
        <Editor
          height="100%"
          language={language}
          theme="vs-dark"
          value={code}
          onChange={handleEditorChange}
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
            wordWrap: "on",
            padding: { top: 16, bottom: 16 },
            lineNumbersMinChars: 3,
            formatOnPaste: true,
          }}
          loading={
            <div className="w-full h-full flex items-center justify-center bg-[#1e1e1e]">
              <Loader2 className="animate-spin text-blue-500" size={32} />
            </div>
          }
        />
      </div>
    </div>
  );
}
