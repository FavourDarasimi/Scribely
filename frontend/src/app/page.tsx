"use client";

import Link from "next/link";
import { useState, useRef } from "react";
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from "framer-motion";
import {
  Upload01Icon,
  Mic01Icon,
  Mic02Icon,
  UserGroup02Icon,
  UserIcon,
  CheckmarkCircle01Icon,
  GithubIcon,
  ZapIcon,
  HeadphonesIcon,
  Note01Icon,
  Note02Icon,
  BrainIcon,
  SparklesIcon,
  PencilIcon,
  TextIcon,
  Calendar01Icon,
  Clock01Icon,
  VoiceIcon,
  WaveIcon,
  PlayIcon,
  File01Icon,
  File02Icon,
  DashboardSpeed01Icon,
  CloudIcon,
  Share01Icon
} from "hugeicons-react";

const INTEGRATION_ICONS = [
  { Icon: ZapIcon, index: 7 },
  { Icon: Mic02Icon, index: 14 },
  { Icon: Note01Icon, index: 22 },
  { Icon: SparklesIcon, index: 30 },
  { Icon: BrainIcon, index: 35 },
  { Icon: DashboardSpeed01Icon, index: 48 },
  { Icon: HeadphonesIcon, index: 55 },
  { Icon: UserIcon, index: 62 },
  { Icon: SparklesIcon, index: 71 },
  { Icon: File01Icon, index: 84 },
  { Icon: HeadphonesIcon, index: 89 },
  { Icon: TextIcon, index: 95 },
  { Icon: Calendar01Icon, index: 102 },
  { Icon: Upload01Icon, index: 109 },
  { Icon: CloudIcon, index: 115 },
  { Icon: Clock01Icon, index: 124 },
  { Icon: Mic01Icon, index: 133 },
  { Icon: Note02Icon, index: 142 },
  { Icon: VoiceIcon, index: 149 },
  { Icon: Share01Icon, index: 158 },
  { Icon: PlayIcon, index: 167 },
  { Icon: PencilIcon, index: 174 },
  { Icon: WaveIcon, index: 185 },
  { Icon: UserGroup02Icon, index: 196 },
  { Icon: CheckmarkCircle01Icon, index: 205 },
  { Icon: BrainIcon, index: 212 },
  { Icon: VoiceIcon, index: 218 },
  { Icon: File02Icon, index: 228 },
  { Icon: Mic02Icon, index: 237 },
  { Icon: Note01Icon, index: 245 }
];

