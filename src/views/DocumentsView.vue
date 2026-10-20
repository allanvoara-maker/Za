<script setup lang="ts">
import { ref } from 'vue'

const activeTab = ref('Marques')
const tabs = ['Marques', 'Noms Commerciaux', 'Brevets et Modèles']

// Data structure for forms
const forms = {
  'Marques': [
    { title: "DEMANDE DE RECHERCHE D'ANTÉRIORITÉ DE MARQUE", url: "http://www.omapi.mg/assets/recherche_mk2.doc" },
    { title: "DEMANDE D'ENREGISTREMENT DE MARQUE", url: "http://www.omapi.mg/assets/f9_marque_demande.doc" },
    { title: "DEMANDE D'INSCRIPTION D'UNE MODIFICATION", url: "http://www.omapi.mg/assets/n_3_inscription_modification.doc" },
    { title: "DEMANDE D'INSCRIPTION D'UNE CONCESSION DE LICENCE", url: "http://www.omapi.mg/assets/n_2_concession_de_licence.doc" },
    { title: "DEMANDE DE RENOUVELLEMENT D'ENREGISTREMENT DE MARQUE", url: "http://www.omapi.mg/assets/n_10_rennouvellement_mk.rtf" },
    { title: "DEMANDE D'INSCRIPTION D'UN TRANSFERT DE MARQUE", url: "http://www.omapi.mg/assets/formulaire_no11_cession_mk.rtf" }
  ],
  'Noms Commerciaux': [
    { title: "DEMANDE DE RECHERCHE D'ANTÉRIORITÉ DE NOM COMMERCIAL", url: "http://www.omapi.mg/assets/recherche-nom-com.doc" },
    { title: "DEMANDE D'ENREGISTREMENT D'UNE DÉNOMINATION COMMERCIALE", url: "http://www.omapi.mg/assets/n_15_enregistrement_denomination_commerciale.doc" },
    { title: "DEMANDE D'INSCRIPTION D'UNE MODIFICATION", url: "http://www.omapi.mg/assets/formulaire_inscription_de_modification_nc.doc" },
    { title: "DEMANDE D'INSCRIPTION D'UNE CONCESSION DE LICENCE", url: "http://www.omapi.mg/assets/n_2_concession_de_licence.doc" },
    { title: "DEMANDE DE RENOUVELLEMENT D'ENREGISTREMENT DE DÉNOMINATION COMMERCIALE", url: "http://www.omapi.mg/assets/n_16_renouvellement_nc.doc" }
  ],
  'Brevets et Modèles': [
    { title: "DEMANDE D'ENREGISTREMENT D'UN DESSIN OU MODÈLE INDUSTRIEL (Dépôt simple)", url: "http://www.omapi.mg/assets/n_f12_dess__mod_simplertf2.rtf" },
    { title: "DEMANDE D'ENREGISTREMENT D'UN DESSIN OU MODÈLE INDUSTRIEL (Dépôt multiple)", url: "http://www.omapi.mg/assets/f12_dessmod_multi.doc" },
    { title: "DEMANDE DE TRANSFERT DE DESSIN OU MODÈLE INDUSTRIEL", url: "http://www.omapi.mg/assets/n14_transfert-de-dessin-ou-modele.rtf" },
    { title: "DEMANDE DE RENOUVELLEMENT D'UN DESSIN OU MODÈLE INDUSTRIEL", url: "http://www.omapi.mg/assets/n_13_renouvellement_enregistrement_d_m.rtf" },
    { title: "DEMANDE DE BREVET D'INVENTION ET CERTIFICAT D'ADDITION", url: "http://www.omapi.mg/assets/f4_demande-de-brevet-d-invention.doc" },
    { title: "DEMANDE DE PROLONGATION D'UN BREVET D'INVENTION", url: "http://www.omapi.mg/assets/f7_prolongation_brevet.rtf" },
    { title: "DEMANDE D'INSCRIPTION D'UNE MODIFICATION", url: "http://www.omapi.mg/assets/n_3_inscription_modification.doc" },
    { title: "DEMANDE D'INSCRIPTION D'UNE CONCESSION DE LICENCE", url: "http://www.omapi.mg/assets/n_2_concession_de_licence.doc" }
  ]
}
</script>

