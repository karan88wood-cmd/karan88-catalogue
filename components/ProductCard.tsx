'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
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
  const router = useRouter()

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

  const waMessage = encodeURIComponent(`Hi, I'm interested in *${product.name}*${product.sku ? ` (SKU: ${product.sku})` : ''} from your catalogue. Please share more details.`)
  const waUrl = `https://wa.me/918800493393?text=${waMessage}`

  function handleCardClick() {
    if (mode !== 'admin') router.push(`/product/${product.id}`)
  }

  return (
    <div style={{
      background: 'white', border: '1px solid var(--border)', borderRadius: '8px',
      overflow: 'hidden', display: 'flex', flexDirection: 'column', transition: 'box-shadow 0.2s',
      cursor: mode !== 'admin' ? 'pointer' : 'default',
    }}
      onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.08)')}
      onMouseLeave={e => (e.currentTarget.style.boxShadow = 'none')}
    >
      {/* Main photo */}
      <div onClick={handleCardClick} style={{ height: '220px', background: 'var(--sand)', overflow: 'hidden', position: 'relative' }}>
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

      <div onClick={handleCardClick} style={{ padding: '1.1rem 1.25rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <h3 className="font-display" style={{ margin: '0 0 0.1rem', fontSize: '1.1rem', fontWeight: '400' }}>{product.name}</h3>
        {product.sku && (
          <p className="font-ui" style={{ margin: '0 0 0.3rem', fontSize: '0.72rem', color: 'var(--muted)' }}>SKU: {product.sku}</p>
        )}
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
          {mode === 'admin' ? (
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
          ) : (
            <a href={waUrl} target="_blank" rel="noopener noreferrer"
              onClick={e => e.stopPropagation()}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.4rem',
                background: '#25D366', color: 'white', padding: '0.4rem 0.8rem',
                borderRadius: '6px', textDecoration: 'none', fontFamily: 'system-ui, sans-serif',
                fontSize: '0.8rem', fontWeight: '600',
              }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="white">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              WhatsApp
            </a>
          )}
        </div>
      </div>
    </div>
  )
}
