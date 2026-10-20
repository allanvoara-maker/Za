<script setup lang="ts">
import { ref, watch, nextTick } from 'vue'
import axios from 'axios'

const props = defineProps<{
  brandName: string
  brandDescription?: string
  brandLogo?: string
}>()

const emit = defineEmits<{
  (e: 'select', name: string): void
  (e: 'report', data: any): void
}>()

interface Match {
  name: string
  owner: string
  country: string
  status: string
  similarity: number
  details: {
    exact: boolean
    levenshtein: number
    phonetic: boolean
    bigram: number
  }
}

interface Suggestion {
  name: string
  score: number
}

const score = ref<number | null>(null)
const animatedScore = ref<number>(0)
const animatedDashoffset = ref<number>(251.2) // Full circumference = 2*PI*40 ≈ 251.2
const appropriate = ref<boolean>(true)
const descriptionValid = ref<boolean>(true)
const descriptionError = ref<string>('')
const explanation = ref<string>('')
const matches = ref<Match[]>([])
const checkedCount = ref<number>(0)
const suggestions = ref<Suggestion[]>([])
const logoAnalysis = ref<any>(null)
const showManualSuggestions = ref<boolean>(false)
const loading = ref<boolean>(false)
const error = ref<string>('')

// Animate score circle and counter when score changes
function animateScore(targetScore: number) {
  const circumference = 251.2 // 2 * PI * 40
  const targetOffset = circumference * (1 - targetScore / 100)
  const duration = 1600 // ms
  const startTime = performance.now()
  const startOffset = circumference

  function tick(currentTime: number) {
    const elapsed = currentTime - startTime
    const progress = Math.min(elapsed / duration, 1)
    // Ease-out cubic
    const eased = 1 - Math.pow(1 - progress, 3)

    animatedDashoffset.value = startOffset - eased * (startOffset - targetOffset)
    animatedScore.value = Math.round(eased * targetScore)

    if (progress < 1) {
      requestAnimationFrame(tick)
    } else {
      animatedDashoffset.value = targetOffset
      animatedScore.value = targetScore
    }
  }

  // Start from full circle first
  animatedDashoffset.value = circumference
  animatedScore.value = 0
  requestAnimationFrame(tick)
}

const checkOriginality = async () => {
  if (!props.brandName.trim()) {
    error.value = 'Veuillez saisir un nom de marque avant de lancer la vérification.'
    return
  }

  loading.value = true
  error.value = ''
  score.value = null
  appropriate.value = true
  descriptionValid.value = true
  descriptionError.value = ''
  matches.value = []
  explanation.value = ''
  suggestions.value = []
  logoAnalysis.value = null
  showManualSuggestions.value = false

  try {
    const response = await axios.post('http://localhost:3000/api/trademarks/check-originality', {
      brandName: props.brandName,
      brandDescription: props.brandDescription || '',
      brandLogo: props.brandLogo || ''
    })

    appropriate.value = response.data.appropriate !== false
    descriptionValid.value = response.data.descriptionValid !== false
    descriptionError.value = response.data.descriptionExplanation || ''
    score.value = response.data.originalityScore
    explanation.value = response.data.explanation
    matches.value = response.data.topMatches || []
    checkedCount.value = response.data.totalChecked || 0
    suggestions.value = response.data.suggestions || []
    logoAnalysis.value = response.data.logoAnalysis || null
    
    // Emit report for parent to store with submission (include logoAnalysis for logo_description persistence)
    if (appropriate.value && descriptionValid.value && score.value !== null) {
      emit('report', {
        score: response.data.originalityScore,
        explanation: response.data.explanation,
        topMatches: response.data.topMatches || [],
        logoAnalysis: response.data.logoAnalysis || null
      })
      // Trigger gauge animation after DOM update
      await nextTick()
      setTimeout(() => animateScore(response.data.originalityScore), 80)
    } else {
      emit('report', null)
    }
  } catch (err: any) {
    console.error(err)
    error.value = err.response?.data?.message || 'Erreur lors de la vérification de l\'originalité. Veuillez réessayer.'
    emit('report', null)
  } finally {
    loading.value = false
  }
}

