<script setup lang="ts">
import { ref } from 'vue'

const activeTab = ref('Historique & Timeline')
const tabs = ['Historique & Timeline', 'Missions & Rôle', 'Réalisations & Impact']

const timelineEvents = [
  {
    year: '1962',
    title: 'Accord de Libreville & OAMPI',
    description: 'Signature de l’Accord de Libreville créant l’OAMPI (Office Africain et Malgache de la Propriété Industrielle). Madagascar et 12 autres États africains s’associent pour uniformiser la protection industrielle.'
  },
  {
    year: '1963',
    title: 'Convention de Paris',
    description: 'Adhésion de Madagascar à la Convention de Paris du 20 mars 1883 pour la protection de la propriété industrielle, jetant les bases des engagements internationaux du pays.'
  },
  {
    year: '1976',
    title: 'Dénonciation de l’Accord',
    description: 'Sortie officielle de Madagascar de l’OAMPI au 31 décembre 1976. Cette décision engendre un vide juridique national temporaire en matière de délivrance de titres.'
  },
  {
    year: '1989',
    title: 'Ordonnance n° 89-019',
    description: 'Promulgation de l’ordonnance instituant un nouveau régime national autonome et moderne pour la protection de la propriété industrielle à Madagascar.'
  },
  {
    year: '1992',
    title: 'Création légale de l’OMAPI',
    description: 'Adoption du décret n° 92-994 portant création et organisation de l’Office Malgache de la Propriété Industrielle (OMAPI), un établissement public doté de l’autonomie financière.'
  },
  {
    year: '1994',
    title: 'Ouverture des Portes',
    description: 'L’OMAPI commence officiellement ses opérations le 1er avril 1994, assurant l’examen des demandes et la délivrance des brevets, marques et noms commerciaux.'
  },
  {
    year: '2008',
    title: 'Protocole de Madrid',
    description: 'Adhésion de Madagascar au Protocole de Madrid. Cela permet aux entreprises malgaches de protéger leurs marques à l’international via une procédure simplifiée unique.'
  },
  {
    year: '2014',
    title: 'Modernisation & Logiciel IPAS',
    description: 'Partenariat renforcé avec l’OMPI pour informatiser l’ensemble des registres et de la gestion des titres avec le progiciel IPAS (Industrial Property Automation System).'
  },
  {
    year: '2022',
    title: 'Réorganisation de l’Office',
    description: 'Décret n° 2022-587 du 27 avril 2022 portant réorganisation de l’OMAPI, modernisant sa gouvernance et adaptant son fonctionnement aux enjeux numériques actuels.'
  },
  {
    year: '2024',
    title: '30 Ans d’Innovation & Dépôt en Ligne',
    description: 'Célébration des 30 ans d’existence de l’office et déploiement officiel du système de dépôt électronique (E-filing) pour faciliter les démarches des usagers.'
  }
]

const stats = [
  { value: '50 000+', label: 'Marques Enregistrées', desc: 'Actifs immatériels sécurisés et protégés sur le marché malgache.' },
  { value: '30+ Ans', label: 'd\'Expertise', desc: 'Au service des inventeurs, créateurs et entreprises depuis 1994.' },
  { value: '100%', label: 'Numérisé', desc: 'Archives historiques et processus d\'examen entièrement gérés via le système IPAS.' },
  { value: '4', label: 'Titres Distincts', desc: 'Brevets d\'invention, marques, dessins/modèles industriels et noms commerciaux.' }
]

