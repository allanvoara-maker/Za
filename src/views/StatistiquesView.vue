<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useApplicationStore } from '../stores/applicationStore'
import { Bar, Line, Doughnut } from 'vue-chartjs'
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  ArcElement,
} from 'chart.js'

ChartJS.register(
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  ArcElement,
)

const store = useApplicationStore()

onMounted(() => {
  store.fetchDossiers()
})

const activeTab = ref('Mon Portefeuille')
const tabs = ['Mon Portefeuille', 'Statistiques Nationales', 'Délais & Indicateurs']

const formatDate = (dateStr?: string) => {
  if (!dateStr) return '-'
  const date = new Date(dateStr)
  if (isNaN(date.getTime())) return dateStr
  return date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })
}

const getStatusClass = (status: string) => {
  const s = status.toLowerCase()
  if (s.includes('attente') || s.includes('soumis')) return 'badge-orange'
  if (s.includes('publié') || s.includes('enregistré')) return 'badge-green'
  if (s.includes('rejeté')) return 'badge-red'
  return 'badge-blue'
}

const dossiersParType = computed(() => ({
  labels: ['Brevets', 'Marques', 'Noms Commerciaux'],
  datasets: [
    {
      label: 'Mes Dossiers par type',
      backgroundColor: ['#F26122', '#0088CC', '#0A3A6A'],
      borderRadius: 8,
      data: [
        store.dossiers.filter((d) => d.type === 'Brevet').length,
        store.dossiers.filter((d) => d.type === 'Marque').length,
        store.dossiers.filter((d) => d.type === 'Nom Commercial').length,
      ],
    },
  ],
}))

const depotEvolution = computed(() => {
  const now = new Date()
  const currentYear = now.getFullYear()
  const currentMonth = now.getMonth()
  const monthsList = [
    'Jan',
    'Fév',
    'Mar',
    'Avr',
    'Mai',
    'Juin',
    'Juil',
    'Août',
    'Sept',
    'Oct',
    'Nov',
    'Déc',
  ]
  const labels = monthsList.slice(0, currentMonth + 1)
  const data = labels.map(
    (_, idx) =>
      store.dossiers.filter((d) => {
        if (!d.created_at) return false
        const date = new Date(d.created_at)
        return date.getFullYear() === currentYear && date.getMonth() === idx
      }).length,
  )
  return {
    labels,
    datasets: [
      {
        label: 'Mes dépôts (mensuels)',
        borderColor: '#0088CC',
        backgroundColor: 'rgba(0, 136, 204, 0.15)',
        data,
        fill: true,
        tension: 0.4,
      },
    ],
  }
})

const nationalEvolution = computed(() => ({
  labels: ['2018', '2019', '2020', '2021', '2022', '2023', '2024'],
  datasets: [
    {
      label: 'Marques (Dépôts globaux)',
      borderColor: '#0088CC',
      backgroundColor: 'rgba(0, 136, 204, 0.05)',
      data: [2540, 2720, 2110, 2950, 3120, 3480, 3850],
      fill: true,
      tension: 0.3,
      yAxisID: 'y',
    },
    {
      label: 'Brevets (Dépôts globaux)',
      borderColor: '#F26122',
      backgroundColor: 'rgba(242, 97, 34, 0.05)',
      data: [85, 92, 78, 95, 110, 124, 145],
      fill: true,
      tension: 0.3,
      yAxisID: 'y1',
    },
  ],
}))

const nationalSectors = computed(() => ({
  labels: [
    'Agroalimentaire (35%)',
    'Services & Commerce (25%)',
    'Santé & Cosmétiques (15%)',
    'Technologies (15%)',
    'Autres (10%)',
  ],
  datasets: [
    {
      backgroundColor: ['#0A3A6A', '#0088CC', '#F26122', '#10b981', '#cbd5e1'],
      borderWidth: 2,
      borderColor: '#ffffff',
      data: [1400, 1000, 600, 600, 400],
    },
  ],
}))

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { labels: { font: { family: "'Outfit', sans-serif", weight: '600' } } },
  },
}

const nationalChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { labels: { font: { family: "'Outfit', sans-serif", weight: '600' } } },
  },
  scales: {
    y: {
      type: 'linear',
      display: true,
      position: 'left',
      grid: { color: '#f1f5f9' },
      title: {
        display: true,
        text: 'Volume Marques',
        font: { family: "'Outfit', sans-serif", weight: '700' },
      },
    },
    y1: {
      type: 'linear',
      display: true,
      position: 'right',
      grid: { drawOnChartArea: false },
      title: {
        display: true,
        text: 'Volume Brevets',
        font: { family: "'Outfit', sans-serif", weight: '700' },
      },
    },
  },
}

// Delay procedures data
const delayProcedures = [
  {
    icon: 'shop',
    title: 'Nom Commercial',
    subtitle: 'Vérification & enregistrement national rapide',
    duration: '2 à 3 Jours',
    color: 'green',
    progress: 100,
    steps: ['Dépôt du formulaire', 'Vérification disponibilité', 'Délivrance du titre'],
    detail: 'Procédure simplifiée et rapide. Donne une protection territoriale au niveau national.',
  },
  {
    icon: 'art',
    title: 'Dessins & Modèles Industriels',
    subtitle: 'Examen de forme, publication & certificat',
    duration: '3 à 5 Mois',
    color: 'teal',
    progress: 75,
    steps: ['Dépôt & examen de forme', 'Publication au BOPI', 'Délivrance du certificat'],
    detail:
      'Protection esthétique de vos créations pour une durée initiale de 5 ans, renouvelable.',
  },
  {
    icon: 'trademark',
    title: 'Marque de Fabrique / Service',
    subtitle: 'Examen de fond, opposition & enregistrement',
    duration: '8 à 12 Mois',
    color: 'blue',
    progress: 45,
    steps: [
      'Examen de forme',
      'Publication GOPI (2 mois)',
      'Examen de fond',
      'Enregistrement final',
    ],
    detail: "Délai incluant la période d'opposition de 2 mois. Validité de 10 ans, renouvelable.",
  },
  {
    icon: 'patent',
    title: "Brevet d'Invention",
    subtitle: 'Examen technique & rapport de brevetabilité',
    duration: '18 à 24 Mois',
    color: 'orange',
    progress: 20,
    steps: [
      'Dépôt & examen préliminaire',
      "Rapport d'état technique",
      'Examen de brevetabilité',
      'Délivrance du brevet',
    ],
    detail:
      'Procédure la plus longue, exigeant une analyse technique approfondie. Durée de protection : 20 ans.',
  },
]

