"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Mic01Icon, ArrowRight01Icon } from "hugeicons-react";
import { motion } from "framer-motion";

type Meeting = {
  id: string;
  title: string;
  status: "pending" | "processing" | "completed" | "failed";
  created_at: string;
};

export default function MeetingsPage() {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const getUserId = () => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("scribely_user_id");
    }
    return null;
  };

  useEffect(() => {
    const fetchMeetings = async () => {
      const userId = getUserId();
      if (!userId) {
        setIsLoading(false);
        return;
      }
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
      } finally {
        setIsLoading(false);
      }
    };
    fetchMeetings();
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-[#1A1A1A] text-neutral-50 font-sans selection:bg-[#FF6B4A]/30">
      <nav className="w-full bg-[#1A1A1A]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl text-white hover:opacity-80 transition-opacity">
            <Mic01Icon size={24} className="text-[#FF6B4A]" />
            Scribely
          </Link>
          <Link
            href="/upload"
            className="text-sm font-medium px-4 py-2 bg-[#FF6B4A] text-white rounded-lg hover:opacity-90 transition-opacity shadow-lg shadow-[#FF6B4A]/20"
          >
            New Recording
          </Link>
        </div>
      </nav>

      <main className="flex-1 max-w-6xl w-full mx-auto p-6 md:px-6 py-12">
        <header className="mb-10 flex items-center gap-3">
          <div className="w-1.5 h-8 rounded-full bg-gradient-to-b from-[#FF6B4A] to-[#ff3300] shadow-[0_0_12px_rgba(255,107,74,0.6)]" />
          <div>
            <h1 className="text-2xl md:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-neutral-400 tracking-wide uppercase letter-spacing-2 mb-1">
              Transmission Logs
            </h1>
            <p className="text-xs md:text-sm text-neutral-500 font-mono tracking-wide">
              Securely access and review your processed audio logs.
            </p>
          </div>
        </header>

        {isLoading ? (
          <div className="flex items-center justify-center py-32">
            <div className="w-16 h-16 border-4 border-[#FF6B4A]/20 border-t-[#FF6B4A] rounded-full animate-spin shadow-[0_0_30px_rgba(255,107,74,0.3)]" />
          </div>
        ) : meetings.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center py-20 bg-[#171717]/80 backdrop-blur-xl rounded-3xl border border-[#2A2A2A] shadow-2xl text-center max-w-2xl mx-auto relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-[#FF6B4A]/5 to-transparent pointer-events-none" />
            <div className="w-20 h-20 rounded-2xl bg-[#111111] border border-[#2A2A2A] flex items-center justify-center mb-6 shadow-inner relative z-10">
              <Mic01Icon size={40} className="text-[#FF6B4A]" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-3 tracking-wide uppercase">No Signals Found</h2>
            <p className="text-neutral-400 mb-8 max-w-sm text-sm">
              Your transmission history is empty. Initialize a new recording sequence to populate your logs.
            </p>
            <Link
              href="/upload"
              className="px-8 py-3 bg-[#FF6B4A] hover:bg-[#ff5533] text-white rounded-xl font-bold tracking-widest uppercase text-sm transition-all shadow-[0_0_20px_rgba(255,107,74,0.3)] hover:shadow-[0_0_40px_rgba(255,107,74,0.5)] hover:-translate-y-0.5"
            >
              Initialize Recording
            </Link>
          </motion.div>
        ) : (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="w-full bg-[#171717]/80 backdrop-blur-xl border border-[#2A2A2A] rounded-2xl overflow-hidden shadow-2xl"
          >
            {/* Table Header */}
            <div className="grid grid-cols-12 gap-4 p-4 border-b border-[#2A2A2A] bg-[#111111]/80 text-[10px] font-bold tracking-widest uppercase text-neutral-500">
              <div className="col-span-6 md:col-span-5 pl-4">Transmission Name</div>
              <div className="hidden md:block col-span-3">Timestamp</div>
              <div className="col-span-4 md:col-span-2">Status</div>
              <div className="col-span-2 text-right pr-4">Action</div>
            </div>

            {/* Table Body */}
            <div className="flex flex-col">
              {meetings.map((m, idx) => (
                <Link
                  href={`/meeting/${m.id}`}
                  key={m.id}
                  className="grid grid-cols-12 gap-4 p-4 items-center border-b border-[#2A2A2A]/50 last:border-0 hover:bg-[#1E1E1E] transition-all duration-300 group relative"
                >
                  {/* Subtle hover gradient */}
                  <div className="absolute inset-0 bg-gradient-to-r from-[#FF6B4A]/0 via-[#FF6B4A]/0 to-[#FF6B4A]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

                  {/* Title Col */}
                  <div className="col-span-6 md:col-span-5 flex items-center gap-4 pl-2 md:pl-4 relative z-10">
                    <div className="w-10 h-10 rounded-lg bg-[#111111] border border-[#2A2A2A] flex items-center justify-center group-hover:border-[#FF6B4A]/30 group-hover:bg-[#FF6B4A]/10 transition-colors shadow-inner flex-shrink-0">
                       <Mic01Icon size={16} className="text-neutral-500 group-hover:text-[#FF6B4A] transition-colors" />
                    </div>
                    <h3 className="text-sm md:text-base font-semibold text-neutral-200 group-hover:text-white transition-colors truncate pr-2">
                      {m.title || "Untitled Transmission"}
                    </h3>
                  </div>

                  {/* Timestamp Col */}
                  <div className="hidden md:flex flex-col col-span-3 relative z-10">
                    <span className="text-[11px] text-neutral-400 font-mono tracking-wider uppercase">
                      {new Date(m.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                    </span>
                    <span className="text-[10px] text-neutral-600 font-mono tracking-wider">
                      {new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  {/* Status Col */}
                  <div className="col-span-4 md:col-span-2 relative z-10">
                    <div className={`inline-flex items-center gap-2 text-[10px] font-mono font-bold px-3 py-1.5 rounded-lg border ${
                      m.status === 'completed' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                      m.status === 'failed' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                      'bg-blue-500/10 text-blue-400 border-blue-500/20'
                    }`}>
                      {m.status === 'completed' && <div className="w-1.5 h-1.5 rounded-full bg-green-400 shadow-[0_0_8px_rgba(74,222,128,1)]" />}
                      {(m.status === 'processing' || m.status === 'pending') && <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse shadow-[0_0_8px_rgba(96,165,250,1)]" />}
                      {m.status === 'failed' && <div className="w-1.5 h-1.5 rounded-full bg-red-400 shadow-[0_0_8px_rgba(248,113,113,1)]" />}
                      {m.status.toUpperCase()}
                    </div>
                  </div>

                  {/* Action Col */}
                  <div className="col-span-2 flex justify-end pr-2 md:pr-4 relative z-10">
                    <span className="text-[10px] font-bold tracking-widest text-[#FF6B4A] uppercase flex items-center gap-1.5 opacity-0 group-hover:opacity-100 group-hover:translate-x-0 -translate-x-2 transition-all duration-300">
                      <span className="hidden lg:inline">Decrypt</span> <ArrowRight01Icon size={14} />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </main>
    </div>
  );
}
