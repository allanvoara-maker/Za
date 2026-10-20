<script setup lang="ts">
const mandataires = [
  { name: "Primelex", email: "primelex@primelex.org", phone: "-" },
  { name: "Louisette Randrianja", email: "louisette.randrianja@gmail.com", phone: "032 02 590 25 / 034 14 686 19" },
  { name: "Mihary Lexmercat", email: "mihary.lexmercat@gmx.fr", phone: "034 01 856 71" }
]
</script>

<template>
  <main class="page-container fade-in" style="padding-top: 140px; padding-bottom: 60px;">
    
    <div class="container text-center mb-40">
      <div class="icon-header">
        <span class="icon" style="display: flex; align-items: center; justify-content: center;">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="width: 40px; height: 40px; color: var(--primary-blue);"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M22 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
        </span>
      </div>
      <h1 class="page-title text-blue">Liste des Mandataires</h1>
      <p class="page-subtitle text-dark">
        Liste des mandataires agréés en matière de propriété industrielle.
      </p>
    </div>

    <div class="container" style="max-width: 800px; margin: 0 auto;">
      <div class="mandataires-list">
        <div v-for="(item, index) in mandataires" :key="index" class="mandataire-card glass-hover">
          <div class="avatar-circle">
            {{ item.name.charAt(0) }}
          </div>
          <div class="contact-info">
            <h3>{{ item.name }}</h3>
            <p><strong>Email:</strong> <a :href="`mailto:${item.email}`">{{ item.email }}</a></p>
            <p v-if="item.phone !== '-'"><strong>Téléphone:</strong> {{ item.phone }}</p>
          </div>
        </div>
      </div>
    </div>
  </main>
</template>

<style scoped>
.page-container {
  min-height: 80vh;
  background-color: #f8fafc;
}

.icon-header {
  width: 80px;
  height: 80px;
  background: var(--white);
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 20px auto;
  box-shadow: 0 10px 25px rgba(0,0,0,0.05);
}

.icon { font-size: 2.5rem; }
.page-title { font-size: 2.2rem; font-weight: 700; margin-bottom: 15px; }
.page-subtitle { font-size: 1.1rem; opacity: 0.8; }
.text-blue { color: var(--primary-blue); }
.text-dark { color: var(--text-dark); }
.mb-40 { margin-bottom: 40px; }

.mandataires-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.mandataire-card {
  display: flex;
  align-items: center;
  padding: 30px;
  background: var(--white);
  border-radius: 16px;
  box-shadow: 0 4px 15px rgba(0,0,0,0.03);
  transition: all 0.3s ease;
  border: 1px solid #e2e8f0;
}

.mandataire-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 12px 25px rgba(0, 136, 204, 0.1);
  border-color: #bae6fd;
}

.avatar-circle {
  width: 70px;
  height: 70px;
  border-radius: 50%;
  background: var(--primary-blue);
  color: var(--white);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  font-weight: 700;
  margin-right: 30px;
  flex-shrink: 0;
}

.contact-info h3 {
  font-size: 1.3rem;
  color: var(--primary-blue);
  margin-bottom: 10px;
}

.contact-info p {
  margin: 5px 0;
  color: var(--text-dark);
  font-size: 1.05rem;
}

.contact-info a {
  color: var(--accent-orange);
  text-decoration: none;
}

.contact-info a:hover {
  text-decoration: underline;
}

@media (max-width: 600px) {
  .mandataire-card {
    flex-direction: column;
    text-align: center;
  }
  .avatar-circle {
    margin: 0 auto 20px auto;
  }
}
</style>
