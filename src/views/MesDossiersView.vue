<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useApplicationStore } from '../stores/applicationStore'

const store  = useApplicationStore()
const router = useRouter()

onMounted(() => {
  store.fetchDossiers()
})

const goToDetail = (id: string) => {
  router.push({ name: 'dossier-detail', params: { id } })
}
const filter = ref('Tous')
const confirmDeleteId = ref<string | null>(null)

const filteredDossiers = computed(() => {
  return store.dossiers.filter(d => {
    const matchesFilter = filter.value === 'Tous' || d.type === filter.value
    const matchesSearch = !store.searchQuery || 
      d.name.toLowerCase().includes(store.searchQuery.toLowerCase()) ||
      d.id.toLowerCase().includes(store.searchQuery.toLowerCase())
    return matchesFilter && matchesSearch
  })
})

const requestDelete = (id: string) => {
  confirmDeleteId.value = id
}

const confirmDelete = () => {
  if (confirmDeleteId.value) {
    store.deleteDossier(confirmDeleteId.value)
    confirmDeleteId.value = null
  }
}

const getStatusClass = (status: string) => {
  if (status.includes('attente')) return 'badge-orange'
  if (status.includes('Publié') || status.includes('Enregistré')) return 'badge-green'
  return 'badge-blue'
}

// Rôle getIcon deleted since icons are rendered via v-if in template
</script>

<template>
  <div class="dossiers-view">
    <div class="header-section mb-30">
      <h1 class="page-title text-blue">Mes Dossiers</h1>
      <p class="text-light-grey">Consultez l'historique et l'état d'avancement de toutes vos demandes de propriété industrielle.</p>
    </div>

    <!-- Filters and Actions -->
    <div class="actions-bar glass mb-30">
      <div class="filters">
        <button :class="['filter-btn', { active: filter === 'Tous' }]" @click="filter = 'Tous'">Tous</button>
        <button :class="['filter-btn', { active: filter === 'Marque' }]" @click="filter = 'Marque'">Marques</button>
        <button :class="['filter-btn', { active: filter === 'Brevet' }]" @click="filter = 'Brevet'">Brevets</button>
        <button :class="['filter-btn', { active: filter === 'Nom Commercial' }]" @click="filter = 'Nom Commercial'">Noms Commerciaux</button>
      </div>
      <div class="search-box">
        <input type="text" v-model="store.searchQuery" placeholder="Rechercher un dossier...">
        <span class="search-icon" style="display: flex; align-items: center; justify-content: center;">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="width: 14px; height: 14px;"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
        </span>
      </div>
    </div>

    <!-- Results Count -->
    <div class="results-info mb-20" v-if="store.searchQuery || filter !== 'Tous'">
      <span>{{ filteredDossiers.length }} résultat{{ filteredDossiers.length !== 1 ? 's' : '' }} trouvé{{ filteredDossiers.length !== 1 ? 's' : '' }}</span>
      <button v-if="store.searchQuery" class="clear-btn" @click="store.searchQuery = ''">Effacer ×</button>
    </div>

    <!-- Dossiers List -->
    <div class="dossiers-grid">
      <div v-for="dossier in filteredDossiers" :key="dossier.id" class="dossier-card glass fade-in">
        <div class="card-header">
          <div class="dossier-type" style="display: flex; align-items: center; gap: 8px;">
            <span class="icon" style="display: flex; align-items: center; justify-content: center; color: var(--primary-blue);">
              <svg v-if="dossier.icon === 'trademark'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width: 18px; height: 18px;"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="12" cy="10" r="3"></circle><path d="M7 21v-2a4 4 0 0 1 4-4h2a4 4 0 0 1 4 4v2"></path></svg>
              <svg v-else-if="dossier.icon === 'patent'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width: 18px; height: 18px;"><path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .5 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"></path><line x1="9" y1="18" x2="15" y2="18"></line><line x1="10" y1="22" x2="14" y2="22"></line></svg>
              <svg v-else-if="dossier.icon === 'shop'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width: 18px; height: 18px;"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg>
              <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width: 18px; height: 18px;"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
            </span>
            {{ dossier.type }}
          </div>
          <div :class="['badge', getStatusClass(dossier.status)]">{{ dossier.status }}</div>
        </div>
        
        <div class="card-body">
          <h3 class="dossier-name">{{ dossier.name }}</h3>
          <div class="dossier-meta">
            <div class="meta-item">
              <span class="meta-label">Référence:</span>
              <span class="meta-value">{{ dossier.id }}</span>
            </div>
            <div class="meta-item">
              <span class="meta-label">Date de dépôt:</span>
              <span class="meta-value">{{ dossier.date }}</span>
            </div>
          </div>
        </div>
        
        <div class="card-footer">
          <span :class="['status-pill', getStatusClass(dossier.status)]">{{ dossier.status }}</span>
          <div class="actions">
            <button class="btn btn-primary btn-sm" @click="goToDetail(dossier.id)">Voir</button>
            <button class="btn-icon" title="Supprimer ce dossier" @click="requestDelete(dossier.id)" style="display: inline-flex; align-items: center; justify-content: center; opacity: 0.6;">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width: 16px; height: 16px; color: #ef4444;"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
            </button>
          </div>
        </div>
      </div>
      
      <div v-if="filteredDossiers.length === 0" class="empty-state">
        <div class="empty-icon" style="display: flex; align-items: center; justify-content: center; margin-bottom: 15px; color: #94a3b8;">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="width: 48px; height: 48px;"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>
        </div>
        <h3>{{ store.searchQuery ? 'Aucun résultat' : 'Aucun dossier' }}</h3>
        <p>{{ store.searchQuery ? `Aucun dossier ne correspond à "${store.searchQuery}".` : "Vous n'avez pas encore soumis de demande." }}</p>
        <router-link v-if="!store.searchQuery" to="/portal/depot" class="btn btn-primary mt-20">Nouveau Dépôt</router-link>
        <button v-else class="btn btn-secondary mt-20" @click="store.searchQuery = ''">Réinitialiser la recherche</button>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div v-if="confirmDeleteId" class="modal-backdrop" @click.self="confirmDeleteId = null">
      <div class="modal-box fade-in">
        <div class="modal-icon" style="display: flex; align-items: center; justify-content: center; color: #f59e0b; margin-bottom: 15px;">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width: 48px; height: 48px;"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
        </div>
        <h3>Confirmer la suppression</h3>
        <p>Voulez-vous vraiment supprimer le dossier <strong>{{ confirmDeleteId }}</strong> ? Cette action est irréversible.</p>
        <div class="modal-actions">
          <button class="btn btn-secondary" @click="confirmDeleteId = null">Annuler</button>
          <button class="btn btn-danger" @click="confirmDelete">Supprimer</button>
        </div>
      </div>
    </div>

  </div>
