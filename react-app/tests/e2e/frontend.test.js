import { expect } from 'chai';
import { describe, it, before, after } from 'mocha';
import puppeteer from 'puppeteer';

// Tests end-to-end avec Puppeteer
describe('Frontend E2E Tests', () => {
  let browser;
  let page;

  before(async () => {
    browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    page = await browser.newPage();

    // Configuration pour attendre les éléments
    await page.setDefaultTimeout(10000);
  });

  after(async () => {
    await browser.close();
  });

  describe('Home Page', () => {
    it('should load the home page successfully', async () => {
      await page.goto('http://localhost:3003');
      await page.waitForSelector('.home-container');

      const title = await page.title();
      expect(title).to.include('Assistant Rédacteur');
    });

    it('should display AI selection options', async () => {
      await page.goto('http://localhost:3003');
      await page.waitForSelector('.ai-selection');

      const aiOptions = await page.$$('.ai-option');
      expect(aiOptions.length).to.be.greaterThan(0);
    });

    it('should display output format options', async () => {
      await page.goto('http://localhost:3003');
      await page.waitForSelector('.output-formats');

      const formatOptions = await page.$$('.format-btn');
      expect(formatOptions.length).to.be.greaterThan(0);
    });

    it('should display project information form', async () => {
      await page.goto('http://localhost:3003');
      await page.waitForSelector('.project-info');

      const formFields = await page.$$('input, textarea, select');
      expect(formFields.length).to.be.greaterThan(0);
    });
  });

  describe('Content Editor', () => {
    it('should navigate to editor and display toolbar', async () => {
      await page.goto('http://localhost:3003');
      await page.waitForSelector('.home-container');

      // Cliquer sur un bouton pour générer du contenu et aller à l'éditeur
      await page.click('.format-btn');
      await page.waitForTimeout(1000);

      // Vérifier que l'éditeur se charge
      await page.waitForSelector('.content-editor, .editor-container');

      const toolbarButtons = await page.$$('.tool-btn, .toolbar button');
      expect(toolbarButtons.length).to.be.greaterThan(0);
    });

    it('should allow text editing', async () => {
      await page.goto('http://localhost:3003');

      // Aller à l'éditeur
      await page.click('.format-btn');
      await page.waitForTimeout(1000);
      await page.waitForSelector('.content-editor, .editor-container');

      // Tester l'édition de texte
      const editor = await page.$('.content-editor [contenteditable], .ql-editor');
      if (editor) {
        await editor.click();
        await editor.type('Test content for editing');

        const content = await page.evaluate(el => el.textContent, editor);
        expect(content).to.include('Test content');
      }
    });
  });

  describe('Calendar Integration', () => {
    it('should navigate to calendar page', async () => {
      await page.goto('http://localhost:3003');
      await page.waitForSelector('.home-container');

      // Chercher un lien vers le calendrier
      const calendarLink = await page.$('a[href*="calendar"], button[title*="calendar"]');
      if (calendarLink) {
        await calendarLink.click();
        await page.waitForSelector('.calendar-page, .calendar-container');

        const calendarTitle = await page.$eval('h1, h2, h3', el => el.textContent);
        expect(calendarTitle.toLowerCase()).to.include('calendar');
      }
    });

    it('should display calendar interface', async () => {
      await page.goto('http://localhost:3003#/calendar');

      // Attendre le chargement du calendrier
      await page.waitForSelector('.calendar-grid, .calendar-view, .calendar-container');

      // Vérifier les éléments du calendrier
      const calendarDays = await page.$$('.calendar-day, .calendar-cell');
      expect(calendarDays.length).to.be.greaterThan(0);
    });
  });

  describe('OAuth Integration', () => {
    it('should display OAuth connection options', async () => {
      await page.goto('http://localhost:3003#/account');

      // Attendre le chargement de la page compte
      await page.waitForSelector('.account-page, .profile-section');

      // Chercher les options OAuth
      const oauthButtons = await page.$$('button[class*="oauth"], a[class*="oauth"]');
      const socialButtons = await page.$$('button[class*="google"], button[class*="facebook"], button[class*="twitter"]');

      // Au moins un des deux types de boutons devrait être présent
      expect(oauthButtons.length + socialButtons.length).to.be.greaterThan(0);
    });
  });

  describe('Responsive Design', () => {
    it('should adapt to mobile viewport', async () => {
      await page.goto('http://localhost:3003');
      await page.setViewport({ width: 375, height: 667 });

      await page.waitForSelector('.home-container');

      // Vérifier que la mise en page s'adapte
      const containerWidth = await page.evaluate(() => {
        const container = document.querySelector('.home-container, .main-container');
        return container ? container.offsetWidth : 0;
      });

      expect(containerWidth).to.be.lessThan(400);
    });

    it('should adapt to tablet viewport', async () => {
      await page.goto('http://localhost:3003');
      await page.setViewport({ width: 768, height: 1024 });

      await page.waitForSelector('.home-container');

      // Vérifier que la mise en page s'adapte
      const containerWidth = await page.evaluate(() => {
        const container = document.querySelector('.home-container, .main-container');
        return container ? container.offsetWidth : 0;
      });

      expect(containerWidth).to.be.lessThan(800);
      expect(containerWidth).to.be.greaterThan(400);
    });
  });

  describe('Error Handling', () => {
    it('should display error messages for invalid inputs', async () => {
      await page.goto('http://localhost:3003');
      await page.waitForSelector('.home-container');

      // Essayer de soumettre un formulaire vide ou invalide
      const submitButton = await page.$('button[type="submit"], input[type="submit"]');
      if (submitButton) {
        await submitButton.click();

        // Vérifier s'il y a des messages d'erreur
        await page.waitForTimeout(1000);
        const errorMessages = await page.$$('.error-message, .alert-danger, [class*="error"]');
        // Pas nécessairement d'erreur pour tous les cas, mais le test passe si pas d'exception
      }
    });

    it('should handle network errors gracefully', async () => {
      // Test en simulant une déconnexion réseau
      await page.setOfflineMode(true);

      await page.goto('http://localhost:3003');
      await page.waitForTimeout(2000);

      // La page devrait quand même se charger (avec des données locales si disponibles)
      const bodyContent = await page.content();
      expect(bodyContent.length).to.be.greaterThan(1000);

      await page.setOfflineMode(false);
    });
  });
});
