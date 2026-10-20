<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useApplicationStore } from '../stores/applicationStore'
import { useAuth } from '../composables/useAuth'
import { Line } from 'vue-chartjs'
import { Chart as ChartJS, Title, Tooltip, Legend, PointElement, LineElement, CategoryScale, LinearScale, Filler } from 'chart.js'

// Register ChartJS elements
ChartJS.register(Title, Tooltip, Legend, PointElement, LineElement, CategoryScale, LinearScale, Filler)

const store  = useApplicationStore()
const router = useRouter()
const { currentUser } = useAuth()

const showNotifications = ref(false)
const notificationTab = ref<'notif' | 'alertes'>('notif')

onMounted(() => {
  store.fetchDossiers()
  store.fetchNotifications()
})


const demandesEnCours = computed(() => store.dossiers.filter(d => d.status.includes('attente') || d.status.includes('cours')).length)
const dossiersEnregistres = computed(() => store.dossiers.filter(d => d.status.includes('Enregistré') || d.status.includes('Publié')).length)
const totalDossiers = computed(() => store.dossiers.length)

const selectedPeriod = ref('Cette semaine')

// Dynamic and realistic chart data based on actual dossier created_at timestamps
const chartData = computed(() => {
  if (selectedPeriod.value === 'Ce mois-ci') {
    // Show every day of the current month up to today
    const now = new Date()
    const currentYear = now.getFullYear()
    const currentMonth = now.getMonth()
    const today = now.getDate()

    const labels: string[] = []
    const data: number[] = []

    for (let day = 1; day <= today; day++) {
      labels.push(`${day}`)
      const count = store.dossiers.filter(d => {
        if (!d.created_at) return false
        const date = new Date(d.created_at)
        return (
          date.getFullYear() === currentYear &&
          date.getMonth() === currentMonth &&
          date.getDate() === day
        )
      }).length
      data.push(count)
    }

    return {
      labels,
      datasets: [
        {
          label: 'Activité de dépôt',
          borderColor: '#0088CC',
          backgroundColor: 'rgba(0, 136, 204, 0.1)',
          borderWidth: 3,
          pointBackgroundColor: '#0A3A6A',
          pointBorderColor: '#ffffff',
          pointHoverRadius: 6,
          data,
          fill: true,
          tension: 0.4
        }
      ]
    }
  } else if (selectedPeriod.value === 'Cette année') {
    const now = new Date()
    const currentYear = now.getFullYear()
    const currentMonth = now.getMonth()

    const monthsList = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sept', 'Oct', 'Nov', 'Déc']
    // Only display months up to the current month in the current year
    const labels = monthsList.slice(0, currentMonth + 1)

    const data = labels.map((_, idx) => {
      return store.dossiers.filter(d => {
        if (!d.created_at) return false
        const date = new Date(d.created_at)
        return date.getFullYear() === currentYear && date.getMonth() === idx
      }).length
    })

    return {
      labels,
      datasets: [
        {
          label: 'Activité de dépôt',
          borderColor: '#0088CC',
          backgroundColor: 'rgba(0, 136, 204, 0.1)',
          borderWidth: 3,
          pointBackgroundColor: '#0A3A6A',
          pointBorderColor: '#ffffff',
          pointHoverRadius: 6,
          data,
          fill: true,
          tension: 0.4
        }
      ]
    }
  } else {
    // Cette semaine: last 7 days ending today, with day name labels
    const labels: string[] = []
    const data: number[] = []
    const daysShort = ['dim.', 'lun.', 'mar.', 'mer.', 'jeu.', 'ven.', 'sam.']

    for (let i = 6; i >= 0; i--) {
      const targetDate = new Date()
      targetDate.setDate(targetDate.getDate() - i)
      labels.push(daysShort[targetDate.getDay()])

      const startOfDay = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate(), 0, 0, 0)
      const endOfDay = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate(), 23, 59, 59)

      const count = store.dossiers.filter(d => {
        if (!d.created_at) return false
        const date = new Date(d.created_at)
        return date >= startOfDay && date <= endOfDay
      }).length
      data.push(count)
    }

    return {
      labels,
      datasets: [
        {
          label: 'Activité de dépôt',
          borderColor: '#0088CC',
          backgroundColor: 'rgba(0, 136, 204, 0.1)',
          borderWidth: 3,
          pointBackgroundColor: '#0A3A6A',
          pointBorderColor: '#ffffff',
          pointHoverRadius: 6,
          data,
          fill: true,
          tension: 0.4
        }
      ]
    }
  }
})

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false
    }
  },
  scales: {
    y: {
      grid: {
        color: '#f1f5f9'
      },
      ticks: {
        color: '#94a3b8',
        font: { family: 'inherit', size: 11 }
      }
    },
    x: {
      grid: {
        display: false
      },
      ticks: {
        color: '#94a3b8',
        font: { family: 'inherit', size: 11 }
      }
    }
  }
}

