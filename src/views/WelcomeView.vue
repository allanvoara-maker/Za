<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth, useSessionTimeout } from '../composables/useAuth'

const { currentUser, logout } = useAuth()
const { startListening, stopListening } = useSessionTimeout()
const router = useRouter()

onMounted(() => startListening())
onUnmounted(() => stopListening())

const activeStep = ref(1)

const initials = computed(() => {
  const name = currentUser.value?.name || 'U'
  const parts = name.trim().split(' ')
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase()
  return name.substring(0, 2).toUpperCase()
})

const steps = [
  {
    num: 1,
    icon: 'search',
    title: "Recherche d'Antériorité",
    subtitle: "Étape préliminaire obligatoire",
    accent: '#0088CC',
    desc: "Avant d'entamer les démarches de dépôt, il est crucial de s'assurer que le signe choisi n'a pas déjà été enregistré par un tiers à Madagascar pour des produits ou services similaires. Cela évite les litiges ultérieurs et les risques de rejet par l'OMAPI.",
    tip: "Une taxe de 30 000 Ar est applicable pour les demandes de recherche d'antériorité officielles effectuées par l'OMAPI."
  },
  {
    num: 2,
    icon: 'file-text',
    title: "Préparation du Dossier",
    subtitle: "Renseignement des formulaires",
    accent: '#F26122',
    desc: "Renseignez les détails du déposant (nom, adresse, nationalité, téléphone) ainsi que les caractéristiques de la marque : type de marque (verbale, figurative, complexe), couleurs revendiquées, et téléchargez une reproduction haute définition de votre logo.",
    tip: "Toutes les informations doivent être saisies avec précision pour éviter les notifications de régularisation fastidieuses."
  },
  {
    num: 3,
    icon: 'tag',
    title: "Classification de Nice",
    subtitle: "Catégorisation des produits/services",
    accent: '#7c3aed',
    desc: "Les marques sont enregistrées pour des catégories précises de produits ou de services selon la Classification internationale de Nice (45 classes). Vous devez identifier et sélectionner les classes correspondant exactement à vos activités.",
    tip: "La taxe de dépôt initiale couvre jusqu'à 3 classes de la Classification de Nice. Une taxe de 20 000 Ar est due par classe supplémentaire."
  },
  {
    num: 4,
    icon: 'credit-card',
    title: "Règlement des Taxes",
    subtitle: "Validation financière du dépôt",
    accent: '#059669',
    desc: "Le dépôt est conditionné au paiement des taxes d'enregistrement prescrites. La taxe standard de dépôt national pour trois classes est de 180 000 Ariary. Les taxes doivent être acquittées pour que la demande soit déclarée recevable.",
    tip: "Les taxes doivent être payées en Ariary malgache. Leur paiement est obligatoire pour la recevabilité de la demande d'enregistrement."
  },
  {
    num: 5,
    icon: 'award',
    title: "Examen & Enregistrement",
    subtitle: "Validation officielle et publication",
    accent: '#0A3A6A',
    desc: "Une fois soumis, votre dossier fait l'objet d'un examen de forme et de fond par les examinateurs de l'OMAPI. En l'absence de motif de rejet ou d'opposition par des tiers après publication dans la Gazette Officielle de la Propriété Industrielle (GOPI), la marque est définitivement enregistrée.",
    tip: "L'enregistrement confère une protection exclusive pour 10 ans, renouvelable indéfiniment par périodes successives de même durée."
  }
]

const goToDashboard = () => router.push({ name: 'dashboard' })
const goToDepot = () => router.push({ name: 'depot' })
const goToMessages = () => router.push({ name: 'messages' })
const goToParametres = () => router.push({ name: 'parametres' })
</script>

