<script setup lang="ts">
import { ref } from 'vue'

const subNavItems = [
  'Présentation',
  'Taxes de dépôt D.M',
  'Classification de Locarno',
  'Procédure de dépôt D.M',
  'Formulaire D.M',
  'Avantages'
]

const activeTab = ref(subNavItems[0])
</script>

<template>
  <main class="page-container fade-in">
    <!-- Sub Navigation Tabs -->
    <div class="sub-nav">
      <div class="container sub-nav-container">
        <button 
          v-for="item in subNavItems" 
          :key="item"
          :class="['tab-btn', { active: activeTab === item }]"
          @click="activeTab = item"
        >
          {{ item }}
        </button>
      </div>
    </div>

    <div class="container content-wrapper">
      
      <!-- Présentation Section -->
      <div v-if="activeTab === 'Présentation'" class="fade-in">
        <!-- Top Images Gallery Placeholders -->
        <section class="gallery-section">
          <div class="image-box bg-furniture"></div>
          <div class="image-box bg-wood"></div>
          <div class="image-box bg-blueprint"></div>
        </section>

        <!-- Section 1: Qu'est ce qu'un dessin ou modèle industriel ? -->
        <section>
          <div class="section-banner dark-banner">
            <h2>Qu'est-ce qu'un dessin ou modèle industriel ?</h2>
          </div>
          <div class="info-row glass">
            <div class="icons-group">
              <div class="icon-circle blue-lock">
                <svg viewBox="0 0 24 24" fill="currentColor" class="w-8 h-8"><path d="M12 2C9.243 2 7 4.243 7 7V10H6C4.897 10 4 10.897 4 12V20C4 21.103 4.897 22 6 22H18C19.103 22 20 21.103 20 20V12C20 10.897 19.103 10 18 10H17V7C17 4.243 14.757 2 12 2ZM9 7C9 5.346 10.346 4 12 4C13.654 4 15 5.346 15 7V10H9V7ZM12 18C10.897 18 10 17.103 10 16C10 14.897 10.897 14 12 14C13.103 14 14 14.897 14 16C14 17.103 13.103 18 12 18Z"/></svg>
              </div>
              <div class="icon-circle parcel-icon">
                <svg viewBox="0 0 24 24" fill="currentColor" class="w-8 h-8"><path d="M20 4H4C2.897 4 2 4.897 2 6V18C2 19.103 2.897 20 4 20H20C21.103 20 22 19.103 22 18V6C22 4.897 21.103 4 20 4ZM12 10.5L4 5.5H20L12 10.5ZM20 18H4V7.5L12 12.5L20 7.5V18Z"/></svg>
              </div>
            </div>
            <p class="text-content">
              Un dessin ou modèle industriel est constitué par l'aspect ornemental ou esthétique d'un objet. Il peut être tridimensionnel... Il s'agit alors de la forme ou de la surface de l'objet... ou bidimensionnel, par exemple un assemblage de lignes ou de couleurs.
            </p>
          </div>
        </section>

        <!-- Thick Divider -->
        <div class="thick-divider"></div>

        <!-- Section 2: Quels types de produits... -->
        <section>
          <div class="section-banner teal-banner">
            <h2>Quels types de produits peuvent être protégés au titre des dessins et modèles industriels ?</h2>
          </div>
          <div class="info-row reverse glass">
            <p class="text-content flex-grow">
              Les dessins et modèles industriels s'appliquent aux produits les plus divers de l'industrie et de l'artisanat : instruments techniques ou médicaux, montres, bijoux et autres articles de luxe, objets ménagers, appareils électriques, véhicules ou encore structures architecturales, du secteur du textile à celui des articles de loisirs.
            </p>
            <div class="visual-block purse-placeholder" style="display: flex; align-items: center; justify-content: center; width: 140px; height: 140px; background: rgba(255,255,255,0.5); border-radius: 12px; color: var(--primary-blue);">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width: 4rem; height: 4rem;"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path><line x1="3" y1="6" x2="21" y2="6"></line><path d="M16 10a4 4 0 0 1-8 0"></path></svg>
            </div>
          </div>
        </section>

        <!-- Centered Highlight Text -->
        <section class="highlight-text-container">
          <h3 class="highlight-text">
            POUR ÊTRE ADMIS À L'ENREGISTREMENT, LE DESSIN OU MODÈLE INDUSTRIEL DOIT ÊTRE NOUVEAU OU ORIGINAL ET NE DOIT PAS ÊTRE FONCTIONNEL
          </h3>
        </section>

        <!-- Section 3: Que faire pour demander l'enregistrement... -->
        <section class="steps-section glass">
          <h3 class="text-orange text-center mb-30">Que faire pour demander l'enregistrement d'un dessin ou modèle industriel ?</h3>
          <div class="row-section">
            <div class="icon-circle large-icon dark-blue">
              <svg viewBox="0 0 24 24" fill="currentColor" class="w-12 h-12"><path d="M14 2H6C4.897 2 4 2.897 4 4V20C4 21.103 4.897 22 6 22H18C19.103 22 20 21.103 20 20V8L14 2ZM18 20H6V4H13V9H18V20Z"/></svg>
            </div>
            <div class="green-box">
              <ul class="styled-list no-bullet">
                <li><strong>- Remplir 3 exemplaires du formulaire de dépôt.</strong></li>
                <li><strong>- Fournir trois photos du dessin ou modèle signées au verso et à mettre dans une enveloppe.</strong></li>
                <li><strong>- Fournir trois exemplaires d'une légende explicative du dessin ou modèle.</strong></li>
                <li><strong>- Payer les taxes prescrites.</strong></li>
              </ul>
            </div>
          </div>
        </section>
      </div>

      <!-- Taxes de dépôt D.M -->
      <div v-else-if="activeTab === 'Taxes de dépôt D.M'" class="fade-in">
        <h2 class="text-center mb-40" style="color: var(--primary-blue);">Taxes en matière de Dessins et Modèles Industriels</h2>
        <div class="glass" style="padding: 40px; text-align: center; border-radius: 12px; max-width: 800px; margin: 0 auto;">
          <h3 class="mb-20 text-orange">BARÈME DES TAXES (Arrêté n° 12285/2013)</h3>
          <p class="mb-30" style="color: var(--text-dark); line-height: 1.6;">
            Les taxes relatives au dépôt et au maintien en vigueur des dessins et modèles industriels sont définies par le barème officiel de l'OMAPI. 
          </p>
          <p style="color: var(--text-light); font-style: italic;">
            (Le tableau détaillé des taxes D.M sera bientôt disponible en ligne. Veuillez contacter l'OMAPI pour plus de détails ou vous référer au barème officiel.)
          </p>
        </div>
      </div>

      <!-- Classification de Locarno -->
      <div v-else-if="activeTab === 'Classification de Locarno'" class="fade-in">
        <div class="text-center pct-section">
          <div class="pct-card glass">
            <div class="wipo-logo mb-20" style="background: #e8955d;">Classification de Locarno</div>
            <h2 class="mb-20" style="color: var(--primary-blue);">Classification Internationale</h2>
            <p class="mb-30" style="max-width: 700px; margin: 0 auto 30px auto; line-height: 1.6; color: var(--text-dark);">
              La classification de Locarno est une classification internationale utilisée pour l'enregistrement des dessins et modèles industriels.
            </p>
            <a href="http://www.wipo.int/classifications/locarno/locpub/en/fr/?lang=fr&menulang=fr" target="_blank" class="wipo-btn glass-hover" style="background: #e8955d;">
              Consulter la Classification sur l'OMPI
            </a>
          </div>
        </div>
      </div>

      <!-- Procédure de dépôt D.M -->
      <div v-else-if="activeTab === 'Procédure de dépôt D.M'" class="fade-in">
        <div class="procedure-section text-center">
          <h2 class="mb-30" style="color: var(--primary-blue);">Procédure de traitement des demandes</h2>
          <p class="mb-30" style="color: var(--text-dark);">Procédure de traitement des demandes d'enregistrement des dessins et modèles.</p>
          <div class="infographic-container mb-30">
            <div class="placeholder-infographic">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon-large" style="width: 4rem; height: 4rem; margin-bottom: 15px; color: var(--secondary-blue);"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>
              <p>Schéma interactif ou infographie à venir</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Formulaire D.M -->
      <div v-else-if="activeTab === 'Formulaire D.M'" class="fade-in">
        <h2 class="text-center mb-40" style="color: var(--primary-blue);">Formulaires en matière des Dessins ou Modèles Industriels</h2>
        <p class="text-center mb-30 text-light-grey">Cliquez sur un document pour télécharger le formulaire de votre choix.</p>
        <div class="docs-grid">
          <a href="http://www.omapi.mg/assets/f12_dessmod_multi.doc" target="_blank" class="doc-card glass-hover">
            <div class="doc-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width: 24px; height: 24px; color: var(--secondary-blue);"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line></svg></div>
            <div class="doc-title">DEMANDE D'ENREGISTREMENT D'UN DESSIN OU MODÈLE (multiple)</div>
          </a>
          <a href="http://www.omapi.mg/assets/n_f12_dess__mod_simplertf.rtf" target="_blank" class="doc-card glass-hover">
            <div class="doc-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width: 24px; height: 24px; color: var(--secondary-blue);"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line></svg></div>
            <div class="doc-title">DEMANDE D'ENREGISTREMENT D'UN DESSIN OU MODÈLE (simple)</div>
          </a>
          <a href="http://www.omapi.mg/assets/n_13_renouvellement_enregistrement_d_m.rtf" target="_blank" class="doc-card glass-hover">
            <div class="doc-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width: 24px; height: 24px; color: var(--secondary-blue);"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line></svg></div>
            <div class="doc-title">DEMANDE DE RENOUVELLEMENT D'UN DESSIN OU MODÈLE</div>
          </a>
          <a href="http://www.omapi.mg/assets/n_3_inscription_modification.doc" target="_blank" class="doc-card glass-hover">
            <div class="doc-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width: 24px; height: 24px; color: var(--secondary-blue);"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line></svg></div>
            <div class="doc-title">DEMANDE D'INSCRIPTION D'UNE MODIFICATION</div>
          </a>
          <a href="http://www.omapi.mg/assets/n_2_concession_de_licence.doc" target="_blank" class="doc-card glass-hover">
            <div class="doc-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width: 24px; height: 24px; color: var(--secondary-blue);"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line></svg></div>
            <div class="doc-title">DEMANDE D'INSCRIPTION D'UNE CONCESSION DE LICENCE</div>
          </a>
          <a href="http://www.omapi.mg/assets/n14_transfert-de-dessin-ou-modele.rtf" target="_blank" class="doc-card glass-hover">
            <div class="doc-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width: 24px; height: 24px; color: var(--secondary-blue);"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line></svg></div>
            <div class="doc-title">DEMANDE DE TRANSFERT DE DESSIN OU MODÈLE</div>
          </a>
        </div>
      </div>

      <!-- Avantages -->
      <div v-else-if="activeTab === 'Avantages'" class="fade-in">
        <h2 class="text-center mb-40" style="color: var(--primary-blue);">Comment protéger un dessin ou modèle industriel ?</h2>
        <div class="protection-section">
          <div class="bordered-box">
            <h4>Protection Légale à Madagascar</h4>
            <p>Pour bénéficier d'une protection légale à Madagascar, un dessin ou modèle industriel doit être enregistré auprès de l'Office Malgache de la Propriété Industrielle (OMAPI) conformément à l'ordonnance n° 89-019 du 31 juillet 1989 instituant un régime pour la protection de la propriété industrielle et les décrets d'application y subséquents (décrets n° 92-993 et n° 92-994 du 2 décembre 1992).</p>
          </div>

          <div class="bottom-legal-text glass">
            <h4 class="mb-20 text-orange">Les Avantages de l'Enregistrement</h4>
            <p>L'enregistrement du dessin ou modèle industriel confère à son titulaire le droit d'interdire aux tiers l'exploitation du dessin ou modèle industriel (fabrication/reproduction, imitation, vente, importation, etc.) sans son autorisation.</p>
            <p>La durée de la protection est de <strong>5 ans à compter de la date de dépôt</strong> et peut être prolongée, à la demande, pour 2 périodes successives de 5 ans chacune.</p>
            <p>Si vous constatez qu'un tiers porte atteinte à vos droits (copie non autorisée, contrefaçon, etc.), vous avez le droit de porter l'affaire auprès de la juridiction compétente sur présentation du certificat d'enregistrement du dessin ou modèle.</p>
            <p>Comme toute propriété, vous pouvez céder vos droits attachés au dessin ou modèle enregistré ou accorder à un tiers une licence pour son exploitation (dans ce cas, vous restez titulaire de tous les droits).</p>
          </div>
        </div>
      </div>

    </div>
  </main>
</template>

<style scoped>
.page-container {
  min-height: 80vh;
  padding-bottom: 60px;
}

/* Sub Navigation */
.sub-nav {
  background: var(--white);
  border-bottom: 1px solid rgba(0,0,0,0.05);
  box-shadow: 0 4px 10px rgba(0,0,0,0.02);
  margin-bottom: 30px;
}

.sub-nav-container {
  display: flex;
  justify-content: center;
  overflow-x: auto;
  gap: 20px;
  padding: 0 10px;
}

.sub-nav-container::-webkit-scrollbar { height: 4px; }
.sub-nav-container::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.1); border-radius: 4px; }