const tips = [
  {
    num: '1',
    icon: 'search',
    title: 'Recherche de similitudes approfondie',
    desc: "Effectuez systématiquement des recherches d'antériorité phonétiques et visuelles (via notre outil d'originalité IA) pour éviter les rejets d'office.",
    color: 'blue',
  },
  {
    num: '2',
    icon: 'spark',
    title: 'Vérifiez la distinctivité',
    desc: 'Le titre proposé ne doit pas être générique ou purement descriptif (ex. "Sweet" pour du sucre sera refusé car non-distinctif).',
    color: 'teal',
  },
  {
    num: '3',
    icon: 'folder',
    title: 'Dépôt dans les bonnes classes de Nice',
    desc: 'Ciblez les classes qui correspondent à votre activité réelle. Un mauvais ciblage restreint votre protection ou peut invalider le dépôt.',
    color: 'orange',
  },
  {
    num: '4',
    icon: 'checklist',
    title: 'Respect des pièces administratives',
    desc: "Fournissez des visuels de logo nets en format numérique, des statuts à jour pour les personnes morales et les taxes d'enregistrement acquittées.",
    color: 'green',
  },
]
</script>

<template>
  <div class="statistiques-view fade-in">
    <!-- Header -->
    <div class="header-section mb-40">
      <h1 class="page-title text-blue">Statistiques & Analyses</h1>
      <p class="text-light-grey">
        Consultez l'état de vos dépôts ou étudiez l'activité globale de la propriété industrielle à
        Madagascar.
      </p>
    </div>

    <!-- Tabs Navigation -->
    <div class="sub-nav-container mb-40">
      <button
        v-for="tab in tabs"
        :key="tab"
        :class="['tab-btn', { active: activeTab === tab }]"
        @click="activeTab = tab"
      >
        {{ tab }}
      </button>
    </div>

    <!-- ── Tab 1: Mon Portefeuille ── -->
    <div v-if="activeTab === 'Mon Portefeuille'" class="fade-in">
      <div class="stats-grid mb-40">
        <div class="stat-card">
          <div
            class="stat-icon-wrapper blue"
            style="display: flex; align-items: center; justify-content: center; color: #0284c7"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              style="width: 24px; height: 24px"
            >
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <line x1="16" y1="13" x2="8" y2="13"></line>
              <line x1="16" y1="17" x2="8" y2="17"></line>
              <polyline points="10 9 9 9 8 9"></polyline>
            </svg>
          </div>
          <h3 class="stat-title">Total des dépôts</h3>
          <p class="stat-value text-blue">{{ store.dossiers.length }}</p>
        </div>
        <div class="stat-card">
          <div
            class="stat-icon-wrapper green"
            style="display: flex; align-items: center; justify-content: center; color: #16a34a"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2.5"
              stroke-linecap="round"
              stroke-linejoin="round"
              style="width: 24px; height: 24px"
            >
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
              <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
          </div>
          <h3 class="stat-title">Dossiers approuvés</h3>
          <p class="stat-value text-green">
            {{
              store.dossiers.filter((d) => d.status === 'Enregistré' || d.status === 'Publié')
                .length
            }}
          </p>
        </div>
        <div class="stat-card">
          <div
            class="stat-icon-wrapper red"
            style="display: flex; align-items: center; justify-content: center; color: #ef4444"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2.5"
              stroke-linecap="round"
              stroke-linejoin="round"
              style="width: 24px; height: 24px"
            >
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </div>
          <h3 class="stat-title">Dossiers rejetés</h3>
          <p class="stat-value text-red">
            {{ store.dossiers.filter((d) => d.status === 'Rejeté').length }}
          </p>
        </div>
        <div class="stat-card">
          <div
            class="stat-icon-wrapper orange"
            style="display: flex; align-items: center; justify-content: center; color: #ea580c"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              style="width: 24px; height: 24px"
            >
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12 6 12 12 16 14"></polyline>
            </svg>
          </div>
          <h3 class="stat-title">En cours d'examen</h3>
          <p class="stat-value text-orange">
            {{
              store.dossiers.filter((d) => !['Enregistré', 'Publié', 'Rejeté'].includes(d.status))
                .length
            }}
          </p>
        </div>
      </div>

      <div class="charts-grid mb-40">
        <div class="chart-card">
          <h3>Répartition par Type</h3>
          <div class="chart-wrapper"><Bar :data="dossiersParType" :options="chartOptions" /></div>
        </div>
        <div class="chart-card">
          <h3>Évolution de mes dépôts</h3>
          <div class="chart-wrapper"><Line :data="depotEvolution" :options="chartOptions" /></div>
        </div>
      </div>

      <div class="recent-filings-card">
        <div class="card-header-flex mb-20">
          <h3>Activités Récentes</h3>
          <router-link to="/portal/dossiers" class="see-all-link"
            >Voir tous les dossiers →</router-link
          >
        </div>
        <div class="table-responsive">
          <table class="filings-table">
            <thead>
              <tr>
                <th>Nom / Titre</th>
                <th>Type de Titre</th>
                <th>Date de dépôt</th>
                <th>Statut</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="dossier in store.dossiers.slice(0, 5)" :key="dossier.id">
                <td class="font-semibold">{{ dossier.name }}</td>
                <td>
                  <span class="type-badge">{{ dossier.type }}</span>
                </td>
                <td>{{ formatDate(dossier.created_at || dossier.date) }}</td>
                <td>
                  <span class="status-badge" :class="getStatusClass(dossier.status)">{{
                    dossier.status
                  }}</span>
                </td>
              </tr>
              <tr v-if="store.dossiers.length === 0">
                <td colspan="4" class="text-center py-20 text-light">
                  Vous n'avez soumis aucun dossier pour le moment.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- ── Tab 2: Statistiques Nationales ── -->
    <div v-if="activeTab === 'Statistiques Nationales'" class="fade-in">
      <div class="info-card p-30 mb-40">
        <h2 class="text-blue mb-15">Activité Globale de la Propriété Industrielle à Madagascar</h2>
        <p class="text-content">
          Madagascar a enregistré une croissance constante des dépôts de marques de fabrique, de
          commerce ou de service ces dernières années, stimulée par la relance de la production
          locale et l'intégration du système de dépôt international (Protocole de Madrid). Les
          secteurs liés à l'agroalimentaire et aux services continuent d'être les piliers du
          développement des marques nationales.
        </p>
      </div>
      <div class="charts-grid mb-40">
        <div class="chart-card">
          <h3>Évolution Historique des Dépôts Globaux (OMAPI)</h3>
          <div class="chart-wrapper">
            <Line :data="nationalEvolution" :options="nationalChartOptions" />
          </div>
          <p class="chart-footnote mt-15 text-light-grey">
            Données représentatives de l'activité annuelle (dépôts directs nationaux et
            internationaux).
          </p>
        </div>
        <div class="chart-card">
          <h3>Répartition Nationale par Secteurs Économiques</h3>
          <div class="chart-wrapper">
            <Doughnut :data="nationalSectors" :options="chartOptions" />
          </div>
          <p class="chart-footnote mt-15 text-light-grey">
            Volume de marques protégées classées selon les classes de la Classification de Nice.
          </p>
        </div>
      </div>

      <!-- OMAPI Mission & Role Section -->
      <div class="omapi-mission-section mb-40">
        <div class="omapi-card">
          <div class="omapi-card-header">
            <div class="omapi-icon-wrapper">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                style="width: 32px; height: 32px"
              >
                <path d="M12 2L2 7l10 5 10-5-10-5z"></path>
                <path d="M2 17l10 5 10-5"></path>
                <path d="M2 12l10 5 10-5"></path>
              </svg>
            </div>
            <h3 class="omapi-card-title">L'Office Malgache de la Propriété Industrielle (OMAPI)</h3>
          </div>
          <div class="omapi-card-body">
            <p class="omapi-description">
              L'OMAPI, créé par le Décret n° 92-994 du 2 décembre 1992, est l'organisme national
              chargé d'administrer le système de propriété industrielle à Madagascar. Placé sous la
              tutelle technique du Ministère chargé de l'Industrie et la tutelle financière du
              Ministère chargé des Finances, l'Office a pour mission principale de promouvoir
              l'activité inventive et de protéger les droits de propriété intellectuelle sur le
              territoire malgache.
            </p>
            <div class="omapi-stats-grid">
              <div class="omapi-stat-item">
                <span class="omapi-stat-value">1992</span>
                <span class="omapi-stat-label">Année de création</span>
              </div>
              <div class="omapi-stat-item">
                <span class="omapi-stat-value">30+</span>
                <span class="omapi-stat-label">Années d'expertise</span>
              </div>
              <div class="omapi-stat-item">
                <span class="omapi-stat-value">4</span>
                <span class="omapi-stat-label">Types de titres gérés</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Services & Legal Framework Section -->
      <div class="services-grid mb-40">
        <div class="service-card">
          <div class="service-icon blue">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              style="width: 24px; height: 24px"
            >
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
              <circle cx="12" cy="10" r="3"></circle>
              <path d="M7 21v-2a4 4 0 0 1 4-4h2a4 4 0 0 1 4 4v2"></path>
            </svg>
          </div>
          <h4 class="service-title">Marques</h4>
          <p class="service-desc">
            Enregistrement de marques de fabrique, de commerce ou de service avec protection pour
            une durée de 10 ans renouvelable.
          </p>
        </div>
        <div class="service-card">
          <div class="service-icon orange">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              style="width: 24px; height: 24px"
            >
              <path
                d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .5 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"
              ></path>
              <line x1="9" y1="18" x2="15" y2="18"></line>
              <line x1="10" y1="22" x2="14" y2="22"></line>
            </svg>
          </div>
          <h4 class="service-title">Brevets d'Invention</h4>
          <p class="service-desc">
            Protection des inventions techniques pour une durée de 20 ans, nécessitant un examen de
            brevetabilité approfondi.
          </p>
        </div>
        <div class="service-card">
          <div class="service-icon teal">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              style="width: 24px; height: 24px"
            >
              <path
                d="M12 22C17.5228 22 22 17.5228 22 12C22 11 21 10 20 10C19 10 18.5 10.5 18 11C17.5 11.5 17 12 16 12C15 12 14 11 14 10C14 7 17 6 17 3C17 2 16 1 15 1C10 1 6 5 6 10C6 15 8.5 22 12 22Z"
              ></path>
            </svg>
          </div>
          <h4 class="service-title">Dessins & Modèles</h4>
          <p class="service-desc">
            Protection de l'aspect esthétique et ornemental des produits pour une durée initiale de
            5 ans renouvelable.
          </p>
        </div>
        <div class="service-card">
          <div class="service-icon green">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              style="width: 24px; height: 24px"
            >
              <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
              <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
            </svg>
          </div>
          <h4 class="service-title">Noms Commerciaux</h4>
          <p class="service-desc">
            Enregistrement des dénominations commerciales pour identifier les établissements
            commerciaux au niveau national.
          </p>
        </div>
      </div>

      <!-- International Cooperation Section -->
      <div class="international-section mb-40">
        <div class="section-header-international">
          <h3 class="section-title-international">Coopération Internationale & Traités</h3>
          <p class="section-subtitle-international">
            Madagascar est partie à plusieurs conventions internationales en matière de propriété
            industrielle
          </p>
        </div>
        <div class="treaties-grid">
          <div class="treaty-card">
            <div class="treaty-badge">Madrid</div>
            <h5 class="treaty-name">Protocole de Madrid</h5>
            <p class="treaty-desc">
              Système international d'enregistrement des marques permettant une protection dans
              plusieurs pays via une seule demande.
            </p>
          </div>
          <div class="treaty-card">
            <div class="treaty-badge">Paris</div>
            <h5 class="treaty-name">Convention de Paris</h5>
            <p class="treaty-desc">
              Convention internationale pour la protection de la propriété industrielle, établissant
              le droit de priorité.
            </p>
          </div>
          <div class="treaty-card">
            <div class="treaty-badge">PCT</div>
            <h5 class="treaty-name">Traité de Coopération en matière de Brevets</h5>
            <p class="treaty-desc">
              Système international simplifiant le dépôt de demandes de brevet dans plusieurs pays
              simultanément.
            </p>
          </div>
        </div>
      </div>

      <!-- Legal Framework Section -->
      <div class="legal-framework-section">
        <div class="legal-card">
          <div class="legal-card-header">
            <h3 class="legal-card-title">Cadre Légal & Réglementaire</h3>
          </div>
          <div class="legal-card-body">
            <p class="legal-intro">
              Le système de propriété industrielle à Madagascar repose sur un cadre juridique solide
              établi par l'Ordonnance n° 89-019 du 31 juillet 1989 et ses textes d'application.
            </p>
            <div class="legal-items">
              <div class="legal-item">
                <div
                  class="legal-item-icon"
                  style="
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    width: 40px;
                    height: 40px;
                    background: #e0f2fe;
                    border-radius: 50%;
                  "
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    style="width: 20px; height: 20px; color: var(--primary-blue)"
                  >
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                    <polyline points="14 2 14 8 20 8"></polyline>
                    <line x1="16" y1="13" x2="8" y2="13"></line>
                    <line x1="16" y1="17" x2="8" y2="17"></line>
                  </svg>
                </div>
                <div class="legal-item-content">
                  <h6 class="legal-item-title">Ordonnance n° 89-019</h6>
                  <p class="legal-item-text">
                    Institue le régime de protection de la propriété industrielle en République
                    Démocratique de Madagascar.
                  </p>
                </div>
              </div>
              <div class="legal-item">
                <div
                  class="legal-item-icon"
                  style="
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    width: 40px;
                    height: 40px;
                    background: #fff7ed;
                    border-radius: 50%;
                  "
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    style="width: 20px; height: 20px; color: var(--accent-orange)"
                  >
                    <path
                      d="M12 22V2M5 7l7-2 7 2M2 17l3-10 3 10zm14 0l3-10 3 10zM12 22h10M12 22H2"
                    ></path>
                  </svg>
                </div>
                <div class="legal-item-content">
                  <h6 class="legal-item-title">Décret n° 92-993</h6>
                  <p class="legal-item-text">
                    Porte application de l'ordonnance n° 89-019 et définit les procédures
                    d'enregistrement.
                  </p>
                </div>
              </div>
              <div class="legal-item">
                <div
                  class="legal-item-icon"
                  style="
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    width: 40px;
                    height: 40px;
                    background: #e0f2fe;
                    border-radius: 50%;
                  "
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    style="width: 20px; height: 20px; color: var(--secondary-blue)"
                  >
                    <rect x="4" y="2" width="16" height="20" rx="2" ry="2"></rect>
                    <line x1="9" y1="22" x2="9" y2="16"></line>
                    <line x1="15" y1="22" x2="15" y2="16"></line>
                    <line x1="9" y1="16" x2="15" y2="16"></line>
                    <path d="M8 6h2v2H8V6zm0 4h2v2H8v-2zm8-4h2v2h-2V6zm0 4h2v2h-2v-2z"></path>
                  </svg>
                </div>
                <div class="legal-item-content">
                  <h6 class="legal-item-title">Décret n° 92-994</h6>
                  <p class="legal-item-text">
                    Crée et organise l'Office Malgache de la Propriété Industrielle (OMAPI).
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ── Tab 3: Délais & Indicateurs ── -->
    <div v-if="activeTab === 'Délais & Indicateurs'" class="fade-in">
      <!-- Section header -->
      <div class="section-header mb-40">
        <div class="section-header-content">
          <h2 class="text-orange mb-10" style="display: inline-flex; align-items: center; gap: 8px">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              style="width: 24px; height: 24px; color: #ea580c; vertical-align: middle"
            >
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12 6 12 12 16 14"></polyline>
            </svg>
            Délais & Processus d'Enregistrement
          </h2>
          <p class="text-content">
            Voici les jalons temporels officiels observés par l'OMAPI, de la soumission à la
            délivrance du titre définitif. Ces délais vous aident à planifier le lancement de vos
            activités commerciales ou la divulgation de vos inventions.
          </p>
        </div>
        <!-- Summary KPI strip -->
        <div class="kpi-strip">
          <div class="kpi-item green">
            <span class="kpi-label">Le plus rapide</span>
            <span class="kpi-value">2–3 jours</span>
          </div>
          <div class="kpi-divider"></div>
          <div class="kpi-item blue">
            <span class="kpi-label">Délai typique</span>
            <span class="kpi-value">8–12 mois</span>
          </div>
          <div class="kpi-divider"></div>
          <div class="kpi-item orange">
            <span class="kpi-label">Le plus long</span>
            <span class="kpi-value">18–24 mois</span>
          </div>
        </div>
      </div>

      <!-- Process Overview Cards -->
      <div class="process-overview-grid mb-40">
        <div class="process-overview-card">
          <div class="process-icon-wrapper green">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              style="width: 28px; height: 28px"
            >
              <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
              <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
            </svg>
          </div>
          <h4 class="process-title">Nom Commercial</h4>
          <p class="process-duration">2–3 jours</p>
          <p class="process-desc">Enregistrement rapide avec vérification de disponibilité</p>
        </div>
        <div class="process-overview-card">
          <div class="process-icon-wrapper teal">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              style="width: 28px; height: 28px"
            >
              <path
                d="M12 22C17.5228 22 22 17.5228 22 12C22 11 21 10 20 10C19 10 18.5 10.5 18 11C17 5 11.5 17 12 16 12C15 12 14 11 14 10C14 7 17 6 17 3C17 2 16 1 15 1C10 1 6 5 6 10C6 15 8.5 22 12 22Z"
              ></path>
              <circle cx="9" cy="11" r="1"></circle>
              <circle cx="12" cy="8" r="1"></circle>
              <circle cx="16" cy="7" r="1"></circle>
            </svg>
          </div>
          <h4 class="process-title">Dessins & Modèles</h4>
          <p class="process-duration">3–5 mois</p>
          <p class="process-desc">Examen de forme, publication et délivrance du certificat</p>
        </div>
        <div class="process-overview-card">
          <div class="process-icon-wrapper blue">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              style="width: 28px; height: 28px"
            >
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
              <circle cx="12" cy="10" r="3"></circle>
              <path d="M7 21v-2a4 4 0 0 1 4-4h2a4 4 0 0 1 4 4v2"></path>
            </svg>
          </div>
          <h4 class="process-title">Marque</h4>
          <p class="process-duration">8–12 mois</p>
          <p class="process-desc">Examen de fond, période d'opposition et enregistrement</p>
        </div>
        <div class="process-overview-card">
          <div class="process-icon-wrapper orange">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              style="width: 28px; height: 28px"
            >
              <path
                d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .5 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"
              ></path>
              <line x1="9" y1="18" x2="15" y2="18"></line>
              <line x1="10" y1="22" x2="14" y2="22"></line>
            </svg>
          </div>
          <h4 class="process-title">Brevet</h4>
          <p class="process-duration">18–24 mois</p>
          <p class="process-desc">Examen technique approfondi et rapport de brevetabilité</p>
        </div>
      </div>

      <!-- Detailed Process Timeline -->
      <div class="timeline-section mb-40">
        <div class="timeline-header">
          <h3 class="timeline-title">Chronologie du Processus d'Enregistrement</h3>
          <p class="timeline-subtitle">Étapes clés du dépôt à la délivrance du titre</p>
        </div>
        <div class="timeline-container">
          <div class="timeline-item">
            <div class="timeline-marker green"></div>
            <div class="timeline-content">
              <h5 class="timeline-step">Étape 1: Dépôt de la Demande</h5>
              <p class="timeline-desc">
                Soumission du dossier complet avec paiement des taxes de dépôt. Vérification
                formelle des pièces.
              </p>
              <span class="timeline-time">1–2 semaines</span>
            </div>
          </div>
          <div class="timeline-item">
            <div class="timeline-marker blue"></div>
            <div class="timeline-content">
              <h5 class="timeline-step">Étape 2: Examen de Fond</h5>
              <p class="timeline-desc">
                Analyse de la conformité avec les exigences légales et recherche d'antériorités.
              </p>
              <span class="timeline-time">3–6 mois</span>
            </div>
          </div>
          <div class="timeline-item">
            <div class="timeline-marker orange"></div>
            <div class="timeline-content">
              <h5 class="timeline-step">Étape 3: Publication & Opposition</h5>
              <p class="timeline-desc">
                Publication au Bulletin Officiel de la Propriété Industrielle (BOPI). Période
                d'opposition de 3 mois.
              </p>
              <span class="timeline-time">3 mois</span>
            </div>
          </div>
          <div class="timeline-item">
            <div class="timeline-marker teal"></div>
            <div class="timeline-content">
              <h5 class="timeline-step">Étape 4: Délivrance du Titre</h5>
              <p class="timeline-desc">
                Enregistrement final et délivrance du certificat de protection. Publication de la
                décision.
              </p>
              <span class="timeline-time">1–2 mois</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Delay Cards 2×2 grid -->
      <div class="delay-cards-grid mb-50">
        <div
          v-for="proc in delayProcedures"
          :key="proc.title"
          :class="['delay-card', `border-${proc.color}`]"
        >
          <!-- Card top -->
          <div class="delay-card-top">
            <div
              :class="['delay-icon-box', `bg-${proc.color}`]"
              style="display: flex; align-items: center; justify-content: center"
            >
              <svg
                v-if="proc.icon === 'shop'"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                style="width: 20px; height: 20px; color: white"
              >
                <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
                <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
              </svg>
              <svg
                v-else-if="proc.icon === 'art'"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                style="width: 20px; height: 20px; color: white"
              >
                <path
                  d="M12 22C17.5228 22 22 17.5228 22 12C22 11 21 10 20 10C19 10 18.5 10.5 18 11C17.5 11.5 17 12 16 12C15 12 14 11 14 10C14 7 17 6 17 3C17 2 16 1 15 1C10 1 6 5 6 10C6 15 8.5 22 12 22Z"
                ></path>
                <circle cx="9" cy="11" r="1"></circle>
                <circle cx="12" cy="8" r="1"></circle>
                <circle cx="16" cy="7" r="1"></circle>
              </svg>
              <svg
                v-else-if="proc.icon === 'trademark'"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                style="width: 20px; height: 20px; color: white"
              >
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                <circle cx="12" cy="10" r="3"></circle>
                <path d="M7 21v-2a4 4 0 0 1 4-4h2a4 4 0 0 1 4 4v2"></path>
              </svg>
              <svg
                v-else-if="proc.icon === 'patent'"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                style="width: 20px; height: 20px; color: white"
              >
                <path
                  d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .5 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"
                ></path>
                <line x1="9" y1="18" x2="15" y2="18"></line>
                <line x1="10" y1="22" x2="14" y2="22"></line>
              </svg>
            </div>
            <div class="delay-card-meta">
              <h4 class="delay-card-title">{{ proc.title }}</h4>
              <p class="delay-card-subtitle">{{ proc.subtitle }}</p>
            </div>
            <div :class="['delay-pill', `pill-${proc.color}`]">{{ proc.duration }}</div>
          </div>

          <!-- Progress bar -->
          <div class="progress-track">
            <div
              :class="['progress-fill', `fill-${proc.color}`]"
              :style="`width:${proc.progress}%`"
            ></div>
          </div>
          <div class="progress-labels">
            <span>Dépôt</span>
            <span>Titre délivré</span>
          </div>

          <!-- Steps -->
          <div class="steps-row">
            <div v-for="(step, idx) in proc.steps" :key="step" class="step-item">
              <div :class="['step-dot', `dot-${proc.color}`]">{{ idx + 1 }}</div>
              <span class="step-label">{{ step }}</span>
            </div>
          </div>

          <!-- Detail note -->
          <div
            :class="['delay-detail', `detail-${proc.color}`]"
            style="display: flex; align-items: flex-start; gap: 8px"
          >
            <span
              class="detail-icon"
              style="
                color: inherit;
                display: flex;
                align-items: center;
                justify-content: center;
                flex-shrink: 0;
                margin-top: 2px;
              "
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                style="width: 14px; height: 14px"
              >
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="16" x2="12" y2="12"></line>
                <line x1="12" y1="8" x2="12.01" y2="8"></line>
              </svg>
            </span>
            <p>{{ proc.detail }}</p>
          </div>
        </div>
      </div>

      <!-- Tips section -->
      <div class="tips-section">
        <div class="tips-section-header mb-30">
          <h3 class="text-blue" style="display: inline-flex; align-items: center; gap: 8px">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              style="width: 22px; height: 22px; color: #0088cc; vertical-align: middle"
            >
              <path
                d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .5 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"
              ></path>
              <line x1="9" y1="18" x2="15" y2="18"></line>
              <line x1="10" y1="22" x2="14" y2="22"></line>
            </svg>
            Conseils pour Optimiser votre Taux d'Approbation
          </h3>
          <p class="text-light-grey">
            Suivez ces recommandations pour maximiser vos chances de succès lors de
            l'enregistrement.
          </p>
        </div>
        <div class="tips-cards-grid">
          <div v-for="tip in tips" :key="tip.num" :class="['tip-card', `tip-border-${tip.color}`]">
            <div class="tip-card-header">
              <div
                :class="['tip-icon-box', `tip-bg-${tip.color}`]"
                style="display: flex; align-items: center; justify-content: center"
              >
                <svg
                  v-if="tip.icon === 'search'"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2.5"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  style="width: 18px; height: 18px; color: white"
                >
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
                <svg
                  v-else-if="tip.icon === 'spark'"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  style="width: 18px; height: 18px; color: white"
                >
                  <polygon
                    points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"
                  ></polygon>
                </svg>
                <svg
                  v-else-if="tip.icon === 'folder'"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  style="width: 18px; height: 18px; color: white"
                >
                  <path
                    d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"
                  ></path>
                </svg>
                <svg
                  v-else-if="tip.icon === 'checklist'"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  style="width: 18px; height: 18px; color: white"
                >
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                  <polyline points="14 2 14 8 20 8"></polyline>
                  <line x1="16" y1="13" x2="8" y2="13"></line>
                  <line x1="16" y1="17" x2="8" y2="17"></line>
                  <polyline points="10 9 9 9 8 9"></polyline>
                </svg>
              </div>
              <div :class="['tip-num-badge', `tip-num-${tip.color}`]"># {{ tip.num }}</div>
            </div>
            <h5 class="tip-card-title">{{ tip.title }}</h5>
            <p class="tip-card-desc">{{ tip.desc }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* ── Base ── */
.page-title {
  font-size: 2rem;
  font-weight: 800;
  margin-bottom: 5px;
}
.text-light-grey {
  color: #64748b;
}
.text-blue {
  color: var(--primary-blue);
}
.text-green {
  color: #10b981;
}
.text-red {
  color: #ef4444;
}
.text-orange {
  color: #f26122;
}
.mb-10 {
  margin-bottom: 10px;
}
.mb-15 {
  margin-bottom: 15px;
}
.mb-20 {
  margin-bottom: 20px;
}
.mb-30 {
  margin-bottom: 30px;
}
.mb-40 {
  margin-bottom: 40px;
}
.mb-50 {
  margin-bottom: 50px;
}
.mt-15 {
  margin-top: 15px;
}
.py-20 {
  padding-top: 20px;
  padding-bottom: 20px;
}
.p-30 {
  padding: 30px;
}
.font-semibold {
  font-weight: 700;
}
.text-center {
  text-align: center;
}
.text-content {
  font-size: 1.05rem;
  line-height: 1.75;
  color: var(--text-dark);
}

/* ── Tabs ── */
.sub-nav-container {
  display: flex;
  justify-content: flex-start;
  gap: 12px;
  flex-wrap: wrap;
}
.tab-btn {
  background: var(--white);
  border: 1px solid rgba(0, 0, 0, 0.06);
  color: var(--text-light);
  font-weight: 600;
  font-size: 0.95rem;
  padding: 12px 28px;
  border-radius: 30px;
  transition: all 0.25s ease;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.03);
}
.tab-btn:hover {
  color: var(--primary-blue);
  border-color: #bae6fd;
  transform: translateY(-1px);
}
.tab-btn.active {
  background: var(--primary-blue);
  color: #fff;
  box-shadow: 0 8px 20px rgba(10, 58, 106, 0.2);
}