<template>
  <div class="welcome-page">

    <!-- ─── Topbar ──────────────────────────────────────── -->
    <header class="w-topbar anim-slide-down">
      <div class="w-topbar-left">
        <div class="w-brand">
          <span class="w-brand-name">OMAPI</span>
          <span class="w-brand-sub">Portail</span>
        </div>
        <span class="w-official-badge">Espace Usager Officiel</span>
      </div>
      <div class="w-topbar-right">
        <div class="w-user-chip">
          <div class="w-avatar">{{ initials }}</div>
          <span class="w-user-name">{{ currentUser?.name || 'Utilisateur' }}</span>
        </div>
        <button class="w-logout-btn" @click="logout" style="display: flex; align-items: center; gap: 6px;">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width: 16px; height: 16px;"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
          Déconnexion
        </button>
      </div>
    </header>

    <!-- ─── Scrollable content ─────────────────────────────────── -->
    <div class="w-scroll-area">

      <!-- Hero Section -->
      <section class="w-hero anim-fade-up" style="animation-delay: 0.1s">
        <div class="w-hero-bg-shapes">
          <div class="shape shape-1"></div>
          <div class="shape shape-2"></div>
          <div class="shape shape-3"></div>
        </div>
        <div class="w-hero-content">
          <div class="w-hero-text">
            <span class="w-hero-eyebrow" style="display: inline-flex; align-items: center; gap: 8px;">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 14px; height: 14px;"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>
              Madagascar — Propriété Industrielle
            </span>
            <h1 class="w-hero-title">
              Bienvenue, <span class="w-hero-name">{{ currentUser?.name?.split(' ')[0] || 'Visiteur' }}</span> !
            </h1>
            <p class="w-hero-desc">
              Votre guichet numérique unique pour la protection, la gestion et le suivi de vos marques, brevets, dessins et modèles industriels à Madagascar.
            </p>
            <div class="w-hero-ctas">
              <button class="w-cta-primary" @click="goToDashboard">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width: 18px; height: 18px; margin-right: 8px;"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>
                Accéder au Tableau de bord
              </button>
              <button class="w-cta-secondary" @click="goToDepot">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width: 18px; height: 18px; margin-right: 8px;"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                Effectuer un nouveau dépôt
              </button>
            </div>
            <div class="w-hero-features">
              <span class="w-feature-badge">✓ Marques</span>
              <span class="w-feature-badge">✓ Brevets</span>
              <span class="w-feature-badge">✓ Dessins & Modèles</span>
              <span class="w-feature-badge">✓ Noms Commerciaux</span>
              <span class="w-feature-badge">✓ Système de Madrid</span>
            </div>
          </div>
          <div class="w-hero-stats">
            <div class="w-stat-card">
              <span class="w-stat-icon" style="display: flex; align-items: center; justify-content: center; color: white;">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 24px; height: 24px;"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path><line x1="7" y1="7" x2="7.01" y2="7"></line></svg>
              </span>
              <div class="w-stat-info">
                <strong>Depuis 1994</strong>
                <small>Opérationnel</small>
              </div>
            </div>
            <div class="w-stat-card">
              <span class="w-stat-icon" style="display: flex; align-items: center; justify-content: center; color: white;">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 24px; height: 24px;"><circle cx="12" cy="12" r="10"></circle><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"></path><path d="M2 12h20"></path></svg>
              </span>
              <div class="w-stat-info">
                <strong>OMPI / PCT</strong>
                <small>International</small>
              </div>
            </div>
            <div class="w-stat-card">
              <span class="w-stat-icon" style="display: flex; align-items: center; justify-content: center; color: white;">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 24px; height: 24px;"><path d="M16 16v1a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h11a2 2 0 0 1 2 2v1"></path><path d="M18 8h4a2 2 0 0 1-2 2h-4"></path><circle cx="6" cy="12" r="2"></circle><circle cx="21" cy="14" r="1"></circle></svg>
              </span>
              <div class="w-stat-info">
                <strong>Ord. 89-019</strong>
                <small>Cadre Légal</small>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Main Grid -->
      <div class="w-content-area">

        <!-- Left Column: Step Guide -->
        <div class="w-guide-card anim-fade-up" style="animation-delay: 0.25s">
          <div class="w-card-header">
            <h2 class="w-card-title" style="display: inline-flex; align-items: center; gap: 8px;">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="width: 18px; height: 18px; color: #d97706;"><path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .5 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"></path><line x1="9" y1="18" x2="15" y2="18"></line><line x1="10" y1="22" x2="14" y2="22"></line></svg>
              Comment déposer une marque ?
            </h2>
            <p class="w-card-desc">Suivez les 5 étapes recommandées par l'OMAPI pour protéger votre marque à Madagascar.</p>
          </div>

          <!-- Step selector -->
          <div class="w-step-track">
            <div class="w-step-line-bg"></div>
            <button
              v-for="s in steps"
              :key="s.num"
              class="w-step-btn"
              :class="{ active: activeStep === s.num }"
              @click="activeStep = s.num"
              :style="activeStep === s.num ? `--step-color: ${s.accent}` : ''"
              :title="s.title"
            >
              <span class="w-step-emoji" style="display: flex; align-items: center; justify-content: center; width: 44px; height: 44px;">
                <svg v-if="s.num === 1" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 20px; height: 20px;"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                <svg v-else-if="s.num === 2" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 20px; height: 20px;"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                <svg v-else-if="s.num === 3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 20px; height: 20px;"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path><line x1="7" y1="7" x2="7.01" y2="7"></line></svg>
                <svg v-else-if="s.num === 4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 20px; height: 20px;"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect><line x1="1" y1="10" x2="23" y2="10"></line></svg>
                <svg v-else-if="s.num === 5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 20px; height: 20px;"><line x1="3" y1="22" x2="21" y2="22"></line><line x1="6" y1="18" x2="6" y2="11"></line><line x1="10" y1="18" x2="10" y2="11"></line><line x1="14" y1="18" x2="14" y2="11"></line><line x1="18" y1="18" x2="18" y2="11"></line><path d="M12 2L2 7h20L12 2z"></path></svg>
              </span>
              <span class="w-step-num" :style="activeStep === s.num ? `background: ${s.accent}` : ''">{{ s.num }}</span>
            </button>
          </div>

          <!-- Step detail -->
          <Transition name="fade-step" mode="out-in">
            <div class="w-step-detail" :key="activeStep">
              <template v-for="s in steps" :key="s.num">
                <div v-if="activeStep === s.num">
                  <div class="w-step-badge" :style="`background: ${s.accent}`">ÉTAPE {{ s.num }} / 5</div>
                  <h3 class="w-step-title" style="display: flex; align-items: center; gap: 8px;">
                    <svg v-if="s.num === 1" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="width: 22px; height: 22px; vertical-align: middle; display: inline-block;"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                    <svg v-else-if="s.num === 2" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="width: 22px; height: 22px; vertical-align: middle; display: inline-block;"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                    <svg v-else-if="s.num === 3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="width: 22px; height: 22px; vertical-align: middle; display: inline-block;"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path><line x1="7" y1="7" x2="7.01" y2="7"></line></svg>
                    <svg v-else-if="s.num === 4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="width: 22px; height: 22px; vertical-align: middle; display: inline-block;"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect><line x1="1" y1="10" x2="23" y2="10"></line></svg>
                    <svg v-else-if="s.num === 5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="width: 22px; height: 22px; vertical-align: middle; display: inline-block;"><line x1="3" y1="22" x2="21" y2="22"></line><line x1="6" y1="18" x2="6" y2="11"></line><line x1="10" y1="18" x2="10" y2="11"></line><line x1="14" y1="18" x2="14" y2="11"></line><line x1="18" y1="18" x2="18" y2="11"></line><path d="M12 2L2 7h20L12 2z"></path></svg>
                    {{ s.title }}
                  </h3>
                  <p class="w-step-subtitle">{{ s.subtitle }}</p>
                  <p class="w-step-desc">{{ s.desc }}</p>
                  <div class="w-step-tip" :style="`border-left-color: ${s.accent}`" style="display: flex; align-items: flex-start; gap: 8px;">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 16px; height: 16px; color: #d97706; flex-shrink: 0; margin-top: 2px;"><path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .5 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"></path><line x1="9" y1="18" x2="15" y2="18"></line><line x1="10" y1="22" x2="14" y2="22"></line></svg>
                    <span>{{ s.tip }}</span>
                  </div>
                  <!-- Navigation arrows inside the panel -->
                  <div class="w-step-nav">
                    <button class="w-step-nav-btn" @click="activeStep = Math.max(1, activeStep - 1)" :disabled="activeStep === 1">← Précédent</button>
                    <button class="w-step-nav-btn w-step-nav-next" @click="activeStep = Math.min(5, activeStep + 1)" :disabled="activeStep === 5" :style="`background: ${s.accent}; border-color: ${s.accent}`">Suivant →</button>
                  </div>
                </div>
              </template>
            </div>
          </Transition>
        </div>

        <!-- Right Column: About OMAPI -->
        <div class="w-about-card anim-fade-up" style="animation-delay: 0.4s">
          <div class="w-card-header">
            <h2 class="w-card-title" style="display: inline-flex; align-items: center; gap: 8px;">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="width: 18px; height: 18px; color: #0A3A6A;"><line x1="3" y1="22" x2="21" y2="22"></line><line x1="6" y1="18" x2="6" y2="11"></line><line x1="10" y1="18" x2="10" y2="11"></line><line x1="14" y1="18" x2="14" y2="11"></line><line x1="18" y1="18" x2="18" y2="11"></line><path d="M12 2L2 7h20L12 2z"></path></svg>
              À propos de l'OMAPI
            </h2>
            <span class="w-about-tagline">Office Malgache de la Propriété Industrielle</span>
          </div>

          <div class="w-about-history">
            <h3 class="w-about-section-title" style="display: inline-flex; align-items: center; gap: 8px;">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 16px; height: 16px;"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>
              Notre Histoire
            </h3>
            <p class="w-about-text">
              Suite au retrait de Madagascar de l'Accord de Libreville en 1974, l'<strong>ordonnance n° 89-019</strong> du 31 juillet 1989 a institué un régime de protection de la propriété industrielle à Madagascar. Le décret n° 92-994 du 2 décembre 1992 a ensuite créé et organisé l'<strong>OMAPI</strong>, opérationnel depuis le <strong>1er avril 1994</strong>.
            </p>
            <p class="w-about-text">
              Madagascar est membre de l'<strong>OMPI</strong> depuis 1989 et de l'<strong>Arrangement de Madrid</strong> depuis 2008, permettant la protection internationale des marques.
            </p>
          </div>

          <div class="w-about-missions">
            <h3 class="w-about-section-title" style="display: inline-flex; align-items: center; gap: 8px;">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 16px; height: 16px;"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.6 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
              Nos Attributions
            </h3>
            <ul class="w-missions-list">
              <li>
                <span class="w-m-icon" style="background: #f0f9ff; color: #0088CC; display: flex; align-items: center; justify-content: center;">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 16px; height: 16px;"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path><line x1="7" y1="7" x2="7.01" y2="7"></line></svg>
                </span>
                <div>
                  <strong>Marques de produits et services</strong>
                  <span>Dépôt, examen et certificat d'enregistrement</span>
                </div>
              </li>
              <li>
                <span class="w-m-icon" style="background: #fdf4ff; color: #7c3aed; display: flex; align-items: center; justify-content: center;">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 16px; height: 16px;"><path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .5 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"></path><line x1="9" y1="18" x2="15" y2="18"></line><line x1="10" y1="22" x2="14" y2="22"></line></svg>
                </span>
                <div>
                  <strong>Brevets d'invention</strong>
                  <span>Instruction et délivrance de brevets nationaux et PCT</span>
                </div>
              </li>
              <li>
                <span class="w-m-icon" style="background: #f0fdf4; color: #059669; display: flex; align-items: center; justify-content: center;">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 16px; height: 16px;"><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.92 0 1.63-.77 1.63-1.7 0-.45-.18-.85-.46-1.2-.29-.34-.47-.79-.47-1.27 0-.93.74-1.69 1.65-1.69h1.86c5.22 0 9.42-4.14 9.42-9.25C21.66 5.86 17.32 2 12 2z"></path></svg>
                </span>
                <div>
                  <strong>Dessins & modèles industriels</strong>
                  <span>Protection des créations esthétiques</span>
                </div>
              </li>
              <li>
                <span class="w-m-icon" style="background: #fffbeb; color: #d97706; display: flex; align-items: center; justify-content: center;">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 16px; height: 16px;"><rect x="4" y="2" width="16" height="20" rx="2" ry="2"></rect><line x1="9" y1="22" x2="9" y2="16"></line><line x1="15" y1="22" x2="15" y2="16"></line><line x1="9" y1="16" x2="15" y2="16"></line><path d="M9 12h6"></path><path d="M9 8h6"></path></svg>
                </span>
                <div>
                  <strong>Noms commerciaux</strong>
                  <span>Enregistrement des dénominations commerciales</span>
                </div>
              </li>
              <li>
                <span class="w-m-icon" style="background: #fff1f2; color: #be123c; display: flex; align-items: center; justify-content: center;">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 16px; height: 16px;"><circle cx="12" cy="12" r="10"></circle><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"></path><path d="M2 12h20"></path></svg>
                </span>
                <div>
                  <strong>Système de Madrid</strong>
                  <span>Extension internationale de la protection des marques</span>
                </div>
              </li>
            </ul>
          </div>
        </div>

      </div>

      <!-- Help Banner -->
      <div class="w-help-banner anim-fade-up" style="animation-delay: 0.55s">
        <div class="w-help-text">
          <h3>Besoin d'aide ou de renseignements ?</h3>
          <p>Nos équipes sont disponibles pour vous accompagner. Consultez notre messagerie ou ajustez vos paramètres de compte.</p>
        </div>
        <div class="w-help-actions">
          <button class="w-help-btn w-help-orange" @click="goToMessages" style="display: inline-flex; align-items: center; gap: 8px;">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 16px; height: 16px;"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
            Messagerie
          </button>
          <button class="w-help-btn w-help-grey" @click="goToParametres" style="display: inline-flex; align-items: center; gap: 8px;">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 16px; height: 16px;"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
            Paramètres
          </button>
        </div>
      </div>

      <!-- Footer -->
      <footer class="w-footer">
        <span>© {{ new Date().getFullYear() }} OMAPI — Office Malgache de la Propriété Industrielle</span>
        <span>Portail E-Branding sécurisé • Tous droits réservés</span>
      </footer>

    </div>
  </div>
