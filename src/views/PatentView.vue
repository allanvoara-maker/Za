<script setup lang="ts">
import { ref } from 'vue'

const subNavItems = [
  'Présentation',
  'Taxes: Brevet',
  'Procédure de demande',
  'Formulaire',
  'PCT'
]

const activeTab = ref(subNavItems[0])

const infoTabs = ['BREVET ?', 'Invention ?', 'Brevetabilité']
const activeInfoTab = ref(infoTabs[0])

// Accordion data
const accordionItems = [
  { 
    title: "Quelles sortes d'invention ne sont pas brevetables ?", 
    open: false,
    contentHTML: `
      <ol class="styled-list-numbers">
        <li>les inventions dont l'exploitation est contraire à l'ordre public, aux bonnes mœurs et à la morale ainsi que les inventions pouvant porter atteinte à la santé humaine et animale, à la préservation des végétaux et à l'environnement ;</li>
        <li>les végétaux et les animaux autres que les micro-organismes ; les procédés essentiellement biologiques d'obtention de végétaux ou d'animaux, autres que les procédés non biologiques et microbiologiques ;</li>
        <li>le logiciel ;</li>
        <li>Les méthodes mathématiques, les systèmes, les plans, les découvertes et les théories scientifiques ainsi que les abstractions de pure forme qui ne résolvent pas un problème concret ou ne donnent pas une solution technique tangible, sans préjudice de la protection des applications pratiques qui les incorporeraient selon les exigences de l'article 5 ;</li>
        <li>les méthodes diagnostiques, thérapeutiques et chirurgicales pour le traitement des personnes ou des animaux ainsi que les nouvelles utilisations des médicaments.</li>
        <li>les substances naturelles, même si elles sont purifiées, synthétisées ou isolées d'une autre manière de la nature ; cette disposition ne s'applique pas aux procédés permettant d'isoler ces substances naturelles de leur environnement original</li>
      </ol>
    `
  },
  { 
    title: "Comment obtenir un brevet d'invention à Madagascar ?", 
    open: false,
    contentHTML: `
      <p>Faire une demande sous forme de formulaire (à télécharger sur notre site) accompagnée de :</p>
      <ul class="styled-list">
        <li>récépissé attestant le paiement des taxes prescrites</li>
        <li>description de l'invention (en FR)</li>
        <li>revendication(s) (en FR)</li>
        <li>planches de dessins (si c'est nécessaire)</li>
        <li>abrégé (en FR)</li>
      </ul>
    `
  },
  { 
    title: "Quels sont les droits découlant du brevet d'invention ?", 
    open: false,
    contentHTML: `
      <ul class="styled-list">
        <li><strong>Lorsque le brevet a été accordé pour un produit :</strong> Droit d'interdire aux tiers de fabriquer, d'importer, d'offrir en vente, de vendre et d'utiliser le produit</li>
        <li><strong>Lorsque le brevet a été accordé pour un procédé :</strong> Droit d'interdire aux tiers d'employer le procédé ; de fabriquer, d'importer, d'offrir en vente, de vendre et d'utiliser le produit résultant de l'emploi du procédé</li>
      </ul>
    `
  },
  { 
    title: "Comment obtenir une extension de la protection de l'invention à l'étranger ?", 
    open: false,
    contentHTML: `
      <ul class="styled-list">
        <li>Suivant le système de PCT (avec assistance de l'office si nécessaire)</li>
        <li>En déposant une demande de protection directement dans les offices de PI des pays choisis</li>
      </ul>
    `
  },
  { 
    title: "Que faire en cas de violation des droits sur un brevet d'invention ?", 
    open: false,
    contentHTML: `
      <p>Pour toute atteinte portée aux droits rattachés aux brevets (la contrefaçon de produit) est punie d'un emprisonnement de trois mois à deux ans et d'une amende de 160 000 Ariary à 6.000.000 Ariary ou l'une de ces deux peines seulement.</p>
      <p>En cas de récidive, la peine sera portée au double.</p>
    `
  },
  { 
    title: "Procédure de traitement des demandes de brevet", 
    open: false,
    contentHTML: `
      <ul class="styled-list">
        <li>Réception de la demande</li>
        <li>Examen administratif</li>
        <li>Examen de fond</li>
        <li>Délivrance de brevet ou refus</li>
        <li>Publication dans la Gazette Officielle de la Propriété Industrielle</li>
      </ul>
    `
  }
]