/* ── Stats grid (Tab 1) ── */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(190px, 1fr));
  gap: 20px;
}
.stat-card {
  background: var(--white);
  padding: 28px 20px;
  border-radius: 18px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.04);
  border: 1px solid #e2e8f0;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  transition:
    transform 0.2s,
    box-shadow 0.2s;
}
.stat-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 10px 28px rgba(0, 0, 0, 0.08);
}
.stat-icon-wrapper {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.4rem;
  margin-bottom: 14px;
}
.stat-icon-wrapper.blue {
  background: rgba(10, 58, 106, 0.08);
}
.stat-icon-wrapper.green {
  background: rgba(16, 185, 129, 0.08);
}
.stat-icon-wrapper.red {
  background: rgba(239, 68, 68, 0.08);
}
.stat-icon-wrapper.orange {
  background: rgba(242, 97, 34, 0.08);
}
.stat-title {
  font-size: 0.88rem;
  color: #64748b;
  margin-bottom: 10px;
  font-weight: 600;
}
.stat-value {
  font-size: 2.5rem;
  font-weight: 800;
}

/* ── Charts (Tabs 1 & 2) ── */
.charts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 28px;
}
.chart-card {
  background: var(--white);
  padding: 28px;
  border-radius: 18px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.04);
  border: 1px solid #e2e8f0;
}
.chart-card h3 {
  margin-bottom: 20px;
  color: #334155;
  font-weight: 700;
  padding-bottom: 14px;
  border-bottom: 1px solid #f1f5f9;
}
.chart-wrapper {
  position: relative;
  height: 280px;
  width: 100%;
}
.chart-footnote {
  font-size: 0.8rem;
  text-align: center;
}
.info-card {
  background: var(--white);
  border-radius: 18px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.04);
  border: 1px solid #e2e8f0;
}

