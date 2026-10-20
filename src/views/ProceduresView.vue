<script setup lang="ts">

</script>

<template>
  <main class="page-container fade-in" style="padding-top: 140px; padding-bottom: 60px;">
    
      <div class="icon-header">
        <span class="icon" style="display: flex; align-items: center; justify-content: center;">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="width: 40px; height: 40px; color: var(--primary-blue);"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
        </span>
      </div>
      <h1 class="page-title text-blue">Procédures d'Enregistrement</h1>
      <p class="page-subtitle text-dark">
        Consultez les procédures détaillées pour chaque type de propriété industrielle en sélectionnant la catégorie correspondante.
      </p>
    </div>

    <div class="container" style="max-width: 900px; margin: 0 auto;">
      <div class="procedures-grid fade-in">
        
        <router-link to="/marques" class="procedure-card glass-hover">
          <div class="proc-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width: 32px; height: 32px; color: var(--primary-blue);"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path><line x1="7" y1="7" x2="7.01" y2="7"></line></svg>
          </div>
          <div class="proc-content">
            <h3>Procédure pour les Marques</h3>
            <p>Découvrez les étapes de dépôt et d'enregistrement d'une marque (Recherche d'antériorité, Dépôt, etc.).</p>
          </div>
          <div class="arrow-icon" style="display: flex; align-items: center;">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="width: 18px; height: 18px;"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
          </div>
        </router-link>
        
        <router-link to="/brevets" class="procedure-card glass-hover">
          <div class="proc-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width: 32px; height: 32px; color: var(--accent-orange);"><path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .5 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"></path><line x1="9" y1="18" x2="15" y2="18"></line><line x1="10" y1="22" x2="14" y2="22"></line></svg>
          </div>
          <div class="proc-content">
            <h3>Procédure pour les Brevets</h3>
            <p>Consultez la procédure de traitement des demandes de brevet d'invention.</p>
          </div>
          <div class="arrow-icon" style="display: flex; align-items: center;">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="width: 18px; height: 18px;"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
          </div>
        </router-link>

        <router-link to="/modeles" class="procedure-card glass-hover">
          <div class="proc-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width: 32px; height: 32px; color: #00897B;"><path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"></path><path d="M7.5 10.5C8.32843 10.5 9 9.82843 9 9C9 8.17157 8.32843 7.5 7.5 7.5C6.67157 7.5 6 8.17157 6 9C6 9.82843 6.67157 10.5 7.5 10.5Z"></path><path d="M11.5 7.5C12.3284 7.5 13 6.82843 13 6C13 5.17157 12.3284 4.5 11.5 4.5C10.6716 4.5 10 5.17157 10 6C10 6.82843 10.6716 7.5 11.5 7.5Z"></path><path d="M16.5 9.5C17.3284 9.5 18 8.82843 18 8C18 7.17157 17.3284 6.5 16.5 6.5C15.6716 6.5 15 7.17157 15 8C15 8.82843 15.6716 9.5 16.5 9.5Z"></path><path d="M6 14C6 14.5523 5.55228 15 5 15C4.44772 15 4 14.5523 4 14C4 13.4477 4.44772 13 5 13C5.55228 13 6 13.4477 6 14Z"></path></svg>
          </div>
          <div class="proc-content">
            <h3>Procédure pour les Dessins et Modèles</h3>
            <p>Comprenez les étapes de dépôt et d'enregistrement des dessins ou modèles industriels.</p>
          </div>
          <div class="arrow-icon" style="display: flex; align-items: center;">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="width: 18px; height: 18px;"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
          </div>
        </router-link>

        <router-link to="/noms-commerciaux" class="procedure-card glass-hover">
          <div class="proc-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width: 32px; height: 32px; color: var(--secondary-blue);"><rect x="4" y="2" width="16" height="20" rx="2" ry="2"></rect><line x1="9" y1="22" x2="9" y2="16"></line><line x1="15" y1="22" x2="15" y2="16"></line><line x1="9" y1="16" x2="15" y2="16"></line></svg>
          </div>
          <div class="proc-content">
            <h3>Procédure pour les Noms Commerciaux</h3>
            <p>Procédure de dépôt et d'enregistrement des dénominations commerciales.</p>
          </div>
          <div class="arrow-icon" style="display: flex; align-items: center;">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="width: 18px; height: 18px;"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
          </div>
        </router-link>

      </div>
    </div>
  </main>
</template>

<style scoped>
.page-container {
  min-height: 80vh;
  background-color: #f8fafc;
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

/* Grid Styles */
.procedures-grid {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.procedure-card {
  display: flex;
  align-items: center;
  padding: 30px;
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

.procedure-card::before {
  content: '';
  position: absolute;
  top: 0; left: 0;
  width: 4px;
  height: 100%;
  background: var(--primary-blue);
  opacity: 0;
  transition: opacity 0.3s;
}

.procedure-card:hover {
  transform: translateX(10px);
  box-shadow: 0 12px 25px rgba(0, 136, 204, 0.1);
  border-color: #bae6fd;
}

.procedure-card:hover::before {
  opacity: 1;
}

.proc-icon {
  font-size: 2.5rem;
  margin-right: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 70px;
  height: 70px;
  background: #f1f5f9;
  border-radius: 16px;
  flex-shrink: 0;
  transition: background 0.3s;
}

.procedure-card:hover .proc-icon {
  background: #e0f2fe;
}

.proc-content {
  flex: 1;
}

.proc-content h3 {
  font-size: 1.3rem;
  font-weight: 700;
  color: var(--primary-blue);
  margin-bottom: 8px;
}

.proc-content p {
  font-size: 1rem;
  line-height: 1.5;
  color: #64748b;
  margin: 0;
}

.arrow-icon {
  font-size: 1.5rem;
  color: #cbd5e1;
  transition: all 0.3s;
  margin-left: 20px;
}

.procedure-card:hover .arrow-icon {
  color: var(--accent-orange);
  transform: translateX(5px);
}

/* Utilities */
.text-blue { color: var(--primary-blue); }
.text-dark { color: var(--text-dark); }
.mb-40 { margin-bottom: 40px; }

@media (max-width: 768px) {
  .procedure-card {
    flex-direction: column;
    text-align: center;
    padding: 25px;
  }
  
  .proc-icon {
    margin: 0 auto 20px auto;
  }
  
  .arrow-icon {
    display: none;
  }
}
</style>
