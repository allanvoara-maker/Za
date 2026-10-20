<script setup lang="ts">
// Props could be used, but since we define static views, we just use a template style.
defineProps<{
  title: string
}>()
</script>

<template>
  <main class="page-container fade-in">
    <div class="container">
      <div class="glass page-header">
        <h1>{{ title }}</h1>
        <div class="line"></div>
      </div>
      
      <div class="content-placeholder">
        <div class="skeleton title"></div>
        <div class="skeleton text"></div>
        <div class="skeleton text"></div>
        <div class="skeleton text short"></div>
      </div>
    </div>
  </main>
</template>

<style scoped>
.page-container {
  padding: 40px 0;
  min-height: 60vh;
}

.page-header {
  padding: 40px;
  margin-bottom: 40px;
  text-align: center;
  background: linear-gradient(135deg, var(--white) 0%, rgba(255,255,255,0.4) 100%);
}

h1 {
  color: var(--primary-blue);
  font-size: 2.5rem;
  margin-bottom: 10px;
  font-weight: 700;
}

.line {
  width: 60px;
  height: 4px;
  background: var(--accent-orange);
  margin: 0 auto;
  border-radius: 2px;
}

.content-placeholder {
  padding: 20px;
}

.skeleton {
  background: linear-gradient(90deg, #e0e0e0 25%, #f0f0f0 50%, #e0e0e0 75%);
  background-size: 200% 100%;
  animation: loading 1.5s infinite;
  border-radius: 4px;
  margin-bottom: 15px;
}

.title { height: 30px; width: 40%; margin-bottom: 30px; }
.text { height: 15px; width: 100%; }
.short { height: 15px; width: 80%; }

@keyframes loading {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
</style>