/* ── Recent filings table ── */
.recent-filings-card {
  background: var(--white);
  padding: 28px 30px;
  border-radius: 18px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.04);
  border: 1px solid #e2e8f0;
}
.card-header-flex {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.card-header-flex h3 {
  font-weight: 700;
  color: #334155;
}
.see-all-link {
  color: var(--secondary-blue);
  font-weight: 600;
  font-size: 0.9rem;
  text-decoration: none;
  transition: transform 0.2s;
}
.see-all-link:hover {
  transform: translateX(3px);
  color: var(--primary-blue);
}
.table-responsive {
  width: 100%;
  overflow-x: auto;
}
.filings-table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
}
.filings-table th {
  padding: 12px 15px;
  border-bottom: 2px solid #f1f5f9;
  color: #64748b;
  font-weight: 700;
  font-size: 0.82rem;
  text-transform: uppercase;
}
.filings-table td {
  padding: 15px;
  border-bottom: 1px solid #f1f5f9;
  font-size: 0.95rem;
  color: #334155;
}
.filings-table tr:last-child td {
  border-bottom: none;
}
.type-badge {
  background: #f1f5f9;
  color: #475569;
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 0.8rem;
  font-weight: 600;
}
.status-badge {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 700;
  display: inline-block;
}
.badge-orange {
  background: #ffedd5;
  color: #ea580c;
}
.badge-green {
  background: #dcfce3;
  color: #16a34a;
}
.badge-red {
  background: #fee2e2;
  color: #ef4444;
}
.badge-blue {
  background: #e0f2fe;
  color: #0284c7;
}

