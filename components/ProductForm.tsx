'use client'

import { useState, useRef } from 'react'
import { supabase, Product, getAllImages } from '@/lib/supabase'
import { v4 as uuidv4 } from 'uuid'

interface Props {
  product: Product | null
  onClose: () => void
}

const MATERIALS = ['Mango Wood', 'Acacia', 'Sheesham']
const CATEGORIES = ['Dining Table', 'Coffee Table', 'Sideboard', 'Cabinet', 'Chair', 'Bench', 'Bed Frame', 'Shelf', 'Other']

export default function ProductForm({ product, onClose }: Props) {
  const [name, setName] = useState(product?.name || '')
  const [material, setMaterial] = useState(product?.material || 'Mango Wood')
  const [category, setCategory] = useState(product?.category || '')
  const [sku, setSku] = useState(product?.sku || '')
  const [priceInr, setPriceInr] = useState(product?.price_inr?.toString() || '')
  const [dimensionsCm, setDimensionsCm] = useState(product?.dimensions_cm || '')
  const [description, setDescription] = useState(product?.description || '')
  const [showIn, setShowIn] = useState<'both' | 'domestic' | 'importer'>(product?.show_in || 'both')
  const [existingImages, setExistingImages] = useState<string[]>(product ? getAllImages(product) : [])
  const [newFiles, setNewFiles] = useState<File[]>([])
  const [newPreviews, setNewPreviews] = useState<string[]>([])
  const [saving, setSaving] = useState(false)
  const [generatingAI, setGeneratingAI] = useState(false)
  const [error, setError] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const totalImages = existingImages.length + newFiles.length

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || [])
    const allowed = 5 - totalImages
    const toAdd = files.slice(0, allowed)
    setNewFiles(prev => [...prev, ...toAdd])
    setNewPreviews(prev => [...prev, ...toAdd.map(f => URL.createObjectURL(f))])
  }

  function removeExisting(i: number) {
    setExistingImages(prev => prev.filter((_, idx) => idx !== i))
  }

  function removeNew(i: number) {
    setNewFiles(prev => prev.filter((_, idx) => idx !== i))
    setNewPreviews(prev => prev.filter((_, idx) => idx !== i))
  }

  async function generateDescription() {
    if (!name || !material) { setError('Enter name and material first.'); return }
    setGeneratingAI(true); setError('')
    try {
      const res = await fetch('/api/generate-description', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, material, category, dimensions: dimensionsCm }),
      })
      const data = await res.json()
      if (data.description) setDescription(data.description)
      else setError('AI failed. Try again.')
    } catch { setError('Could not connect to AI.') }
    setGeneratingAI(false)
  }

  async function handleSave() {
    if (!name || !material) { setError('Name and material are required.'); return }
    setSaving(true); setError('')

    const uploadedUrls: string[] = []
    for (const file of newFiles) {
      const ext = file.name.split('.').pop()
      const fileName = `${uuidv4()}.${ext}`
      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(fileName, file, { cacheControl: '3600', upsert: false })
      if (uploadError) { setError('Image upload failed: ' + uploadError.message); setSaving(false); return }
      const { data: urlData } = supabase.storage.from('product-images').getPublicUrl(fileName)
      uploadedUrls.push(urlData.publicUrl)
    }

    const allImages = [...existingImages, ...uploadedUrls]

    const productData = {
      name, material, category, sku,
      price_inr: parseFloat(priceInr) || 0,
      dimensions_cm: dimensionsCm,
      description,
      image_url: allImages[0] || null,
      image_urls: allImages,
      show_in: showIn,
    }

    if (product?.id) {
      const { error } = await supabase.from('products').update(productData).eq('id', product.id)
      if (error) { setError(error.message); setSaving(false); return }
    } else {
      const { error } = await supabase.from('products').insert([{ ...productData, id: uuidv4() }])
      if (error) { setError(error.message); setSaving(false); return }
    }
    setSaving(false); onClose()
  }

  const inputStyle = {
    width: '100%', padding: '0.6rem 0.75rem', border: '1px solid var(--border)',
    borderRadius: '4px', fontSize: '0.9rem', fontFamily: 'system-ui, sans-serif',
    background: 'white', color: 'var(--charcoal)', outline: 'none',
  }
  const labelStyle = {
    display: 'block', fontSize: '0.78rem', fontFamily: 'system-ui, sans-serif',
    color: 'var(--muted)', textTransform: 'uppercase' as const, letterSpacing: '0.05em', marginBottom: '0.35rem',
  }

  const catalogueOptions: { value: 'both' | 'domestic' | 'importer', label: string, emoji: string }[] = [
    { value: 'both', label: 'Both', emoji: '🌐' },
    { value: 'domestic', label: 'Domestic only', emoji: '🇮🇳' },
    { value: 'importer', label: 'Importer only', emoji: '🌍' },
  ]

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '1rem',
    }} onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div style={{
        background: 'white', borderRadius: '10px', width: '100%',
        maxWidth: '560px', maxHeight: '90vh', overflow: 'auto', padding: '2rem',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 className="font-display" style={{ margin: 0, fontSize: '1.3rem', fontWeight: '400' }}>
            {product ? 'Edit Product' : 'Add Product'}
          </h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: 'var(--muted)' }}>×</button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Photos */}
          <div>
            <label style={labelStyle}>Photos ({totalImages}/5)</label>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.5rem' }}>
              {existingImages.map((url, i) => (
                <div key={i} style={{ position: 'relative', width: '80px', height: '80px' }}>
                  <img src={url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '6px', border: '1px solid var(--border)' }} />
                  <button onClick={() => removeExisting(i)} style={{
                    position: 'absolute', top: '-6px', right: '-6px', width: '20px', height: '20px',
                    borderRadius: '50%', background: '#c0392b', color: 'white', border: 'none',
                    cursor: 'pointer', fontSize: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>×</button>
                </div>
              ))}
              {newPreviews.map((url, i) => (
                <div key={i} style={{ position: 'relative', width: '80px', height: '80px' }}>
                  <img src={url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '6px', border: '1px solid var(--teak-light)' }} />
                  <button onClick={() => removeNew(i)} style={{
                    position: 'absolute', top: '-6px', right: '-6px', width: '20px', height: '20px',
                    borderRadius: '50%', background: '#c0392b', color: 'white', border: 'none',
                    cursor: 'pointer', fontSize: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>×</button>
                </div>
              ))}
              {totalImages < 5 && (
                <div onClick={() => fileInputRef.current?.click()} style={{
                  width: '80px', height: '80px', border: '2px dashed var(--border)', borderRadius: '6px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', background: 'var(--sand)', color: 'var(--muted)', fontSize: '1.5rem',
                }}>+</div>
              )}
            </div>
            <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={handleImageChange} style={{ display: 'none' }} />
          </div>

          <div>
            <label style={labelStyle}>Product Name *</label>
            <input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Mango Wood Dining Table" style={inputStyle} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={labelStyle}>Material *</label>
              <select value={material} onChange={e => setMaterial(e.target.value)} style={inputStyle}>
                {MATERIALS.map(m => <option key={m}>{m}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Category</label>
              <select value={category} onChange={e => setCategory(e.target.value)} style={inputStyle}>
                <option value="">Select…</option>
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label style={labelStyle}>SKU / Product Code</label>
            <input value={sku} onChange={e => setSku(e.target.value)} placeholder="e.g. K88-DT-001" style={inputStyle} />
          </div>

          <div>
            <label style={labelStyle}>Show in Catalogue</label>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              {catalogueOptions.map(opt => (
                <button key={opt.value} onClick={() => setShowIn(opt.value)} className="font-ui" style={{
                  flex: 1, padding: '0.55rem 0.5rem',
                  border: showIn === opt.value ? '2px solid var(--teak)' : '1px solid var(--border)',
                  borderRadius: '6px',
                  background: showIn === opt.value ? '#fdf5ee' : 'white',
                  color: showIn === opt.value ? 'var(--teak-dark)' : 'var(--charcoal)',
                  cursor: 'pointer', fontSize: '0.82rem',
                  fontWeight: showIn === opt.value ? '600' : '400',
                }}>
                  <div>{opt.emoji}</div>
                  <div>{opt.label}</div>
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={labelStyle}>Price (₹ INR)</label>
              <input type="number" value={priceInr} onChange={e => setPriceInr(e.target.value)} placeholder="e.g. 35000" style={inputStyle} />
              {priceInr && (
                <p className="font-ui" style={{ margin: '0.25rem 0 0', fontSize: '0.75rem', color: 'var(--muted)' }}>
                  ≈ ${Math.round(parseFloat(priceInr) / 84).toLocaleString()} USD
                </p>
              )}
            </div>
            <div>
              <label style={labelStyle}>Dimensions (cm)</label>
              <input value={dimensionsCm} onChange={e => setDimensionsCm(e.target.value)} placeholder="e.g. 180 × 90 × 76" style={inputStyle} />
              {dimensionsCm && (
                <p className="font-ui" style={{ margin: '0.25rem 0 0', fontSize: '0.75rem', color: 'var(--muted)' }}>
                  ≈ {dimensionsCm.replace(/[\d.]+/g, (n: string) => (parseFloat(n)/2.54).toFixed(1))} in
                </p>
              )}
            </div>
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
              <label style={{ ...labelStyle, marginBottom: 0 }}>Description</label>
              <button onClick={generateDescription} disabled={generatingAI} className="font-ui" style={{
                background: generatingAI ? 'var(--sand)' : 'var(--teak)',
                color: generatingAI ? 'var(--muted)' : 'white',
                border: 'none', padding: '0.3rem 0.8rem', borderRadius: '4px',
                cursor: generatingAI ? 'default' : 'pointer', fontSize: '0.78rem',
              }}>{generatingAI ? '✨ Writing…' : '✨ AI Write'}</button>
            </div>
            <textarea value={description} onChange={e => setDescription(e.target.value)}
              placeholder="Product description for buyers…" rows={4}
              style={{ ...inputStyle, resize: 'vertical', lineHeight: '1.5' }} />
          </div>

          {error && <p className="font-ui" style={{ color: '#c0392b', fontSize: '0.85rem', margin: 0 }}>{error}</p>}

          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', paddingTop: '0.5rem' }}>
            <button onClick={onClose} className="font-ui" style={{
              background: 'white', border: '1px solid var(--border)', padding: '0.6rem 1.2rem',
              borderRadius: '4px', cursor: 'pointer', fontSize: '0.9rem',
            }}>Cancel</button>
            <button onClick={handleSave} disabled={saving} className="font-ui" style={{
              background: saving ? 'var(--muted)' : 'var(--teak)', color: 'white', border: 'none',
              padding: '0.6rem 1.5rem', borderRadius: '4px', cursor: saving ? 'default' : 'pointer', fontSize: '0.9rem',
            }}>{saving ? 'Saving…' : product ? 'Save Changes' : 'Add Product'}</button>
          </div>
        </div>
      </div>
    </div>
  )
}