const faqs = ref(accordionItems)

const toggleFaq = (index: number) => {
  faqs.value[index].open = !faqs.value[index].open
}

const taxesData = [
  { nature: "a) Taxe de dépôt couvrant les deux premières années pour les brevets et les certificats d'addition", plein: "180 000", reduit: "144 000", highlight: "green" },
  { nature: "b) Taxe pour chaque demande divisionnaire", plein: "10 000", reduit: "8 000", highlight: "" },
  { nature: "c) Taxe de revendication de priorité, par priorité revendiquée", plein: "65 000", reduit: "52 000", highlight: "" },
  { nature: "d) Taxe de longueur des revendications (par revendication, à partir de la onzième)", plein: "60 000", reduit: "48 000", highlight: "" },
  { nature: "e) Taxe additionnelle pour chaque page de la description à compter de la vingt et unième page", plein: "25 000", reduit: "20 000", highlight: "" },
  { nature: "f) Taxe de modification ou de rectification d'erreurs matérielles par page rectifiée ou remplacée", plein: "8 000", reduit: "6 400", highlight: "" },
  { isHeader: true, title: "g) Taxe de maintien en vigueur:" },
  { nature: "- de la 3ème à la 5ème année, par année", plein: "125 000", reduit: "100 000", highlight: "cyan" },
  { nature: "- de la 6ème à la 10ème année, par année", plein: "380 000", reduit: "304 000", highlight: "cyan" },
  { nature: "- de la 11ème à la 15ème année, par année", plein: "650 000", reduit: "520 000", highlight: "cyan" },
  { nature: "h) Taxe pour l'extension de la protection au-delà de la 15ème année", plein: "40 000", reduit: "32 000", highlight: "" },
  { nature: "i) Taxe de maintien en vigueur de la 16ème à la 20ème année, par année", plein: "750 000", reduit: "600 000", highlight: "" },
  { nature: "j) Surtaxe pour paiement tardif d'annuité", plein: "50 000", reduit: "40 000", highlight: "red" },
  { nature: "k) Taxe d'inscription ou de radiation sur le registre des brevets et certificats d'addition", plein: "30 000", reduit: "24 000", highlight: "" },
  { nature: "l) Taxe pour la délivrance d'un état des versements des annuités", plein: "10 000", reduit: "8 000", highlight: "" },
  { nature: "m) Taxe pour la délivrance d'un état des inscriptions au registre", plein: "10 000", reduit: "8 000", highlight: "" },
  { nature: "n) Taxe pour la transmission d'une copie officielle du brevet ou du certificat d'addition", plein: "25 000", reduit: "20 000", highlight: "" },
  { nature: "o) Taxe pour la restauration d'un droit à agir, par dossier", plein: "65 000", reduit: "52 000", highlight: "" },
  { nature: "p) Taxe de délivrance de document de priorité", plein: "10 000", reduit: "8 000", highlight: "" },
  { nature: "q) Taxe de recherche", plein: "35 000", reduit: "28 000", highlight: "" },
  { nature: "r) Taxe supplémentaire par élément trouvé pour une recherche spéciale", plein: "5 000", reduit: "4 000", highlight: "" },
  { nature: "s) Taxe pour l'impression d'un document de brevet, par page", plein: "375", reduit: "300", highlight: "" },
  { nature: "t) Taxe de certification, par cas", plein: "4 000", reduit: "3 200", highlight: "" },
  { nature: "u) Taxe pour la délivrance d'une attestation", plein: "10 000", reduit: "8 000", highlight: "" }
]
</script>