/* ── Tab 3: Section header + KPI strip ── */
.section-header {
  display: flex;
  flex-direction: column;
  gap: 28px;
  background: var(--white);
  padding: 35px;
  border-radius: 20px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.04);
}
.section-header-content h2 {
  font-size: 1.55rem;
  font-weight: 800;
}

.kpi-strip {
  display: flex;
  align-items: center;
  gap: 0;
  background: #f8fafc;
  border-radius: 14px;
  padding: 0;
  overflow: hidden;
  border: 1px solid #e2e8f0;
}
.kpi-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px 16px;
  gap: 6px;
}
.kpi-label {
  font-size: 0.78rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #94a3b8;
}
.kpi-value {
  font-size: 1.35rem;
  font-weight: 800;
}
.kpi-item.green .kpi-value {
  color: #10b981;
}
.kpi-item.blue .kpi-value {
  color: #0088cc;
}
.kpi-item.orange .kpi-value {
  color: #f26122;
}
.kpi-divider {
  width: 1px;
  height: 50px;
  background: #e2e8f0;
}

/* ── Delay cards 2×2 ── */
.delay-cards-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24px;
}

.delay-card {
  background: var(--white);
  border-radius: 20px;
  padding: 28px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  box-shadow: 0 4px 18px rgba(0, 0, 0, 0.05);
  border: 1px solid #e2e8f0;
  border-top-width: 4px;
  transition:
    transform 0.25s,
    box-shadow 0.25s;
}
.delay-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 35px rgba(0, 0, 0, 0.1);
}

