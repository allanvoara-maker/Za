<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import axios from 'axios'
import { useAuth } from '../composables/useAuth'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Fix leaflet's broken default icon path in Vite builds
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
})

const route  = useRoute()
const router = useRouter()
const API_URL = 'http://localhost:3000/api'
const { currentUser } = useAuth()

// Full dossier data fetched from backend
const dossier = ref<any>(null)
const loading = ref(true)
const notFound = ref(false)
const statusOptions = ["En attente d'examen", "En cours d'examen", "Publié", "Enregistré", "Rejeté"]
const selectedStatus = ref('')
const statusSaving = ref(false)

let mapInstance: L.Map | null = null

const fetchDossier = async () => {
  try {
    const response = await axios.get(`${API_URL}/dossiers/${route.params.id}`)
    dossier.value = response.data
    selectedStatus.value = response.data.status || ''
    if (response.data.lat && response.data.lng) {
      await nextTick()
      initMap(response.data.lat, response.data.lng)
    }
  } catch {
    notFound.value = true
  } finally {
    loading.value = false
  }
}

const initMap = (lat: number, lng: number) => {
  if (mapInstance) return
  const el = document.getElementById('dossier-map')
  if (!el) return
  mapInstance = L.map(el).setView([lat, lng], 13)
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: 'OpenStreetMap'
  }).addTo(mapInstance)
  L.marker([lat, lng])
    .addTo(mapInstance)
    .bindPopup('Depot soumis depuis ici')
    .openPopup()
}

onMounted(fetchDossier)
onUnmounted(() => { if (mapInstance) { mapInstance.remove(); mapInstance = null } })

// Nice class names map
const niceClassNames: Record<number, string> = {
  1: 'Produits chimiques',
  3: 'Cosmétiques et parfums',
  9: 'Appareils scientifiques et logiciels',
  25: 'Vêtements et chaussures',
  35: 'Publicité et gestion des affaires',
  41: 'Éducation et divertissement',
  42: 'Services scientifiques et technologiques'
}

const getStatusClass = (status: string) => {
  if (!status) return 'badge-blue'
  if (status.includes('attente')) return 'badge-orange'
  if (status.includes('cours')) return 'badge-blue'
  if (status === 'Publié') return 'badge-teal'
  if (status === 'Enregistré') return 'badge-green'
  if (status === 'Rejeté') return 'badge-red'
  return 'badge-blue'
}

const timeline = computed(() => {
  if (!dossier.value) return []
  const s = dossier.value.status
  return [
    { label: 'Dossier créé',         date: dossier.value.date, done: true },
    { label: "Examen de la demande", date: '—', done: s !== "En attente d'examen" },
    { label: 'Publication',          date: '—', done: s === 'Publié' || s === 'Enregistré' },
    { label: 'Enregistrement',       date: '—', done: s === 'Enregistré' }
  ]
})

const handleDelete = async () => {
  if (!confirm(`Supprimer le dossier ${dossier.value?.id} ?`)) return
  try {
    await axios.delete(`${API_URL}/dossiers/${route.params.id}`)
    router.push(currentUser.value?.role === 'admin' ? '/portal/admin' : '/portal/dossiers')
  } catch {
    alert('Erreur lors de la suppression.')
  }
}

const handleDownloadReceipt = () => window.print()

const handleUpdateStatus = async () => {
  if (!dossier.value || !selectedStatus.value || selectedStatus.value === dossier.value.status) return
  statusSaving.value = true
  try {
    await axios.put(`${API_URL}/admin/dossiers/${dossier.value.id}/status`, { status: selectedStatus.value })
    dossier.value.status = selectedStatus.value
    alert('Statut mis à jour avec succès.')
  } catch {
    alert('Erreur lors de la mise à jour du statut.')
  } finally {
    statusSaving.value = false
  }
}

// Parse the stored originality report JSON
const originalityReport = computed(() => {
  if (!dossier.value?.details?.originality_report) return null
  try {
    return JSON.parse(dossier.value.details.originality_report)
  } catch {
    return null
  }
})

