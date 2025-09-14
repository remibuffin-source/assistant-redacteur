// Test du service AI pour vérifier le fonctionnement
import { AIService } from './src/services/aiService.js';

async function testAIService() {
  console.log('🧪 Test du service AI...');
  
  // Test 1: Simulation basique
  console.log('\n1. Test de simulation:');
  try {
    const result = await AIService.simulateAICall('gpt4', {
      content: 'Test content for AI processing',
      title: 'Test Project'
    });
    console.log('✅ Simulation réussie:', result.success);
    console.log('📝 Contenu généré:', result.content.substring(0, 100) + '...');
  } catch (error) {
    console.error('❌ Erreur simulation:', error.message);
  }

  // Test 2: Génération de contenu
  console.log('\n2. Test de génération:');
  try {
    const result = await AIService.generateContent('gpt4', {
      content: 'This is a test content for AI processing.',
      title: 'Test Project',
      audience: 'Developers',
      tone: 'Professional',
      description: 'A test project for AI content generation'
    });
    console.log('✅ Génération réussie:', result.success);
    if (result.content) {
      console.log('📝 Longueur du contenu:', result.content.length, 'caractères');
    }
    if (result.error) {
      console.log('⚠️  Erreur (attendue sans clé API):', result.error);
    }
  } catch (error) {
    console.error('❌ Erreur génération:', error.message);
  }

  // Test 3: Construction de prompt
  console.log('\n3. Test de construction de prompt:');
  const prompt = AIService.buildOpenAIPrompt({
    title: 'Test Project',
    audience: 'Developers',
    tone: 'Professional',
    description: 'Test description',
    content: 'Test content for AI processing',
    tasks: ['rewrite', 'optimize'],
    format: 'markdown'
  });
  console.log('✅ Prompt construit:', prompt.substring(0, 150) + '...');
  console.log('📏 Longueur du prompt:', prompt.length, 'caractères');

  console.log('\n🎉 Tests terminés!');
  console.log('\n📋 Prochaines étapes:');
  console.log('1. Configurez vos clés API dans react-app/.env.local');
  console.log('2. Décommentez le code des appels réels dans aiService.js');
  console.log('3. Testez avec des clés API valides');
}

// Exécution du test
testAIService().catch(console.error);