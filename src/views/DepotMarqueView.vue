<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useApplicationStore } from '../stores/applicationStore'
import OriginalityChecker from '../components/OriginalityChecker.vue'
import LogoOriginalityChecker from '../components/LogoOriginalityChecker.vue'

const store = useApplicationStore()
const router = useRouter()

const validationError = ref('')
const submitted = ref(false)
const isSubmitting = ref(false)
const fileInput = ref<HTMLInputElement | null>(null)

const uploading = ref(false)

const handleLogoUpload = async (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file) return

  // Immediately show local preview
  const reader = new FileReader()
  reader.onload = (e) => {
    store.brand.logo = e.target?.result as string
    store.brand.logoOriginalityReport = null
  }
  reader.readAsDataURL(file)

  // Also upload to backend for permanent storage
  try {
    uploading.value = true
    const formData = new FormData()
    formData.append('logo', file)
    const response = await import('axios').then((m) =>
      m.default.post('http://localhost:3000/api/upload/logo', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      }),
    )
    store.brand.logo = response.data.url // Replace with the permanent server URL
    store.brand.logoOriginalityReport = null
  } catch {
    // Keep the local preview (base64) as fallback
    console.warn('Logo upload to server failed, using local preview.')
  } finally {
    uploading.value = false
  }
}

onMounted(() => {
  store.resetWizard()
})

const isVerifyingAddress = ref(false)

const needsLogo = () => store.brand.type !== 'Marque verbale'

const hasLogoAnalysis = () =>
  !!(store.brand.logoOriginalityReport?.logoAnalysis || store.brand.originalityReport?.logoAnalysis)

const validateStep = async (): Promise<boolean> => {
  validationError.value = ''

  if (store.currentStep === 1) {
    if (!store.applicant.name.trim()) {
      validationError.value = 'Le nom complet est obligatoire.'
      return false
    }
    if (!store.applicant.email.trim() || !store.applicant.email.includes('@')) {
      validationError.value = 'Veuillez saisir une adresse email valide.'
      return false
    }

    // Phone validation: must contain only digits, space, +, -, (, ) and at least 5 digits
    const rawPhone = store.applicant.phone.trim()
    if (!rawPhone) {
      validationError.value = 'Le numéro de téléphone est obligatoire.'
      return false
    }
    const phonePattern = /^[0-9\s+\-()]+$/
    if (!phonePattern.test(rawPhone)) {
      validationError.value = 'Le numéro de téléphone doit contenir uniquement des chiffres.'
      return false
    }
    const digitsCount = rawPhone.replace(/\D/g, '').length
    if (digitsCount < 5) {
      validationError.value = 'Veuillez entrer un numéro de téléphone valide.'
      return false
    }

    const addressStr = store.applicant.address.trim()
    if (!addressStr) {
      validationError.value = "L'adresse complète est obligatoire."
      return false
    }

    // Geocoding check: verify if the address is a real, geolocatable location!
    if (!store.applicant.lat || !store.applicant.lng) {
      try {
        isVerifyingAddress.value = true
        const query = encodeURIComponent(addressStr)
        const url = `https://nominatim.openstreetmap.org/search?format=json&q=${query}&limit=1`
        const response = await fetch(url)
        if (response.ok) {
          const data = await response.json()
          if (data && data.length > 0) {
            const place = data[0]
            store.applicant.lat = parseFloat(place.lat)
            store.applicant.lng = parseFloat(place.lon)
            console.log(
              `[SUCCESS] Verified real address: "${addressStr}" -> (${store.applicant.lat}, ${store.applicant.lng})`,
            )
          } else {
            validationError.value =
              "L'adresse complète saisie n'est pas reconnue ou n'a pas pu être géolocalisée. Veuillez entrer une adresse réelle (ex: Lot 123, Antananarivo, Madagascar)."
            return false
          }
        } else {
          console.warn(
            'Nominatim service is unavailable, proceeding with default location fallback.',
          )
        }
      } catch (e) {
        console.warn('Geocoding validation error:', e)
        // Fallback for network failures so user isn't stuck offline
      } finally {
        isVerifyingAddress.value = false
      }
    }
  }

  if (store.currentStep === 2) {
    if (!store.brand.name.trim()) {
      validationError.value = 'Le nom de la marque est obligatoire.'
      return false
    }
    if (!store.brand.originalityReport) {
      validationError.value =
        "Veuillez effectuer l'analyse d'originalité et de conformité de votre marque avant de continuer."
      return false
    }
    if (needsLogo() && store.brand.logo && !hasLogoAnalysis()) {
      validationError.value = "Veuillez lancer l'analyse IA du logo avant de continuer."
      return false
    }
  }

  if (store.currentStep === 3) {
    if (store.classification.selectedClasses.length === 0) {
      validationError.value = 'Veuillez sélectionner au moins une classe de Nice.'
      return false
    }
  }

  return true
}