// Watch brandName, brandDescription and brandLogo to reset results if changes occur
watch([() => props.brandName, () => props.brandDescription, () => props.brandLogo], () => {
  score.value = null
  animatedScore.value = 0
  animatedDashoffset.value = 251.2
  appropriate.value = true
  descriptionValid.value = true
  descriptionError.value = ''
  explanation.value = ''
  matches.value = []
  error.value = ''
  suggestions.value = []
  logoAnalysis.value = null
  showManualSuggestions.value = false
  emit('report', null)
})

const getScoreColor = (val: number) => {
  if (val >= 80) return '#10b981' // Green
  if (val >= 50) return '#f59e0b' // Amber/Yellow
  return '#ef4444' // Red
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
  <div class="originality-checker-wrapper mt-20">
    <div class="action-bar">
      <button 
        type="button"
        class="btn-originality-check" 
        :disabled="loading || !brandName.trim()"
        @click="checkOriginality"
        style="display: inline-flex; align-items: center; justify-content: center; gap: 6px;"
      >
        <span v-if="loading" style="display: inline-flex; align-items: center; justify-content: center;">
          <svg class="animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" style="width: 14px; height: 14px; animation: spin 1s linear infinite;"><circle cx="12" cy="12" r="10" stroke="currentColor" stroke-opacity="0.25"></circle><path d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4z" fill="currentColor"></path></svg>
        </span>
        <span v-else style="display: inline-flex; align-items: center; justify-content: center;">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="width: 14px; height: 14px; color: white;"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
        </span>
        <span>Vérifier la conformité & l'originalité</span>
      </button>
      <span class="info-note" v-if="!brandName.trim()">
        Saisissez un nom de marque ci-dessus pour activer l'analyse.
      </span>
    </div>

    <!-- Error state -->
    <div v-if="error" class="error-box mt-15" style="display: flex; align-items: center; gap: 8px;">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="width: 16px; height: 16px; color: #ef4444; flex-shrink: 0;"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
      <span>{{ error }}</span>
    </div>

    <!-- Loading Skeleton -->
    <div v-if="loading" class="loading-panel mt-15 glass-dark fade-in">
      <div class="pulse-bar title-pulse"></div>
      <div class="skeleton-grid">
        <div class="pulse-circle"></div>
        <div class="pulse-lines">
          <div class="pulse-bar line-1"></div>
          <div class="pulse-bar line-2"></div>
          <div class="pulse-bar line-3"></div>
        </div>
      </div>
    </div>

    <!-- Guidelines Violation Panel (Brand Name) -->
    <div v-else-if="appropriate === false" class="violation-panel mt-15 glass fade-in">
      <div class="violation-header">
        <span class="violation-icon" style="display: flex; align-items: center; justify-content: center; color: #ef4444;">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width: 24px; height: 24px;"><circle cx="12" cy="12" r="10"></circle><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"></line></svg>
        </span>
        <h3 class="violation-title">Directives communautaires non respectées (Nom de marque)</h3>
      </div>
      <p class="violation-reason">{{ explanation }}</p>
      <p class="violation-instruction">Veuillez modifier le nom pour pouvoir poursuivre l'analyse d'originalité et la soumission du dossier.</p>
    </div>

    <!-- Description Validation Error Panel -->
    <div v-else-if="descriptionValid === false" class="violation-panel mt-15 glass fade-in description-error-panel" style="border-color: #ea580c; background: rgba(234, 88, 12, 0.05);">
      <div class="violation-header">
        <span class="violation-icon" style="display: flex; align-items: center; justify-content: center; color: #ea580c;">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width: 24px; height: 24px;"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
        </span>
        <h3 class="violation-title" style="color: #ea580c;">Description non valide</h3>
      </div>
      <p class="violation-reason">{{ descriptionError }}</p>
      <p class="violation-instruction" style="color: #ea580c; font-weight: 600;">Veuillez modifier la description ci-dessous pour pouvoir poursuivre.</p>
    </div>

    <!-- Results Panel -->
    <div v-else-if="score !== null" class="results-panel mt-15 glass fade-in">
      
      <div class="results-header">
        <div class="header-text">
          <h3 class="panel-subtitle">Analyse d'Originalité</h3>
          <p class="checked-meta">Comparé à {{ checkedCount }} marques internationales en temps réel.</p>
        </div>
        <div class="header-badge-row">
          <button 
            v-if="suggestions.length > 0"
            type="button"
            class="btn-toggle-suggestions"
            @click="showManualSuggestions = !showManualSuggestions"
            style="display: inline-flex; align-items: center; gap: 4px;"
          >
            <span style="display: flex; align-items: center; justify-content: center;">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="width: 12px; height: 12px;"><path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .5 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"></path><line x1="9" y1="18" x2="15" y2="18"></line><line x1="10" y1="22" x2="14" y2="22"></line></svg>
            </span>
            <span>{{ showManualSuggestions ? 'Masquer' : 'Suggestions' }}</span>
          </button>
          <div class="badge-status" :class="getScoreClass(score)">
            {{ getScoreLabel(score) }}
          </div>
        </div>
      </div>

      <div class="score-display-row">
        <!-- Animated SVG Gauge -->
        <div class="gauge-container">
          <svg class="gauge-svg" viewBox="0 0 100 100">
            <!-- Background glow ring (tracks animated fill) -->
            <circle 
              class="gauge-glow" 
              cx="50" 
              cy="50" 
              r="40" 
              :stroke="getScoreColor(score)"
              :stroke-dasharray="251.2"
              :stroke-dashoffset="animatedDashoffset"
            />
            <circle class="gauge-bg" cx="50" cy="50" r="40" />
            <!-- Animated fill ring -->
            <circle 
              class="gauge-fill" 
              cx="50" 
              cy="50" 
              r="40"
              :stroke="getScoreColor(score)"
              :stroke-dasharray="251.2"
              :stroke-dashoffset="animatedDashoffset"
            />
            <!-- Animated score counter -->
            <text class="gauge-text-num" x="50" y="52">{{ animatedScore }}%</text>
            <text class="gauge-text-lbl" x="50" y="70">Original</text>
          </svg>
        </div>

        <!-- AI Narrative Explanation -->
        <div class="explanation-box">
          <div class="ai-badge" style="display: inline-flex; align-items: center; gap: 6px;">
            <span class="ai-spark" style="display: flex; align-items: center; justify-content: center;">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="width: 12px; height: 12px; color: #7c3aed;"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
            </span>
            <span>Analyse IA</span>
          </div>
          <p class="explanation-text">
            {{ explanation }}
          </p>
        </div>
      </div>

      <!-- Logo Analysis block — shown whenever a logo was analyzed -->
      <div class="logo-analysis-section mt-25" v-if="logoAnalysis">
        <h4 class="section-sub-title" style="display: inline-flex; align-items: center; gap: 8px;">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width: 18px; height: 18px; color: #0A3A6A; vertical-align: middle;"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
          Analyse visuelle du logo par l'IA :
        </h4>
        <div class="logo-analysis-box" :class="logoAnalysis.hasVisualConflict ? 'conflict-warning' : 'conflict-ok'">
          <div class="logo-analysis-meta">
            <span class="logo-analysis-status-badge" :style="{ backgroundColor: logoAnalysis.hasVisualConflict ? '#fee2e2' : '#ecfdf5', color: logoAnalysis.hasVisualConflict ? '#dc2626' : '#10b981' }">
              {{ logoAnalysis.hasVisualConflict ? 'Risque de ressemblance' : 'Logo visuellement unique' }}
            </span>
            <span v-if="logoAnalysis.visualScorePenalty > 0" class="logo-penalty-badge">
              Pénalité: -{{ logoAnalysis.visualScorePenalty }}%
            </span>
          </div>
          <p class="logo-analysis-desc">{{ logoAnalysis.conflictDetails }}</p>
        </div>
      </div>

      <!-- Suggestions block -->
      <div class="suggestions-section mt-25" v-if="suggestions.length > 0 && (score < 50 || showManualSuggestions)">
        <h4 class="section-sub-title" style="display: inline-flex; align-items: center; gap: 8px;">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width: 18px; height: 18px; color: #ea580c; vertical-align: middle;"><path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .5 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"></path><line x1="9" y1="18" x2="15" y2="18"></line><line x1="10" y1="22" x2="14" y2="22"></line></svg>
          Noms alternatifs recommandés par l'IA (taux > 50%) :
        </h4>
        <div class="suggestions-list">
          <button 
            type="button" 
            v-for="s in suggestions" 
            :key="s.name" 
            class="suggestion-pill"
            @click="emit('select', s.name)"
            :title="`Cliquez pour utiliser ce nom (Originalité : ${s.score}%)`"
          >
            <span class="suggestion-name">{{ s.name }}</span>
            <span class="suggestion-score-badge" :style="{ backgroundColor: getScoreColor(s.score) }">
              {{ s.score }}%
            </span>
          </button>
        </div>
        <p class="suggestion-tip">Cliquez sur un nom ci-dessus pour remplacer automatiquement le nom de votre marque.</p>
      </div>

      <!-- Similar matches list -->
      <div class="similar-matches-section mt-25" v-if="matches.length > 0">
        <h4 class="section-sub-title">Marques similaires ou proches détectées :</h4>
        
        <div class="matches-table-wrapper">
          <table class="matches-table">
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
              <tr v-for="match in matches" :key="match.name">
                <td class="match-name-cell">
                  <strong>{{ match.name }}</strong>
                  <span class="match-flags">
                    <span v-if="match.details.exact" class="flag-badge badge-exact">Exact</span>
                    <span v-if="match.details.phonetic" class="flag-badge badge-phonetic">Phonétique</span>
                  </span>
                </td>
                <td class="text-truncate" style="max-width: 150px;">{{ match.owner }}</td>
                <td>
                  <span class="country-badge">{{ match.country }}</span>
                </td>
                <td>
                  <span class="status-badge" :class="match.status.toLowerCase()">
                    {{ match.status }}
                  </span>
                </td>
                <td class="text-right">
                  <div class="similarity-bar-wrapper">
                    <span class="sim-pct">{{ match.similarity }}%</span>
                    <div class="sim-bar">
                      <div 
                        class="sim-bar-fill" 
                        :style="{ 
                          width: match.similarity + '%',
                          backgroundColor: match.similarity > 75 ? '#ef4444' : match.similarity > 50 ? '#f59e0b' : '#0088cc'
                        }"
                      ></div>
                    </div>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div class="no-matches-success mt-20" style="display: flex; align-items: center; gap: 10px;">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="width: 22px; height: 22px; color: #16a34a; flex-shrink: 0; vertical-align: middle;"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
        <span>Fantastique ! Aucune marque similaire n'a été détectée. Votre nom de marque semble unique et prêt à être déposé en toute sécurité.</span>
      </div>

    </div>
  </div>