</template>

<style scoped>
.page-title {
  font-size: 2rem;
  font-weight: 800;
  margin-bottom: 5px;
}
.text-blue { color: var(--primary-blue); }
.text-light-grey { color: #64748b; }
.mb-30 { margin-bottom: 30px; }
.mt-20 { margin-top: 20px; }

/* Actions Bar */
.actions-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  border-radius: 12px;
  background: var(--white);
  box-shadow: 0 4px 15px rgba(0,0,0,0.03);
  border: 1px solid #e2e8f0;
}

.filters {
  display: flex;
  gap: 10px;
}

.filter-btn {
  padding: 8px 16px;
  border-radius: 20px;
  border: 1px solid #e2e8f0;
  background: white;
  color: #64748b;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.filter-btn:hover {
  background: #f1f5f9;
}

.filter-btn.active {
  background: var(--primary-blue);
  color: white;
  border-color: var(--primary-blue);
}

.search-box {
  position: relative;
}

.search-box input {
  padding: 10px 15px 10px 40px;
  border-radius: 8px;
  border: 1px solid #cbd5e1;
  background: #f8fafc;
  width: 250px;
  font-size: 0.9rem;
  transition: all 0.3s;
}

.search-box input:focus {
  outline: none;
  border-color: var(--primary-blue);
  background: white;
}

.search-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #94a3b8;
}

/* Grid */
.dossiers-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 25px;
}

.dossier-card {
  background: white;
  border-radius: 16px;
  overflow: hidden;
  border: 1px solid #e2e8f0;
  box-shadow: 0 4px 15px rgba(0,0,0,0.03);
  display: flex;
  flex-direction: column;
  transition: transform 0.2s, box-shadow 0.2s;
}

