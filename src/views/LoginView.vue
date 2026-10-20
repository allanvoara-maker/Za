<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuth } from '../composables/useAuth'

const { login, currentUser } = useAuth()
const route = useRoute()
const router = useRouter()

const email = ref('')
const password = ref('')
const isLoading = ref(false)
const errorMsg = ref('')
const infoMsg = ref('')

onMounted(() => {
  if (route.query.reason === 'timeout') {
    infoMsg.value = 'Votre session a expiré pour des raisons de sécurité. Veuillez vous reconnecter.'
  } else if (route.query.reason === 'session_expired') {
    infoMsg.value = 'Votre session a expiré ou a été invalidée. Veuillez vous reconnecter.'
  }
})

const handleLogin = async () => {
  errorMsg.value = ''
  if (!email.value || !password.value) {
    errorMsg.value = 'Veuillez renseigner votre email et votre mot de passe.'
    return
  }
  isLoading.value = true
  try {
    const success = await login(email.value, password.value)
    isLoading.value = false
    if (!success) {
      errorMsg.value = 'Identifiants invalides. Veuillez réessayer.'
    } else {
      if (currentUser.value && currentUser.value.role === 'admin') {
        router.push({ name: 'admin' })
      } else {
        router.push({ name: 'welcome' })
      }
    }
  } catch (err: any) {
    isLoading.value = false
    if (err.message === 'NETWORK_ERROR') {
      errorMsg.value = 'Impossible de se connecter au serveur. Le service backend est hors ligne ou en cours de démarrage.'
    } else {
      errorMsg.value = 'Une erreur réseau est survenue. Veuillez réessayer.'
    }
  }
}
</script>

<template>
  <main class="login-page">
    <div class="login-container fade-in">

      <div class="login-left bg-windmills">
        <div class="overlay">
          <h2>Portail E-Branding OMAPI</h2>
          <p>Gérez vos dépôts de propriété industrielle en ligne, suivez vos dossiers et protégez vos créations en toute sécurité.</p>
          <div class="divider"></div>
          <p class="small-text">Pour des raisons de sécurité, veuillez vous authentifier avant d'accéder à votre espace privé.</p>
        </div>
      </div>

      <div class="login-right">
        <div class="login-form-container">
          <div class="logo-area mb-40 text-center">
            <h1 class="text-blue">Connexion</h1>
            <p class="text-light-grey">Bienvenue sur votre portail sécurisé</p>
          </div>

          <form @submit.prevent="handleLogin" class="login-form">
            <div class="form-group">
              <label for="email">Adresse Email</label>
              <input
                type="email"
                id="email"
                v-model="email"
                required
                placeholder="Ex: jean.dupont@entreprise.mg"
              >
            </div>

            <div class="form-group mb-30">
              <label for="password">Mot de passe</label>
              <input
                type="password"
                id="password"
                v-model="password"
                required
                placeholder="Votre mot de passe"
              >
            </div>

            <div v-if="infoMsg" class="info-msg" style="display: flex; align-items: center; gap: 8px;">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width: 16px; height: 16px; flex-shrink: 0;"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
              <span>{{ infoMsg }}</span>
            </div>

            <div v-if="errorMsg" class="error-msg" style="display: flex; align-items: center; gap: 8px;">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width: 16px; height: 16px; flex-shrink: 0;"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
              <span>{{ errorMsg }}</span>
            </div>

            <button type="submit" class="btn-login" :disabled="isLoading">
              <span v-if="!isLoading">Se connecter</span>
              <span v-else class="loader"></span>
            </button>
          </form>

          <div class="text-center mt-30">
            <router-link to="/" class="back-link">← Retour au site public</router-link>
            <p class="register-link">Pas encore de compte ? <router-link to="/register">Créer un compte</router-link></p>
          </div>
        </div>
      </div>
    </div>
  </main>
</template>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f1f5f9;
  padding: 20px;
}

.login-container {
  display: flex;
  width: 100%;
  max-width: 1000px;
  min-height: 600px;
  background: var(--white);
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 20px 50px rgba(0,0,0,0.1);
}

.login-left {
  flex: 1;
  position: relative;
  background: linear-gradient(135deg, var(--primary-blue) 0%, #1e3a8a 100%);
  color: white;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
}

.bg-windmills {
  background-image: url('http://www.omapi.mg/assets/fond.jpg');
  background-size: cover;
  background-position: center;
}

.overlay {
  background: linear-gradient(to top, rgba(15, 23, 42, 0.9) 0%, rgba(15, 23, 42, 0.4) 100%);
  padding: 50px 40px;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
}

.overlay h2 {
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 15px;
}

.overlay p {
  font-size: 1.1rem;
  line-height: 1.6;
  opacity: 0.9;
}

.divider {
  height: 2px;
  width: 50px;
  background: var(--accent-orange);
  margin: 20px 0;
}

.small-text {
  font-size: 0.85rem !important;
  opacity: 0.7 !important;
}

.login-right {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
  background: var(--white);
}

.login-form-container {
  width: 100%;
  max-width: 350px;
}

.text-blue { color: var(--primary-blue); font-weight: 800; font-size: 2.2rem; }
.text-light-grey { color: #64748b; margin-top: 5px; }

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  font-weight: 600;
  color: #334155;
  margin-bottom: 8px;
  font-size: 0.9rem;
}

.form-group input {
  width: 100%;
  padding: 14px 15px;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.3s;
  background: #f8fafc;
}

.form-group input:focus {
  outline: none;
  border-color: var(--primary-blue);
  background: var(--white);
  box-shadow: 0 0 0 3px rgba(0, 136, 204, 0.1);
}

.error-msg {
  padding: 10px 14px;
  background: #fff1f2;
  border: 1px solid #fca5a5;
  border-radius: 8px;
  color: #dc2626;
  font-size: 0.88rem;
  margin-bottom: 15px;
}

.info-msg {
  padding: 10px 14px;
  background: #f0f9ff;
  border: 1px solid #bae6fd;
  border-radius: 8px;
  color: #0284c7;
  font-size: 0.88rem;
  margin-bottom: 15px;
}

.btn-login {
  width: 100%;
  padding: 15px;
  background: var(--primary-blue);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1.05rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 52px;
}

.btn-login:hover:not(:disabled) {
  background: #0077b3;
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(0, 136, 204, 0.3);
}

.btn-login:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.loader {
  border: 3px solid rgba(255,255,255,0.3);
  border-radius: 50%;
  border-top: 3px solid white;
  width: 24px;
  height: 24px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.back-link {
  color: #94a3b8;
  text-decoration: none;
  font-size: 0.9rem;
  transition: color 0.3s;
}

.back-link:hover {
  color: var(--primary-blue);
}

.register-link {
  font-size: 0.88rem;
  color: #64748b;
  margin-top: 10px;
}

.register-link a {
  color: #0099cc;
  font-weight: 600;
  text-decoration: none;
}

.register-link a:hover {
  text-decoration: underline;
}

@media (max-width: 768px) {
  .login-container {
    flex-direction: column;
  }
  .login-left {
    min-height: 250px;
    flex: none;
  }
}
</style>