.border-green {
  border-top-color: #10b981;
}
.border-teal {
  border-top-color: #14b8a6;
}
.border-blue {
  border-top-color: #0088cc;
}
.border-orange {
  border-top-color: #f26122;
}

.delay-card-top {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
}
.delay-icon-box {
  width: 52px;
  height: 52px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.6rem;
  flex-shrink: 0;
}
.bg-green {
  background: rgba(16, 185, 129, 0.1);
}
.bg-teal {
  background: rgba(20, 184, 166, 0.1);
}
.bg-blue {
  background: rgba(0, 136, 204, 0.1);
}
.bg-orange {
  background: rgba(242, 97, 34, 0.1);
}

.delay-card-meta {
  flex: 1;
  min-width: 0;
}
.delay-card-title {
  font-size: 1.05rem;
  font-weight: 800;
  color: #1e293b;
  margin-bottom: 4px;
}
.delay-card-subtitle {
  font-size: 0.83rem;
  color: #64748b;
}

.delay-pill {
  padding: 6px 14px;
  border-radius: 20px;
  font-weight: 800;
  font-size: 0.88rem;
  white-space: nowrap;
  flex-shrink: 0;
}
.pill-green {
  background: #dcfce3;
  color: #15803d;
}
.pill-teal {
  background: #ccfbf1;
  color: #0f766e;
}
.pill-blue {
  background: #e0f2fe;
  color: #0369a1;
}
.pill-orange {
  background: #ffedd5;
  color: #c2410c;
}

