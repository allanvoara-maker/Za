<script setup lang="ts">
import { ref } from 'vue'

const subNavItems = [
  'Présentation',
  'Taxes de dépôt',
  'Classification de Nice',
  'Procédure de dépôt',
  'Formulaires',
  'Système de Madrid',
  'Guides'
]

const activeTab = ref(subNavItems[0]) // 'Présentation' is active by default

const nationalTaxes = [
  { nature: "Taxe de dépôt pour trois classes", montant: "180 000", colorClass: "bg-orange-brand text-white font-bold" },
  { nature: "Taxes par classe supplémentaire au-delà de la troisième", montant: "20 000", colorClass: "bg-blue-brand text-white font-bold" },
  { nature: "Taxe de revendication de priorité, par priorité revendiquée", montant: "30 000", colorClass: "" },
  { nature: "Taxe de régularisation ou de correction d'erreurs matérielles", montant: "10 000", colorClass: "bg-grey-brand" },
  { nature: "Taxe de renouvellement pour dix ans", montant: "200 000", colorClass: "bg-green-brand text-white font-bold" },
  { nature: "Surtaxe pour renouvellement tardif", montant: "40 000", colorClass: "bg-grey-brand" },
  { nature: "Taxe de recherche d'antériorité ou de disponibilité d'une marque", montant: "30 000", colorClass: "" },
  { nature: "Taxe supplémentaire par élément trouvée pour une recherche spéciale", montant: "4 000", colorClass: "bg-grey-brand" },
  { nature: "Taxe pour la délivrance d'une copie officielle d'un titre ou d'une décision", montant: "10 000", colorClass: "" },
  { nature: "Taxe d'inscription ou de radiation sur le registre des marques, par marques", montant: "30 000", colorClass: "bg-yellow-brand font-bold" },
  { nature: "Taxe pour la délivrance d'un état des inscriptions au registre, par marque", montant: "10 000", colorClass: "bg-grey-brand" },
  { nature: "Taxe pour la restauration d'un droit à agir par marque", montant: "40 000", colorClass: "" },
  { nature: "Taxe de certification, par cas", montant: "4 000", colorClass: "bg-grey-brand" },
  { nature: "Taxe pour délivrance d'une attestation", montant: "10 000", colorClass: "" },
  { nature: "Taxe pour délivrance d'une attestation de dépôt (avec reproduction en couleur)", montant: "15 000", colorClass: "bg-grey-brand" },
]

const madridTaxes = [
  { nature: "a) Taxe de prise en charge des demandes internationales (incluant les frais d'envois)", montant: "200 000" },
  { nature: "b) Taxe de prise en charge des opérations internationales (désignation renouvellement) opérations portant sur un enregistrement postérieure, modification, licence,...", montant: "200 000" },
  { nature: "c) Taxe pour le remplacement d'un enregistrement national par un enregistrement international", montant: "100 000" },
  { nature: "d) Taxe pour la transformation d'un enregistrement international en enregistrement national", montant: "180 000" },
  { nature: "e) Taxe de délivrance d'un extrait du registre, par marques", montant: "10 000" },
]
</script>

