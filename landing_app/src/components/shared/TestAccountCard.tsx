"use client";

import { motion } from "framer-motion";
import { KeyRound, Copy, Check } from "lucide-react";
import { useState } from "react";

interface TestAccountCardProps {
  label: string;
  email?: string;
  password: string;
  note?: string;
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <button
      onClick={handleCopy}
      className="ml-1.5 p-0.5 rounded hover:bg-white/10 transition-colors"
      aria-label="Copy to clipboard"
    >
      {copied ? (
        <Check className="w-3 h-3 text-green-400" />
      ) : (
        <Copy className="w-3 h-3 text-white/40" />
      )}
    </button>
  );
}

export function TestAccountCard({ label, email, password, note }: TestAccountCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6 }}
      viewport={{ once: true }}
      className="inline-flex flex-col gap-1.5 px-3 py-2.5 rounded-lg bg-white/10 border border-white/15 backdrop-blur-sm text-left"
    >
      <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-white/50 font-semibold">
        <KeyRound className="w-3 h-3" />
        {label}
      </div>
      {note ? (
        <span className="text-xs text-white/70">{note}</span>
      ) : email ? (
        <div className="flex items-center">
          <span className="text-xs text-white/80 font-mono">{email}</span>
          <CopyButton text={email} />
        </div>
      ) : null}
      <div className="flex items-center">
        <span className="text-xs text-white/80 font-mono">{password}</span>
        <CopyButton text={password} />
      </div>
    </motion.div>
  );
}