const handleNext = async () => {
  if (await validateStep()) {
    store.nextStep()
  }
}

const handlePrev = () => {
  validationError.value = ''
  store.prevStep()
}

const handleSubmit = async () => {
  if (isSubmitting.value) return
  validationError.value = ''

  // Validate before submitting
  const isValid = await validateStep()
  if (!isValid) {
    return
  }

  isSubmitting.value = true
  const success = await store.submitApplication()
  isSubmitting.value = false
  if (success) {
    submitted.value = true
    setTimeout(() => {
      submitted.value = false
      router.push('/portal/dashboard')
    }, 2500)
  } else {
    validationError.value = 'Erreur lors de la soumission. Vérifiez votre connexion et réessayez.'
  }
}

const niceClasses = [
  { id: 1, name: 'Produits chimiques' },
  { id: 3, name: 'Cosmétiques et parfums' },
  { id: 9, name: 'Appareils scientifiques et logiciels' },
  { id: 25, name: 'Vêtements et chaussures' },
  { id: 35, name: 'Publicité et gestion des affaires' },
  { id: 41, name: 'Éducation et divertissement' },
  { id: 42, name: 'Services scientifiques et technologiques' },
]

const toggleClass = (id: number) => {
  const index = store.classification.selectedClasses.indexOf(id)
  if (index === -1) {
    store.classification.selectedClasses.push(id)
  } else {
    store.classification.selectedClasses.splice(index, 1)
  }
}

// Batch mode functions
const toggleBatchMode = () => {
  store.isBatchMode = !store.isBatchMode
  // Don't clear batchBrands when toggling - preserve existing brands
}

const handleAddToBatch = () => {
  if (!store.brand.name.trim()) {
    validationError.value = 'Le nom de la marque est obligatoire pour ajouter au lot.'
    return
  }
  store.addToBatch()
  validationError.value = ''
  // Don't reset to step 1 automatically - let user navigate back manually
}

const handleRemoveFromBatch = (id: string) => {
  store.removeFromBatch(id)
}

const handleBatchSubmit = async () => {
  if (store.batchBrands.length === 0) {
    validationError.value = 'Aucune marque dans le lot à soumettre.'
    return
  }

  isSubmitting.value = true
  validationError.value = ''

  const success = await store.submitBatch()

  if (success) {
    submitted.value = true
    setTimeout(() => {
      router.push('/portal/dossiers')
    }, 2000)
  } else {
    validationError.value = 'Erreur lors de la soumission du lot. Veuillez réessayer.'
  }

  isSubmitting.value = false
}
</script>