/* progress */
.progress-track {
  height: 10px;
  background: #f1f5f9;
  border-radius: 999px;
  overflow: hidden;
}
.progress-fill {
  height: 100%;
  border-radius: 999px;
  transition: width 0.6s ease;
}
.fill-green {
  background: linear-gradient(90deg, #34d399, #10b981);
}
.fill-teal {
  background: linear-gradient(90deg, #2dd4bf, #14b8a6);
}
.fill-blue {
  background: linear-gradient(90deg, #38bdf8, #0088cc);
}
.fill-orange {
  background: linear-gradient(90deg, #fb923c, #f26122);
}
.progress-labels {
  display: flex;
  justify-content: space-between;
  font-size: 0.72rem;
  color: #94a3b8;
  font-weight: 600;
  margin-top: -2px;
}

/* Steps */
.steps-row {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}
.step-item {
  display: flex;
  align-items: center;
  gap: 6px;
}
.step-dot {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.72rem;
  font-weight: 800;
  color: #fff;
  flex-shrink: 0;
}
.dot-green {
  background: #10b981;
}
.dot-teal {
  background: #14b8a6;
}
.dot-blue {
  background: #0088cc;
}
.dot-orange {
  background: #f26122;
}
.step-label {
  font-size: 0.78rem;
  color: #475569;
  font-weight: 600;
}
/* arrow between steps */
.step-item:not(:last-child)::after {
  content: '→';
  color: #cbd5e1;
  font-size: 0.8rem;
  margin-left: 4px;
}

/* Detail note */
.delay-detail {
  display: flex;
  gap: 10px;
  align-items: flex-start;
  padding: 14px 16px;
  border-radius: 12px;
  font-size: 0.83rem;
  line-height: 1.55;
}
.detail-green {
  background: rgba(16, 185, 129, 0.06);
  color: #166534;
}
.detail-teal {
  background: rgba(20, 184, 166, 0.06);
  color: #134e4a;
}
.detail-blue {
  background: rgba(0, 136, 204, 0.06);
  color: #075985;
}
.detail-orange {
  background: rgba(242, 97, 34, 0.06);
  color: #9a3412;
}
.detail-icon {
  font-size: 1rem;
  flex-shrink: 0;
  margin-top: 1px;
}
.delay-detail p {
  margin: 0;
}

/* ── Tips section ── */
.tips-section {
  background: var(--white);
  padding: 35px;
  border-radius: 20px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.04);
}
.tips-section-header h3 {
  font-size: 1.3rem;
  font-weight: 800;
}
.tips-section-header p {
  margin-top: 6px;
}
.tips-cards-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
}

.tip-card {
  padding: 24px;
  border-radius: 16px;
  background: #fafbfc;
  border: 1px solid #e2e8f0;
  border-left-width: 4px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  transition:
    transform 0.2s,
    box-shadow 0.2s;
}
.tip-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
}
.tip-border-blue {
  border-left-color: #0088cc;
}
.tip-border-teal {
  border-left-color: #14b8a6;
}
.tip-border-orange {
  border-left-color: #f26122;
}
.tip-border-green {
  border-left-color: #10b981;
}

.tip-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.tip-icon-box {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.4rem;
}
.tip-bg-blue {
  background: rgba(0, 136, 204, 0.1);
}
.tip-bg-teal {
  background: rgba(20, 184, 166, 0.1);
}
.tip-bg-orange {
  background: rgba(242, 97, 34, 0.1);
}
.tip-bg-green {
  background: rgba(16, 185, 129, 0.1);
}

.tip-num-badge {
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 0.78rem;
  font-weight: 800;
}
.tip-num-blue {
  background: #e0f2fe;
  color: #0369a1;
}
.tip-num-teal {
  background: #ccfbf1;
  color: #0f766e;
}
.tip-num-orange {
  background: #ffedd5;
  color: #c2410c;
}
.tip-num-green {
  background: #dcfce3;
  color: #15803d;
}

.tip-card-title {
  font-size: 0.97rem;
  font-weight: 800;
  color: #1e293b;
  margin: 0;
}
.tip-card-desc {
  font-size: 0.85rem;
  color: #64748b;
  line-height: 1.6;
  margin: 0;
}

/* ── OMAPI Mission Section ── */
.omapi-mission-section {
  display: flex;
  flex-direction: column;
  gap: 20px;
}
.omapi-card {
  background: linear-gradient(135deg, #0a3a6a 0%, #0088cc 100%);
  border-radius: 20px;
  padding: 35px;
  color: white;
  box-shadow: 0 8px 30px rgba(10, 58, 106, 0.2);
}
.omapi-card-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 20px;
}
.omapi-icon-wrapper {
  width: 56px;
  height: 56px;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}
.omapi-card-title {
  font-size: 1.4rem;
  font-weight: 800;
  margin: 0;
}
.omapi-card-body {
  display: flex;
  flex-direction: column;
  gap: 24px;
}
.omapi-description {
  font-size: 1rem;
  line-height: 1.7;
  opacity: 0.95;
  margin: 0;
}
.omapi-stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  margin-top: 10px;
}
.omapi-stat-item {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 20px;
  text-align: center;
  border: 1px solid rgba(255, 255, 255, 0.2);
}
.omapi-stat-value {
  font-size: 2rem;
  font-weight: 800;
  display: block;
  margin-bottom: 6px;
}
.omapi-stat-label {
  font-size: 0.85rem;
  font-weight: 600;
  opacity: 0.9;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

/* ── Services Grid ── */
.services-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
}
.service-card {
  background: var(--white);
  padding: 28px;
  border-radius: 16px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.04);
  border: 1px solid #e2e8f0;
  display: flex;
  flex-direction: column;
  gap: 16px;
  transition:
    transform 0.25s,
    box-shadow 0.25s;
}
.service-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 35px rgba(0, 0, 0, 0.1);
}
.service-icon {
  width: 52px;
  height: 52px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.4rem;
  flex-shrink: 0;
}
.service-icon.blue {
  background: rgba(0, 136, 204, 0.1);
  color: #0088cc;
}
.service-icon.orange {
  background: rgba(242, 97, 34, 0.1);
  color: #f26122;
}
.service-icon.teal {
  background: rgba(20, 184, 166, 0.1);
  color: #14b8a6;
}
.service-icon.green {
  background: rgba(16, 185, 129, 0.1);
  color: #10b981;
}
.service-title {
  font-size: 1.1rem;
  font-weight: 800;
  color: #1e293b;
  margin: 0;
}
.service-desc {
  font-size: 0.9rem;
  color: #64748b;
  line-height: 1.6;
  margin: 0;
}