</template>

<style scoped>
.originality-checker-wrapper {
  width: 100%;
}

.action-bar {
  display: flex;
  align-items: center;
  gap: 15px;
  flex-wrap: wrap;
}

.btn-originality-check {
  background: linear-gradient(135deg, var(--secondary-blue) 0%, var(--primary-blue) 100%);
  color: white;
  padding: 10px 20px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.95rem;
  box-shadow: 0 4px 15px rgba(10, 58, 106, 0.2);
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.btn-originality-check:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(10, 58, 106, 0.3);
}

.btn-originality-check:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.info-note {
  font-size: 0.85rem;
  color: var(--text-light);
}

.spinner {
  display: inline-block;
  animation: spin 1.5s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error-box {
  background-color: #fee2e2;
  border: 1px solid #fca5a5;
  color: #dc2626;
  padding: 10px 15px;
  border-radius: 8px;
  font-size: 0.9rem;
}

/* Loading panel */
.loading-panel {
  background: rgba(15, 23, 42, 0.03);
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 25px;
}

.skeleton-grid {
  display: flex;
  gap: 25px;
  align-items: center;
  margin-top: 15px;
}

.pulse-bar {
  background: linear-gradient(90deg, #e2e8f0 25%, #cbd5e1 50%, #e2e8f0 75%);
  background-size: 200% 100%;
  animation: pulse 1.5s infinite;
  border-radius: 4px;
}

.title-pulse {
  height: 20px;
  width: 150px;
}

.pulse-circle {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: linear-gradient(90deg, #e2e8f0 25%, #cbd5e1 50%, #e2e8f0 75%);
  background-size: 200% 100%;
  animation: pulse 1.5s infinite;
}

.pulse-lines {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.line-1 { height: 16px; width: 85%; }
.line-2 { height: 16px; width: 60%; }
.line-3 { height: 16px; width: 40%; }

@keyframes pulse {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

/* Violation Panel */
.violation-panel {
  background-color: #fff1f2;
  border: 1px solid #fecaca;
  border-radius: 12px;
  padding: 25px;
  box-shadow: 0 8px 20px rgba(220, 38, 38, 0.05);
}

.violation-header {
  display: flex;
  align-items: center;
  gap: 10px;
  color: #dc2626;
  margin-bottom: 12px;
}

.violation-icon {
  font-size: 1.5rem;
}

.violation-title {
  font-size: 1.1rem;
  font-weight: 700;
}

.violation-reason {
  font-size: 0.95rem;
  color: #991b1b;
  font-weight: 500;
  margin-bottom: 10px;
  background: white;
  padding: 10px 15px;
  border-radius: 6px;
  border-left: 4px solid #dc2626;
}

.violation-instruction {
  font-size: 0.85rem;
  color: #b91c1c;
}

/* Results panel */
.results-panel {
  background: var(--white);
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  padding: 30px;
  box-shadow: 0 10px 25px rgba(0,0,0,0.03);
}

.results-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 25px;
  border-bottom: 1px solid #f1f5f9;
  padding-bottom: 15px;
  flex-wrap: wrap;
  gap: 15px;
}

.panel-subtitle {
  font-size: 1.2rem;
  color: var(--primary-blue);
  font-weight: 700;
  margin-bottom: 4px;
}

.checked-meta {
  font-size: 0.8rem;
  color: var(--text-light);
}

.header-badge-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.btn-toggle-suggestions {
  background-color: #f0fdf4;
  border: 1px solid #bbf7d0;
  color: #16a34a;
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-toggle-suggestions:hover {
  background-color: #dcfce7;
  transform: translateY(-1px);
}

.badge-status {
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 700;
}

.score-green {
  background-color: #ecfdf5;
  color: #059669;
  border: 1px solid #a7f3d0;
}

.score-amber {
  background-color: #fffbeb;
  color: #d97706;
  border: 1px solid #fde68a;
}

.score-red {
  background-color: #fef2f2;
  color: #dc2626;
  border: 1px solid #fecaca;
}

.score-display-row {
  display: flex;
  gap: 30px;
  align-items: center;
  flex-wrap: wrap;
}

.gauge-container {
  width: 130px;
  height: 130px;
  flex-shrink: 0;
  drop-shadow: 0 0 12px currentColor;
}

.gauge-svg {
  width: 100%;
  height: 100%;
  transform: rotate(-90deg);
}

.gauge-bg {
  fill: none;
  stroke: #f1f5f9;
  stroke-width: 8;
}

.gauge-glow {
  fill: none;
  stroke-width: 16;
  stroke-linecap: round;
  opacity: 0.15;
  filter: blur(3px);
  stroke-dasharray: 251.2;
  animation: glow-pulse 2s ease-in-out infinite;
}

@keyframes glow-pulse {
  0%, 100% { opacity: 0.10; }
  50% { opacity: 0.25; }
}

.gauge-fill {
  fill: none;
  stroke-width: 9;
  stroke-linecap: round;
  filter: drop-shadow(0 0 3px currentColor);
}

.gauge-text-num {
  font-size: 1.25rem;
  font-weight: 800;
  fill: var(--text-dark);
  text-anchor: middle;
  transform: rotate(90deg);
  transform-origin: center;
}

.gauge-text-lbl {
  font-size: 0.55rem;
  font-weight: 600;
  fill: var(--text-light);
  text-anchor: middle;
  transform: rotate(90deg);
  transform-origin: center;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.explanation-box {
  flex: 1;
  background-color: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  padding: 15px 20px;
  position: relative;
}

.ai-badge {
  position: absolute;
  top: -10px;
  left: 15px;
  background: linear-gradient(135deg, #a855f7 0%, #7c3aed 100%);
  color: white;
  padding: 2px 10px;
  border-radius: 10px;
  font-size: 0.7rem;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.ai-spark {
  font-size: 0.8rem;
}

.explanation-text {
  font-size: 0.95rem;
  color: #334155;
  line-height: 1.5;
  margin-top: 5px;
}

.section-sub-title {
  font-size: 0.95rem;
  font-weight: 700;
  color: #475569;
  margin-bottom: 12px;
}

/* Suggestions Section */
.suggestions-section {
  background: linear-gradient(135deg, #f0fdf4 0%, #f0f9ff 100%);
  border: 1px dashed #bbf7d0;
  border-radius: 12px;
  padding: 20px;
  animation: fadeIn 0.4s ease-out;
}

.suggestions-list {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin: 12px 0;
}

.suggestion-pill {
  background: white;
  border: 1px solid #cbd5e1;
  color: var(--primary-blue);
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 2px 4px rgba(0,0,0,0.02);
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.suggestion-pill:hover {
  border-color: var(--secondary-blue);
  background: #f0f9ff;
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0,0,0,0.05);
}

.suggestion-score-badge {
  font-size: 0.7rem;
  font-weight: 700;
  color: white;
  padding: 2px 6px;
  border-radius: 10px;
}

/* Logo Analysis styles */
.logo-analysis-section {
  animation: fadeIn 0.4s ease-out;
}

.logo-analysis-box {
  border-radius: 10px;
  padding: 15px;
  border-left: 4px solid;
}

.conflict-warning {
  background-color: #fef2f2;
  border-color: #ef4444;
  border-top: 1px solid rgba(239, 68, 68, 0.1);
  border-right: 1px solid rgba(239, 68, 68, 0.1);
  border-bottom: 1px solid rgba(239, 68, 68, 0.1);
}

.conflict-ok {
  background-color: #f0fdf4;
  border-color: #22c55e;
  border-top: 1px solid rgba(34, 197, 94, 0.1);
  border-right: 1px solid rgba(34, 197, 94, 0.1);
  border-bottom: 1px solid rgba(34, 197, 94, 0.1);
}

.logo-analysis-meta {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 8px;
}

.logo-analysis-status-badge {
  font-size: 0.75rem;
  font-weight: 700;
  padding: 3px 8px;
  border-radius: 12px;
}

.logo-penalty-badge {
  font-size: 0.75rem;
  font-weight: 700;
  background-color: #dc2626;
  color: white;
  padding: 3px 8px;
  border-radius: 12px;
}

.logo-analysis-desc {
  font-size: 0.9rem;
  color: #475569;
  line-height: 1.4;
}

.suggestion-tip {
  font-size: 0.8rem;
  color: var(--text-light);
  font-style: italic;
  margin-top: 5px;
}

/* Matches table */
.matches-table-wrapper {
  overflow-x: auto;
  border: 1px solid #f1f5f9;
  border-radius: 8px;
}

.matches-table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
  font-size: 0.9rem;
}

.matches-table th {
  background-color: #f8fafc;
  padding: 12px 15px;
  font-weight: 600;
  color: #64748b;
  border-bottom: 1px solid #e2e8f0;
}

.matches-table td {
  padding: 12px 15px;
  border-bottom: 1px solid #f1f5f9;
  color: #334155;
  vertical-align: middle;
}

.match-name-cell {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.match-flags {
  display: flex;
  gap: 6px;
}

.flag-badge {
  font-size: 0.65rem;
  padding: 1px 6px;
  border-radius: 4px;
  font-weight: 600;
}

.badge-exact {
  background-color: #fee2e2;
  color: #b91c1c;
}

.badge-phonetic {
  background-color: #dbeafe;
  color: #1d4ed8;
}

.country-badge {
  background-color: #e2e8f0;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 700;
}

.status-badge {
  font-size: 0.75rem;
  padding: 2px 8px;
  border-radius: 10px;
  font-weight: 600;
}

.status-badge.enregistré, .status-badge.enregistrée {
  background-color: #ecfdf5;
  color: #059669;
}

.status-badge.publié {
  background-color: #eff6ff;
  color: #1d4ed8;
}

.status-badge.rejeté {
  background-color: #fef2f2;
  color: #dc2626;
}

.similarity-bar-wrapper {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 10px;
}

.sim-pct {
  font-weight: 700;
  font-size: 0.85rem;
  color: var(--text-dark);
}

.sim-bar {
  width: 60px;
  height: 6px;
  background-color: #e2e8f0;
  border-radius: 3px;
  overflow: hidden;
}

.sim-bar-fill {
  height: 100%;
  border-radius: 3px;
}

.no-matches-success {
  background-color: #f0fdf4;
  border: 1px solid #bbf7d0;
  color: #16a34a;
  padding: 15px 20px;
  border-radius: 10px;
  font-size: 0.95rem;
  font-weight: 500;
}

.text-right { text-align: right; }
.text-truncate {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.mt-15 { margin-top: 15px; }
.mt-20 { margin-top: 20px; }
.mt-25 { margin-top: 25px; }

@media (max-width: 600px) {
  .score-display-row {
    flex-direction: column;
    align-items: center;
  }
  .explanation-box {
    width: 100%;
  }
}
</style>
