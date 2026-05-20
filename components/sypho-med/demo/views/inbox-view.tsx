/**
 * @file components/sypho-med/demo/views/inbox-view.tsx
 * @description WhatsApp-style unified inbox and Riley AI assistant panel.
 */

'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bot,
  MessageCircle,
  Send,
  Sparkles,
  Zap,
} from 'lucide-react';
import { MedButton } from '@/components/sypho-med/med-button';
import { useDemo } from '@/components/sypho-med/demo/demo-context';

/**
 * Split view: conversation threads + Riley AI suggestions.
 */
export function InboxView() {
  const {
    preset,
    selectedThreadId,
    localMessages,
    isRileyTyping,
    setSelectedThreadId,
    sendPatientInquiryWithRileyReply,
    applyRileySuggestion,
  } = useDemo();

  const [reply, setReply] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const threads = preset.inboxThreads;
  const activeThreadId = selectedThreadId ?? threads[0]?.id ?? null;
  const messages =
    activeThreadId !== null
      ? localMessages[activeThreadId] ?? preset.inboxMessages[activeThreadId] ?? []
      : [];

  const activeThread = threads.find((t) => t.id === activeThreadId);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length, isRileyTyping]);

  const handleSend = () => {
    if (!activeThreadId || !reply.trim() || isRileyTyping) return;
    sendPatientInquiryWithRileyReply(activeThreadId, reply);
    setReply('');
  };

  return (
    <motion.div
      key={preset.id}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="grid lg:grid-cols-5 gap-4 h-[calc(100dvh-12rem)] lg:h-[calc(100dvh-10rem)] min-h-[480px]"
    >
      {/* Thread list */}
      <div className="lg:col-span-2 med-glass-strong rounded-2xl border border-white/[0.06] flex flex-col overflow-hidden">
        <div className="p-4 border-b border-white/[0.06] flex items-center gap-2">
          <MessageCircle className="w-4 h-4 text-neon-400" aria-hidden="true" />
          <h3 className="text-sm font-medium text-white">Unified inbox</h3>
          <span className="ml-auto text-[10px] text-silver-500">WhatsApp</span>
        </div>
        <ul className="flex-1 overflow-y-auto">
          {threads.map((thread) => {
            const active = thread.id === activeThreadId;
            return (
              <li key={thread.id}>
                <button
                  type="button"
                  onClick={() => setSelectedThreadId(thread.id)}
                  className={[
                    'w-full text-left px-4 py-3 border-b border-white/[0.04] transition-colors',
                    active ? 'bg-neon-500/10' : 'hover:bg-white/[0.03]',
                  ].join(' ')}
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-medium text-white truncate">
                      {thread.patientName}
                    </p>
                    <span className="text-[10px] text-silver-500 shrink-0">
                      {thread.time}
                    </span>
                  </div>
                  <p className="text-xs text-silver-500 truncate mt-0.5">
                    {thread.preview}
                  </p>
                  {thread.unread && (
                    <span className="inline-block mt-1.5 w-2 h-2 rounded-full bg-neon-400" />
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Conversation */}
      <div className="lg:col-span-3 flex flex-col gap-4 min-h-0">
        <div className="flex-1 med-glass-strong rounded-2xl border border-white/[0.06] flex flex-col overflow-hidden min-h-[280px]">
          {activeThread && (
            <div className="px-4 py-3 border-b border-white/[0.06] flex items-center gap-2">
              <span className="w-8 h-8 rounded-full bg-[#25D366]/20 text-[#25D366] flex items-center justify-center text-xs font-bold">
                WA
              </span>
              <div>
                <p className="text-sm font-medium text-white">{activeThread.patientName}</p>
                <p className="text-[10px] text-silver-500">
                  WhatsApp · {preset.city} · Riley AI active
                </p>
              </div>
            </div>
          )}

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            <AnimatePresence initial={false}>
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={[
                    'flex',
                    msg.sender === 'patient' ? 'justify-start' : 'justify-end',
                  ].join(' ')}
                >
                  <motion.div
                    className={[
                      'max-w-[85%] rounded-2xl px-3 py-2 text-sm',
                      msg.sender === 'patient'
                        ? 'bg-obsidian-300/80 text-silver-200 rounded-tl-sm'
                        : msg.sender === 'riley'
                          ? 'bg-neon-500/15 text-neon-100 border border-neon-400/20 rounded-tr-sm'
                          : 'bg-white/10 text-white rounded-tr-sm',
                    ].join(' ')}
                  >
                    {msg.sender === 'riley' && (
                      <span className="flex items-center gap-1 text-[10px] text-neon-400 mb-1">
                        <Bot className="w-3 h-3" aria-hidden="true" />
                        Riley
                      </span>
                    )}
                    <p>{msg.body}</p>
                    <p className="text-[10px] text-silver-500 mt-1 text-right">{msg.time}</p>
                  </motion.div>
                </motion.div>
              ))}
            </AnimatePresence>

            {isRileyTyping && (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex justify-end"
                aria-live="polite"
                aria-label="Riley is typing"
              >
                <div className="max-w-[85%] rounded-2xl px-4 py-3 bg-neon-500/10 border border-neon-400/20 rounded-tr-sm">
                  <span className="flex items-center gap-2 text-[10px] text-neon-400 mb-1.5">
                    <Bot className="w-3 h-3" aria-hidden="true" />
                    Riley
                  </span>
                  <span className="flex items-center gap-1.5 text-xs text-silver-400">
                    <span className="inline-flex gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-neon-400/80 animate-bounce [animation-delay:0ms]" />
                      <span className="w-1.5 h-1.5 rounded-full bg-neon-400/80 animate-bounce [animation-delay:150ms]" />
                      <span className="w-1.5 h-1.5 rounded-full bg-neon-400/80 animate-bounce [animation-delay:300ms]" />
                    </span>
                    typing…
                  </span>
                </div>
              </motion.div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-3 border-t border-white/[0.06] flex gap-2">
            <input
              type="text"
              value={reply}
              onChange={(e) => setReply(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              disabled={isRileyTyping}
              placeholder={
                isRileyTyping
                  ? 'Riley is composing a reply…'
                  : 'Simulate a patient WhatsApp inquiry…'
              }
              className="flex-1 h-10 px-3 rounded-xl bg-obsidian-200/80 border border-white/[0.08] text-sm text-white placeholder:text-silver-600 focus:outline-none focus:ring-2 focus:ring-neon-500/40 disabled:opacity-50"
            />
            <MedButton
              variant="primary"
              size="sm"
              onClick={handleSend}
              disabled={isRileyTyping || !reply.trim()}
              aria-label="Send message"
            >
              <Send className="w-4 h-4" aria-hidden="true" />
            </MedButton>
          </div>
        </div>

        {/* Riley panel */}
        <div className="med-glass rounded-2xl p-4 border border-neon-400/15 bg-gradient-to-br from-neon-500/5 to-transparent">
          <div className="flex items-center gap-2 mb-3">
            <span className="w-8 h-8 rounded-xl bg-neon-500/20 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-neon-400" aria-hidden="true" />
            </span>
            <div>
              <h3 className="text-sm font-medium text-white">Riley</h3>
              <p className="text-[10px] text-silver-500">
                Autonomous concierge · {preset.currencySymbol} pricing
              </p>
            </div>
          </div>
          <ul className="space-y-2">
            {preset.rileySuggestions.map((suggestion, i) => (
              <li key={i}>
                <button
                  type="button"
                  onClick={() => applyRileySuggestion(i)}
                  disabled={isRileyTyping}
                  className="w-full flex items-start gap-2 p-2.5 rounded-xl text-left text-xs text-silver-300 hover:bg-neon-500/10 hover:text-white border border-transparent hover:border-neon-400/20 transition-all group disabled:opacity-40"
                >
                  <Zap
                    className="w-3.5 h-3.5 text-neon-400 shrink-0 mt-0.5 opacity-70 group-hover:opacity-100"
                    aria-hidden="true"
                  />
                  {suggestion}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </motion.div>
  );
}