</template>

<style scoped>
/* ════════════════════════════════════════════
   ENTRANCE ANIMATIONS
════════════════════════════════════════════ */
@keyframes wSlideDown {
  from { opacity: 0; transform: translateY(-16px); }
  to   { opacity: 1; transform: translateY(0); }
}

@keyframes wFadeUp {
  from { opacity: 0; transform: translateY(24px); }
  to   { opacity: 1; transform: translateY(0); }
}

.anim-slide-down {
  animation: wSlideDown 0.5s cubic-bezier(0.22, 1, 0.36, 1) both;
}

.anim-fade-up {
  opacity: 0;
  animation: wFadeUp 0.6s cubic-bezier(0.22, 1, 0.36, 1) both;
}

/* ════════════════════════════════════════════
   BASE LAYOUT
════════════════════════════════════════════ */
.welcome-page {
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: hidden;
  background: #f1f5f9;
  font-family: inherit;
}

.w-scroll-area {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
}

/* ════════════════════════════════════════════
   TOPBAR
════════════════════════════════════════════ */
.w-topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 64px;
  background: white;
  border-bottom: 1px solid #e2e8f0;
  padding: 0 30px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
  flex-shrink: 0;
  z-index: 100;
}

.w-topbar-left { display: flex; align-items: center; gap: 16px; }
.w-topbar-right { display: flex; align-items: center; gap: 16px; }

