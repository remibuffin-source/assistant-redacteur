// Application JavaScript pour l'Assistant Rédactionnel

class AssistantRedacteur {
    constructor() {
        this.selectedAI = null;
        this.currentTheme = 'dark';
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadTheme();
        this.setupAISelection();
    }

    setupEventListeners() {
        // Sélection d'IA
        document.querySelectorAll('.ai-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.selectAI(e.target));
        });

        // Bouton de génération
        const generateBtn = document.querySelector('.generate-btn');
        if (generateBtn) {
            generateBtn.addEventListener('click', () => this.generateContent());
        }

        // Toggle du thème
        const themeToggle = document.querySelector('.theme-toggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', () => this.toggleTheme());
        }

        // Gestion des entrées
        this.setupInputHandlers();
    }

    setupAISelection() {
        document.querySelectorAll('.ai-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.ai-btn').forEach(b => b.classList.remove('selected'));
                btn.classList.add('selected');
                this.selectedAI = btn.dataset.ai;
                console.log('IA sélectionnée:', this.selectedAI);
            });
        });
    }

    selectAI(element) {
        // Trouver le bouton parent si on clique sur l'icône
        const btn = element.closest('.ai-btn') || element;
        
        document.querySelectorAll('.ai-btn').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        this.selectedAI = btn.dataset.ai;
        
        console.log('IA sélectionnée:', this.selectedAI);
    }

    async generateContent() {
        if (!this.selectedAI) {
            this.showAlert('Veuillez sélectionner une IA', 'error');
            return;
        }

        const projectTitle = document.getElementById('projectTitle').value;
        const targetAudience = document.getElementById('targetAudience').value;
        const projectDescription = document.getElementById('projectDescription').value;
        const contentInput = document.getElementById('contentInput').value;

        if (!contentInput) {
            this.showAlert('Veuillez entrer du contenu à traiter', 'error');
            return;
        }

        // Afficher le loader
        this.showLoader();

        try {
            // Simulation d'appel API
            const result = await this.simulateAICall({
                ai: this.selectedAI,
                title: projectTitle,
                audience: targetAudience,
                description: projectDescription,
                content: contentInput
            });

            this.displayResult(result);
        } catch (error) {
            this.showAlert('Erreur lors de la génération: ' + error.message, 'error');
        } finally {
            this.hideLoader();
        }
    }

    async simulateAICall(data) {
        // Simulation d'un délai d'API
        await new Promise(resolve => setTimeout(resolve, 2000));

        return {
            success: true,
            content: `
# Résultat généré par ${data.ai.toUpperCase()}

## Projet: ${data.title || 'Sans titre'}

### Public cible: ${data.audience || 'Non spécifié'}

### Description: ${data.description || 'Aucune description'}

---

## Contenu généré:

${this.generateSampleContent(data.ai, data.content)}

---

*Généré le ${new Date().toLocaleString('fr-FR')}*
*IA utilisée: ${data.ai.toUpperCase()}*
            `.trim()
        };
    }

    generateSampleContent(aiType, inputContent) {
        const templates = {
            claude: `En tant qu'assistant rédactionnel Claude, j'ai analysé votre contenu et voici ma proposition :

**Analyse du contenu source:**
- Longueur: ${inputContent.length} caractères
- Complexité: ${inputContent.split(' ').length > 100 ? 'Élevée' : 'Moyenne'}

**Recommandations:**
1. Structurez votre contenu en sections claires
2. Utilisez un langage adapté à votre public cible
3. Ajoutez des appels à l'action pertinents

**Contenu optimisé:**
${inputContent.slice(0, 200)}... [contenu développé et optimisé]`,

            gpt4: `**GPT-4 Analysis Complete**

📊 **Statistiques:**
- Mots: ${inputContent.split(' ').length}
- Score de lisibilité: 75/100
- Ton: Professionnel

🎯 **Suggestions d'amélioration:**
- Ajouter des sous-titres
- Renforcer les arguments principaux
- Optimiser pour le référencement

💡 **Contenu généré:**
${inputContent.slice(0, 150)}... [version améliorée avec insights IA]`,

            gemini: `**Gemini Pro - Rapport de génération**

🔍 **Analyse sémantique:**
- Thèmes principaux identifiés
- Sentiment: Positif
- Complexité: Modérée

🚀 **Recommandations:**
- Structure hiérarchique recommandée
- Mots-clés à inclure
- Longueur idéale: 500-800 mots

📝 **Résultat:**
${inputContent.slice(0, 180)}... [contenu restructuré et enrichi]`
        };

        return templates[aiType] || `Contenu généré par ${aiType}:\n\n${inputContent}`;
    }

    displayResult(result) {
        const resultArea = document.getElementById('resultArea');
        if (resultArea && result.success) {
            resultArea.innerHTML = `
                <div class="alert alert-success">
                    <i class="fas fa-check-circle"></i>
                    Contenu généré avec succès!
                </div>
                <div class="result-content">
                    <pre>${result.content}</pre>
                </div>
                <div class="result-actions">
                    <button class="btn btn-secondary" onclick="app.copyToClipboard()">
                        <i class="fas fa-copy"></i> Copier
                    </button>
                    <button class="btn btn-secondary" onclick="app.downloadResult()">
                        <i class="fas fa-download"></i> Télécharger
                    </button>
                </div>
            `;
        }
    }

    showLoader() {
        const generateBtn = document.querySelector('.generate-btn');
        if (generateBtn) {
            generateBtn.innerHTML = '<div class="loader"></div> Génération en cours...';
            generateBtn.disabled = true;
        }
    }

    hideLoader() {
        const generateBtn = document.querySelector('.generate-btn');
        if (generateBtn) {
            generateBtn.innerHTML = '<i class="fas fa-magic"></i> Générer le contenu';
            generateBtn.disabled = false;
        }
    }

    showAlert(message, type = 'info') {
        // Créer ou mettre à jour l'alerte
        let alertDiv = document.querySelector('.alert');
        if (!alertDiv) {
            alertDiv = document.createElement('div');
            alertDiv.className = `alert alert-${type}`;
            document.querySelector('.main-container').prepend(alertDiv);
        }

        alertDiv.className = `alert alert-${type}`;
        alertDiv.innerHTML = `
            <i class="fas fa-${this.getAlertIcon(type)}"></i>
            ${message}
        `;

        // Auto-dismiss après 5 secondes
        setTimeout(() => {
            if (alertDiv) {
                alertDiv.remove();
            }
        }, 5000);
    }

    getAlertIcon(type) {
        const icons = {
            success: 'check-circle',
            error: 'exclamation-circle',
            warning: 'exclamation-triangle',
            info: 'info-circle'
        };
        return icons[type] || 'info-circle';
    }

    toggleTheme() {
        this.currentTheme = this.currentTheme === 'dark' ? 'light' : 'dark';
        document.body.setAttribute('data-theme', this.currentTheme);
        localStorage.setItem('theme', this.currentTheme);
        
        // Mettre à jour l'icône du toggle
        const themeToggle = document.querySelector('.theme-toggle i');
        if (themeToggle) {
            themeToggle.className = this.currentTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
        }
    }

    loadTheme() {
        const savedTheme = localStorage.getItem('theme') || 'dark';
        this.currentTheme = savedTheme;
        document.body.setAttribute('data-theme', this.currentTheme);
        
        // Mettre à jour l'icône du toggle
        const themeToggle = document.querySelector('.theme-toggle i');
        if (themeToggle) {
            themeToggle.className = this.currentTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
        }
    }

    copyToClipboard() {
        const resultContent = document.querySelector('.result-content pre');
        if (resultContent) {
            navigator.clipboard.writeText(resultContent.textContent)
                .then(() => this.showAlert('Contenu copié dans le presse-papier!', 'success'))
                .catch(err => this.showAlert('Erreur lors de la copie', 'error'));
        }
    }

    downloadResult() {
        const resultContent = document.querySelector('.result-content pre');
        if (resultContent) {
            const blob = new Blob([resultContent.textContent], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `contenu-genere-${new Date().toISOString().split('T')[0]}.txt`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            this.showAlert('Fichier téléchargé avec succès!', 'success');
        }
    }

    setupInputHandlers() {
        // Auto-sauvegarde des champs
        const inputs = document.querySelectorAll('input, textarea');
        inputs.forEach(input => {
            input.addEventListener('input', () => {
                this.autoSave();
            });
        });
    }

    autoSave() {
        const data = {
            projectTitle: document.getElementById('projectTitle').value,
            targetAudience: document.getElementById('targetAudience').value,
            projectDescription: document.getElementById('projectDescription').value,
            contentInput: document.getElementById('contentInput').value,
            selectedAI: this.selectedAI,
            timestamp: new Date().toISOString()
        };

        localStorage.setItem('assistantRedacteur_autoSave', JSON.stringify(data));
    }

    loadAutoSave() {
        const saved = localStorage.getItem('assistantRedacteur_autoSave');
        if (saved) {
            try {
                const data = JSON.parse(saved);
                document.getElementById('projectTitle').value = data.projectTitle || '';
                document.getElementById('targetAudience').value = data.targetAudience || '';
                document.getElementById('projectDescription').value = data.projectDescription || '';
                document.getElementById('contentInput').value = data.contentInput || '';
                
                if (data.selectedAI) {
                    const aiBtn = document.querySelector(`[data-ai="${data.selectedAI}"]`);
                    if (aiBtn) {
                        aiBtn.click();
                    }
                }
            } catch (error) {
                console.error('Erreur lors du chargement de la sauvegarde:', error);
            }
        }
    }
}

// Initialisation de l'application
const app = new AssistantRedacteur();

// Charger la sauvegarde automatique au démarrage
document.addEventListener('DOMContentLoaded', () => {
    app.loadAutoSave();
});

// Exposer l'application globalement pour les fonctions inline
window.app = app;