const getScoreColor = (val: number) => {
  if (val >= 80) return '#10b981'
  if (val >= 50) return '#f59e0b'
  return '#ef4444'
}
const getScoreLabel = (val: number) => {
  if (val >= 80) return 'Très Original'
  if (val >= 50) return 'Modérément Original'
  return 'Risque Élevé de Confusion'
}
const getScoreClass = (val: number) => {
  if (val >= 80) return 'score-green'
  if (val >= 50) return 'score-amber'
  return 'score-red'
}
</script>

<template>
  <!-- Loading state -->
  <div v-if="loading" class="loading-screen">
    <div class="spinner"></div>
    <p>Chargement du dossier...</p>
  </div>

  <!-- Not found -->
  <div v-else-if="notFound" class="loading-screen">
    <p>Dossier introuvable. <router-link :to="currentUser?.role === 'admin' ? '/portal/admin' : '/portal/dossiers'">← Retour {{ currentUser?.role === 'admin' ? 'au Tableau de bord' : 'à mes dossiers' }}</router-link></p>
  </div>

  <!-- Main detail view -->
  <div v-else class="detail-view">

    <!-- Breadcrumb -->
    <div class="breadcrumb mb-30">
      <router-link :to="currentUser?.role === 'admin' ? '/portal/admin' : '/portal/dossiers'" class="back-link">
        ← Retour {{ currentUser?.role === 'admin' ? 'au Tableau de bord' : 'à Mes Dossiers' }}
      </router-link>
      <span class="sep">/</span>
      <span class="current">{{ dossier.id }}</span>
    </div>

    <!-- Header -->
    <div class="detail-header mb-30">
      <div class="detail-title-area">
        <div class="type-chip">{{ dossier.type }}</div>
        <h1 class="dossier-title">{{ dossier.name }}</h1>
        <p class="ref-label">Référence : <strong>{{ dossier.id }}</strong> &nbsp;·&nbsp; Déposé le <strong>{{ dossier.date }}</strong></p>
      </div>
      <div class="header-actions">
        <span :class="['big-badge', getStatusClass(dossier.status)]">{{ dossier.status }}</span>
        <button class="btn btn-danger btn-sm no-print" @click="handleDelete" style="display: inline-flex; align-items: center; gap: 6px;">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width: 14px; height: 14px;"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
          Supprimer
        </button>
      </div>
    </div>

    <div class="two-col">
      <!-- LEFT: Details panel -->
      <div>
        <!-- Core info card -->
        <div class="detail-card mb-20">
          <h2 class="section-title" style="display: inline-flex; align-items: center; gap: 8px;">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width: 20px; height: 20px; color: #0A3A6A;"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
            Informations générales
          </h2>
          <div class="info-grid">
            <div class="info-item">
              <div class="info-label">Type de dépôt</div>
              <div class="info-value">{{ dossier.type }}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Dénomination</div>
              <div class="info-value">{{ dossier.name }}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Numéro de référence</div>
              <div class="info-value mono">{{ dossier.id }}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Date de dépôt</div>
              <div class="info-value">{{ dossier.date }}</div>
            </div>
            <div class="info-item full">
              <div class="info-label">Statut actuel</div>
              <div class="info-value">
                <span :class="['badge', getStatusClass(dossier.status)]">{{ dossier.status }}</span>
              </div>
            </div>
            <div v-if="currentUser?.role === 'admin'" class="info-item full">
              <div class="info-label">Changer le statut</div>
              <div class="status-edit-row">
                <select v-model="selectedStatus" class="status-select">
                  <option v-for="s in statusOptions" :key="s" :value="s">{{ s }}</option>
                </select>
                <button
                  class="btn btn-primary btn-sm"
                  :disabled="statusSaving || selectedStatus === dossier.status"
                  @click="handleUpdateStatus"
                >
                  {{ statusSaving ? 'Mise à jour...' : 'Enregistrer le statut' }}
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Marque details card (only for Marque type) -->
        <div v-if="dossier.type === 'Marque' && dossier.details" class="detail-card mb-20">
          <h2 class="section-title" style="display: inline-flex; align-items: center; gap: 8px;">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width: 20px; height: 20px; color: #0A3A6A;"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path><line x1="7" y1="7" x2="7.01" y2="7"></line></svg>
            Détails de la marque
          </h2>

          <!-- Logo preview -->
          <div v-if="dossier.details.logo_url" class="logo-preview-block mb-20">
            <div class="info-label mb-10">Logo déposé</div>
            <div class="logo-wrapper">
              <img :src="dossier.details.logo_url" alt="Logo de la marque" class="logo-img">
            </div>
          </div>

          <div class="info-grid">
            <div class="info-item">
              <div class="info-label">Type de marque</div>
              <div class="info-value">{{ dossier.details.brand_type || '—' }}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Couleurs revendiquées</div>
              <div class="info-value">{{ dossier.details.brand_colors || 'Non spécifié' }}</div>
            </div>
          </div>

          <!-- Nice Classes -->
          <div v-if="dossier.classes && dossier.classes.length" class="mt-20 pt-20 border-top">
            <div class="info-label mb-10">Classes de Nice ({{ dossier.classes.length }})</div>
            <div class="classes-list">
              <div v-for="id in dossier.classes" :key="id" class="class-tag">
                <span class="class-num">Cl. {{ id }}</span>
                <span class="class-name">{{ niceClassNames[id] || 'Classe ' + id }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Applicant details card -->
        <div v-if="dossier.details" class="detail-card mb-20">
          <h2 class="section-title" style="display: inline-flex; align-items: center; gap: 8px;">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width: 20px; height: 20px; color: #0A3A6A;"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
            Informations du demandeur
          </h2>
          <div class="info-grid">
            <div class="info-item">
              <div class="info-label">Type</div>
              <div class="info-value">{{ dossier.details.applicant_type || '—' }}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Nationalité</div>
              <div class="info-value">{{ dossier.details.applicant_nationality || '—' }}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Téléphone</div>
              <div class="info-value">{{ dossier.details.applicant_phone || '—' }}</div>
            </div>
            <div class="info-item full">
              <div class="info-label">Adresse</div>
              <div class="info-value">{{ dossier.details.applicant_address || '—' }}</div>
            </div>
          </div>
        </div>

        <!-- Brand description card (shown when present) -->
        <div v-if="dossier.details?.brand_description" class="detail-card mb-20">
          <h2 class="section-title" style="display: inline-flex; align-items: center; gap: 8px;">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width: 20px; height: 20px; color: #0A3A6A;"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
            Description de la marque
          </h2>
          <p class="brand-description-text">{{ dossier.details.brand_description }}</p>
        </div>

        <!-- Admin AI Originality Analysis Panel -->
        <div v-if="currentUser?.role === 'admin' && originalityReport" class="detail-card mb-20 originality-admin-panel">
          <h2 class="section-title" style="display: inline-flex; align-items: center; gap: 8px;">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width: 20px; height: 20px; color: #0A3A6A;"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
            Rapport d'Originalité IA
          </h2>
          <p class="admin-report-meta">Analyse effectuée par le déposant lors de la soumission du dossier.</p>

          <div class="admin-score-row">
            <!-- SVG Gauge -->
            <div class="admin-gauge-container">
              <svg class="admin-gauge-svg" viewBox="0 0 100 100">
                <circle class="admin-gauge-bg" cx="50" cy="50" r="40" />
                <circle
                  class="admin-gauge-fill"
                  cx="50" cy="50" r="40"
                  :stroke="getScoreColor(originalityReport.score)"
                  :stroke-dasharray="2 * Math.PI * 40"
                  :stroke-dashoffset="2 * Math.PI * 40 * (1 - originalityReport.score / 100)"
                />
                <text class="admin-gauge-num" x="50" y="52">{{ originalityReport.score }}%</text>
                <text class="admin-gauge-lbl" x="50" y="70">Original</text>
              </svg>
            </div>

            <div class="admin-score-details">
              <div class="admin-score-badge" :class="getScoreClass(originalityReport.score)">
                {{ getScoreLabel(originalityReport.score) }}
              </div>
              <div class="admin-ai-explanation">
                <div class="admin-ai-label" style="display: inline-flex; align-items: center; gap: 6px;">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width: 14px; height: 14px; color: #7c3aed;"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
                  Analyse IA
                </div>
                <p>{{ originalityReport.explanation }}</p>
              </div>
            </div>
          </div>

          <!-- Similar marks table -->
          <div v-if="originalityReport.topMatches && originalityReport.topMatches.length > 0" class="admin-matches-section">
            <h4 class="admin-matches-title">Marques similaires détectées lors de l'analyse :</h4>
            <div class="admin-matches-table-wrapper">
              <table class="admin-matches-table">
                <thead>
                  <tr>
                    <th>Marque</th>
                    <th>Déposant</th>
                    <th>Pays</th>
                    <th>Statut</th>
                    <th class="text-right">Similarité</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="m in originalityReport.topMatches" :key="m.name">
                    <td>
                      <strong>{{ m.name }}</strong>
                      <span v-if="m.details?.exact" class="flag-exact">Exact</span>
                      <span v-if="m.details?.phonetic" class="flag-phonetic">Phonétique</span>
                    </td>
                    <td class="text-muted">{{ m.owner }}</td>
                    <td><span class="country-chip">{{ m.country }}</span></td>
                    <td>{{ m.status }}</td>
                    <td class="text-right">
                      <div class="sim-display">
                        <span class="sim-num" :style="{ color: m.similarity > 75 ? '#ef4444' : m.similarity > 50 ? '#d97706' : '#0088cc' }">
                          {{ m.similarity }}%
                        </span>
                        <div class="sim-track">
                          <div class="sim-fill" :style="{
                            width: m.similarity + '%',
                            background: m.similarity > 75 ? '#ef4444' : m.similarity > 50 ? '#f59e0b' : '#0088cc'
                          }"></div>
                        </div>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          <div v-else class="admin-no-conflicts" style="display: flex; align-items: center; gap: 8px;">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="width: 16px; height: 16px; color: #16a34a; flex-shrink: 0;"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
            <span>Aucune marque conflictuelle détectée lors de l'analyse du déposant.</span>
          </div>
        </div>

        <!-- Actions -->
        <div class="action-bar no-print">
          <button class="btn btn-outline" @click="handleDownloadReceipt" style="display: inline-flex; align-items: center; gap: 8px;">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width: 16px; height: 16px;"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
            Télécharger le récépissé
          </button>
          <a :href="`mailto:support@omapi.mg?subject=Demande concernant le dossier ${dossier.id}`" class="btn btn-outline text-decoration-none" style="display: inline-flex; align-items: center; gap: 8px;">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width: 16px; height: 16px;"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
            Contacter l'OMAPI
          </a>
        </div>
      </div>

      <!-- RIGHT: Timeline and Map panel -->
      <div>
        <div class="detail-card mb-20">
          <h2 class="section-title" style="display: inline-flex; align-items: center; gap: 8px;">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width: 20px; height: 20px; color: #0A3A6A;"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>
            Suivi de la procédure
          </h2>
          <div class="timeline">
            <div
              v-for="(step, i) in timeline"
              :key="i"
              :class="['timeline-step', { done: step.done, active: !step.done && (i === 0 || timeline[i-1]?.done) }]"
            >
              <div class="step-dot">
                <svg v-if="step.done" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" style="width: 12px; height: 12px; color: #ffffff;"><polyline points="20 6 9 17 4 12"></polyline></svg>
                <span v-else>{{ i + 1 }}</span>
              </div>
              <div class="step-info">
                <div class="step-label">{{ step.label }}</div>
                <div class="step-date">{{ step.date }}</div>
              </div>
            </div>
          </div>

          <div class="info-box mt-20" style="display: flex; align-items: flex-start; gap: 8px;">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width: 16px; height: 16px; color: #0A3A6A; flex-shrink: 0; margin-top: 2px;"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
            <span>Les délais d'examen peuvent varier entre <strong>3 et 12 mois</strong> selon la complexité du dossier. L'OMAPI vous informera de toute évolution par email.</span>
          </div>
        </div>

        <!-- Submission Map Location -->
        <div v-if="dossier && dossier.lat && dossier.lng" class="detail-card">
          <h2 class="section-title" style="display: inline-flex; align-items: center; gap: 8px;">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width: 20px; height: 20px; color: #0A3A6A;"><polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21"></polygon><line x1="9" y1="3" x2="9" y2="18"></line><line x1="15" y1="6" x2="15" y2="21"></line></svg>
            Emplacement du dépôt
          </h2>
          <div id="dossier-map" class="mb-10" style="height: 220px; border-radius: 12px; border: 1px solid #e2e8f0; overflow: hidden; z-index: 1;"></div>
          <div class="info-box" style="display: flex; align-items: flex-start; gap: 8px;">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width: 16px; height: 16px; color: #0A3A6A; flex-shrink: 0; margin-top: 2px;"><path d="M12 2a8 8 0 0 0-8 8c0 5.25 8 12 8 12s8-6.75 8-12a8 8 0 0 0-8-8z"></path><circle cx="12" cy="10" r="3"></circle></svg>
            <span>Ce dossier a été soumis avec géolocalisation. Coordonnées : <strong>{{ dossier.lat.toFixed(6) }}, {{ dossier.lng.toFixed(6) }}</strong>.</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Utilities */
