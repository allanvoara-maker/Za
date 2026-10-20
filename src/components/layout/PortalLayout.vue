<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { RouterView, useRoute, useRouter } from 'vue-router'
import { useAuth, useSessionTimeout } from '../../composables/useAuth'
import { useApplicationStore } from '../../stores/applicationStore'

const { currentUser, logout } = useAuth()
const { startListening, stopListening } = useSessionTimeout()
const isSidebarOpen = ref(true)
const route = useRoute()
const router = useRouter()
const store = useApplicationStore()

onMounted(() => startListening())
onUnmounted(() => stopListening())

const onSearchInput = () => {
  if (store.searchQuery.trim()) {
    if (currentUser.value?.role === 'admin') {
      if (route.name !== 'admin') {
        router.push({ name: 'admin' })
      }
    } else {
      if (route.name !== 'dossiers') {
        router.push({ name: 'dossiers' })
      }
    }
  }
}

// Clear search query if navigating away from search-compatible pages
watch(() => route.path, (newPath) => {
  if (!newPath.includes('/portal/dossiers') && !newPath.includes('/portal/admin')) {
    store.searchQuery = ''
  }
})
</script>

<template>
  <div class="portal-layout">
    
    <!-- Sidebar — hidden on depot (hideSidebar meta) -->
    <aside v-if="!route.meta.hideSidebar" :class="['sidebar', { 'closed': !isSidebarOpen }]">
      <div class="sidebar-header">
        <div class="logo-text">OMAPI <span>Portal</span></div>
      </div>

      <nav class="sidebar-nav">
        <!-- ADMIN NAVIGATION -->
        <template v-if="currentUser?.role === 'admin'">
          <div class="nav-group-title">ACCÈS RAPIDE</div>
          <router-link to="/portal/admin" class="nav-item" active-class="active">
            <span class="icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
            </span>
            <span class="text">Tableau de bord</span>
          </router-link>

          <div class="nav-group-title">COMMUNICATION</div>
          <router-link to="/portal/messages" class="nav-item" active-class="active">
            <span class="icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
            </span>
            <span class="text">Messagerie</span>
          </router-link>

          <div class="nav-group-title">CONFIGURATION</div>
          <router-link to="/portal/parametres" class="nav-item" active-class="active">
            <span class="icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
            </span>
            <span class="text">Paramètres</span>
          </router-link>
        </template>

        <!-- CLIENT NAVIGATION -->
        <template v-else>
          <div class="nav-group-title">ACCÈS RAPIDE</div>
          <router-link to="/portal/dashboard" class="nav-item" active-class="active">
            <span class="icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
            </span>
            <span class="text">Tableau de bord</span>
          </router-link>
          <router-link to="/portal/statistiques" class="nav-item" active-class="active">
            <span class="icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
            </span>
            <span class="text">Statistiques</span>
          </router-link>

          <!-- PROPRIÉTÉ INDUSTRIELLE -->
          <div class="nav-group-title">PROPRIÉTÉ INDUSTRIELLE</div>
          <router-link to="/portal/depot" class="nav-item" active-class="active">
            <span class="icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="12" y1="18" x2="12" y2="12"/><line x1="9" y1="15" x2="15" y2="15"/></svg>
            </span>
            <span class="text">Nouveau Dépôt</span>
          </router-link>
          <router-link to="/portal/dossiers" class="nav-item" active-class="active">
            <span class="icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>
            </span>
            <span class="text">Mes Dossiers</span>
          </router-link>

          <!-- SERVICES & FINANCES -->
          <div class="nav-group-title">SERVICES & FINANCES</div>
          <router-link to="/portal/messages" class="nav-item" active-class="active">
            <span class="icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
            </span>
            <span class="text">Messagerie</span>
          </router-link>
          <router-link to="/portal/factures" class="nav-item" active-class="active">
            <span class="icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
            </span>
            <span class="text">Paiements</span>
          </router-link>

          <!-- CONFIGURATION -->
          <div class="nav-group-title">CONFIGURATION</div>
          <router-link to="/portal/parametres" class="nav-item" active-class="active">
            <span class="icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
            </span>
            <span class="text">Paramètres</span>
          </router-link>
        </template>
      </nav>

      <div class="sidebar-footer">
        <button @click="logout" class="logout-btn">
          <span class="icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
          </span>
          <span class="text">Déconnexion</span>
        </button>
      </div>
    </aside>

    <!-- Main Content Area -->
    <div class="main-wrapper" :class="{ 'sidebar-hidden': route.meta.hideSidebar }">
      <!-- Portal Topbar -->
      <header class="portal-topbar">

        <!-- Depot / no-sidebar mode: show back button instead of sidebar toggle -->
        <div v-if="route.meta.hideSidebar" class="topbar-back-bar">
          <router-link to="/portal/dashboard" class="back-to-dashboard">
            ← Retour au Tableau de bord
          </router-link>
          <span class="depot-page-label">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width: 16px; height: 16px; margin-right: 8px; vertical-align: middle;"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>Nouveau Dépôt de Marque
          </span>
        </div>

        <!-- Normal mode: sidebar toggle + search -->
        <div v-else class="topbar-left">
          <button class="toggle-btn" @click="isSidebarOpen = !isSidebarOpen" style="display: flex; align-items: center; justify-content: center;">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width: 18px; height: 18px;"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
          </button>
          <div class="search-bar">
            <span class="search-icon" style="display: flex; align-items: center; justify-content: center;">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width: 14px; height: 14px;"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
            </span>
            <input type="text" v-model="store.searchQuery" @input="onSearchInput" placeholder="Rechercher un dossier, dépôt..." />
          </div>
        </div>
        
        <div class="user-info">
          <router-link to="/portal/messages" class="topbar-icon-btn" title="Messages" style="display: flex; align-items: center; justify-content: center;">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width: 16px; height: 16px;"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
          </router-link>
          <router-link to="/portal/parametres" class="topbar-icon-btn" title="Paramètres" style="display: flex; align-items: center; justify-content: center;">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width: 16px; height: 16px;"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
          </router-link>
          <div class="user-avatar">{{ currentUser?.avatar || 'U' }}</div>
          <span class="user-name">{{ currentUser?.name || 'Utilisateur' }}</span>
        </div>
      </header>

      <!-- Portal View -->
      <main class="portal-content fade-in">
        <RouterView />
      </main>
    </div>

  </div>
