'use client'

import { useEffect, useState } from 'react'
import { supabase, Product } from '@/lib/supabase'
import ProductForm from '@/components/ProductForm'
import ProductCard from '@/components/ProductCard'
import Link from 'next/link'

export default function AdminPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editProduct, setEditProduct] = useState<Product | null>(null)

  useEffect(() => { fetchProducts() }, [])

  async function fetchProducts() {
    setLoading(true)
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false })
    if (!error && data) setProducts(data)
    setLoading(false)
  }

  async function deleteProduct(id: string, imageUrl: string | null) {
    if (!confirm('Delete this product?')) return
    if (imageUrl) {
      const path = imageUrl.split('/storage/v1/object/public/product-images/')[1]
      if (path) await supabase.storage.from('product-images').remove([path])
    }
    await supabase.from('products').delete().eq('id', id)
    fetchProducts()
  }

  function handleFormClose() {
    setShowForm(false)
    setEditProduct(null)
    fetchProducts()
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--warm-white)' }}>
      <header style={{
        background: 'var(--charcoal)', color: 'white', padding: '0 2rem',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '64px',
      }}>
        <div>
          <span className="font-display" style={{ fontSize: '1.2rem', color: 'var(--teak-light)' }}>Karan88 Exports</span>
          <span className="font-ui" style={{ fontSize: '0.8rem', color: '#aaa', marginLeft: '0.75rem' }}>Admin</span>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <Link href="/catalogue/domestic" target="_blank" className="font-ui" style={{
            color: '#f0c080', fontSize: '0.8rem', textDecoration: 'none',
            border: '1px solid #f0c080', padding: '0.4rem 0.9rem', borderRadius: '4px',
          }}>🇮🇳 Domestic ↗</Link>
          <Link href="/catalogue/importer" target="_blank" className="font-ui" style={{
            color: 'var(--teak-light)', fontSize: '0.8rem', textDecoration: 'none',
            border: '1px solid var(--teak-light)', padding: '0.4rem 0.9rem', borderRadius: '4px',
          }}>🌍 Importer ↗</Link>
          <button onClick={() => { setEditProduct(null); setShowForm(true) }} className="font-ui" style={{
            background: 'var(--teak)', color: 'white', border: 'none',
            padding: '0.5rem 1.2rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.9rem',
          }}>+ Add Product</button>
        </div>
      </header>

      <main style={{ maxWidth: '1100px', margin: '0 auto', padding: '2rem 1.5rem' }}>
        <div style={{
          display: 'flex', gap: '2rem', marginBottom: '2rem', padding: '1rem 1.5rem',
          background: 'var(--sand)', borderRadius: '8px', alignItems: 'center', flexWrap: 'wrap',
        }}>
          <div className="font-ui">
            <span style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--teak)' }}>{products.length}</span>
            <span style={{ fontSize: '0.85rem', color: 'var(--muted)', marginLeft: '0.4rem' }}>products</span>
          </div>
          <div style={{ width: '1px', height: '2rem', background: 'var(--border)' }} />
          <div className="font-ui" style={{ fontSize: '0.82rem', color: 'var(--muted)' }}>
            🇮🇳 <span style={{ color: 'var(--teak)' }}>karan88-catalogue.vercel.app/catalogue/domestic</span>
          </div>
          <div className="font-ui" style={{ fontSize: '0.82rem', color: 'var(--muted)' }}>
            🌍 <span style={{ color: 'var(--teak)' }}>karan88-catalogue.vercel.app/catalogue/importer</span>
          </div>
        </div>

        {loading ? (
          <div className="font-ui" style={{ textAlign: 'center', padding: '4rem', color: 'var(--muted)' }}>Loading…</div>
        ) : products.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '5rem 2rem' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🪵</div>
            <p className="font-display" style={{ fontSize: '1.3rem', marginBottom: '0.5rem' }}>No products yet</p>
            <button onClick={() => setShowForm(true)} className="font-ui" style={{
              background: 'var(--teak)', color: 'white', border: 'none',
              padding: '0.7rem 1.5rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.95rem',
            }}>+ Add First Product</button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
            {products.map(product => (
              <ProductCard key={product.id} product={product} mode="admin"
                onEdit={() => { setEditProduct(product); setShowForm(true) }}
                onDelete={() => deleteProduct(product.id, product.image_url)} />
            ))}
          </div>
        )}
      </main>

      {showForm && <ProductForm product={editProduct} onClose={handleFormClose} />}
    </div>
  )
}
