import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Product = {
  id: string
  name: string
  material: string
  category: string
  price_inr: number
  dimensions_cm: string
  description: string
  image_url: string | null
  show_in: 'both' | 'domestic' | 'importer'
  created_at: string
}

export const USD_RATE = 84

export function inrToUsd(inr: number): number {
  return Math.round(inr / USD_RATE)
}

export function cmToInches(cm: string): string {
  if (!cm) return ''
  return cm.replace(/[\d.]+/g, (n) => {
    const inches = parseFloat(n) / 2.54
    return inches % 1 === 0 ? inches.toString() : inches.toFixed(1)
  })
}