.dossier-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 10px 25px rgba(0,0,0,0.08);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  border-bottom: 1px solid #f1f5f9;
  background: #f8fafc;
}

.dossier-type {
  font-weight: 700;
  color: #334155;
  font-size: 0.95rem;
  display: flex;
  align-items: center;
  gap: 8px;
}

.badge {
  padding: 5px 10px;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 700;
}

.badge-orange { background: #ffedd5; color: #ea580c; }
.badge-green { background: #dcfce3; color: #16a34a; }
.badge-blue { background: #e0f2fe; color: #0284c7; }

.card-body {
  padding: 20px;
  flex: 1;
}

.dossier-name {
  font-size: 1.2rem;
  color: var(--primary-blue);
  margin-bottom: 15px;
  font-weight: 700;
}

.dossier-meta {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.meta-item {
  display: flex;
  justify-content: space-between;
  font-size: 0.9rem;
}

.meta-label {
  color: #64748b;
}

.meta-value {
  color: #334155;
  font-weight: 600;
}

.card-footer {
  padding: 15px 20px;
  border-top: 1px solid #f1f5f9;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.status-pill {
  padding: 5px 10px;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 700;
}

.actions {
  display: flex;
  gap: 8px;
}

/* Results info */
.results-info {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 0.9rem;
  color: #64748b;
  font-weight: 500;
}

.clear-btn {
  background: none;
  border: 1px solid #cbd5e1;
  border-radius: 20px;
  padding: 4px 12px;
  font-size: 0.8rem;
  color: #64748b;
  cursor: pointer;
  transition: all 0.2s;
}

.clear-btn:hover {
  background: #f1f5f9;
  border-color: #94a3b8;
}

/* Modal */
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  backdrop-filter: blur(2px);
}

.modal-box {
  background: white;
  border-radius: 16px;
  padding: 40px;
  max-width: 420px;
  width: 90%;
  text-align: center;
  box-shadow: 0 20px 60px rgba(0,0,0,0.2);
}

.modal-icon {
  font-size: 3rem;
  margin-bottom: 15px;
}

.modal-box h3 {
  font-size: 1.4rem;
  color: #1e293b;
  margin-bottom: 10px;
}

.modal-box p {
  color: #64748b;
  margin-bottom: 25px;
  line-height: 1.6;
}

.modal-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
}

/* Buttons */
.btn { padding: 8px 18px; border-radius: 6px; font-weight: 600; font-size: 0.9rem; cursor: pointer; border: none; transition: all 0.2s; }
.btn-sm { padding: 6px 12px; font-size: 0.8rem; }
.btn-primary { background: var(--primary-blue); color: white; text-decoration: none; }
.btn-primary:hover { background: #0077b3; }
.btn-secondary { background: #f1f5f9; color: #475569; border: 1px solid #e2e8f0; }
.btn-secondary:hover { background: #e2e8f0; }
.btn-danger { background: #ef4444; color: white; }
.btn-danger:hover { background: #dc2626; }

.btn-outline {
  background: transparent;
  border: 1px solid var(--primary-blue);
  color: var(--primary-blue);
}

.btn-outline:hover {
  background: var(--primary-blue);
  color: white;
}

.btn-icon { background: none; border: none; font-size: 1.3rem; cursor: pointer; opacity: 0.6; transition: opacity 0.2s; }
.btn-icon:hover { opacity: 1; }

/* Empty State */
.empty-state {
  grid-column: 1 / -1;
  text-align: center;
  padding: 60px 20px;
  background: white;
  border-radius: 16px;
  border: 1px dashed #cbd5e1;
}

.empty-icon {
  font-size: 3rem;
  margin-bottom: 15px;
  opacity: 0.5;
}

.empty-state h3 {
  font-size: 1.5rem;
  color: #334155;
  margin-bottom: 10px;
}

.empty-state p {
  color: #64748b;
}

@media (max-width: 768px) {
  .actions-bar {
    flex-direction: column;
    gap: 15px;
    align-items: stretch;
  }
  .filters {
    overflow-x: auto;
    padding-bottom: 5px;
  }
  .search-box input {
    width: 100%;
  }
}
</style>