.w-brand {
  display: flex;
  align-items: baseline;
  gap: 6px;
}
.w-brand-name {
  font-size: 1.5rem;
  font-weight: 900;
  color: #0A3A6A;
  letter-spacing: -0.01em;
}
.w-brand-sub {
  font-size: 1rem;
  font-weight: 700;
  color: #F26122;
}

.w-official-badge {
  background: #f0f9ff;
  border: 1px solid #bae6fd;
  color: #0284c7;
  font-size: 0.72rem;
  font-weight: 700;
  padding: 3px 10px;
  border-radius: 20px;
  text-transform: uppercase;
  letter-spacing: 0.03em;
}

.w-user-chip {
  display: flex;
  align-items: center;
  gap: 10px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  padding: 6px 14px 6px 8px;
  border-radius: 30px;
}

.w-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #F26122;
  color: white;
  font-weight: 800;
  font-size: 0.8rem;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.w-user-name {
  font-size: 0.9rem;
  font-weight: 600;
  color: #334155;
}

.w-logout-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  background: transparent;
  border: 1px solid #e2e8f0;
  color: #ef4444;
  font-size: 0.88rem;
  font-weight: 600;
  padding: 7px 14px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}
.w-logout-btn:hover {
  background: #fff1f2;
  border-color: #fca5a5;
}

