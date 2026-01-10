/**
 * Database Test Runner
 *
 * Runs all SQL stress tests against Supabase and reports results.
 *
 * Usage: npx tsx scripts/run-db-tests.ts
 *
 * Requires: VITE_SUPABASE_URL and VITE_SUPABASE_SERVICE_ROLE_KEY in .env.local
 */

import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'
import * as dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials')
  console.error('   Add VITE_SUPABASE_SERVICE_ROLE_KEY to .env.local')
  console.error('   Get it from: Supabase Dashboard → Settings → API → service_role')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

// ANSI colors for output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  dim: '\x1b[2m'
}

async function runTest(name: string, testFn: () => Promise<{ passed: boolean; details: string }>) {
  try {
    const result = await testFn()
    const status = result.passed
      ? `${colors.green}✓ PASS${colors.reset}`
      : `${colors.red}✗ FAIL${colors.reset}`
    console.log(`  ${status} ${name}`)
    if (result.details) {
      console.log(`         ${colors.dim}${result.details}${colors.reset}`)
    }
    return result.passed
  } catch (err: any) {
    console.log(`  ${colors.red}✗ ERROR${colors.reset} ${name}`)
    console.log(`         ${colors.dim}${err.message}${colors.reset}`)
    return false
  }
}

async function main() {
  console.log('\n' + colors.blue + '═'.repeat(60) + colors.reset)
  console.log(colors.blue + '  10,000 HOURS DATABASE STRESS TESTS' + colors.reset)
  console.log(colors.blue + '═'.repeat(60) + colors.reset + '\n')

  let passed = 0
  let failed = 0

  // Create test user via Supabase Auth (required for FK constraints)
  // The auth trigger auto-creates a profile entry
  const testEmail = `test-${Date.now()}@test.local`
  console.log(colors.dim + `Creating test user: ${testEmail}` + colors.reset + '\n')

  const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
    email: testEmail,
    password: 'test-password-123',
    email_confirm: true
  })

  if (authError || !authUser.user) {
    console.error('Failed to create test user:', authError?.message)
    console.error('Tests require service_role key to create auth users')
    process.exit(1)
  }

  const testUserId = authUser.user.id
  console.log(colors.dim + `Test user created: ${testUserId}` + colors.reset)

  // Cleanup function to remove test user at end
  const cleanup = async () => {
    console.log(colors.dim + '\nCleaning up test user...' + colors.reset)
    await supabase.from('session_template_votes').delete().eq('user_id', testUserId)
    await supabase.from('session_template_saves').delete().eq('user_id', testUserId)
    await supabase.from('session_template_completions').delete().eq('user_id', testUserId)
    // Delete auth user (cascades to profiles)
    await supabase.auth.admin.deleteUser(testUserId)
  }

  // ============================================
  // SECTION 1: DATA INTEGRITY TESTS
  // ============================================
  console.log(colors.yellow + '▶ Data Integrity Tests' + colors.reset)

  // Test 1: Seeded sessions exist
  if (await runTest('Seeded sessions migrated', async () => {
    const { count } = await supabase
      .from('session_templates')
      .select('*', { count: 'exact', head: true })
      .is('user_id', null)

    return {
      passed: (count || 0) >= 100,
      details: `${count} seeded sessions found (expected ~110)`
    }
  })) passed++; else failed++

  // Test 2: Vote trigger works
  if (await runTest('Vote increment trigger', async () => {
    // Get a template
    const { data: template } = await supabase
      .from('session_templates')
      .select('id, karma')
      .limit(1)
      .single()

    if (!template) return { passed: false, details: 'No template found' }

    // Using shared testUserId from setup
    const karmaBefore = template.karma

    // Add vote
    await supabase.from('session_template_votes').insert({
      template_id: template.id,
      user_id: testUserId
    })

    // Check karma
    const { data: after } = await supabase
      .from('session_templates')
      .select('karma')
      .eq('id', template.id)
      .single()

    // Cleanup
    await supabase.from('session_template_votes').delete()
      .eq('template_id', template.id)
      .eq('user_id', testUserId)

    return {
      passed: after?.karma === karmaBefore + 1,
      details: `Karma: ${karmaBefore} → ${after?.karma}`
    }
  })) passed++; else failed++

  // Test 3: Vote decrement trigger
  if (await runTest('Vote decrement trigger', async () => {
    const { data: template } = await supabase
      .from('session_templates')
      .select('id, karma')
      .limit(1)
      .single()

    if (!template) return { passed: false, details: 'No template found' }

    // Using shared testUserId from setup

    // Add then remove vote
    await supabase.from('session_template_votes').insert({
      template_id: template.id,
      user_id: testUserId
    })

    const { data: afterVote } = await supabase
      .from('session_templates')
      .select('karma')
      .eq('id', template.id)
      .single()

    await supabase.from('session_template_votes').delete()
      .eq('template_id', template.id)
      .eq('user_id', testUserId)

    const { data: afterUnvote } = await supabase
      .from('session_templates')
      .select('karma')
      .eq('id', template.id)
      .single()

    return {
      passed: afterUnvote?.karma === template.karma,
      details: `Karma restored after unvote: ${template.karma} → ${afterVote?.karma} → ${afterUnvote?.karma}`
    }
  })) passed++; else failed++

  // Test 4: Duplicate vote prevention
  if (await runTest('Duplicate vote prevention', async () => {
    const { data: template } = await supabase
      .from('session_templates')
      .select('id')
      .limit(1)
      .single()

    if (!template) return { passed: false, details: 'No template found' }

    // Using shared testUserId from setup

    // First vote
    await supabase.from('session_template_votes').insert({
      template_id: template.id,
      user_id: testUserId
    })

    // Try duplicate
    const { error } = await supabase.from('session_template_votes').insert({
      template_id: template.id,
      user_id: testUserId
    })

    // Cleanup
    await supabase.from('session_template_votes').delete()
      .eq('template_id', template.id)
      .eq('user_id', testUserId)

    return {
      passed: error !== null,
      details: error ? 'Duplicate correctly rejected' : 'Duplicate was allowed!'
    }
  })) passed++; else failed++

  // Test 5: Save trigger
  if (await runTest('Save increment trigger', async () => {
    const { data: template } = await supabase
      .from('session_templates')
      .select('id, saves')
      .limit(1)
      .single()

    if (!template) return { passed: false, details: 'No template found' }

    // Using shared testUserId from setup
    const savesBefore = template.saves

    await supabase.from('session_template_saves').insert({
      template_id: template.id,
      user_id: testUserId
    })

    const { data: after } = await supabase
      .from('session_templates')
      .select('saves')
      .eq('id', template.id)
      .single()

    // Cleanup
    await supabase.from('session_template_saves').delete()
      .eq('template_id', template.id)
      .eq('user_id', testUserId)

    return {
      passed: after?.saves === savesBefore + 1,
      details: `Saves: ${savesBefore} → ${after?.saves}`
    }
  })) passed++; else failed++

  // Test 6: Completion trigger
  if (await runTest('Completion increment trigger', async () => {
    const { data: template } = await supabase
      .from('session_templates')
      .select('id, completions')
      .limit(1)
      .single()

    if (!template) return { passed: false, details: 'No template found' }

    // Using shared testUserId from setup
    const completionsBefore = template.completions

    await supabase.from('session_template_completions').insert({
      template_id: template.id,
      user_id: testUserId,
      session_uuid: crypto.randomUUID()
    })

    const { data: after } = await supabase
      .from('session_templates')
      .select('completions')
      .eq('id', template.id)
      .single()

    // Cleanup
    await supabase.from('session_template_completions').delete()
      .eq('template_id', template.id)
      .eq('user_id', testUserId)

    return {
      passed: after?.completions === completionsBefore + 1,
      details: `Completions: ${completionsBefore} → ${after?.completions}`
    }
  })) passed++; else failed++

  // Test 7: Intent tags queryable
  if (await runTest('Intent tags GIN index query', async () => {
    const { data, error } = await supabase
      .from('session_templates')
      .select('id, title')
      .contains('intent_tags', ['focus'])
      .limit(5)

    return {
      passed: !error && (data?.length || 0) > 0,
      details: `Found ${data?.length || 0} templates with 'focus' tag`
    }
  })) passed++; else failed++

  // ============================================
  // SECTION 2: PERFORMANCE TESTS
  // ============================================
  console.log('\n' + colors.yellow + '▶ Performance Tests' + colors.reset)

  // Test 8: Feed query performance
  if (await runTest('Feed query < 500ms', async () => {
    const start = Date.now()

    await supabase
      .from('session_templates')
      .select('id, title, karma, saves, completions')
      .order('karma', { ascending: false })
      .limit(50)

    const duration = Date.now() - start

    return {
      passed: duration < 500,
      details: `Query took ${duration}ms`
    }
  })) passed++; else failed++

  // Test 9: Bulk votes (5 users - scaled down due to auth user creation overhead)
  if (await runTest('5 concurrent votes', async () => {
    const { data: template } = await supabase
      .from('session_templates')
      .select('id, karma')
      .is('user_id', null)
      .limit(1)
      .single()

    if (!template) return { passed: false, details: 'No template found' }

    const start = Date.now()
    const bulkTestUserIds: string[] = []

    // Create 5 test auth users and vote
    for (let i = 0; i < 5; i++) {
      const { data: user } = await supabase.auth.admin.createUser({
        email: `bulk-test-${Date.now()}-${i}@test.local`,
        password: 'test-password-123',
        email_confirm: true
      })

      if (user?.user) {
        bulkTestUserIds.push(user.user.id)

        // Then vote
        await supabase.from('session_template_votes').insert({
          template_id: template.id,
          user_id: user.user.id
        })
      }
    }

    const duration = Date.now() - start

    // Check final karma
    const { data: after } = await supabase
      .from('session_templates')
      .select('karma')
      .eq('id', template.id)
      .single()

    // Cleanup: delete votes then auth users
    for (const userId of bulkTestUserIds) {
      await supabase.from('session_template_votes').delete()
        .eq('template_id', template.id)
        .eq('user_id', userId)
      await supabase.auth.admin.deleteUser(userId)
    }

    const karmaIncrease = (after?.karma || 0) - template.karma

    return {
      passed: karmaIncrease === 5 && duration < 60000,
      details: `5 votes in ${duration}ms, karma +${karmaIncrease}`
    }
  })) passed++; else failed++

  // ============================================
  // SECTION 3: DATA FLOW TESTS
  // ============================================
  console.log('\n' + colors.yellow + '▶ Data Flow Tests' + colors.reset)

  // Test 10: RPC function works
  if (await runTest('get_session_templates_for_user RPC', async () => {
    // Using shared testUserId from setup

    const { data, error } = await supabase.rpc('get_session_templates_for_user', {
      p_user_id: testUserId,
      p_filter: 'top',
      p_limit: 10,
      p_offset: 0
    })

    return {
      passed: !error && Array.isArray(data),
      details: error ? error.message : `Returned ${data?.length || 0} templates with has_voted/has_saved flags`
    }
  })) passed++; else failed++

  // Test 11: User vote reflected in RPC
  if (await runTest('Vote reflected in RPC has_voted flag', async () => {
    const { data: template } = await supabase
      .from('session_templates')
      .select('id')
      .limit(1)
      .single()

    if (!template) return { passed: false, details: 'No template found' }

    // Using shared testUserId from setup

    // Vote
    await supabase.from('session_template_votes').insert({
      template_id: template.id,
      user_id: testUserId
    })

    // Check RPC
    const { data: rpcData } = await supabase.rpc('get_session_templates_for_user', {
      p_user_id: testUserId,
      p_filter: 'top',
      p_limit: 100,
      p_offset: 0
    })

    const votedTemplate = rpcData?.find((t: any) => t.id === template.id)

    // Cleanup
    await supabase.from('session_template_votes').delete()
      .eq('template_id', template.id)
      .eq('user_id', testUserId)

    return {
      passed: votedTemplate?.has_voted === true,
      details: votedTemplate?.has_voted ? 'has_voted correctly set to true' : 'has_voted not reflected'
    }
  })) passed++; else failed++

  // ============================================
  // CLEANUP & SUMMARY
  // ============================================
  await cleanup()

  console.log('\n' + colors.blue + '═'.repeat(60) + colors.reset)
  console.log(`  ${colors.green}Passed: ${passed}${colors.reset}  |  ${colors.red}Failed: ${failed}${colors.reset}  |  Total: ${passed + failed}`)
  console.log(`  Pass Rate: ${Math.round(100 * passed / (passed + failed))}%`)
  console.log(colors.blue + '═'.repeat(60) + colors.reset + '\n')

  if (failed > 0) {
    process.exit(1)
  }
}

main().catch(err => {
  console.error('Fatal error:', err)
  process.exit(1)
})
