import { supabase } from './supabase'

export const karmaService = {
  getProfile: async (userId) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()
    if (error) throw error
    return data
  },

  updateKarma: async (userId, amount) => {
    const { data, error } = await supabase
      .from('profiles')
      .update({ karma_balance: amount })
      .eq('id', userId)
    if (error) throw error
    return data
  },

  getTransactionHistory: async (userId) => {
    const { data, error } = await supabase
      .from('karma_ledger')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    if (error) throw error
    return data
  },

  unlockResource: async (userId, resourceId, cost) => {
    // 1. Check balance
    const { data: profile } = await supabase.from('profiles').select('karma_balance').eq('id', userId).single()
    if (profile.karma_balance < cost) throw new Error('Insufficient Karma')

    // 2. Perform Transaction Record
    const { data: entry, error: txError } = await supabase
      .from('karma_ledger')
      .insert({
        user_id: userId,
        amount: -cost,
        type: 'spent',
        source: 'Resource Unlock',
        note: `Unlocked Resource: ${resourceId}`
      })

    if (txError) throw txError

    // 3. Update Balance
    const { error: balanceError } = await supabase
      .from('profiles')
      .update({ karma_balance: profile.karma_balance - cost })
      .eq('id', userId)
    
    if (balanceError) throw balanceError

    return entry
  }
}
