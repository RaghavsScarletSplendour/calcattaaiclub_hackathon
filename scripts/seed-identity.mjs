// Additive: adds Raghav as a person, links his existing (already-uploaded) driver's
// license document to him, and seeds a few dummy identity docs across everyone.
import { createClient } from '@supabase/supabase-js'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const key = process.env.SUPABASE_SECRET_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
if (!url || !key) { console.error('MISSING ENV'); process.exit(1) }
const sb = createClient(url, key)

const iso = (d) => d.toISOString().slice(0, 10)
const yearsFromNow = (n) => { const d = new Date(); d.setFullYear(d.getFullYear() + n); return iso(d) }
const yearsAgo = (n) => { const d = new Date(); d.setFullYear(d.getFullYear() - n); return iso(d) }

// 1. Raghav as a person (idempotent: skip if already present).
let { data: raghav } = await sb.from('people').select('id').eq('name', 'Raghav').maybeSingle()
if (!raghav) {
  const { data, error } = await sb
    .from('people')
    .insert({ name: 'Raghav', initial: 'R', color: '#7C3AED', role: 'parent' })
    .select('id')
    .single()
  if (error) throw new Error(`insert raghav: ${error.message}`)
  raghav = data
  console.log('CREATED_RAGHAV', raghav.id)
} else {
  console.log('RAGHAV_ALREADY_EXISTS', raghav.id)
}

// 2. Link the already-uploaded driver's license doc to Raghav.
const { data: dlDoc, error: dlErr } = await sb
  .from('documents')
  .select('id, owner_id')
  .eq('doc_type', 'identity')
  .contains('extracted_json', { name: 'Raghav Bajoria' })
  .maybeSingle()
if (dlErr) throw new Error(`find dl: ${dlErr.message}`)
if (dlDoc) {
  const { error } = await sb.from('documents').update({ owner_id: raghav.id }).eq('id', dlDoc.id)
  if (error) throw new Error(`link dl: ${error.message}`)
  console.log('LINKED_DRIVERS_LICENSE', dlDoc.id, '->', raghav.id)
} else {
  console.log('DRIVERS_LICENSE_NOT_FOUND')
}

// 3. Fill out identity docs for everyone (skip a person if they already have that doc type by name).
const { data: people } = await sb.from('people').select('id, name')
const byName = Object.fromEntries((people ?? []).map((p) => [p.name, p.id]))

const { data: existingIdentity } = await sb.from('documents').select('owner_id, extracted_json').eq('doc_type', 'identity')
const already = new Set(
  (existingIdentity ?? []).map((d) => `${d.owner_id}::${d.extracted_json?.name ?? ''}`)
)

const DUMMY_DOCS = [
  { person: 'Ma', name: 'Aadhaar', extra: { number: '•••• •••• 4821' } },
  { person: 'Ma', name: 'PAN', extra: { number: 'ABCDE1234F' } },
  { person: 'Dad', name: 'Aadhaar', extra: { number: '•••• •••• 7715' } },
  { person: 'Dad', name: 'PAN', extra: { number: 'BXKPR7788Q' } },
  { person: 'Dad', name: 'Driving Licence', extra: { number: 'MH02 2016 0119284' }, expiry: yearsFromNow(1) },
  { person: 'Aarav', name: 'Aadhaar', extra: { number: '•••• •••• 9034' } },
  { person: 'Aarav', name: 'School ID', extra: { school: 'DPS · Grade 9' } },
  { person: 'Raghav', name: 'Aadhaar', extra: { number: '•••• •••• 2231' } },
  { person: 'Raghav', name: 'PAN', extra: { number: 'CMPBR5541K' } },
]

let inserted = 0
for (const doc of DUMMY_DOCS) {
  const ownerId = byName[doc.person]
  if (!ownerId) continue
  if (already.has(`${ownerId}::${doc.name}`)) continue
  const { error } = await sb.from('documents').insert({
    owner_id: ownerId,
    doc_type: 'identity',
    issue_date: yearsAgo(3),
    expiry_date: doc.expiry ?? null,
    extracted_json: { name: doc.name, ...doc.extra },
  })
  if (error) throw new Error(`insert ${doc.person}/${doc.name}: ${error.message}`)
  inserted++
}
console.log('DUMMY_IDENTITY_DOCS_INSERTED', inserted)