const handleMarkAllRead = () => {
  store.markAllRead()
  showNotifications.value = false
}
</script>

<template>
  <div class="dashboard-view fade-in">
    <!-- Header topbar equivalent in content area -->
    <div class="header-section mb-30">
      <div class="header-top">
        <div>
          <h1 class="page-title text-blue">Tableau de bord</h1>
          <p class="text-light-grey">
            Bienvenue sur votre espace privé, <strong>{{ currentUser?.name || 'Utilisateur' }}</strong>. Voici le résumé de vos activités.
          </p>
        </div>

        <!-- Notification Bell Quickview -->
        <div class="notif-wrapper">
          <button class="notif-btn" @click="showNotifications = !showNotifications">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width: 18px; height: 18px; color: #475569; display: block;"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
            <span class="badge-notif" v-if="store.unreadCount > 0">{{ store.unreadCount }}</span>
          </button>

          <div v-if="showNotifications" class="notif-dropdown">
            <div class="notif-header">
              <span>Notifications</span>
              <button class="mark-read-btn" @click="handleMarkAllRead">Tout marquer comme lu</button>
            </div>
            <div class="notif-list">
              <div
                v-for="n in store.notifications"
                :key="n.id"
                :class="['notif-item', { unread: !n.read }]"
              >
                <div class="notif-msg">{{ n.message }}</div>
                <div class="notif-date">{{ n.date }}</div>
              </div>
              <div v-if="store.notifications.length === 0" class="notif-empty">
                Aucune notification.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 4 Colored KPI Cards at the Top like the image but using OMAPI brand colors -->
    <div class="stats-grid mb-30">
      <!-- Card 1: Orange -->
      <div class="kpi-card bg-orange">
        <div class="kpi-content">
          <span class="kpi-label">Demandes en cours</span>
          <span class="kpi-value">{{ demandesEnCours }}</span>
          <div class="kpi-trend">
            <span>+20% ce mois-ci</span>
          </div>
        </div>
        <div class="kpi-icon-box">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width: 22px; height: 22px; color: #ffffff;"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
        </div>
      </div>

      <!-- Card 2: Sky Blue -->
      <div class="kpi-card bg-sky-blue">
        <div class="kpi-content">
          <span class="kpi-label">Dossiers enregistrés</span>
          <span class="kpi-value">{{ dossiersEnregistres }}</span>
          <div class="kpi-trend">
            <span>+15% ce mois-ci</span>
          </div>
        </div>
        <div class="kpi-icon-box">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width: 22px; height: 22px; color: #ffffff;"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
        </div>
      </div>

      <!-- Card 3: Dark Blue -->
      <div class="kpi-card bg-dark-blue">
        <div class="kpi-content">
          <span class="kpi-label">Total dossiers</span>
          <span class="kpi-value">{{ totalDossiers }}</span>
          <div class="kpi-trend">
            <span>Actifs</span>
          </div>
        </div>
        <div class="kpi-icon-box">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width: 22px; height: 22px; color: #ffffff;"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>
        </div>
      </div>

      <!-- Card 4: Teal -->
      <div class="kpi-card bg-teal">
        <div class="kpi-content">
          <span class="kpi-label">Taxes réglées</span>
          <span class="kpi-value">195k Ar</span>
          <div class="kpi-trend">
            <span style="display: inline-flex; align-items: center; gap: 4px;">
              Payé
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="width: 12px; height: 12px; color: #ffffff;"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect><line x1="1" y1="10" x2="23" y2="10"></line></svg>
            </span>
          </div>
        </div>
        <div class="kpi-icon-box">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width: 22px; height: 22px; color: #ffffff;"><rect x="2" y="6" width="20" height="12" rx="2"></rect><circle cx="12" cy="12" r="2"></circle><path d="M6 12h.01M18 12h.01"></path></svg>
        </div>
      </div>
    </div>

    <!-- Quick action bar like "Gestion des objectifs" -->
    <div class="action-bar mb-30">
      <router-link to="/portal/depot" class="btn-action-primary">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="width: 16px; height: 16px; margin-right: 8px;"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
        Gestion et Nouveau Dépôt
      </router-link>
    </div>

    <!-- Middle Section: Chart + Side Metrics -->
    <div class="analytics-section mb-30">
      <div class="grid-analytics">
        <!-- Main Line Chart Card -->
        <div class="analytics-card glass">
          <div class="card-header">
            <h3 class="analytics-title" style="display: inline-flex; align-items: center; gap: 8px;">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="width: 18px; height: 18px; color: #0088CC;"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline><polyline points="17 6 23 6 23 12"></polyline></svg>
              Évolution des dépôts
            </h3>
            <select class="period-select" v-model="selectedPeriod">
              <option>Cette semaine</option>
              <option>Ce mois-ci</option>
              <option>Cette année</option>
            </select>
          </div>
          <div class="chart-wrapper">
            <Line :data="chartData" :options="chartOptions" />
          </div>
          <div class="chart-legend-custom mt-15">
            <span class="legend-item"><span class="dot green"></span> Faible</span>
            <span class="legend-item"><span class="dot orange"></span> Moyen</span>
            <span class="legend-item"><span class="dot blue"></span> Élevé</span>
            <span class="legend-item"><span class="dot dark-blue"></span> Très élevé</span>
          </div>
        </div>

        <!-- Right Side Metrics Panel: Métriques OMAPI -->
        <div class="analytics-card glass side-metrics-card">
          <h3 class="analytics-title mb-20" style="display: inline-flex; align-items: center; gap: 8px;">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="width: 18px; height: 18px; color: #0A3A6A;"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>
            Métriques OMAPI
          </h3>
          <div class="side-metrics-list">
            
            <div class="metric-row-item soft-green">
              <div class="row-details">
                <span class="row-label">Marques actives</span>
                <span class="row-val">{{ store.dossiers.filter(d => d.type === 'Marque').length }}</span>
                <span class="row-sub">Dépôts de marque validés</span>
              </div>
              <div class="row-icon-circle">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width: 18px; height: 18px; color: #166534;"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path><line x1="7" y1="7" x2="7.01" y2="7"></line></svg>
              </div>
            </div>

            <div class="metric-row-item soft-purple">
              <div class="row-details">
                <span class="row-label">Brevets validés</span>
                <span class="row-val">{{ store.dossiers.filter(d => d.type === 'Brevet').length }}</span>
                <span class="row-sub">Inventions enregistrées</span>
              </div>
              <div class="row-icon-circle">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width: 18px; height: 18px; color: #6b21a8;"><path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .5 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"></path><line x1="9" y1="18" x2="15" y2="18"></line><line x1="10" y1="22" x2="14" y2="22"></line></svg>
              </div>
            </div>

            <div class="metric-row-item soft-orange">
              <div class="row-details">
                <span class="row-label">Note globale service</span>
                <span class="row-val">4.8 / 5</span>
                <span class="row-sub">Satisfaction usagers</span>
              </div>
              <div class="row-icon-circle">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width: 18px; height: 18px; color: #92400e;"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>

    <!-- Bottom Section: Notifications & Recent Users/Files -->
    <div class="bottom-grid-section">
      
      <!-- Notifications/Alerts Box -->
      <div class="bottom-card glass">
        <div class="card-tabs">
          <button 
            :class="['tab-btn', { active: notificationTab === 'notif' }]" 
            @click="notificationTab = 'notif'"
          >
            Notifications
          </button>
          <button 
            :class="['tab-btn', { active: notificationTab === 'alertes' }]" 
            @click="notificationTab = 'alertes'"
          >
            Alertes
          </button>
        </div>

        <div class="tab-content" v-if="notificationTab === 'notif'">
          <div class="notif-settings-row">
            <span class="settings-text">M\'avertir pour chaque mise à jour de dossier</span>
            <label class="switch-toggle">
              <input type="checkbox" checked />
              <span class="slider-toggle"></span>
            </label>
          </div>
          <div class="quick-notif-list">
            <div 
              v-for="n in store.notifications.slice(0, 3)" 
              :key="n.id" 
              class="quick-notif-item"
            >
              <span class="bullet-dot"></span>
              <div class="notif-body">
                <p class="msg">{{ n.message }}</p>
                <span class="time">{{ n.date }}</span>
              </div>
            </div>
            <div v-if="store.notifications.length === 0" class="no-activity">
              Aucune notification récente.
            </div>
          </div>
        </div>

        <div class="tab-content alertes-content" v-else>
          <div class="quick-notif-item alert-danger" style="display: flex; align-items: flex-start; gap: 8px;">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width: 16px; height: 16px; color: #c53030; flex-shrink: 0; margin-top: 2px;"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
            <span><strong>Échéance annuelle :</strong> N'oubliez pas d'acquitter les annuités de brevets avant le 30 Juin pour éviter la déchéance de vos droits.</span>
          </div>
        </div>
      </div>

      <!-- 5 Last Contacts / Team Members overlapping circles -->
      <div class="bottom-card glass last-users-card">
        <h3 class="analytics-title mb-20">Derniers Contacts Actifs</h3>
        <div class="overlapping-circles-row">
          <div class="circles-container">
            <div class="avatar-circle av-orange" title="Andry">AN</div>
            <div class="avatar-circle av-blue" title="Jean">JN</div>
            <div class="avatar-circle av-green" title="Miary">MY</div>
            <div class="avatar-circle av-purple" title="Patricia">PT</div>
            <div class="avatar-circle av-teal" title="Tovo">TV</div>
            <div class="avatar-circle add-circle" @click="router.push('/portal/messages')">+</div>
          </div>
        </div>
        <p class="users-card-desc">
          Examinateurs OMAPI et Mandataires agréés associés à vos dossiers récents. Cliquez sur le bouton "+" pour démarrer un nouvel échange.
        </p>
      </div>

    </div>
  </div>
