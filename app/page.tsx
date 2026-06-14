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
