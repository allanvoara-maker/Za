<script setup lang="ts">
import { RouterView } from 'vue-router'
import TopBar from './TopBar.vue'
import Header from './Header.vue'
import NavBar from './NavBar.vue'
import Footer from './Footer.vue'
</script>

<template>
  <div class="public-layout">
    <TopBar />
    <Header />
    <NavBar />

    <main>
      <RouterView />
    </main>

    <Footer />
  </div>
</template>

<style scoped>
.public-layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}
main {
  flex-grow: 1;
}
</style>
