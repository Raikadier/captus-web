import apiClient from '../shared/api/client';

export const aiTaskService = {
  /**
   * Envía un mensaje a la IA y maneja la respuesta incluyendo posibles acciones de herramientas.
   * @param {string} message - El mensaje del usuario.
   * @param {string|null} conversationId - ID de la conversación actual (opcional).
   * @returns {Promise<{result: string, conversationId: string, actionPerformed: string|null}>}
   */
  async sendMessage(message, conversationId = null) {
    try {
      const response = await apiClient.post('/ai/chat', {
        message,
        conversationId
      });
      return response.data;
    } catch (error) {
      console.error("Error en aiTaskService.sendMessage:", error);
      throw error;
    }
  },

  async getConversations() {
    try {
      const response = await apiClient.get('/ai/conversations');
      return response.data;
    } catch (error) {
      console.error("Error en aiTaskService.getConversations:", error);
      throw error;
    }
  },

  async getMessages(conversationId) {
    try {
      const response = await apiClient.get(`/ai/conversations/${conversationId}/messages`);
      return response.data;
    } catch (error) {
      console.error("Error en aiTaskService.getMessages:", error);
      throw error;
    }
  }
};