<template>
  <div class="wizard-view">
    <div class="header-section mb-30">
      <h1 class="page-title text-blue">Nouveau Dépôt de Marque</h1>
      <p class="text-light-grey">Suivez les étapes pour enregistrer votre marque à l'OMAPI.</p>
    </div>

    <!-- Stepper Indicator -->
    <div class="stepper-container mb-40">
      <div
        class="step"
        :class="{ active: store.currentStep === 1, completed: store.currentStep > 1 }"
      >
        <div class="step-circle">1</div>
        <div class="step-label">Identité</div>
      </div>
      <div class="step-line"></div>
      <div
        class="step"
        :class="{ active: store.currentStep === 2, completed: store.currentStep > 2 }"
      >
        <div class="step-circle">2</div>
        <div class="step-label">La Marque</div>
      </div>
      <div class="step-line"></div>
      <div
        class="step"
        :class="{ active: store.currentStep === 3, completed: store.currentStep > 3 }"
      >
        <div class="step-circle">3</div>
        <div class="step-label">Classification</div>
      </div>
      <div class="step-line"></div>
      <div
        class="step"
        :class="{ active: store.currentStep === 4, completed: store.currentStep > 4 }"
      >
        <div class="step-circle">4</div>
        <div class="step-label">Récapitulatif</div>
      </div>
    </div>

    <!-- Wizard Content Box -->
    <div class="wizard-content glass">
      <!-- ÉTAPE 1: IDENTITÉ -->
      <div v-if="store.currentStep === 1" class="step-content fade-in">
        <h2 class="step-title">Informations sur le déposant</h2>
        <div class="form-grid">
          <div class="form-group">
            <label>Type de déposant</label>
            <select v-model="store.applicant.type">
              <option>Personne physique</option>
              <option>Personne morale (Société)</option>
            </select>
          </div>
          <div class="form-group">
            <label>Nom complet / Dénomination sociale</label>
            <input type="text" v-model="store.applicant.name" placeholder="Ex: Jean Dupont" />
          </div>
          <div class="form-group">
            <label>Email</label>
            <input
              type="email"
              v-model="store.applicant.email"
              placeholder="Ex: contact@entreprise.com"
            />
          </div>
          <div class="form-group">
            <label>Téléphone</label>
            <input
              type="text"
              v-model="store.applicant.phone"
              placeholder="Ex: +261 34 00 000 00"
            />
          </div>
          <div class="form-group full-width">
            <label>Adresse complète</label>
            <input
              type="text"
              v-model="store.applicant.address"
              placeholder="Ex: Lot 123, Quartier, Antananarivo"
              @input="store.applicant.lat = null; store.applicant.lng = null"
            />
            <small
              v-if="store.applicant.lat && store.applicant.lng"
              class="verified-coords-badge"
              style="display: inline-flex; align-items: center; gap: 4px"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2.5"
                stroke-linecap="round"
                stroke-linejoin="round"
                style="width: 12px; height: 12px; color: #16a34a; flex-shrink: 0"
              >
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
              </svg>
              <span
                >Adresse validée et géolocalisée (${store.applicant.lat.toFixed(6)},
                ${store.applicant.lng.toFixed(6)})</span
              >
            </small>
          </div>
        </div>
      </div>

      <!-- ÉTAPE 2: LA MARQUE -->
      <div v-if="store.currentStep === 2" class="step-content fade-in">
        <h2 class="step-title">Détails de la Marque</h2>
        <div class="form-grid">
          <div class="form-group full-width">
            <label>Nom de la marque</label>
            <input
              type="text"
              v-model="store.brand.name"
              placeholder="Saisissez le nom de la marque"
            />
            <OriginalityChecker
              :brand-name="store.brand.name"
              :brand-description="store.brand.description"
              :brand-logo="store.brand.logo"
              @select="store.brand.name = $event"
              @report="store.brand.originalityReport = $event"
            />
          </div>
          <div class="form-group">
            <label>Type de Marque</label>
            <select v-model="store.brand.type">
              <option>Marque verbale</option>
              <option>Marque figurative (Logo seul)</option>
              <option>Marque semi-figurative (Logo + Nom)</option>
            </select>
          </div>
          <div class="form-group">
            <label>Couleurs revendiquées (Optionnel)</label>
            <input type="text" v-model="store.brand.colors" placeholder="Ex: Rouge et Noir" />
          </div>
          <div class="form-group full-width">
            <label
              >Description de la marque
              <span style="color: #94a3b8; font-weight: 400">(Optionnel)</span></label
            >
            <textarea
              v-model="store.brand.description"
              rows="4"
              placeholder="Décrivez votre marque : son histoire, ses valeurs, son secteur d'activité, ce qu'elle représente..."
              class="brand-description-textarea"
            ></textarea>
          </div>
          <div
            class="form-group full-width upload-section"
            v-if="store.brand.type !== 'Marque verbale'"
          >
            <label>Joindre le Logo (Image JPG ou PNG)</label>
            <div class="upload-box" @click="fileInput?.click()">
              <input
                type="file"
                ref="fileInput"
                accept="image/*"
                style="display: none"
                @change="handleLogoUpload"
              />
              <div v-if="uploading" class="upload-placeholder">
                <span class="upload-icon">
                  <svg
                    class="animate-spin"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="3"
                    style="width: 24px; height: 24px; animation: spin 1s linear infinite"
                  >
                    <circle
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      stroke-opacity="0.25"
                    ></circle>
                    <path
                      d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4z"
                      fill="currentColor"
                    ></path>
                  </svg>
                </span>
                <p>Envoi en cours...</p>
              </div>
              <div v-else-if="!store.brand.logo" class="upload-placeholder">
                <span class="upload-icon">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    style="width: 24px; height: 24px; color: #94a3b8"
                  >
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                    <polyline points="17 8 12 3 7 8"></polyline>
                    <line x1="12" y1="3" x2="12" y2="15"></line>
                  </svg>
                </span>
                <p>Cliquez pour parcourir le fichier</p>
              </div>
              <div class="upload-preview" v-else>
                <img :src="store.brand.logo" alt="Logo preview" />
                <p
                  class="change-text"
                  style="
                    display: inline-flex;
                    align-items: center;
                    gap: 4px;
                    justify-content: center;
                    width: 100%;
                  "
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2.5"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    style="width: 12px; height: 12px; color: #16a34a; flex-shrink: 0"
                  >
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                    <polyline points="22 4 12 14.01 9 11.01"></polyline>
                  </svg>
                  <span>Fichier uploadé — Cliquez pour modifier</span>
                </p>
              </div>
            </div>

            <LogoOriginalityChecker
              v-if="store.brand.logo"
              :brand-name="store.brand.name"
              :brand-description="store.brand.description"
              :brand-logo="store.brand.logo"
              @report="store.mergeLogoReport($event)"
            />
          </div>
        </div>
      </div>

      <!-- ÉTAPE 3: CLASSIFICATION -->
      <div v-if="store.currentStep === 3" class="step-content fade-in">
        <h2 class="step-title">Classification de Nice</h2>
        <p class="mb-20 text-sm">
          Sélectionnez les classes de produits ou services correspondant à votre activité.
        </p>

        <div class="classes-grid">
          <div
            v-for="c in niceClasses"
            :key="c.id"
            :class="[
              'class-card',
              { selected: store.classification.selectedClasses.includes(c.id) },
            ]"
            @click="toggleClass(c.id)"
          >
            <div class="class-number">Classe {{ c.id }}</div>
            <div class="class-name">{{ c.name }}</div>
            <div
              class="check-icon"
              v-if="store.classification.selectedClasses.includes(c.id)"
              style="display: flex; align-items: center; justify-content: center"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="3"
                stroke-linecap="round"
                stroke-linejoin="round"
                style="width: 10px; height: 10px; color: #ffffff"
              >
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            </div>
          </div>
        </div>
      </div>

      <!-- ÉTAPE 4: RÉCAPITULATIF -->
      <div v-if="store.currentStep === 4" class="step-content fade-in">
        <h2 class="step-title">Récapitulatif de la demande</h2>

        <div class="summary-section">
          <h3>Identité</h3>
          <p>
            <strong>Nom:</strong> {{ store.applicant.name || 'Non renseigné' }} ({{
              store.applicant.type
            }})
          </p>
          <p><strong>Contact:</strong> {{ store.applicant.email }} | {{ store.applicant.phone }}</p>
        </div>

        <div class="summary-section">
          <h3>La Marque</h3>
          <p><strong>Nom:</strong> {{ store.brand.name || 'Non renseigné' }}</p>
          <p><strong>Type:</strong> {{ store.brand.type }}</p>
          <div v-if="store.brand.logo" class="mt-10">
            <strong>Logo:</strong><br />
            <img
              :src="store.brand.logo"
              style="max-height: 100px; border-radius: 8px; margin-top: 10px"
            />
          </div>
          <!-- IA logo analysis summary hidden from display -->
          <div style="display: none;"
            v-if="store.brand.logoOriginalityReport || store.brand.originalityReport?.logoAnalysis"
            class="mt-10 logo-summary"
          >
            <strong>Analyse visuelle IA :</strong>
            <span
              :class="[
                'logo-score-pill',
                (store.brand.logoOriginalityReport?.visualOriginalityScore ??
                  100 - (store.brand.originalityReport?.logoAnalysis?.visualScorePenalty || 0)) >=
                80
                  ? 'ok'
                  : 'warn',
              ]"
            >
              {{
                store.brand.logoOriginalityReport?.visualOriginalityScore ??
                100 - (store.brand.originalityReport?.logoAnalysis?.visualScorePenalty || 0)
              }}% original
            </span>
            <p class="logo-summary-text">
              {{
                store.brand.logoOriginalityReport?.logoAnalysis?.conflictDetails ||
                store.brand.originalityReport?.logoAnalysis?.conflictDetails
              }}
            </p>
          </div>
        </div>

        <div class="summary-section">
          <h3>Classes ({{ store.classification.selectedClasses.length }})</h3>
          <ul class="styled-list">
            <li v-for="id in store.classification.selectedClasses" :key="id">Classe {{ id }}</li>
          </ul>
        </div>

        <div class="summary-box glass-dark">
          <p>
            En soumettant cette demande, vous certifiez que les informations sont exactes. Une taxe
            de dépôt devra être réglée à l'OMAPI pour lancer l'examen.
          </p>
        </div>

        <!-- Batch Mode Toggle (only in step 4) -->
        <div class="batch-mode-toggle-summary mb-30">
          <button
            :class="['batch-toggle-btn', { active: store.isBatchMode }]"
            @click="toggleBatchMode"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              style="width: 20px; height: 20px"
            >
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="12" y1="8" x2="12" y2="16"></line>
              <line x1="8" y1="12" x2="16" y2="12"></line>
            </svg>
            <span>Mode Lot Multiple</span>
          </button>
          <span v-if="store.isBatchMode" class="batch-count-badge"
            >{{ store.batchBrands.length }} marque(s)</span
          >
        </div>

        <!-- Batch Panel (visible in batch mode) -->
        <div v-if="store.isBatchMode" class="batch-panel mb-30">
          <div class="batch-panel-header">
            <h3 class="batch-panel-title">Marques dans le lot</h3>
            <p class="batch-panel-subtitle">Ajoutez des marques à soumettre en une seule fois</p>
          </div>
          <div v-if="store.batchBrands.length === 0" class="batch-empty">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              style="width: 48px; height: 48px; color: #cbd5e1"
            >
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="12" y1="8" x2="12" y2="16"></line>
              <line x1="8" y1="12" x2="16" y2="12"></line>
            </svg>
            <p>
              Aucune marque dans le lot. Cliquez sur "Ajouter au lot" pour ajouter cette marque.
            </p>
          </div>
          <div v-else class="batch-list">
            <div v-for="brand in store.batchBrands" :key="brand.id" class="batch-item">
              <div class="batch-item-info">
                <h4>{{ brand.name }}</h4>
                <p>{{ brand.type }}</p>
              </div>
              <button class="batch-remove-btn" @click="handleRemoveFromBatch(brand.id)">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  style="width: 18px; height: 18px"
                >
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
          </div>
          <button
            v-if="store.batchBrands.length > 0"
            class="btn btn-primary batch-submit-btn"
            @click="handleBatchSubmit"
            :disabled="isSubmitting"
          >
            <span v-if="isSubmitting">Soumission en cours...</span>
            <span v-else>Soumettre le Lot ({{ store.batchBrands.length }})</span>
          </button>
        </div>
      </div>

      <!-- Validation Error -->
      <div
        v-if="validationError"
        class="wizard-error"
        style="display: flex; align-items: center; gap: 8px; justify-content: center"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          style="width: 16px; height: 16px; color: #c53030; flex-shrink: 0"
        >
          <path
            d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"
          ></path>
          <line x1="12" y1="9" x2="12" y2="13"></line>
          <line x1="12" y1="17" x2="12.01" y2="17"></line>
        </svg>
        <span>{{ validationError }}</span>
      </div>

      <!-- Success Overlay -->
      <div v-if="submitted" class="success-overlay fade-in">
        <div
          class="success-icon"
          style="display: flex; align-items: center; justify-content: center; margin: 0 auto 20px"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2.5"
            stroke-linecap="round"
            stroke-linejoin="round"
            style="width: 32px; height: 32px; color: #16a34a"
          >
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
            <polyline points="22 4 12 14.01 9 11.01"></polyline>
          </svg>
        </div>
        <h2>Dépôt soumis avec succès !</h2>
        <p>
          Votre demande a bien été enregistrée. Vous allez être redirigé vers votre tableau de
          bord...
        </p>
      </div>

      <!-- Footer Buttons -->
      <div class="wizard-footer" v-if="!submitted">
        <button class="btn btn-secondary" @click="handlePrev" v-if="store.currentStep > 1">
          ← Précédent
        </button>
        <div class="spacer"></div>
        <!-- Suivant button (always visible for steps 1-3) -->
        <button
          class="btn btn-primary"
          @click="handleNext"
          v-show="store.currentStep < 4"
          :disabled="isVerifyingAddress"
        >
          <span
            v-if="isVerifyingAddress"
            style="display: inline-flex; align-items: center; gap: 6px"
          >
            <svg
              class="animate-spin"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="3"
              style="width: 14px; height: 14px; animation: spin 1s linear infinite"
            >
              <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-opacity="0.25"></circle>
              <path d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4z" fill="currentColor"></path>
            </svg>
            Validation de l'adresse...
          </span>
          <span v-else>Suivant →</span>
        </button>
        <!-- Step 4 buttons -->
        <button
          v-if="store.currentStep === 4 && !store.isBatchMode"
          class="btn btn-success"
          @click="handleSubmit"
          :disabled="isSubmitting"
        >
          <span v-if="isSubmitting" style="display: inline-flex; align-items: center; gap: 6px">
            <svg
              class="animate-spin"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="3"
              style="width: 14px; height: 14px; animation: spin 1s linear infinite"
            >
              <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-opacity="0.25"></circle>
              <path d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4z" fill="currentColor"></path>
            </svg>
            Envoi en cours...
          </span>
          <span v-else>Soumettre le Dépôt</span>
        </button>
        <!-- Batch mode: Submit single mark button -->
        <button
          v-if="store.currentStep === 4 && store.isBatchMode"
          class="btn btn-success"
          @click="handleSubmit"
          :disabled="isSubmitting"
        >
          <span v-if="isSubmitting" style="display: inline-flex; align-items: center; gap: 6px">
            <svg
              class="animate-spin"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="3"
              style="width: 14px; height: 14px; animation: spin 1s linear infinite"
            >
              <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-opacity="0.25"></circle>
              <path d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4z" fill="currentColor"></path>
            </svg>
            Envoi en cours...
          </span>
          <span v-else>Soumettre cette marque seule</span>
        </button>
        <!-- Batch mode: Add to batch button (step 4) -->
        <button
          v-if="store.currentStep === 4 && store.isBatchMode"
          class="btn btn-primary add-to-batch-btn"
          @click="handleAddToBatch"
        >
          + Ajouter au Lot
        </button>
        <!-- Batch mode: New brand button (step 4, after adding to batch) -->
        <button
          v-if="store.currentStep === 4 && store.isBatchMode && store.batchBrands.length > 0"
          class="btn btn-secondary"
          @click="store.currentStep = 1"
        >
          Nouvelle Marque
        </button>
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
.text-blue {
  color: var(--primary-blue);
}
.text-light-grey {
  color: #64748b;
}
.text-sm {
  font-size: 0.9rem;
}
.mb-30 {
  margin-bottom: 30px;
}
.mb-20 {
  margin-bottom: 20px;
}
.mb-40 {
  margin-bottom: 40px;
}
.mt-10 {
  margin-top: 10px;
}

