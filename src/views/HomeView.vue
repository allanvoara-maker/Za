<script setup lang="ts">
import HeroSection from '@/components/ui/HeroSection.vue'
import CTABanner from '@/components/ui/CTABanner.vue'
</script>

<template>
  <main>
    <HeroSection />
    <CTABanner />
    
    <!-- A modern whitespace filler for demonstration -->
    <section class="container info-section fade-in">
      <div class="glass card">
        <h3>L'importance de la Propriété Industrielle</h3>
        <p>Protéger vos créations est essentiel pour la croissance économique et la compétitivité. L'OMAPI vous accompagne dans toutes vos démarches d'enregistrement et de protection de vos droits.</p>
      </div>
      <div class="glass card">
        <h3>Nos Services Numériques</h3>
        <p class="mb-20">Découvrez nos nouveaux services en ligne pour faciliter vos dépôts de marques, brevets et dessins de manière rapide et sécurisée.</p>
        <router-link to="/login" class="btn-portal">Déposer en ligne →</router-link>
      </div>
    </section>
  </main>
</template>

<style scoped>
.info-section {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 30px;
  margin-top: 50px;
  margin-bottom: 50px;
}

.card {
  padding: 30px;
  transition: transform 0.3s ease;
}

.card:hover {
  transform: translateY(-5px);
}

.card h3 {
  color: var(--primary-blue);
  margin-bottom: 15px;
  font-size: 1.3rem;
  font-weight: 600;
}

.card p {
  line-height: 1.6;
  color: var(--text-light);
}

@media (max-width: 768px) {
  .info-section {
    grid-template-columns: 1fr;
  }
}

.mb-20 {
  margin-bottom: 20px;
}

.btn-portal {
  display: inline-block;
  background: var(--accent-orange);
  color: white;
  padding: 10px 20px;
  border-radius: 6px;
  text-decoration: none;
  font-weight: 600;
  font-size: 0.95rem;
  transition: all 0.3s;
}

.btn-portal:hover {
  background: #e65100;
  transform: translateY(-2px);
  box-shadow: 0 4px 10px rgba(234, 88, 12, 0.3);
}
</style>