const achievements = [
  {
    icon: 'desktop',
    title: 'Plateforme Digitale & E-Filing',
    description: 'Modernisation des services via l\'introduction de procedures dématérialisées pour le dépôt et le suivi des demandes, éliminant les barrières géographiques pour les déposants.'
  },
  {
    icon: 'education',
    title: 'Réseau CATI (Centre d\'Appui)',
    description: 'Mise en place de Centres d\'Appui à la Technologie et à l\'Innovation dans les universités et centres de recherche malgaches pour offrir un accès guidé aux bases de données de brevets.'
  },
  {
    icon: 'globe',
    title: 'Coopération Internationale active',
    description: 'Relations bilatérales et multilatérales étroites avec l\'OMPI, l\'INPI (France), l\'USPTO, l\'OAPI et l\'Office Europeen des Brevets (OEB) pour harmoniser les standards de protection.'
  },
  {
    icon: 'scroll',
    title: 'Publication Systématique (GOPI)',
    description: 'Edition et publication régulière de la Gazette Officielle de la Propriété Industrielle, assurant la transparence et la sécurité juridique des titres accordés.'
  }
]
</script>

<template>
  <main class="page-container fade-in" style="padding-top: 140px; padding-bottom: 80px;">
    
    <div class="container text-center mb-40">
      <div class="icon-header">
        <span class="icon" style="display: flex; align-items: center; justify-content: center;">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="width: 40px; height: 40px; color: var(--primary-blue);"><path d="M4 19v-2h16v2H4ZM2 22h20v-3H2v3ZM12 2 2 7v3h20V7L12 2ZM6 10v7M10 10v7M14 10v7M18 10v7"></path></svg>
        </span>
      </div>
      <h1 class="page-title text-blue">À propos de l'OMAPI</h1>
      <div class="title-underline"></div>
      <p class="page-subtitle text-dark mt-20">
        Promouvoir l'innovation, protéger la créativité et sécuriser la propriété industrielle à Madagascar
      </p>
    </div>

    <!-- Tabs Navigation -->
    <div class="container sub-nav-container mb-50">
      <button 
        v-for="tab in tabs" 
        :key="tab"
        :class="['tab-btn', { active: activeTab === tab }]"
        @click="activeTab = tab"
      >
        {{ tab }}
      </button>
    </div>

    <div class="container" style="max-width: 1000px; margin: 0 auto;">
      
      <!-- Tab 1: Historique & Timeline -->
      <div v-if="activeTab === 'Historique & Timeline'" class="fade-in">
        <div class="info-card glass p-40 mb-40">
          <h2 class="text-orange mb-20">L'Histoire de la Propriété Industrielle à Madagascar</h2>
          <p class="text-content">
            L'histoire de la propriété industrielle à Madagascar commence véritablement au lendemain de son indépendance. Le pays s'est engagé très tôt à soutenir l'innovation en signant, avec douze autres États africains, l'Accord de Libreville du 13 septembre 1962, qui a institué l'OAMPI (Office Africain et Malgache de la Propriété Industrielle) basé à Yaoundé.
          </p>
          <p class="text-content">
            En 1976, Madagascar fait le choix stratégique de dénoncer cet accord pour mettre en place son propre système de protection. Bien que cette décision ait temporairement créé un vide institutionnel, elle a ouvert la voie à la création d'un office 100% national. Sous l'impulsion de l'ordonnance n° 89-019 en 1989, Madagascar s'est doté d'une législation moderne répondant aux exigences de la Convention de Paris.
          </p>
          <p class="text-content">
            Le décret n° 92-994 du 2 décembre 1992 a finalement scellé la création de l'Office Malgache de la Propriété Industrielle (OMAPI), qui a ouvert ses portes le 1er avril 1994. Depuis 30 ans, l'OMAPI protège les marques, brevets, dessins et noms commerciaux des entrepreneurs locaux et internationaux, contribuant ainsi à faire de Madagascar un pôle d'innovation et de créativité dans l'Océan Indien.
          </p>
        </div>

        <div class="timeline-section-title text-center mb-40">
          <h3 class="text-blue">Frise Chronologique Interactive</h3>
          <p class="text-light">Retracez les grandes étapes marquantes de l'évolution de l'OMAPI</p>
        </div>

        <!-- Vertical Timeline Component -->
        <div class="timeline-wrapper">
          <div class="timeline-line"></div>
          
          <div 
            v-for="(event, index) in timelineEvents" 
            :key="index"
            class="timeline-item"
            :class="{ 'even': index % 2 === 0, 'odd': index % 2 !== 0 }"
          >
            <!-- Badge Year -->
            <div class="timeline-badge">
              <span class="badge-year">{{ event.year }}</span>
            </div>

            <!-- Content Card -->
            <div class="timeline-card-container">
              <div class="timeline-card glass">
                <div class="timeline-card-header">
                  <span class="timeline-card-dot"></span>
                  <h4 class="timeline-item-title">{{ event.title }}</h4>
                </div>
                <p class="timeline-item-desc">{{ event.description }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Tab 2: Missions & Rôle -->
      <div v-if="activeTab === 'Missions & Rôle'" class="fade-in">
        <div class="info-card glass p-40 mb-40">
          <h2 class="text-blue mb-25 font-bold">Nos Missions Constitutionnelles</h2>
          <p class="text-content mb-30">
            L'OMAPI a pour mission principale de gérer la propriété industrielle à Madagascar et de promouvoir l'activité inventive. Placé sous la tutelle technique du Ministère chargé de l'Industrie, l'OMAPI jouit d'une autonomie administrative, financière et technique.
          </p>

          <div class="missions-grid">
            <div class="mission-card glass">
              <div class="mission-icon-wrapper blue" style="display: flex; align-items: center; justify-content: center;">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width: 24px; height: 24px; color: var(--primary-blue);"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
              </div>
              <h3 class="mission-title">Délivrance de Titres</h3>
              <p class="mission-desc">Examen, enregistrement et délivrance de titres de propriété industrielle (brevets d'invention, marques de fabrique, de commerce ou de service, dessins ou modèles industriels et noms commerciaux).</p>
            </div>

            <div class="mission-card glass">
              <div class="mission-icon-wrapper orange" style="display: flex; align-items: center; justify-content: center;">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width: 24px; height: 24px; color: var(--accent-orange);"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
              </div>
              <h3 class="mission-title">Publication & Transparence</h3>
              <p class="mission-desc">Publication officielle des titres octroyés à la GOPI (Gazette Officielle de la Propriété Industrielle) pour assurer la transparence et l'opposabilité aux tiers.</p>
            </div>

            <div class="mission-card glass">
              <div class="mission-icon-wrapper blue" style="display: flex; align-items: center; justify-content: center;">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width: 24px; height: 24px; color: var(--primary-blue);"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>
              </div>
              <h3 class="mission-title">Information Technique</h3>
              <p class="mission-desc">Mise à la disposition du public d'une documentation technique en matière de propriété industrielle (littérature brevets, traités multilatéraux, législations étrangères).</p>
            </div>

            <div class="mission-card glass">
              <div class="mission-icon-wrapper orange" style="display: flex; align-items: center; justify-content: center;">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="width: 24px; height: 24px; color: var(--accent-orange);"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
              </div>
              <h3 class="mission-title">Promotion de l'Innovation</h3>
              <p class="mission-desc">Sensibilisation et formation des inventeurs, PME, chercheurs et universités aux enjeux de la propriété intellectuelle pour valoriser la recherche locale.</p>
            </div>
          </div>

          <div class="structure-section mt-40 p-30 glass">
            <h3 class="text-orange mb-20">Structure Institutionnelle</h3>
            <p class="text-content">
              Pour assurer l'exécution efficace de ses missions, l'OMAPI s'appuie sur deux organes majeurs de gouvernance :
            </p>
            <ul class="styled-list">
              <li><strong>Le Conseil d'Administration</strong> : Organe de délibération qui oriente la politique générale de l'établissement et approuve ses budgets.</li>
              <li><strong>La Direction Générale</strong> : Organe exécutif qui assure la gestion quotidienne administrative, financière et technique de l'office.</li>
            </ul>
          </div>
        </div>
      </div>

      <!-- Tab 3: Réalisations & Impact -->
      <div v-if="activeTab === 'Réalisations & Impact'" class="fade-in">
        
        <!-- Key Metrics Cards -->
        <div class="metrics-grid mb-50">
          <div v-for="(stat, index) in stats" :key="index" class="metric-card glass">
            <div class="metric-value">{{ stat.value }}</div>
            <div class="metric-label">{{ stat.label }}</div>
            <div class="metric-desc">{{ stat.desc }}</div>
          </div>
        </div>

        <!-- Major Accomplishments details -->
        <div class="info-card glass p-40 mb-40">
          <h2 class="text-orange mb-25">Réalisations Phares & Impact National</h2>
          <p class="text-content mb-40">
            Depuis sa création, l'OMAPI a franchi des étapes structurantes majeures pour moderniser ses outils et offrir un accompagnement de classe mondiale aux déposants à Madagascar.
          </p>

          <div class="achievements-list">
            <div 
              v-for="(achievement, index) in achievements" 
              :key="index"
              class="achievement-item glass-hover"
            >
              <div class="achievement-icon" style="display: flex; align-items: center; justify-content: center; width: 50px; height: 50px; background: #f8fafc; border-radius: 12px; flex-shrink: 0; margin-right: 20px;">
                <svg v-if="achievement.icon === 'desktop'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width: 24px; height: 24px; color: var(--primary-blue);"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect><line x1="8" y1="21" x2="16" y2="21"></line><line x1="12" y1="17" x2="12" y2="21"></line></svg>
                <svg v-else-if="achievement.icon === 'education'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width: 24px; height: 24px; color: var(--accent-orange);"><path d="M22 10v6M2 10l10-5 10 5-10 5z"></path><path d="M6 12v5c0 2 2 3 6 3s6-1 6-3v-5"></path></svg>
                <svg v-else-if="achievement.icon === 'globe'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width: 24px; height: 24px; color: var(--secondary-blue);"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>
                <svg v-else-if="achievement.icon === 'scroll'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width: 24px; height: 24px; color: var(--accent-orange);"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line></svg>
              </div>
              <div class="achievement-text">
                <h4 class="achievement-title text-blue">{{ achievement.title }}</h4>
                <p class="achievement-desc text-light">{{ achievement.description }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- International integration block -->
        <div class="info-card glass p-40">
          <h3 class="text-blue mb-20">Intégration Internationale & Traités</h3>
          <p class="text-content">
            L'OMAPI représente fièrement Madagascar sur la scène intellectuelle internationale. En tant qu'office récepteur et désigné, il collabore étroitement avec l'Organisation Mondiale de la Propriété Intellectuelle (OMPI) pour administrer les dépôts internationaux.
          </p>
          <div class="treaties-flex">
            <span class="treaty-badge">Protocole de Madrid</span>
            <span class="treaty-badge">Traité de Coopération des Brevets (PCT)</span>
            <span class="treaty-badge">Convention de Paris</span>
            <span class="treaty-badge">Réseau CATI</span>
          </div>
        </div>

      </div>

    </div>
  </main>
</template>

<style scoped>
.page-container {
  min-height: 80vh;
  background-color: #f8fafc;
}

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

.icon { font-size: 2.5rem; }
.page-title { font-size: 2.2rem; font-weight: 700; margin-bottom: 15px; }
.title-underline {
  height: 4px;
  width: 60px;
  background: var(--accent-orange);
  margin: 0 auto;
  border-radius: 2px;
}
.page-subtitle { font-size: 1.1rem; opacity: 0.8; max-width: 650px; margin-left: auto; margin-right: auto; }
.text-blue { color: var(--primary-blue); }
.text-orange { color: var(--accent-orange); }
.text-dark { color: var(--text-dark); }
.text-light { color: var(--text-light); }
.mb-20 { margin-bottom: 20px; }
.mb-25 { margin-bottom: 25px; }
.mb-30 { margin-bottom: 30px; }
.mb-40 { margin-bottom: 40px; }
.mb-50 { margin-bottom: 50px; }
.mt-20 { margin-top: 20px; }
.mt-40 { margin-top: 40px; }
.p-30 { padding: 30px; }
.p-40 { padding: 40px; }
.font-bold { font-weight: 700; }

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
  padding: 12px 30px;
  border-radius: 30px;
  transition: all 0.3s ease;
  box-shadow: 0 4px 6px rgba(0,0,0,0.02);
}

.tab-btn:hover {
  color: var(--primary-blue);
  border-color: #bae6fd;
  transform: translateY(-1px);
}

.tab-btn.active { 
  background: var(--primary-blue);
  color: var(--white);
  box-shadow: 0 8px 15px rgba(10, 58, 106, 0.2);
}

.info-card {
  border-radius: 16px;
  background: var(--white);
  box-shadow: 0 10px 30px rgba(0,0,0,0.04);
  border: 1px solid rgba(255,255,255,0.5);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.text-content {
  font-size: 1.05rem;
  line-height: 1.7;
  color: var(--text-dark);
  margin-bottom: 20px;
  text-align: justify;
}

/* Timeline specific styles */
.timeline-wrapper {
  position: relative;
  padding: 40px 0;
  margin: 0 auto;
}

.timeline-line {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 50%;
  width: 4px;
  background: linear-gradient(to bottom, #bae6fd, var(--primary-blue), #fed7aa, var(--accent-orange));
  transform: translateX(-50%);
  border-radius: 2px;
}

.timeline-item {
  position: relative;
  width: 100%;
  margin-bottom: 40px;
  display: flex;
}

.timeline-item.even {
  flex-direction: row;
}

.timeline-item.odd {
  flex-direction: row-reverse;
}

.timeline-badge {
  position: absolute;
  top: 15px;
  left: 50%;
  width: 70px;
  height: 36px;
  background: var(--white);
  border: 3px solid var(--primary-blue);
  border-radius: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  transform: translateX(-50%);
  z-index: 10;
  box-shadow: 0 4px 10px rgba(0,0,0,0.1);
  transition: all 0.3s ease;
}

.timeline-item.odd .timeline-badge {
  border-color: var(--accent-orange);
}

.timeline-item:hover .timeline-badge {
  transform: translateX(-50%) scale(1.1);
  box-shadow: 0 6px 15px rgba(0,0,0,0.15);
  background: var(--primary-blue);
  color: var(--white);
  border-color: var(--white);
}

.timeline-item.odd:hover .timeline-badge {
  background: var(--accent-orange);
}

.badge-year {
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--primary-blue);
  transition: color 0.3s ease;
}

.timeline-item.odd .badge-year {
  color: var(--accent-orange);
}

.timeline-item:hover .badge-year {
  color: var(--white);
}

.timeline-card-container {
  width: 50%;
  padding: 0 40px;
}

.timeline-item.even .timeline-card-container {
  text-align: right;
  padding-right: 50px;
}

.timeline-item.odd .timeline-card-container {
  text-align: left;
  padding-left: 50px;
}

.timeline-card {
  display: inline-block;
  text-align: left;
  background: var(--white);
  padding: 24px;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.03);
  border: 1px solid rgba(0,0,0,0.05);
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  max-width: 100%;
}

.timeline-item:hover .timeline-card {
  transform: translateY(-5px);
  box-shadow: 0 12px 28px rgba(0,0,0,0.07);
  border-color: #bae6fd;
}

.timeline-item.odd:hover .timeline-card {
  border-color: #ffedd5;
}

.timeline-card-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
}

.timeline-item.even .timeline-card-header {
  justify-content: flex-start;
}

.timeline-card-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--primary-blue);
}