<template>
  <main class="page-container fade-in">
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
      
      <!-- Présentation Section (Default) -->
      <div v-if="activeTab === 'Présentation'" class="fade-in">
        <!-- Section 1: Hero Image with Text Overlay -->
        <section class="hero-section">
          <div class="hero-image bg-windmills">
            <div class="hero-overlay-box glass-dark">
              <h2>Brevet d'Invention</h2>
              <p class="mt-15">
                <strong>La protection de vos innovations technologiques.</strong>
              </p>
              <p class="mt-15 text-sm">
                Un brevet protège une invention offrant une nouvelle solution technique à un problème. À Madagascar, l'OMAPI délivre ces titres de propriété industrielle pour garantir l'exclusivité de votre exploitation.
              </p>
            </div>
          </div>
        </section>

        <!-- Section 2: Three Information Tabs -->
        <section class="tabs-section">
          <div class="info-tabs-container">
            <button 
              v-for="tab in infoTabs" 
              :key="tab"
              :class="['info-tab-btn', { active: activeInfoTab === tab }]"
              @click="activeInfoTab = tab"
            >
              {{ tab }}
            </button>
          </div>

          <div class="tab-content-area glass mt-20 fade-in" v-if="activeInfoTab === 'BREVET ?'">
            <h3 class="text-blue mb-20">Qu'est-ce qu'un brevet d'invention ?</h3>
            <p class="mb-15">Un brevet est un droit exclusif conféré par l’État sur une invention qui est nouvelle, implique une activité inventive et est susceptible d’application industrielle.</p>
            <p>A Madagascar, c'est l'Office Malgache de la Propriété Industrielle (OMAPI) qui délivre les brevets d'invention, conformément aux dispositions de l'ordonnance n° 89-019 du 31 juillet 1989 instituant un régime pour la protection de la propriété industrielle et les décrets d'application y subséquents (décrets n° 92-993 et n° 92-994 du 2 décembre 1992).</p>
          </div>

          <div class="tab-content-area glass mt-20 fade-in" v-else-if="activeInfoTab === 'Invention ?'">
            <h3 class="text-orange mb-20">Qu'est-ce qu'une invention ?</h3>
            <p class="mb-15">Dans le jargon des brevets, une invention est généralement définie comme étant une solution nouvelle et inventive à un problème technique.</p>
            <p>Elle peut porter sur la création d’un dispositif, d’un produit, d’une méthode ou d’un procédé entièrement nouveau, ou peut seulement consister à améliorer de manière progressive un produit ou un procédé connu.</p>
          </div>

          <div class="tab-content-area glass mt-20 fade-in" v-else-if="activeInfoTab === 'Brevetabilité'">
            <h3 class="text-teal mb-20">Conditions de Brevetabilité</h3>
            <p class="mb-20">Pour qu'une invention puisse être brevetée à Madagascar, il faut que les conditions suivantes soient remplies :</p>
            <ul class="styled-list">
              <li><strong>L'invention doit être nouvelle :</strong> elle doit comporter une caractéristique nouvelle qui ne fait pas partie du fonds de connaissances existantes dans le domaine technique considéré, autrement dit, l'invention n'a pas fait l'objet d'une divulgation où que ce soit et par quelque moyen que ce soit (écrit ou oral).</li>
              <li><strong>L'invention doit résulter d'une activité inventive :</strong> elle ne doit pas être évidente pour une personne ayant une connaissance moyenne du domaine technique considéré.</li>
              <li><strong>L'invention doit être susceptible d'application industrielle :</strong> son objet peut être réalisé et produit dans l'industrie au sens large du terme, ce qui inclut l'agriculture, la pêche, l'artisanat, etc.</li>
            </ul>
          </div>
        </section>

        <!-- Section 3: Accordion List (Orange Bars) -->
        <section class="accordion-section">
          <div class="accordion-container">
            <div 
              v-for="(faq, index) in faqs" 
              :key="index"
              class="accordion-item"
            >
              <button class="accordion-header" @click="toggleFaq(index)" :class="{ 'is-open': faq.open }">
                {{ faq.title }}
                <span class="icon">{{ faq.open ? '−' : '+' }}</span>
              </button>
              <div class="accordion-content" v-show="faq.open">
                <div v-html="faq.contentHTML" class="faq-content-inner"></div>
              </div>
            </div>
          </div>
        </section>
      </div>

      <!-- Procédure de demande -->
      <div v-else-if="activeTab === 'Procédure de demande'" class="fade-in">
        <div class="procedure-section text-center">
          <h2 class="mb-30" style="color: var(--primary-blue);">Schéma de dépôt de brevet</h2>
          <div class="infographic-container mb-30">
            <!-- Infographic placeholder matching the image dimension ideally -->
            <div class="placeholder-infographic">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon-large" style="width: 4rem; height: 4rem; margin-bottom: 15px; color: var(--secondary-blue);"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="9" y1="3" x2="9" y2="21"></line><line x1="17" y1="9" x2="9" y2="9"></line><line x1="17" y1="17" x2="9" y2="17"></line></svg>
              <p>Schéma interactif ou infographie</p>
            </div>
          </div>
          <a href="http://www.omapi.mg/assets/procedure_br.jpg" target="_blank" class="download-btn glass-hover">
            Télécharger l'Infographie
          </a>
        </div>
      </div>

      <!-- Formulaire -->
      <div v-else-if="activeTab === 'Formulaire'" class="fade-in">
        <h2 class="text-center mb-40" style="color: var(--primary-blue);">Formulaires en matière de Brevet</h2>
        <p class="text-center mb-30 text-light-grey">Cliquez sur un document pour télécharger le formulaire de votre choix.</p>
        <div class="docs-grid">
          <a href="http://www.omapi.mg/assets/f4_demande-de-brevet-d-invention.doc" target="_blank" class="doc-card glass-hover">
            <div class="doc-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width: 24px; height: 24px; color: var(--secondary-blue);"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line></svg></div>
            <div class="doc-title">DEMANDE DE BREVET D'INVENTION ET CERTIFICAT D'ADDITION</div>
          </a>
          <a href="http://www.omapi.mg/assets/f7_prolongation_brevet.rtf" target="_blank" class="doc-card glass-hover">
            <div class="doc-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width: 24px; height: 24px; color: var(--secondary-blue);"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line></svg></div>
            <div class="doc-title">DEMANDE DE PROLONGATION D'UN BREVET D'INVENTION</div>
          </a>
          <a href="http://www.omapi.mg/assets/n_3_inscription_modification.doc" target="_blank" class="doc-card glass-hover">
            <div class="doc-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width: 24px; height: 24px; color: var(--secondary-blue);"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line></svg></div>
            <div class="doc-title">DEMANDE D'INSCRIPTION D'UNE MODIFICATION</div>
          </a>
          <a href="http://www.omapi.mg/assets/n_2_concession_de_licence.doc" target="_blank" class="doc-card glass-hover">
            <div class="doc-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width: 24px; height: 24px; color: var(--secondary-blue);"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line></svg></div>
            <div class="doc-title">DEMANDE D'INSCRIPTION D'UNE CONCESSION DE LICENCE</div>
          </a>
          <a href="http://www.omapi.mg/assets/n_2_concession_de_licence.doc" target="_blank" class="doc-card glass-hover">
            <div class="doc-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width: 24px; height: 24px; color: var(--secondary-blue);"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line></svg></div>
            <div class="doc-title">DEMANDE D'INSCRIPTION D'UNE CESSION</div>
          </a>
        </div>
      </div>

      <!-- PCT Section -->
      <div v-else-if="activeTab === 'PCT'" class="fade-in text-center pct-section">
        <div class="pct-card glass">
          <div class="wipo-logo mb-20">WIPO | PCT</div>
          <h2 class="mb-20" style="color: var(--primary-blue);">Traité de coopération en matière de brevets (PCT)</h2>
          <p class="mb-30" style="max-width: 700px; margin: 0 auto 30px auto; line-height: 1.6; color: var(--text-dark);">
            Le PCT permet de demander la protection d'une invention par brevet simultanément dans un grand nombre de pays en déposant une demande "internationale" de brevet unique au lieu de déposer plusieurs demandes nationales ou régionales distinctes.
          </p>
          <a href="https://www.wipo.int/treaties/fr/registration/pct/" target="_blank" class="wipo-btn glass-hover">
            Visiter le site de l'OMPI pour le PCT
          </a>
        </div>
      </div>

      <!-- Taxes: Brevet -->
      <div v-else-if="activeTab === 'Taxes: Brevet'" class="fade-in taxes-section-container">
        <div class="text-center mb-40">
          <p class="text-sm text-light-grey mb-10">Taxes 2013 BARÈME DES TAXES DE PROPRIÉTÉ INDUSTRIELLE (Arrêté n° 12285/2013)</p>
          <h2 style="color: var(--primary-blue);">I. TAXES EN MATIÈRE DE BREVETS D'INVENTION</h2>
        </div>

        <div class="taxes-section">
          <div class="taxes-table-wrapper">
            <table class="taxes-table">
              <thead>
                <tr>
                  <th class="col-nature">NATURE</th>
                  <th class="col-plein text-right">Plein tarif (en ariary)</th>
                  <th class="col-reduit text-right">Tarif réduit (en ariary)</th>
                </tr>
              </thead>
              <tbody>
                <tr 
                  v-for="(row, idx) in taxesData" 
                  :key="idx"
                  :class="{
                    'header-row': row.isHeader,
                    'row-bg-green': row.highlight === 'green',
                    'row-bg-cyan': row.highlight === 'cyan',
                    'row-bg-red': row.highlight === 'red'
                  }"
                >
                  <td v-if="row.isHeader" colspan="3">{{ row.title }}</td>
                  <template v-else>
                    <td>{{ row.nature }}</td>
                    <td class="text-right">{{ row.plein }}</td>
                    <td class="text-right">{{ row.reduit }}</td>
                  </template>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

    </div>

    <!-- Divider matching the image's layout -->
    <div class="thick-divider-teal mt-60"></div>

  </main>
