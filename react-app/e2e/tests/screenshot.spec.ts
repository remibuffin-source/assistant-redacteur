import { test, expect } from '@playwright/test';

test('Capture screenshots de l\'interface', async ({ page }) => {
  // Aller sur l'application
  await page.goto('/');
  
  // Attendre que l'application soit chargée
  await page.waitForLoadState('networkidle');
  
  // Prendre un screenshot de la page d'accueil
  await page.screenshot({ 
    path: 'screenshot-home.png',
    fullPage: true 
  });
  
  console.log('Screenshot de la page d\'accueil capturé !');
  
  // Test simple pour vérifier que l'application fonctionne
  await expect(page.locator('body')).toBeVisible();
  console.log('Application chargée avec succès !');
});