.timeline-item.odd .timeline-card-dot {
  background: var(--accent-orange);
}

.timeline-item-title {
  font-size: 1.15rem;
  font-weight: 700;
  color: var(--text-dark);
}

.timeline-item-desc {
  font-size: 0.95rem;
  color: var(--text-light);
  line-height: 1.6;
}

/* Missions specific styles */
.missions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 20px;
  margin-top: 30px;
}

.mission-card {
  background: var(--white);
  padding: 30px 24px;
  border-radius: 16px;
  border: 1px solid rgba(0,0,0,0.05);
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.mission-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 25px rgba(0,0,0,0.06);
  border-color: #bae6fd;
}

.mission-icon-wrapper {
  width: 50px;
  height: 50px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.6rem;
  margin-bottom: 20px;
}

.mission-icon-wrapper.blue {
  background: rgba(10, 58, 106, 0.08);
  color: var(--primary-blue);
}

.mission-icon-wrapper.orange {
  background: rgba(242, 97, 34, 0.08);
  color: var(--accent-orange);
}

.mission-title {
  font-size: 1.2rem;
  font-weight: 700;
  color: var(--text-dark);
  margin-bottom: 12px;
}

.mission-desc {
  font-size: 0.95rem;
  color: var(--text-light);
  line-height: 1.5;
}

