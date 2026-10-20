<script setup lang="ts">
import { ref } from 'vue'

const subNavItems = [
  'Présentation',
  'Taxes de dépôt N.C',
  'Formulaire N.C',
  'Avantages'
]

const activeTab = ref(subNavItems[0])
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

      <!-- Présentation Tab -->
      <div v-if="activeTab === 'Présentation'" class="fade-in">
        <section class="hero-card glass">
          <h2 class="text-orange">QU'EST-CE QU'UN NOM COMMERCIAL ?</h2>
          <p>
            Un nom commercial est la dénomination sous laquelle est connue une entreprise ou un établissement commercial, industriel, artisanal ou agricole. Exemples : Société MIALY, Entreprise Rakoto & Fils, ...). Comme les marques, les noms commerciaux permettent d'identifier une entreprise.
          </p>
        </section>

        <section class="protection-section row-section">
          <div class="visual-block text-center">
            <div class="lock-icon-container">
              <svg class="lock-icon" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C9.243 2 7 4.243 7 7V10H6C4.897 10 4 10.897 4 12V20C4 21.103 4.897 22 6 22H18C19.103 22 20 21.103 20 20V12C20 10.897 19.103 10 18 10H17V7C17 4.243 14.757 2 12 2ZM9 7C9 5.346 10.346 4 12 4C13.654 4 15 5.346 15 7V10H9V7ZM12 18C10.897 18 10 17.103 10 16C10 14.897 10.897 14 12 14C13.103 14 14 14.897 14 16C14 17.103 13.103 18 12 18Z"/>
              </svg>
            </div>
          </div>
          <div class="text-block text-content">
            <h2 class="text-blue">Comment protéger un nom commercial ?</h2>
            <p>A l'instar des marques, il faut d'abord s'assurer que la dénomination concernée ne soit pas à priori exclue de la protection selon les textes législatifs (article 118 de l'ordonnance n°89-019 du 31/07/89 instituant un régime pour la protection de la propriété industrielle à Madagascar).</p>
            <p>À la demande, une recherche d'antériorité est effectuée par l'Office parmi les marques et les noms commerciaux déjà déposés ou enregistrés. En effet, la législation en vigueur interdit l'enregistrement d'une dénomination qui peut porter atteinte à un droit antérieur.</p>
            <p>Un exemplaire du formulaire n°15 (demande d'enregistrement d'un nom commercial) comportant les références et les cachets d'authentification de l'Office est remis au déposant au moment même du dépôt, à titre de notification.</p>
          </div>
        </section>

        <section class="notice-banner fade-in">
          <p>
            La procédure de dépôt d'un nom commercial dont l'enregistrement est demandé est identique à celle des marques : recherche d'antériorité et dépôt proprement dit (cf. Procédure d'enregistrement). La seule différence réside au niveau des pièces à fournir (moins nombreuses) ainsi que du montant des taxes à payer (moins élevées).
          </p>
        </section>

        <section class="info-card glass mb-40">
          <div class="card-content">
            <h3 class="text-blue">L'enregistrement d'un nom commercial</h3>
            <ul class="styled-list">
              <li>L'OMAPI procède à l'enregistrement de la dénomination déposée lorsque les conditions prescrites par la législation en vigueur sont remplies.</li>
              <li>Le nom commercial enregistré est publié à la Gazette Officielle de la Propriété Industrielle (GOPI).</li>
              <li>La notification d'enregistrement est délivrée au déposant après une période d'un an environ après la date de dépôt de la demande.</li>
            </ul>
          </div>
        </section>
      </div>

      <!-- Taxes de dépôt N.C Tab -->
      <div v-else-if="activeTab === 'Taxes de dépôt N.C'" class="fade-in">
        <h2 class="text-center mb-40 text-blue">TAXES EN MATIÈRE DE NOMS COMMERCIAUX</h2>
        <div class="tax-info-card glass text-center" style="max-width: 800px; margin: 0 auto 50px auto; padding: 40px; border-top: 4px solid var(--accent-orange);">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width: 3rem; height: 3rem; margin: 0 auto 20px auto; color: var(--accent-orange);"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
          <h3 style="color: var(--primary-blue); font-size: 1.5rem; margin-bottom: 20px;">BARÈME DES TAXES DE PROPRIÉTÉ INDUSTRIELLE</h3>
          <p style="font-size: 1.1rem; color: var(--text-dark); background: #f8fafc; padding: 15px; border-radius: 8px; display: inline-block;">
            <strong>Arrêté n° 12285/2013</strong>
          </p>
          <p class="mt-20 text-light-grey" style="margin-top: 20px; color: #64748b;">
            Veuillez vous référer au barème officiel de l'OMAPI pour consulter le détail complet des taxes de dépôt pour les noms commerciaux.
          </p>
        </div>
      </div>

      <!-- Formulaire N.C Tab -->
      <div v-else-if="activeTab === 'Formulaire N.C'" class="fade-in">
        <h2 class="text-center mb-40" style="color: var(--primary-blue);">Formulaires en matière des Noms Commerciaux</h2>
        <p class="text-center mb-30" style="color: #64748b;">Cliquez sur un document pour télécharger le formulaire de votre choix.</p>
        <div class="docs-grid">
          <a href="http://www.omapi.mg/assets/n_15_enregistrement_denomination_commerciale2.doc" target="_blank" class="doc-card glass-hover">
            <div class="doc-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width: 24px; height: 24px; color: var(--secondary-blue);"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line></svg></div>
            <div class="doc-title">DEMANDE D'ENREGISTREMENT D'UNE DÉNOMINATION COMMERCIALE</div>
          </a>
          <a href="http://www.omapi.mg/assets/n_16_renouvellement_nc.doc" target="_blank" class="doc-card glass-hover">
            <div class="doc-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width: 24px; height: 24px; color: var(--secondary-blue);"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line></svg></div>
            <div class="doc-title">DEMANDE DE RENOUVELLEMENT D'ENREGISTREMENT DE DÉNOMINATION COMMERCIALE</div>
          </a>
          <a href="http://www.omapi.mg/assets/recherche_nom_com.doc" target="_blank" class="doc-card glass-hover">
            <div class="doc-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width: 24px; height: 24px; color: var(--secondary-blue);"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line></svg></div>
            <div class="doc-title">DEMANDE DE RECHERCHE D'ANTÉRIORITÉ DE NOM COMMERCIAL</div>
          </a>
          <a href="http://www.omapi.mg/assets/n_3_inscription_modification-2-.doc" target="_blank" class="doc-card glass-hover">
            <div class="doc-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width: 24px; height: 24px; color: var(--secondary-blue);"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line></svg></div>
            <div class="doc-title">DEMANDE D'INSCRIPTION D'UNE MODIFICATION</div>
          </a>
          <a href="http://www.omapi.mg/assets/n_2_concession_de_licence.doc" target="_blank" class="doc-card glass-hover">
            <div class="doc-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width: 24px; height: 24px; color: var(--secondary-blue);"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line></svg></div>
            <div class="doc-title">DEMANDE D'INSCRIPTION D'UNE CONCESSION DE LICENCE</div>
          </a>
        </div>
      </div>

      <!-- Avantages Tab -->
      <div v-else-if="activeTab === 'Avantages'" class="fade-in">
        <div class="info-card glass mb-40">
          <div class="card-content">
            <h2 class="text-blue mb-30 text-center">Quels sont les droits découlant de l'enregistrement d'un nom commercial ?</h2>
            <ul class="styled-list">
              <li>L'enregistrement d'un nom commercial confère à son titulaire, sur le territoire national, le droit d'interdire aux tiers l'usage du nom commercial enregistré pour la même activité que celle du titulaire si cette utilisation est susceptible de créer une confusion entre les entreprises concernées ou d'induire le public en erreur.</li>
              <li>La violation des droits attachés à un nom commercial constitue, selon les textes en vigueur, un délit passible d'emprisonnement et/ou de paiement d'amendes.</li>
              <li>La durée de protection d'un nom commercial enregistré est de dix ans à partir de la date de dépôt.</li>
              <li>L'enregistrement peut être renouvelé, à la demande du titulaire, moyennant le paiement de la taxe prescrite, pour des périodes successives de dix ans.</li>
            </ul>
          </div>
        </div>

        <section class="footer-banner" style="border-radius: 12px; margin-bottom: 40px;">
          <div class="text-center" style="padding: 0 20px;">
            <h3>Les inscriptions au Registre spécial des noms commerciaux</h3>
            <p>
              Les actes relatifs à un nom commercial déposé ou enregistré, tels que la cession ou la transmission doivent être transcrits sur le Registre spécial des noms commerciaux, pour être opposable aux tiers. Il existe des formulaires à remplir à cet effet, en plus des taxes à payer.
            </p>
          </div>
        </section>
      </div>

    </div>
  </main>
