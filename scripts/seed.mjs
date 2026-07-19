// Seeds a believable household. Idempotent: wipes then re-inserts.
// Dates are relative to "now" so the hero card stays ~12 days out whenever run.
import { createClient } from '@supabase/supabase-js'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const key = process.env.SUPABASE_SECRET_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
if (!url || !key) { console.error('MISSING ENV'); process.exit(1) }
const sb = createClient(url, key)

const base = new Date()
const iso = (d) => d.toISOString().slice(0, 10)
const addDays = (n) => { const d = new Date(base); d.setDate(d.getDate() + n); return iso(d) }
const addMonths = (n) => { const d = new Date(base); d.setMonth(d.getMonth() + n); return iso(d) }
const yearsAgo = (n) => { const d = new Date(base); d.setFullYear(d.getFullYear() - n); return iso(d) }

async function ins(table, row) {
  const { data, error } = await sb.from(table).insert(row).select().single()
  if (error) throw new Error(`${table}: ${error.message}`)
  return data
}

// wipe in FK-safe order (idempotent re-seed)
for (const t of ['reminders', 'expenses', 'person_facts', 'contacts', 'documents', 'assets', 'people']) {
  const { error } = await sb.from(t).delete().not('id', 'is', null)
  if (error) throw new Error(`wipe ${t}: ${error.message}`)
}

// ---- people ----
const ma = await ins('people', { name: 'Ma', initial: 'M', color: '#E11D74', dob: '1968-04-12', role: 'parent' })
const dad = await ins('people', { name: 'Dad', initial: 'D', color: '#2563EB', dob: '1965-09-03', role: 'parent' })
const kid = await ins('people', { name: 'Aarav', initial: 'A', color: '#16A34A', dob: '2009-01-22', role: 'child' })

// ---- assets ----
const voltasAc = await ins('assets', { type: 'appliance', name: 'Voltas 1.5T Split AC', brand: 'Voltas', model: '183V ADS', serial_or_rc: 'VOL-AC-8842', room_or_unit: 'Living Room', purchase_date: yearsAgo(2), price: 42000, dealer: 'Croma, Andheri', icon: 'air-vent', owner_id: null })
await ins('assets', { type: 'appliance', name: 'Blue Star 1T AC', brand: 'Blue Star', model: 'IC312', serial_or_rc: 'BS-AC-2291', room_or_unit: 'Master Bedroom', purchase_date: yearsAgo(1), price: 36000, dealer: 'Reliance Digital', icon: 'air-vent', owner_id: null })
await ins('assets', { type: 'appliance', name: 'Samsung 253L Fridge', brand: 'Samsung', model: 'RT28', serial_or_rc: 'SM-FR-1180', room_or_unit: 'Kitchen', purchase_date: yearsAgo(3), price: 28000, dealer: 'Vijay Sales', icon: 'refrigerator', owner_id: null })
await ins('assets', { type: 'appliance', name: 'LG 55" OLED TV', brand: 'LG', model: 'C3', serial_or_rc: 'LG-TV-7731', room_or_unit: 'Living Room', purchase_date: yearsAgo(1), price: 120000, dealer: 'Croma', icon: 'tv', owner_id: null })
await ins('assets', { type: 'appliance', name: 'Bosch Built-in Oven', brand: 'Bosch', model: 'HBG633', serial_or_rc: 'BO-OV-5540', room_or_unit: 'Kitchen', purchase_date: yearsAgo(2), price: 65000, dealer: 'Bosch Store', icon: 'cooking-pot', owner_id: null })
const lift = await ins('assets', { type: 'appliance', name: 'Building Lift AMC', brand: 'Kone', model: 'MonoSpace', serial_or_rc: 'KONE-LIFT-01', room_or_unit: 'Building', purchase_date: yearsAgo(5), price: 0, dealer: 'Kone Elevators', icon: 'arrow-up-down', owner_id: null })
const hondaCity = await ins('assets', { type: 'vehicle', name: 'Honda City', brand: 'Honda', model: 'City ZX 2021', serial_or_rc: 'MH01 AB 1234', room_or_unit: 'Parking', purchase_date: yearsAgo(3), price: 1400000, dealer: 'Honda Andheri', icon: 'car', owner_id: dad.id })
await ins('assets', { type: 'vehicle', name: 'Hyundai i20', brand: 'Hyundai', model: 'i20 Asta 2020', serial_or_rc: 'MH02 CD 5678', room_or_unit: 'Parking', purchase_date: yearsAgo(4), price: 900000, dealer: 'Hyundai Bandra', icon: 'car', owner_id: ma.id })

