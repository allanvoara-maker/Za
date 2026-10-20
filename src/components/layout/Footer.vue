<script setup lang="ts">
</script>

<template>
  <footer class="footer">
    <div class="container footer-content">
      <div class="footer-links">
        <router-link to="/presentation" class="footer-link">L'OMAPI</router-link>
        <router-link to="/mandataires" class="footer-link">MANDATAIRES</router-link>
        <router-link to="/gopi" class="footer-link">GOPI</router-link>
        <a href="#" class="footer-link">POLITIQUE QUALITÉ</a>
      </div>
      <div class="copyright">
        &copy; {{ new Date().getFullYear() }} OMAPI. Tous droits réservés.
      </div>
    </div>
  </footer>
</template>

<style scoped>
.footer {
  background: var(--white);
  padding: 25px 0;
  border-top: 1px solid rgba(0,0,0,0.05);
  margin-top: 40px;
}

.footer-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.footer-links {
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
}

.footer-link {
  font-weight: 700;
  color: var(--primary-blue);
  letter-spacing: 1px;
  text-decoration: none;
  font-size: 0.9rem;
}

.footer-link:hover {
  color: var(--accent-orange);
}

.copyright {
  color: var(--text-light);
  font-size: 0.9rem;
}

@media (max-width: 768px) {
  .footer-content {
    flex-direction: column;
    gap: 15px;
    text-align: center;
  }
}
</style>
