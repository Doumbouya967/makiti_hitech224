import dotenv from 'dotenv'
import { createClient } from '@supabase/supabase-js'

dotenv.config({ path: './.env.local' })

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('Missing SUPABASE_URL or SERVICE_ROLE_KEY in environment. Check .env.local')
  process.exit(1)
}

const supabaseAdmin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY)

async function main() {
  const email = 'doumbouyasekou967@gmail.com'
  const password = 'Sekou0000###'
  const nom_complet = 'Doumbouya'

  // Try to create the user
  console.log('Creating user', email)
  const { data: created, error: createError } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { nom_complet }
  })

  let userId
  if (createError) {
    console.warn('Create user error:', createError.message)
    // If user already exists, try to find it
    console.log('Trying to find existing user by email...')
    const { data: listData, error: listError } = await supabaseAdmin.auth.admin.listUsers()
    if (listError) {
      console.error('Cannot list users:', listError)
      process.exit(1)
    }
    const found = listData.users.find(u => u.email === email)
    if (!found) {
      console.error('User not found and cannot be created. Aborting.')
      process.exit(1)
    }
    userId = found.id
    console.log('Existing user id:', userId)
  } else {
    userId = created.user.id
    console.log('Created user id:', userId)
  }

  // Assign proprietaire role in public.user_roles
  console.log('Assigning role proprietaire to user', userId)
  const { error: roleError } = await supabaseAdmin
    .from('user_roles')
    // user_roles has UNIQUE (user_id, role) so use that as the ON CONFLICT target
    .upsert({ user_id: userId, role: 'proprietaire' }, { onConflict: 'user_id,role' })

  if (roleError) {
    console.error('Error assigning role:', roleError.message)
  } else {
    console.log('Role assigned (or updated) successfully')
  }

  // Ensure profile exists or update it
  console.log('Ensuring profile exists/updated')
  const { error: profileError } = await supabaseAdmin
    .from('profiles')
    .upsert({ user_id: userId, nom_complet }, { onConflict: 'user_id' })

  if (profileError) {
    console.error('Error upserting profile:', profileError.message)
  } else {
    console.log('Profile ensured/updated')
  }

  console.log('Done')
}

main().catch(err => {
  console.error('Unexpected error:', err)
  process.exit(1)
})
