"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Mic01Icon, ArrowLeft01Icon, Refresh01Icon, Alert01Icon, CheckmarkBadge01Icon, Delete01Icon } from "hugeicons-react";
import { motion } from "framer-motion";
import Modal, { ModalConfig } from "@/components/Modal";

type Meeting = {
  id: string;
  title: string;
  status: "pending" | "processing" | "completed" | "failed";
  error_message?: string;
  transcript?: {
    full_text: string;
    speakers: Array<{
      speaker: string;
      start: number;
      end: number;
      text: string;
    }>;
  };
  summary?: {
    summary_text: string;
    action_items: string[];
  };
};

export default function MeetingPage() {
  const params = useParams();
  const router = useRouter();
  const [meeting, setMeeting] = useState<Meeting | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isRetrying, setIsRetrying] = useState(false);

  const getUserId = () => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("scribely_user_id");
    }
    return null;
  };

  const fetchMeeting = async () => {
    const userId = getUserId();
    if (!userId) {
      setError("User ID not found. Return to home to generate one.");
      return;
    }

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const res = await fetch(`${apiUrl}/api/meetings/${params.id}/`, {
        headers: {
          "X-User-Id": userId,
        },
      });

      if (!res.ok) {
        if (res.status === 404) {
          setError("Meeting not found.");
        } else {
          setError("Failed to load meeting.");
        }
        return;
      }

      const data = await res.json();
      setMeeting(data);
    } catch (err) {
      console.error(err);
      setError("Network error while fetching meeting.");
    }
  };

  useEffect(() => {
    fetchMeeting();
    
    // Poll every 5 seconds if still processing
    const interval = setInterval(() => {
      if (meeting?.status === "pending" || meeting?.status === "processing") {
        fetchMeeting();
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [meeting?.status]);

  const [modalConfig, setModalConfig] = useState<ModalConfig>({ isOpen: false, title: "", message: "" });
  const openModal = (config: Omit<ModalConfig, "isOpen">) => setModalConfig({ ...config, isOpen: true });
  const closeModal = () => setModalConfig(prev => ({ ...prev, isOpen: false }));

  const handleRetry = async () => {
    setIsRetrying(true);
    try {
      const userId = getUserId();
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const res = await fetch(`${apiUrl}/api/meetings/${params.id}/retry/`, {
        method: "POST",
        headers: {
          "X-User-Id": userId || "",
        },
      });
      if (res.ok) {
        fetchMeeting();
      } else {
        openModal({ title: "Retry Failed", message: "Failed to restart the transcription process.", type: "error", onClose: closeModal });
      }
    } finally {
      setIsRetrying(false);
    }
  };

  const requestDeleteMeeting = () => {
    openModal({
      title: "Delete Transmission",
      message: "Are you sure you want to permanently delete this recording? This action cannot be undone.",
      type: "confirm",
      onConfirm: performDeleteMeeting,
      onClose: closeModal
    });
  };

  const performDeleteMeeting = async () => {
    closeModal();
    try {
      const userId = getUserId();
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const res = await fetch(`${apiUrl}/api/meetings/${params.id}/`, {
        method: "DELETE",
        headers: { "X-User-Id": userId || "" }
      });
      if (res.ok) {
        router.push("/upload");
      } else {
        openModal({ title: "Deletion Failed", message: "Failed to delete the transmission.", type: "error", onClose: closeModal });
      }
    } catch (err) {
      console.error(err);
      openModal({ title: "System Error", message: "A network error occurred while deleting.", type: "error", onClose: closeModal });
    }
  };
  const formatTimestamp = (seconds: number) => {
    const h = Math.floor(seconds / 3600).toString().padStart(2, "0");
    const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, "0");
    const s = Math.floor(seconds % 60).toString().padStart(2, "0");
    return h === "00" ? `${m}m ${s}s` : `${h}h ${m}m ${s}s`;
  };

  const groupedSpeakers = useMemo(() => {
    if (!meeting?.transcript?.speakers) return [];
    
    const groups: Array<{ speaker: string; start: number; end: number; text: string[] }> = [];
    let currentGroup: { speaker: string; start: number; end: number; text: string[] } | null = null;
    
    for (const segment of meeting.transcript.speakers) {
      if (!currentGroup) {
        currentGroup = {
          speaker: segment.speaker,
          start: segment.start,
          end: segment.end,
          text: [segment.text]
        };
      } else if (currentGroup.speaker === segment.speaker) {
        currentGroup.end = segment.end;
        currentGroup.text.push(segment.text);
      } else {
        groups.push(currentGroup);
        currentGroup = {
          speaker: segment.speaker,
          start: segment.start,
          end: segment.end,
          text: [segment.text]
        };
      }
    }
    if (currentGroup) {
      groups.push(currentGroup);
    }
    return groups;
  }, [meeting?.transcript?.speakers]);

  // Assign distinct colors to speakers
  const getSpeakerColor = (speakerName: string) => {
    const colors = ["bg-blue-500", "bg-purple-500", "bg-green-500", "bg-[#FF6B4A]", "bg-pink-500"];
    let hash = 0;
    for (let i = 0; i < speakerName.length; i++) {
      hash = speakerName.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  if (error) {
    return (
      <div className="min-h-screen flex flex-col bg-[#1A1A1A] text-neutral-50 items-center justify-center">
        <Alert01Icon size={48} className="text-red-500 mb-4" />
        <h1 className="text-2xl font-bold mb-4">{error}</h1>
        <Link href="/" className="text-[#FF6B4A] hover:underline">Return Home</Link>
      </div>
    );
  }

  if (!meeting) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#1A1A1A]">
        <div className="w-12 h-12 border-4 border-[#FF6B4A]/20 border-t-[#FF6B4A] rounded-full animate-spin" />
      </div>
    );
  }

  const isProcessing = meeting.status === "pending" || meeting.status === "processing";

  return (
    <div className="min-h-screen flex flex-col bg-[#1A1A1A] text-neutral-50 font-sans selection:bg-[#FF6B4A]/30">
      <Modal config={modalConfig} />
      <nav className="w-full bg-[#1A1A1A]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl text-white hover:opacity-80 transition-opacity">
            <Mic01Icon size={24} className="text-[#FF6B4A]" />
            Scribely
          </Link>
        </div>
      </nav>

      <main className="flex-1 max-w-6xl w-full mx-auto p-6 md:px-6 py-12">
        <Link href="/upload" className="inline-flex items-center gap-2 text-neutral-400 hover:text-white transition-colors mb-8">
          <ArrowLeft01Icon size={16} />
          Back to Upload
        </Link>

        <header className="mb-8 md:mb-12 flex justify-between items-start gap-6">
          <div>
            <h1 className="text-2xl md:text-4xl font-bold text-white mb-4 leading-tight">{meeting.title || "Meeting Recording"}</h1>
            <div className="flex items-center flex-wrap gap-3">
            {isProcessing && (
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 text-xs md:text-sm font-semibold">
                <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                AI is processing...
              </span>
            )}
            {meeting.status === "completed" && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-500/10 text-green-400 text-xs md:text-sm font-semibold">
                <CheckmarkBadge01Icon size={14} className="md:w-4 md:h-4" />
                Completed
              </span>
            )}
            {meeting.status === "failed" && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/10 text-red-400 text-xs md:text-sm font-semibold">
                <Alert01Icon size={14} className="md:w-4 md:h-4" />
                Failed
              </span>
            )}
            <span className="text-xs md:text-sm text-neutral-500">
              {new Date(meeting.created_at).toLocaleString()}
            </span>
            </div>
          </div>
          <button 
            onClick={requestDeleteMeeting} 
            title="Delete meeting"
            className="p-3 text-neutral-500 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-colors flex-shrink-0"
          >
            <Delete01Icon size={24} />
          </button>
        </header>

        {isProcessing && (
          <div className="flex flex-col items-center justify-center py-20 bg-[#242424] rounded-3xl border border-[#333333] shadow-xl">
            <div className="w-16 h-16 border-4 border-[#FF6B4A]/20 border-t-[#FF6B4A] rounded-full animate-spin mb-6" />
            <h2 className="text-2xl font-bold text-white mb-2">Transcribing audio</h2>
            <p className="text-neutral-400 text-center max-w-md">
              Please wait while our AI engine analyzes your meeting. This page will automatically update when finished.
            </p>
          </div>
        )}

        {meeting.status === "failed" && (
          <div className="flex flex-col items-center justify-center py-20 bg-[#242424] rounded-3xl border border-red-500/20 shadow-xl">
            <Alert01Icon size={48} className="text-red-500 mb-6" />
            <h2 className="text-2xl font-bold text-white mb-2">Transcription Failed</h2>
            <p className="text-neutral-400 text-center max-w-md mb-8">
              {meeting.error_message || "An unknown error occurred while processing the audio."}
            </p>
            <button
              onClick={handleRetry}
              disabled={isRetrying}
              className="px-6 py-3 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-full font-semibold transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              <Refresh01Icon size={18} className={isRetrying ? "animate-spin" : ""} />
              Retry Transcription
            </button>
          </div>
        )}

        {meeting.status === "completed" && meeting.transcript && (
          <div className="space-y-12">
            {/* Summary Placeholder (If implemented on backend) */}
            {meeting.summary && (
              <section className="bg-gradient-to-br from-[#FF6B4A]/10 to-transparent border border-[#FF6B4A]/20 p-8 rounded-3xl">
                <h2 className="text-2xl font-bold text-white mb-4">Summary</h2>
                <p className="text-base md:text-lg text-neutral-300 leading-relaxed mb-6">
                  {meeting.summary.summary_text}
                </p>
                {meeting.summary.action_items?.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-white mb-3 uppercase tracking-wider text-sm">Action Items</h3>
                    <ul className="space-y-2">
                      {meeting.summary.action_items.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-3 text-neutral-300">
                          <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#FF6B4A]" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </section>
            )}

            <section>
              <h2 className="text-2xl font-bold text-white mb-8 border-b border-[#333333] pb-4">Full Transcript</h2>
              <div className="space-y-8">
                {groupedSpeakers.map((segment, idx) => {
                  const colorClass = getSpeakerColor(segment.speaker);
                  return (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      key={idx} 
                      className="flex gap-4 group"
                    >
                      <div className="flex-shrink-0 mt-1">
                        <div className={`w-10 h-10 rounded-full ${colorClass}/20 flex items-center justify-center text-white text-sm font-bold border border-${colorClass.split('-')[1]}-500/30`}>
                          {segment.speaker.substring(0, 2).toUpperCase()}
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-baseline gap-3 mb-1">
                          <span className="font-semibold text-neutral-200">{segment.speaker}</span>
                          <span className="text-xs text-neutral-500 font-mono">
                            {formatTimestamp(segment.start)} - {formatTimestamp(segment.end)}
                          </span>
                        </div>
                        <p className="text-base md:text-lg text-neutral-400 leading-relaxed">
                          {segment.text.join(" ")}
                        </p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </section>
          </div>
        )}
      </main>
    </div>
  );
}
