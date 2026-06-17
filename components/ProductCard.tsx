'use client'

import { useState } from 'react'
import { Product, inrToUsd, cmToInches, getAllImages } from '@/lib/supabase'

interface Props {
  product: Product
  mode: 'admin' | 'domestic' | 'importer'
  onEdit?: () => void
  onDelete?: () => void
}

const SHOW_IN_LABELS: Record<string, string> = {
  both: '🌐 Both',
  domestic: '🇮🇳 Domestic',
  importer: '🌍 Importer',
}

export default function ProductCard({ product, mode, onEdit, onDelete }: Props) {
  const images = getAllImages(product)
  const [activeImg, setActiveImg] = useState(0)

  const price = mode === 'importer'
    ? `$${inrToUsd(product.price_inr).toLocaleString()}`
    : mode === 'domestic'
    ? `₹${product.price_inr.toLocaleString()}`
    : `₹${product.price_inr.toLocaleString()} / $${inrToUsd(product.price_inr).toLocaleString()}`

  const dimensions = mode === 'domestic'
    ? (product.dimensions_cm ? cmToInches(product.dimensions_cm) + ' in' : '')
    : product.dimensions_cm
    ? product.dimensions_cm + ' cm'
    : ''

  return (
    <div style={{
      background: 'white', border: '1px solid var(--border)', borderRadius: '8px',
      overflow: 'hidden', display: 'flex', flexDirection: 'column', transition: 'box-shadow 0.2s',
    }}
      onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.08)')}
      onMouseLeave={e => (e.currentTarget.style.boxShadow = 'none')}
    >
      {/* Main photo */}
      <div style={{ height: '220px', background: 'var(--sand)', overflow: 'hidden', position: 'relative' }}>
        {images.length > 0
          ? <img src={images[activeImg]} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem' }}>🪑</div>
        }
        <div style={{
          position: 'absolute', top: '0.75rem', left: '0.75rem',
          background: 'rgba(44,36,32,0.75)', color: 'var(--teak-light)',
          padding: '0.25rem 0.6rem', borderRadius: '3px', fontSize: '0.7rem',
          fontFamily: 'system-ui, sans-serif', letterSpacing: '0.05em', textTransform: 'uppercase',
        }}>{product.material}</div>
        {mode === 'admin' && (
          <div style={{
            position: 'absolute', top: '0.75rem', right: '0.75rem',
            background: 'rgba(44,36,32,0.75)', color: '#fff',
            padding: '0.25rem 0.6rem', borderRadius: '3px', fontSize: '0.7rem',
            fontFamily: 'system-ui, sans-serif',
          }}>{SHOW_IN_LABELS[product.show_in || 'both']}</div>
        )}
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div style={{
          display: 'flex', gap: '0.4rem', padding: '0.5rem 0.75rem',
          background: 'var(--sand)', overflowX: 'auto',
        }}>
          {images.map((url, i) => (
            <div key={i} onClick={() => setActiveImg(i)} style={{
              width: '48px', height: '48px', flexShrink: 0, borderRadius: '4px', overflow: 'hidden',
              cursor: 'pointer', border: activeImg === i ? '2px solid var(--teak)' : '2px solid transparent',
              opacity: activeImg === i ? 1 : 0.65, transition: 'all 0.15s',
            }}>
              <img src={url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
          ))}
        </div>
      )}

      <div style={{ padding: '1.1rem 1.25rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <h3 className="font-display" style={{ margin: '0 0 0.3rem', fontSize: '1.1rem', fontWeight: '400' }}>{product.name}</h3>
        {product.category && (
          <p className="font-ui" style={{ margin: '0 0 0.5rem', fontSize: '0.75rem', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            {product.category}
          </p>
        )}
        {product.description && (
          <p className="font-ui" style={{
            margin: '0 0 0.75rem', fontSize: '0.85rem', color: '#666', lineHeight: '1.5', flex: 1,
            display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden',
          }}>{product.description}</p>
        )}

        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end',
          marginTop: 'auto', paddingTop: '0.75rem', borderTop: '1px solid var(--border)',
        }}>
          <div>
            {product.price_inr > 0 && (
              <p className="font-ui" style={{ margin: 0, fontSize: '1.1rem', fontWeight: '600', color: 'var(--teak-dark)' }}>{price}</p>
            )}
            {dimensions && (
              <p className="font-ui" style={{ margin: '0.1rem 0 0', fontSize: '0.75rem', color: 'var(--muted)' }}>{dimensions}</p>
            )}
          </div>
          {mode === 'admin' && (
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button onClick={onEdit} style={{
                background: 'var(--sand)', border: '1px solid var(--border)', borderRadius: '4px',
                padding: '0.35rem 0.7rem', cursor: 'pointer', fontSize: '0.8rem', fontFamily: 'system-ui, sans-serif',
              }}>Edit</button>
              <button onClick={onDelete} style={{
                background: 'white', border: '1px solid #f0b0b0', borderRadius: '4px',
                padding: '0.35rem 0.7rem', cursor: 'pointer', fontSize: '0.8rem', fontFamily: 'system-ui, sans-serif', color: '#c0392b',
              }}>Delete</button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