<template>
  <main class="page-container fade-in">
    <!-- Page Hero -->
    <div class="page-hero">
      <div class="container hero-content">
        <h1>Marques</h1>
        <p class="subtitle">Produits & Services</p>
      </div>
    </div>

    <!-- Sub Navigation Tabs -->
    <div class="sub-nav">
      <div class="container sub-nav-container">
        <button 
          v-for="item in subNavItems" 
          :key="item"
          :class="['tab-btn', { active: activeTab === item }]"
          @click="activeTab = item"
        >
          {{ item }}
        </button>
      </div>
    </div>

    <div class="container content-wrapper">
      
      <!-- Taxes de dépôt Section -->
      <div v-if="activeTab === 'Taxes de dépôt'" class="taxes-section fade-in">
        <!-- National Taxes -->
        <div class="tax-table-container glass mb-50">
          <div class="table-header-banner">
            <h3>TAXES EN MATIÈRE DE MARQUES (ENREGISTREMENT NATIONAL)</h3>
          </div>
          <div class="table-responsive">
            <table class="modern-table">
              <thead>
                <tr>
                  <th class="col-nature">NATURE</th>
                  <th class="col-montant">MONTANT (en ariary)</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(tax, index) in nationalTaxes" :key="'nat-'+index">
                  <td :class="['nature-cell', tax.colorClass]">{{ tax.nature }}</td>
                  <td class="montant-cell">{{ tax.montant }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Madrid Taxes -->
        <div class="tax-table-container glass">
          <div class="table-header-banner">
            <h3>TAXES POUR LE SYSTÈME DE MADRID</h3>
          </div>
          <div class="table-responsive">
            <table class="modern-table madrid-table">
              <thead>
                <tr>
                  <th class="col-nature">NATURE</th>
                  <th class="col-montant">MONTANT (en ariary)</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(tax, index) in madridTaxes" :key="'mad-'+index">
                  <td class="nature-cell">{{ tax.nature }}</td>
                  <td class="montant-cell">{{ tax.montant }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Système de Madrid Section -->
      <div v-else-if="activeTab === 'Système de Madrid'" class="madrid-section fade-in">
        <!-- Top banner inside content -->
        <div class="madrid-banner glass-teal mb-40">
          <h2 class="text-white text-center m-0" style="flex:1;">SERVICE D'ENREGISTREMENT INTERNATIONAL DES MARQUES DE PRODUITS & SERVICES</h2>
          <div class="wipo-placeholder">WIPO | MADRID</div>
        </div>

        <h3 class="section-title text-center mb-30">Le système d'enregistrement international des marques ou le système de Madrid</h3>

        <div class="madrid-intro row-section mb-40">
          <div class="text-block">
            <p class="mb-15">Le système d'enregistrement international des marques est fondé sur deux traités : l'Arrangement de Madrid concernant l'enregistrement international des marques (1891) et le <strong class="text-red">Protocole relatif à cet Arrangement</strong> (1989), ce système est administré par le Bureau international de l'<strong class="text-red">Organisation Mondiale de la Propriété Intellectuelle (OMPI)</strong>, à Genève (Suisse).</p>
            <p>Ce système a pour objectif de faciliter l'obtention de la protection des marques des produits et de services, au niveau international. Il permet d'initier la demande d'extension des droits à divers pays (ou les groupant à ce jour) à travers la protection de vos marques, étant donné que la protection d'une marque est soumise au principe de territorialité.</p>
          </div>
          <div class="visual-block wipo-large-placeholder">
            <div class="wipo-logo-mockup">WIPO | MADRID<br><span class="text-sm">The International<br>Trademark System</span></div>
          </div>
        </div>

        <div class="madrid-info-grid mb-50">
          <div class="info-box-grey">
            <p>Madagascar est un État membre de l'Union de Paris et est partie à l'Arrangement de Madrid dès 1893, depuis le <strong class="text-blue">28 avril 2008</strong>. Depuis cette date historique pour la protection de la propriété industrielle à Madagascar, les ressortissants du notre pays peuvent profiter du système en déposant aux aussi pour "l'international".</p>
          </div>
          <div class="text-block">
            <p class="mb-15">L'adhésion au système de Madrid, le déposant peut alors, par le biais d'une seule demande d'enregistrement déposée auprès de l'Office de l'un des pays membres (où il est ressortissant, domicilié ou a un établissement) désignant tous les autres pays membres ou une partie. En effet, il faut souligner que c'est un système fermé réservé aux pays membres.</p>
            <p>Le système de Madrid compte 106 membres couvrant en tout 122 pays. En outre, cette demande d'enregistrement « international » est déposée dans une seule langue et le déposant n'a qu'à payer une seule série de taxes (en francs suisses). Le délai légal effectué par le biais du système de Madrid équivaut à un dépôt effectué directement auprès des offices de marques des pays choisis, bien que ce soit par l'intermédiaire de l'OMPI.</p>
          </div>
        </div>

        <div class="red-divider-center mx-auto mb-40"></div>

        <h3 class="section-title text-center mb-30">Procédure pour déposer à l'international</h3>
        <p class="mb-15 text-center max-w-800 mx-auto">À l'instar des toutes les démarches pour le dépôt de marques (enregistrement international ou national), un des spécificités d'un enregistrement Par ailleurs, son existence permet au déposant d'éviter les notifications d'irrégularités de la part de l'<strong>OMPI</strong> concernant la forme de la demande. L'office sert aussi d'intermédiaire avec l'OMPI pour toute communication (ex. paiement d'une taxe supplémentaire) exceptée pour le Bureau International.</p>
        
        <p class="mb-15 font-bold text-center">Il faut remarquer que l'emploi du système de Madrid à partir de l'OMAPI pour déposer à l'international est soumis à quelques conditions :</p>
        <p class="mb-15 text-center">Le système est réservé aux personnes qui remplissent les conditions de rattachement avec Madagascar, soit :</p>
        
        <ol class="styled-list-blue max-w-600 mx-auto mb-30">
          <li>La nationalité Malgache</li>
          <li>Une résidence liée à Madagascar</li>
          <li>Ou un établissement industriel ou commercial effectif à Madagascar</li>
        </ol>

        <p class="mb-15 text-center max-w-800 mx-auto">La demande de protection à l'international constitue en outre, une extension (demande) de la protection de la marque déposée ou enregistrée au niveau national (à Madagascar). Par conséquent, le déposant d'une demande internationale doit toujours se baser sur une demande déposée ou enregistrée auprès de l'OMAPI.</p>
        
        <p class="mb-40 text-center max-w-800 mx-auto">La procédure est dite simple et centralisée, sauf si le déposant réclame des services d'offices des marques de son choix, comme pour les États Unis. Toutefois l'OMAPI est disposé à fournir toute assistance nécessaire aux déposants, dans la limite de ses attributions.</p>

        <div class="row-section mb-40 align-start">
          <div class="text-block" style="flex: 2;">
            <h3 class="section-title mb-20 text-left">OMAPI en tant d'une partie contractante désignée dans le système de Madrid</h3>
            <p class="mb-15">En tant que membre de l'Union de Madrid, Madagascar fait aussi l'objet de désignation par les ressortissants des autres pays membres (à l'aide d'un enregistrement national fait). les demandes d'enregistrement de marques provenant des autres pays, déposées par le biais du système de Madrid, en vue d'une protection à Madagascar.</p>
            <p class="mb-15">Ces demandes sont examinées quant au fond, suivant les dispositions de l'ordonnance n° 89-019 du 31 juillet 1989 et ses décrets d'applications subséquents (décrets n° 92-993 et n° 92-994 du 2 décembre 1992). Les marques « Madrid » enregistrées font l'objet d'une déclaration d'octroi de protection (équivalent au certificat d'enregistrement national) tandis que les marques dont l'enregistrement a été refusé, d'une notification de refus, de la part de l'OMAPI.</p>
            <p class="mb-15">Les procédures appliquées auprès de l'OMAPI en tant qu'office d'une partie contractante désignée figurent sur le site web de l'OMPI. Par ailleurs, les dispositions des textes sur le Protocole (texte et règlement d'exécution) sont être d'entier applicables au système de l'international des marques (Madrid), en ce qui concerne Madagascar.</p>
          </div>
          <div class="visual-block" style="flex: 1; display: flex; justify-content: center; align-items: flex-start; padding-top: 20px;">
            <div class="padlock-icon-mockup">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width: 4rem; height: 4rem; z-index: 1; color: #ffd166;"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
            </div>
          </div>
        </div>
      </div>

      <!-- Guides Section -->
      <div v-else-if="activeTab === 'Guides'" class="guides-section fade-in">
        <h2 class="text-center mb-40 text-primary">Documentation & Guides</h2>

        <!-- Brevet & Dessin Category -->
        <div class="guide-category mb-50">
          <div class="category-banner bg-grey-dark">
            <h3>Guides en matière de Brevet d'invention & dessin ou modèle industriel</h3>
          </div>

          <!-- Version Française -->
          <div class="language-section">
            <div class="language-banner bg-yellow-light">
              <h4>Version Française</h4>
            </div>
            <div class="docs-grid">
              <a href="#" class="doc-card glass-hover">
                <div class="doc-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width: 24px; height: 24px; color: var(--secondary-blue);"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line></svg></div>
                <div class="doc-title">Guide-DM-F-R2-31-Guide de dépôt Dessins et modèles</div>
              </a>
              <a href="#" class="doc-card glass-hover">
                <div class="doc-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width: 24px; height: 24px; color: var(--secondary-blue);"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line></svg></div>
                <div class="doc-title">Guide_SBR_F-R2-30-Guide de dépôt de Brevet d'invention</div>
              </a>
              <a href="#" class="doc-card glass-hover">
                <div class="doc-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width: 24px; height: 24px; color: var(--secondary-blue);"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line></svg></div>
                <div class="doc-title">Guide_SBR_F-R2-38-Guide de Demande d'Inscription</div>
              </a>
              <a href="#" class="doc-card glass-hover">
                <div class="doc-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width: 24px; height: 24px; color: var(--secondary-blue);"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line></svg></div>
                <div class="doc-title">Guide_SBR_F-R2-49 02-Guide de récupération du certificat ou du brevet</div>
              </a>
              <a href="#" class="doc-card glass-hover">
                <div class="doc-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width: 24px; height: 24px; color: var(--secondary-blue);"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line></svg></div>
                <div class="doc-title">Guide_SBR_F-R2-58-Guide de consultation CATI</div>
              </a>
              <a href="#" class="doc-card glass-hover">
                <div class="doc-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width: 24px; height: 24px; color: var(--secondary-blue);"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line></svg></div>
                <div class="doc-title">Guide_SBR_F-R2-62-Offices chargés de recherches internationales</div>
              </a>
              <a href="#" class="doc-card glass-hover">
                <div class="doc-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width: 24px; height: 24px; color: var(--secondary-blue);"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line></svg></div>
                <div class="doc-title">Guide_SBR_F-R2-63-Guide du déposant brevet</div>
              </a>
              <a href="#" class="doc-card glass-hover">
                <div class="doc-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width: 24px; height: 24px; color: var(--secondary-blue);"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line></svg></div>
                <div class="doc-title">Guide_SBR_F-R2-64-Guide rédaction d'une demande de brevet d'invention</div>
              </a>
            </div>
          </div>

          <!-- English Version -->
          <div class="language-section mt-30">
            <div class="language-banner bg-yellow-light">
              <h4>English version</h4>
            </div>
            <div class="docs-grid">
              <a href="#" class="doc-card glass-hover">
                <div class="doc-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width: 24px; height: 24px; color: var(--secondary-blue);"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line></svg></div>
                <div class="doc-title">Guide-DM-F-R2-31-Industrial Design application guide</div>
              </a>
              <a href="#" class="doc-card glass-hover">
                <div class="doc-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width: 24px; height: 24px; color: var(--secondary-blue);"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line></svg></div>
                <div class="doc-title">Guide-SBR-F-R2-30-Patent Application Guide</div>
              </a>
            </div>
          </div>
        </div>

        <!-- Marque Category -->
        <div class="guide-category mb-50">
          <div class="category-banner bg-grey-dark">
            <h3>Guides en matière de Marque</h3>
          </div>

          <!-- Version Malagasy -->
          <div class="language-section">
            <div class="language-banner bg-yellow-light">
              <h4>Version Malagasy</h4>
            </div>
            <div class="docs-grid">
              <a href="#" class="doc-card glass-hover">
                <div class="doc-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width: 24px; height: 24px; color: var(--secondary-blue);"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line></svg></div>
                <div class="doc-title">Guide_TM_F_R3_33_08_01_Fametrahana_marika ho amin'ny firaketana am-boky</div>
              </a>
              <a href="#" class="doc-card glass-hover">
                <div class="doc-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width: 24px; height: 24px; color: var(--secondary-blue);"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line></svg></div>
                <div class="doc-title">Guide_TM_F_R3_33_08_02_Fametrahana_anarana ara-barotra ho amin'ny firaketana am-boky</div>
              </a>
              <a href="#" class="doc-card glass-hover">
                <div class="doc-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width: 24px; height: 24px; color: var(--secondary-blue);"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line></svg></div>
                <div class="doc-title">Guide_TM_F-R3-33- 08-03 Toromarika mikasika fanovana</div>
              </a>
              <a href="#" class="doc-card glass-hover">
                <div class="doc-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width: 24px; height: 24px; color: var(--secondary-blue);"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line></svg></div>
                <div class="doc-title">Guide_TM_F-R3-33- 08-04 Fanavaozana fandraikatena am-boky</div>
              </a>
            </div>
          </div>

          <!-- Version Française -->
          <div class="language-section mt-30">
            <div class="language-banner bg-yellow-light">
              <h4>Version Française</h4>
            </div>
            <div class="docs-grid">
              <a href="#" class="doc-card glass-hover">
                <div class="doc-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width: 24px; height: 24px; color: var(--secondary-blue);"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line></svg></div>
                <div class="doc-title">Guide_TM_F-R3-33-04 GUIDE POUR LA RECHERCHE ANTÉRIORITÉ PAR VOIE ELECTRONIQUE</div>
              </a>
              <a href="#" class="doc-card glass-hover">
                <div class="doc-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width: 24px; height: 24px; color: var(--secondary-blue);"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line></svg></div>
                <div class="doc-title">Guide_TM_F-R3-33-09 GUIDE EXPLICATIF DE RECHERCHE D'ANTÉRIORITÉ</div>
              </a>
              <a href="#" class="doc-card glass-hover">
                <div class="doc-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width: 24px; height: 24px; color: var(--secondary-blue);"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line></svg></div>
                <div class="doc-title">Guide_TM_F-R3-33-10 GUIDE D'UTILISATION MGS</div>
              </a>
              <a href="#" class="doc-card glass-hover">
                <div class="doc-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width: 24px; height: 24px; color: var(--secondary-blue);"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line></svg></div>
                <div class="doc-title">Guide_TM_F-R3-33-01-GUIDE DE DÉPÔT DE MARQUE</div>
              </a>
              <a href="#" class="doc-card glass-hover">
                <div class="doc-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width: 24px; height: 24px; color: var(--secondary-blue);"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line></svg></div>
                <div class="doc-title">Guide_TM_F-R3-33-02 Guide pour le renouvellement de l'enregistrement de marque et Nom commercial (NC)</div>
              </a>
              <a href="#" class="doc-card glass-hover">
                <div class="doc-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width: 24px; height: 24px; color: var(--secondary-blue);"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line></svg></div>
                <div class="doc-title">Guide_TM_F-R3-33-03-Guide pour une inscription au registre de marque aux fins d'une modification</div>
              </a>
              <a href="#" class="doc-card glass-hover">
                <div class="doc-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width: 24px; height: 24px; color: var(--secondary-blue);"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line></svg></div>
                <div class="doc-title">Guide_TM_F-R3-33-05 GUIDE POUR LE DÉPÔT ELECTRONIQUE DE MARQUE</div>
              </a>
              <a href="#" class="doc-card glass-hover">
                <div class="doc-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width: 24px; height: 24px; color: var(--secondary-blue);"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line></svg></div>
                <div class="doc-title">Guide_TM_F-R3-33-06 GUIDE POUR LE DÉPÔT NC</div>
              </a>
              <a href="#" class="doc-card glass-hover">
                <div class="doc-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width: 24px; height: 24px; color: var(--secondary-blue);"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line></svg></div>
                <div class="doc-title">Guide_TM_F-R3-33-07 GUIDE POUR LE DÉPÔT ELECTRONIQUE NC</div>
              </a>
            </div>
          </div>
        </div>
      </div>

      <!-- Classification de Nice Section -->
      <div v-else-if="activeTab === 'Classification de Nice'" class="fade-in">
        <div class="text-center pct-section">
          <div class="pct-card glass">
            <div class="wipo-logo mb-20" style="background: #1976d2;">Classification de Nice</div>
            <h2 class="mb-20" style="color: var(--primary-blue);">Aide au classement des produits et des services</h2>
            <p class="mb-30" style="max-width: 700px; margin: 0 auto 30px auto; line-height: 1.6; color: var(--text-dark);">
              La Classification de Nice est un système de classification internationale utilisé pour classer les produits et les services aux fins de l'enregistrement des marques.
            </p>
            <a href="https://webaccess.wipo.int/mgs/" target="_blank" class="wipo-btn glass-hover" style="background: #1976d2;">
              Consulter la Classification sur l'OMPI (MGS)
            </a>
          </div>
        </div>
      </div>

      <!-- Procédure de dépôt Section -->
      <div v-else-if="activeTab === 'Procédure de dépôt'" class="fade-in">
        <div class="procedure-section text-center">
          <h2 class="mb-30" style="color: var(--primary-blue);">Procédure de traitement des demandes</h2>
          <p class="mb-30" style="color: var(--text-dark);">Procédure de traitement des demandes d'enregistrement des marques.</p>
          <div class="infographic-container mb-30" style="display: flex; justify-content: center; margin: 0 auto;">
            <div class="placeholder-infographic" style="background: #f1f5f9; border: 2px dashed #cbd5e1; border-radius: 12px; width: 100%; max-width: 800px; height: 400px; display: flex; flex-direction: column; justify-content: center; align-items: center; color: #64748b;">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon-large" style="width: 4rem; height: 4rem; margin-bottom: 15px; color: var(--secondary-blue);"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>
              <p>Schéma interactif ou infographie à venir</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Formulaires Section -->
      <div v-else-if="activeTab === 'Formulaires'" class="fade-in">
        <h2 class="text-center mb-40" style="color: var(--primary-blue);">Formulaires en matière de Marques</h2>
        <p class="text-center mb-30" style="color: #64748b;">Cliquez sur un document pour télécharger le formulaire de votre choix.</p>
        <div class="docs-grid">
          <a href="http://www.omapi.mg/assets/recherche_mk2.doc" target="_blank" class="doc-card glass-hover">
            <div class="doc-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width: 24px; height: 24px; color: var(--secondary-blue);"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line></svg></div>
            <div class="doc-title">DEMANDE DE RECHERCHE D'ANTÉRIORITÉ DE MARQUE</div>
          </a>
          <a href="http://www.omapi.mg/assets/f9_marque_demande.doc" target="_blank" class="doc-card glass-hover">
            <div class="doc-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width: 24px; height: 24px; color: var(--secondary-blue);"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line></svg></div>
            <div class="doc-title">DEMANDE D'ENREGISTREMENT DE MARQUE</div>
          </a>
          <a href="http://www.omapi.mg/assets/n_10_rennouvellement_mk.rtf" target="_blank" class="doc-card glass-hover">
            <div class="doc-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width: 24px; height: 24px; color: var(--secondary-blue);"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line></svg></div>
            <div class="doc-title">DEMANDE DE RENOUVELLEMENT D'ENREGISTREMENT DE MARQUE</div>
          </a>
          <a href="http://www.omapi.mg/assets/formulaire_no11_cession_mk.rtf" target="_blank" class="doc-card glass-hover">
            <div class="doc-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width: 24px; height: 24px; color: var(--secondary-blue);"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line></svg></div>
            <div class="doc-title">DEMANDE D'INSCRIPTION D'UN TRANSFERT DE MARQUE</div>
          </a>
          <a href="http://www.omapi.mg/assets/n_3_inscription_modification.doc" target="_blank" class="doc-card glass-hover">
            <div class="doc-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width: 24px; height: 24px; color: var(--secondary-blue);"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line></svg></div>
            <div class="doc-title">DEMANDE D'INSCRIPTION D'UNE MODIFICATION</div>
          </a>
          <a href="http://www.omapi.mg/assets/n_2_concession_de_licence2.doc" target="_blank" class="doc-card glass-hover">
            <div class="doc-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width: 24px; height: 24px; color: var(--secondary-blue);"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line></svg></div>
            <div class="doc-title">DEMANDE D'INSCRIPTION D'UNE CONCESSION DE LICENCE</div>
          </a>
        </div>
      </div>

      <!-- General Section (Default Marques Content) -->
      <div v-else-if="activeTab === 'Présentation'" class="general-section fade-in">
        <!-- Section 1: C'est quoi? -->
        <section class="info-section glass row-section">
          <div class="text-block">
            <div class="section-badge">⭐ À VOS MARQUES</div>
            <h2>C'est quoi?</h2>
            <p>Une <strong>marque</strong> est un <strong>signe</strong> qui permet de distinguer les <strong>produits</strong> ou les <strong>services</strong> d'une entreprise de ceux d'autres entreprises.</p>
          </div>
          <div class="visual-block placeholder-logos">
            <div class="brand-item taf">taf</div>
            <div class="brand-item total">TOTAL</div>
            <div class="brand-item generic red"></div>
            <div class="brand-item generic blue"></div>
          </div>
        </section>

        <!-- Section 2 & 3: Categories & Forms -->
        <div class="two-col-grid">
          <section class="info-section glass">
            <h2>Quelles sont les catégories de marques existantes ?</h2>
            <ul class="styled-list">
              <li>Les marques de produits qui sont apposées sur les produits (produits alimentaires, vêtements, outillages et appareils, etc.)</li>
              <li>Les marques de services servant à distinguer certains services exercés dans un cadre (banques, assurances, transports, télécommunications, restauration, etc.)</li>
            </ul>
          </section>

          <section class="info-section glass">
            <div class="flex-heading">
              <h2>Quelles formes peut avoir une marque ?</h2>
              <div class="registered-mark">®</div>
            </div>
            <p>Une marque de produits ou de services, individuelle ou collective, peut revêtir une multitude de formes.</p>
            <p class="font-semibold mt-10">Les formes les plus classiques comprennent :</p>
            <ul class="styled-list">
              <li>les marques verbales (mots, noms, lettres, ou chiffres, désignations)</li>
              <li>les marques figuratives (dessins, symboles, logos, hologrammes)</li>
              <li>les marques complexes (combinaisons des marques verbales et figuratives)</li>
            </ul>
            <p class="mt-10 note">Les marques tridimensionnelles consistant en la forme particulière du l'emballage d'un produit, etc. On peut aussi trouver les marques sonores, olfactives (parfums), et les couleurs utilisées.</p>
          </section>
        </div>

        <section class="notice-section text-center">
          <p>L'enregistrement d'une marque confère à son titulaire le droit d'interdire aux tiers tout usage commercial de la marque ou d'un nom commercial qui lui ressemble au point d'induire le public en erreur ou d'en attirer un profit pour des produits de la même enseigne que ceux protégés.</p>
        </section>

        <!-- Action Boxes -->
        <div class="action-grid">
          <div class="action-box procedure">
            <h3>Procédure de demande d'enregistrement d'une marque</h3>
            <div class="action-content">
              <p>La protection d'une marque s'acquiert généralement par une demande de dépôt auprès de l'Office National de la Propriété Intellectuelle pour Madagascar. Seuls les droits pour chaque pays sont conférés par les législations des marques pour chaque pays.</p>
              <p>Les taxes perçues ont un caractère obligatoire et leur admission à l'enregistrement est effective après des processus stricts et de rigueurs par OMAPI.</p>
            </div>
          </div>
          
          <div class="action-box protection">
            <h3>Comment protéger une marque ?</h3>
            <div class="action-content">
              <p>À cette fin, une demande d'enregistrement de la marque doit être déposée à l'OMAPI ou au sein de son portail web.</p>
              <p>La demande doit contenir notamment une reproduction claire de la marque ainsi qu'une liste des produits ou services pour lesquels la marque est désignée. Le paiement des taxes prescrites est également une condition de recevabilité.</p>
              <p>Il est à noter que les formulaires adéquats, qu'ils soient de dépôt ou d'étranger (en voie de transit) doivent être remplis avec précision.</p>
            </div>
          </div>
        </div>
      </div>
      
      <div v-else class="general-section fade-in text-center" style="padding: 100px 0;">
        <h2 style="color: var(--primary-blue);">Contenu pour "{{ activeTab }}" en cours de construction...</h2>
      </div>

    </div>
  </main>
</template>

<style scoped>
.page-container { min-height: 80vh; padding-bottom: 60px; }

/* Page Hero */
.page-hero {
  background: linear-gradient(135deg, var(--secondary-blue) 0%, var(--primary-blue) 100%);
  color: var(--white);
  padding: 40px 0;
  text-align: center;
  box-shadow: 0 4px 15px rgba(0,0,0,0.1);
}
.page-hero h1 { font-size: 2.8rem; font-weight: 700; margin-bottom: 5px; }
.subtitle { font-size: 1.2rem; opacity: 0.9; letter-spacing: 1px; }

/* Sub Navigation */
.sub-nav {
  background: var(--white);
  border-bottom: 1px solid rgba(0,0,0,0.05);
  box-shadow: 0 4px 10px rgba(0,0,0,0.02);
  margin-bottom: 40px;
}
.sub-nav-container { display: flex; overflow-x: auto; gap: 10px; padding: 0 10px; }
.sub-nav-container::-webkit-scrollbar { height: 4px; }
.sub-nav-container::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.1); border-radius: 4px; }

.tab-btn {
  background: transparent;
  color: var(--text-light);
  font-weight: 600;
  font-size: 0.9rem;
  padding: 15px 20px;
  white-space: nowrap;
  position: relative;
  transition: all 0.3s;
}
.tab-btn:hover { color: var(--primary-blue); background: rgba(0,0,0,0.02); }
.tab-btn.active { color: var(--primary-blue); }
.tab-btn.active::after {
  content: ''; position: absolute; bottom: 0; left: 0; width: 100%; height: 3px; background: var(--accent-orange);
}

/* Content Layout */
.content-wrapper { display: flex; flex-direction: column; gap: 30px; }

/* TAXES SECTION STYLES */
.taxes-section { width: 100%; animation: fadeIn 0.4s ease; }
.mb-50 { margin-bottom: 50px; }

.tax-table-container {
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0,0,0,0.05);
  border: 1px solid rgba(0,0,0,0.05);
}

