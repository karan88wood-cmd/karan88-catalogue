'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase, Product, inrToUsd, cmToInches, getAllImages } from '@/lib/supabase'
import Link from 'next/link'

export default function ProductPage() {
  const { id } = useParams()
  const router = useRouter()
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeImg, setActiveImg] = useState(0)
  const [mode, setMode] = useState<'domestic' | 'importer'>('importer')

  useEffect(() => {
    async function fetchProduct() {
      const { data } = await supabase.from('products').select('*').eq('id', id).single()
      if (data) setProduct(data)
      setLoading(false)
    }
    fetchProduct()
    const ref = document.referrer
    if (ref.includes('/domestic')) setMode('domestic')
    else if (ref.includes('/importer')) setMode('importer')
  }, [id])

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--warm-white)' }}>
      <p className="font-ui" style={{ color: 'var(--muted)' }}>Loading…</p>
    </div>
  )

  if (!product) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--warm-white)' }}>
      <p className="font-ui" style={{ color: 'var(--muted)' }}>Product not found.</p>
    </div>
  )

  const images = getAllImages(product)
  const price = mode === 'domestic'
    ? `₹${product.price_inr.toLocaleString()}`
    : `$${inrToUsd(product.price_inr).toLocaleString()}`
  const dimensions = mode === 'domestic'
    ? (product.dimensions_cm ? cmToInches(product.dimensions_cm) + ' in' : '')
    : product.dimensions_cm ? product.dimensions_cm + ' cm' : ''

  const waMessage = encodeURIComponent(`Hi, I'm interested in *${product.name}*${product.sku ? ` (SKU: ${product.sku})` : ''} from your catalogue. Please share more details.`)
  const waUrl = `https://wa.me/918800493393?text=${waMessage}`

  return (
    <div style={{ minHeight: '100vh', background: 'var(--warm-white)' }}>
      {/* Header */}
      <header style={{ background: 'var(--charcoal)', color: 'white', padding: '0 2rem', height: '56px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <button onClick={() => router.back()} className="font-ui" style={{
          background: 'none', border: 'none', color: 'var(--teak-light)', cursor: 'pointer', fontSize: '0.9rem',
        }}>← Back</button>
        <span className="font-display" style={{ fontSize: '1.1rem', color: 'var(--teak-light)' }}>Karan88 Exports</span>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button onClick={() => setMode('domestic')} className="font-ui" style={{
            padding: '0.3rem 0.7rem', borderRadius: '20px', fontSize: '0.75rem', cursor: 'pointer', border: 'none',
            background: mode === 'domestic' ? '#f0c080' : 'rgba(255,255,255,0.15)', color: mode === 'domestic' ? '#2C2420' : 'white',
          }}>🇮🇳 ₹</button>
          <button onClick={() => setMode('importer')} className="font-ui" style={{
            padding: '0.3rem 0.7rem', borderRadius: '20px', fontSize: '0.75rem', cursor: 'pointer', border: 'none',
            background: mode === 'importer' ? 'var(--teak-light)' : 'rgba(255,255,255,0.15)', color: mode === 'importer' ? 'white' : 'white',
          }}>🌍 $</button>
        </div>
      </header>

      <main style={{ maxWidth: '900px', margin: '0 auto', padding: '2rem 1.5rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
          {/* Photos */}
          <div>
            <div style={{ borderRadius: '10px', overflow: 'hidden', background: 'var(--sand)', aspectRatio: '4/3' }}>
              {images.length > 0
                ? <img src={images[activeImg]} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '4rem' }}>🪑</div>
              }
            </div>
            {images.length > 1 && (
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem', flexWrap: 'wrap' }}>
                {images.map((url, i) => (
                  <div key={i} onClick={() => setActiveImg(i)} style={{
                    width: '64px', height: '64px', borderRadius: '6px', overflow: 'hidden', cursor: 'pointer',
                    border: activeImg === i ? '2px solid var(--teak)' : '2px solid transparent',
                    opacity: activeImg === i ? 1 : 0.6, transition: 'all 0.15s',
                  }}>
                    <img src={url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Details */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <p className="font-ui" style={{ margin: '0 0 0.3rem', fontSize: '0.75rem', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                {product.material}{product.category ? ` · ${product.category}` : ''}
              </p>
              <h1 className="font-display" style={{ margin: '0 0 0.5rem', fontSize: 'clamp(1.4rem, 3vw, 1.9rem)', fontWeight: '400' }}>
                {product.name}
              </h1>
              {product.sku && (
                <p className="font-ui" style={{ margin: 0, fontSize: '0.8rem', color: 'var(--muted)' }}>SKU: {product.sku}</p>
              )}
            </div>

            <div style={{ padding: '1rem', background: 'var(--sand)', borderRadius: '8px' }}>
              <p className="font-ui" style={{ margin: '0 0 0.25rem', fontSize: '1.6rem', fontWeight: '700', color: 'var(--teak-dark)' }}>
                {price}
              </p>
              {dimensions && (
                <p className="font-ui" style={{ margin: 0, fontSize: '0.85rem', color: 'var(--muted)' }}>
                  📐 {dimensions}
                </p>
              )}
            </div>

            {product.description && (
              <p className="font-ui" style={{ margin: 0, fontSize: '0.95rem', color: '#555', lineHeight: '1.7' }}>
                {product.description}
              </p>
            )}

            {/* WhatsApp button */}
            <a href={waUrl} target="_blank" rel="noopener noreferrer" style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.6rem',
              background: '#25D366', color: 'white', padding: '0.9rem 1.5rem',
              borderRadius: '8px', textDecoration: 'none', fontFamily: 'system-ui, sans-serif',
              fontSize: '1rem', fontWeight: '600', marginTop: '0.5rem',
            }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="white">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              Enquire on WhatsApp
            </a>

            <p className="font-ui" style={{ margin: 0, fontSize: '0.8rem', color: 'var(--muted)', textAlign: 'center' }}>
              karan@karan88exports.in · +91 8800493393
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
