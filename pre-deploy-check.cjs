#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔍 Vérification pré-déploiement Assistant Rédacteur\n');

// Couleurs pour la sortie console
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m'
};

function logSuccess(message) {
  console.log(`${colors.green}✅ ${message}${colors.reset}`);
}

function logError(message) {
  console.log(`${colors.red}❌ ${message}${colors.reset}`);
}

function logWarning(message) {
  console.log(`${colors.yellow}⚠️  ${message}${colors.reset}`);
}

function logInfo(message) {
  console.log(`${colors.blue}ℹ️  ${message}${colors.reset}`);
}

function runCommand(command, description) {
  try {
    console.log(`${colors.bright}${description}...${colors.reset}`);
    const result = execSync(command, { 
      cwd: process.cwd(),
      encoding: 'utf-8',
      stdio: 'pipe'
    });
    logSuccess(`${description} terminé avec succès`);
    return { success: true, output: result };
  } catch (error) {
    logError(`${description} a échoué`);
    return { 
      success: false, 
      error: error.message,
      stdout: error.stdout,
      stderr: error.stderr
    };
  }
}

// Vérification des fichiers essentiels
function checkEssentialFiles() {
  console.log('\n📁 Vérification des fichiers essentiels:');
  
  const essentialFiles = [
    'package.json',
    'vite.config.js',
    'src/App.jsx',
    'src/styles/global.css',
    '.github/workflows/ci-cd.yml',
    'jest.config.cjs',
    'babel.config.cjs',
    'eslint.config.js'
  ];
  
  let allFilesExist = true;
  
  essentialFiles.forEach(file => {
    if (fs.existsSync(file)) {
      logSuccess(`${file} présent`);
    } else {
      logError(`${file} manquant`);
      allFilesExist = false;
    }
  });
  
  return allFilesExist;
}

// Vérification des dépendances
function checkDependencies() {
  console.log('\n📦 Vérification des dépendances:');
  
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf-8'));
  const requiredDeps = ['react', 'react-dom', 'vite', '@vitejs/plugin-react'];
  const requiredDevDeps = ['jest', '@testing-library/react', 'eslint', 'babel-jest'];
  
  let allDepsOk = true;
  
  requiredDeps.forEach(dep => {
    if (packageJson.dependencies && packageJson.dependencies[dep]) {
      logSuccess(`${dep}: ${packageJson.dependencies[dep]}`);
    } else {
      logError(`${dep} manquant dans dependencies`);
      allDepsOk = false;
    }
  });
  
  requiredDevDeps.forEach(dep => {
    if (packageJson.devDependencies && packageJson.devDependencies[dep]) {
      logSuccess(`${dep}: ${packageJson.devDependencies[dep]}`);
    } else {
      logError(`${dep} manquant dans devDependencies`);
      allDepsOk = false;
    }
  });
  
  return allDepsOk;
}

// Vérification des scripts npm
function checkNpmScripts() {
  console.log('\n⚡ Vérification des scripts npm:');
  
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf-8'));
  const requiredScripts = ['dev', 'build', 'test', 'lint', 'preview'];
  
  let allScriptsOk = true;
  
  requiredScripts.forEach(script => {
    if (packageJson.scripts && packageJson.scripts[script]) {
      logSuccess(`npm run ${script}: présent`);
    } else {
      logError(`npm run ${script}: manquant`);
      allScriptsOk = false;
    }
  });
  
  return allScriptsOk;
}

// Vérification GitHub Actions
function checkGitHubActions() {
  console.log('\n🚀 Vérification GitHub Actions:');
  
  const workflowPath = '.github/workflows/ci-cd.yml';
  if (fs.existsSync(workflowPath)) {
    const workflowContent = fs.readFileSync(workflowPath, 'utf-8');
    
    const checks = [
      { name: 'Workflow présent', condition: true },
      { name: 'Déclenchement sur push', condition: workflowContent.includes('on:') && workflowContent.includes('push:') },
      { name: 'Déclenchement sur PR', condition: workflowContent.includes('pull_request:') },
      { name: 'Job test présent', condition: workflowContent.includes('test:') },
      { name: 'Job build présent', condition: workflowContent.includes('build:') }
    ];
    
    let allChecksOk = true;
    
    checks.forEach(check => {
      if (check.condition) {
        logSuccess(check.name);
      } else {
        logError(check.name);
        allChecksOk = false;
      }
    });
    
    return allChecksOk;
  } else {
    logError('Fichier workflow CI/CD manquant');
    return false;
  }
}

// Fonction principale
async function main() {
  console.log(`${colors.bright}=== VÉRIFICATION COMPLÈTE PRÉ-DÉPLOIEMENT ===${colors.reset}\n`);
  
  const results = {
    files: checkEssentialFiles(),
    dependencies: checkDependencies(),
    scripts: checkNpmScripts(),
    githubActions: checkGitHubActions()
  };
  
  console.log('\n🧪 Exécution des tests techniques:');
  
  const technicalTests = [
    runCommand('npm run lint', 'Linting ESLint'),
    runCommand('npm run build', 'Build de production'),
    runCommand('npm test -- --passWithNoTests --silent', 'Tests Jest')
  ];
  
  results.lint = technicalTests[0].success;
  results.build = technicalTests[1].success;
  results.test = technicalTests[2].success;
  
  // Résumé final
  console.log(`\n${colors.bright}=== RÉSUMÉ FINAL ===${colors.reset}`);
  
  const totalChecks = Object.keys(results).length;
  const passedChecks = Object.values(results).filter(Boolean).length;
  
  console.log(`📊 Checks passés: ${passedChecks}/${totalChecks}`);
  
  if (passedChecks === totalChecks) {
    logSuccess('🎉 Tous les checks sont passés! Prêt pour le déploiement GitHub');
    console.log('\n📋 Prochaines étapes:');
    console.log('1. git add .');
    console.log('2. git commit -m "feat: implémentation complète avec CI/CD"');
    console.log('3. git push origin main');
    console.log('4. Vérifier les Actions GitHub sur le repository');
  } else {
    logWarning('⚠️  Certains checks ont échoué. Corrigez les problèmes avant le déploiement.');
    
    Object.entries(results).forEach(([check, success]) => {
      if (!success) {
        logError(`Problème détecté: ${check}`);
      }
    });
    
    process.exit(1);
  }
}

// Gestion des erreurs
process.on('uncaughtException', (error) => {
  logError(`Erreur inattendue: ${error.message}`);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logError(`Promesse rejetée: ${reason}`);
  process.exit(1);
});

// Exécution
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { main };