</template>

<style scoped>
.page-container {
  min-height: 80vh;
  padding-bottom: 0px; 
}

/* Sub Navigation */
.sub-nav {
  background: var(--white);
  border-bottom: 1px solid rgba(0,0,0,0.05);
  box-shadow: 0 4px 10px rgba(0,0,0,0.02);
  margin-bottom: 40px;
}

.sub-nav-container {
  display: flex;
  justify-content: center;
  overflow-x: auto;
  gap: 20px;
  padding: 0 10px;
}

.sub-nav-container::-webkit-scrollbar { height: 4px; }
.sub-nav-container::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.1); border-radius: 4px; }

.tab-btn {
  background: transparent;
  color: var(--text-light);
  font-weight: 600;
  font-size: 0.95rem;
  padding: 15px 30px;
  white-space: nowrap;
  position: relative;
  transition: all 0.3s;
}

.tab-btn:hover { color: var(--primary-blue); background: rgba(0,0,0,0.02); }
.tab-btn.active { color: var(--primary-blue); }
.tab-btn.active::after {
  content: '';
  position: absolute;
  bottom: 0; left: 0; width: 100%; height: 3px;
  background: var(--accent-orange);
}

/* Hero Section */
.hero-section {
  margin-bottom: 40px;
}

.hero-image {
  position: relative;
  width: 100%;
  height: 450px;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0,0,0,0.15);
  display: flex;
  justify-content: flex-end;
  align-items: stretch;
}

