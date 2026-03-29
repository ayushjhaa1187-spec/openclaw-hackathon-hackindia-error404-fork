import { supabase } from '../lib/supabase'

export const vaultService = {
  // Fetch all approved resources
  async getResources(filters = {}) {
    let query = supabase
      .from('resources')
      .select(`
        *,
        uploader:uploader_id (full_name, avatar_url),
        campus:campus_id (name, short_code)
      `)
      .eq('status', 'approved')

    if (filters.type && filters.type !== 'All') {
      query = query.eq('type', filters.type)
    }

    if (filters.subject && filters.subject !== 'All') {
      query = query.eq('subject', filters.subject)
    }

    if (filters.campusId) {
      query = query.eq('campus_id', filters.campusId)
    }

    const { data, error } = await query.order('created_at', { ascending: false })
    if (error) throw error
    return data
  },

  // Check if user has already unlocked a resource
  async checkUnlock(resourceId, userId) {
    const { data, error } = await supabase
      .from('resource_unlocks')
      .select('id')
      .eq('resource_id', resourceId)
      .eq('user_id', userId)
      .single()
    
    if (error && error.code !== 'PGRST116') throw error // PGRST116 is 'no rows found'
    return !!data
  },

  // Unlock a resource (spends Karma)
  async unlockResource(resourceId, userId, cost) {
    // 1. Double check balance (safety)
    const { data: profile } = await supabase
      .from('profiles')
      .select('karma_balance')
      .eq('id', userId)
      .single()

    if (profile.karma_balance < cost) throw new Error('Insufficient Karma balance.')

    // 2. Insert unlock record (RLS and Triggers should ideally handle the balance deduction, 
    // but we'll do it via RPC or manual update for this hackathon simplicity if triggers aren't set)
    const { error: unlockError } = await supabase
      .from('resource_unlocks')
      .insert({ resource_id: resourceId, user_id: userId, karma_spent: cost })

    if (unlockError) throw unlockError

    // 3. Update karma balance
    const { error: balanceError } = await supabase
      .from('profiles')
      .update({ karma_balance: profile.karma_balance - cost })
      .eq('id', userId)

    if (balanceError) throw balanceError

    // 4. Log to ledger
    await supabase.from('karma_ledger').insert({
      user_id: userId,
      amount: -cost,
      type: 'spent',
      source: 'Resource Unlock',
      note: `Unlocked resource ${resourceId}`
    })

    // 5. Increment download count (optional RPC call)
    await supabase.rpc('increment_download_count', { row_id: resourceId })

    return true
  },

  // Upload a new resource (pending approval)
  async uploadResource(resource) {
    const { data, error } = await supabase
      .from('resources')
      .insert(resource)
      .select()
      .single()
    
    if (error) throw error
    return data
  }
}
