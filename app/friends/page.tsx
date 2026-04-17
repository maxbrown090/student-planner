'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useSocialStore } from '@/store/useSocialStore'
import { Friend } from '@/store/types'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'

const container = { hidden: {}, show: { transition: { staggerChildren: 0.05 } } }
const item = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] } } }

function Avatar({ friend, size = 40 }: { friend: Pick<Friend, 'name' | 'avatarColor'>; size?: number }) {
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

function FriendCard({ friend, onRemove }: { friend: Friend; onRemove: () => void }) {
  const [showConfirm, setShowConfirm] = useState(false)
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="card p-4 flex items-center gap-3 group"
      whileHover={{ y: -1 }}
    >
      <Avatar friend={friend} />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-main">{friend.name}</p>
        <p className="text-xs text-faint">@{friend.username} · {friend.schoolName}</p>
        {friend.gradeYear && (
          <p className="text-xs text-faint">{friend.gradeYear}</p>
        )}
      </div>
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        {!showConfirm ? (
          <button
            onClick={() => setShowConfirm(true)}
            className="text-xs px-2 py-1 rounded-lg font-semibold transition-all"
            style={{ color: 'var(--text-3)' }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,71,87,0.08)'; e.currentTarget.style.color = '#FF4757' }}
            onMouseLeave={(e) => { e.currentTarget.style.background = ''; e.currentTarget.style.color = 'var(--text-3)' }}
          >
            Remove
          </button>
        ) : (
          <div className="flex items-center gap-1">
            <span className="text-xs text-faint">Sure?</span>
            <button onClick={onRemove} className="text-xs px-2 py-1 rounded-lg font-bold" style={{ background: 'rgba(255,71,87,0.1)', color: '#FF4757' }}>
              Yes
            </button>
            <button onClick={() => setShowConfirm(false)} className="text-xs px-2 py-1 rounded-lg font-bold" style={{ background: 'var(--surface-2)', color: 'var(--text-2)' }}>
              No
            </button>
          </div>
        )}
      </div>
    </motion.div>
  )
}

function RequestCard({ friend, onAccept, onDecline }: { friend: Friend; onAccept: () => void; onDecline: () => void }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
      className="card p-4 flex items-center gap-3"
      style={{ borderLeft: '3px solid var(--primary)' }}
    >
      <Avatar friend={friend} />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-main">{friend.name}</p>
        <p className="text-xs text-faint">@{friend.username}{friend.schoolName && ` · ${friend.schoolName}`}</p>
        <p className="text-xs mt-0.5" style={{ color: 'var(--primary)' }}>Wants to connect</p>
      </div>
      <div className="flex items-center gap-2">
        <motion.button whileTap={{ scale: 0.95 }} onClick={onAccept} className="btn-primary text-xs px-3 py-1.5">
          Accept
        </motion.button>
        <motion.button whileTap={{ scale: 0.95 }} onClick={onDecline} className="btn-secondary text-xs px-3 py-1.5">
          Decline
        </motion.button>
      </div>
    </motion.div>
  )
}

function PendingCard({ friend, onCancel }: { friend: Friend; onCancel: () => void }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
      className="card p-4 flex items-center gap-3 opacity-75"
    >
      <Avatar friend={friend} />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-main">{friend.name || friend.username}</p>
        <p className="text-xs text-faint">@{friend.username}</p>
        <p className="text-xs text-faint mt-0.5">Request sent</p>
      </div>
      <button onClick={onCancel} className="text-xs text-faint hover:text-coral-500 font-semibold transition-colors">
        Cancel
      </button>
    </motion.div>
  )
}

export default function FriendsPage() {
  const { friends, sendFriendRequest, acceptFriend, declineFriend, removeFriend } = useSocialStore()
  const [searchInput, setSearchInput] = useState('')
  const [searchResult, setSearchResult] = useState<{ ok: boolean; message: string } | null>(null)

  const confirmed  = friends.filter(f => f.status === 'friend')
  const received   = friends.filter(f => f.status === 'pending_received')
  const sent       = friends.filter(f => f.status === 'pending_sent')

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (!searchInput.trim()) return
    const result = sendFriendRequest(searchInput.trim())
    setSearchResult(result)
    if (result.ok) setSearchInput('')
    setTimeout(() => setSearchResult(null), 3000)
  }

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6 max-w-2xl">
      {/* Header */}
      <motion.div variants={item} className="flex items-start justify-between">
        <div>
          <h1 className="page-title">Friends</h1>
          <p className="text-sm text-faint mt-0.5">{confirmed.length} friends · {received.length} pending</p>
        </div>
      </motion.div>

      {/* Add friend */}
      <motion.div variants={item} className="card p-5">
        <p className="text-sm font-bold text-main mb-3">Add a Friend</p>
        <form onSubmit={handleSearch} className="flex gap-2">
          <input
            className="input flex-1 text-sm"
            placeholder="Search by username (e.g. alex_s)"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
          <motion.button whileTap={{ scale: 0.97 }} type="submit" className="btn-primary text-sm">
            Send Request
          </motion.button>
        </form>
        <AnimatePresence>
          {searchResult && (
            <motion.p
              initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="text-xs font-semibold mt-2"
              style={{ color: searchResult.ok ? '#0DD9B8' : '#FF4757' }}
            >
              {searchResult.ok ? '✓ ' : '✗ '}{searchResult.message}
            </motion.p>
          )}
        </AnimatePresence>
        <p className="text-xs text-faint mt-2">
          Share your username with friends so they can find you. Set yours in{' '}
          <a href="/settings" className="font-bold" style={{ color: 'var(--primary)' }}>Settings → Profile</a>.
        </p>
      </motion.div>

      {/* Pending requests (received) */}
      {received.length > 0 && (
        <motion.div variants={item} className="space-y-2">
          <p className="section-title">Friend Requests ({received.length})</p>
          <AnimatePresence>
            {received.map(f => (
              <RequestCard key={f.id} friend={f}
                onAccept={() => acceptFriend(f.id)}
                onDecline={() => declineFriend(f.id)}
              />
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Friends list */}
      <motion.div variants={item} className="space-y-2">
        <p className="section-title">My Friends ({confirmed.length})</p>
        {confirmed.length === 0 ? (
          <div className="card p-8 text-center">
            <p className="text-3xl mb-2">👥</p>
            <p className="text-sm font-semibold text-main">No friends added yet</p>
            <p className="text-xs text-faint mt-1">Search for a friend by username above</p>
          </div>
        ) : (
          <AnimatePresence>
            {confirmed.map(f => (
              <FriendCard key={f.id} friend={f} onRemove={() => removeFriend(f.id)} />
            ))}
          </AnimatePresence>
        )}
      </motion.div>

      {/* Sent requests */}
      {sent.length > 0 && (
        <motion.div variants={item} className="space-y-2">
          <p className="section-title">Sent Requests ({sent.length})</p>
          <AnimatePresence>
            {sent.map(f => (
              <PendingCard key={f.id} friend={f} onCancel={() => declineFriend(f.id)} />
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Privacy note */}
      <motion.div
        variants={item}
        className="rounded-2xl p-4 text-xs"
        style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text-2)' }}
      >
        <p className="font-bold mb-1">🔒 Privacy</p>
        <p>Only friends can see your schedule (if you've enabled it). You can control sharing in <a href="/settings" className="font-bold" style={{ color: 'var(--primary)' }}>Settings → Privacy</a>.</p>
      </motion.div>
    </motion.div>
  )
}
