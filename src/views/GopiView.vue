<script setup lang="ts">
</script>

<template>
  <main class="page-container fade-in" style="padding-top: 140px; padding-bottom: 60px;">
    
    <div class="container text-center mb-40">
      <div class="icon-header">
        <span class="icon" style="display: flex; align-items: center; justify-content: center;">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="width: 40px; height: 40px; color: var(--primary-blue);"><path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2"></path><path d="M18 14h-8M15 18h-5M10 6h8v4h-8V6Z"></path></svg>
        </span>
      </div>
      <h1 class="page-title text-blue">Gazette Officielle (GOPI)</h1>
      <p class="page-subtitle text-dark">
        Consultez les publications officielles de la propriété industrielle.
      </p>
    </div>

    <div class="container" style="max-width: 900px; margin: 0 auto;">
      <div class="gopi-grid">
        
        <div class="gopi-card glass">
          <div class="card-header bg-blue">
            <h3>PUBLICATION: Demande d'enregistrement</h3>
          </div>
          <div class="card-body">
            <ul>
              <li><strong>GOPI:</strong> Gazette officielle de la propriété industrielle</li>
              <li><strong>GMD:</strong> GOPI spéciale sur l'enregistrement des marques à l'international</li>
            </ul>
            <a href="http://www.omapi.mg/assets/gopi.pdf" target="_blank" class="download-btn">
              <span class="icon" style="display: inline-flex; align-items: center;"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="width: 16px; height: 16px;"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg></span> Version PDF Cliquez ici
            </a>
          </div>
        </div>

        <div class="gopi-card glass">
          <div class="card-header bg-orange">
            <h3>PUBLICATION: Inscription au registre</h3>
          </div>
          <div class="card-body">
            <ul>
              <li><strong>GOPI:</strong> Gazette officielle de la propriété industrielle</li>
              <li><strong>GIR:</strong> GOPI spéciale sur les inscriptions au registre</li>
            </ul>
            <a href="http://www.omapi.mg/assets/gopi.pdf" target="_blank" class="download-btn">
              <span class="icon" style="display: inline-flex; align-items: center;"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="width: 16px; height: 16px;"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg></span> Version PDF Cliquez ici
            </a>
          </div>
        </div>

        <div class="gopi-card glass">
          <div class="card-header bg-teal">
            <h3>PUBLICATION: Renouvellement</h3>
          </div>
          <div class="card-body">
            <ul>
              <li><strong>GOPI:</strong> Gazette officielle de la propriété industrielle</li>
              <li><strong>GRNVLT:</strong> GOPI spéciale sur le renouvellement des marques</li>
            </ul>
            <a href="http://www.omapi.mg/assets/gopi.pdf" target="_blank" class="download-btn">
              <span class="icon" style="display: inline-flex; align-items: center;"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="width: 16px; height: 16px;"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg></span> Version PDF Cliquez ici
            </a>
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

.gopi-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 30px;
}

.gopi-card {
  background: var(--white);
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0,0,0,0.05);
  border: 1px solid #e2e8f0;
  display: flex;
  flex-direction: column;
}

.card-header {
  padding: 20px;
  color: var(--white);
  text-align: center;
}

.card-header h3 {
  font-size: 1.15rem;
  font-weight: 600;
  margin: 0;
}

.bg-blue { background: var(--primary-blue); }
.bg-orange { background: var(--accent-orange); }
.bg-teal { background: #00897B; }

.card-body {
  padding: 30px;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.card-body ul {
  list-style: none;
  padding: 0;
  margin: 0 0 30px 0;
  flex: 1;
}

.card-body li {
  margin-bottom: 15px;
  line-height: 1.5;
  color: var(--text-dark);
  font-size: 0.95rem;
}

.card-body strong {
  color: #334155;
}

.download-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 12px 20px;
  background: #f1f5f9;
  color: var(--primary-blue);
  text-decoration: none;
  border-radius: 8px;
  font-weight: 600;
  transition: all 0.3s;
}

.download-btn:hover {
  background: #e0f2fe;
  transform: translateY(-2px);
}
</style>