// ---- documents ----
const maInsuranceDoc = await ins('documents', { owner_id: ma.id, doc_type: 'insurance', issue_date: addMonths(-11), expiry_date: addDays(12), amount: 24000, extracted_json: { policy: 'Star Health Family Floater', cover: '10,00,000', insured: 'Ma' } })
await ins('documents', { asset_id: voltasAc.id, doc_type: 'invoice', issue_date: yearsAgo(2), amount: 42000, extracted_json: { item: 'Voltas 1.5T Split AC', dealer: 'Croma' } })
await ins('documents', { asset_id: hondaCity.id, doc_type: 'rc', issue_date: yearsAgo(3), extracted_json: { rc: 'MH01 AB 1234' } })
const maPassportDoc = await ins('documents', { owner_id: ma.id, doc_type: 'identity', issue_date: yearsAgo(6), expiry_date: addDays(240), extracted_json: { type: 'Passport', number: 'M12xxxx' } })
const acWarrantyDoc = await ins('documents', { asset_id: voltasAc.id, doc_type: 'warranty', issue_date: yearsAgo(2), expiry_date: addMonths(6), extracted_json: { warranty: '5 yr compressor' } })

// ---- person_facts ----
await ins('person_facts', { person_id: ma.id, kind: 'allergy', value: 'Penicillin' })
await ins('person_facts', { person_id: ma.id, kind: 'blood_group', value: 'B+' })
await ins('person_facts', { person_id: ma.id, kind: 'condition', value: 'Hypertension' })
await ins('person_facts', { person_id: ma.id, kind: 'insurance', value: 'Star Health Family Floater — 10L cover', document_id: maInsuranceDoc.id })
await ins('person_facts', { person_id: dad.id, kind: 'blood_group', value: 'O+' })
await ins('person_facts', { person_id: dad.id, kind: 'allergy', value: 'Peanuts' })
await ins('person_facts', { person_id: kid.id, kind: 'blood_group', value: 'A+' })
await ins('person_facts', { person_id: kid.id, kind: 'allergy', value: 'Dust' })

// ---- expenses (AC + running maintenance) ----
await ins('expenses', { name: 'AC servicing & gas refill', amount: 8000, date: addMonths(-2), category: 'Maintenance', asset_id: voltasAc.id })
await ins('expenses', { name: 'AC deep clean', amount: 1200, date: addMonths(-8), category: 'Maintenance', asset_id: voltasAc.id })

// ---- reminders (nearest-due = Ma insurance +12 -> top glowing card) ----
await ins('reminders', { person_id: ma.id, document_id: maInsuranceDoc.id, name: "Ma's health insurance renewal", type: 'insurance', due_date: addDays(12), amount: 24000, status: 'upcoming' })
await ins('reminders', { asset_id: hondaCity.id, name: 'Honda City PUC renewal', type: 'puc', due_date: addDays(19), status: 'upcoming' })
await ins('reminders', { asset_id: lift.id, name: 'Building lift AMC renewal', type: 'amc', due_date: addDays(23), amount: 18000, status: 'upcoming' })
await ins('reminders', { asset_id: hondaCity.id, person_id: dad.id, name: 'Honda City insurance renewal', type: 'insurance', due_date: addDays(28), amount: 32000, status: 'upcoming' })
await ins('reminders', { asset_id: voltasAc.id, name: 'Voltas AC annual service', type: 'service', due_date: addDays(41), amount: 3500, status: 'upcoming' })
await ins('reminders', { asset_id: voltasAc.id, document_id: acWarrantyDoc.id, name: 'Voltas AC warranty expiry', type: 'warranty', due_date: addMonths(6), status: 'upcoming' })
await ins('reminders', { person_id: ma.id, document_id: maPassportDoc.id, name: "Ma's passport renewal", type: 'identity', due_date: addDays(240), status: 'upcoming' })

// counts
const summary = {}
for (const t of ['people', 'assets', 'documents', 'person_facts', 'expenses', 'reminders']) {
  const { count } = await sb.from(t).select('*', { count: 'exact', head: true })
  summary[t] = count
}
console.log('SEED_DONE', JSON.stringify(summary))
