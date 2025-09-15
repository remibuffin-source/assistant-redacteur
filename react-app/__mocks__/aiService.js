// Mock pour AIService pour les tests Jest
const mockAIService = {
  async generateContent(aiType, data) {
    // Simulation d'appel API pour les tests
    return {
      success: true,
      content: `Contenu généré par ${aiType} pour le projet: ${data.title || 'Sans titre'}`
    };
  },

  async simulateAICall(aiType, data) {
    await new Promise(resolve => setTimeout(resolve, 100));
    return {
      success: true,
      content: `Contenu simulé pour ${aiType}`
    };
  },

  async callOpenAIAPI() {
    return {
      success: true,
      content: 'Contenu généré par OpenAI',
      usage: { total_tokens: 100 },
      model: 'gpt-4'
    };
  }
};

module.exports = mockAIService;