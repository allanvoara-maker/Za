<script setup lang="ts">
</script>

<template>
  <div class="cta-banner">
    <div class="container cta-content">
      <div class="cta-text">
        <h3>Pour avoir le droit exclusif de propriété Industrielle,</h3>
        <p>Il est obligatoire de demander un enregistrement auprès de l'OMAPI</p>
      </div>
      <div class="cta-buttons">
        <router-link to="/procedures" class="btn btn-secondary" style="text-decoration: none;">PROCÉDURES</router-link>
        <router-link to="/documents" class="btn btn-primary" style="text-decoration: none;">DOCUMENTS</router-link>
      </div>
    </div>
  </div>
</template>

<style scoped>
.cta-banner {
  background: var(--primary-blue);
  color: var(--white);
  padding: 25px 0;
  margin-top: -20px;
  position: relative;
  z-index: 10;
  box-shadow: 0 4px 15px rgba(0,0,0,0.1);
}

.cta-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.cta-text h3 {
  font-size: 1.2rem;
  font-weight: 500;
  margin-bottom: 5px;
}

.cta-text p {
  color: rgba(255,255,255,0.8);
  font-size: 0.9rem;
}

.cta-buttons {
  display: flex;
  gap: 15px;
}

.btn {
  padding: 12px 25px;
  font-weight: 600;
  border-radius: 6px;
  letter-spacing: 0.5px;
}

.btn-secondary {
  background: rgba(255,255,255,0.1);
  color: var(--white);
  border: 1px solid rgba(255,255,255,0.2);
}

.btn-secondary:hover {
  background: rgba(255,255,255,0.2);
}

.btn-primary {
  background: var(--white);
  color: var(--primary-blue);
  box-shadow: 0 4px 10px rgba(255,255,255,0.2);
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 15px rgba(255,255,255,0.3);
}

@media (max-width: 768px) {
  .cta-content {
    flex-direction: column;
    text-align: center;
    gap: 20px;
  }
}
</style>
