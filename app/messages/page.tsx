'use client'
import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useSocialStore } from '@/store/useSocialStore'
import { Friend, Message } from '@/store/types'
import { cn } from '@/lib/utils'
import { format, isToday, isYesterday, parseISO } from 'date-fns'

function Avatar({ friend, size = 36 }: { friend: Pick<Friend, 'name' | 'avatarColor'>; size?: number }) {
  const initials = friend.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
  return (
    <div
      className="rounded-xl flex items-center justify-center text-white font-bold flex-shrink-0"
      style={{ width: size, height: size, background: friend.avatarColor, fontSize: size * 0.35 }}
    >
      {initials}
    </div>
  )
}

function timestampLabel(ts: string): string {
  const d = parseISO(ts)
  if (isToday(d))     return format(d, 'h:mm a')
  if (isYesterday(d)) return 'Yesterday'
  return format(d, 'MMM d')
}

function MessageBubble({
  msg,
  isMe,
  onReact,
}: {
  msg: Message
  isMe: boolean
  onReact: (r: Message['reaction']) => void
}) {
  const [showReactions, setShowReactions] = useState(false)
  const isInvite = msg.type === 'study_invite'

  return (
    <motion.div
      initial={{ opacity: 0, y: 8, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
      className={cn('flex items-end gap-2 group', isMe ? 'justify-end' : 'justify-start')}
    >
      <div
        className={cn('max-w-xs px-4 py-2.5 rounded-2xl relative text-sm cursor-default', isMe ? 'rounded-br-sm' : 'rounded-bl-sm')}
        style={isMe
          ? { background: 'var(--primary)', color: 'white' }
          : isInvite
            ? { background: 'rgba(13,217,184,0.12)', border: '1.5px solid rgba(13,217,184,0.3)', color: 'var(--text)' }
            : { background: 'var(--surface-2)', color: 'var(--text)' }}
        onMouseEnter={() => setShowReactions(true)}
        onMouseLeave={() => setShowReactions(false)}
      >
        {isInvite && <p className="text-xs font-bold mb-1" style={{ color: '#0DD9B8' }}>📚 Study Invite</p>}
        <p className="leading-relaxed">{msg.content}</p>
        <p className={cn('text-2xs mt-1', isMe ? 'text-white/60' : 'text-faint')}>{timestampLabel(msg.timestamp)}</p>

        {msg.reaction && (
          <span className="absolute -bottom-3 right-2 text-sm bg-surface rounded-full px-1 shadow-sm">
            {msg.reaction}
          </span>
        )}

        {/* Reaction picker */}
        <AnimatePresence>
          {showReactions && !isMe && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 4 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.15 }}
              className="absolute -top-8 left-0 flex gap-1 px-2 py-1 rounded-xl shadow-soft z-10"
              style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
            >
              {(['👍', '❤️', '🔥'] as const).map((r) => (
                <button
                  key={r}
                  onClick={() => { onReact(r); setShowReactions(false) }}
                  className="text-base hover:scale-125 transition-transform"
                >
                  {r}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}

function ChatPanel({ friend }: { friend: Friend }) {
  const { conversations, sendMessage, addReaction, markRead } = useSocialStore()
  const [input, setInput] = useState('')
  const [showInvite, setShowInvite] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  const messages = conversations[friend.id] ?? []

  useEffect(() => {
    markRead(friend.id)
  }, [friend.id])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages.length])

  const handleSend = (e: React.FormEvent, type: Message['type'] = 'text') => {
    e.preventDefault()
    if (!input.trim()) return
    sendMessage(friend.id, input.trim(), type)
    setInput('')
    setShowInvite(false)
  }

  const sendStudyInvite = () => {
    const text = input.trim() || `Hey! Want to study together?`
    sendMessage(friend.id, text, 'study_invite')
    setInput('')
    setShowInvite(false)
  }

  return (
    <div className="flex flex-col h-full">
      {/* Chat header */}
      <div className="flex items-center gap-3 px-5 py-4" style={{ borderBottom: '1px solid var(--border)' }}>
        <Avatar friend={friend} size={38} />
        <div>
          <p className="text-sm font-bold text-main">{friend.name}</p>
          <p className="text-xs text-faint">@{friend.username} · {friend.schoolName}</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
        {messages.length === 0 && (
          <div className="text-center py-12">
            <div className="text-3xl mb-2">👋</div>
            <p className="text-sm font-semibold text-main">Say hi to {friend.name.split(' ')[0]}!</p>
            <p className="text-xs text-faint mt-1">Keep it productive 📚</p>
          </div>
        )}
        {messages.map((msg) => (
          <MessageBubble
            key={msg.id}
            msg={msg}
            isMe={msg.fromId === 'me'}
            onReact={(r) => addReaction(friend.id, msg.id, r)}
          />
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Study invite banner */}
      <AnimatePresence>
        {showInvite && (
          <motion.div
            initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden px-5 py-2"
            style={{ borderTop: '1px solid var(--border)' }}
          >
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold" style={{ color: '#0DD9B8' }}>📚 Study Invite</span>
              <input
                className="input text-xs flex-1 py-1.5"
                placeholder="Message (optional)"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                autoFocus
              />
              <button onClick={sendStudyInvite} className="btn-mint text-xs py-1.5 px-3">Send</button>
              <button onClick={() => setShowInvite(false)} className="text-faint text-xs">Cancel</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input bar */}
      <form
        onSubmit={handleSend}
        className="flex items-center gap-2 px-4 py-3"
        style={{ borderTop: '1px solid var(--border)' }}
      >
        <button
          type="button"
          onClick={() => setShowInvite(!showInvite)}
          title="Send study invite"
          className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors text-faint"
          style={{ background: 'var(--surface-2)' }}
          onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(13,217,184,0.12)'; e.currentTarget.style.color = '#0DD9B8' }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--surface-2)'; e.currentTarget.style.color = '' }}
        >
          📚
        </button>
        <input
          className="input flex-1 text-sm py-2"
          placeholder={`Message ${friend.name.split(' ')[0]}…`}
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <motion.button
          whileTap={{ scale: 0.92 }}
          type="submit"
          disabled={!input.trim()}
          className="w-9 h-9 rounded-xl flex items-center justify-center text-white flex-shrink-0 disabled:opacity-40"
          style={{ background: 'var(--primary)' }}
        >
          <svg viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4">
            <path d="M15 8L1 1l3 7-3 7 14-7z" />
          </svg>
        </motion.button>
      </form>
    </div>
  )
}

export default function MessagesPage() {
  const { friends, conversations, unreadCount } = useSocialStore()
  const confirmed = friends.filter(f => f.status === 'friend')
  const [selected, setSelected] = useState<Friend | null>(confirmed[0] ?? null)

  const getLastMessage = (friendId: string): Message | undefined => {
    const msgs = conversations[friendId] ?? []
    return msgs[msgs.length - 1]
  }

  const getUnreadCount = (friendId: string) =>
    (conversations[friendId] ?? []).filter(m => !m.read && m.fromId !== 'me').length

  return (
    <div className="animate-fade-in" style={{ height: 'calc(100vh - 64px)' }}>
      <div className="flex h-full gap-0 card overflow-hidden">
        {/* Conversation list */}
        <div className="w-72 flex-shrink-0 flex flex-col" style={{ borderRight: '1px solid var(--border)' }}>
          <div className="px-4 py-4" style={{ borderBottom: '1px solid var(--border)' }}>
            <h1 className="page-title text-lg">Messages</h1>
          </div>

          <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
            {confirmed.length === 0 && (
              <div className="text-center py-12 px-4">
                <p className="text-2xl mb-2">💬</p>
                <p className="text-sm font-semibold text-main">No conversations</p>
                <p className="text-xs text-faint mt-1">Add friends to start messaging</p>
                <a href="/friends" className="text-xs font-bold mt-2 block" style={{ color: 'var(--primary)' }}>
                  Go to Friends →
                </a>
              </div>
            )}
            {confirmed.map(f => {
              const last    = getLastMessage(f.id)
              const unread  = getUnreadCount(f.id)
              const isActive = selected?.id === f.id
              return (
                <button
                  key={f.id}
                  onClick={() => setSelected(f)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all"
                  style={isActive ? { background: 'rgba(124,59,255,0.08)' } : {}}
                  onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.background = 'var(--surface-2)' }}
                  onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.background = '' }}
                >
                  <div className="relative">
                    <Avatar friend={f} size={38} />
                    {unread > 0 && (
                      <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full text-2xs font-black text-white flex items-center justify-center" style={{ background: 'var(--primary)' }}>
                        {unread}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className={cn('text-sm font-bold truncate', isActive ? 'text-primary' : 'text-main')}>
                        {f.name}
                      </p>
                      {last && <p className="text-2xs text-faint flex-shrink-0 ml-1">{timestampLabel(last.timestamp)}</p>}
                    </div>
                    {last && (
                      <p className={cn('text-xs truncate', unread > 0 ? 'font-semibold text-main' : 'text-faint')}>
                        {last.fromId === 'me' ? 'You: ' : ''}{last.content}
                      </p>
                    )}
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* Chat window */}
        <div className="flex-1 flex flex-col">
          {selected ? (
            <ChatPanel key={selected.id} friend={selected} />
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <p className="text-4xl mb-3">💬</p>
                <p className="text-base font-semibold text-main">Select a conversation</p>
                <p className="text-sm text-faint mt-1">Keep it focused and productive</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
