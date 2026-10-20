<script setup lang="ts">
import { ref, onMounted } from 'vue'
import axios from 'axios'
import { useAuth } from '../composables/useAuth'

const { currentUser } = useAuth()
const API_URL = 'http://localhost:3000/api'

// Profile form
const name = ref('')
const email = ref('')
const profileLoading = ref(false)
const profileSuccess = ref('')
const profileError = ref('')

// Password form
const currentPassword = ref('')
const newPassword = ref('')
const confirmPassword = ref('')
const pwdLoading = ref(false)
const pwdSuccess = ref('')
const pwdError = ref('')

onMounted(async () => {
  try {
    const res = await axios.get(`${API_URL}/users/me`)
    name.value = res.data.name
    email.value = res.data.email
  } catch {
    name.value = currentUser.value?.name || ''
    email.value = currentUser.value?.email || ''
  }
})

const saveProfile = async () => {
  profileError.value = ''
  profileSuccess.value = ''
  if (!name.value.trim() || !email.value.trim()) {
    profileError.value = 'Le nom et l\'email sont obligatoires.'
    return
  }
  profileLoading.value = true
  try {
    const res = await axios.put(`${API_URL}/users/me`, { name: name.value, email: email.value })
    // Update the cached user in localStorage
    const stored = JSON.parse(localStorage.getItem('portalUser') || '{}')
    stored.name = res.data.user.name
    stored.email = res.data.user.email
    stored.initials = res.data.user.name.substring(0, 2).toUpperCase()
    localStorage.setItem('portalUser', JSON.stringify(stored))
    currentUser.value = stored
    profileSuccess.value = 'Profil mis à jour avec succès !'
  } catch (err: any) {
    profileError.value = err?.response?.data?.message || 'Erreur lors de la mise à jour.'
  } finally {
    profileLoading.value = false
  }
}

const changePassword = async () => {
  pwdError.value = ''
  pwdSuccess.value = ''
  if (!currentPassword.value || !newPassword.value || !confirmPassword.value) {
    pwdError.value = 'Tous les champs de mot de passe sont requis.'
    return
  }
  if (newPassword.value.length < 6) {
    pwdError.value = 'Le nouveau mot de passe doit contenir au moins 6 caractères.'
    return
  }
  if (newPassword.value !== confirmPassword.value) {
    pwdError.value = 'Les nouveaux mots de passe ne correspondent pas.'
    return
  }
  pwdLoading.value = true
  try {
    await axios.put(`${API_URL}/users/me`, {
      name: name.value,
      email: email.value,
      currentPassword: currentPassword.value,
      newPassword: newPassword.value
    })
    pwdSuccess.value = 'Mot de passe modifié avec succès !'
    currentPassword.value = ''
    newPassword.value = ''
    confirmPassword.value = ''
  } catch (err: any) {
    pwdError.value = err?.response?.data?.message || 'Erreur lors du changement de mot de passe.'
  } finally {
    pwdLoading.value = false
  }
}
</script>