</template>

<style scoped>
.page-title { font-size: 2rem; font-weight: 800; margin-bottom: 5px; }
.text-blue { color: var(--primary-blue); }
.text-light-grey { color: #64748b; }
.mb-30 { margin-bottom: 30px; }
.mb-20 { margin-bottom: 20px; }
.mt-15 { margin-top: 15px; }

.header-top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

/* Notifications Bell */
.notif-wrapper { position: relative; }
.notif-btn {
  background: var(--white);
  border: 1px solid #e2e8f0;
  border-radius: 50%;
  width: 44px;
  height: 44px;
  font-size: 1.1rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
}
.notif-btn:hover { background: #f1f5f9; }
.badge-notif {
  position: absolute;
  top: -4px;
  right: -4px;
  background: #ef4444;
  color: white;
  border-radius: 50%;
  width: 18px;
  height: 18px;
  font-size: 0.7rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
}

.notif-dropdown {
  position: absolute;
  right: 0;
  top: 55px;
  width: 340px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 40px rgba(0,0,0,0.15);
  border: 1px solid #e2e8f0;
  z-index: 999;
  overflow: hidden;
}
.notif-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 18px;
  background: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
  font-weight: 700;
  color: #334155;
  font-size: 0.85rem;
}
.mark-read-btn {
  background: none;
  border: none;
  color: var(--secondary-blue);
  font-size: 0.78rem;
  cursor: pointer;
  font-weight: 600;
}
.notif-list { max-height: 250px; overflow-y: auto; }
.notif-item { padding: 12px 18px; border-bottom: 1px solid #f1f5f9; }
.notif-item.unread { border-left: 3px solid var(--accent-orange); background: #fdfaf7; }
.notif-msg { font-size: 0.85rem; color: #334155; margin-bottom: 4px; }
.notif-date { font-size: 0.75rem; color: #94a3b8; }
.notif-empty { padding: 25px; text-align: center; color: #94a3b8; font-size: 0.85rem; }

/* 4 Colored KPI Cards styling exactly like the image */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 20px;
}

.kpi-card {
  border-radius: 16px;
  padding: 20px;
  color: white;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 4px 20px rgba(0,0,0,0.06);
  position: relative;
  overflow: hidden;
  transition: transform 0.2s, box-shadow 0.2s;
}

.kpi-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0,0,0,0.1);
}

/* OMAPI custom card backgrounds */
.bg-orange { background: linear-gradient(135deg, #F26122 0%, #ff8b54 100%); }
.bg-sky-blue { background: linear-gradient(135deg, #0088CC 0%, #4db5ff 100%); }
.bg-dark-blue { background: linear-gradient(135deg, #0A3A6A 0%, #175d9e 100%); }
.bg-teal { background: linear-gradient(135deg, #0f766e 0%, #14b8a6 100%); }

.kpi-content {
  display: flex;
  flex-direction: column;
  z-index: 2;
}

.kpi-label {
  font-size: 0.82rem;
  font-weight: 600;
  opacity: 0.9;
  text-transform: uppercase;
  letter-spacing: 0.02em;
  margin-bottom: 5px;
}

.kpi-value {
  font-size: 2.2rem;
  font-weight: 800;
  line-height: 1.1;
  margin-bottom: 10px;
}

.kpi-trend {
  font-size: 0.75rem;
  font-weight: 700;
  background: rgba(255, 255, 255, 0.2);
  padding: 3px 8px;
  border-radius: 12px;
  align-self: flex-start;
  backdrop-filter: blur(4px);
}

.kpi-icon-box {
  width: 48px;
  height: 48px;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  backdrop-filter: blur(4px);
  border: 1px solid rgba(255,255,255,0.1);
}

/* Action button bar like the orange "Gestion des objectifs" button in image */
.action-bar {
  display: flex;
  justify-content: flex-end;
}
.btn-action-primary {
  background: #f59e0b;
  color: white;
  font-weight: 700;
  padding: 10px 20px;
  border-radius: 8px;
  font-size: 0.9rem;
  box-shadow: 0 4px 12px rgba(245, 158, 11, 0.2);
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 8px;
}
.btn-action-primary:hover {
  background: #d97706;
  box-shadow: 0 6px 18px rgba(245, 158, 11, 0.3);
  transform: translateY(-1px);
}

/* Analytics section layout */
.analytics-section {
  width: 100%;
}

.grid-analytics {
  display: grid;
  grid-template-columns: 1.4fr 1fr;
  gap: 20px;
}

.analytics-card {
  background: white;
  border-radius: 16px;
  padding: 25px;
  border: 1px solid #e2e8f0;
  display: flex;
  flex-direction: column;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  border-bottom: 1px solid #f1f5f9;
  padding-bottom: 12px;
}

.analytics-title {
  font-size: 1.1rem;
  color: #1e293b;
  font-weight: 700;
}

.period-select {
  background: #f1f5f9;
  border: 1px solid #cbd5e1;
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 0.8rem;
  font-weight: 600;
  color: #475569;
  outline: none;
}

.chart-wrapper {
  position: relative;
  height: 250px;
  width: 100%;
}

.chart-legend-custom {
  display: flex;
  justify-content: center;
  gap: 15px;
  font-size: 0.78rem;
  font-weight: 600;
  color: #64748b;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 6px;
}

.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  display: inline-block;
}
.dot.green { background: #ef4444; } /* Matches low/red in image, wait - red is low in image, yes */
.dot.orange { background: #f59e0b; }
.dot.blue { background: #10b981; }
.dot.dark-blue { background: #0088CC; }

/* Side Metrics List */
.side-metrics-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.metric-row-item {
  border-radius: 12px;
  padding: 12px 18px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border: 1px solid transparent;
}

/* Background variables matching YanaSee widgets */
.soft-green { background: #f0fdf4; border-color: #bbf7d0; color: #166534; }
.soft-purple { background: #faf5ff; border-color: #e9d5ff; color: #6b21a8; }
.soft-orange { background: #fffbeb; border-color: #fef3c7; color: #92400e; }

.row-details {
  display: flex;
  flex-direction: column;
}

.row-label {
  font-size: 0.8rem;
  font-weight: 700;
  opacity: 0.95;
}

.row-val {
  font-size: 1.4rem;
  font-weight: 800;
  margin: 2px 0;
}

.row-sub {
  font-size: 0.72rem;
  opacity: 0.8;
}

.row-icon-circle {
  width: 36px;
  height: 36px;
  background: rgba(255,255,255,0.7);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.1rem;
  box-shadow: 0 2px 5px rgba(0,0,0,0.03);
}

/* Bottom Grid Layout */
.bottom-grid-section {
  display: grid;
  grid-template-columns: 1.4fr 1fr;
  gap: 20px;
}

.bottom-card {
  background: white;
  border-radius: 16px;
  padding: 25px;
  border: 1px solid #e2e8f0;
}

/* Card Tab buttons */
.card-tabs {
  display: flex;
  gap: 8px;
  border-bottom: 1px solid #f1f5f9;
  padding-bottom: 12px;
  margin-bottom: 15px;
}

.tab-btn {
  background: #f1f5f9;
  border: none;
  padding: 5px 12px;
  border-radius: 15px;
  font-size: 0.8rem;
  font-weight: 700;
  color: #64748b;
  cursor: pointer;
}

.tab-btn.active {
  background: #fef3c7;
  color: #d97706;
}

.notif-settings-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #fafafa;
  padding: 10px 15px;
  border-radius: 8px;
  margin-bottom: 15px;
}

.settings-text {
  font-size: 0.82rem;
  color: #475569;
  font-weight: 600;
}

/* Switch styling */
.switch-toggle {
  position: relative;
  display: inline-block;
  width: 36px;
  height: 20px;
}
.switch-toggle input { opacity: 0; width: 0; height: 0; }
.slider-toggle {
  position: absolute;
  cursor: pointer;
  top: 0; left: 0; right: 0; bottom: 0;
  background-color: #cbd5e1;
  transition: .2s;
  border-radius: 34px;
}
.slider-toggle:before {
  position: absolute;
  content: "";
  height: 14px; width: 14px;
  left: 3px; bottom: 3px;
  background-color: white;
  transition: .2s;
  border-radius: 50%;
}
input:checked + .slider-toggle { background-color: #f59e0b; }
input:checked + .slider-toggle:before { transform: translateX(16px); }

.quick-notif-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.quick-notif-item {
  display: flex;
  gap: 12px;
  padding: 8px 0;
  align-items: flex-start;
}

.bullet-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #f59e0b;
  margin-top: 5px;
}

.notif-body {
  display: flex;
  flex-direction: column;
}

.notif-body .msg {
  font-size: 0.85rem;
  color: #334155;
  margin: 0 0 2px 0;
  line-height: 1.4;
}

.notif-body .time {
  font-size: 0.72rem;
  color: #94a3b8;
}

.alertes-content {
  padding: 10px 0;
}

.alert-danger {
  background: #fff5f5;
  border: 1px solid #fee2e2;
  color: #c53030;
  border-radius: 8px;
  padding: 12px 15px;
  font-size: 0.85rem;
  line-height: 1.5;
}

.no-activity {
  font-size: 0.82rem;
  color: #94a3b8;
  padding: 20px;
  text-align: center;
}

/* Overlapping circles team active list */
.last-users-card {
  display: flex;
  flex-direction: column;
}

.overlapping-circles-row {
  display: flex;
  justify-content: flex-start;
  padding: 10px 0;
  margin-bottom: 12px;
}

.circles-container {
  display: flex;
  align-items: center;
}

.avatar-circle {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  border: 3px solid white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.85rem;
  font-weight: 700;
  color: white;
  margin-right: -12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
}

.av-orange { background: #f97316; }
.av-blue { background: #3b82f6; }
.av-green { background: #10b981; }
.av-purple { background: #8b5cf6; }
.av-teal { background: #14b8a6; }

.add-circle {
  background: #fef3c7;
  color: #d97706;
  font-size: 1.2rem;
  cursor: pointer;
  margin-right: 0;
  transition: all 0.2s;
}

.add-circle:hover {
  background: #fde68a;
  transform: scale(1.05);
}

.users-card-desc {
  font-size: 0.8rem;
  color: #64748b;
  line-height: 1.5;
}

@media (max-width: 900px) {
  .grid-analytics, .bottom-grid-section {
    grid-template-columns: 1fr;
  }
}
</style>
