import React from 'react';
import './PolitiqueCGV.css';

const PolitiqueCGV = () => {
  return (
    <div className="politique-cgv-container">
      <div className="politique-cgv-content">
        <h1 className="politique-cgv-title">Politique de Confidentialité & Conditions d'Utilisation</h1>
        <p className="politique-subtitle"><strong>Assistant Rédacteur — Studio du Cap Brun</strong></p>
        <p className="politique-date"><em>Dernière mise à jour : janvier 2026</em></p>

        <h2 className="partie-title">PARTIE 1 : POLITIQUE DE CONFIDENTIALITÉ</h2>

        <section className="politique-section">
          <h2>1. Introduction</h2>
          <p>
            Assistant Rédacteur est une plateforme SaaS permettant la création, la planification et la publication de contenus sur les réseaux sociaux, 
            y compris Facebook et Instagram via les APIs officielles de Meta Platforms, Inc.
          </p>
          <p>
            Cette politique s'applique à l'utilisation de notre application et de nos intégrations tierces (Meta, TikTok, Youtube, Discord, X, LinkedIn, etc.) 
            qui agissent comme intermédiaires techniques OAuth pour connecter les comptes professionnels de nos utilisateurs à notre plateforme.
          </p>
          <p>Nous nous engageons à protéger vos données personnelles et à être transparents sur leur utilisation.</p>
        </section>

        <section className="politique-section">
          <h2>2. Données collectées</h2>
          <h3>2.1 Données de compte</h3>
          <ul>
            <li>Adresse email (pour l'authentification et les communications)</li>
            <li>Nom d'utilisateur</li>
            <li>Mot de passe (stocké sous forme chiffrée, jamais en clair)</li>
          </ul>

          <h3>2.2 Données liées aux intégrations réseaux sociaux</h3>
          <ul>
            <li><strong>Tokens d'accès OAuth</strong> : générés par les plateformes tierces (Meta, TikTok, Youtube, Discord, X, etc.) lors de la connexion. 
            Ces tokens sont stockés de manière chiffrée (AES-256) et utilisés uniquement pour publier du contenu au nom de l'utilisateur.</li>
            <li><strong>Identifiants de Pages/Comptes</strong> : pour associer les publications aux bons comptes professionnels.</li>
            <li><strong>Métadonnées techniques</strong> : horodatages de publication, statut des publications (succès/erreur).</li>
          </ul>

          <h3>2.3 Données non collectées</h3>
          <ul>
            <li>Aucune donnée de profil utilisateur des réseaux sociaux</li>
            <li>Aucun message privé</li>
            <li>Aucun contenu non-public</li>
            <li>Aucune donnée de navigation ou de tracking publicitaire</li>
          </ul>
        </section>

        <section className="politique-section">
          <h2>3. Utilisation des données</h2>
          <p>Vos données sont utilisées exclusivement pour :</p>
          <ul>
            <li>Vous authentifier sur notre plateforme</li>
            <li>Publier du contenu sur vos comptes sociaux connectés</li>
            <li>Vous envoyer des notifications liées à votre utilisation du service</li>
            <li>Améliorer nos services (statistiques anonymisées)</li>
          </ul>
          <p><strong>Nous ne vendons, ne louons et ne partageons JAMAIS vos données personnelles avec des tiers à des fins commerciales.</strong></p>
        </section>

        <section className="politique-section">
          <h2>4. Permissions demandées aux plateformes tierces en votre nom</h2>
          <h3>Facebook Pages</h3>
          <ul>
            <li><code>pages_manage_posts</code> : publier du contenu sur les Pages connectées</li>
            <li><code>pages_read_engagement</code> : lire les statistiques de vos publications</li>
          </ul>

          <h3>Instagram Business/Creator</h3>
          <ul>
            <li><code>instagram_basic</code> : accès aux informations de base du compte</li>
            <li><code>instagram_content_publish</code> : publier du contenu sur le compte Instagram</li>
          </ul>

          <h3>Discord</h3>
          <ul>
            <li><code>bot</code> : publier des messages sur les serveurs autorisés</li>
            <li><code>identify</code> : identifier l'utilisateur connecté</li>
          </ul>

          <p>Ces permissions sont strictement nécessaires au fonctionnement du service et ne sont jamais utilisées à d'autres fins.</p>
        </section>

        <section className="politique-section">
          <h2>5. Stockage et sécurité</h2>
          <ul>
            <li>Les données sont hébergées sur des serveurs sécurisés en France et en Europe</li>
            <li>Les tokens d'accès sont chiffrés avec l'algorithme AES-256</li>
            <li>Les mots de passe sont hachés avec bcrypt</li>
            <li>Les communications sont chiffrées via HTTPS/TLS</li>
            <li>Nous effectuons des sauvegardes régulières</li>
          </ul>
        </section>

        <section className="politique-section">
          <h2>6. Conservation des données</h2>
          <ul>
            <li><strong>Données de compte</strong> : conservées tant que votre compte est actif, puis supprimées dans les 30 jours suivant la clôture</li>
            <li><strong>Tokens d'accès</strong> : supprimés immédiatement lors de la déconnexion d'un réseau social</li>
            <li><strong>Logs techniques</strong> : conservés 12 mois maximum</li>
          </ul>
        </section>

        <section className="politique-section">
          <h2>7. Vos droits (RGPD)</h2>
          <p>Conformément au Règlement Général sur la Protection des Données (RGPD), vous disposez des droits suivants :</p>
          <ul>
            <li><strong>Droit d'accès</strong> : obtenir une copie de vos données personnelles</li>
            <li><strong>Droit de rectification</strong> : corriger des données inexactes</li>
            <li><strong>Droit à l'effacement</strong> : demander la suppression de vos données</li>
            <li><strong>Droit à la portabilité</strong> : recevoir vos données dans un format structuré</li>
            <li><strong>Droit d'opposition</strong> : vous opposer à certains traitements</li>
            <li><strong>Droit de retrait du consentement</strong> : retirer votre consentement à tout moment</li>
          </ul>
          <p>Pour exercer ces droits, contactez-nous à : <span className="email-protected">support [at] assistant-redacteur.fr</span></p>
        </section>

        <section className="politique-section">
          <h2>8. Cookies</h2>
          <p>
            Notre plateforme utilise uniquement des cookies techniques essentiels au fonctionnement du service (authentification, préférences). 
            Nous n'utilisons pas de cookies publicitaires ou de tracking.
          </p>
        </section>

        <section className="politique-section">
          <h2>9. Modifications de cette politique</h2>
          <p>
            Nous pouvons mettre à jour cette politique. En cas de modification substantielle, vous serez informé par email ou via une notification sur la plateforme.
          </p>
        </section>

        <h2 className="partie-title">PARTIE 2 : CONDITIONS GÉNÉRALES D'UTILISATION ET DE VENTE</h2>

        <section className="politique-section">
          <h2>Article 1 : Objet et champ d'application</h2>
          <p>
            Les présentes conditions générales régissent l'utilisation de la plateforme Assistant Rédacteur et les transactions conclues via celle-ci.
          </p>
          <p>
            Est considéré comme « Utilisateur » toute personne physique ou morale créant un compte et utilisant nos services.
          </p>
          <p>
            Assistant Rédacteur fournit des services d'assistance à la rédaction de contenu via intelligence artificielle et de gestion de publication sur les réseaux sociaux.
          </p>
        </section>

        <section className="politique-section">
          <h2>Article 2 : Acceptation des conditions</h2>
          <p>
            L'utilisation de nos services implique l'acceptation pleine et entière des présentes conditions. Si vous n'acceptez pas ces conditions, 
            vous ne devez pas utiliser nos services.
          </p>
        </section>

        <section className="politique-section">
          <h2>Article 3 : Inscription et compte utilisateur</h2>
          <h3>3.1 Conditions d'inscription</h3>
          <ul>
            <li>L'inscription est réservée aux personnes majeures (18 ans ou plus)</li>
            <li>Les mineurs peuvent utiliser le service avec l'autorisation et sous la responsabilité de leurs parents ou tuteurs légaux</li>
            <li>Vous devez fournir des informations exactes et les maintenir à jour</li>
          </ul>

          <h3>3.2 Sécurité du compte</h3>
          <ul>
            <li>Vous êtes responsable de la confidentialité de vos identifiants</li>
            <li>Vous devez nous signaler immédiatement toute utilisation non autorisée de votre compte</li>
            <li>Nous ne sommes pas responsables des dommages résultant d'un accès non autorisé à votre compte</li>
          </ul>
        </section>

        <section className="politique-section">
          <h2>Article 4 : Description des services</h2>
          <p>Assistant Rédacteur propose :</p>
          <ul>
            <li>La génération humaine de contenu assistée par intelligence artificielle</li>
            <li>L'édition humaine de ce contenu</li>
            <li>La planification et la publication sur les réseaux sociaux</li>
            <li>Le stockage et la gestion de vos contenus</li>
            <li>Des outils de collaboration (selon la formule)</li>
          </ul>
          <p>Les fonctionnalités disponibles dépendent de votre formule d'abonnement.</p>
        </section>

        <section className="politique-section">
          <h2>Article 5 : Tarifs et paiement</h2>
          <h3>5.1 Prix</h3>
          <p>
            Les prix sont indiqués en euros HT. Le Studio du Cap Brun est une association exonérée des impôts commerciaux conformément à l'article 261 
            du Code général des impôts (CGI).
          </p>
          <p>
            Les tarifs peuvent être modifiés à tout moment. Le tarif appliqué à un abonnement reste celui annoncé au moment de la souscription 
            pour la durée de l'engagement.
          </p>

          <h3>5.2 Paiement</h3>
          <p>
            Le paiement est exigible avant l'accès aux services. Les moyens de paiement acceptés sont : carte bancaire (Visa, Mastercard) via Stripe.
          </p>
          <p>Les paiements sont sécurisés et chiffrés. Nous ne stockons pas vos informations bancaires.</p>

          <h3>5.3 Facturation</h3>
          <p>Une facture est émise pour chaque paiement et accessible depuis votre espace client.</p>
        </section>

        <section className="politique-section">
          <h2>Article 6 : Licence d'utilisation</h2>
          <h3>6.1 Droits concédés</h3>
          <p>
            Nous vous concédons une licence d'utilisation personnelle et non-exclusive de nos services pour la durée de votre abonnement.
          </p>

          <h3>6.2 Restrictions</h3>
          <p>Vous ne pouvez pas :</p>
          <ul>
            <li>Céder, revendre ou partager votre accès avec des tiers non autorisés</li>
            <li>Utiliser nos services pour des activités illégales</li>
            <li>Tenter de contourner les mesures de sécurité</li>
            <li>Surcharger intentionnellement nos serveurs</li>
          </ul>

          <h3>6.3 Propriété du contenu généré</h3>
          <p>
            Le contenu que vous créez via nos services vous appartient. Vous êtes libre de l'utiliser comme bon vous semble dans le cadre légal. 
            Vous restez seul responsable de l'utilisation et de la diffusion de ce contenu.
          </p>
        </section>

        <section className="politique-section">
          <h2>Article 7 : Utilisation des intégrations réseaux sociaux</h2>
          <h3>7.1 Connexion de vos comptes</h3>
          <p>
            Lorsque vous connectez vos comptes de réseaux sociaux (Facebook, Instagram, Discord, X, etc.), vous autorisez Assistant Rédacteur 
            à publier du contenu en votre nom sur ces plateformes.
          </p>

          <h3>7.2 Vos responsabilités</h3>
          <ul>
            <li>Vous devez respecter les conditions d'utilisation de chaque plateforme tierce</li>
            <li>Vous êtes responsable du contenu que vous publiez via nos services</li>
            <li>Vous devez disposer des droits nécessaires sur le contenu publié (images, textes, etc.)</li>
          </ul>

          <h3>7.3 Comptes professionnels requis</h3>
          <p>
            <strong>Attention :</strong> pour Instagram, seuls les comptes Business ou Creator liés à une Page Facebook peuvent être connectés 
            (limitation technique de l'API Meta). Soyez PRO !
          </p>
        </section>

        <section className="politique-section">
          <h2>Article 8 : Contenu interdit</h2>
          <p>Il est strictement interdit d'utiliser nos services pour créer ou diffuser :</p>
          <ul>
            <li>Du contenu illégal, diffamatoire, injurieux ou discriminatoire</li>
            <li>Du contenu portant atteinte aux droits de tiers (propriété intellectuelle, vie privée)</li>
            <li>Du spam ou du contenu trompeur</li>
            <li>Du contenu à caractère pornographique impliquant des mineurs</li>
            <li>Du contenu incitant à la violence ou à la haine</li>
            <li><strong>Bref, il est interdit de ne pas être bienveillant !</strong></li>
          </ul>
          <p>
            Nous nous réservons le droit de supprimer tout compte dont l'utilisation est contraire à ces règles et de suspendre ou résilier 
            les comptes concernés sans que l'utilisateur concerné ne puisse s'y opposer.
          </p>
        </section>

        <section className="politique-section">
          <h2>Article 9 : Disponibilité du service</h2>
          <h3>9.1 Engagement de disponibilité</h3>
          <p>
            Nous nous efforçons d'assurer une disponibilité maximale de nos services. Cependant, nous ne garantissons pas une disponibilité ininterrompue.
          </p>

          <h3>9.2 Maintenance</h3>
          <p>
            Des interruptions peuvent survenir pour maintenance. Nous nous efforçons de les planifier en dehors des heures de pointe et de vous en informer à l'avance.
          </p>

          <h3>9.3 Dépendance aux tiers</h3>
          <p>
            Nos services dépendent de plateformes tierces (Meta, Discord, OpenAI, etc.). Nous ne sommes pas responsables des interruptions ou modifications 
            de ces services tiers.
          </p>
        </section>

        <section className="politique-section">
          <h2>Article 10 : Limitation de responsabilité</h2>
          <h3>10.1 Exclusions</h3>
          <p>Dans les limites autorisées par la loi, nous ne sommes pas responsables :</p>
          <ul>
            <li>Des dommages indirects, accessoires ou consécutifs</li>
            <li>Des pertes de données, de revenus ou d'opportunités commerciales</li>
            <li>Des actions des plateformes tierces (suspension de compte, modification d'API, etc.)</li>
            <li>Du contenu généré par l'intelligence artificielle (vous devez le vérifier avant publication)</li>
          </ul>

          <h3>10.2 Plafond de responsabilité</h3>
          <p>
            Notre responsabilité totale est limitée au montant que vous avez payé pour nos services au cours des 12 derniers mois.
          </p>
        </section>

        <section className="politique-section">
          <h2>Article 11 : Résiliation</h2>
          <h3>11.1 Par l'utilisateur</h3>
          <p>
            Vous pouvez résilier votre abonnement à tout moment depuis votre espace client. La résiliation prend effet à la fin de la période payée. 
            Aucun remboursement n'est effectué pour la période en cours.
          </p>

          <h3>11.2 Par Assistant Rédacteur</h3>
          <p>Nous pouvons suspendre ou résilier votre compte en cas de :</p>
          <ul>
            <li>Non-respect des présentes conditions</li>
            <li>Non-paiement</li>
            <li>Utilisation abusive ou frauduleuse</li>
            <li>Inactivité prolongée (12 mois sans connexion)</li>
          </ul>
          <p>En cas de résiliation pour faute, aucun remboursement n'est dû.</p>
        </section>

        <section className="politique-section">
          <h2>Article 12 : Propriété intellectuelle</h2>
          <p>
            Tous les éléments de la plateforme (interface, logos, textes, code source) sont protégés par le droit d'auteur et sont la propriété exclusive 
            du Studio du Cap Brun.
          </p>
          <p>Toute reproduction ou exploitation non autorisée est interdite.</p>
        </section>

        <section className="politique-section">
          <h2>Article 13 : Protection des données</h2>
          <p>
            Le traitement de vos données personnelles est régi par notre Politique de Confidentialité (Partie 1 du présent document).
          </p>
        </section>

        <section className="politique-section">
          <h2>Article 14 : Modifications des conditions</h2>
          <p>
            Nous pouvons modifier ces conditions à tout moment. Les modifications entrent en vigueur 30 jours après leur publication. 
            Si vous continuez à utiliser nos services après ce délai, vous acceptez les nouvelles conditions.
          </p>
        </section>

        <section className="politique-section">
          <h2>Article 15 : Droit applicable et litiges</h2>
          <p>Les présentes conditions sont régies par le droit français.</p>
          <p>
            En cas de litige, nous privilégions la résolution amiable. Vous pouvez nous contacter à <span className="email-protected">support [at] assistant-redacteur.fr</span>.
          </p>
          <p>À défaut d'accord amiable, les tribunaux français sont seuls compétents.</p>
        </section>

        <section className="politique-section">
          <h2>Article 16 : Informations légales</h2>
          <p><strong>Studio du Cap Brun</strong><br />
          Association loi 1901 de droit français</p>
          <ul>
            <li><strong>Adresse</strong> : 4161 chemin de Caillade, 83570 COTIGNAC, France</li>
            <li><strong>SIRET</strong> : 49483041700031</li>
            <li><strong>SIREN</strong> : 494830417</li>
            <li><strong>APE</strong> : 5920Z</li>
            <li><strong>Email</strong> : <span className="email-protected">support [at] assistant-redacteur.fr</span></li>
          </ul>
        </section>

        <section className="politique-section">
          <h2>Article 17 : Dispositions diverses</h2>
          <h3>17.1 Intégralité</h3>
          <p>
            Ces conditions constituent l'intégralité de l'accord entre vous et nous concernant l'utilisation de nos services.
          </p>

          <h3>17.2 Nullité partielle</h3>
          <p>
            Si une clause est jugée invalide, les autres clauses restent en vigueur.
          </p>

          <h3>17.3 Renonciation</h3>
          <p>
            Le fait de ne pas exercer un droit ne constitue pas une renonciation à ce droit.
          </p>
        </section>

        <div className="politique-footer">
          <p><em>Merci de votre confiance. Pour toute question, contactez-nous à <span className="email-protected">support [at] assistant-redacteur.fr</span>.</em></p>
          <p>Dernière mise à jour : janvier 2026</p>
        </div>
      </div>
    </div>
  );
};

export default PolitiqueCGV;
