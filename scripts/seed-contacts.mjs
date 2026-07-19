// Additive: seeds one demo contact per existing asset (does NOT wipe anything).
import { createClient } from '@supabase/supabase-js'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const key = process.env.SUPABASE_SECRET_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
if (!url || !key) { console.error('MISSING ENV'); process.exit(1) }
const sb = createClient(url, key)

const CONTACT_BY_ASSET_NAME = {
  'Blue Star 1T AC': { name: 'Ramesh Kumar', role: 'ac_tech', phone: '+91 98204 11872' },
  'Bosch Built-in Oven': { name: 'Bosch Care', role: 'electrician', phone: '+91 98330 55210' },
  'Building Lift AMC': { name: 'Otis Support', role: 'other', phone: '+91 98200 96847' },
  'Honda City': { name: 'City Motors Workshop', role: 'car_workshop', phone: '+91 22 6666 1200' },
  'Hyundai i20': { name: 'Hyundai Bandra Service', role: 'car_workshop', phone: '+91 98673 44120' },
  'LG 55" OLED TV': { name: 'LG Service Center', role: 'electrician', phone: '+91 98100 99999' },
  'Samsung 253L Fridge': { name: 'Samsung Care', role: 'electrician', phone: '+91 98200 72678' },
  'Split Air Conditioner': { name: 'Ramesh Kumar', role: 'ac_tech', phone: '+91 98204 11872' },
  'Voltas 1.5 Ton 3-Star Split AC': { name: 'Coolbreeze Service Desk', role: 'ac_tech', phone: '+91 98300 41562' },
  'Voltas 1.5T Split AC': { name: 'Ramesh Kumar', role: 'ac_tech', phone: '+91 98204 11872' },
}

const { data: assets, error: assetsErr } = await sb.from('assets').select('id, name')
if (assetsErr) throw new Error(`assets: ${assetsErr.message}`)

const { data: existing, error: existingErr } = await sb.from('contacts').select('linked_asset_id')
if (existingErr) throw new Error(`contacts: ${existingErr.message}`)
const alreadyLinked = new Set((existing ?? []).map((c) => c.linked_asset_id).filter(Boolean))

let inserted = 0
for (const asset of assets ?? []) {
  if (alreadyLinked.has(asset.id)) continue
  const template = CONTACT_BY_ASSET_NAME[asset.name]
  if (!template) continue
  const { error } = await sb.from('contacts').insert({ ...template, linked_asset_id: asset.id })
  if (error) throw new Error(`insert for ${asset.name}: ${error.message}`)
  inserted++
}
console.log('CONTACTS_SEEDED', inserted)