.styled-list {
  list-style: none;
  padding: 0;
  margin-top: 15px;
}

.styled-list li {
  position: relative;
  padding-left: 25px;
  margin-bottom: 15px;
  line-height: 1.6;
  font-size: 1.05rem;
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

/* Achievements specific styles */
.metrics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
}

.metric-card {
  background: var(--white);
  padding: 30px 20px;
  border-radius: 16px;
  text-align: center;
  box-shadow: 0 4px 20px rgba(0,0,0,0.03);
  border: 1px solid rgba(0,0,0,0.05);
  transition: all 0.3s ease;
}

.metric-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 12px 30px rgba(10, 58, 106, 0.1);
  border-color: #bae6fd;
}

.metric-value {
  font-size: 2.2rem;
  font-weight: 800;
  color: var(--accent-orange);
  margin-bottom: 8px;
}

.metric-card:nth-child(even) .metric-value {
  color: var(--primary-blue);
}

.metric-label {
  font-size: 1rem;
  font-weight: 700;
  color: var(--text-dark);
  margin-bottom: 10px;
}

.metric-desc {
  font-size: 0.85rem;
  color: var(--text-light);
  line-height: 1.4;
}

.achievements-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.achievement-item {
  display: flex;
  align-items: flex-start;
  padding: 24px;
  background: rgba(255, 255, 255, 0.5);
  border: 1px solid rgba(0,0,0,0.03);
  border-radius: 14px;
  transition: all 0.3s ease;
}

