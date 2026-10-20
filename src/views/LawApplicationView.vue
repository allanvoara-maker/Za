<script setup lang="ts">
</script>

<template>
  <main class="page-container fade-in">
    
    <!-- Breadcrumb -->
    <div class="container breadcrumb">
      <span class="text-light">OMAPI</span> <span class="separator">/</span> 
      <span class="text-light">Accueil</span> <span class="separator">/</span> 
      <span class="current">Application du droit de propriété industrielle</span>
    </div>

    <!-- Main Content Wrapper -->
    <div class="container content-wrapper">
      
      <!-- Section 1: Title and Image Collage -->
      <section class="title-section glass">
        <div class="title-block">
          <h1 class="main-title text-red">ÉTAPES NÉCESSAIRES AUX FINS DE LA MISE EN APPLICATION DU DROIT DE PROPRIÉTÉ INDUSTRIELLE</h1>
        </div>
        <div class="collage-block">
          <div class="image-grid">
            <div class="grid-img img-1"></div>
            <div class="grid-img img-2"></div>
            <div class="grid-img img-3"></div>
            <div class="grid-img img-4"></div>
            <div class="grid-img img-5"></div>
            <div class="grid-img img-6"></div>
          </div>
        </div>
      </section>

      <!-- Section 2: Intro Text -->
      <section class="text-section mt-30">
        <h3 class="font-bold text-lg mb-15">Vous êtes une entreprise qui possède une invention, une innovation, une création que vous commercialisez ?</h3>
        <p>Effectuer les démarches auprès de l'OMAPI afin d'en obtenir des droits exclusifs d'exploitation de vos inventions, marques, dessins et modèles industriels, ainsi que votre nom commercial sur le marché au moyen d'un titre de propriété industrielle constitue la première étape vers une mise en application de vos droits.</p>
      </section>

      <div class="red-divider"></div>

      <!-- Section 3: Legal Foundation -->
      <section class="text-section">
        <p>En vertu de l'Ordonnance n°89-019 du 31 juillet 1989 instituant un régime pour la protection de la propriété industrielle à Madagascar et le Décret n°92-993 du 02 décembre 1992 en portant application, seul un certificat d'enregistrement ou un brevet d'invention peut conférer le droit exclusif d'interdire aux tiers toute exploitation commerciale de l'actif immatériel enregistré. Il appartient au titulaire de ce droit de déceler toute atteinte et de déclencher toute action en poursuite et aux fins de répression.</p>
      </section>

      <div class="red-divider"></div>

      <!-- Section 4: Actions against fraud/infringement -->
      <section class="text-section">
        <p class="mb-20">Afin de préserver l'exclusivité d'exploitation sur le marché nationale, le titulaire de droits peut demander l'aide des autorités douanières pour prévenir l'importation de marchandises de contrefaçon au moyen d'une demande d'intervention à adresser au Service de la lutte contre la fraude.</p>
        <p>En cas de suspicion de contrefaçon ou de toute autre forme d'atteinte aux droits, vous pouvez déposer plainte auprès de la force de l'ordre (police ou gendarmerie) si vous optez pour la voie pénale, ou déposer une requête afin d'obtenir une ordonnance de perquisition ou de saisie (en vertu de l'article 42 / 85 / 114 de l'Ordonnance n°89-019) auprès du tribunal civil statuant en matière de référé. Dans ce cas, vous devriez introduire une action auprès du tribunal civil ordinaire aux fins de la validation de la saisie et de réparation des préjudices subis. A noter que la procédure en matière de propriété industrielle est l'affaire des parties.</p>
      </section>

      <div class="red-divider"></div>

      <!-- Section 5: Highlighted Penalty Block -->
      <section class="highlight-block glass-blue mt-30 mb-30">
        <p class="text-italic text-blue font-semibold">
          Conformément à la législation actuellement en vigueur, toute atteinte aux droits rattachés à un brevet d'invention, une marque, un dessin ou modèle industriel constitue un délit puni d'une peine d'emprisonnement de six mois à trois ans et/ou d'une amende de 100 000 Ar à 2 000 000 Ar.
        </p>
      </section>

      <!-- Section 6: Guidance & Representatives -->
      <section class="text-section">
        <p class="mb-20">En addition à la délivrance du titre de propriété industrielle, l'OMAPI est là pour vous orienter dans toutes ces démarches. Le cas échéant, la justice et la force de l'ordre peut solliciter l'OMAPI afin d'éclairer sur les dispositions légales nationale en vigueur sur la propriété industrielle ou sur l'étendue des droits découlant du titre de propriété délivré. Dans la même optique, des représentants en propriété industrielle agréés par l'OMAPI peuvent accompagner les titulaire de droits, voire les représenter auprès de la force de l'ordre et de la justice. Ces derniers, communément appelés des "mandataires en propriété industrielle", mettent leurs services au profit des utilisateurs du système de propriété industrielle, se traduisant par leur représentation auprès de l'OMAPI et des instances de mise en application de la loi. La liste annuelle des représentants en propriété industrielle est disponible dans le site web de l'OMAPI au <a href="#" class="text-link">www.omapi.mg</a>.</p>
        <p class="mb-20">Dans tous les cas, il appartient de manière exclusive au juge de statuer sur l'existence ou non de contrefaçon ou de toute autre atteinte à un droit de propriété industrielle.</p>
        <p>Le recours au règlement amiable est aussi admis en matière de propriété industrielle (arbitrage ou médiation) et, avant d'entreprendre toute démarche auprès de la force de l'ordre ou de la justice, vous pouvez envoyer à l'auteur présumé de l'atteinte une lettre de sommation l'invitant à mettre fin à ses activités ou à cesser l'utilisation de vos actifs immatériels sans votre autorisation.</p>
      </section>

      <!-- Bottom Images Section -->
      <section class="bottom-images mt-50">
        <div class="bottom-img-box img-a"></div>
        <div class="bottom-img-box img-b"></div>
        <div class="bottom-img-box img-c"></div>
      </section>

    </div>
  </main>