export default function Home() {
  const [activeCard, setActiveCard] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start 70%", "end 30%"]
  });

  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    const scrollIndex = Math.min(2, Math.floor(latest * 3));
    setActiveCard(scrollIndex);
  });

  const handleCardClick = () => {
    setActiveCard((prev) => (prev + 1) % 3);
  };

  const howItWorksSteps = [
    {
      number: "01",
      title: "Upload your audio",
      description: "Drop your meeting recording directly into the browser. We accept most standard audio formats.",
      icon: Upload01Icon
    },
    {
      number: "02",
      title: "We transcribe it",
      description: "Scribely accurately transcribes the audio and identifies who is speaking at each moment.",
      icon: UserGroup02Icon
    },
    {
      number: "03",
      title: "Get your summary",
      description: "Receive an AI-generated summary and clear action items in minutes, ready to share.",
      icon: CheckmarkCircle01Icon
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#1A1A1A] text-neutral-50 font-sans selection:bg-[#FF6B4A]/30 overflow-clip">
      {/* Navbar */}
      <nav className="w-full bg-[#1A1A1A]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl text-white">
            <Mic01Icon size={24} className="text-[#FF6B4A]" />
            Scribely
          </Link>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Link
              href="/upload"
              className="text-sm font-medium px-4 py-2 bg-[#FF6B4A] text-white rounded-lg hover:opacity-90 transition-opacity shadow-lg shadow-[#FF6B4A]/20"
            >
              Upload recording
            </Link>
          </motion.div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 w-full flex flex-col items-center justify-center text-center pb-20">
        
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="flex flex-col items-center max-w-4xl w-[90%] md:w-full mx-auto pt-24 pb-16 px-6 relative"
        >
          <h1 className="text-5xl md:text-8xl font-bold tracking-tighter mb-6 text-white leading-tight">
            Stop taking<br />meeting notes.
          </h1>
          <p className="text-md md:text-lg text-neutral-400 mb-10 max-w-2xl leading-relaxed">
            Turn any recording into a clean transcript and summary —<br className="hidden md:block"/>instantly, and for free.
          </p>

          <div className="flex flex-row items-center gap-3 sm:gap-4 w-full justify-center">
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className="flex-1 sm:flex-initial">
              <Link
                href="/upload"
                className="w-full inline-flex justify-center items-center gap-2 px-4 sm:px-8 py-3 sm:py-4 bg-[#FF6B4A] text-white text-sm sm:text-base font-semibold rounded-full shadow-lg shadow-[#FF6B4A]/30 hover:opacity-90 transition-opacity focus:outline-none focus:ring-4 focus:ring-[#FF6B4A]/40 whitespace-nowrap"
              >
                <Upload01Icon size={20} className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="hidden sm:inline">Upload a recording</span>
                <span className="sm:hidden">Upload</span>
              </Link>
            </motion.div>

            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className="flex-1 sm:flex-initial">
              <a
                href="https://github.com"
                target="_blank"
                rel="noreferrer"
                className="w-full inline-flex justify-center items-center gap-2 px-4 sm:px-8 py-3 sm:py-4 bg-[#242424] border border-[#333333] text-white text-sm sm:text-base font-semibold rounded-full hover:bg-[#333333] transition-colors focus:outline-none focus:ring-4 focus:ring-[#333333] whitespace-nowrap"
              >
                <GithubIcon size={20} className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="hidden sm:inline">Star on GitHub</span>
                <span className="sm:hidden">GitHub</span>
              </a>
            </motion.div>
          </div>

          {/* Floating Tooltip Recording Indicator */}
          <motion.div
            initial={{ opacity: 0, y: 20, rotate: -2 }}
            animate={{ 
              opacity: 1, 
              y: [0, -15, 0],
              rotate: [-2, 2, -2]
            }}
            transition={{ 
              opacity: { duration: 0.8, delay: 0.3 },
              y: { repeat: Infinity, duration: 4, ease: "easeInOut" },
              rotate: { repeat: Infinity, duration: 6, ease: "easeInOut" }
            }}
            className="absolute top-6 sm:top-10 md:top-24 right-0 md:right-10 lg:-right-10 flex items-center gap-3 md:gap-4 bg-[#242424]/90 backdrop-blur-xl border border-[#333333] px-4 md:px-5 py-2 md:py-3 rounded-full shadow-2xl z-10 pointer-events-none scale-90 sm:scale-100 origin-top-right md:origin-center"
          >
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-[#FF6B4A]/10 text-[#FF6B4A]">
              <Mic01Icon size={20} />
            </div>
            <div className="hidden sm:flex flex-col text-left mr-2">
              <span className="text-sm font-bold text-white leading-tight">Meeting.wav</span>
              <div className="flex items-center gap-2 mt-1">
                <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse shadow-[0_0_5px_rgba(239,68,68,0.8)]" />
                <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Recording 12:45</span>
              </div>
            </div>
            <div className="flex items-end gap-[3px] h-6 sm:pl-4 sm:border-l border-[#333333]">
              {[1, 2, 3, 4, 5].map((i) => (
                <motion.div
                  key={i}
                  animate={{ height: ["20%", "100%", "40%", "80%", "20%"] }}
                  transition={{
                    repeat: Infinity,
                    duration: 1 + i * 0.15,
                    ease: "easeInOut",
                    delay: i * 0.1,
                  }}
                  className="w-1.5 bg-[#FF6B4A] rounded-full"
                />
              ))}
            </div>
          </motion.div>

          {/* Floating Tooltip Simplified */}
          <motion.div
            initial={{ opacity: 0, y: 20, rotate: 3 }}
            animate={{ 
              opacity: 1, 
              y: [0, 10, 0],
              rotate: [3, -1, 3]
            }}
            transition={{ 
              opacity: { duration: 0.8, delay: 0.5 },
              y: { repeat: Infinity, duration: 4.5, ease: "easeInOut" },
              rotate: { repeat: Infinity, duration: 5.5, ease: "easeInOut" }
            }}
            className="absolute bottom-6 md:bottom-12 left-0 md:left-10 lg:-left-4 hidden md:flex items-center bg-[#242424]/90 backdrop-blur-xl border border-[#333333] px-4 py-3 rounded-full shadow-2xl z-10 pointer-events-none"
          >
            <div className="flex -space-x-3">
               <div className="w-10 h-10 rounded-full bg-blue-500/10 border-[3px] border-[#242424] flex items-center justify-center text-blue-400 z-30">
                 <UserIcon size={18} />
               </div>
               <div className="w-10 h-10 rounded-full bg-[#FF6B4A]/10 border-[3px] border-[#242424] flex items-center justify-center text-[#FF6B4A] z-20">
                 <UserIcon size={18} />
               </div>
               <div className="w-10 h-10 rounded-full bg-purple-500/10 border-[3px] border-[#242424] flex items-center justify-center text-purple-400 z-10">
                 <UserIcon size={18} />
               </div>
            </div>
          </motion.div>
        </motion.div>

        {/* How it works */}
        <div ref={containerRef} className="relative w-full py-16">
          <div className="w-full max-w-6xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              {/* Left Text */}
              <motion.div 
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.7 }}
                className="flex flex-col justify-center"
              >
                <h2 className="text-5xl md:text-6xl font-extrabold text-white tracking-tighter leading-tight max-w-sm text-left">
                  Focus on the meeting.<br/>
                  <span className="text-neutral-400">We'll handle the notes.</span>
                </h2>
              </motion.div>

              {/* Right Stacked Cards */}
              <div className="relative h-[440px] w-full max-w-md mx-auto lg:mx-0 flex justify-center perspective-[1000px]">
                <AnimatePresence>
                  {howItWorksSteps.map((step, index) => {
                    const offset = (index - activeCard + howItWorksSteps.length) % howItWorksSteps.length;
                    
                    const yOffset = offset * 50; 
                    const scale = 1 - offset * 0.05;
                    const zIndex = 30 - offset;
                    const opacity = offset > 2 ? 0 : 1 - offset * 0.2;

                    return (
                      <motion.div
                        key={index}
                        layout
                        className="absolute top-0 left-0 right-0 w-full h-[360px] p-8 rounded-[2rem] bg-[#242424] border border-[#333333] shadow-2xl cursor-pointer flex flex-col justify-start"
                        style={{ transformOrigin: "top center" }}
                        animate={{
                          y: yOffset,
                          scale: scale,
                          zIndex: zIndex,
                          opacity: opacity,
                        }}
                        transition={{ duration: 0.5, ease: [0.32, 0.72, 0, 1] }}
                        onClick={handleCardClick}
                        whileHover={{ y: yOffset - 8 }}
                      >
                        <div className="flex items-start justify-between w-full mb-10 ">
                          <span className="text-7xl font-black text-[#333333] leading-none">
                            {step.number}
                          </span>
                          <div className="p-4 bg-[#FF6B4A]/10 text-[#FF6B4A] rounded-2xl">
                            <step.icon size={32} />
                          </div>
                        </div>
                        <h3 className="text-3xl font-bold text-white mt-6 mb-4 text-left">{step.title}</h3>
                        <p className="text-neutral-400 leading-relaxed text-lg text-left">
                          {step.description}
                        </p>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
          </div>
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="w-full mt-12"
        >
          <div className="relative bg-[#1A1A1A] overflow-hidden px-8 py-32 text-center flex flex-col items-center min-h-[400px] justify-center">
            
            {/* Grid Background */}
            <div 
              className="absolute inset-0 flex flex-wrap gap-2 sm:gap-3 p-4 sm:p-6 overflow-hidden justify-center items-center opacity-80"
              style={{
                maskImage: 'radial-gradient(circle at center, transparent 20%, black 55%)',
                WebkitMaskImage: 'radial-gradient(circle at center, transparent 20%, black 55%)'
              }}
            >
              {Array.from({ length: 250 }).map((_, i) => {
                const iconObj = INTEGRATION_ICONS.find(item => item.index === i);
                return (
                  <div key={i} className="w-12 h-12 sm:w-16 sm:h-16 flex-shrink-0 rounded-2xl bg-[#242424] border border-[#333333] flex items-center justify-center transition-colors hover:bg-[#333]">
                    {iconObj && <iconObj.Icon size={24} className="text-white" />}
                  </div>
                )
              })}
            </div>

            {/* Content overlay */}
            <div className="relative z-10 flex flex-col items-center">
              <h2 className="text-5xl md:text-7xl font-extrabold text-transparent bg-clip-text bg-gradient-to-br from-white to-neutral-400 mb-12 tracking-tighter drop-shadow-lg text-center px-4">
                Ready to stop taking notes?
              </h2>
              
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                  <Link
                    href="/upload"
                    className="inline-flex items-center gap-2 px-8 py-4 bg-[#FF6B4A] text-white font-semibold rounded-full shadow-lg shadow-[#FF6B4A]/30 hover:opacity-90 transition-opacity focus:outline-none focus:ring-4 focus:ring-[#FF6B4A]/40"
                  >
                    <Upload01Icon size={20} />
                    Start transcribing
                  </Link>
                </motion.div>
              </div>
            </div>
          </div>
        </motion.div>
      </main>

      <footer className="w-full py-10 border-t border-[#333333] bg-[#1A1A1A]">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2 font-bold text-lg text-white">
            <Mic01Icon size={20} className="text-[#FF6B4A]" />
            Scribely
          </div>
          
          <div className="flex items-center gap-6 text-sm text-neutral-400">
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
            <a href="https://github.com" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">
              GitHub
            </a>
          </div>

          <p className="text-sm text-neutral-600">
            &copy; {new Date().getFullYear()} Scribely. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