<template>
  <div class="settings-view">
    <div class="page-header mb-30">
      <h1 style="display: inline-flex; align-items: center; gap: 8px;">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width: 24px; height: 24px; color: #0A3A6A;"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
        Paramètres du compte
      </h1>
      <p class="subtitle">Gérez votre profil et votre sécurité</p>
    </div>

    <div class="settings-grid">

      <!-- Profile Card -->
      <div class="settings-card">
        <div class="card-header">
          <div class="avatar">{{ currentUser?.initials || '??' }}</div>
          <div>
            <h2>Informations personnelles</h2>
            <p class="card-subtitle">Modifiez votre nom et votre adresse email</p>
          </div>
        </div>

        <div v-if="profileSuccess" class="alert alert-success" style="display: flex; align-items: center; gap: 8px;">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="width: 16px; height: 16px; color: #16a34a; flex-shrink: 0;"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
          <span>{{ profileSuccess }}</span>
        </div>
        <div v-if="profileError" class="alert alert-error" style="display: flex; align-items: center; gap: 8px;">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="width: 16px; height: 16px; color: #ef4444; flex-shrink: 0;"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
          <span>{{ profileError }}</span>
        </div>

        <form @submit.prevent="saveProfile" class="settings-form">
          <div class="form-group">
            <label>Nom complet</label>
            <input v-model="name" type="text" placeholder="Votre nom" :disabled="profileLoading">
          </div>
          <div class="form-group">
            <label>Adresse email</label>
            <input v-model="email" type="email" placeholder="votre@email.com" :disabled="profileLoading">
          </div>
          <div class="form-group">
            <label>Rôle</label>
            <input :value="currentUser?.role === 'admin' ? 'Administrateur' : 'Client'" type="text" disabled class="readonly-field">
          </div>
          <button type="submit" class="btn btn-primary" :disabled="profileLoading" style="display: inline-flex; align-items: center; gap: 8px;">
            <svg v-if="profileLoading" class="animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" style="width: 16px; height: 16px; animation: spin 1s linear infinite;"><circle cx="12" cy="12" r="10" stroke="currentColor" stroke-opacity="0.25"></circle><path d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4z" fill="currentColor"></path></svg>
            <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="width: 16px; height: 16px;"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg>
            {{ profileLoading ? 'Enregistrement...' : 'Enregistrer les modifications' }}
          </button>
        </form>
      </div>

      <!-- Password Card -->
      <div class="settings-card">
        <div class="card-header">
          <div class="avatar avatar-purple" style="display: flex; align-items: center; justify-content: center;">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="width: 22px; height: 22px; color: #ffffff;"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
          </div>
          <div>
            <h2>Sécurité</h2>
            <p class="card-subtitle">Changez votre mot de passe</p>
          </div>
        </div>

        <div v-if="pwdSuccess" class="alert alert-success" style="display: flex; align-items: center; gap: 8px;">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="width: 16px; height: 16px; color: #16a34a; flex-shrink: 0;"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
          <span>{{ pwdSuccess }}</span>
        </div>
        <div v-if="pwdError" class="alert alert-error" style="display: flex; align-items: center; gap: 8px;">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="width: 16px; height: 16px; color: #ef4444; flex-shrink: 0;"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
          <span>{{ pwdError }}</span>
        </div>

        <form @submit.prevent="changePassword" class="settings-form">
          <div class="form-group">
            <label>Mot de passe actuel</label>
            <input v-model="currentPassword" type="password" placeholder="••••••••" :disabled="pwdLoading">
          </div>
          <div class="form-group">
            <label>Nouveau mot de passe</label>
            <input v-model="newPassword" type="password" placeholder="Minimum 6 caractères" :disabled="pwdLoading">
          </div>
          <div class="form-group">
            <label>Confirmer le nouveau mot de passe</label>
            <input v-model="confirmPassword" type="password" placeholder="Répétez le nouveau mot de passe" :disabled="pwdLoading">
          </div>
          <button type="submit" class="btn btn-primary" :disabled="pwdLoading" style="display: inline-flex; align-items: center; gap: 8px;">
            <svg v-if="pwdLoading" class="animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" style="width: 16px; height: 16px; animation: spin 1s linear infinite;"><circle cx="12" cy="12" r="10" stroke="currentColor" stroke-opacity="0.25"></circle><path d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4z" fill="currentColor"></path></svg>
            <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="width: 16px; height: 16px;"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
            {{ pwdLoading ? 'Modification...' : 'Changer le mot de passe' }}
          </button>
        </form>
      </div>

      <!-- Info Card -->
      <div class="settings-card info-card">
        <h2 style="display: inline-flex; align-items: center; gap: 8px;">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="width: 20px; height: 20px; color: #0099cc;"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
          À propos du portail
        </h2>
        <div class="info-list">
          <div class="info-row">
            <span class="info-key">Application</span>
            <span class="info-val">OMAPI Portail E-Branding</span>
          </div>
          <div class="info-row">
            <span class="info-key">Version</span>
            <span class="info-val">1.0.0</span>
          </div>
          <div class="info-row">
            <span class="info-key">Support</span>
            <span class="info-val">
              <a href="mailto:support@omapi.mg">support@omapi.mg</a>
            </span>
          </div>
          <div class="info-row">
            <span class="info-key">Téléphone</span>
            <span class="info-val">+261 20 22 434 19</span>
          </div>
          <div class="info-row">
            <span class="info-key">Adresse</span>
            <span class="info-val">Antananarivo, Madagascar</span>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<style scoped>
