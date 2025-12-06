'use client';

import React, { useRef } from 'react';
import { useScroll, useTransform, motion } from 'framer-motion';

interface Message {
  text: string;
  isUser: boolean;
}

const messages: Message[] = [
  {
    text: '✨ Instant Group Creation',
    isUser: false,
  },
  {
    text: '⏱️ Temporary Groups that auto-expire',
    isUser: true,
  },
  {
    text: '🔄 Real-time Sync across devices',
    isUser: false,
  },
  {
    text: '🔗 One-tap invite links',
    isUser: true,
  },
  {
    text: '🌐 Build community connections',
    isUser: false,
  },
];

// Inject the CSS for iMessage bubbles with pseudo-element masking
const iMessageStyles = `
  .imessage-sent {
    position: relative;
    background: #007AFF;
    color: white;
    padding: 6px 12px;
    font-size: 17px;
    line-height: 22px;
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
    padding: 6px 12px;
    font-size: 17px;
    line-height: 22px;
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
`;

function IMessageBubble({
  message,
  index,
  scrollProgress,
  showTail,
}: {
  message: Message;
  index: number;
  scrollProgress: number;
  showTail: boolean;
}) {
  const appearAt = 0.25 + index * 0.1;
  const isVisible = scrollProgress >= appearAt;

  const bubbleClass = message.isUser
    ? `imessage-sent ${showTail ? 'has-tail' : ''}`
    : `imessage-received ${showTail ? 'has-tail' : ''}`;

  return (
    <motion.div
      className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
      style={{
        marginBottom: showTail ? '10px' : '2px',
        paddingRight: message.isUser && showTail ? '26px' : '0',
        paddingLeft: !message.isUser && showTail ? '26px' : '0',
      }}
      initial={{ opacity: 0, scale: 0.3, y: 40 }}
      animate={
        isVisible
          ? { opacity: 1, scale: 1, y: 0 }
          : { opacity: 0, scale: 0.3, y: 40 }
      }
      transition={{
        type: 'spring',
        stiffness: 500,
        damping: 35,
      }}
    >
      <div className="max-w-[80%]">
        <div className={bubbleClass}>{message.text}</div>
      </div>
    </motion.div>
  );
}