</template>

<style scoped>
.page-container {
  min-height: 80vh;
  padding-bottom: 60px;
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

.tab-btn:hover {
  color: var(--primary-blue);
  background: rgba(0,0,0,0.02);
}

.tab-btn.active { color: var(--primary-blue); }
.tab-btn.active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 3px;
  background: var(--accent-orange);
}

.content-wrapper { display: flex; flex-direction: column; gap: 30px; }

/* Text Utilities */
.text-orange { color: #E87A5D; }
.text-blue { color: var(--secondary-blue); }
.mb-40 { margin-bottom: 40px; }
.mb-30 { margin-bottom: 30px; }

/* Hero Card */
.hero-card {
  padding: 40px;
  text-align: center;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.9);
  border-top: 4px solid #E87A5D;
  margin-bottom: 50px;
}

.hero-card h2 {
  font-size: 1.5rem;
  margin-bottom: 15px;
  font-weight: 700;
  letter-spacing: 0.5px;
}

.hero-card p {
  font-size: 1.05rem;
  line-height: 1.6;
  max-width: 900px;
  margin: 0 auto;
}

/* Row Section */
.row-section {
  display: flex;
  align-items: center;
  gap: 50px;
  margin-bottom: 50px;
}

.visual-block {
  flex: 0 0 250px;
  display: flex;
  justify-content: center;
}