/* Stepper */
.stepper-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  max-width: 800px;
  margin: 0 auto 40px auto;
}

.step {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  position: relative;
  z-index: 2;
}

.step-circle {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: white;
  border: 2px solid #cbd5e1;
  color: #94a3b8;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 1.1rem;
  transition: all 0.3s;
}

.step-label {
  font-size: 0.85rem;
  font-weight: 600;
  color: #94a3b8;
}

.step.active .step-circle {
  border-color: var(--primary-blue);
  background: var(--primary-blue);
  color: white;
  box-shadow: 0 0 0 4px rgba(0, 136, 204, 0.2);
}

.step.active .step-label {
  color: var(--primary-blue);
}

.step.completed .step-circle {
  border-color: var(--accent-orange);
  background: var(--accent-orange);
  color: white;
}

.step.completed .step-label {
  color: var(--accent-orange);
}

.step-line {
  flex: 1;
  height: 2px;
  background: #cbd5e1;
  margin: 0 15px;
  margin-top: -20px;
  z-index: 1;
}

/* Content Box */
.wizard-content {
  background: var(--white);
  border-radius: 16px;
  padding: 40px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
  border: 1px solid #e2e8f0;
  min-height: 400px;
  display: flex;
  flex-direction: column;
}

.step-title {
  font-size: 1.5rem;
  color: #1e293b;
  margin-bottom: 25px;
  padding-bottom: 15px;
  border-bottom: 1px solid #f1f5f9;
}

