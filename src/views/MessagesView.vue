<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import axios from 'axios'
import { useAuth } from '../composables/useAuth'

interface Thread {
  id: number
  user_id: number
  subject: string
  category: 'omapi' | 'mandataire' | 'system'
  created_at: string
  client_name?: string
  client_email?: string
  last_message: string
  last_message_date: string
  unread_count: number
}

interface ThreadMessage {
  id: number
  thread_id: number
  sender_id: number | null
  sender_name: string
  content: string
  is_read: number
  created_at: string
}

const threads = ref<Thread[]>([])
const activeThread = ref<Thread | null>(null)
const threadMessages = ref<ThreadMessage[]>([])
const filter = ref<'all' | 'unread' | 'omapi'>('all')
const replyText = ref('')
const isSending = ref(false)
const isLoadingThreads = ref(true)
const isLoadingMessages = ref(false)

const { currentUser } = useAuth()

// New Thread modal state
const showNewThreadModal = ref(false)
const newSubject = ref('')
const newCategory = ref<'omapi' | 'mandataire'>('omapi')
const newContent = ref('')
const isCreatingThread = ref(false)

// Formatting helpers
const formatMessageDate = (dateStr: string) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  const now = new Date()
  
  const isToday = date.getDate() === now.getDate() &&
                  date.getMonth() === now.getMonth() &&
                  date.getFullYear() === now.getFullYear()
                  
  const yesterday = new Date(now)
  yesterday.setDate(now.getDate() - 1)
  const isYesterday = date.getDate() === yesterday.getDate() &&
                      date.getMonth() === yesterday.getMonth() &&
                      date.getFullYear() === yesterday.getFullYear()
                      
  const timeStr = date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
  
  if (isToday) {
    return `Aujourd'hui, ${timeStr}`
  } else if (isYesterday) {
    return `Hier, ${timeStr}`
  } else {
    return `${date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}, ${timeStr}`
  }
}

const getThreadSender = (thread: Thread) => {
  if (currentUser.value?.role === 'admin') {
    return thread.client_name || 'Client inconnu'
  }
  return thread.category === 'omapi' 
    ? 'OMAPI - Division des Marques' 
    : thread.category === 'mandataire' 
      ? 'Me. Rasoamanana (Mandataire agréé)' 
      : 'Système OMAPI'
}

const fetchThreads = async (selectFirst = false) => {
  try {
    isLoadingThreads.value = true
    const res = await axios.get('http://localhost:3000/api/messages')
    threads.value = res.data
    if (selectFirst && threads.value.length > 0) {
      selectThread(threads.value[0])
    } else if (activeThread.value) {
      const updated = threads.value.find(t => t.id === activeThread.value?.id)
      if (updated) activeThread.value = updated
    }
  } catch (error) {
    console.error('Failed to fetch threads:', error)
  } finally {
    isLoadingThreads.value = false
  }
}

const selectThread = async (thread: Thread) => {
  activeThread.value = thread
  threadMessages.value = []
  isLoadingMessages.value = true
  try {
    const res = await axios.get(`http://localhost:3000/api/messages/threads/${thread.id}/messages`)
    threadMessages.value = res.data
    // Update local unread status
    thread.unread_count = 0
  } catch (error) {
    console.error('Failed to fetch messages:', error)
  } finally {
    isLoadingMessages.value = false
  }
}

const sendReply = async () => {
  if (!activeThread.value || !replyText.value.trim() || isSending.value) return
  try {
    isSending.value = true
    await axios.post(`http://localhost:3000/api/messages/threads/${activeThread.value.id}/messages`, {
      content: replyText.value.trim()
    })
    replyText.value = ''
    await selectThread(activeThread.value)
    await fetchThreads()
  } catch (error) {
    console.error('Failed to send message:', error)
  } finally {
    isSending.value = false
  }
}

const createThread = async () => {
  if (!newSubject.value.trim() || !newContent.value.trim() || isCreatingThread.value) return
  try {
    isCreatingThread.value = true
    const res = await axios.post('http://localhost:3000/api/messages/threads', {
      subject: newSubject.value.trim(),
      category: newCategory.value,
      content: newContent.value.trim()
    })
    showNewThreadModal.value = false
    newSubject.value = ''
    newContent.value = ''
    await fetchThreads()
    const newT = threads.value.find(t => t.id === res.data.threadId)
    if (newT) {
      await selectThread(newT)
    }
  } catch (error) {
    console.error('Failed to create thread:', error)
  } finally {
    isCreatingThread.value = false
  }
}

const filteredThreads = computed(() => {
  if (filter.value === 'unread') return threads.value.filter(t => t.unread_count > 0)
  if (filter.value === 'omapi') return threads.value.filter(t => t.category === 'omapi')
  return threads.value
})

