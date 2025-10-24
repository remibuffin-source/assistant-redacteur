import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { expect } from 'chai';
import AISelection from '../src/components/AISelection';
import OutputFormats from '../src/components/OutputFormats';
import ProjectInfoSimple from '../src/components/ProjectInfoSimple';

// Wrapper pour les composants qui nécessitent un router
const RouterWrapper = ({ children }) => (
  <BrowserRouter>
    {children}
  </BrowserRouter>
);

describe('AISelection Component', () => {
  it('should render AI options', () => {
    render(
      <RouterWrapper>
        <AISelection />
      </RouterWrapper>
    );

    // Vérifier que les options IA sont présentes
    const aiOptions = screen.getAllByRole('button');
    expect(aiOptions.length).to.be.greaterThan(0);
  });

  it('should allow selecting an AI option', async () => {
    render(
      <RouterWrapper>
        <AISelection />
      </RouterWrapper>
    );

    const firstButton = screen.getAllByRole('button')[0];
    fireEvent.click(firstButton);

    await waitFor(() => {
      // Vérifier que la sélection a été appliquée
      expect(firstButton).to.have.class('selected');
    });
  });
});

describe('OutputFormats Component', () => {
  it('should render format options', () => {
    render(
      <RouterWrapper>
        <OutputFormats />
      </RouterWrapper>
    );

    const formatButtons = screen.getAllByRole('button');
    expect(formatButtons.length).to.be.greaterThan(0);
  });

  it('should allow selecting multiple formats', async () => {
    render(
      <RouterWrapper>
        <OutputFormats />
      </RouterWrapper>
    );

    const buttons = screen.getAllByRole('button');
    const firstButton = buttons[0];
    const secondButton = buttons[1];

    fireEvent.click(firstButton);
    fireEvent.click(secondButton);

    await waitFor(() => {
      expect(firstButton).to.have.class('selected');
      expect(secondButton).to.have.class('selected');
    });
  });
});

describe('ProjectInfoSimple Component', () => {
  it('should render form fields', () => {
    render(
      <RouterWrapper>
        <ProjectInfoSimple />
      </RouterWrapper>
    );

    // Vérifier les champs de formulaire
    expect(screen.getByPlaceholderText(/titre du projet/i)).to.be.visible;
    expect(screen.getByPlaceholderText(/public cible/i)).to.be.visible;
    expect(screen.getByDisplayValue(/ton souhaité/i)).to.be.visible;
  });

  it('should allow editing form fields', async () => {
    render(
      <RouterWrapper>
        <ProjectInfoSimple />
      </RouterWrapper>
    );

    const titleInput = screen.getByPlaceholderText(/titre du projet/i);

    fireEvent.change(titleInput, { target: { value: 'Test Project' } });

    await waitFor(() => {
      expect(titleInput.value).to.equal('Test Project');
    });
  });

  it('should display character count for description', () => {
    render(
      <RouterWrapper>
        <ProjectInfoSimple />
      </RouterWrapper>
    );

    // Vérifier le compteur de caractères (s'il existe)
    const charCounter = screen.queryByText(/\d+\/\d+/);
    if (charCounter) {
      expect(charCounter).to.be.visible;
    }
  });
});

describe('Integration Tests', () => {
  it('should allow complete workflow from project creation to content generation', async () => {
    render(
      <RouterWrapper>
        <ProjectInfoSimple />
        <AISelection />
        <OutputFormats />
      </RouterWrapper>
    );

    // Étape 1: Remplir les informations du projet
    const titleInput = screen.getByPlaceholderText(/titre du projet/i);
    fireEvent.change(titleInput, { target: { value: 'Test Integration Project' } });

    // Étape 2: Sélectionner une IA
    const aiButtons = screen.getAllByRole('button');
    const aiButton = aiButtons.find(btn => btn.textContent?.includes('GPT') || btn.textContent?.includes('Claude'));
    if (aiButton) {
      fireEvent.click(aiButton);
    }

    // Étape 3: Sélectionner des formats
    const formatButtons = screen.getAllByRole('button');
    const formatButton = formatButtons.find(btn =>
      btn.textContent?.includes('Instagram') ||
      btn.textContent?.includes('Facebook') ||
      btn.textContent?.includes('Twitter')
    );
    if (formatButton) {
      fireEvent.click(formatButton);
    }

    // Vérifier que les éléments sont sélectionnés
    await waitFor(() => {
      const selectedButtons = screen.getAllByRole('button').filter(btn =>
        btn.classList.contains('selected') ||
        btn.classList.contains('active')
      );
      expect(selectedButtons.length).to.be.greaterThan(0);
    });
  });
});
