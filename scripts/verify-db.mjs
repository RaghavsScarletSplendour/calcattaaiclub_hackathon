// Verifies the applied schema + anon access using the SAME key the app uses.
import { createClient } from '@supabase/supabase-js'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
if (!url || !key) {
  console.error('MISSING ENV', { url: !!url, key: !!key })
  process.exit(1)
}
const sb = createClient(url, key)
const tables = ['people', 'assets', 'documents', 'person_facts', 'contacts', 'expenses', 'reminders']
let ok = true

for (const t of tables) {
  const { count, error } = await sb.from(t).select('*', { count: 'exact', head: true })
  if (error) { console.log(`FAIL ${t}: ${error.message}`); ok = false }
  else console.log(`OK   ${t}: count=${count}`)
}

// write test with the anon key (proves RLS-disable + grants)
const { data: ins, error: insErr } = await sb
  .from('people').insert({ name: '__verify__', initial: 'V' }).select().single()
if (insErr) { console.log(`FAIL insert: ${insErr.message}`); ok = false }
else {
  console.log(`OK   insert people id=${ins.id}`)
  const { error: delErr } = await sb.from('people').delete().eq('id', ins.id)
  console.log(delErr ? `FAIL delete: ${delErr.message}` : 'OK   delete cleanup')
}
console.log(ok ? 'ALL_GOOD' : 'PROBLEMS')
process.exit(ok ? 0 : 1)
