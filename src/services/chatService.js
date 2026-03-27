import { supabase } from '../lib/supabase'

export const chatService = {
  // Fetch active conversations for a user
  async getConversations(userId) {
    const { data, error } = await supabase
      .from('conversations')
      .select(`
        *,
        messages:messages (content, sender_id, created_at)
      `)
      .contains('participant_ids', [userId])
      .order('last_message_at', { ascending: false })

    if (error) throw error
    // In real app, we'd also fetch the other participant's profile details
    return data
  },

  // Fetch messages for a specific conversation
  async getMessages(conversationId) {
    const { data, error } = await supabase
      .from('messages')
      .select(`
        *,
        sender:sender_id (full_name, avatar_url)
      `)
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true })

    if (error) throw error
    return data
  },

  // Send a message
  async sendMessage(conversationId, senderId, content) {
    // 1. Insert message
    const { data, error } = await supabase
      .from('messages')
      .insert({ conversation_id: conversationId, sender_id: senderId, content })
      .select()
      .single()

    if (error) throw error

    // 2. Update conversation's last message time
    await supabase
      .from('conversations')
      .update({ last_message: content, last_message_at: new Date().toISOString() })
      .eq('id', conversationId)

    return data
  },

  // Create a new conversation (Nexus Bridge)
  async startConversation(participantIds, isNexusBridge = false) {
    // Check if conversation already exists between these exact participants
    const { data: existing } = await supabase
      .from('conversations')
      .select('id')
      .contains('participant_ids', participantIds)
      .single()

    if (existing) return existing.id

    // Create new
    const { data, error } = await supabase
      .from('conversations')
      .insert({ participant_ids: participantIds, is_nexus_bridge: isNexusBridge })
      .select('id')
      .single()

    if (error) throw error
    return data.id
  },

  // Real-time message listener
  subscribeToMessages(conversationId, onMessage) {
    return supabase
      .channel(`conversation:${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`
        },
        (payload) => onMessage(payload.new)
      )
      .subscribe()
  }
}
