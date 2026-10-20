<script setup lang="ts">
</script>

<template>
  <section class="hero glass">
    <div class="hero-bg">
      <div class="blob blob-1"></div>
      <div class="blob blob-2"></div>
    </div>

    <div class="container hero-content fade-in">
      <div class="hero-text-area">
        <span class="badge">Édition {{ new Date().getFullYear() }}</span>
        <h1>Lancement officiel du<br> <span class="highlight">Concours National d'innovation</span></h1>
        <p>Rejoignez les esprits les plus brillants et présentez vos créations et inventions à l'échelle nationale.</p>
        <button class="cta-btn primary-btn">Participer maintenant</button>
      </div>
      
      <div class="hero-visual">
        <!-- Abstract representation of the circular portraits in the original design -->
        <div class="portrait-mesh">
          <div class="circle-portrait p1"></div>
          <div class="circle-portrait p2"></div>
          <div class="circle-portrait p3"></div>
          <div class="circle-portrait p4"></div>
          <div class="circle-portrait p5"></div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.hero {
  position: relative;
  margin: 30px auto;
  max-width: 1200px;
  overflow: hidden;
  border-radius: 20px;
  background: linear-gradient(135deg, var(--primary-blue) 0%, var(--secondary-blue) 100%);
  color: var(--white);
  min-height: 480px;
  display: flex;
  align-items: center;
  box-shadow: 0 20px 40px rgba(10, 58, 106, 0.2);
}

.hero-bg {
  position: absolute;
  top: 0; left: 0; width: 100%; height: 100%;
  overflow: hidden;
  z-index: 0;
}

.blob {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  opacity: 0.5;
}

.blob-1 {
  top: -50px;
  left: -100px;
  width: 400px;
  height: 400px;
  background: var(--accent-orange);
}

.blob-2 {
  bottom: -100px;
  right: -50px;
  width: 500px;
  height: 500px;
  background: #00d2ff;
}

.hero-content {
  position: relative;
  z-index: 1;
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  gap: 40px;
  padding: 40px;
}

.hero-text-area {
  flex: 1;
}

.badge {
  display: inline-block;
  background: rgba(255,255,255,0.2);
  padding: 5px 15px;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 600;
  margin-bottom: 20px;
  backdrop-filter: blur(5px);
}

h1 {
  font-size: 3rem;
  line-height: 1.1;
  font-weight: 700;
  margin-bottom: 20px;
}

h1 .highlight {
  color: var(--white);
  text-shadow: 0 0 20px rgba(255,255,255,0.3);
}

p {
  font-size: 1.1rem;
  line-height: 1.6;
  opacity: 0.9;
  margin-bottom: 30px;
  max-width: 90%;
}

.primary-btn {
  background: var(--accent-orange);
  color: var(--white);
  padding: 15px 30px;
  font-size: 1.1rem;
  font-weight: 600;
  border-radius: 30px;
  box-shadow: 0 10px 20px rgba(242, 97, 34, 0.3);
}

.primary-btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 15px 25px rgba(242, 97, 34, 0.4);
}

.hero-visual {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
}

.portrait-mesh {
  position: relative;
  width: 100%;
  aspect-ratio: 1;
  max-width: 400px;
}

.circle-portrait {
  position: absolute;
  border-radius: 50%;
  background: rgba(255,255,255,0.1);
  border: 3px solid rgba(255,255,255,0.5);
  backdrop-filter: blur(10px);
  box-shadow: 0 10px 30px rgba(0,0,0,0.2);
  transition: transform 0.5s ease;
}

.circle-portrait:hover {
  transform: scale(1.1) translateY(-10px);
  z-index: 10;
  border-color: var(--accent-orange);
}

/* Positioning the stylized circles */
.p1 { width: 140px; height: 140px; top: 10%; left: 10%; background: linear-gradient(135deg, #FF9A9E 0%, #FECFEF 100%); }
.p2 { width: 120px; height: 120px; top: 0%; right: 15%; background: linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%); }
.p3 { width: 180px; height: 180px; top: 35%; left: 30%; background: linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%); border-color: var(--white); z-index: 5; }
.p4 { width: 110px; height: 110px; bottom: 15%; left: 10%; background: linear-gradient(135deg, #fccb90 0%, #d57eeb 100%); }
.p5 { width: 130px; height: 130px; bottom: 10%; right: 20%; background: linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 100%); }

@media (max-width: 992px) {
  .hero-content {
    flex-direction: column;
    text-align: center;
  }
  p {
    max-width: 100%;
  }
  .portrait-mesh {
    margin-top: 30px;
    max-width: 300px;
  }
}
</style>