.step-content {
  flex: 1;
}

/* Forms */
.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.full-width {
  grid-column: 1 / -1;
}

.form-group label {
  display: block;
  font-weight: 600;
  color: #334155;
  margin-bottom: 8px;
  font-size: 0.9rem;
}

.form-group input,
.form-group select {
  width: 100%;
  padding: 12px 15px;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  font-size: 0.95rem;
  background: #f8fafc;
  transition: all 0.2s;
}

.form-group input:focus,
.form-group select:focus {
  outline: none;
  border-color: var(--primary-blue);
  background: white;
  box-shadow: 0 0 0 3px rgba(0, 136, 204, 0.1);
}

.brand-description-textarea {
  width: 100%;
  padding: 12px 15px;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  font-size: 0.95rem;
  background: #f8fafc;
  transition: all 0.2s;
  font-family: 'Outfit', sans-serif;
  resize: vertical;
  line-height: 1.6;
  color: #334155;
}

.brand-description-textarea:focus {
  outline: none;
  border-color: var(--primary-blue);
  background: white;
  box-shadow: 0 0 0 3px rgba(0, 136, 204, 0.1);
}

.brand-description-textarea::placeholder {
  color: #94a3b8;
}

.upload-area {
  padding: 20px;
  border: 2px dashed #cbd5e1;
  border-radius: 8px;
  text-align: center;
}