.settings-view {
  padding: 30px;
  min-height: 100vh;
  background: #f8fafc;
}

.page-header h1 {
  font-size: 1.8rem;
  color: #0f172a;
  font-weight: 800;
  margin: 0 0 5px;
}

.subtitle { color: #64748b; margin: 0; }
.mb-30 { margin-bottom: 30px; }

.settings-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
}

.settings-card {
  background: white;
  border-radius: 16px;
  padding: 30px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.05);
  border: 1px solid #e2e8f0;
}

.info-card {
  grid-column: 1 / -1;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 25px;
  padding-bottom: 20px;
  border-bottom: 1px solid #f1f5f9;
}

.card-header h2 {
  font-size: 1.1rem;
  color: #0f172a;
  font-weight: 700;
  margin: 0 0 4px;
}

.card-subtitle {
  font-size: 0.85rem;
  color: #94a3b8;
  margin: 0;
}

.avatar {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: linear-gradient(135deg, #0099cc, #005f8e);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  font-size: 1.1rem;
  flex-shrink: 0;
}

.avatar-purple {
  background: linear-gradient(135deg, #9333ea, #6b21a8);
  font-size: 1.4rem;
}

/* Form */
.settings-form { display: flex; flex-direction: column; gap: 16px; }

.form-group { display: flex; flex-direction: column; gap: 6px; }

.form-group label {
  font-size: 0.82rem;
  font-weight: 700;
  color: #374151;
  text-transform: uppercase;
  letter-spacing: 0.4px;
}

.form-group input {
  padding: 11px 14px;
  border: 1px solid #e2e8f0;
  border-radius: 9px;
  font-size: 0.95rem;
  background: #f8fafc;
  color: #0f172a;
  outline: none;
  transition: border-color 0.2s;
}

.form-group input:focus { border-color: #0099cc; background: white; box-shadow: 0 0 0 3px rgba(0,153,204,0.1); }
.form-group input:disabled { opacity: 0.6; cursor: not-allowed; }
.readonly-field { background: #f1f5f9 !important; cursor: default; }

/* Alerts */
.alert {
  padding: 11px 16px;
  border-radius: 9px;
  font-size: 0.9rem;
  font-weight: 600;
  margin-bottom: 16px;
}

.alert-success { background: #dcfce7; color: #16a34a; border: 1px solid #86efac; }
.alert-error   { background: #fef2f2; color: #ef4444; border: 1px solid #fca5a5; }

/* Button */
.btn {
  padding: 12px 20px;
  border-radius: 9px;
  font-weight: 700;
  font-size: 0.95rem;
  cursor: pointer;
  border: none;
  transition: all 0.2s;
}

.btn-primary {
  background: linear-gradient(135deg, #0099cc, #0077a3);
  color: white;
  align-self: flex-start;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 18px rgba(0,153,204,0.3);
}

.btn-primary:disabled { opacity: 0.65; cursor: not-allowed; }

/* Info list */
.info-list { display: flex; flex-direction: column; gap: 12px; }

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;
  border-bottom: 1px solid #f1f5f9;
  font-size: 0.9rem;
}

.info-row:last-child { border-bottom: none; }

.info-key { color: #64748b; font-weight: 600; }
.info-val { color: #0f172a; font-weight: 600; }
.info-val a { color: #0099cc; text-decoration: none; }
.info-val a:hover { text-decoration: underline; }

@media (max-width: 768px) {
  .settings-grid { grid-template-columns: 1fr; }
  .info-card { grid-column: auto; }
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>