.table-header-banner {
  background: #f1f5f9;
  padding: 20px;
  text-align: center;
  border-bottom: 2px solid #e2e8f0;
}
.table-header-banner h3 {
  font-size: 1.1rem;
  font-weight: 700;
  color: #334155;
  margin: 0;
  letter-spacing: 0.5px;
}

.table-responsive {
  overflow-x: auto;
}

.modern-table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
}

.modern-table th {
  background: #118ab2; /* Teal-blue header */
  color: var(--white);
  padding: 15px 20px;
  font-size: 0.95rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.col-nature { width: 75%; }
.col-montant { width: 25%; text-align: center; }

.modern-table td {
  padding: 12px 20px;
  font-size: 0.95rem;
  border-bottom: 1px solid #e2e8f0;
  color: #1f2937;
}

.modern-table tr:last-child td { border-bottom: none; }
.montant-cell { text-align: center; font-weight: 600; background: var(--white); border-left: 1px solid #e2e8f0; }

/* Specific Cell Background Colors */
.bg-orange-brand { background-color: #ef476f !important; color: white !important; }
.bg-blue-brand { background-color: #4cc9f0 !important; color: white !important; }
.bg-green-brand { background-color: #06d6a0 !important; color: white !important; }
.bg-yellow-brand { background-color: #ffd166 !important; }
.bg-grey-brand { background-color: #f8fafc !important; }

.text-white { color: #fff !important; }
.font-bold { font-weight: 700 !important; }

/* Madrid Table specific overrides */
.madrid-table .nature-cell {
  background-color: #48bcae !important; /* Teal color matching the image rows */
  color: white !important;
  font-weight: 500;
}

.madrid-table .montant-cell {
  background-color: #48bcae !important;
  color: white !important;
  border-left: 1px solid rgba(255,255,255,0.2);
}

.madrid-table tr:hover td {
  filter: brightness(0.95);
}

/* Original Marques Info Styles */
.info-section { padding: 35px; border-left: 4px solid var(--accent-orange); transition: transform 0.3s ease, box-shadow 0.3s ease; }
.info-section:hover { transform: translateY(-3px); box-shadow: 0 12px 30px rgba(31, 38, 135, 0.15); }
.info-section h2 { color: var(--primary-blue); font-size: 1.5rem; margin-bottom: 20px; font-weight: 700; }
.row-section { display: flex; align-items: center; gap: 40px; }
.section-badge { display: inline-block; background: rgba(0, 136, 204, 0.1); color: var(--secondary-blue); padding: 5px 15px; border-radius: 20px; font-size: 0.8rem; font-weight: 700; margin-bottom: 15px; }
.visual-block { flex: 1; display: flex; flex-wrap: wrap; gap: 15px; justify-content: center; }
.brand-item { height: 60px; display: flex; justify-content: center; align-items: center; border-radius: 8px; font-weight: 800; font-size: 1.2rem; padding: 0 20px; background: white; box-shadow: 0 4px 10px rgba(0,0,0,0.05); }
.taf { color: #d32f2f; font-family: 'Arial', sans-serif; font-size: 1.8rem; }
.total { color: #d32f2f; font-family: 'Arial', sans-serif; border-left: 5px solid #000; border-right: 5px solid #000; }
.generic.red { background: #d32f2f; width: 60px; border-radius: 50%; }
.generic.blue { background: #1976d2; width: 80px; }
.two-col-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 30px; }
.flex-heading { display: flex; justify-content: space-between; align-items: flex-start; }
.registered-mark { background: var(--primary-blue); color: white; width: 50px; height: 50px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 1.5rem; font-weight: 700; box-shadow: 0 4px 15px rgba(10, 58, 106, 0.3); }
.styled-list { list-style: none; counter-reset: my-counter; }
.styled-list li { position: relative; padding-left: 30px; margin-bottom: 15px; line-height: 1.6; color: var(--text-dark); }
.styled-list li::before { content: '✓'; position: absolute; left: 0; top: 2px; display: flex; align-items: center; justify-content: center; width: 20px; height: 20px; background-color: var(--secondary-blue); color: var(--white); border-radius: 50%; font-size: 0.7rem; font-weight: bold; }
.font-semibold { font-weight: 600; }
.mt-10 { margin-top: 15px; }
.note { font-size: 0.9rem; color: var(--text-light); font-style: italic; padding-left: 15px; border-left: 2px solid #ddd; }
.notice-section { padding: 30px; background: rgba(10, 58, 106, 0.03); border-radius: 12px; border: 1px dashed rgba(10, 58, 106, 0.2); margin: 10px 0; }
.notice-section p { font-weight: 500; color: var(--primary-blue); line-height: 1.7; }
.action-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 30px; }
.action-box { border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.05); transition: transform 0.3s ease; }
.action-box:hover { transform: translateY(-5px); }
.action-box h3 { padding: 20px 25px; color: var(--white); font-size: 1.1rem; font-weight: 600; margin: 0; }
.procedure h3 { background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%); }
.protection h3 { background: linear-gradient(135deg, #38ef7d 0%, #11998e 100%); }
.action-content { padding: 25px; background: var(--white); height: 100%; }
.action-content p { margin-bottom: 15px; font-size: 0.95rem; line-height: 1.6; color: var(--text-light); }

/* Madrid Section Styles */
.madrid-banner {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 40px;
  border-radius: 12px;
  background: linear-gradient(135deg, #00b4db 0%, #0083b0 100%);
  box-shadow: 0 4px 15px rgba(0, 180, 219, 0.3);
}
.wipo-placeholder {
  background: rgba(255,255,255,0.2);
  padding: 10px 20px;
  border-radius: 8px;
  color: white;
  font-weight: 800;
  letter-spacing: 1px;
}
.section-title { font-size: 1.8rem; color: var(--primary-blue); font-weight: 700; }
.text-red { color: #d32f2f; }
.mb-40 { margin-bottom: 40px; }
.mb-30 { margin-bottom: 30px; }
.mb-20 { margin-bottom: 20px; }
.mb-15 { margin-bottom: 15px; }
.m-0 { margin: 0; }
.max-w-800 { max-width: 800px; }
.max-w-600 { max-width: 600px; }
.mx-auto { margin-left: auto; margin-right: auto; }
.align-start { align-items: flex-start; }
.text-center { text-align: center; }
.text-left { text-align: left; }
.font-bold { font-weight: bold; }

.wipo-large-placeholder {
  background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 40px; text-align: center; color: #1e293b; font-weight: 800; font-size: 1.5rem;
}
.wipo-large-placeholder .text-sm { font-size: 0.9rem; font-weight: 400; color: #64748b; }

.madrid-info-grid { display: grid; grid-template-columns: 1fr 2fr; gap: 30px; align-items: center; }
.info-box-grey { background: #f1f5f9; padding: 30px; border-radius: 12px; border-left: 4px solid #94a3b8; font-size: 0.95rem; }
.text-blue { color: var(--secondary-blue); }

.red-divider-center { height: 3px; width: 60px; background-color: #d32f2f; }

.styled-list-blue { list-style: none; counter-reset: madrid-counter; text-align: left; }
.styled-list-blue li { position: relative; padding-left: 40px; margin-bottom: 15px; color: var(--secondary-blue); font-weight: 500; }
.styled-list-blue li::before {
  counter-increment: madrid-counter; content: counter(madrid-counter) "."; position: absolute; left: 10px; color: var(--secondary-blue); font-weight: bold;
}

.padlock-icon-mockup {
  width: 150px; height: 150px; background: #1e3a8a; border-radius: 50%; display: flex; justify-content: center; align-items: center; box-shadow: 0 10px 25px rgba(30, 58, 138, 0.3); position: relative;
}
.padlock-icon-mockup::before {
  content: ''; position: absolute; width: 120px; height: 120px; border: 4px dotted #facc15; border-radius: 50%;
}
.lock-emoji { font-size: 4rem; z-index: 1; }

/* Guides Section Styles */
.text-primary { color: var(--primary-blue); font-weight: 700; }
.guide-category { background: var(--white); border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.05); }

.category-banner {
  padding: 20px; text-align: center; border-bottom: 2px solid #e2e8f0;
}
.bg-grey-dark { background: #e2e8f0; }
.category-banner h3 { font-size: 1.2rem; font-weight: 700; color: #334155; margin: 0; }

.language-section { padding: 0 20px 20px 20px; }
.language-banner {
  padding: 12px; text-align: center; margin-bottom: 20px; border-radius: 6px;
}
.bg-yellow-light { background: #fde68a; color: #b45309; }
.language-banner h4 { font-size: 1.05rem; font-weight: 700; margin: 0; }

.docs-grid {
  display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 15px;
}

.doc-card {
  display: flex; align-items: center; padding: 15px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; text-decoration: none; color: #334155; transition: all 0.3s ease;
}
.doc-card:hover {
  background: var(--white); box-shadow: 0 4px 15px rgba(0, 136, 204, 0.15); transform: translateY(-2px); border-color: #bae6fd;
}
.doc-icon { font-size: 1.5rem; margin-right: 15px; }
.doc-title { font-size: 0.9rem; font-weight: 500; line-height: 1.4; }

@media (max-width: 992px) {
  .row-section { flex-direction: column; }
  .two-col-grid, .action-grid { grid-template-columns: 1fr; }
}
</style>