.achievement-item:hover {
  background: var(--white);
  box-shadow: 0 8px 25px rgba(0,0,0,0.04);
  transform: translateX(5px);
  border-color: #bae6fd;
}

.achievement-icon {
  font-size: 2rem;
  margin-right: 20px;
  padding: 10px;
  background: rgba(10, 58, 106, 0.04);
  border-radius: 12px;
  width: 54px;
  height: 54px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.achievement-text {
  flex: 1;
}

.achievement-title {
  font-size: 1.15rem;
  font-weight: 700;
  margin-bottom: 6px;
}

.achievement-desc {
  font-size: 0.95rem;
  line-height: 1.5;
}

.treaties-flex {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  margin-top: 20px;
}

.treaty-badge {
  background: rgba(10, 58, 106, 0.06);
  color: var(--primary-blue);
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 600;
  border: 1px solid rgba(10, 58, 106, 0.1);
  transition: all 0.3s ease;
}

.treaty-badge:hover {
  background: var(--primary-blue);
  color: var(--white);
  transform: translateY(-1px);
}

/* Responsive timeline rules */
@media (max-width: 768px) {
  .timeline-line {
    left: 20px;
    transform: none;
  }
  
  .timeline-item {
    flex-direction: row !important;
  }
  
  .timeline-badge {
    left: 20px;
    transform: translateX(-50%);
    width: 60px;
    height: 30px;
    top: 15px;
  }

  .timeline-item:hover .timeline-badge {
    transform: translateX(-50%) scale(1.05);
  }
  
  .badge-year {
    font-size: 0.85rem;
  }
  
  .timeline-card-container {
    width: 100%;
    padding-left: 45px !important;
    padding-right: 0 !important;
    text-align: left !important;
  }
  
  .timeline-card {
    width: 100%;
  }

  .timeline-card-header {
    justify-content: flex-start !important;
  }

  .page-title {
    font-size: 1.8rem;
  }
}
</style>