<template>
  <main class="page-container fade-in" style="padding-top: 140px; padding-bottom: 60px;">
    
    <!-- Header Section -->
    <div class="container text-center mb-40">
      <div class="icon-header">
        <span class="icon" style="display: flex; align-items: center; justify-content: center;">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="width: 40px; height: 40px; color: var(--primary-blue);"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>
        </span>
      </div>
      <h1 class="page-title text-blue">Documents & Formulaires</h1>
      <p class="page-subtitle text-dark">
        Téléchargez tous les formulaires officiels de l'OMAPI nécessaires pour vos démarches administratives.
      </p>
    </div>

    <!-- Category Tabs -->
    <div class="container sub-nav-container mb-40">
      <button 
        v-for="tab in tabs" 
        :key="tab"
        :class="['tab-btn', { active: activeTab === tab }]"
        @click="activeTab = tab"
      >
        {{ tab }}
      </button>
    </div>

    <!-- Forms Grid -->
    <div class="container" style="max-width: 1000px; margin: 0 auto;">
      <div class="docs-grid fade-in">
        <a 
          v-for="(form, index) in forms[activeTab as keyof typeof forms]" 
          :key="index"
          :href="form.url" 
          target="_blank" 
          class="doc-card glass-hover"
        >
          <div class="doc-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width: 28px; height: 28px; color: var(--secondary-blue);"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line></svg></div>
          <div class="doc-title">{{ form.title }}</div>
          <div class="download-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="7 10 12 15 17 10"></polyline>
              <line x1="12" y1="15" x2="12" y2="3"></line>
            </svg>
          </div>
        </a>
      </div>
    </div>
    
  </main>
</template>

<style scoped>
.page-container {
  min-height: 80vh;
  background-color: #f8fafc; /* slight contrast background */
}

/* Header Styles */
.icon-header {
  width: 80px;
  height: 80px;
  background: var(--white);
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 20px auto;
  box-shadow: 0 10px 25px rgba(0,0,0,0.05);
}

.icon {
  font-size: 2.5rem;
}

.page-title {
  font-size: 2.2rem;
  font-weight: 700;
  margin-bottom: 15px;
}

.page-subtitle {
  font-size: 1.1rem;
  max-width: 600px;
  margin: 0 auto;
  line-height: 1.6;
  opacity: 0.8;
}

/* Tabs */
.sub-nav-container {
  display: flex;
  justify-content: center;
  gap: 15px;
  flex-wrap: wrap;
}

.tab-btn {
  background: var(--white);
  border: 1px solid rgba(0,0,0,0.05);
  color: var(--text-light);
  font-weight: 600;
  font-size: 0.95rem;
  padding: 12px 25px;
  border-radius: 30px;
  transition: all 0.3s;
  box-shadow: 0 4px 6px rgba(0,0,0,0.02);
}

.tab-btn:hover {
  color: var(--primary-blue);
  border-color: #bae6fd;
  transform: translateY(-2px);
}

.tab-btn.active { 
  background: var(--primary-blue);
  color: var(--white);
  box-shadow: 0 8px 15px rgba(0, 136, 204, 0.2);
}

/* Docs Grid */
.docs-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: 20px;
}

.doc-card {
  display: flex;
  align-items: center;
  padding: 25px;
  background: var(--white);
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  text-decoration: none;
  color: #334155;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(0,0,0,0.03);
  position: relative;
  overflow: hidden;
}

.doc-card::before {
  content: '';
  position: absolute;
  top: 0; left: 0;
  width: 4px;
  height: 100%;
  background: var(--accent-orange);
  opacity: 0;
  transition: opacity 0.3s;
}

.doc-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 12px 25px rgba(0, 136, 204, 0.1);
  border-color: #bae6fd;
}

.doc-card:hover::before {
  opacity: 1;
}

.doc-icon { 
  font-size: 2rem; 
  margin-right: 20px; 
  display: flex;
  align-items: center;
  justify-content: center;
  width: 60px;
  height: 60px;
  background: #f1f5f9;
  border-radius: 12px;
  flex-shrink: 0;
}

.doc-card:hover .doc-icon {
  background: #e0f2fe;
}

.doc-title { 
  font-size: 0.95rem; 
  font-weight: 600; 
  line-height: 1.5; 
  flex: 1;
  padding-right: 20px;
}

.download-icon {
  color: #94a3b8;
  transition: color 0.3s;
}

.doc-card:hover .download-icon {
  color: var(--primary-blue);
}

/* Utilities */
.text-blue { color: var(--primary-blue); }
.text-dark { color: var(--text-dark); }
.mb-40 { margin-bottom: 40px; }

@media (max-width: 768px) {
  .docs-grid {
    grid-template-columns: 1fr;
  }
}
</style>
