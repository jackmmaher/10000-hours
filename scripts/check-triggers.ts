/**
 * Check if triggers exist in Supabase
 */

import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.VITE_SUPABASE_SERVICE_ROLE_KEY!
)

async function main() {
  console.log('Testing trigger execution...\n')

  // Get a template
  const { data: template } = await supabase
    .from('session_templates')
    .select('id, karma')
    .limit(1)
    .single()

  console.log('Template before:', template)

  // Insert vote with service role (bypasses RLS)
  const testUserId = '00000000-0000-0000-0000-000000000001'

  const { error: insertError } = await supabase
    .from('session_template_votes')
    .insert({
      template_id: template?.id,
      user_id: testUserId
    })

  console.log('Insert error:', insertError)

  // Check karma after
  const { data: after } = await supabase
    .from('session_templates')
    .select('id, karma')
    .eq('id', template?.id)
    .single()

  console.log('Template after:', after)

  // Check if vote was actually inserted
  const { count } = await supabase
    .from('session_template_votes')
    .select('*', { count: 'exact', head: true })
    .eq('template_id', template?.id)

  console.log('Votes for this template:', count)

  // Cleanup
  await supabase
    .from('session_template_votes')
    .delete()
    .eq('user_id', testUserId)

  console.log('\n========== DIAGNOSIS ==========')
  if (insertError) {
    console.log('❌ Vote insert failed - check RLS policies or FK constraints')
    console.log('   Error:', insertError.message)
  } else if (after?.karma === template?.karma) {
    console.log('❌ Vote inserted but karma did NOT increment')
    console.log('   TRIGGER IS MISSING or NOT FIRING')
    console.log('')
    console.log('   FIX: Run the trigger SQL from supabase/session_templates_migration.sql')
    console.log('   Specifically the section: "TRIGGERS FOR SESSION TEMPLATE COUNTS"')
  } else {
    console.log('✓ Trigger is working correctly!')
  }
}

main().catch(console.error)