.tab-btn {
  background: transparent;
  color: var(--text-light);
  font-weight: 600;
  font-size: 0.95rem;
  padding: 15px 30px;
  white-space: nowrap;
  position: relative;
  transition: all 0.3s;
}

.tab-btn:hover { color: var(--primary-blue); background: rgba(0,0,0,0.02); }
.tab-btn.active { color: var(--primary-blue); }
.tab-btn.active::after {
  content: '';
  position: absolute;
  bottom: 0; left: 0; width: 100%; height: 3px;
  background: var(--accent-orange);
}

/* Image Gallery Placeholder */
.gallery-section {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  margin-bottom: 40px;
}

.image-box {
  height: 200px;
  border-radius: 12px;
  background-size: cover;
  background-position: center;
  box-shadow: 0 5px 15px rgba(0,0,0,0.1);
  transition: transform 0.3s ease;
}

.image-box:hover {
  transform: translateY(-5px);
}

/* Abstract placeholders */
.bg-furniture { background: linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 100%); }
.bg-wood { background: linear-gradient(135deg, #f6d365 0%, #fda085 100%); }
.bg-blueprint { background: linear-gradient(135deg, #a1c4fd 0%, #c2e9fb 100%); }

/* Section Banners */
.section-banner {
  padding: 15px 20px;
  border-radius: 8px 8px 0 0;
  margin-bottom: 0;
}

.section-banner h2 {
  font-size: 1.1rem;
  font-weight: 600;
  margin: 0;
  text-align: center;
  color: var(--white);
}

.dark-banner { background: #5c6c7b; }
.teal-banner { background: #568b94; }

/* Info Rows */
.info-row {
  display: flex;
  align-items: center;
  gap: 30px;
  padding: 40px;
  border-radius: 0 0 8px 8px;
  margin-bottom: 40px;
  background: rgba(255, 255, 255, 0.8);
}

.info-row.reverse {
  flex-direction: row-reverse;
}

.icons-group {
  display: flex;
  gap: 15px;
  flex: 0 0 auto;
}

.icon-circle {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--white);
  box-shadow: 0 8px 20px rgba(0,0,0,0.15);
}

.blue-lock { background: #2b456e; border: 2px dashed rgba(255,255,255,0.5); }
.parcel-icon { background: #dcdfe3; color: #4b5563; }
.dark-blue { background: #274768; }

.large-icon { width: 100px; height: 100px; }

.text-content {
  font-size: 1.05rem;
  line-height: 1.7;
  color: var(--text-dark);
}
.flex-grow { flex: 1; }

.visual-block {
  flex: 0 0 auto;
}

.purse-placeholder {
  font-size: 3rem;
  display: flex;
  gap: 10px;
  padding: 20px;
  background: rgba(255,255,255,0.5);
  border-radius: 12px;
}

/* Thick Divider */
.thick-divider {
  height: 12px;
  background: #00897B;
  width: 100%;
  margin: 40px 0;
}

/* Highlight Text */
.highlight-text-container {
  text-align: center;
  padding: 30px 0;
  margin-bottom: 20px;
}

.highlight-text {
  font-size: 1.3rem;
  font-weight: 700;
  color: var(--text-dark);
  line-height: 1.6;
  max-width: 800px;
  margin: 0 auto;
  letter-spacing: 0.5px;
}

/* Steps Section */
.steps-section {
  padding: 40px;
  border-radius: 16px;
  margin-bottom: 50px;
}

.text-orange { color: #E87A5D; font-size: 1.25rem; font-weight: 600; }
.mb-20 { margin-bottom: 20px; }
.mb-30 { margin-bottom: 30px; }
.mb-40 { margin-bottom: 40px; }

.row-section {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 40px;
}

.green-box {
  background: #39b5b2;
  color: var(--white);
  padding: 25px 35px;
  border-radius: 8px;
  box-shadow: 0 10px 20px rgba(57, 181, 178, 0.3);
  max-width: 700px;
}

.styled-list.no-bullet {
  padding: 0;
  list-style: none;
}

.styled-list.no-bullet li {
  margin-bottom: 10px;
  font-size: 1.05rem;
  line-height: 1.5;
}

/* Bordered Box */
.bordered-box {
  background: #fdfaf6;
  border: 1px solid #e0e0e0;
  border-right: 6px solid #e8955d;
  padding: 30px 40px;
  border-radius: 8px;
  max-width: 800px;
  margin: 0 auto 40px auto;
  text-align: center;
  box-shadow: 0 5px 15px rgba(0,0,0,0.03);
}

.bordered-box h4 {
  font-size: 1.2rem;
  color: var(--text-dark);
  margin-bottom: 15px;
}

.bordered-box p {
  color: var(--text-light);
  line-height: 1.6;
  font-size: 0.95rem;
}

/* Bottom Legal Text */
.bottom-legal-text {
  padding: 30px 40px;
  border-radius: 12px;
  border-left: 4px solid var(--primary-blue);
  max-width: 800px;
  margin: 0 auto;
}

.bottom-legal-text p {
  margin-bottom: 15px;
  font-size: 0.95rem;
  line-height: 1.6;
  color: var(--text-dark);
}

.bottom-legal-text p:last-child {
  margin-bottom: 0;
}

.w-8 { width: 32px; height: 32px; }
.w-12 { width: 48px; height: 48px; }

/* PCT/Classification Section */
.pct-section { padding: 60px 0; }
.pct-card {
  max-width: 800px;
  margin: 0 auto;
  padding: 50px;
  border-radius: 16px;
  border: 1px solid rgba(0,0,0,0.05);
}
.wipo-logo {
  display: inline-block;
  color: white;
  padding: 10px 20px;
  border-radius: 6px;
  font-weight: 800;
  letter-spacing: 1px;
}
.wipo-btn {
  display: inline-block;
  color: white;
  padding: 15px 30px;
  border-radius: 8px;
  text-decoration: none;
  font-weight: bold;
}

/* Formulaire Section */
.docs-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 15px;
}

.doc-card {
  display: flex;
  align-items: center;
  padding: 15px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  text-decoration: none;
  color: #334155;
  transition: all 0.3s ease;
}
.doc-card:hover {
  background: var(--white);
  box-shadow: 0 4px 15px rgba(0, 136, 204, 0.15);
  transform: translateY(-2px);
  border-color: #bae6fd;
}
.doc-icon { font-size: 1.5rem; margin-right: 15px; }
.doc-title { font-size: 0.9rem; font-weight: 500; line-height: 1.4; }
.text-light-grey { color: #64748b; }

/* Procedure Section */
.procedure-section { padding: 40px 0; }
.infographic-container {
  display: flex; justify-content: center; margin: 0 auto;
}
.placeholder-infographic {
  background: #f1f5f9;
  border: 2px dashed #cbd5e1;
  border-radius: 12px;
  width: 100%;
  max-width: 800px;
  height: 400px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: #64748b;
}
.icon-large { font-size: 4rem; margin-bottom: 15px; }

@media (max-width: 992px) {
  .gallery-section { grid-template-columns: 1fr; }
  .info-row, .info-row.reverse, .row-section { flex-direction: column; text-align: center; }
  .icons-group { justify-content: center; }
}
</style>
