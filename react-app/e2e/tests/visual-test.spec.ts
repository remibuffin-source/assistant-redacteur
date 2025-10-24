import { test, expect } from '@playwright/test';

test('Capture screenshot de l\'interface Assistant Rédacteur', async ({ page }) => {
  // Aller sur l'application
  await page.goto('http://localhost:3003/');
  
  // Attendre que l'application soit chargée
  await page.waitForLoadState('networkidle');
  
  // Prendre un screenshot de la page d'accueil
  await page.screenshot({ 
    path: 'screenshot-home.png',
    fullPage: true 
  });
  
  // Naviguer vers différentes pages et capturer des screenshots
  const pagesToTest = [
    { name: 'mon-compte', selector: 'text=Mon Compte' },
    { name: 'config-api', selector: 'text=Config API' },
    { name: 'calendrier', selector: 'text=Calendrier' },
    { name: 'resultats', selector: 'text=Résultats' }
  ];
  
  for (const pageConfig of pagesToTest) {
    try {
      await page.click(pageConfig.selector);
      await page.waitForTimeout(1000); // Attendre l'animation
      await page.screenshot({ 
        path: `screenshot-${pageConfig.name}.png`,
        fullPage: true 
      });
    } catch (error) {
      console.log(`Page ${pageConfig.name} non accessible: ${error}`);
    }
  }
  
  console.log('Screenshots capturés avec succès !');
});