.lock-icon-container {
  width: 160px;
  height: 160px;
  background: #334155;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 15px 30px rgba(51, 65, 85, 0.3);
  position: relative;
  overflow: hidden;
}

.lock-icon-container::after {
  content: '';
  position: absolute;
  bottom: 0; right: 0; width: 50%; height: 50%;
  background: rgba(255,255,255,0.05);
  border-top-left-radius: 100%;
}

.lock-icon {
  width: 60px;
  height: 60px;
  color: var(--white);
}

.text-content h2 {
  font-size: 1.5rem;
  margin-bottom: 20px;
  font-weight: 700;
}

.text-content p {
  margin-bottom: 15px;
  line-height: 1.7;
  color: var(--text-dark);
}

/* Notice Banner */
.notice-banner {
  background: var(--secondary-blue);
  color: var(--white);
  padding: 30px 40px;
  border-radius: 12px;
  text-align: center;
  margin-bottom: 50px;
  box-shadow: 0 10px 25px rgba(0, 136, 204, 0.2);
}

.notice-banner p {
  font-size: 1.05rem;
  line-height: 1.6;
  font-weight: 500;
  margin: 0;
}

/* Info Columns */
.info-card {
  overflow: hidden;
  border-radius: 16px;
  transition: transform 0.3s ease;
  display: flex;
  flex-direction: column;
}

.info-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 15px 35px rgba(31, 38, 135, 0.1);
}

.card-content {
  padding: 40px;
  flex-grow: 1;
  background: var(--white);
}

.card-content h3 {
  font-size: 1.25rem;
  margin-bottom: 20px;
  line-height: 1.4;
  font-weight: 700;
}

.styled-list {
  list-style: none;
  padding: 0;
}

.styled-list li {
  position: relative;
  padding-left: 25px;
  margin-bottom: 15px;
  line-height: 1.6;
  font-size: 1rem;
  color: var(--text-dark);
}

.styled-list li::before {
  content: '';
  position: absolute;
  left: 0;
  top: 8px;
  width: 8px;
  height: 8px;
  background-color: var(--accent-orange);
  border-radius: 50%;
}

/* Docs Grid */
.docs-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 20px;
}

.doc-card {
  display: flex;
  align-items: center;
  padding: 20px;
  background: var(--white);
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  text-decoration: none;
  color: #334155;
  transition: all 0.3s ease;
  box-shadow: 0 4px 10px rgba(0,0,0,0.02);
}

.doc-card:hover {
  background: #f8fafc;
  box-shadow: 0 8px 20px rgba(0, 136, 204, 0.15);
  transform: translateY(-3px);
  border-color: #bae6fd;
}

.doc-icon {
  font-size: 2rem;
  margin-right: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 50px;
  height: 50px;
  background: #f1f5f9;
  border-radius: 10px;
}

.doc-title {
  font-size: 0.95rem;
  font-weight: 600;
  line-height: 1.5;
  flex: 1;
}

/* Footer Banner */
.footer-banner {
  background: #00897B; /* Teal-like color */
  color: var(--white);
  padding: 40px 0;
}

.footer-banner h3 {
  font-size: 1.4rem;
  font-weight: 600;
  margin-bottom: 20px;
}

.footer-banner p {
  max-width: 800px;
  margin: 0 auto;
  line-height: 1.6;
  opacity: 0.95;
}

/* Responsiveness */
@media (max-width: 992px) {
  .row-section {
    flex-direction: column;
    text-align: center;
  }
  .visual-block {
    flex: 0 0 auto;
  }
}
</style>
