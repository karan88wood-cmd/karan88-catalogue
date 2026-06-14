'use client'

import { useEffect, useState } from 'react'
import { supabase, Product } from '@/lib/supabase'
import ProductCard from '@/components/ProductCard'

export default function CataloguePage({ mode }: { mode: 'domestic' | 'importer' }) {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('All')
  const materials = ['All', 'Mango Wood', 'Acacia', 'Sheesham']

  useEffect(() => {
    async function fetchProducts() {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .in('show_in', [mode, 'both'])
        .order('created_at', { ascending: false })
      if (!error && data) setProducts(data)
      setLoading(false)
    }
    fetchProducts()
  }, [mode])

  const filtered = filter === 'All' ? products : products.filter(p => p.material === filter)
  const isDomestic = mode === 'domestic'

  return (
    <div style={{ minHeight: '100vh', background: 'var(--warm-white)' }}>
      <header style={{ background: 'var(--charcoal)', color: 'white', padding: '3rem 2rem 2.5rem', textAlign: 'center' }}>
        <p className="font-ui" style={{
          fontSize: '0.75rem', letterSpacing: '0.15em', color: 'var(--teak-light)',
          textTransform: 'uppercase', marginBottom: '0.75rem',
        }}>Panchkuian Furniture Market, New Delhi</p>
        <h1 className="font-display" style={{ fontSize: 'clamp(2rem, 5vw, 3.2rem)', fontWeight: '400', margin: '0 0 0.5rem' }}>
          Karan88 Exports
        </h1>
        <p className="font-ui" style={{ color: '#bbb', fontSize: '1rem', margin: '0 0 0.75rem' }}>
          {isDomestic ? 'Premium Handcrafted Furniture' : 'Handcrafted Furniture for Global Buyers'}
        </p>
        <div style={{
          display: 'inline-block', padding: '0.3rem 1rem', borderRadius: '20px', fontSize: '0.78rem',
          background: isDomestic ? 'rgba(240,192,128,0.2)' : 'rgba(196,149,106,0.2)',
          color: isDomestic ? '#f0c080' : 'var(--teak-light)', fontFamily: 'system-ui, sans-serif', marginBottom: '1rem',
        }}>
          {isDomestic ? '🇮🇳 Prices in ₹ · Sizes in inches' : '🌍 Prices in USD · Sizes in cm'}
        </div>
        {!isDomestic && (
          <div style={{ display: 'flex', gap: '1.5rem', justifyContent: 'center', flexWrap: 'wrap', marginTop: '0.5rem' }}>
            {['USA', 'UK', 'Europe', 'UAE', 'Australia'].map(m => (
              <span key={m} className="font-ui" style={{ fontSize: '0.8rem', color: 'var(--teak-light)' }}>✓ {m}</span>
            ))}
          </div>
        )}
      </header>

      <main style={{ maxWidth: '1100px', margin: '0 auto', padding: '2rem 1.5rem' }}>
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
          {materials.map(mat => (
            <button key={mat} onClick={() => setFilter(mat)} className="font-ui" style={{
              padding: '0.45rem 1rem',
              border: filter === mat ? 'none' : '1px solid var(--border)',
              background: filter === mat ? 'var(--teak)' : 'white',
              color: filter === mat ? 'white' : 'var(--charcoal)',
              borderRadius: '20px', cursor: 'pointer', fontSize: '0.85rem',
            }}>{mat}</button>
          ))}
          <span className="font-ui" style={{ marginLeft: 'auto', color: 'var(--muted)', fontSize: '0.85rem', alignSelf: 'center' }}>
            {filtered.length} {filtered.length === 1 ? 'piece' : 'pieces'}
          </span>
        </div>

        {loading ? (
          <div className="font-ui" style={{ textAlign: 'center', padding: '4rem', color: 'var(--muted)' }}>Loading catalogue…</div>
        ) : filtered.length === 0 ? (
          <div className="font-ui" style={{ textAlign: 'center', padding: '4rem', color: 'var(--muted)' }}>No products yet.</div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
            {filtered.map(product => <ProductCard key={product.id} product={product} mode={mode} />)}
          </div>
        )}
      </main>

      <footer style={{ borderTop: '1px solid var(--border)', padding: '2rem', textAlign: 'center', marginTop: '3rem' }}>
        <p className="font-ui" style={{ color: 'var(--muted)', fontSize: '0.85rem', margin: '0 0 0.5rem' }}>For orders and enquiries</p>
        <p className="font-display" style={{ fontSize: '1.1rem', color: 'var(--teak)', margin: '0 0 0.25rem' }}>karan@karan88exports.in</p>
        <p className="font-ui" style={{ color: 'var(--charcoal)', fontSize: '0.9rem', margin: 0 }}>+91 8800493393</p>
      </footer>
    </div>
  )
}