</template>

<style scoped>
.page-container {
  min-height: 80vh;
  padding-bottom: 60px;
}

/* Breadcrumb */
.breadcrumb {
  padding: 20px 0;
  font-size: 0.85rem;
  font-weight: 500;
  margin-bottom: 10px;
}
.text-light { color: #9ca3af; }
.separator { margin: 0 8px; color: #d1d5db; }
.current { color: var(--primary-blue); font-weight: 600; }

/* Main Wrapper */
.content-wrapper {
  background: var(--white);
  border-radius: 12px;
  padding: 40px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.03);
  margin-bottom: 40px;
}

/* Title Section */
.title-section {
  display: flex;
  align-items: center;
  gap: 40px;
  padding: 30px;
  border-radius: 12px;
  background: #fdfaf9; /* Very subtle warm background */
  border-left: 5px solid #d32f2f;
}

.title-block {
  flex: 1;
}

.main-title {
  font-size: 1.6rem;
  line-height: 1.4;
  font-weight: 700;
  text-transform: uppercase;
}
.text-red { color: #d32f2f; }

.collage-block {
  flex: 0 0 300px;
}

.image-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-template-rows: repeat(2, 80px);
  gap: 5px;
}

.grid-img {
  background-size: cover;
  background-position: center;
  border-radius: 4px;
}
/* Placeholders mimicking the collage */
.img-1 { background: linear-gradient(135deg, #f6d365 0%, #fda085 100%); }
.img-2 { background: linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%); }
.img-3 { background: linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%); }
.img-4 { background: linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%); }
.img-5 { background: linear-gradient(135deg, #a1c4fd 0%, #c2e9fb 100%); }
.img-6 { background: linear-gradient(135deg, #cfd9df 0%, #e2ebf0 100%); }

/* Text Sections */
.text-section p {
  font-size: 1.05rem;
  line-height: 1.7;
  color: #374151;
  text-align: justify;
}

.font-bold { font-weight: 700; color: var(--text-dark); }
.text-lg { font-size: 1.2rem; }
.mb-15 { margin-bottom: 15px; }
.mb-20 { margin-bottom: 20px; }
.mt-30 { margin-top: 30px; }
.mt-50 { margin-top: 50px; }
.mb-30 { margin-bottom: 30px; }

/* Dividers */
.red-divider {
  height: 2px;
  background: #d32f2f;
  width: 100px; /* Short divider like in the image */
  margin: 30px 0;
}

/* Highlight Block */
.highlight-block {
  padding: 25px 35px;
  border-radius: 8px;
  border-left: 4px solid var(--secondary-blue);
}

.glass-blue {
  background: rgba(0, 136, 204, 0.05);
}

.text-italic { font-style: italic; }
.text-blue { color: #1e40af; }
.font-semibold { font-weight: 600; }

.text-link {
  color: var(--secondary-blue);
  text-decoration: underline;
  font-weight: 600;
}

/* Bottom Images */
.bottom-images {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}

.bottom-img-box {
  height: 200px;
  background-size: cover;
  background-position: center;
  border-radius: 8px;
  box-shadow: 0 4px 10px rgba(0,0,0,0.08);
}
.img-a { background: linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 100%); }
.img-b { background: linear-gradient(135deg, #fdfbfb 0%, #ebedee 100%); }
.img-c { background: linear-gradient(135deg, #d4fc79 0%, #96e6a1 100%); }

@media (max-width: 992px) {
  .title-section {
    flex-direction: column;
    text-align: center;
    border-left: none;
    border-top: 5px solid #d32f2f;
  }
  .collage-block {
    flex: 0 0 auto;
    width: 100%;
    max-width: 400px;
  }
  .text-section p {
    text-align: left;
  }
}
@media (max-width: 768px) {
  .bottom-images {
    grid-template-columns: 1fr;
  }
  .content-wrapper {
    padding: 20px;
  }
}
</style>