/* ════════════════════════════════════════════
   HERO SECTION
════════════════════════════════════════════ */
.w-hero {
  position: relative;
  background: linear-gradient(135deg, #0A3A6A 0%, #0369a1 45%, #0088CC 100%);
  padding: 60px 40px;
  overflow: hidden;
}

/* decorative shapes */
.w-hero-bg-shapes { position: absolute; inset: 0; pointer-events: none; overflow: hidden; }
.shape {
  position: absolute;
  border-radius: 50%;
  opacity: 0.08;
  background: white;
}
.shape-1 { width: 400px; height: 400px; top: -150px; right: -100px; }
.shape-2 { width: 250px; height: 250px; bottom: -80px; left: 40%; }
.shape-3 { width: 150px; height: 150px; top: 30px; left: 20%; }

.w-hero-content {
  position: relative;
  z-index: 2;
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 40px;
}

.w-hero-text { flex: 1; }

.w-hero-eyebrow {
  display: inline-block;
  color: rgba(255,255,255,0.8);
  font-size: 0.85rem;
  font-weight: 600;
  letter-spacing: 0.04em;
  margin-bottom: 16px;
  background: rgba(255,255,255,0.12);
  padding: 5px 14px;
  border-radius: 20px;
  border: 1px solid rgba(255,255,255,0.2);
}

.w-hero-title {
  color: white;
  font-size: 3rem;
  font-weight: 900;
  margin: 0 0 16px 0;
  line-height: 1.15;
}

.w-hero-name {
  color: #fffbeb;
  border-bottom: 4px solid #F26122;
  padding-bottom: 2px;
  display: inline-block;
}

.w-hero-desc {
  color: rgba(255,255,255,0.9);
  font-size: 1.1rem;
  line-height: 1.65;
  margin: 0 0 30px 0;
  max-width: 580px;
}

.w-hero-ctas {
  display: flex;
  gap: 16px;
  margin-bottom: 30px;
  flex-wrap: wrap;
}

.w-cta-primary {
  background: #F26122;
  color: white;
  border: none;
  padding: 15px 30px;
  border-radius: 10px;
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.25s;
  box-shadow: 0 6px 20px rgba(242, 97, 34, 0.4);
  display: flex;
  align-items: center;
  gap: 8px;
}
.w-cta-primary:hover {
  background: #e05318;
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(242, 97, 34, 0.5);
}

.w-cta-secondary {
  background: transparent;
  color: white;
  border: 2px solid rgba(255,255,255,0.6);
  padding: 15px 30px;
  border-radius: 10px;
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.25s;
  display: flex;
  align-items: center;
  gap: 8px;
}
.w-cta-secondary:hover {
  background: rgba(255,255,255,0.12);
  border-color: white;
  transform: translateY(-2px);
}

.w-hero-features {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.w-feature-badge {
  background: rgba(255,255,255,0.15);
  color: rgba(255,255,255,0.95);
  border: 1px solid rgba(255,255,255,0.25);
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.82rem;
  font-weight: 600;
  backdrop-filter: blur(4px);
}

.w-hero-stats {
  display: flex;
  flex-direction: column;
  gap: 14px;
  flex-shrink: 0;
}

.w-stat-card {
  display: flex;
  align-items: center;
  gap: 14px;
  background: rgba(255,255,255,0.12);
  border: 1px solid rgba(255,255,255,0.2);
  border-radius: 12px;
  padding: 14px 20px;
  min-width: 180px;
  backdrop-filter: blur(6px);
}

.w-stat-icon {
  font-size: 1.6rem;
}

.w-stat-info {
  display: flex;
  flex-direction: column;
}
.w-stat-info strong {
  color: white;
  font-size: 0.95rem;
  font-weight: 800;
}
.w-stat-info small {
  color: rgba(255,255,255,0.7);
  font-size: 0.78rem;
  margin-top: 2px;
}

/* ════════════════════════════════════════════
   CONTENT GRID
════════════════════════════════════════════ */
.w-content-area {
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 40px 0;
  display: grid;
  grid-template-columns: 1.4fr 1fr;
  gap: 28px;
}

/* Shared card base */
.w-guide-card,
.w-about-card {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 18px;
  padding: 30px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.04);
}

.w-card-header { margin-bottom: 24px; }

.w-card-title {
  font-size: 1.2rem;
  font-weight: 800;
  color: #0f172a;
  margin: 0 0 8px 0;
}

.w-card-desc {
  font-size: 0.88rem;
  color: #64748b;
  margin: 0;
  line-height: 1.5;
}

/* ────────────────────────────────
   Step Guide Card
──────────────────────────────── */
.w-step-track {
  position: relative;
  display: flex;
  justify-content: space-between;
  margin-bottom: 28px;
  padding: 0 8px;
}

.w-step-line-bg {
  position: absolute;
  top: 22px;
  left: 32px;
  right: 32px;
  height: 2px;
  background: #e2e8f0;
  z-index: 0;
}

.w-step-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  background: none;
  border: none;
  cursor: pointer;
  position: relative;
  z-index: 1;
  transition: transform 0.2s;
}

