"use client";

import { useState } from "react";
import {
  ChevronDown,
  ChevronRight,
  CheckCircle2,
  XCircle,
  Loader2,
  Copy,
  Check,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface VerificationStepProps {
  stepNumber: number;
  title: string;
  status: "pass" | "fail" | "loading";
  simpleExplanation: string;
  technicalDetails?: Record<string, unknown>;
  defaultExpanded?: boolean;
}

export function VerificationStep({
  stepNumber,
  title,
  status,
  simpleExplanation,
  technicalDetails,
  defaultExpanded = false,
}: VerificationStepProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const statusIcon = {
    pass: <CheckCircle2 className="w-5 h-5 text-black" />,
    fail: <XCircle className="w-5 h-5 text-black" />,
    loading: <Loader2 className="w-5 h-5 text-black animate-spin" />,
  };

  const statusColor = {
    pass: "border-black bg-green-100",
    fail: "border-black bg-red-100",
    loading: "border-black bg-yellow-100",
  };

  const copyToClipboard = (value: string, field: string) => {
    navigator.clipboard.writeText(value);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const renderValue = (key: string, value: unknown): React.ReactNode => {
    if (value === null || value === undefined) return "N/A";

    const stringValue = String(value);

    // Check if it's a hash or long string
    const isLongString = stringValue.length > 20;

    if (isLongString) {
      return (
        <div className="flex items-center gap-2 group">
          <code className="text-xs bg-white px-2 py-1 rounded-lg border-2 border-black font-mono break-all">
            {stringValue}
          </code>
          <button
            onClick={() => copyToClipboard(stringValue, key)}
            className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-gray-100 rounded border border-black"
            title="Copy"
          >
            {copiedField === key ? (
              <Check className="w-3 h-3 text-black" />
            ) : (
              <Copy className="w-3 h-3 text-black" />
            )}
          </button>
        </div>
      );
    }

    return <span className="text-sm font-semibold text-black" style={{ fontFamily: "var(--font-lilita-one)" }}>{stringValue}</span>;
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: stepNumber * 0.1 }}
      className={`border-2 rounded-xl overflow-hidden shadow-[0px_2px_0px_0px_#000000] ${statusColor[status]}`}
    >
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-3.5 flex items-center gap-3 hover:bg-white/60 transition-all duration-200"
      >
        {/* Step Number */}
        <div className="flex-shrink-0 w-7 h-7 rounded-full bg-white flex items-center justify-center text-xs font-bold text-black border-2 border-black" style={{ fontFamily: "var(--font-lilita-one)" }}>
          {stepNumber}
        </div>

        {/* Status Icon */}
        <motion.div
          className="flex-shrink-0"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", delay: stepNumber * 0.1 + 0.2 }}
        >
          {statusIcon[status]}
        </motion.div>

        {/* Title and Explanation */}
        <div className="flex-1 text-left">
          <h3 className="text-sm font-bold text-black mb-0.5" style={{ fontFamily: "var(--font-lilita-one)" }}>{title}</h3>
          <p className="text-xs text-black leading-relaxed">
            {simpleExplanation}
          </p>
        </div>

        {/* Expand Icon */}
        {technicalDetails && (
          <div className="flex-shrink-0">
            {isExpanded ? (
              <ChevronDown className="w-5 h-5 text-black" />
            ) : (
              <ChevronRight className="w-5 h-5 text-black" />
            )}
          </div>
        )}
      </button>

      {/* Technical Details */}
      <AnimatePresence>
        {isExpanded && technicalDetails && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="px-4 py-4 border-t-2 border-black bg-white space-y-3">
              <div className="flex items-center gap-2 mb-3">
                <div className="h-px flex-1 bg-black"></div>
                <p className="text-xs font-bold text-black uppercase tracking-wider" style={{ fontFamily: "var(--font-lilita-one)" }}>
                  Technical Details
                </p>
                <div className="h-px flex-1 bg-black"></div>
              </div>
              {Object.entries(technicalDetails).map(([key, value]) => (
                <div
                  key={key}
                  className="bg-white p-2.5 rounded-lg border-2 border-black"
                >
                  <span className="text-xs font-semibold text-black capitalize block mb-1.5" style={{ fontFamily: "var(--font-lilita-one)" }}>
                    {key.replace(/([A-Z])/g, " $1").trim()}:
                  </span>
                  {renderValue(key, value)}
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