onMounted(() => {
  fetchThreads(true)
})
</script>

<template>
  <div class="messages-view fade-in">
    <div class="header-section mb-30">
      <h1 class="page-title text-blue">Messagerie & Support</h1>
      <p class="text-light-grey">Échangez en direct avec nos examinateurs OMAPI et vos mandataires.</p>
    </div>

    <div class="messages-container glass">
      <!-- Sidebar de messagerie -->
      <div class="inbox-sidebar">
        <!-- New thread button for clients -->
        <div class="inbox-new-thread" v-if="currentUser?.role !== 'admin'">
          <button class="btn btn-primary btn-new-thread" @click="showNewThreadModal = true">
            ＋ Nouvelle discussion
          </button>
        </div>

        <div class="inbox-filters">
          <button 
            :class="['filter-btn', { active: filter === 'all' }]" 
            @click="filter = 'all'"
          >
            Tous
          </button>
          <button 
            :class="['filter-btn', { active: filter === 'unread' }]" 
            @click="filter = 'unread'"
          >
            Non lus 
            <span class="badge-count" v-if="threads.filter(t => t.unread_count > 0).length > 0">
              {{ threads.filter(t => t.unread_count > 0).length }}
            </span>
          </button>
          <button 
            :class="['filter-btn', { active: filter === 'omapi' }]" 
            @click="filter = 'omapi'"
          >
            OMAPI
          </button>
        </div>

        <div class="message-list" v-if="!isLoadingThreads">
          <div 
            v-for="thread in filteredThreads" 
            :key="thread.id" 
            :class="['message-item', { unread: thread.unread_count > 0, active: activeThread?.id === thread.id }]"
            @click="selectThread(thread)"
          >
            <div class="item-header">
              <span class="sender">{{ getThreadSender(thread) }}</span>
              <span class="date">{{ formatMessageDate(thread.last_message_date || thread.created_at) }}</span>
            </div>
            <div class="subject">{{ thread.subject }}</div>
            <div class="preview">{{ thread.last_message }}</div>
          </div>
          <div v-if="filteredThreads.length === 0" class="empty-threads">
            Aucune discussion
          </div>
        </div>
        <div class="loading-threads" v-else>
          Chargement...
        </div>
      </div>

      <!-- Détail du message -->
      <div class="message-detail" v-if="activeThread">
        <div class="detail-header">
          <div class="sender-info">
            <div class="avatar">{{ getThreadSender(activeThread)[0] }}</div>
            <div>
              <h3>{{ getThreadSender(activeThread) }}</h3>
              <span class="date" v-if="currentUser?.role === 'admin'">Client: {{ activeThread.client_email }}</span>
              <span class="date" v-else>Support OMAPI</span>
            </div>
          </div>
          <span :class="['category-badge', activeThread.category]">
            {{ activeThread.category === 'omapi' ? 'Officiel OMAPI' : activeThread.category === 'mandataire' ? 'Mandataire' : 'Système' }}
          </span>
        </div>
        
        <div class="detail-subject">
          <h2>{{ activeThread.subject }}</h2>
        </div>

        <div class="detail-body" v-if="!isLoadingMessages">
          <div 
            v-for="msg in threadMessages" 
            :key="msg.id" 
            :class="['message-bubble-wrapper', { 'sent-by-me': msg.sender_id === currentUser?.id }]"
          >
            <div class="message-bubble">
              <div class="bubble-sender" v-if="msg.sender_id !== currentUser?.id">
                {{ msg.sender_name }}
              </div>
              <div class="bubble-content">
                <p v-for="(paragraph, i) in msg.content.split('\n\n')" :key="i">
                  {{ paragraph }}
                </p>
              </div>
              <div class="bubble-date">
                {{ formatMessageDate(msg.created_at) }}
              </div>
            </div>
          </div>
        </div>
        <div class="loading-messages" v-else>
          Chargement de la discussion...
        </div>

        <!-- System category is read-only for clients -->
        <div class="detail-reply" v-if="activeThread.category !== 'system' || currentUser?.role === 'admin'">
          <textarea 
            v-model="replyText"
            placeholder="Rédiger une réponse..." 
            class="reply-textarea"
            @keyup.enter.ctrl="sendReply"
          ></textarea>
          <div class="reply-actions">
            <button class="btn btn-secondary" style="display: inline-flex; align-items: center; gap: 6px;">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="width: 14px; height: 14px;"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"></path></svg>
              Joindre un fichier
            </button>
            <button class="btn btn-primary" @click="sendReply" :disabled="!replyText.trim() || isSending" style="display: inline-flex; align-items: center; gap: 8px;">
              <svg v-if="isSending" class="animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" style="width: 14px; height: 14px; animation: spin 1s linear infinite;"><circle cx="12" cy="12" r="10" stroke="currentColor" stroke-opacity="0.25"></circle><path d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4z" fill="currentColor"></path></svg>
              <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="width: 14px; height: 14px; color: white;"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
              <span>{{ isSending ? 'Envoi...' : 'Envoyer' }}</span>
            </button>
          </div>
        </div>
        <div class="detail-readonly-alert" v-else>
          Cette discussion automatique est en lecture seule.
        </div>
      </div>

      <div class="message-empty" v-else>
        <div class="empty-icon" style="display: flex; align-items: center; justify-content: center; margin-bottom: 15px; color: #94a3b8;">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="width: 64px; height: 64px;"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
        </div>
        <h3>Sélectionnez un message pour l'afficher</h3>
      </div>
    </div>

    <!-- Modal Nouvelle Discussion -->
    <div class="modal-backdrop" v-if="showNewThreadModal" @click.self="showNewThreadModal = false">
      <div class="modal-card glass animate-in">
        <div class="modal-header">
          <h3>Nouvelle discussion</h3>
          <button class="close-btn" @click="showNewThreadModal = false">×</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label>Objet / Sujet</label>
            <input type="text" v-model="newSubject" placeholder="ex: Demande de précision sur mon dossier" class="form-control" />
          </div>
          <div class="form-group">
            <label>Catégorie</label>
            <select v-model="newCategory" class="form-control">
              <option value="omapi">Officiel OMAPI</option>
              <option value="mandataire">Mandataire</option>
            </select>
          </div>
          <div class="form-group">
            <label>Message</label>
            <textarea v-model="newContent" placeholder="Écrivez votre message initial..." class="form-control text-area"></textarea>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" @click="showNewThreadModal = false">Annuler</button>
          <button class="btn btn-primary" @click="createThread" :disabled="!newSubject.trim() || !newContent.trim() || isCreatingThread">
            {{ isCreatingThread ? 'Création...' : 'Créer la discussion' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.page-title {
  font-size: 2rem;
  font-weight: 800;
  margin-bottom: 5px;
}
.text-light-grey { color: #64748b; }
.text-blue { color: var(--primary-blue); }
.mb-30 { margin-bottom: 30px; }

.messages-container {
  display: grid;
  grid-template-columns: 320px 1fr;
  height: calc(100vh - 220px);
  background: white;
  border-radius: 16px;
  overflow: hidden;
  border: 1px solid #e2e8f0;
}

.inbox-sidebar {
  border-right: 1px solid #e2e8f0;
  display: flex;
  flex-direction: column;
  background: #f8fafc;
}

.inbox-new-thread {
  padding: 15px;
  border-bottom: 1px solid #e2e8f0;
  background: white;
}

.btn-new-thread {
  width: 100%;
  justify-content: center;
  display: flex;
  align-items: center;
  gap: 8px;
}

.inbox-filters {
  display: flex;
  gap: 8px;
  padding: 15px;
  border-bottom: 1px solid #e2e8f0;
  background: white;
}

.filter-btn {
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 600;
  color: #64748b;
  background: #f1f5f9;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 5px;
  transition: all 0.2s;
}

.filter-btn.active {
  background: var(--primary-blue);
  color: white;
}

.badge-count {
  background: #ef4444;
  color: white;
  padding: 1px 6px;
  border-radius: 10px;
  font-size: 0.7rem;
}

.message-list {
  flex: 1;
  overflow-y: auto;
}

.message-item {
  padding: 15px 20px;
  border-bottom: 1px solid #e2e8f0;
  cursor: pointer;
  background: white;
  transition: all 0.2s;
}

.message-item:hover {
  background: #f1f5f9;
}

.message-item.active {
  background: #eff6ff;
  border-left: 4px solid var(--primary-blue);
}

.message-item.unread {
  background: #f8fafc;
}

.message-item.unread .sender {
  font-weight: 700;
  color: #0f172a;
}

.message-item.unread .subject {
  font-weight: 700;
  color: #0f172a;
}

.item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
}

.sender {
  font-size: 0.85rem;
  font-weight: 600;
  color: #475569;
  max-width: 170px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.date {
  font-size: 0.75rem;
  color: #94a3b8;
}

.subject {
  font-size: 0.9rem;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.preview {
  font-size: 0.8rem;
  color: #64748b;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.empty-threads, .loading-threads, .loading-messages {
  padding: 30px;
  text-align: center;
  color: #94a3b8;
  font-size: 0.9rem;
}

/* Detail Panel */
.message-detail {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: white;
}

.detail-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 30px;
  border-bottom: 1px solid #e2e8f0;
}

.sender-info {
  display: flex;
  align-items: center;
  gap: 15px;
}

.avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: var(--accent-orange);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 1.1rem;
}

.detail-header h3 {
  font-size: 1rem;
  color: #1e293b;
  margin-bottom: 2px;
}

.category-badge {
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 0.78rem;
  font-weight: 600;
}

.category-badge.omapi { background: #dbeafe; color: #1e40af; }
.category-badge.mandataire { background: #fef3c7; color: #92400e; }
.category-badge.system { background: #fee2e2; color: #991b1b; }

.detail-subject {
  padding: 20px 30px;
  border-bottom: 1px solid #f1f5f9;
}

.detail-subject h2 {
  font-size: 1.3rem;
  color: #0f172a;
}

.detail-body {
  flex: 1;
  padding: 30px;
  overflow-y: auto;
  font-size: 0.95rem;
  color: #334155;
  background: #f8fafc;
}

/* Chat Bubbles styling */
.message-bubble-wrapper {
  display: flex;
  margin-bottom: 18px;
  width: 100%;
}

.message-bubble-wrapper.sent-by-me {
  justify-content: flex-end;
}

.message-bubble {
  max-width: 70%;
  padding: 12px 16px;
  border-radius: 12px;
  background: white;
  color: #1e293b;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
  border: 1px solid #e2e8f0;
}

.message-bubble-wrapper.sent-by-me .message-bubble {
  background: var(--primary-blue);
  color: white;
  border-bottom-right-radius: 2px;
  border-color: var(--primary-blue);
}

.message-bubble-wrapper:not(.sent-by-me) .message-bubble {
  border-bottom-left-radius: 2px;
}

.bubble-sender {
  font-size: 0.75rem;
  font-weight: 700;
  margin-bottom: 4px;
  color: #4f46e5;
}

.bubble-content p {
  margin: 0 0 8px 0;
}
.bubble-content p:last-child {
  margin-bottom: 0;
}

.bubble-date {
  font-size: 0.68rem;
  color: #94a3b8;
  text-align: right;
  margin-top: 5px;
}

.message-bubble-wrapper.sent-by-me .bubble-date {
  color: rgba(255, 255, 255, 0.75);
}

.detail-reply {
  padding: 20px 30px;
  border-top: 1px solid #e2e8f0;
  background: #f8fafc;
}

.detail-readonly-alert {
  padding: 20px;
  text-align: center;
  background: #fff1f2;
  color: #9f1239;
  font-size: 0.85rem;
  font-weight: 600;
  border-top: 1px solid #ffe4e6;
}

.reply-textarea {
  width: 100%;
  height: 80px;
  padding: 12px;
  border-radius: 8px;
  border: 1px solid #cbd5e1;
  resize: none;
  font-family: inherit;
  font-size: 0.9rem;
  margin-bottom: 10px;
  outline: none;
}

.reply-textarea:focus {
  border-color: var(--primary-blue);
}

.reply-actions {
  display: flex;
  justify-content: space-between;
}

.btn {
  padding: 8px 16px;
  border-radius: 6px;
  font-weight: 600;
  font-size: 0.9rem;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-primary {
  background: var(--primary-blue);
  color: white;
}
.btn-primary:hover {
  opacity: 0.9;
}
.btn-primary:disabled {
  background: #94a3b8;
  cursor: not-allowed;
}

.btn-secondary {
  background: #e2e8f0;
  color: #475569;
}
.btn-secondary:hover {
  background: #cbd5e1;
}

.message-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #94a3b8;
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 15px;
}

/* Modal styling */
.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(15, 23, 42, 0.45);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
}

.modal-card {
  background: white;
  width: 480px;
  max-width: 90%;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  overflow: hidden;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
}

.modal-header {
  padding: 16px 20px;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.modal-header h3 {
  margin: 0;
  font-size: 1.15rem;
  color: #0f172a;
}
.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #64748b;
}

.modal-body {
  padding: 20px;
}

.form-group {
  margin-bottom: 16px;
}
.form-group label {
  display: block;
  font-size: 0.82rem;
  font-weight: 600;
  color: #475569;
  margin-bottom: 6px;
}
.form-control {
  width: 100%;
  padding: 10px;
  border-radius: 6px;
  border: 1px solid #cbd5e1;
  font-family: inherit;
  font-size: 0.9rem;
  outline: none;
}
.form-control:focus {
  border-color: var(--primary-blue);
}
.text-area {
  height: 100px;
  resize: none;
}

.modal-footer {
  padding: 16px 20px;
  background: #f8fafc;
  border-top: 1px solid #e2e8f0;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.animate-in {
  animation: scaleUp 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes scaleUp {
  from {
    transform: scale(0.95);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}

@media (max-width: 900px) {
  .messages-container {
    grid-template-columns: 1fr;
  }
  .inbox-sidebar {
    display: none;
  }
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>
