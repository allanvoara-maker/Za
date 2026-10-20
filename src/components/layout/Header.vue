<script setup lang="ts">
</script>

<template>
  <header class="header">
    <div class="container header-content">
      <div class="logo-area">
        <div class="logo-placeholder">
          <div class="circle"></div>
          <div class="logo-text">
            <h2>OMAPI</h2>
            <p>OFFICE MALGACHE DE LA<br>PROPRIÉTÉ INDUSTRIELLE</p>
          </div>
        </div>
        <div class="motto">
          Promouvoir la créativité et l'innovation
        </div>
      </div>
      
      <div class="contact-info">
        <div class="contact-item hover-scale">
          <span class="icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width: 14px; height: 14px;"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
          </span>
          <a href="mailto:omapi@moov.mg">omapi@moov.mg</a>
        </div>
        <div class="contact-item hover-scale">
          <span class="icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width: 14px; height: 14px;"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
          </span>
          <a href="tel:+261344315236">( 261 34 ) 43 152 36</a>
        </div>
        <div class="contact-item hover-scale">
          <span class="icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width: 14px; height: 14px;"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
          </span>
          <span>LOT VH 69 Volosarika<br>Ambanidia</span>
        </div>
      </div>
    </div>
  </header>
</template>

<style scoped>
.header {
  background: var(--white);
  padding: 20px 0;
  box-shadow: 0 4px 20px rgba(0,0,0,0.03);
  position: relative;
  overflow: hidden;
}

/* Subtle background pattern */
.header::before {
  content: '';
  position: absolute;
  top: -50px;
  right: -50px;
  width: 300px;
  height: 300px;
  background: radial-gradient(circle, rgba(242,97,34,0.05) 0%, transparent 70%);
  z-index: 0;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: relative;
  z-index: 1;
}

.logo-area {
  display: flex;
  align-items: center;
  gap: 30px;
}

.logo-placeholder {
  display: flex;
  align-items: center;
  gap: 15px;
}

.circle {
  width: 50px;
  height: 50px;
  background: conic-gradient(from 180deg, var(--secondary-blue), var(--accent-orange));
  border-radius: 50%;
  position: relative;
}

.circle::after {
  content: '';
  position: absolute;
  inset: 6px;
  background: var(--white);
  border-radius: 50%;
}

.logo-text h2 {
  color: var(--primary-blue);
  font-size: 1.8rem;
  font-weight: 700;
  line-height: 1;
  margin-bottom: 4px;
}

.logo-text p {
  color: var(--secondary-blue);
  font-size: 0.65rem;
  font-weight: 600;
  line-height: 1.2;
}

.motto {
  font-size: 1.2rem;
  font-style: italic;
  font-weight: 500;
  color: #8892b0;
  letter-spacing: 0.5px;
  border-left: 2px solid var(--accent-orange);
  padding-left: 20px;
}

.contact-info {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.contact-item {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 0.9rem;
  color: var(--primary-blue);
  font-weight: 500;
}

.icon {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 28px;
  height: 28px;
  background: rgba(0, 136, 204, 0.1);
  color: var(--secondary-blue);
  border-radius: 50%;
  font-size: 0.8rem;
}

.hover-scale {
  transition: transform 0.3s ease;
}
.hover-scale:hover {
  transform: translateX(-5px);
}
.hover-scale:hover .icon {
  background: var(--secondary-blue);
  color: var(--white);
}

@media (max-width: 992px) {
  .header-content {
    flex-direction: column;
    gap: 20px;
  }
  .motto {
    display: none;
  }
}
</style>
