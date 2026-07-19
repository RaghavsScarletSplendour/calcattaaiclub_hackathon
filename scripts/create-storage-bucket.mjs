// Creates the private "documents" bucket used to store uploaded photos
// (receipts, warranties, identity documents). Idempotent.
import { createClient } from '@supabase/supabase-js'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const key = process.env.SUPABASE_SECRET_KEY
if (!url || !key) { console.error('MISSING ENV'); process.exit(1) }
const sb = createClient(url, key)

const { data: buckets, error: listErr } = await sb.storage.listBuckets()
if (listErr) throw new Error(`list buckets: ${listErr.message}`)

if (buckets.some((b) => b.id === 'documents')) {
  console.log('bucket "documents" already exists')
} else {
  const { error } = await sb.storage.createBucket('documents', {
    public: false,
    fileSizeLimit: '50MB',
  })
  if (error) throw new Error(`create bucket: ${error.message}`)
  console.log('created private bucket "documents"')
}