.preview-box {
  margin-top: 15px;
}
.preview-box img {
  max-height: 120px;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
}

/* Classes Grid */
.classes-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 15px;
}

.class-card {
  padding: 15px;
  border: 2px solid #e2e8f0;
  border-radius: 10px;
  cursor: pointer;
  position: relative;
  transition: all 0.2s;
}

.class-card:hover {
  border-color: #94a3b8;
}

.class-card.selected {
  border-color: var(--primary-blue);
  background: #f0f9ff;
}

.class-number {
  font-weight: 800;
  color: var(--primary-blue);
  font-size: 0.85rem;
  margin-bottom: 5px;
}

.class-name {
  font-size: 0.95rem;
  color: #334155;
  font-weight: 500;
}

.check-icon {
  position: absolute;
  top: 10px;
  right: 10px;
  color: var(--primary-blue);
  font-weight: bold;
}

/* Summary */
.summary-section {
  margin-bottom: 25px;
}

.summary-section h3 {
  font-size: 1.1rem;
  color: var(--accent-orange);
  margin-bottom: 10px;
}

.summary-section p {
  margin-bottom: 5px;
  color: #475569;
}

.summary-box {
  background: #1e293b;
  color: white;
  padding: 20px;
  border-radius: 10px;
  margin-top: 30px;
}

