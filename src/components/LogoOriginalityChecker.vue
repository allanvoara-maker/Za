<script setup lang="ts">
import { ref, watch, nextTick } from 'vue'
import axios from 'axios'

const props = defineProps<{
  brandName: string
  brandDescription?: string
  brandLogo?: string | null
}>()

const emit = defineEmits<{
  (e: 'report', data: any): void
}>()

const score = ref<number | null>(null)
const animatedScore = ref(0)
const animatedDashoffset = ref(251.2)
const explanation = ref('')
const logoAnalysis = ref<any>(null)
const totalKnownLogos = ref(0)
const localLogosCount = ref(0)
const loading = ref(false)
const error = ref('')

function animateScore(targetScore: number) {
  const circumference = 251.2
  const targetOffset = circumference * (1 - targetScore / 100)
  const duration = 1400
  const startTime = performance.now()
  const startOffset = circumference

  function tick(currentTime: number) {
    const elapsed = currentTime - startTime
    const progress = Math.min(elapsed / duration, 1)
    const eased = 1 - Math.pow(1 - progress, 3)
    animatedDashoffset.value = startOffset - eased * (startOffset - targetOffset)
    animatedScore.value = Math.round(eased * targetScore)
    if (progress < 1) requestAnimationFrame(tick)
    else {
      animatedDashoffset.value = targetOffset
      animatedScore.value = targetScore
    }
  }

  animatedDashoffset.value = circumference
  animatedScore.value = 0
  requestAnimationFrame(tick)
}

const checkLogoOriginality = async () => {
  if (!props.brandLogo) {
    error.value = 'Veuillez d\'abord joindre une image de logo.'
    return
  }

  loading.value = true
  error.value = ''
  score.value = null
  explanation.value = ''
  logoAnalysis.value = null

  try {
    const response = await axios.post('http://localhost:3000/api/trademarks/check-logo-originality', {
      brandName: props.brandName || 'Marque sans nom',
      brandDescription: props.brandDescription || '',
      brandLogo: props.brandLogo,
    })

    score.value = response.data.visualOriginalityScore
    explanation.value = response.data.explanation
    logoAnalysis.value = response.data.logoAnalysis
    totalKnownLogos.value = response.data.totalKnownLogos || 0
    localLogosCount.value = response.data.localLogosInDatabase || 0

    emit('report', {
      visualOriginalityScore: response.data.visualOriginalityScore,
      explanation: response.data.explanation,
      logoAnalysis: response.data.logoAnalysis,
      totalKnownLogos: response.data.totalKnownLogos,
    })

    await nextTick()
    setTimeout(() => animateScore(response.data.visualOriginalityScore), 80)
  } catch (err: any) {
    console.error(err)
    error.value = err.response?.data?.message || 'Erreur lors de l\'analyse visuelle du logo.'
    emit('report', null)
  } finally {
    loading.value = false
  }
}

watch(() => props.brandLogo, () => {
  score.value = null
  animatedScore.value = 0
  animatedDashoffset.value = 251.2
  explanation.value = ''
  logoAnalysis.value = null
  error.value = ''
  emit('report', null)
})

const getScoreColor = (val: number) => {
  if (val >= 80) return '#10b981'
  if (val >= 50) return '#f59e0b'
  return '#ef4444'
}

const getScoreLabel = (val: number) => {
  if (val >= 80) return 'Logo original'
  if (val >= 50) return 'Similitudes détectées'
  return 'Risque visuel élevé'
}

const getScoreClass = (val: number) => {
  if (val >= 80) return 'score-green'
  if (val >= 50) return 'score-amber'
  return 'score-red'
}

const getConflictSourceLabel = (source: string) => {
  if (source === 'local') return 'Marque locale OMAPI'
  if (source === 'célèbre') return 'Marque internationale'
  return ''
}
</script>

