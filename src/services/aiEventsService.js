import apiClient from '../shared/api/client'

export const aiEventsService = {
  /**
   * Sends a message to the AI Chat endpoint.
   * @param {string} message - The user's message.
   * @param {string} [conversationId] - The ID of the current conversation (optional).
   * @returns {Promise<Object>} - The response containing the result and optional action metadata.
   */
  sendMessage: async (message, conversationId = null) => {
    try {
      const payload = { message }
      // Only include conversationId for existing conversations. Sending null for a
      // new chat made the backend query id=eq.null (bigint) and throw a 500.
      if (conversationId) {
        payload.conversationId = conversationId
      }

      const response = await apiClient.post('/ai/chat', payload)

      // The backend now returns { result: string, actionPerformed?: string, conversationId: string }
      return response.data
    } catch (error) {
      console.error('Error in aiEventsService:', error)
      throw error
    }
  }
}