/* Footer Buttons */
.wizard-footer {
  display: flex;
  margin-top: 40px;
  padding-top: 20px;
  border-top: 1px solid #f1f5f9;
}

.spacer {
  flex: 1;
}

.btn {
  padding: 12px 25px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  border: none;
  transition: all 0.2s;
}

.btn-primary {
  background: var(--primary-blue);
  color: white;
}
.btn-primary:hover {
  background: #0077b3;
}
.btn-secondary {
  background: #f1f5f9;
  color: #475569;
}
.btn-secondary:hover {
  background: #e2e8f0;
}
.btn-success {
  background: #10b981;
  color: white;
}
.btn-success:hover {
  background: #059669;
}

.wizard-error {
  padding: 12px 16px;
  background: #fff1f2;
  border: 1px solid #fca5a5;
  border-radius: 8px;
  color: #dc2626;
  font-size: 0.9rem;
  margin-top: 20px;
  animation: shake 0.3s ease;
}

@keyframes shake {
  0%,
  100% {
    transform: translateX(0);
  }
  25% {
    transform: translateX(-5px);
  }
  75% {
    transform: translateX(5px);
  }
}

.success-overlay {
  text-align: center;
  padding: 60px 20px;
}

.success-icon {
  font-size: 4rem;
  margin-bottom: 20px;
}