/* ── International Cooperation Section ── */
.international-section {
  display: flex;
  flex-direction: column;
  gap: 24px;
}
.section-header-international {
  text-align: center;
}
.section-title-international {
  font-size: 1.5rem;
  font-weight: 800;
  color: #1e293b;
  margin: 0 0 8px 0;
}
.section-subtitle-international {
  font-size: 0.95rem;
  color: #64748b;
  margin: 0;
}
.treaties-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
}
.treaty-card {
  background: var(--white);
  padding: 28px;
  border-radius: 16px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.04);
  border: 1px solid #e2e8f0;
  display: flex;
  flex-direction: column;
  gap: 14px;
  transition:
    transform 0.25s,
    box-shadow 0.25s;
}
.treaty-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 35px rgba(0, 0, 0, 0.1);
}
.treaty-badge {
  background: linear-gradient(135deg, #0088cc, #0a3a6a);
  color: white;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  width: fit-content;
}
.treaty-name {
  font-size: 1.1rem;
  font-weight: 800;
  color: #1e293b;
  margin: 0;
}
.treaty-desc {
  font-size: 0.88rem;
  color: #64748b;
  line-height: 1.6;
  margin: 0;
}

/* ── Legal Framework Section ── */
.legal-framework-section {
  display: flex;
  flex-direction: column;
  gap: 20px;
}
.legal-card {
  background: var(--white);
  border-radius: 20px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.04);
  border: 1px solid #e2e8f0;
  overflow: hidden;
}
.legal-card-header {
  background: linear-gradient(135deg, #f8fafc, #e2e8f0);
  padding: 28px 35px;
  border-bottom: 1px solid #e2e8f0;
}
.legal-card-title {
  font-size: 1.3rem;
  font-weight: 800;
  color: #1e293b;
  margin: 0;
}
.legal-card-body {
  padding: 35px;
  display: flex;
  flex-direction: column;
  gap: 28px;
}
.legal-intro {
  font-size: 1rem;
  line-height: 1.7;
  color: #475569;
  margin: 0;
}
.legal-items {
  display: flex;
  flex-direction: column;
  gap: 20px;
}
.legal-item {
  display: flex;
  gap: 16px;
  padding: 20px;
  background: #f8fafc;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
}
.legal-item-icon {
  font-size: 1.8rem;
  flex-shrink: 0;
}
.legal-item-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.legal-item-title {
  font-size: 0.95rem;
  font-weight: 800;
  color: #1e293b;
  margin: 0;
}
.legal-item-text {
  font-size: 0.85rem;
  color: #64748b;
  line-height: 1.5;
  margin: 0;
}

/* ── Process Overview Grid ── */
.process-overview-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 20px;
}

.process-overview-card {
  background: white;
  padding: 24px;
  border-radius: 16px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.04);
  border: 1px solid #e2e8f0;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 12px;
  transition:
    transform 0.25s,
    box-shadow 0.25s;
}

.process-overview-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 35px rgba(0, 0, 0, 0.1);
}

.process-icon-wrapper {
  width: 56px;
  height: 56px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.process-icon-wrapper.green {
  background: rgba(16, 185, 129, 0.1);
  color: #10b981;
}

.process-icon-wrapper.teal {
  background: rgba(20, 184, 166, 0.1);
  color: #14b8a6;
}

.process-icon-wrapper.blue {
  background: rgba(0, 136, 204, 0.1);
  color: #0088cc;
}

.process-icon-wrapper.orange {
  background: rgba(242, 97, 34, 0.1);
  color: #f26122;
}

.process-title {
  font-size: 1rem;
  font-weight: 800;
  color: #1e293b;
  margin: 0;
}

.process-duration {
  font-size: 1.2rem;
  font-weight: 800;
  color: #0a3a6a;
  margin: 0;
}

.process-desc {
  font-size: 0.85rem;
  color: #64748b;
  line-height: 1.5;
  margin: 0;
}

/* ── Timeline Section ── */
.timeline-section {
  background: white;
  border-radius: 20px;
  padding: 32px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.04);
  border: 1px solid #e2e8f0;
}

.timeline-header {
  text-align: center;
  margin-bottom: 32px;
}

.timeline-title {
  font-size: 1.4rem;
  font-weight: 800;
  color: #1e293b;
  margin: 0 0 8px 0;
}

.timeline-subtitle {
  font-size: 0.9rem;
  color: #64748b;
  margin: 0;
}

.timeline-container {
  display: flex;
  flex-direction: column;
  gap: 24px;
  position: relative;
}

.timeline-container::before {
  content: '';
  position: absolute;
  left: 20px;
  top: 0;
  bottom: 0;
  width: 2px;
  background: #e2e8f0;
}

.timeline-item {
  display: flex;
  gap: 20px;
  position: relative;
}

.timeline-marker {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  position: relative;
  z-index: 1;
  border: 3px solid white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.timeline-marker.green {
  background: #10b981;
}

.timeline-marker.blue {
  background: #0088cc;
}

.timeline-marker.orange {
  background: #f26122;
}

.timeline-marker.teal {
  background: #14b8a6;
}

.timeline-content {
  flex: 1;
  background: #f8fafc;
  padding: 20px;
  border-radius: 14px;
  border: 1px solid #e2e8f0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.timeline-step {
  font-size: 1rem;
  font-weight: 800;
  color: #1e293b;
  margin: 0;
}

.timeline-desc {
  font-size: 0.9rem;
  color: #64748b;
  line-height: 1.6;
  margin: 0;
}

.timeline-time {
  font-size: 0.85rem;
  font-weight: 700;
  color: #0a3a6a;
  background: rgba(10, 58, 106, 0.08);
  padding: 4px 12px;
  border-radius: 20px;
  align-self: flex-start;
}

/* ── Responsive ── */
@media (max-width: 900px) {
  .delay-cards-grid {
    grid-template-columns: 1fr;
  }
  .tips-cards-grid {
    grid-template-columns: 1fr;
  }
  .omapi-stats-grid {
    grid-template-columns: 1fr;
  }
  .services-grid {
    grid-template-columns: 1fr;
  }
  .treaties-grid {
    grid-template-columns: 1fr;
  }
  .process-overview-grid {
    grid-template-columns: 1fr;
  }
}
@media (max-width: 768px) {
  .charts-grid {
    grid-template-columns: 1fr;
  }
  .sub-nav-container {
    justify-content: center;
  }
  .kpi-strip {
    flex-direction: column;
  }
  .kpi-divider {
    width: 80%;
    height: 1px;
  }
  .section-header {
    padding: 20px;
  }
  .omapi-card-header {
    flex-direction: column;
    text-align: center;
  }
  .legal-item {
    flex-direction: column;
    text-align: center;
  }
  .timeline-container::before {
    left: 15px;
  }
  .timeline-item {
    gap: 16px;
  }
  .timeline-marker {
    width: 32px;
    height: 32px;
  }
  .timeline-content {
    padding: 16px;
  }
}
</style>
