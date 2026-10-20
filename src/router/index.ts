import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/LoginView.vue')
    },
    {
      path: '/register',
      name: 'register',
      component: () => import('../views/RegisterView.vue')
    },
    // ══ Standalone Welcome Page (no sidebar, own full-page layout) ══
    {
      path: '/portal/welcome',
      name: 'welcome',
      component: () => import('../views/WelcomeView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/portal',
      component: () => import('../components/layout/PortalLayout.vue'),
      meta: { requiresAuth: true },
      children: [
        {
          path: '',
          redirect: { name: 'dashboard' }
        },
        {
          path: 'dashboard',
          name: 'dashboard',
          component: () => import('../views/DashboardView.vue')
        },
        {
          path: 'depot',
          name: 'depot',
          component: () => import('../views/DepotMarqueView.vue'),
          meta: { hideSidebar: true }
        },
        {
          path: 'dossiers',
          name: 'dossiers',
          component: () => import('../views/MesDossiersView.vue')
        },
        {
          path: 'dossiers/:id',
          name: 'dossier-detail',
          component: () => import('../views/DossierDetailView.vue')
        },
        {
          path: 'statistiques',
          name: 'statistiques',
          component: () => import('../views/StatistiquesView.vue')
        },
        {
          path: 'messages',
          name: 'messages',
          component: () => import('../views/MessagesView.vue')
        },
        {
          path: 'factures',
          name: 'factures',
          component: () => import('../views/FacturesView.vue')
        },
        {
          path: 'parametres',
          name: 'parametres',
          component: () => import('../views/SettingsView.vue')
        },
        {
          path: 'admin',
          name: 'admin',
          component: () => import('../views/AdminView.vue'),
          meta: { requiresAdmin: true }
        }
      ]
    },
    {
      path: '/',
      component: () => import('../components/layout/PublicLayout.vue'),
      children: [
        {
          path: '',
          name: 'home',
          component: HomeView
        },
        {
          path: 'marques',
          name: 'marques',
          component: () => import('../views/BrandView.vue')
        },
        {
          path: 'noms-commerciaux',
          name: 'noms-commerciaux',
          component: () => import('../views/CommercialNamesView.vue')
        },
        {
          path: 'brevets',
          name: 'brevets',
          component: () => import('../views/PatentView.vue')
        },
        {
          path: 'modeles',
          name: 'modeles',
          component: () => import('../views/ModelsView.vue')
        },
        {
          path: 'droit',
          name: 'droit',
          component: () => import('../views/LawApplicationView.vue')
        },
        {
          path: 'guides',
          name: 'guides',
          component: () => import('../views/GuidesView.vue')
        },
        {
          path: 'procedures',
          name: 'procedures',
          component: () => import('../views/ProceduresView.vue')
        },
        {
          path: 'documents',
          name: 'documents',
          component: () => import('../views/DocumentsView.vue')
        },
        {
          path: 'presentation',
          name: 'presentation',
          component: () => import('../views/PresentationView.vue')
        },
        {
          path: 'mandataires',
          name: 'mandataires',
          component: () => import('../views/MandatairesView.vue')
        },
        {
          path: 'gopi',
          name: 'gopi',
          component: () => import('../views/GopiView.vue')
        }
      ]
    }
  ]
})

router.beforeEach((to, _from, next) => {
  const isAuthenticated = !!localStorage.getItem('isAuthenticated')
  const userStr = localStorage.getItem('portalUser')
  const user = userStr ? JSON.parse(userStr) : null

  if (to.meta.requiresAuth && !isAuthenticated) {
    // Not authenticated → go to login
    next({ name: 'login' })
  } else if (to.name === 'login' && isAuthenticated) {
    // Already logged in → redirect by role
    if (user && user.role === 'admin') {
      next({ name: 'admin' })
    } else {
      next({ name: 'welcome' })
    }
  } else if (
    isAuthenticated &&
    user &&
    user.role === 'admin' &&
    (to.name === 'welcome' ||
     to.name === 'dashboard' ||
     to.name === 'depot' ||
     to.name === 'dossiers' ||
     to.name === 'statistiques' ||
     to.name === 'factures' ||
     to.path === '/portal' ||
     to.path === '/portal/')
  ) {
    // Admin trying to access user-only pages → send to admin dashboard
    next({ name: 'admin' })
  } else if (to.meta.requiresAdmin && (!user || user.role !== 'admin')) {
    // Non-admin trying admin route → send to welcome
    next({ name: 'welcome' })
  } else {
    next()
  }
})

export default router