export function PhoneScrollAnimation() {
  const containerRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  });

  const [scrollProgress, setScrollProgress] = React.useState(0);

  React.useEffect(() => {
    const unsubscribe = scrollYProgress.on('change', (v) => {
      setScrollProgress(v);
    });
    return () => unsubscribe();
  }, [scrollYProgress]);

  const rotateX = useTransform(scrollYProgress, [0, 0.18], [15, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.18], [0.9, 1]);
  const translateY = useTransform(scrollYProgress, [0, 0.18], [60, 0]);
  const titleOpacity = useTransform(scrollYProgress, [0, 0.12], [1, 0]);

  return (
    <div ref={containerRef} className="relative h-[300vh] bg-background">
      {/* Inject iMessage CSS */}
      <style dangerouslySetInnerHTML={{ __html: iMessageStyles }} />

      {/* Title */}
      <motion.div
        className="h-[70vh] flex flex-col items-center justify-center gap-6 px-4"
        style={{ opacity: titleOpacity }}
      >
        <h2 className="text-4xl md:text-6xl lg:text-7xl font-bold text-center text-foreground">
          Get connected with <span className="text-primary">communities</span>{' '}
          instantly.
        </h2>
      </motion.div>

      {/* Sticky phone container */}
      <div className="sticky top-0 h-screen flex items-center justify-center pt-8 pb-4">
        <motion.div
          style={{
            rotateX,
            scale,
            y: translateY,
            transformPerspective: 1200,
          }}
          className="relative"
        >
          {/* Phone shadow */}
          <div
            className="absolute left-1/2 -translate-x-1/2 bottom-[-30px] w-[80%] h-[60px] rounded-full opacity-25"
            style={{
              background:
                'radial-gradient(ellipse at center, rgba(0,0,0,0.6) 0%, transparent 70%)',
              filter: 'blur(15px)',
            }}
          />

          {/* Phone frame */}
          <div
            className="relative w-[360px] md:w-[420px] lg:w-[440px] h-[720px] md:h-[840px] lg:h-[880px] rounded-[55px] md:rounded-[60px] p-[10px] md:p-[12px]"
            style={{
              background:
                'linear-gradient(145deg, #3a3a3a 0%, #1a1a1a 30%, #0a0a0a 100%)',
              boxShadow: `
                0 50px 100px -20px rgba(0, 0, 0, 0.5),
                0 30px 60px -15px rgba(0, 0, 0, 0.4),
                0 0 0 1px rgba(255,255,255,0.08),
                inset 0 1px 0 rgba(255,255,255,0.15)
              `,
            }}
          >
            {/* Side buttons */}
            <div
              className="absolute right-[-3px] top-[160px] w-[4px] h-[100px] rounded-r-sm"
              style={{
                background:
                  'linear-gradient(180deg, #4a4a4a 0%, #2a2a2a 50%, #1a1a1a 100%)',
              }}
            />
            <div
              className="absolute left-[-3px] top-[120px] w-[4px] h-[35px] rounded-l-sm"
              style={{
                background:
                  'linear-gradient(180deg, #4a4a4a 0%, #2a2a2a 50%, #1a1a1a 100%)',
              }}
            />
            <div
              className="absolute left-[-3px] top-[175px] w-[4px] h-[70px] rounded-l-sm"
              style={{
                background:
                  'linear-gradient(180deg, #4a4a4a 0%, #2a2a2a 50%, #1a1a1a 100%)',
              }}
            />
            <div
              className="absolute left-[-3px] top-[260px] w-[4px] h-[70px] rounded-l-sm"
              style={{
                background:
                  'linear-gradient(180deg, #4a4a4a 0%, #2a2a2a 50%, #1a1a1a 100%)',
              }}
            />

            {/* Screen */}
            <div className="relative w-full h-full bg-white rounded-[45px] md:rounded-[50px] overflow-hidden flex flex-col">
              {/* Dynamic Island */}
              <div className="absolute top-[12px] left-1/2 -translate-x-1/2 w-[100px] md:w-[110px] h-[28px] md:h-[30px] bg-black rounded-full z-20" />

              {/* iOS Status Bar */}
              <div className="pt-[14px] px-7 flex justify-between items-center">
                <span className="text-[16px] font-semibold text-black w-[54px]">
                  9:41
                </span>
                <div className="flex items-center gap-[5px]">
                  {/* Cellular */}
                  <svg width="18" height="12" viewBox="0 0 18 12" fill="none">
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
                  {/* WiFi */}
                  <svg width="16" height="12" viewBox="0 0 16 12" fill="none">
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
                  {/* Battery */}
                  <div className="flex items-center">
                    <div className="relative w-[25px] h-[11px] rounded-[3px] border-[1.5px] border-black">
                      <div className="absolute top-[2px] left-[2px] bottom-[2px] right-[5px] bg-black rounded-[1px]" />
                    </div>
                    <div className="w-[1.5px] h-[4px] bg-black rounded-r-[1px] ml-[1px]" />
                  </div>
                </div>
              </div>

              {/* Chat header */}
              <div className="px-4 py-3 flex items-center border-b border-gray-200">
                <button className="text-[#007AFF]">
                  <svg width="12" height="20" viewBox="0 0 12 20" fill="none">
                    <path
                      d="M10 2L2 10L10 18"
                      stroke="#007AFF"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
                <div className="flex-1 flex flex-col items-center">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg mb-1">
                    SS
                  </div>
                  <p className="font-semibold text-[16px] text-black">
                    Series Sync
                  </p>
                </div>
                <button className="text-[#007AFF]">
                  <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
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
              <div className="flex-1 px-3 py-3 overflow-hidden bg-white">
                {/* Date header */}
                <div className="text-center mb-3">
                  <span className="text-[11px] text-[#8E8E93]">
                    Today 9:41 AM
                  </span>
                </div>

                {messages.map((message, index) => {
                  const nextMessage = messages[index + 1];
                  const showTail =
                    !nextMessage || nextMessage.isUser !== message.isUser;

                  return (
                    <IMessageBubble
                      key={index}
                      message={message}
                      index={index}
                      scrollProgress={scrollProgress}
                      showTail={showTail}
                    />
                  );
                })}
              </div>

              {/* iMessage input bar */}
              <div className="px-2 pt-2 pb-7 bg-[#F2F2F7]">
                <div className="flex items-center gap-2">
                  <button className="w-8 h-8 flex items-center justify-center">
                    <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                      <circle cx="14" cy="14" r="13" fill="#007AFF" />
                      <path
                        d="M14 8V20M8 14H20"
                        stroke="white"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                      />
                    </svg>
                  </button>
                  <div className="flex-1 h-[36px] bg-white rounded-full border border-[#C7C7CC] px-4 flex items-center">
                    <span className="text-[17px] text-[#C7C7CC]">iMessage</span>
                  </div>
                  <button className="w-8 h-8 flex items-center justify-center">
                    <svg width="20" height="26" viewBox="0 0 20 26" fill="none">
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
                <div className="w-[134px] h-[5px] bg-black rounded-full" />
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Scroll space */}
      <div className="h-[100vh]" />
    </div>
  );
}
