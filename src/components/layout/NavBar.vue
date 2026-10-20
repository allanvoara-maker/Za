<script setup lang="ts">
import { ref } from 'vue';

const navItems = [
  { name: 'Accueil', path: '/', isPrimary: true },
  { name: 'Marques', path: '/marques' },
  { name: 'Noms Commerciaux', path: '/noms-commerciaux' },
  { name: "Brevet d'Invention", path: '/brevets' },
  { name: 'Dessins ou Modèles', path: '/modeles' },
  { name: 'Application de droit', path: '/droit' },
  { name: 'Guides', path: '/guides' },
  { name: 'Portail E-Branding', path: '/login' }
];

const mobileMenuOpen = ref(false);
</script>
<template>
  <nav class="navbar">
    <div class="container">
      <button class="mobile-menu-btn" @click="mobileMenuOpen = !mobileMenuOpen">
        ☰
      </button>

      <ul :class="['nav-list', { 'mobile-open': mobileMenuOpen }]">
        <li v-for="item in navItems" :key="item.name" :class="['nav-item', { 'primary': item.isPrimary }]">
          <router-link :to="item.path" class="nav-link">{{ item.name }}</router-link>
        </li>
        <li class="nav-item menu-icon">
          <button class="icon-btn">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M3 12H21M3 6H21M3 18H21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
        </li>
      </ul>
    </div>
  </nav>
</template>

<style scoped>
.navbar {
  background: var(--primary-blue);
  position: relative;
  box-shadow: 0 4px 15px rgba(0,0,0,0.1);
  z-index: 100;
}

.nav-list {
  display: flex;
  list-style: none;
  margin: 0;
  padding: 0;
}

.nav-item {
  position: relative;
  flex: 1;
  text-align: center;
  border-right: 1px solid rgba(255,255,255,0.1);
}

.nav-item:last-child {
  border-right: none;
}

.nav-item.primary {
  background: var(--accent-orange);
  flex: 0.8;
}

.nav-link {
  display: block;
  padding: 18px 15px;
  color: var(--white);
  font-weight: 500;
  font-size: 0.95rem;
  letter-spacing: 0.3px;
  position: relative;
  overflow: hidden;
}

.nav-link::before {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 3px;
  background: var(--accent-orange);
  transform: scaleX(0);
  transform-origin: left;
  transition: transform 0.3s ease;
}

.nav-item:not(.primary) .nav-link:hover::before {
  transform: scaleX(1);
}

.nav-item:not(.primary) .nav-link:hover {
  background: rgba(255, 255, 255, 0.05);
}

.primary .nav-link:hover {
  filter: brightness(1.1);
}

.menu-icon {
  flex: 0.5;
  background: var(--accent-orange);
  display: flex;
  justify-content: center;
  align-items: center;
}

.icon-btn {
  background: transparent;
  color: var(--white);
  padding: 10px;
}

.icon-btn:hover {
  transform: scale(1.1);
}

.mobile-menu-btn {
  display: none;
  width: 100%;
  padding: 15px;
  background: var(--primary-blue);
  color: var(--white);
  font-size: 1.5rem;
}

/* Router Link Active State */
.router-link-active:not(.nav-item.primary .nav-link) {
  background: rgba(255, 255, 255, 0.1);
}

.router-link-active::before {
  transform: scaleX(1);
}

@media (max-width: 992px) {
  .mobile-menu-btn {
    display: block;
  }
  .nav-list {
    display: none;
    flex-direction: column;
    width: 100%;
  }
  .nav-list.mobile-open {
    display: flex;
  }
  .nav-item {
    border-right: none;
    border-bottom: 1px solid rgba(255,255,255,0.1);
  }
}
</style>