</template>

<style scoped>
.portal-layout {
  display: flex;
  height: 100vh;
  background-color: #f8fafc;
  overflow: hidden;
}

/* Sidebar */
.sidebar {
  width: 260px;
  background: #ffffff;
  color: #475569;
  display: flex;
  flex-direction: column;
  transition: width 0.3s ease;
  z-index: 100;
  border-right: 1px solid #e2e8f0;
}

.sidebar.closed {
  width: 80px;
}

.sidebar.closed .text, 
.sidebar.closed .logo-text span,
.sidebar.closed .nav-group-title {
  display: none;
}

.sidebar-header {
  height: 70px;
  display: flex;
  align-items: center;
  padding: 0 25px;
  background: #ffffff;
  border-bottom: 1px solid #e2e8f0;
}

.logo-text {
  font-size: 1.5rem;
  font-weight: 800;
  color: var(--primary-blue);
  white-space: nowrap;
}

.logo-text span {
  color: var(--accent-orange);
}

.sidebar-nav {
  flex: 1;
  padding: 15px 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
  overflow-y: auto;
}

.nav-group-title {
  font-size: 0.72rem;
  font-weight: 800;
  color: #94a3b8;
  padding: 15px 25px 5px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.nav-item {
  display: flex;
  align-items: center;
  padding: 10px 25px;
  color: #475569;
  text-decoration: none;
  font-size: 0.92rem;
  font-weight: 600;
  transition: all 0.2s;
  white-space: nowrap;
}

.nav-item:hover {
  background: #f8fafc;
  color: var(--primary-blue);
}

.nav-item.active {
  background: rgba(242, 97, 34, 0.08); /* Semi-transparent orange active background */
  color: var(--accent-orange);
  border-left: 4px solid var(--accent-orange);
  font-weight: 700;
}

.nav-item .icon {
  min-width: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.nav-item .icon svg,
.logout-btn .icon svg {
  width: 18px;
  height: 18px;
  stroke: currentColor;
}

.admin-link {
  color: #9333ea;
}

.admin-link:hover {
  background: rgba(147, 51, 234, 0.05);
}

.admin-link.active {
  background: rgba(147, 51, 234, 0.08);
  border-left-color: #9333ea;
  color: #9333ea;
}

.sidebar-footer {
  padding: 15px 20px;
  border-top: 1px solid #e2e8f0;
}

.logout-btn {
  display: flex;
  align-items: center;
  width: 100%;
  background: transparent;
  border: none;
  color: #ef4444;
  padding: 10px;
  font-size: 0.92rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  border-radius: 8px;
  white-space: nowrap;
}

.logout-btn:hover {
  background: rgba(239, 68, 68, 0.05);
}

.logout-btn .icon {
  min-width: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Main Wrapper */
.main-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

/* Portal Topbar */
.portal-topbar {
  height: 70px;
  background: #ffffff;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 30px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.02);
}

.topbar-left {
  display: flex;
  align-items: center;
  gap: 20px;
  flex: 1;
}

.toggle-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  color: #64748b;
  cursor: pointer;
}

.toggle-btn:hover { 
  color: var(--primary-blue); 
}

.search-bar {
  display: flex;
  align-items: center;
  background: #f1f5f9;
  padding: 6px 15px;
  border-radius: 20px;
  border: 1px solid #e2e8f0;
  max-width: 350px;
  width: 100%;
}

.search-icon {
  font-size: 0.9rem;
  color: #94a3b8;
  margin-right: 8px;
}

.search-bar input {
  background: transparent;
  border: none;
  outline: none;
  font-family: inherit;
  font-size: 0.9rem;
  color: #334155;
  width: 100%;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 15px;
}

.topbar-icon-btn {
  background: #f1f5f9;
  border: 1px solid #e2e8f0;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.1rem;
  transition: all 0.2s;
  color: #64748b;
  text-decoration: none;
}

.topbar-icon-btn:hover {
  background: #e2e8f0;
  color: var(--primary-blue);
}

.user-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: var(--accent-orange);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 1.1rem;
}

.user-name {
  font-weight: 600;
  color: #334155;
  font-size: 0.95rem;
}

/* Content Area */
.portal-content {
  flex: 1;
  padding: 30px;
  overflow-y: auto;
}

/* Full width mode when sidebar is hidden (depot page) */
.main-wrapper.sidebar-hidden {
  width: 100%;
  margin-left: 0;
}

/* Back button bar for deposit page */
.topbar-back-bar {
  display: flex;
  align-items: center;
  gap: 20px;
  flex: 1;
}

.back-to-dashboard {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: #f1f5f9;
  border: 1px solid #e2e8f0;
  color: #0A3A6A;
  font-size: 0.9rem;
  font-weight: 700;
  padding: 8px 18px;
  border-radius: 8px;
  text-decoration: none;
  transition: all 0.2s;
  white-space: nowrap;
}

.back-to-dashboard:hover {
  background: #0A3A6A;
  color: white;
  border-color: #0A3A6A;
  transform: translateX(-2px);
}

.depot-page-label {
  font-size: 1rem;
  font-weight: 700;
  color: #334155;
  padding-left: 16px;
  border-left: 2px solid #e2e8f0;
}

@media (max-width: 768px) {
  .sidebar { position: absolute; height: 100%; }
  .sidebar.closed { transform: translateX(-100%); }
  .depot-page-label { display: none; }
}
</style>