<template>
  <div class="logo-checker-wrapper">
    <!-- UI hidden: header chip, button and hints are kept in DOM but not displayed -->
    <div style="display: none;">
      <div class="logo-checker-header">
        <div class="ai-chip" style="display: inline-flex; align-items: center; gap: 6px;">
          <span class="ai-spark" style="display: flex; align-items: center; justify-content: center;">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="width: 12px; height: 12px; color: #7c3aed;"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
          </span>
          IA — Analyse visuelle du logo
        </div>
        <button
          type="button"
          class="btn-logo-check"
          :disabled="loading || !brandLogo"
          @click="checkLogoOriginality"
          style="display: inline-flex; align-items: center; justify-content: center; gap: 6px;"
        >
          <span v-if="loading" style="display: inline-flex; align-items: center; justify-content: center;">
            <svg class="animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" style="width: 14px; height: 14px; animation: spin 1s linear infinite;"><circle cx="12" cy="12" r="10" stroke="currentColor" stroke-opacity="0.25"></circle><path d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4z" fill="currentColor"></path></svg>
          </span>
          <span v-else style="display: inline-flex; align-items: center; justify-content: center;">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width: 14px; height: 14px;"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
          </span>
          <span>Analyser le logo</span>
        </button>
      </div>

      <p class="hint-text" v-if="!brandLogo">
        Joignez une image pour comparer votre logo aux marques célèbres et aux dossiers déjà déposés.
      </p>
      <p class="hint-text" v-else-if="score === null && !loading">
        Compare votre logo à la bibliothèque OMAPI (marques internationales + dossiers locaux).
      </p>
    </div>

    <div v-if="error" class="error-box" style="display: flex; align-items: center; gap: 8px;">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="width: 16px; height: 16px; color: #ef4444; flex-shrink: 0;"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
      <span>{{ error }}</span>
    </div>

    <div v-if="loading" class="loading-panel">
      <div class="pulse-bar title-pulse"></div>
      <div class="skeleton-row">
        <div class="pulse-circle"></div>
        <div class="pulse-lines">
          <div class="pulse-bar line-1"></div>
          <div class="pulse-bar line-2"></div>
        </div>
      </div>
      <p class="loading-msg">L'IA compare votre logo à {{ totalKnownLogos || '100+' }} références visuelles…</p>
    </div>

    <div v-else-if="score !== null" class="results-panel">
      <div class="results-top">
        <div>
          <h4 class="panel-title">Originalité visuelle</h4>
          <p class="meta-text">
            Comparé à {{ totalKnownLogos }} logos référencés
            <span v-if="localLogosCount"> (dont {{ localLogosCount }} local{{ localLogosCount > 1 ? 'aux' : '' }})</span>
          </p>
        </div>
        <span class="badge-status" :class="getScoreClass(score)">{{ getScoreLabel(score) }}</span>
      </div>

      <div class="score-row">
        <div class="gauge-container">
          <svg class="gauge-svg" viewBox="0 0 100 100">
            <circle class="gauge-bg" cx="50" cy="50" r="40" />
            <circle
              class="gauge-fill"
              cx="50" cy="50" r="40"
              :stroke="getScoreColor(score)"
              :stroke-dasharray="251.2"
              :stroke-dashoffset="animatedDashoffset"
            />
            <text class="gauge-num" x="50" y="52">{{ animatedScore }}%</text>
            <text class="gauge-lbl" x="50" y="68">Visuel</text>
          </svg>
        </div>
        <div class="explanation-box">
          <p>{{ explanation }}</p>
        </div>
      </div>

      <div v-if="logoAnalysis" class="analysis-detail" :class="logoAnalysis.hasVisualConflict ? 'conflict' : 'ok'">
        <div class="detail-header">
          <span class="status-badge" :class="logoAnalysis.hasVisualConflict ? 'warn' : 'success'" style="display: inline-flex; align-items: center; gap: 6px;">
            <svg v-if="logoAnalysis.hasVisualConflict" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="width: 12px; height: 12px;"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
            <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="width: 12px; height: 12px;"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
            <span>{{ logoAnalysis.hasVisualConflict ? 'Ressemblance détectée' : 'Aucun conflit majeur' }}</span>
          </span>
          <span v-if="logoAnalysis.visualScorePenalty > 0" class="penalty-badge">
            −{{ logoAnalysis.visualScorePenalty }}% sur le score global
          </span>
          <span v-if="logoAnalysis.conflictingBrand" class="conflict-brand" style="display: inline-flex; align-items: center; gap: 4px;">
            <svg v-if="logoAnalysis.conflictSource === 'local'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width: 12px; height: 12px; vertical-align: middle;"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
            <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width: 12px; height: 12px; vertical-align: middle;"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>
            {{ getConflictSourceLabel(logoAnalysis.conflictSource) }}
            · {{ logoAnalysis.conflictingBrand }}
          </span>
        </div>
        <p class="detail-text">{{ logoAnalysis.conflictDetails }}</p>
        <p v-if="logoAnalysis.logoDescription" class="logo-desc">
          <strong>Description IA :</strong> {{ logoAnalysis.logoDescription }}
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.logo-checker-wrapper {
  margin-top: 16px;
  padding: 18px;
  background: linear-gradient(135deg, #faf5ff 0%, #f0f9ff 100%);
  border: 1px solid #e9d5ff;
  border-radius: 12px;
}

.logo-checker-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 10px;
}

.ai-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: linear-gradient(135deg, #a855f7, #7c3aed);
  color: white;
  padding: 5px 12px;
  border-radius: 20px;
  font-size: 0.78rem;
  font-weight: 700;
}

.btn-logo-check {
  background: linear-gradient(135deg, #7c3aed, #6d28d9);
  color: white;
  border: none;
  padding: 9px 18px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.88rem;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  box-shadow: 0 4px 12px rgba(124, 58, 237, 0.25);
  transition: transform 0.15s, box-shadow 0.15s;
}

.btn-logo-check:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 6px 16px rgba(124, 58, 237, 0.35);
}

