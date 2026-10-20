<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'

const router = useRouter()
const API_URL = 'http://localhost:3000/api'

const name = ref('')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const isLoading = ref(false)
const errorMsg = ref('')
const successMsg = ref('')

const handleRegister = async () => {
  errorMsg.value = ''
  if (!name.value.trim() || !email.value.trim() || !password.value) {
    errorMsg.value = 'Tous les champs sont obligatoires.'
    return
  }
  if (!email.value.includes('@')) {
    errorMsg.value = 'Veuillez saisir une adresse email valide.'
    return
  }
  if (password.value.length < 6) {
    errorMsg.value = 'Le mot de passe doit contenir au moins 6 caractères.'
    return
  }
  if (password.value !== confirmPassword.value) {
    errorMsg.value = 'Les mots de passe ne correspondent pas.'
    return
  }

  isLoading.value = true
  try {
    await axios.post(`${API_URL}/auth/register`, {
      name: name.value.trim(),
      email: email.value.trim(),
      password: password.value
    })
    successMsg.value = 'Compte créé avec succès ! Vous allez être redirigé...'
    setTimeout(() => router.push('/login'), 2000)
  } catch (err: any) {
    errorMsg.value = err?.response?.data?.message || 'Erreur lors de la création du compte.'
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <main class="register-page">
    <div class="register-container fade-in">

      <!-- Left branding panel -->
      <div class="register-left">
        <div class="overlay">
          <div class="brand-logo">OMAPI</div>
          <h2>Rejoignez le Portail E-Branding</h2>
          <p>Créez votre compte pour déposer et gérer vos demandes de propriété industrielle en toute sécurité.</p>
          <div class="divider"></div>
          <div class="features">
            <div class="feature-item" style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px;">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" style="width: 14px; height: 14px; color: #06d6a0; flex-shrink: 0;"><polyline points="20 6 9 17 4 12"></polyline></svg>
              <span>Dépôt en ligne de marques et brevets</span>
            </div>
            <div class="feature-item" style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px;">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" style="width: 14px; height: 14px; color: #06d6a0; flex-shrink: 0;"><polyline points="20 6 9 17 4 12"></polyline></svg>
              <span>Suivi en temps réel de vos dossiers</span>
            </div>
            <div class="feature-item" style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px;">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" style="width: 14px; height: 14px; color: #06d6a0; flex-shrink: 0;"><polyline points="20 6 9 17 4 12"></polyline></svg>
              <span>Notifications automatiques</span>
            </div>
            <div class="feature-item" style="display: flex; align-items: center; gap: 8px;">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" style="width: 14px; height: 14px; color: #06d6a0; flex-shrink: 0;"><polyline points="20 6 9 17 4 12"></polyline></svg>
              <span>Accès sécurisé à tout moment</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Right form panel -->
      <div class="register-right">
        <div class="register-form-container">
          <div class="logo-area mb-30 text-center">
            <h1 class="text-blue">Créer un compte</h1>
            <p class="text-light-grey">Accédez à votre espace propriété industrielle</p>
          </div>

          <div v-if="successMsg" class="success-banner" style="display: flex; align-items: center; gap: 8px;">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="width: 16px; height: 16px; flex-shrink: 0;"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
            <span>{{ successMsg }}</span>
          </div>

          <div v-if="errorMsg" class="error-banner" style="display: flex; align-items: center; gap: 8px;">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="width: 16px; height: 16px; flex-shrink: 0;"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
            <span>{{ errorMsg }}</span>
          </div>

          <form @submit.prevent="handleRegister" class="register-form">
            <div class="form-group">
              <label for="reg-name">Nom complet</label>
              <input
                id="reg-name"
                v-model="name"
                type="text"
                placeholder="Ex: Jean Rakoto"
                autocomplete="name"
                :disabled="isLoading"
              >
            </div>

            <div class="form-group">
              <label for="reg-email">Adresse email</label>
              <input
                id="reg-email"
                v-model="email"
                type="email"
                placeholder="exemple@email.com"
                autocomplete="email"
                :disabled="isLoading"
              >
            </div>

            <div class="form-group">
              <label for="reg-password">Mot de passe</label>
              <input
                id="reg-password"
                v-model="password"
                type="password"
                placeholder="Minimum 6 caractères"
                autocomplete="new-password"
                :disabled="isLoading"
              >
            </div>

            <div class="form-group">
              <label for="reg-confirm">Confirmer le mot de passe</label>
              <input
                id="reg-confirm"
                v-model="confirmPassword"
                type="password"
                placeholder="Répétez votre mot de passe"
                autocomplete="new-password"
                :disabled="isLoading"
              >
            </div>

            <button type="submit" class="btn-login" :disabled="isLoading">
              <span v-if="isLoading">⏳ Création en cours...</span>
              <span v-else>Créer mon compte →</span>
            </button>

            <p class="login-link">
              Vous avez déjà un compte ?
              <router-link to="/login">Se connecter</router-link>
            </p>
          </form>
        </div>
      </div>
    </div>
  </main>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

* { font-family: 'Inter', sans-serif; box-sizing: border-box; }

.register-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #0f172a 0%, #1e3a5f 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.register-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  width: 100%;
  max-width: 980px;
  min-height: 620px;
  border-radius: 24px;
  overflow: hidden;
  box-shadow: 0 30px 80px rgba(0,0,0,0.4);
}

/* Left panel */
.register-left {
  background: linear-gradient(160deg, #0099cc 0%, #005f8e 60%, #003d66 100%);
  position: relative;
  padding: 50px 40px;
  display: flex;
  align-items: center;
}

.overlay {
  color: white;
}

.brand-logo {
  font-size: 1.5rem;
  font-weight: 900;
  letter-spacing: 2px;
  color: rgba(255,255,255,0.6);
  margin-bottom: 30px;
}

.overlay h2 {
  font-size: 1.7rem;
  font-weight: 800;
  margin-bottom: 15px;
  line-height: 1.3;
}

.overlay p {
  color: rgba(255,255,255,0.8);
  font-size: 0.95rem;
  line-height: 1.6;
}

.divider {
  height: 2px;
  background: rgba(255,255,255,0.2);
  margin: 25px 0;
  border-radius: 2px;
}

.features { display: flex; flex-direction: column; gap: 10px; }
.feature-item {
  color: rgba(255,255,255,0.85);
  font-size: 0.9rem;
  font-weight: 500;
}

/* Right panel */
.register-right {
  background: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 50px 40px;
}

.register-form-container { width: 100%; max-width: 380px; }

.text-blue { color: #0099cc; font-size: 1.8rem; font-weight: 800; margin: 0; }
.text-light-grey { color: #94a3b8; margin: 5px 0 0; font-size: 0.9rem; }
.mb-30 { margin-bottom: 30px; }
.text-center { text-align: center; }

.success-banner {
  background: #dcfce7;
  color: #16a34a;
  border: 1px solid #86efac;
  padding: 12px 16px;
  border-radius: 10px;
  font-size: 0.9rem;
  font-weight: 600;
  margin-bottom: 20px;
}

.error-banner {
  background: #fef2f2;
  color: #ef4444;
  border: 1px solid #fca5a5;
  padding: 12px 16px;
  border-radius: 10px;
  font-size: 0.9rem;
  font-weight: 600;
  margin-bottom: 20px;
}

.register-form { display: flex; flex-direction: column; gap: 16px; }

.form-group { display: flex; flex-direction: column; gap: 6px; }

.form-group label {
  font-size: 0.85rem;
  font-weight: 600;
  color: #374151;
}

.form-group input {
  padding: 12px 14px;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  font-size: 0.95rem;
  outline: none;
  transition: border-color 0.2s;
  background: #f8fafc;
  color: #0f172a;
}

.form-group input:focus { border-color: #0099cc; background: white; box-shadow: 0 0 0 3px rgba(0,153,204,0.1); }
.form-group input:disabled { opacity: 0.6; cursor: not-allowed; }

.btn-login {
  width: 100%;
  padding: 14px;
  background: linear-gradient(135deg, #0099cc, #0077a3);
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
  margin-top: 6px;
}

.btn-login:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(0,153,204,0.35); }
.btn-login:disabled { opacity: 0.7; cursor: not-allowed; }

.login-link {
  text-align: center;
  font-size: 0.88rem;
  color: #64748b;
  margin-top: 8px;
}

.login-link a { color: #0099cc; font-weight: 600; text-decoration: none; }
.login-link a:hover { text-decoration: underline; }

@keyframes fade-in { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: none; } }
.fade-in { animation: fade-in 0.5s ease; }

@media (max-width: 700px) {
  .register-container { grid-template-columns: 1fr; }
  .register-left { display: none; }
}
</style>