.mb-10 { margin-bottom: 10px; }
.mb-20 { margin-bottom: 20px; }
.mb-30 { margin-bottom: 30px; }
.mt-20 { margin-top: 20px; }
.pt-20 { padding-top: 20px; }
.border-top { border-top: 1px solid #f1f5f9; }
.full { grid-column: 1 / -1; }

/* Loading */
.loading-screen {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 300px;
  gap: 16px;
  color: #64748b;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #e2e8f0;
  border-top-color: #0099cc;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin { to { transform: rotate(360deg); } }

/* Breadcrumb */
.breadcrumb { display: flex; align-items: center; gap: 8px; font-size: 0.9rem; }
.back-link { color: var(--primary-blue); text-decoration: none; font-weight: 600; }
.back-link:hover { text-decoration: underline; }
.sep { color: #94a3b8; }
.current { color: #64748b; }

/* Header */
.detail-header {
  background: white;
  border-radius: 16px;
  border: 1px solid #e2e8f0;
  padding: 30px;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 20px;
  box-shadow: 0 4px 15px rgba(0,0,0,0.03);
}

.type-chip {
  display: inline-block;
  background: #e0f2fe;
  color: #0284c7;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 700;
  margin-bottom: 10px;
}

.dossier-title { font-size: 1.8rem; font-weight: 800; color: #1e293b; margin-bottom: 8px; }
.ref-label { color: #64748b; font-size: 0.9rem; }
.header-actions { display: flex; flex-direction: column; align-items: flex-end; gap: 12px; }

.big-badge {
  padding: 8px 18px;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 700;
  white-space: nowrap;
}

/* Layout */
.two-col {
  display: grid;
  grid-template-columns: 3fr 2fr;
  gap: 25px;
  align-items: start;
}

.detail-card {
  background: white;
  border-radius: 16px;
  border: 1px solid #e2e8f0;
  padding: 30px;
  box-shadow: 0 4px 15px rgba(0,0,0,0.03);
}

.section-title {
  font-size: 1.1rem;
  color: #1e293b;
  font-weight: 700;
  margin-bottom: 20px;
  padding-bottom: 12px;
  border-bottom: 1px solid #f1f5f9;
}

/* Info grid */
.info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.info-item { display: flex; flex-direction: column; gap: 5px; }
.info-label { font-size: 0.75rem; color: #94a3b8; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; }
.info-value { font-size: 0.95rem; color: #334155; font-weight: 600; }
.mono { font-family: monospace; color: var(--primary-blue); }

/* Logo preview */
.logo-preview-block { }
.logo-wrapper {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.logo-img { max-height: 120px; max-width: 100%; border-radius: 8px; object-fit: contain; }

/* Nice Classes */
.classes-list { display: flex; flex-direction: column; gap: 8px; }
.class-tag {
  display: flex;
  align-items: center;
  gap: 10px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  padding: 8px 12px;
  border-radius: 8px;
}
.class-num { font-weight: 700; color: #0099cc; font-size: 0.85rem; min-width: 50px; }
.class-name { font-size: 0.85rem; color: #475569; }

/* Action bar */
.action-bar { display: flex; gap: 12px; flex-wrap: wrap; }

/* Timeline */
.timeline { display: flex; flex-direction: column; gap: 0; }

.timeline-step {
  display: flex;
  align-items: flex-start;
  gap: 15px;
  padding: 15px 0;
  position: relative;
}

.timeline-step:not(:last-child)::before {
  content: '';
  position: absolute;
  left: 17px;
  top: 40px;
  width: 2px;
  height: calc(100% - 10px);
  background: #e2e8f0;
}

.timeline-step.done::before { background: #10b981; }

.step-dot {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: 2px solid #e2e8f0;
  background: white;
  color: #94a3b8;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 0.85rem;
  flex-shrink: 0;
  z-index: 1;
}

.timeline-step.done .step-dot { background: #10b981; border-color: #10b981; color: white; }
.timeline-step.active .step-dot {
  background: var(--primary-blue);
  border-color: var(--primary-blue);
  color: white;
  box-shadow: 0 0 0 4px rgba(0,136,204,0.15);
}

.step-info {}
.step-label { font-weight: 600; color: #334155; font-size: 0.95rem; }
.step-date { font-size: 0.82rem; color: #94a3b8; margin-top: 2px; }

/* Info box */
.info-box {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  padding: 15px;
  font-size: 0.88rem;
  color: #475569;
  line-height: 1.6;
}

/* Badges */
.badge { padding: 5px 12px; border-radius: 20px; font-size: 0.85rem; font-weight: 700; }
.badge-orange { background: #ffedd5; color: #ea580c; }
.badge-green  { background: #dcfce7; color: #16a34a; }
.badge-blue   { background: #e0f2fe; color: #0284c7; }
.badge-teal   { background: #ccfbf1; color: #0f766e; }
.badge-red    { background: #fee2e2; color: #dc2626; }

/* Buttons */
.btn { padding: 10px 18px; border-radius: 8px; font-weight: 600; font-size: 0.9rem; cursor: pointer; border: none; transition: all 0.2s; text-decoration: none; display: inline-block; }
.btn-sm { padding: 8px 14px; font-size: 0.85rem; }
.btn-primary { background: #0099cc; color: white; border: 1px solid #0099cc; }
.btn-primary:hover { background: #007aa3; border-color: #007aa3; }
.btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }
.btn-outline { background: transparent; border: 1px solid #e2e8f0; color: #475569; }
.btn-outline:hover { background: #f8fafc; border-color: #cbd5e1; }
.btn-danger { background: #fef2f2; color: #ef4444; border: 1px solid #fca5a5; }
.btn-danger:hover { background: #ef4444; color: white; }

.status-edit-row {
  display: flex;
  gap: 10px;
  align-items: center;
  flex-wrap: wrap;
}

.status-select {
  min-width: 220px;
  padding: 8px 12px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 0.9rem;
  background: #fff;
}

.status-select:focus {
  outline: none;
  border-color: #0099cc;
}

/* Print */
@media print {
  .no-print, .breadcrumb, .action-bar { display: none !important; }
  .detail-header, .detail-card { box-shadow: none; border: 1px solid #ddd; }
  body { background: white; }
}

/* Responsive */
@media (max-width: 900px) {
  .two-col { grid-template-columns: 1fr; }
  .detail-header { flex-direction: column; }
  .header-actions { flex-direction: row; align-items: center; }
  .info-grid { grid-template-columns: 1fr; }
}

/* ===== Brand Description ===== */
.brand-description-text {
  color: #334155;
  font-size: 0.95rem;
  line-height: 1.75;
  background: #f8fafc;
  border-left: 3px solid #0099cc;
  padding: 14px 18px;
  border-radius: 0 8px 8px 0;
  margin: 0;
}

/* ===== Admin AI Originality Panel ===== */
.originality-admin-panel {
  border: 1px solid #e0f2fe;
  background: linear-gradient(135deg, #f0f9ff 0%, #ffffff 100%);
}

.admin-report-meta {
  font-size: 0.85rem;
  color: #94a3b8;
  margin-bottom: 20px;
  font-style: italic;
}

.admin-score-row {
  display: flex;
  align-items: flex-start;
  gap: 28px;
  margin-bottom: 20px;
}

.admin-gauge-container { flex-shrink: 0; width: 120px; }

.admin-gauge-svg {
  width: 120px;
  height: 120px;
  transform: rotate(-90deg);
  overflow: visible;
}

.admin-gauge-bg {
  fill: none;
  stroke: #e2e8f0;
  stroke-width: 12;
}

.admin-gauge-fill {
  fill: none;
  stroke-width: 12;
  stroke-linecap: round;
  transition: stroke-dashoffset 1s ease;
}

.admin-gauge-num {
  fill: #0f172a;
  font-size: 16px;
  font-weight: 800;
  text-anchor: middle;
  transform: rotate(90deg);
  transform-origin: 50% 50%;
}

.admin-gauge-lbl {
  fill: #94a3b8;
  font-size: 9px;
  text-anchor: middle;
  transform: rotate(90deg);
  transform-origin: 50% 50%;
}

.admin-score-details { flex: 1; display: flex; flex-direction: column; gap: 14px; }

.admin-score-badge {
  display: inline-block;
  padding: 6px 14px;
  border-radius: 20px;
  font-weight: 700;
  font-size: 0.9rem;
  width: fit-content;
}
.score-green { background: #dcfce7; color: #16a34a; }
.score-amber { background: #fef9c3; color: #b45309; }
.score-red   { background: #fee2e2; color: #dc2626; }

.admin-ai-explanation {
  background: #f8fafc;
  border-radius: 10px;
  padding: 14px 16px;
  border: 1px solid #e2e8f0;
}

.admin-ai-label {
  font-size: 0.75rem;
  font-weight: 700;
  color: #0099cc;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  margin-bottom: 6px;
}

.admin-ai-explanation p {
  margin: 0;
  font-size: 0.9rem;
  color: #475569;
  line-height: 1.65;
}

/* Matches */
.admin-matches-section { margin-top: 20px; }

.admin-matches-title {
  font-size: 0.88rem;
  font-weight: 700;
  color: #334155;
  margin-bottom: 12px;
}

.admin-matches-table-wrapper { overflow-x: auto; border-radius: 10px; border: 1px solid #e2e8f0; }

.admin-matches-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.85rem;
}

.admin-matches-table thead th {
  background: #f1f5f9;
  padding: 10px 14px;
  text-align: left;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.4px;
  color: #64748b;
}

.admin-matches-table thead th.text-right { text-align: right; }

.admin-matches-table tbody tr { border-top: 1px solid #f1f5f9; }
.admin-matches-table tbody tr:hover { background: #f8fafc; }
.admin-matches-table tbody td { padding: 10px 14px; color: #334155; vertical-align: middle; }
.admin-matches-table tbody td.text-muted { color: #94a3b8; font-size: 0.82rem; }
.admin-matches-table tbody td.text-right { text-align: right; }

.flag-exact, .flag-phonetic {
  display: inline-block;
  padding: 2px 7px;
  border-radius: 10px;
  font-size: 0.7rem;
  font-weight: 700;
  margin-left: 5px;
}
.flag-exact    { background: #fee2e2; color: #dc2626; }
.flag-phonetic { background: #fef9c3; color: #92400e; }

.country-chip {
  background: #e0f2fe;
  color: #0284c7;
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 0.78rem;
  font-weight: 600;
}

.sim-display { display: flex; flex-direction: column; align-items: flex-end; gap: 4px; }
.sim-num { font-weight: 700; font-size: 0.9rem; }
.sim-track { width: 80px; height: 5px; background: #e2e8f0; border-radius: 4px; overflow: hidden; }
.sim-fill { height: 100%; border-radius: 4px; transition: width 0.5s ease; }

.admin-no-conflicts {
  font-size: 0.9rem;
  color: #16a34a;
  font-weight: 600;
  padding: 14px 18px;
  background: #f0fdf4;
  border-radius: 10px;
  border: 1px solid #bbf7d0;
  margin-top: 16px;
}
</style>