.success-overlay h2 {
  font-size: 1.8rem;
  color: #10b981;
  margin-bottom: 10px;
}

.success-overlay p {
  color: #64748b;
}

.upload-box {
  border: 2px dashed #cbd5e1;
  border-radius: 12px;
  padding: 40px 20px;
  text-align: center;
  background: #f8fafc;
  cursor: pointer;
  transition: all 0.2s;
  color: #64748b;
  position: relative;
  overflow: hidden;
  margin-top: 10px;
}

.upload-box:hover {
  border-color: var(--primary-blue);
  background: #f0f9ff;
  color: var(--primary-blue);
}

.upload-icon {
  font-size: 2.5rem;
  margin-bottom: 10px;
  display: inline-block;
}

.upload-preview img {
  max-height: 120px;
  max-width: 100%;
  border-radius: 8px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
}

.change-text {
  font-size: 0.8rem;
  margin-top: 10px;
  opacity: 0.8;
}

.logo-summary {
  padding: 12px;
  background: #faf5ff;
  border-radius: 8px;
  border: 1px solid #e9d5ff;
}

.logo-score-pill {
  display: inline-block;
  margin-left: 8px;
  padding: 2px 10px;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 700;
}

.logo-score-pill.ok {
  background: #dcfce7;
  color: #16a34a;
}
.logo-score-pill.warn {
  background: #fef3c7;
  color: #d97706;
}

.logo-summary-text {
  margin: 8px 0 0;
  font-size: 0.85rem;
  color: #64748b;
}

.verified-coords-badge {
  display: block;
  margin-top: 8px;
  color: #16a34a;
  font-weight: 600;
  font-size: 0.85rem;
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  padding: 6px 12px;
  border-radius: 6px;
}

/* ── Batch Mode Styles ── */
.batch-mode-toggle-summary {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #e2e8f0;
}

.batch-mode-toggle {
  display: flex;
  align-items: center;
  gap: 16px;
}

.batch-toggle-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  border-radius: 10px;
  border: 2px solid #e2e8f0;
  background: white;
  color: #64748b;
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s;
}

.batch-toggle-btn:hover {
  border-color: var(--primary-blue);
  color: var(--primary-blue);
}

.batch-toggle-btn.active {
  background: var(--primary-blue);
  border-color: var(--primary-blue);
  color: white;
}

.batch-count-badge {
  background: rgba(0, 136, 204, 0.1);
  color: var(--primary-blue);
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 700;
}

.batch-panel {
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.04);
  border: 1px solid #e2e8f0;
}

.batch-panel-header {
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid #f1f5f9;
}

.batch-panel-title {
  font-size: 1.2rem;
  font-weight: 800;
  color: #1e293b;
  margin: 0 0 6px 0;
}

.batch-panel-subtitle {
  font-size: 0.9rem;
  color: #64748b;
  margin: 0;
}

.batch-empty {
  text-align: center;
  padding: 40px 20px;
  color: #94a3b8;
}

.batch-empty p {
  margin-top: 16px;
  font-size: 0.9rem;
}

.batch-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 20px;
}

.batch-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  background: #f8fafc;
  border-radius: 10px;
  border: 1px solid #e2e8f0;
}

.batch-item-info h4 {
  font-size: 1rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0 0 4px 0;
}

.batch-item-info p {
  font-size: 0.85rem;
  color: #64748b;
  margin: 0;
}

.batch-remove-btn {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  border: none;
  background: #fee2e2;
  color: #dc2626;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
}

.batch-remove-btn:hover {
  background: #fecaca;
}

.batch-submit-btn {
  width: 100%;
  padding: 16px 28px;
  font-size: 1rem;
}

.add-to-batch-btn {
  background: #10b981;
}

.add-to-batch-btn:hover {
  background: #059669;
}

@media (max-width: 768px) {
  .form-grid {
    grid-template-columns: 1fr;
  }
  .stepper-container {
    display: none;
  } /* Hide stepper on mobile to save space */
  .wizard-content {
    padding: 20px;
  }
}
</style>
