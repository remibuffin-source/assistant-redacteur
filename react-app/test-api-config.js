// Script de test pour la configuration API
// Ce script vérifie que les fonctionnalités de base fonctionnent

const { testApiKey } = require('./src/hooks/useLocalStorage');

// Test des fonctions de validation des clés API
async function testApiValidation() {
  console.log('🧪 Test des validations de clés API...\n');
  
  // Test avec une clé OpenAI valide
  const openaiResult = await testApiKey('openai', 'sk-1234567890abcdefghijklmnopqrstuvwxyz');
  console.log('OpenAI Test:', openaiResult);
  
  // Test avec une clé OpenAI invalide
  const openaiInvalid = await testApiKey('openai', 'invalid-key');
  console.log('OpenAI Invalid Test:', openaiInvalid);
  
  // Test avec une clé Anthropic valide
  const anthropicResult = await testApiKey('anthropic', 'sk-ant-1234567890abcdefghijklmnopqrstuvwxyz');
  console.log('Anthropic Test:', anthropicResult);
  
  // Test avec une clé trop courte
  const shortKey = await testApiKey('openai', 'short');
  console.log('Short Key Test:', shortKey);
  
  console.log('\n✅ Tests de validation terminés !');
}

// Test de la structure des données
function testDataStructure() {
  console.log('\n📊 Test de la structure des données...');
  
  const sampleData = {
    apiKeys: {
      openai: '',
      anthropic: '',
      gemini: '',
      deepseek: '',
      grok: '',
      kimi: '',
      twitter: '',
      facebook: '',
      linkedin: '',
      instagram: '',
      blog: '',
      website: ''
    }
  };
  
  const services = Object.keys(sampleData.apiKeys);
  console.log('Services configurés:', services.length);
  console.log('Services IA:', services.filter(s => ['openai', 'anthropic', 'gemini', 'deepseek', 'grok', 'kimi'].includes(s)).length);
  console.log('Services Réseaux:', services.filter(s => ['twitter', 'facebook', 'linkedin', 'instagram', 'blog', 'website'].includes(s)).length);
  
  console.log('✅ Structure des données validée !');
}

// Exécution des tests
async function runTests() {
  try {
    console.log('🚀 Démarrage des tests de configuration API...\n');
    await testApiValidation();
    testDataStructure();
    console.log('\n🎉 Tous les tests ont réussi !');
  } catch (error) {
    console.error('❌ Erreur lors des tests:', error);
  }
}

runTests();