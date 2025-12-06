'use client';

import { useEffect, useMemo, useState, useRef } from 'react';
import { motion, AnimatePresence, useScroll } from 'framer-motion';
import { MoveRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

// iMessage CSS styles
const iMessageStyles = `
  .imessage-sent {
    position: relative;
    background: #007AFF;
    color: white;
    padding: 8px 14px;
    font-size: 14px;
    line-height: 18px;
    font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif;
    border-radius: 1.25rem;
    max-width: 100%;
    word-wrap: break-word;
  }
  
  .imessage-sent.has-tail::before {
    content: '';
    position: absolute;
    bottom: 0;
    right: -0.4375rem;
    width: 1.25rem;
    height: 1.25rem;
    background: #007AFF;
    border-bottom-left-radius: 1rem 0.875rem;
  }
  
  .imessage-sent.has-tail::after {
    content: '';
    position: absolute;
    bottom: 0;
    right: -1.625rem;
    width: 1.625rem;
    height: 1.25rem;
    background: white;
    border-bottom-left-radius: 0.625rem;
  }
  
  .imessage-received {
    position: relative;
    background: #E5E5EA;
    color: black;
    padding: 8px 14px;
    font-size: 14px;
    line-height: 18px;
    font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif;
    border-radius: 1.25rem;
    max-width: 100%;
    word-wrap: break-word;
  }
  
  .imessage-received.has-tail::before {
    content: '';
    position: absolute;
    bottom: 0;
    left: -0.4375rem;
    width: 1.25rem;
    height: 1.25rem;
    background: #E5E5EA;
    border-bottom-right-radius: 1rem 0.875rem;
  }
  
  .imessage-received.has-tail::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: -1.625rem;
    width: 1.625rem;
    height: 1.25rem;
    background: white;
    border-bottom-right-radius: 0.625rem;
  }
  
  @keyframes shimmer {
    0% { transform: translateX(-100%) rotate(45deg); }
    100% { transform: translateX(200%) rotate(45deg); }
  }
  
  .phone-shimmer {
    animation: shimmer 3s ease-in-out infinite;
  }
`;

// Clean iPhone component
function IPhoneWithMessages({ scrollProgress }: { scrollProgress: number }) {
  const [showMessages, setShowMessages] = useState(false);
  const [currentCycle, setCurrentCycle] = useState(0);

  const phoneOpacity = Math.max(0, 1 - scrollProgress * 2);
  const phoneScale = 1 - scrollProgress * 0.08;
  const phoneY = scrollProgress * -30;

  useEffect(() => {
    const startTimer = setTimeout(() => {
      setShowMessages(true);
    }, 1800);
    return () => clearTimeout(startTimer);
  }, []);

  useEffect(() => {
    if (showMessages) {
      const cycleTimer = setTimeout(() => {
        setShowMessages(false);
        setTimeout(() => {
          setCurrentCycle((c) => c + 1);
          setShowMessages(true);
        }, 800);
      }, 6000);
      return () => clearTimeout(cycleTimer);
    }
  }, [showMessages, currentCycle]);

  // Alternate between grouping and scheduling messages
  const messageCycles = [
    // Cycle 1: Group creation
    [
      { text: 'I need a team for volleyball 🏐', isUser: true, delay: 0 },
      { text: 'Here is a volleyball group!', isUser: false, delay: 0.4 },
      { type: 'profile', delay: 0.8 },
    ],
    // Cycle 2: Scheduling
    [
      { text: 'Schedule a doctor visit at 5pm', isUser: true, delay: 0 },
      {
        text: '✅ Scheduled! Added to your calendar',
        isUser: false,
        delay: 0.4,
      },
      { type: 'calendar', delay: 0.8 },
    ],
    // Cycle 3: Meeting setup
    [
      {
        text: 'Set up a meeting with the team tomorrow',
        isUser: true,
        delay: 0,
      },
      {
        text: '📅 Meeting created! Invites sent to 5 people',
        isUser: false,
        delay: 0.4,
      },
      { type: 'meeting', delay: 0.8 },
    ],
  ];

  const messages = messageCycles[currentCycle % messageCycles.length];

  return (
    <div
      className="relative z-30"
      style={{
        perspective: '1200px',
        perspectiveOrigin: '50% 50%',
        marginTop: '200px',
      }}
    >
      <motion.div
        initial={{
          opacity: 0,
          x: -150,
          rotateY: -12,
          rotateX: 8,
          scale: 0.95,
        }}
        animate={{
          opacity: 1,
          x: 0,
          rotateY: -5,
          rotateX: 4,
          scale: 1,
        }}
        transition={{
          duration: 1,
          ease: [0.25, 0.1, 0.25, 1],
        }}
        style={{
          willChange: 'transform, opacity',
        }}
      >
        <div
          style={{
            transform: `
              translateY(${phoneY}px) 
              rotateY(${-5 + scrollProgress * 8}deg) 
              rotateX(4deg) 
              scale(${phoneScale})
            `,
            opacity: phoneOpacity,
            transition: 'transform 0.15s ease-out, opacity 0.15s ease-out',
            willChange: 'transform, opacity',
          }}
        >
          {/* Shadow wrapper for cross-browser consistency */}
          <div
            style={{
              position: 'relative',
              filter:
                'drop-shadow(0 60px 120px rgba(0, 0, 0, 0.5)) drop-shadow(0 30px 60px rgba(0, 0, 0, 0.4))',
              WebkitFilter:
                'drop-shadow(0 60px 120px rgba(0, 0, 0, 0.5)) drop-shadow(0 30px 60px rgba(0, 0, 0, 0.4))',
            }}
          >
            {/* iPhone Frame - Clean Design */}
            <div
              className="relative rounded-[55px] p-[12px]"
              style={{
                width: '280px',
                height: '570px',
                background:
                  'linear-gradient(145deg, #1f1f1f 0%, #1a1a1a 50%, #111111 100%)',
                // Border and inset shadows only (main shadow via filter)
                boxShadow: `
                  0 0 0 1px rgba(255, 255, 255, 0.08),
                  inset 0 1px 0 rgba(255, 255, 255, 0.1),
                  inset 0 -1px 0 rgba(0, 0, 0, 0.3)
                `,
              }}
            >
              {/* Side button - Right */}
              <div
                className="absolute -right-[3px] top-[140px] w-[4px] h-[80px] rounded-r-[2px]"
                style={{
                  background:
                    'linear-gradient(90deg, #2a2a2a 0%, #404040 50%, #2a2a2a 100%)',
                }}
              />
              {/* Side buttons - Left */}
              <div
                className="absolute -left-[3px] top-[120px] w-[4px] h-[35px] rounded-l-[2px]"
                style={{
                  background:
                    'linear-gradient(90deg, #2a2a2a 0%, #404040 50%, #2a2a2a 100%)',
                }}
              />
              <div
                className="absolute -left-[3px] top-[170px] w-[4px] h-[60px] rounded-l-[2px]"
                style={{
                  background:
                    'linear-gradient(90deg, #2a2a2a 0%, #404040 50%, #2a2a2a 100%)',
                }}
              />
              <div
                className="absolute -left-[3px] top-[245px] w-[4px] h-[60px] rounded-l-[2px]"
                style={{
                  background:
                    'linear-gradient(90deg, #2a2a2a 0%, #404040 50%, #2a2a2a 100%)',
                }}
              />
              {/* Screen */}
              <div
                className="relative w-full h-full rounded-[45px] overflow-hidden flex flex-col"
                style={{
                  background: '#ffffff',
                  boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.05)',
                }}
              >
                {/* Dynamic Island */}
                <div
                  className="absolute top-[10px] left-1/2 -translate-x-1/2 w-[80px] h-[22px] bg-black rounded-full z-20"
                  style={{ boxShadow: '0 2px 6px rgba(0,0,0,0.2)' }}
                />

                {/* iOS Status Bar */}
                <div className="pt-[12px] px-6 flex justify-between items-center">
                  <span className="text-[14px] font-semibold text-black">
                    9:41
                  </span>
                  <div className="flex items-center gap-1">
                    <svg width="14" height="9" viewBox="0 0 18 12" fill="none">
                      <rect
                        x="0"
                        y="8"
                        width="3"
                        height="4"
                        rx="0.5"
                        fill="black"
                      />
                      <rect
                        x="4.5"
                        y="5.5"
                        width="3"
                        height="6.5"
                        rx="0.5"
                        fill="black"
                      />
                      <rect
                        x="9"
                        y="3"
                        width="3"
                        height="9"
                        rx="0.5"
                        fill="black"
                      />
                      <rect
                        x="13.5"
                        y="0"
                        width="3"
                        height="12"
                        rx="0.5"
                        fill="black"
                      />
                    </svg>
                    <svg width="13" height="9" viewBox="0 0 16 12" fill="none">
                      <path
                        d="M8 2.4C10.4 2.4 12.5 3.3 14.1 4.8L15.5 3.4C13.5 1.5 10.9 0.3 8 0.3C5.1 0.3 2.5 1.5 0.5 3.4L1.9 4.8C3.5 3.3 5.6 2.4 8 2.4Z"
                        fill="black"
                      />
                      <path
                        d="M8 6C9.5 6 10.9 6.6 11.9 7.6L13.3 6.2C11.9 4.8 10 4 8 4C6 4 4.1 4.8 2.7 6.2L4.1 7.6C5.1 6.6 6.5 6 8 6Z"
                        fill="black"
                      />
                      <path
                        d="M8 9.6C8.7 9.6 9.3 9.8 9.8 10.3L8 12L6.2 10.3C6.7 9.8 7.3 9.6 8 9.6Z"
                        fill="black"
                      />
                    </svg>
                    <div className="flex items-center">
                      <div className="relative w-[18px] h-[8px] rounded-[2px] border-[1.5px] border-black">
                        <div className="absolute inset-[1px] right-[2px] bg-black rounded-[1px]" />
                      </div>
                      <div className="w-[1px] h-[3px] bg-black rounded-r-[0.5px] ml-[0.5px]" />
                    </div>
                  </div>
                </div>

                {/* Chat header */}
                <div className="px-3 py-2 flex items-center border-b border-gray-100">
                  <button className="text-[#007AFF] p-1">
                    <svg width="10" height="16" viewBox="0 0 12 20" fill="none">
                      <path
                        d="M10 2L2 10L10 18"
                        stroke="#007AFF"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>
                  <div className="flex-1 flex flex-col items-center">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
                      SS
                    </div>
                    <p className="font-semibold text-[14px] text-black mt-0.5">
                      Series Sync
                    </p>
                  </div>
                  <button className="text-[#007AFF] p-1">
                    <svg width="18" height="18" viewBox="0 0 22 22" fill="none">
                      <circle
                        cx="11"
                        cy="7"
                        r="4"
                        stroke="#007AFF"
                        strokeWidth="2"
                      />
                      <path
                        d="M3 20C3 15.5817 6.58172 12 11 12C15.4183 12 19 15.5817 19 20"
                        stroke="#007AFF"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                    </svg>
                  </button>
                </div>

                {/* Messages area */}
                <div className="flex-1 px-3 py-2 overflow-hidden bg-white">
                  <div className="text-center mb-2">
                    <span className="text-[10px] text-gray-400">
                      Today 9:41 AM
                    </span>
                  </div>

                  <AnimatePresence mode="wait">
                    {showMessages && (
                      <div key={currentCycle} className="flex flex-col gap-1">
                        {messages.map((message, index) => (
                          <motion.div
                            key={`${currentCycle}-${
                              message.type || message.text
                            }-${index}`}
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            transition={{
                              delay: message.delay,
                              duration: 0.3,
                              ease: 'easeOut',
                            }}
                          >
                            {message.type !== 'profile' && (
                              <div
                                className={`flex ${
                                  message.isUser
                                    ? 'justify-end'
                                    : 'justify-start'
                                }`}
                                style={{
                                  marginBottom: '8px',
                                  paddingRight: message.isUser ? '4px' : '0',
                                  paddingLeft: !message.isUser ? '4px' : '0',
                                }}
                              >
                                <div className="max-w-[80%]">
                                  <div
                                    className={
                                      message.isUser
                                        ? 'imessage-sent has-tail'
                                        : 'imessage-received has-tail'
                                    }
                                  >
                                    {message.text}
                                  </div>
                                </div>
                              </div>
                            )}

                            {message.type === 'profile' && (
                              <div
                                className="flex justify-start"
                                style={{ paddingLeft: '4px', marginTop: '4px' }}
                              >
                                <div className="rounded-xl overflow-hidden bg-white border border-gray-200 shadow-sm">
                                  <div className="p-2 flex items-center gap-2">
                                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-orange-400 to-pink-500 flex items-center justify-center text-lg">
                                      🏐
                                    </div>
                                    <div>
                                      <p className="font-semibold text-[12px] text-gray-900">
                                        Volleyball Squad
                                      </p>
                                      <p className="text-[10px] text-gray-500">
                                        12 members
                                      </p>
                                    </div>
                                    <div className="ml-1 px-3 py-1 bg-blue-500 rounded-full">
                                      <span className="text-white text-[10px] font-semibold">
                                        Join
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}

                            {message.type === 'calendar' && (
                              <div
                                className="flex justify-start"
                                style={{ paddingLeft: '4px', marginTop: '4px' }}
                              >
                                <div className="rounded-xl overflow-hidden bg-white border border-gray-200 shadow-sm">
                                  <div className="p-2.5">
                                    <div className="flex items-center gap-2 mb-1.5">
                                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center">
                                        <span className="text-white text-sm">
                                          📅
                                        </span>
                                      </div>
                                      <div className="flex-1">
                                        <p className="font-semibold text-[12px] text-gray-900">
                                          Doctor Visit
                                        </p>
                                        <p className="text-[10px] text-gray-500">
                                          Today at 5:00 PM
                                        </p>
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-1 text-[10px] text-gray-600">
                                      <span>📍</span>
                                      <span>Medical Center</span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}

                            {message.type === 'meeting' && (
                              <div
                                className="flex justify-start"
                                style={{ paddingLeft: '4px', marginTop: '4px' }}
                              >
                                <div className="rounded-xl overflow-hidden bg-white border border-gray-200 shadow-sm">
                                  <div className="p-2.5">
                                    <div className="flex items-center gap-2 mb-1.5">
                                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-indigo-500 flex items-center justify-center">
                                        <span className="text-white text-sm">
                                          👥
                                        </span>
                                      </div>
                                      <div className="flex-1">
                                        <p className="font-semibold text-[12px] text-gray-900">
                                          Team Meeting
                                        </p>
                                        <p className="text-[10px] text-gray-500">
                                          Tomorrow at 2:00 PM
                                        </p>
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-1 text-[10px] text-gray-600">
                                      <span>👤</span>
                                      <span>5 people invited</span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </AnimatePresence>
                </div>

                {/* iMessage input bar */}
                <div className="px-2 pt-1 pb-5 bg-[#F2F2F7]">
                  <div className="flex items-center gap-1.5">
                    <button className="w-7 h-7 flex items-center justify-center">
                      <svg
                        width="24"
                        height="24"
                        viewBox="0 0 28 28"
                        fill="none"
                      >
                        <circle cx="14" cy="14" r="12" fill="#007AFF" />
                        <path
                          d="M14 8V20M8 14H20"
                          stroke="white"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                        />
                      </svg>
                    </button>
                    <div className="flex-1 h-[32px] bg-white rounded-full border border-gray-300 px-4 flex items-center">
                      <span className="text-[14px] text-gray-400">
                        iMessage
                      </span>
                    </div>
                    <button className="w-7 h-7 flex items-center justify-center">
                      <svg
                        width="16"
                        height="22"
                        viewBox="0 0 20 26"
                        fill="none"
                      >
                        <rect
                          x="5"
                          y="0"
                          width="10"
                          height="16"
                          rx="5"
                          fill="#007AFF"
                        />
                        <path
                          d="M1 12C1 17 5 21 10 21C15 21 19 17 19 12"
                          stroke="#007AFF"
                          strokeWidth="2"
                          strokeLinecap="round"
                        />
                        <path
                          d="M10 21V25M7 25H13"
                          stroke="#007AFF"
                          strokeWidth="2"
                          strokeLinecap="round"
                        />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Home indicator */}
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2">
                  <div className="w-[100px] h-[5px] bg-black rounded-full" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default function HeroSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const [titleNumber, setTitleNumber] = useState(0);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end start'],
  });

  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const unsubscribe = scrollYProgress.on('change', (v) => {
      setScrollProgress(v);
    });
    return () => unsubscribe();
  }, [scrollYProgress]);

  const titles = useMemo(
    () => [
      'groups',
      'communities',
      'connections',
      'teams',
      'syncs',
      'schedules',
      'meetings',
      'assistants',
    ],
    []
  );

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (titleNumber === titles.length - 1) {
        setTitleNumber(0);
      } else {
        setTitleNumber(titleNumber + 1);
      }
    }, 2000);
    return () => clearTimeout(timeoutId);
  }, [titleNumber, titles]);

  const contentOpacity = Math.max(0, 1 - scrollProgress * 2.5);

  return (
    <section
      ref={sectionRef}
      className="relative w-full min-h-screen overflow-visible pb-32"
    >
      <style dangerouslySetInnerHTML={{ __html: iMessageStyles }} />

      {/* Background */}
      <div
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage: `radial-gradient(circle at 25% 40%, rgba(59, 130, 246, 0.12) 0%, transparent 50%)`,
        }}
      />

      {/* Main content */}
      <div className="relative z-10 h-screen flex items-center overflow-visible">
        <div className="container mx-auto px-6 lg:px-12 overflow-visible">
          <div className="flex items-center justify-between gap-12 lg:gap-24 overflow-visible">
            <div className="flex-1 flex justify-center lg:justify-end lg:pr-12 overflow-visible">
              <IPhoneWithMessages scrollProgress={scrollProgress} />
            </div>

            <div
              className="flex-1 flex flex-col items-start gap-6 lg:gap-8"
              style={{
                opacity: contentOpacity,
                transition: 'opacity 0.15s ease-out',
              }}
            >
              <motion.h1
                className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl tracking-tight font-bold text-foreground leading-tight"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2, ease: 'easeOut' }}
              >
                <span className="block">Create better</span>
                <span className="relative flex w-full justify-start overflow-hidden pb-2 pt-1 md:pb-4 md:pt-1 h-[1.3em]">
                  {titles.map((title, index) => (
                    <motion.span
                      key={`title-${title}`}
                      className="absolute font-black bg-gradient-to-r from-primary via-primary/80 to-primary bg-clip-text text-transparent"
                      initial={{ opacity: 0, y: 50 }}
                      transition={{ duration: 0.4, ease: 'easeOut' }}
                      animate={
                        titleNumber === index
                          ? { y: 0, opacity: 1 }
                          : { y: titleNumber > index ? -80 : 80, opacity: 0 }
                      }
                    >
                      {title}
                    </motion.span>
                  ))}
                </span>
              </motion.h1>

              <motion.p
                className="text-base lg:text-lg text-muted-foreground max-w-md"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4, ease: 'easeOut' }}
              >
                Find your squad, join communities, and let your personal
                assistant handle scheduling and meetings for you.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6, ease: 'easeOut' }}
              >
                <Link href="/signup">
                  <Button
                    size="lg"
                    className="gap-3 px-6 py-5 lg:px-8 lg:py-6 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 text-sm lg:text-base font-semibold shadow-xl shadow-primary/25 hover:shadow-primary/35 hover:scale-[1.02] transition-all duration-200"
                  >
                    Get Started
                    <MoveRight className="w-4 h-4 lg:w-5 lg:h-5" />
                  </Button>
                </Link>
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom gradient - positioned behind phone */}
      <div
        className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none z-0"
        style={{
          background:
            'linear-gradient(to bottom, transparent 0%, var(--background) 100%)',
        }}
      />
    </section>
  );
}
