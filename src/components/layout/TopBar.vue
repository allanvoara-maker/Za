<script setup lang="ts">
</script>

<template>
  <div class="top-bar">
    <div class="container top-bar-content">
      <div class="top-left">
        <span class="badge">Bienvenue à l'Office Malgache de la Propriété Industrielle</span>
      </div>
      <div class="top-right">
        <a href="#" class="link highlight">CONCOURS NATIONAL D'INNOVATION</a>
        <a href="#" class="link">INFORMATIONS</a>
      </div>
    </div>
  </div>
</template>

<style scoped>
.top-bar {
  background: linear-gradient(90deg, var(--primary-blue) 0%, var(--primary-blue) 30%, var(--accent-orange) 30%, var(--accent-orange) 100%);
  color: var(--white);
  padding: 8px 0;
  font-size: 0.85rem;
  font-weight: 500;
}

.top-bar-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.badge {
  background: rgba(255, 255, 255, 0.2);
  padding: 4px 12px;
  border-radius: 20px;
  backdrop-filter: blur(5px);
}

.top-right {
  display: flex;
  gap: 20px;
}

.link {
  color: var(--white);
  padding: 4px 8px;
  border-radius: 4px;
}

.link:hover {
  background: rgba(255, 255, 255, 0.1);
}

.highlight {
  color: var(--primary-blue);
  /* Trying to match the visual where it transitions smoothly or has specific color */
  text-shadow: 0 1px 2px rgba(255,255,255,0.4);
}
@media (max-width: 768px) {
  .top-bar-content {
    flex-direction: column;
    gap: 10px;
    text-align: center;
  }
}
</style>
