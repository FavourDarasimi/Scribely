"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mic01Icon, ArrowRight01Icon, Delete01Icon } from "hugeicons-react";
import { v4 as uuidv4 } from "uuid";
import Modal, { ModalConfig } from "@/components/Modal";

export default function UploadPage() {
  const router = useRouter();
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [meetings, setMeetings] = useState<{id: string, title: string, status: string, created_at: string}[]>([]);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);

  // Setup User ID
  const getUserId = () => {
    if (typeof window !== "undefined") {
      let userId = localStorage.getItem("scribely_user_id");
      if (!userId) {
        userId = uuidv4();
        localStorage.setItem("scribely_user_id", userId);
      }
      return userId;
    }
    return "";
  };

  useEffect(() => {
    const fetchMeetings = async () => {
      const userId = getUserId();
      if (!userId) return;
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
        const res = await fetch(`${apiUrl}/api/meetings/`, {
          headers: { "X-User-Id": userId }
        });
        if (res.ok) {
          const data = await res.json();
          setMeetings(data);
        }
      } catch (err) {
        console.error("Failed to fetch meetings", err);
      }
    };
    fetchMeetings();
  }, []);

  const [modalConfig, setModalConfig] = useState<ModalConfig>({ isOpen: false, title: "", message: "" });
  const openModal = (config: Omit<ModalConfig, "isOpen">) => setModalConfig({ ...config, isOpen: true });
  const closeModal = () => setModalConfig(prev => ({ ...prev, isOpen: false }));

  const requestDeleteMeeting = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    openModal({
      title: "Delete Transmission",
      message: "Are you sure you want to permanently delete this recording? This action cannot be undone.",
      type: "confirm",
      onConfirm: () => performDeleteMeeting(id),
      onClose: closeModal
    });
  };

  const performDeleteMeeting = async (id: string) => {
    closeModal();
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const userId = getUserId();
      const res = await fetch(`${apiUrl}/api/meetings/${id}/`, {
        method: "DELETE",
        headers: { "X-User-Id": userId || "" }
      });
      if (res.ok) {
        setMeetings(prev => prev.filter(m => m.id !== id));
      } else {
        openModal({ title: "Deletion Failed", message: "Failed to delete the transmission.", type: "error", onClose: closeModal });
      }
    } catch (err) {
      console.error(err);
      openModal({ title: "System Error", message: "A network error occurred while deleting.", type: "error", onClose: closeModal });
    }
  };

  // Timer logic for recording
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600).toString().padStart(2, "0");
    const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return h === "00" ? `${m}m ${s}s` : `${h}h ${m}m ${s}s`;
  };

  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [meetingTitle, setMeetingTitle] = useState("");

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(chunksRef.current, { type: "audio/webm" });
        setRecordedBlob(audioBlob);
        
        // Stop all tracks to release microphone
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      setMeetingTitle("");
    } catch (err) {
      console.error("Error accessing microphone:", err);
      openModal({ 
        title: "Microphone Access Denied", 
        message: "Could not access your microphone. Please ensure browser permissions are granted and try again.", 
        type: "error", 
        onClose: closeModal 
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const submitRecording = async () => {
    if (!recordedBlob) return;
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("title", meetingTitle.trim() || `Meeting Recording - ${new Date().toLocaleString()}`);
      formData.append("audio_file", recordedBlob, "recording.webm");

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const userId = getUserId();

      const response = await fetch(`${apiUrl}/api/meetings/`, {
        method: "POST",
        headers: {
          "X-User-Id": userId,
        },
        body: formData,
      });

      if (!response.ok) {
        const errText = await response.text();
        console.error("Backend error response:", errText);
        throw new Error(`Failed to upload recording: ${response.status} ${errText}`);
      }

      const data = await response.json();
      console.log("Upload successful:", data);
      
      // Redirect to the new meeting transcript page
      router.push(`/meeting/${data.id}`);
      
    } catch (err) {
      console.error("Upload error:", err);
      openModal({ 
        title: "Upload Failed", 
        message: "We encountered a network error while securely uploading your transmission. Please try again.", 
        type: "error", 
        onClose: closeModal 
      });
      setIsUploading(false); // only reset on error so they can try again, success redirects anyway
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#1A1A1A] text-neutral-50 font-sans selection:bg-[#FF6B4A]/30">
      <Modal config={modalConfig} />
      {/* Navbar - Minimal */}
      <nav className="w-full z-50 pt-6">
        <div className="max-w-6xl mx-auto px-6 flex items-center">
          <Link href="/" className="inline-flex items-center gap-2 font-bold text-xl text-white hover:opacity-80 transition-opacity">
            <Mic01Icon size={24} className="text-[#FF6B4A]" />
            Scribely
          </Link>
        </div>
      </nav>

      {/* Main Recording Area */}
      <main className="flex-1 flex flex-col items-center justify-center p-6 relative">
          <AnimatePresence mode="wait">
            {!isRecording && !isUploading && !recordedBlob ? (
              <motion.div
                key="start"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3 }}
                className="flex flex-col items-center"
              >
                <button
                  onClick={startRecording}
                  className="w-32 h-32 rounded-full bg-[#FF6B4A] hover:bg-[#ff5533] flex items-center justify-center text-white shadow-[0_0_40px_rgba(255,107,74,0.3)] hover:shadow-[0_0_60px_rgba(255,107,74,0.5)] transition-all transform hover:scale-105 active:scale-95"
                >
                  <Mic01Icon size={48} />
                </button>
                <h2 className="mt-8 text-xl md:text-2xl font-bold text-white">Start Recording</h2>
                <p className="mt-2 text-sm md:text-base text-neutral-400 text-center max-w-sm">
                  Click the microphone to start capturing your meeting.
                </p>
              </motion.div>
            ) : isRecording ? (
              <motion.div
                key="recording"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3 }}
                className="flex flex-col items-center w-full max-w-lg"
              >
                <div className="bg-[#242424] border border-[#333333] rounded-3xl p-8 w-full shadow-2xl flex flex-col items-center">
                  <div className="flex items-center gap-3 mb-8">
                    <div className="w-3.5 h-3.5 rounded-full bg-red-500 animate-pulse shadow-[0_0_15px_rgba(239,68,68,0.8)]" />
                    <span className="text-2xl font-mono text-white tracking-wider">{formatTime(recordingTime)}</span>
                  </div>
                  
                  {/* Dynamic Waveform */}
                  <div className="flex items-center justify-center gap-1.5 h-24 mb-10 w-full overflow-hidden px-4">
                    {[...Array(12)].map((_, i) => (
                      <motion.div
                        key={i}
                        animate={{ height: ["20%", "100%", "30%", "80%", "20%"] }}
                        transition={{
                          repeat: Infinity,
                          duration: 0.8 + (i % 3) * 0.2, // pseudo-random deterministic duration
                          ease: "easeInOut",
                          delay: (i % 4) * 0.15,
                        }}
                        className="w-3 bg-[#FF6B4A] rounded-full"
                      />
                    ))}
                  </div>

                  <button
                    onClick={stopRecording}
                    className="px-8 py-3 bg-[#333333] hover:bg-[#444444] text-white rounded-full font-semibold transition-colors flex items-center gap-3"
                  >
                    <div className="w-3.5 h-3.5 bg-[#FF6B4A] rounded-[2px]" />
                    Stop Recording
                  </button>
                </div>
                <p className="mt-6 text-neutral-400 text-center animate-pulse">
                  Listening and transcribing in real-time...
                </p>
              </motion.div>
            ) : recordedBlob && !isUploading ? (
              <motion.div
                key="naming"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3 }}
                className="flex flex-col items-center w-full max-w-md"
              >
                <div className="bg-[#242424] border border-[#333333] rounded-3xl p-8 w-full shadow-2xl flex flex-col items-center text-center">
                  <h2 className="text-2xl font-bold text-white mb-2">Name Your Meeting</h2>
                  <p className="text-neutral-400 text-sm mb-6">Enter a title for your recording.</p>
                  
                  <input
                    type="text"
                    value={meetingTitle}
                    onChange={(e) => setMeetingTitle(e.target.value)}
                    placeholder="e.g. Q3 Roadmap Planning"
                    className="w-full bg-[#1A1A1A] border border-[#333333] focus:border-[#FF6B4A] focus:ring-1 focus:ring-[#FF6B4A] outline-none rounded-xl px-4 py-3 text-white mb-6 transition-all"
                    autoFocus
                    onKeyDown={(e) => e.key === 'Enter' && submitRecording()}
                  />

                  <button
                    onClick={submitRecording}
                    className="w-full py-3 bg-[#FF6B4A] hover:bg-[#ff5533] text-white rounded-xl font-semibold transition-colors shadow-[0_0_20px_rgba(255,107,74,0.2)]"
                  >
                    Save & Upload
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="uploading"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3 }}
                className="flex flex-col items-center"
              >
                <div className="w-16 h-16 border-4 border-[#FF6B4A]/20 border-t-[#FF6B4A] rounded-full animate-spin mb-6" />
                <h2 className="text-2xl font-bold text-white mb-2">Processing Recording</h2>
                <p className="text-neutral-400 text-center max-w-sm">
                  Securely uploading your audio for AI transcription. This may take a moment.
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Previous Recordings - Futuristic Design */}
          {meetings.length > 0 && !isRecording && !recordedBlob && !isUploading && (
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5, ease: "easeOut" }}
              className="w-full max-w-2xl mt-24"
            >
              <div className="flex items-center justify-between mb-8 px-2">
                <div className="flex items-center gap-3">
                  <div className="w-1.5 h-6 rounded-full bg-gradient-to-b from-[#FF6B4A] to-[#ff3300] shadow-[0_0_12px_rgba(255,107,74,0.6)]" />
                  <h3 className="text-lg md:text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-neutral-400 tracking-wide uppercase letter-spacing-2">
                    Recent Logs
                  </h3>
                </div>
                <Link href="/meetings" className="flex items-center gap-2 text-[10px] md:text-xs font-bold text-[#FF6B4A] hover:text-[#ff5533] transition-colors group tracking-widest uppercase">
                  View All
                  <ArrowRight01Icon size={14} className="group-hover:translate-x-1.5 transition-transform" />
                </Link>
              </div>
              
              <div className="flex flex-col gap-4">
                {meetings.slice(0, 5).map((m, idx) => (
                  <Link 
                    key={m.id} 
                    href={`/meeting/${m.id}`}
                  >
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 + (idx * 0.1) }}
                      className="relative overflow-hidden flex items-center justify-between p-4 md:p-5 bg-[#171717]/80 backdrop-blur-md hover:bg-[#1E1E1E] border border-[#2A2A2A] hover:border-[#FF6B4A]/50 rounded-2xl transition-all duration-300 group hover:shadow-[0_0_30px_rgba(255,107,74,0.1)] hover:-translate-y-0.5"
                    >
                      {/* Futuristic subtle gradient overlay on hover */}
                      <div className="absolute inset-0 bg-gradient-to-r from-[#FF6B4A]/0 via-[#FF6B4A]/0 to-[#FF6B4A]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                      
                      <div className="flex items-center gap-4 md:gap-5 relative z-10">
                        <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-[#111111] border border-[#2A2A2A] flex items-center justify-center group-hover:border-[#FF6B4A]/30 group-hover:bg-[#FF6B4A]/10 transition-colors shadow-inner flex-shrink-0">
                           <Mic01Icon size={18} className="text-neutral-500 group-hover:text-[#FF6B4A] transition-colors" />
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-base md:text-lg font-semibold text-neutral-200 tracking-wide group-hover:text-white transition-colors truncate max-w-[150px] sm:max-w-[200px] md:max-w-[300px]">
                            {m.title || "Untitled Transmission"}
                          </h4>
                          <p className="text-[11px] text-neutral-500 font-mono mt-1 flex items-center gap-2 uppercase tracking-wider">
                            {new Date(m.created_at).toLocaleDateString()} 
                            <span className="w-1 h-1 rounded-full bg-[#333333]" /> 
                            {new Date(m.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-6 relative z-10">
                        <div className={`flex items-center gap-2 text-[10px] font-mono font-bold px-3 py-1.5 rounded-lg border ${
                          m.status === 'completed' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                          m.status === 'failed' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                          'bg-blue-500/10 text-blue-400 border-blue-500/20'
                        }`}>
                          {m.status === 'completed' && <div className="w-1.5 h-1.5 rounded-full bg-green-400 shadow-[0_0_8px_rgba(74,222,128,1)]" />}
                          {(m.status === 'processing' || m.status === 'pending') && <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse shadow-[0_0_8px_rgba(96,165,250,1)]" />}
                          {m.status === 'failed' && <div className="w-1.5 h-1.5 rounded-full bg-red-400 shadow-[0_0_8px_rgba(248,113,113,1)]" />}
                          {m.status.toUpperCase()}
                        </div>
                        <div className="flex items-center gap-4">
                          <button 
                            onClick={(e) => requestDeleteMeeting(m.id, e)}
                            className="p-2 text-neutral-500 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors z-20"
                            title="Delete meeting"
                          >
                            <Delete01Icon size={18} />
                          </button>
                          <ArrowRight01Icon size={20} className="text-neutral-600 group-hover:text-[#FF6B4A] group-hover:translate-x-2 transition-all duration-300" />
                        </div>
                      </div>
                    </motion.div>
                  </Link>
                ))}
              </div>
            </motion.div>
          )}
      </main>
    </div>
  );
}