.btn-logo-check:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

.hint-text {
  font-size: 0.82rem;
  color: #64748b;
  margin: 0 0 8px;
}

.error-box {
  background: #fee2e2;
  border: 1px solid #fca5a5;
  color: #dc2626;
  padding: 10px 14px;
  border-radius: 8px;
  font-size: 0.85rem;
  margin-top: 8px;
}

.loading-panel {
  padding: 16px 0;
}

.loading-msg {
  font-size: 0.82rem;
  color: #7c3aed;
  font-weight: 600;
  margin-top: 12px;
}

.skeleton-row {
  display: flex;
  gap: 20px;
  align-items: center;
  margin-top: 12px;
}

.pulse-bar {
  background: linear-gradient(90deg, #e9d5ff 25%, #ddd6fe 50%, #e9d5ff 75%);
  background-size: 200% 100%;
  animation: pulse 1.5s infinite;
  border-radius: 4px;
}

.title-pulse { height: 16px; width: 140px; }
.pulse-circle {
  width: 70px; height: 70px; border-radius: 50%;
  background: linear-gradient(90deg, #e9d5ff 25%, #ddd6fe 50%, #e9d5ff 75%);
  background-size: 200% 100%;
  animation: pulse 1.5s infinite;
}
.pulse-lines { flex: 1; display: flex; flex-direction: column; gap: 8px; }
.line-1 { height: 14px; width: 90%; }
.line-2 { height: 14px; width: 65%; }

@keyframes pulse {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

.spinner { animation: spin 1.5s linear infinite; display: inline-block; }
@keyframes spin { to { transform: rotate(360deg); } }

.results-panel {
  margin-top: 12px;
  padding-top: 14px;
  border-top: 1px dashed #c4b5fd;
}

.results-top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 14px;
}

.panel-title {
  font-size: 0.95rem;
  font-weight: 700;
  color: #5b21b6;
  margin: 0 0 4px;
}

.meta-text { font-size: 0.78rem; color: #64748b; margin: 0; }

.badge-status {
  padding: 5px 12px;
  border-radius: 20px;
  font-size: 0.78rem;
  font-weight: 700;
}

.score-green { background: #ecfdf5; color: #059669; border: 1px solid #a7f3d0; }
.score-amber { background: #fffbeb; color: #d97706; border: 1px solid #fde68a; }
.score-red { background: #fef2f2; color: #dc2626; border: 1px solid #fecaca; }

.score-row {
  display: flex;
  gap: 20px;
  align-items: center;
  flex-wrap: wrap;
}

.gauge-container { width: 110px; height: 110px; flex-shrink: 0; }
.gauge-svg { width: 100%; height: 100%; transform: rotate(-90deg); }
.gauge-bg { fill: none; stroke: #f1f5f9; stroke-width: 8; }
.gauge-fill {
  fill: none; stroke-width: 9; stroke-linecap: round;
  filter: drop-shadow(0 0 3px currentColor);
}
.gauge-num {
  font-size: 1.15rem; font-weight: 800; fill: #1e293b;
  text-anchor: middle; transform: rotate(90deg); transform-origin: center;
}
.gauge-lbl {
  font-size: 0.5rem; font-weight: 600; fill: #64748b;
  text-anchor: middle; transform: rotate(90deg); transform-origin: center;
  text-transform: uppercase;
}

.explanation-box {
  flex: 1;
  min-width: 180px;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  padding: 12px 16px;
}

.explanation-box p {
  margin: 0;
  font-size: 0.88rem;
  color: #334155;
  line-height: 1.5;
}

.analysis-detail {
  margin-top: 14px;
  padding: 14px;
  border-radius: 10px;
  border-left: 4px solid;
}

.analysis-detail.conflict {
  background: #fef2f2;
  border-color: #ef4444;
}

.analysis-detail.ok {
  background: #f0fdf4;
  border-color: #22c55e;
}

.detail-header {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.status-badge {
  font-size: 0.75rem;
  font-weight: 700;
  padding: 3px 10px;
  border-radius: 12px;
}

.status-badge.warn { background: #fee2e2; color: #dc2626; }
.status-badge.success { background: #dcfce7; color: #16a34a; }

.penalty-badge {
  font-size: 0.72rem;
  font-weight: 700;
  background: #dc2626;
  color: white;
  padding: 3px 8px;
  border-radius: 10px;
}

.conflict-brand {
  font-size: 0.75rem;
  color: #64748b;
  font-weight: 600;
}

.detail-text {
  font-size: 0.85rem;
  color: #475569;
  line-height: 1.45;
  margin: 0 0 8px;
}

.logo-desc {
  font-size: 0.8rem;
  color: #64748b;
  margin: 0;
  font-style: italic;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>