.w-step-btn:hover { transform: scale(1.1); }

.w-step-emoji {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: #f8fafc;
  border: 2px solid #e2e8f0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  transition: all 0.3s;
  box-shadow: 0 2px 6px rgba(0,0,0,0.04);
}

.w-step-btn.active .w-step-emoji {
  background: #f0f9ff;
  border-color: var(--step-color, #0088CC);
  box-shadow: 0 0 0 4px color-mix(in srgb, var(--step-color, #0088CC) 15%, transparent);
  transform: scale(1.15);
}

.w-step-num {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #cbd5e1;
  color: white;
  font-size: 0.68rem;
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s;
  position: absolute;
  bottom: 22px;
  right: -2px;
  border: 1.5px solid white;
}

.w-step-detail {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  padding: 22px;
}

.w-step-badge {
  display: inline-block;
  color: white;
  font-size: 0.7rem;
  font-weight: 800;
  padding: 3px 10px;
  border-radius: 4px;
  margin-bottom: 10px;
  letter-spacing: 0.03em;
}

.w-step-title {
  font-size: 1.1rem;
  font-weight: 800;
  color: #0f172a;
  margin: 0 0 4px 0;
}

.w-step-subtitle {
  font-size: 0.82rem;
  color: #0088CC;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  margin: 0 0 14px 0;
}

.w-step-desc {
  font-size: 0.9rem;
  color: #475569;
  line-height: 1.65;
  margin: 0 0 14px 0;
  text-align: justify;
}

.w-step-tip {
  background: #fffbeb;
  border-left: 4px solid #f59e0b;
  padding: 10px 14px;
  border-radius: 0 8px 8px 0;
  font-size: 0.82rem;
  color: #92400e;
  font-weight: 600;
  margin-bottom: 16px;
}

.w-step-nav {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
}

.w-step-nav-btn {
  padding: 7px 16px;
  border-radius: 7px;
  font-size: 0.82rem;
  font-weight: 700;
  cursor: pointer;
  border: 1px solid #e2e8f0;
  background: white;
  color: #475569;
  transition: all 0.2s;
}
.w-step-nav-btn:hover:not(:disabled) {
  background: #f1f5f9;
}
.w-step-nav-btn:disabled { opacity: 0.4; cursor: not-allowed; }

.w-step-nav-next {
  color: white !important;
  border-color: transparent !important;
}
.w-step-nav-next:hover:not(:disabled) {
  filter: brightness(1.1);
  background: inherit !important;
}

/* fade transition for step change */
.fade-step-enter-active, .fade-step-leave-active { transition: opacity 0.2s, transform 0.2s; }
.fade-step-enter-from { opacity: 0; transform: translateX(12px); }
.fade-step-leave-to { opacity: 0; transform: translateX(-12px); }

/* ────────────────────────────────
   About Card
──────────────────────────────── */
.w-about-tagline {
  font-size: 0.78rem;
  color: #94a3b8;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  display: block;
  margin-top: 4px;
}

.w-about-history { margin-bottom: 24px; }

.w-about-section-title {
  font-size: 0.9rem;
  font-weight: 800;
  color: #334155;
  margin: 0 0 12px 0;
  padding-bottom: 8px;
  border-bottom: 1px solid #f1f5f9;
}

.w-about-text {
  font-size: 0.87rem;
  color: #475569;
  line-height: 1.65;
  margin: 0 0 10px 0;
  text-align: justify;
}

.w-missions-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.w-missions-list li {
  display: flex;
  gap: 12px;
  align-items: flex-start;
}

.w-m-icon {
  font-size: 1.2rem;
  width: 34px;
  height: 34px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.w-missions-list li > div {
  display: flex;
  flex-direction: column;
}

.w-missions-list li > div strong {
  font-size: 0.88rem;
  color: #1e293b;
  font-weight: 700;
}

.w-missions-list li > div span {
  font-size: 0.78rem;
  color: #64748b;
  margin-top: 2px;
  line-height: 1.4;
}

/* ════════════════════════════════════════════
   HELP BANNER
════════════════════════════════════════════ */
.w-help-banner {
  max-width: 1200px;
  margin: 28px auto 0;
  padding: 0 40px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 30px;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  padding: 24px 30px;
  box-shadow: 0 4px 15px rgba(0,0,0,0.03);
}

.w-help-text h3 {
  font-size: 1.05rem;
  font-weight: 800;
  color: #0f172a;
  margin: 0 0 5px 0;
}

.w-help-text p {
  font-size: 0.87rem;
  color: #64748b;
  margin: 0;
  line-height: 1.5;
}

.w-help-actions { display: flex; gap: 12px; flex-shrink: 0; }

.w-help-btn {
  padding: 10px 20px;
  border-radius: 8px;
  font-size: 0.88rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 6px;
}

.w-help-orange {
  background: #fff8f5;
  border: 1px solid #fed7aa;
  color: #F26122;
}
.w-help-orange:hover { background: #F26122; color: white; }

.w-help-grey {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  color: #475569;
}
.w-help-grey:hover { background: #e2e8f0; color: #1e293b; }

/* ════════════════════════════════════════════
   FOOTER
════════════════════════════════════════════ */
.w-footer {
  max-width: 1200px;
  margin: 24px auto 0;
  padding: 20px 40px;
  display: flex;
  justify-content: space-between;
  font-size: 0.78rem;
  color: #94a3b8;
  border-top: 1px solid #e2e8f0;
  margin-top: 28px;
}

/* ════════════════════════════════════════════
   RESPONSIVE
════════════════════════════════════════════ */
@media (max-width: 1024px) {
  .w-content-area { grid-template-columns: 1fr; }
  .w-hero-content { flex-direction: column; }
  .w-hero-stats { flex-direction: row; flex-wrap: wrap; }
  .w-help-banner { flex-direction: column; text-align: center; }
  .w-help-actions { justify-content: center; }
  .w-footer { flex-direction: column; gap: 6px; text-align: center; }
}

@media (max-width: 768px) {
  .w-hero { padding: 40px 20px; }
  .w-hero-title { font-size: 2rem; }
  .w-content-area { padding: 20px; }
  .w-official-badge { display: none; }
  .w-hero-ctas { flex-direction: column; }
}
</style>
