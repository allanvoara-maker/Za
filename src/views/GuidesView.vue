<script setup lang="ts">
const guides = [
  {
    title: "LETTRE DE DEMANDE DE RECHERCHE D'ANTÉRIORITÉ DE MARQUE",
    url: "http://www.omapi.mg/assets/lettre_ra_mk.docx",
    type: "docx"
  },
  {
    title: "Formulaire de Demande de Recherche d'Antériorité de Marque",
    url: "http://www.omapi.mg/assets/recherche_mk.doc",
    type: "doc"
  },
  {
    title: "Formulaire de Demande de Recherche d'Antériorité de nom commercial",
    url: "http://www.omapi.mg/assets/recherche-nom-commercial-.doc",
    type: "doc"
  },
  {
    title: "Guide pour le dépôt de nom commercial",
    url: "http://www.omapi.mg/assets/guide_pour_le_depot_nc.doc",
    type: "doc"
  },
  {
    title: "LETTRE DE Demande de recherche d'antériorité de Nom Commercial",
    url: "http://www.omapi.mg/assets/lettre-ra--nc-.docx",
    type: "docx"
  },
  {
    title: "GUIDE POUR LE DÉPÔT ELECTRONIQUE DE MARQUE",
    url: "http://www.omapi.mg/assets/f_r3_33_05_guide_depot_electronique_marque.docx",
    type: "docx"
  },
  {
    title: "GUIDE POUR LE DÉPÔT DE MARQUE",
    url: "http://www.omapi.mg/assets/guide_tm_f_r3_33_01_guide_de_depot_de_marque_fr.docx",
    type: "docx"
  }
]
</script>

<template>
  <main class="page-container fade-in">
    <div class="container" style="padding-top: 60px; padding-bottom: 80px;">
      
      <!-- Page Header -->
      <div class="text-center mb-60">
        <h1 class="page-title">Guides Pratiques</h1>
        <div class="title-underline"></div>
        <p class="text-light-grey mt-20" style="max-width: 600px; margin-left: auto; margin-right: auto;">
          Retrouvez ici l'ensemble des guides et formulaires officiels de l'OMAPI pour faciliter vos démarches de dépôt et de recherche d'antériorité.
        </p>
      </div>

      <!-- Grid of Guides -->
      <div class="docs-grid">
        <a 
          v-for="(guide, index) in guides" 
          :key="index"
          :href="guide.url" 
          target="_blank" 
          class="doc-card glass-hover"
        >
          <div class="doc-icon">
            <svg v-if="guide.type === 'pdf'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width: 24px; height: 24px; color: var(--primary-blue);"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path><rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect><line x1="9" y1="9" x2="15" y2="9"></line><line x1="9" y1="13" x2="15" y2="13"></line><line x1="9" y1="17" x2="15" y2="17"></line></svg>
            <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width: 24px; height: 24px; color: var(--secondary-blue);"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line></svg>
          </div>
          <div class="doc-title">{{ guide.title }}</div>
        </a>
      </div>

    </div>
  </main>
</template>

<style scoped>
.page-container {
  min-height: 80vh;
  background-color: var(--background-color);
}

.page-title {
  color: var(--primary-blue);
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 15px;
}

.title-underline {
  height: 4px;
  width: 60px;
  background: var(--accent-orange);
  margin: 0 auto;
  border-radius: 2px;
}

.text-light-grey { color: #64748b; font-size: 1.1rem; line-height: 1.6; }
.mb-60 { margin-bottom: 60px; }
.mt-20 { margin-top: 20px; }

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

@media (max-width: 768px) {
  .page-title { font-size: 2rem; }
  .docs-grid { grid-template-columns: 1fr; }
}
</style>