.bg-windmills {
  background: linear-gradient(to top, #4b3e36 0%, #3e6080 30%, #5684aa 100%);
}

.bg-windmills::before {
  content: '';
  position: absolute;
  bottom: 10%; left: 15%;
  width: 4px; height: 150px;
  background: rgba(255,255,255,0.7);
  box-shadow: 0 0 10px rgba(255,255,255,0.2);
}
.bg-windmills::after {
  content: '';
  position: absolute;
  bottom: 25%; left: 12%;
  width: 2px; height: 80px;
  background: rgba(255,255,255,0.8);
  transform: rotate(30deg);
}

.hero-overlay-box {
  width: 45%;
  min-width: 350px;
  padding: 40px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.glass-dark {
  background: rgba(18, 30, 48, 0.7);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-left: 1px solid rgba(255, 255, 255, 0.1);
  color: var(--white);
}

.glass-dark h2 {
  font-size: 1.6rem;
  font-weight: 700;
  text-shadow: 0 2px 4px rgba(0,0,0,0.5);
}

.mt-15 { margin-top: 15px; line-height: 1.5; }
.text-sm { font-size: 0.85rem; opacity: 0.9; line-height: 1.6; }

/* Tabs Section */
.info-tabs-container {
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-bottom: 50px;
}

.info-tab-btn {
  padding: 12px 30px;
  border: 1px solid #d1d5db;
  background: var(--white);
  color: var(--text-dark);
  font-weight: 600;
  border-radius: 6px;
  box-shadow: 0 2px 5px rgba(0,0,0,0.05);
  min-width: 150px;
}

.info-tab-btn:hover { background: #f9fafb; }
.info-tab-btn.active {
  background: #56a5ee;
  color: var(--white);
  border-color: #56a5ee;
  box-shadow: 0 4px 10px rgba(86, 165, 238, 0.3);
}

.tab-content-area {
  padding: 30px;
  border-radius: 12px;
  background: var(--white);
  box-shadow: 0 4px 15px rgba(0,0,0,0.05);
  border: 1px solid #e2e8f0;
  max-width: 900px;
  margin: 0 auto 50px auto;
  line-height: 1.6;
  color: var(--text-dark);
}

.text-blue { color: var(--primary-blue); }
.text-orange { color: var(--accent-orange); }
.text-teal { color: #00BFA5; }
.mb-15 { margin-bottom: 15px; }
.mt-20 { margin-top: 20px; }

/* Accordion Section */
.accordion-section { max-width: 900px; margin: 0 auto 50px auto; }
.accordion-container { display: flex; flex-direction: column; gap: 8px; }
.accordion-item { border-radius: 6px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.05); }

.accordion-header {
  width: 100%;
  text-align: left;
  padding: 18px 25px;
  background: #E87A5D;
  color: var(--white);
  font-weight: 600;
  font-size: 1.05rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: background 0.3s;
}

.accordion-header:hover { background: #d8694d; }
.accordion-header.is-open { background: #c7563a; }
.accordion-header .icon { font-size: 1.4rem; font-weight: 400; }

.accordion-content {
  background: var(--white);
  padding: 25px;
  border: 1px solid #e5e7eb;
  border-top: none;
  border-radius: 0 0 6px 6px;
  color: var(--text-dark);
  line-height: 1.6;
}

/* FAQ List Styles */
.faq-content-inner p { margin-bottom: 12px; }
.styled-list { list-style: none; padding-left: 0; margin-top: 10px; }
.styled-list li { position: relative; padding-left: 25px; margin-bottom: 12px; }
.styled-list li::before { 
  content: '✓'; position: absolute; left: 0; color: #E87A5D; font-weight: bold; 
}
.styled-list-numbers { padding-left: 20px; }
.styled-list-numbers li { margin-bottom: 12px; }

/* Procedure Section */
.procedure-section { padding: 40px 0; }
.infographic-container {
  display: flex; justify-content: center; margin: 0 auto;
}
.placeholder-infographic {
  background: #f1f5f9;
  border: 2px dashed #cbd5e1;
  border-radius: 12px;
  width: 100%;
  max-width: 800px;
  height: 400px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: #64748b;
}
.icon-large { font-size: 4rem; margin-bottom: 15px; }

.download-btn {
  display: inline-block;
  background: var(--accent-orange);
  color: white;
  padding: 15px 30px;
  border-radius: 8px;
  text-decoration: none;
  font-weight: bold;
  box-shadow: 0 4px 15px rgba(232, 122, 93, 0.3);
}

/* Formulaire Section */
.docs-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 15px;
}

.doc-card {
  display: flex;
  align-items: center;
  padding: 15px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  text-decoration: none;
  color: #334155;
  transition: all 0.3s ease;
}
.doc-card:hover {
  background: var(--white);
  box-shadow: 0 4px 15px rgba(0, 136, 204, 0.15);
  transform: translateY(-2px);
  border-color: #bae6fd;
}
.doc-icon { font-size: 1.5rem; margin-right: 15px; }
.doc-title { font-size: 0.9rem; font-weight: 500; line-height: 1.4; }
.text-light-grey { color: #64748b; }

/* PCT Section */
.pct-section { padding: 60px 0; }
.pct-card {
  max-width: 800px;
  margin: 0 auto;
  padding: 50px;
  border-radius: 16px;
  border: 1px solid rgba(0,0,0,0.05);
}
.wipo-logo {
  display: inline-block;
  background: #00b4db;
  color: white;
  padding: 10px 20px;
  border-radius: 6px;
  font-weight: 800;
  letter-spacing: 1px;
}
.wipo-btn {
  display: inline-block;
  background: #1e3a8a;
  color: white;
  padding: 15px 30px;
  border-radius: 8px;
  text-decoration: none;
  font-weight: bold;
}
.mb-20 { margin-bottom: 20px; }
.mb-30 { margin-bottom: 30px; }
.mb-40 { margin-bottom: 40px; }

/* Taxes Section */
.taxes-section {
  max-width: 1000px;
  margin: 0 auto 50px auto;
  background: var(--white);
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.05);
  overflow: hidden;
  border: 1px solid #e2e8f0;
}

.taxes-table-wrapper {
  overflow-x: auto;
}

.taxes-table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
  font-size: 0.95rem;
}

.taxes-table th {
  background: #E87A5D; /* Orange matching image */
  color: white;
  padding: 16px 20px;
  font-weight: 600;
  white-space: nowrap;
}

.taxes-table th.col-nature { width: 60%; }
.taxes-table th.col-plein { width: 20%; text-align: right; }
.taxes-table th.col-reduit { width: 20%; text-align: right; }

.taxes-table td {
  padding: 14px 20px;
  border-bottom: 1px solid #e2e8f0;
  vertical-align: middle;
  color: var(--text-dark);
}

.taxes-table td.text-right { text-align: right; font-weight: 500; }

.row-bg-green { background-color: #22c55e; color: white !important; }
.row-bg-green td { color: white !important; border-bottom-color: #16a34a; }

.row-bg-cyan { background-color: #67e8f9; }
.row-bg-cyan td { border-bottom-color: #22d3ee; }

.row-bg-red { background-color: #fca5a5; }
.row-bg-red td { border-bottom-color: #f87171; }

.taxes-table tr:last-child td { border-bottom: none; }
.taxes-table tr.header-row {
  background: #f1f5f9;
  font-weight: bold;
}
.taxes-table tr.header-row td {
  padding-top: 20px;
  padding-bottom: 10px;
  border-bottom: 2px solid #cbd5e1;
}

/* Thick Teal Divider */
.thick-divider-teal {
  height: 12px;
  background: #00BFA5;
  width: 100%;
}
.mt-60 { margin-top: 60px; }

@media (max-width: 768px) {
  .hero-image {
    flex-direction: column;
    height: auto;
    min-height: 500px;
  }
  .hero-overlay-box {
    width: 100%;
    border-left: none;
    border-top: 1px solid rgba(255,255,255,0.1);
    flex-grow: 1;
  }
  .info-tabs-container {
    flex-direction: column;
    align-items: stretch;
  }
  .pct-card { padding: 30px; }
}
</style>
