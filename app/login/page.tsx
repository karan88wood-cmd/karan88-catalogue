'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const router = useRouter()

  function handleLogin() {
    if (password === 'karan88admin') {
      document.cookie = 'admin_auth=karan88admin; path=/; max-age=86400'
      router.push('/')
    } else {
      setError('Wrong password. Try again.')
    }
  }

  return (
    <div style={{
      minHeight: '100vh', background: 'var(--warm-white)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <div style={{
        background: 'white', border: '1px solid var(--border)', borderRadius: '12px',
        padding: '2.5rem', width: '100%', maxWidth: '360px', textAlign: 'center',
      }}>
        <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>🪵</div>
        <h1 className="font-display" style={{ margin: '0 0 0.25rem', fontSize: '1.4rem', fontWeight: '400' }}>
          Karan88 Exports
        </h1>
        <p className="font-ui" style={{ margin: '0 0 1.5rem', fontSize: '0.85rem', color: 'var(--muted)' }}>
          Admin Login
        </p>

        <input
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleLogin()}
          placeholder="Enter password"
          style={{
            width: '100%', padding: '0.7rem 1rem', border: '1px solid var(--border)',
            borderRadius: '6px', fontSize: '1rem', fontFamily: 'system-ui, sans-serif',
            outline: 'none', marginBottom: '0.75rem', boxSizing: 'border-box',
          }}
        />

        {error && (
          <p className="font-ui" style={{ color: '#c0392b', fontSize: '0.85rem', margin: '0 0 0.75rem' }}>
            {error}
          </p>
        )}

        <button onClick={handleLogin} className="font-ui" style={{
          width: '100%', background: 'var(--teak)', color: 'white', border: 'none',
          padding: '0.7rem', borderRadius: '6px', cursor: 'pointer', fontSize: '1rem', fontWeight: '600',
        }}>
          Login
        </button>
      </div>
    </div>
  )
}
