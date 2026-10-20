<script setup lang="ts">
import { ref, computed } from 'vue'
import { useApplicationStore } from '../stores/applicationStore'

interface Invoice {
  id: string
  label: string
  amount: string
  date: string
  dueDate: string
  status: 'paye' | 'en_attente' | 'retard'
  type: 'Taxe de dépôt' | 'Annuité brevet' | 'Publication'
}

const store = useApplicationStore()

const invoices = ref<Invoice[]>([
  {
    id: 'FAC-2026-0043',
    label: 'Dépôt de marque "AeroTech Madagascar"',
    amount: '150 000 Ar',
    date: '30/05/2026',
    dueDate: '30/06/2026',
    status: 'en_attente',
    type: 'Taxe de dépôt'
  },
  {
    id: 'FAC-2026-0012',
    label: 'Publication GOPI - Brevet BR-2026-008',
    amount: '75 000 Ar',
    date: '15/04/2026',
    dueDate: '15/05/2026',
    status: 'paye',
    type: 'Publication'
  },
  {
    id: 'FAC-2025-0988',
    label: 'Maintien en vigueur (Annuité 5) - Brevet BR-2021-042',
    amount: '120 000 Ar',
    date: '10/12/2025',
    dueDate: '10/01/2026',
    status: 'paye',
    type: 'Annuité brevet'
  }
])

// Helpers
const parseAmount = (amountStr: string) => {
  return parseInt(amountStr.replace(/[^0-9]/g, ''), 10) || 0
}

const formatAmount = (num: number) => {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + ' Ar'
}

// Stats computed
const totalFactured = computed(() => {
  return formatAmount(invoices.value.reduce((sum, item) => sum + parseAmount(item.amount), 0))
})

const totalPayed = computed(() => {
  return formatAmount(invoices.value
    .filter((item) => item.status === 'paye')
    .reduce((sum, item) => sum + parseAmount(item.amount), 0))
})

const totalPending = computed(() => {
  return formatAmount(invoices.value
    .filter((item) => item.status === 'en_attente')
    .reduce((sum, item) => sum + parseAmount(item.amount), 0))
})

// Date Filtering
const dateFilter = ref<'all' | '30days' | '2026' | '2025' | 'custom'>('all')
const customStartDate = ref('')
const customEndDate = ref('')
const showFilterDropdown = ref(false)

const parseInvoiceDate = (dateStr: string) => {
  const parts = dateStr.split('/')
  return new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]))
}

const filteredInvoices = computed(() => {
  const now = new Date()
  return invoices.value.filter(inv => {
    const invDate = parseInvoiceDate(inv.date)
    if (dateFilter.value === '30days') {
      const diffTime = Math.abs(now.getTime() - invDate.getTime())
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      return diffDays <= 30
    }
    if (dateFilter.value === '2026') {
      return invDate.getFullYear() === 2026
    }
    if (dateFilter.value === '2025') {
      return invDate.getFullYear() === 2025
    }
    if (dateFilter.value === 'custom') {
      let matches = true
      if (customStartDate.value) {
        matches = matches && invDate >= new Date(customStartDate.value)
      }
      if (customEndDate.value) {
        matches = matches && invDate <= new Date(customEndDate.value)
      }
      return matches
    }
    return true
  })
})

const setDateFilter = (filterType: 'all' | '30days' | '2026' | '2025' | 'custom') => {
  dateFilter.value = filterType
  if (filterType !== 'custom') {
    showFilterDropdown.value = false
  }
}

// Payment Modal State
const showPaymentModal = ref(false)
const selectedInvoiceForPay = ref<Invoice | null>(null)
const payStep = ref<'select' | 'details' | 'processing' | 'success'>('select')
const paymentMethod = ref<'mvola' | 'orange' | 'airtel' | 'card'>('mvola')

// Mobile Money Details
const mobileNumber = ref('')
const mobileNumberError = ref('')

// Card Details
const cardName = ref('')
const cardNumber = ref('')
const cardExpiry = ref('')
const cardCvv = ref('')

const openPaymentModal = (invoice: Invoice) => {
  selectedInvoiceForPay.value = invoice
  payStep.value = 'select'
  paymentMethod.value = 'mvola'
  mobileNumber.value = ''
  mobileNumberError.value = ''
  cardName.value = ''
  cardNumber.value = ''
  cardExpiry.value = ''
  cardCvv.value = ''
  showPaymentModal.value = true
}

const selectPaymentMethod = (method: 'mvola' | 'orange' | 'airtel' | 'card') => {
  paymentMethod.value = method
  payStep.value = 'details'
}

const validateMobileNumber = () => {
  const clean = mobileNumber.value.replace(/\s+/g, '')
  if (!/^\+?261(32|34|33|38)\d{7}$/.test(clean) && !/^0(32|34|33|38)\d{7}$/.test(clean)) {
    mobileNumberError.value = 'Numéro invalide. Format attendu : 034XXXXXXX'
    return false
  }
  mobileNumberError.value = ''
  return true
}

const handlePaymentSubmit = () => {
  if (paymentMethod.value !== 'card') {
    if (!validateMobileNumber()) return
  } else {
    // Basic card validation
    if (!cardName.value || !cardNumber.value || !cardExpiry.value || !cardCvv.value) {
      alert('Veuillez remplir tous les champs de carte.')
      return
    }
  }

  payStep.value = 'processing'

  setTimeout(() => {
    // Process payment success
    if (selectedInvoiceForPay.value) {
      const inv = invoices.value.find(i => i.id === selectedInvoiceForPay.value?.id)
      if (inv) {
        inv.status = 'paye'
      }

      // Add notification in local store
      const todayStr = new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })
      store.notifications.unshift({
        id: 'pay-' + Date.now(),
        message: `Paiement en ligne réussi pour la facture ${selectedInvoiceForPay.value.id} (${selectedInvoiceForPay.value.amount}).`,
        read: false,
        date: todayStr
      })
      store.unreadCount++
    }
    payStep.value = 'success'
  }, 2500)
}

// PDF print handler
const downloadPDF = (invoice: Invoice) => {
  const printWindow = window.open('', '_blank')
  if (printWindow) {
    printWindow.document.write(
      '<' + 'html>' +
        '<' + 'head>' +
          '<title>Facture ' + invoice.id + '</title>' +
          '<' + 'style>' +
            'body { font-family: "Inter", sans-serif; color: #1e293b; padding: 40px; line-height: 1.5; }' +
            '.header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #e2e8f0; padding-bottom: 20px; margin-bottom: 30px; }' +
            '.logo-title { font-size: 24px; font-weight: 800; color: #0A3A6A; }' +
            '.logo-sub { font-size: 12px; color: #64748b; margin-top: 4px; }' +
            '.title-right { text-align: right; }' +
            '.invoice-title { font-size: 28px; font-weight: 900; color: #0A3A6A; text-transform: uppercase; margin: 0; }' +
            '.meta-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-bottom: 40px; }' +
            '.meta-box h4 { font-size: 14px; color: #64748b; text-transform: uppercase; margin-bottom: 8px; }' +
            '.meta-box p { margin: 4px 0; font-size: 15px; }' +
            '.table { width: 100%; border-collapse: collapse; margin-bottom: 40px; }' +
            '.table th, .table td { padding: 12px 15px; text-align: left; border-bottom: 1px solid #e2e8f0; }' +
            '.table th { background: #f8fafc; font-weight: 600; color: #475569; }' +
            '.table td.amount { text-align: right; font-weight: 700; }' +
            '.table th.amount { text-align: right; }' +
            '.total-box { display: flex; justify-content: flex-end; margin-bottom: 40px; }' +
            '.total-table { width: 300px; }' +
            '.total-table td { padding: 8px 12px; }' +
            '.total-table tr.grand-total { font-size: 18px; font-weight: 800; color: #0A3A6A; border-top: 2px solid #e2e8f0; }' +
            '.status-badge { display: inline-block; padding: 6px 12px; border-radius: 20px; font-weight: 700; font-size: 14px; text-transform: uppercase; margin-top: 10px; }' +
            '.status-paye { background: #dcfce7; color: #166534; }' +
            '.status-attente { background: #ffedd5; color: #9a3412; }' +
            '.footer { text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 20px; margin-top: 50px; }' +
          '</' + 'style>' +
        '</' + 'head>' +
        '<' + 'body>' +
          '<div class="header">' +
            '<div>' +
              '<div class="logo-title">OMAPI PORTAL</div>' +
              '<div class="logo-sub">Office Malgache de la Propriété Industrielle</div>' +
            '</div>' +
            '<div class="title-right">' +
              '<h1 class="invoice-title">Facture</h1>' +
              '<p style="margin: 5px 0 0 0; font-weight: 600; color: #475569;"># ' + invoice.id + '</p>' +
              '<div class="status-badge ' + (invoice.status === 'paye' ? 'status-paye' : 'status-attente') + '">' +
                (invoice.status === 'paye' ? 'Payé' : 'En attente') +
              '</div>' +
            '</div>' +
          '</div>' +
          
          '<div class="meta-grid">' +
            '<div class="meta-box">' +
              '<h4>Émetteur</h4>' +
              '<p><strong>OMAPI</strong></p>' +
              '<p>Route de Nossi-Bé, Ambohibao</p>' +
              '<p>BP 8237, Antananarivo 101</p>' +
              '<p>Madagascar</p>' +
            '</div>' +
            '<div class="meta-box" style="text-align: right;">' +
              '<h4>Destinataire</h4>' +
              '<p><strong>Allan Chris</strong></p>' +
              '<p>Antananarivo, Madagascar</p>' +
              '<p>allan.chris@gmail.com</p>' +
              '<p style="margin-top: 15px;"><strong>Date d\'émission:</strong> ' + invoice.date + '</p>' +
              '<p><strong>Date d\'échéance:</strong> ' + invoice.dueDate + '</p>' +
            '</div>' +
          '</div>' +
          
          '<table class="table">' +
            '<thead>' +
              '<tr>' +
                '<th>Description</th>' +
                '<th>Type</th>' +
                '<th class="amount">Montant</th>' +
              '</tr>' +
            '</thead>' +
            '<tbody>' +
              '<tr>' +
                '<td>' + invoice.label + '</td>' +
                '<td>' + invoice.type + '</td>' +
                '<td class="amount">' + invoice.amount + '</td>' +
              '</tr>' +
            '</tbody>' +
          '</table>' +
          
          '<div class="total-box">' +
            '<table class="total-table">' +
              '<tr>' +
                '<td>Sous-total:</td>' +
                '<td style="text-align: right;">' + invoice.amount + '</td>' +
              '</tr>' +
              '<tr>' +
                '<td>TVA (0%):</td>' +
                '<td style="text-align: right;">0 Ar</td>' +
              '</tr>' +
              '<tr class="grand-total">' +
                '<td>Total:</td>' +
                '<td style="text-align: right;">' + invoice.amount + '</td>' +
              '</tr>' +
            '</table>' +
          '</div>' +
          
          '<div class="footer">' +
            '<p>Cette facture est générée électroniquement par le portail officiel de l\'OMAPI.</p>' +
            '<p>Pour toute assistance, contactez-nous à support@omapi.mg</p>' +
          '</div>' +
          '<' + 'script>' +
            'window.onload = function() { window.print(); };' +
          '</' + 'script>' +
        '</' + 'body>' +
      '</' + 'html>'
    )
    printWindow.document.close()
  }
}
</script>

<template>
  <div class="factures-view fade-in">
    <div class="header-section mb-30">
      <h1 class="page-title text-blue">Facturation & Paiements</h1>
      <p class="text-light-grey">Suivez vos règlements de taxes, téléchargez vos factures officielles et payez en ligne.</p>
    </div>

    <!-- Stats summary cards -->
    <div class="stats-grid mb-30">
      <div class="stat-card glass">
        <span class="stat-icon" style="display: flex; align-items: center; justify-content: center; color: var(--primary-blue);">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width: 24px; height: 24px;"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
        </span>
        <div class="stat-details">
          <span class="stat-label">Total Facturé</span>
          <span class="stat-value">{{ totalFactured }}</span>
        </div>
      </div>
      <div class="stat-card glass text-green-card">
        <span class="stat-icon" style="display: flex; align-items: center; justify-content: center; color: #16a34a;">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="width: 24px; height: 24px;"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
        </span>
        <div class="stat-details">
          <span class="stat-label">Total Payé</span>
          <span class="stat-value">{{ totalPayed }}</span>
        </div>
      </div>
      <div class="stat-card glass text-orange-card">
        <span class="stat-icon" style="display: flex; align-items: center; justify-content: center; color: #ea580c;">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width: 24px; height: 24px;"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
        </span>
        <div class="stat-details">
          <span class="stat-label">En attente</span>
          <span class="stat-value">{{ totalPending }}</span>
        </div>
      </div>
    </div>

    <!-- Invoices table card -->
    <div class="table-card glass mb-30">
      <div class="card-header">
        <h2>Historique des transactions</h2>
        
        <div class="filter-container">
          <button class="btn btn-secondary filter-trigger" @click="showFilterDropdown = !showFilterDropdown" style="display: inline-flex; align-items: center; gap: 8px;">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width: 14px; height: 14px; color: #475569;"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
            Filtrer par Date <span class="active-filter-badge" v-if="dateFilter !== 'all'">•</span>
          </button>
          
          <div v-if="showFilterDropdown" class="filter-dropdown glass fade-in">
            <div class="filter-dropdown-header">Période</div>
            <button :class="['filter-opt', { active: dateFilter === 'all' }]" @click="setDateFilter('all')">Toutes les factures</button>
            <button :class="['filter-opt', { active: dateFilter === '30days' }]" @click="setDateFilter('30days')">30 derniers jours</button>
            <button :class="['filter-opt', { active: dateFilter === '2026' }]" @click="setDateFilter('2026')">Année 2026</button>
            <button :class="['filter-opt', { active: dateFilter === '2025' }]" @click="setDateFilter('2025')">Année 2025</button>
            <button :class="['filter-opt', { active: dateFilter === 'custom' }]" @click="setDateFilter('custom')">Intervalle personnalisé...</button>
            
            <div class="custom-range-inputs" v-if="dateFilter === 'custom'">
              <div class="input-group">
                <label>Du</label>
                <input type="date" v-model="customStartDate">
              </div>
              <div class="input-group">
                <label>Au</label>
                <input type="date" v-model="customEndDate">
              </div>
              <button class="btn btn-primary btn-sm apply-btn" @click="showFilterDropdown = false">Appliquer</button>
            </div>
          </div>
        </div>
      </div>

      <div class="table-container">
        <table class="styled-table">
          <thead>
            <tr>
              <th>Référence</th>
              <th>Prestation</th>
              <th>Type de taxe</th>
              <th>Date d'émission</th>
              <th>Montant</th>
              <th>Statut</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="inv in filteredInvoices" :key="inv.id">
              <td><strong>{{ inv.id }}</strong></td>
              <td>{{ inv.label }}</td>
              <td><span class="badge badge-light">{{ inv.type }}</span></td>
              <td>{{ inv.date }}</td>
              <td class="amount"><strong>{{ inv.amount }}</strong></td>
              <td>
                <span :class="[
                  'badge',
                  inv.status === 'paye' ? 'badge-green' :
                  inv.status === 'en_attente' ? 'badge-orange' : 'badge-red'
                ]">
                  {{ inv.status === 'paye' ? 'Payé' : inv.status === 'en_attente' ? 'En attente' : 'En retard' }}
                </span>
              </td>
              <td>
                <div class="action-buttons">
                  <button class="btn-action" title="Télécharger le reçu/facture" @click="downloadPDF(inv)" style="display: inline-flex; align-items: center; gap: 4px;">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width: 12px; height: 12px;"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                    PDF
                  </button>
                  <button v-if="inv.status === 'en_attente'" class="btn-action pay-btn" @click="openPaymentModal(inv)" style="display: inline-flex; align-items: center; gap: 4px;">
                    Payer
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="width: 12px; height: 12px; color: #ffffff;"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect><line x1="1" y1="10" x2="23" y2="10"></line></svg>
                  </button>
                </div>
              </td>
            </tr>
            <tr v-if="filteredInvoices.length === 0">
              <td colspan="7" class="empty-table-msg">Aucune transaction trouvée pour cette période.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Quick info alert -->
    <div class="info-banner glass" style="display: flex; gap: 15px; align-items: flex-start;">
      <span class="banner-icon" style="color: #0284c7; flex-shrink: 0; display: flex; align-items: center; justify-content: center; margin-top: 2px;">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width: 20px; height: 20px;"><path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .5 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"></path><line x1="9" y1="18" x2="15" y2="18"></line><line x1="10" y1="22" x2="14" y2="22"></line></svg>
      </span>
      <p class="banner-text">
        <strong>Note d'information :</strong> Les dépôts et annuités de brevets doivent être acquittés dans les délais impartis sous peine de déchéance de droits. Le paiement en ligne par Mobile Money (Mvola, Orange Money, Airtel Money) ou par carte bancaire est instantanément pris en compte dans le traitement de votre dossier.
      </p>
    </div>

    <!-- Payment Modal Backdrop -->
    <div v-if="showPaymentModal" class="modal-backdrop" @click.self="showPaymentModal = false">
      <div class="modal-box payment-modal fade-in">
        <button class="close-modal-btn" @click="showPaymentModal = false">×</button>
        
        <!-- STEP 1: Select Payment Method -->
        <div v-if="payStep === 'select'">
          <h3 class="modal-title">Choisir le moyen de paiement</h3>
          <p class="modal-subtitle">Facture <strong>{{ selectedInvoiceForPay?.id }}</strong> — Montant : <strong>{{ selectedInvoiceForPay?.amount }}</strong></p>
          
          <div class="payment-methods-grid">
            <button class="method-card mvola" @click="selectPaymentMethod('mvola')">
              <div class="method-logo">Mvola</div>
              <span class="method-name">Mobile Money Telma</span>
            </button>
            
            <button class="method-card orange-money" @click="selectPaymentMethod('orange')">
              <div class="method-logo">Orange Money</div>
              <span class="method-name">Orange Money</span>
            </button>
            
            <button class="method-card airtel-money" @click="selectPaymentMethod('airtel')">
              <div class="method-logo">airtel money</div>
              <span class="method-name">Airtel Money</span>
            </button>
            
            <button class="method-card credit-card" @click="selectPaymentMethod('card')">
              <div class="method-logo" style="color: #0A3A6A; display: flex; align-items: center; justify-content: center;">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width: 28px; height: 28px;"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect><line x1="1" y1="10" x2="23" y2="10"></line></svg>
              </div>
              <span class="method-name">Carte Bancaire (Visa / MC)</span>
            </button>
          </div>
        </div>

        <!-- STEP 2: Input Details -->
        <div v-if="payStep === 'details'">
          <button class="back-modal-btn" @click="payStep = 'select'">← Retour</button>
          <h3 class="modal-title">Détails du paiement</h3>
          
          <!-- Mobile Money Inputs -->
          <div v-if="paymentMethod !== 'card'" class="payment-form">
            <p class="form-instruction">
              Saisissez votre numéro de téléphone Mobile Money. Une demande de validation avec saisie de votre code secret vous sera envoyée sur votre mobile.
            </p>
            <div class="form-group">
              <label>Numéro de téléphone</label>
              <input 
                type="tel" 
                v-model="mobileNumber" 
                placeholder="Ex: 034 00 000 00" 
                class="form-input"
                @keyup.enter="handlePaymentSubmit"
              />
              <span class="error-msg" v-if="mobileNumberError">{{ mobileNumberError }}</span>
            </div>
            
            <button class="btn btn-primary w-100 mt-20" @click="handlePaymentSubmit">
              Valider le paiement de {{ selectedInvoiceForPay?.amount }}
            </button>
          </div>

          <!-- Card Inputs -->
          <div v-else class="payment-form">
            <p class="form-instruction">Veuillez renseigner les informations de votre carte bancaire sécurisée.</p>
            <div class="form-group">
              <label>Nom du titulaire</label>
              <input type="text" v-model="cardName" placeholder="Ex: Allan Chris" class="form-input" />
            </div>
            <div class="form-group">
              <label>Numéro de carte</label>
              <input type="text" v-model="cardNumber" placeholder="4000 1234 5678 9010" class="form-input" />
            </div>
            <div class="form-row-2">
              <div class="form-group">
                <label>Date d'expiration</label>
                <input type="text" v-model="cardExpiry" placeholder="MM/AA" class="form-input" />
              </div>
              <div class="form-group">
                <label>CVV / CVC</label>
                <input type="text" v-model="cardCvv" placeholder="123" class="form-input" />
              </div>
            </div>
            
            <button class="btn btn-primary w-100 mt-20" @click="handlePaymentSubmit">
              Payer {{ selectedInvoiceForPay?.amount }}
            </button>
          </div>
        </div>

        <!-- STEP 3: Processing Animation -->
        <div v-if="payStep === 'processing'" class="processing-step">
          <div class="payment-spinner"></div>
          <h3 class="modal-title mt-20">Traitement en cours...</h3>
          <p class="modal-desc" v-if="paymentMethod !== 'card'">
            Veuillez vérifier votre téléphone portable et valider la transaction en saisissant votre code PIN Mobile Money.
          </p>
          <p class="modal-desc" v-else>
            Sécurisation de la transaction avec votre banque en cours. Merci de ne pas fermer cette fenêtre.
          </p>
        </div>

        <!-- STEP 4: Success confirmation -->
        <div v-if="payStep === 'success'" class="success-step">
          <div class="success-icon-badge">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round" style="width: 32px; height: 32px; color: #15803d;"><polyline points="20 6 9 17 4 12"></polyline></svg>
          </div>
          <h3 class="modal-title text-green mt-20">Paiement Réussi !</h3>
          <p class="modal-desc">
            Votre paiement de <strong>{{ selectedInvoiceForPay?.amount }}</strong> a été reçu et validé.
            La facture <strong>{{ selectedInvoiceForPay?.id }}</strong> est désormais acquittée.
          </p>
          
          <div class="success-actions">
            <button class="btn btn-outline" @click="selectedInvoiceForPay && downloadPDF(selectedInvoiceForPay)" style="display: inline-flex; align-items: center; gap: 8px; justify-content: center;">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width: 14px; height: 14px;"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
              Imprimer le reçu (PDF)
            </button>
            <button class="btn btn-primary" @click="showPaymentModal = false">
              Fermer
            </button>
          </div>
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

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 20px;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 25px;
  background: white;
  border-radius: 16px;
  border: 1px solid #e2e8f0;
}

.stat-icon {
  font-size: 2rem;
  width: 50px;
  height: 50px;
  background: #f1f5f9;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.text-green-card .stat-icon { background: #dcfce7; color: #15803d; }
.text-orange-card .stat-icon { background: #ffedd5; color: #c2410c; }

.stat-details {
  display: flex;
  flex-direction: column;
}

.stat-label {
  font-size: 0.9rem;
  color: #64748b;
  font-weight: 500;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 800;
  color: #0f172a;
}

.table-card {
  background: white;
  border-radius: 16px;
  padding: 25px;
  border: 1px solid #e2e8f0;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.card-header h2 {
  font-size: 1.25rem;
  color: #1e293b;
  font-weight: 700;
}

.btn {
  padding: 8px 16px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
  border: none;
  font-family: inherit;
  transition: all 0.2s;
}

.btn-secondary {
  background: #f1f5f9;
  color: #475569;
  border: 1px solid #cbd5e1;
}

.btn-secondary:hover {
  background: #e2e8f0;
}

.btn-primary {
  background: var(--primary-blue);
  color: white;
}

.btn-primary:hover {
  background: #0077b3;
}

.btn-outline {
  background: transparent;
  border: 1px solid var(--primary-blue);
  color: var(--primary-blue);
}

.btn-outline:hover {
  background: var(--primary-blue);
  color: white;
}

.btn-sm {
  padding: 5px 10px;
  font-size: 0.8rem;
}

.table-container {
  overflow-x: auto;
}

.styled-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.92rem;
}

.styled-table th, .styled-table td {
  padding: 15px 20px;
  text-align: left;
  border-bottom: 1px solid #f1f5f9;
}

.styled-table th {
  background: #f8fafc;
  color: #64748b;
  font-weight: 600;
}

.styled-table tr:hover {
  background: #f8fafc;
}

.amount {
  color: var(--primary-blue);
  font-size: 0.95rem;
}

.badge {
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 0.78rem;
  font-weight: 600;
}

.badge-light { background: #f1f5f9; color: #475569; }
.badge-green { background: #dcfce7; color: #16a34a; }
.badge-orange { background: #ffedd5; color: #ea580c; }
.badge-red { background: #fee2e2; color: #dc2626; }

.action-buttons {
  display: flex;
  gap: 8px;
}

.btn-action {
  background: #f1f5f9;
  border: 1px solid #cbd5e1;
  color: #475569;
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
}

.btn-action:hover {
  background: #e2e8f0;
}

.pay-btn {
  background: var(--accent-orange);
  color: white;
  border-color: var(--accent-orange);
}

.pay-btn:hover {
  background: #d84e1b;
}

.info-banner {
  background: #f0f9ff;
  border: 1px solid #bae6fd;
  border-radius: 12px;
  padding: 20px;
  display: flex;
  gap: 15px;
  align-items: flex-start;
}

.banner-icon {
  font-size: 1.5rem;
}

.banner-text {
  font-size: 0.88rem;
  color: #0369a1;
  line-height: 1.6;
}

/* Filter par date dropdown style */
.filter-container {
  position: relative;
}

.filter-trigger {
  display: flex;
  align-items: center;
  gap: 8px;
}

.active-filter-badge {
  color: var(--accent-orange);
  font-weight: bold;
}

.filter-dropdown {
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 8px;
  background: white;
  border: 1px solid #cbd5e1;
  border-radius: 12px;
  width: 250px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.1);
  z-index: 100;
  padding: 10px 0;
}

.filter-dropdown-header {
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  color: #94a3b8;
  padding: 8px 18px;
  border-bottom: 1px solid #f1f5f9;
  margin-bottom: 5px;
}

.filter-opt {
  display: block;
  width: 100%;
  text-align: left;
  background: none;
  border: none;
  padding: 10px 18px;
  font-size: 0.88rem;
  color: #475569;
  cursor: pointer;
  font-family: inherit;
}

.filter-opt:hover {
  background: #f1f5f9;
  color: var(--primary-blue);
}

.filter-opt.active {
  background: #e0f2fe;
  color: var(--primary-blue);
  font-weight: 700;
}

.custom-range-inputs {
  padding: 12px 18px;
  border-top: 1px solid #f1f5f9;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.input-group label {
  font-size: 0.72rem;
  font-weight: 600;
  color: #64748b;
}

.input-group input {
  padding: 6px 10px;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  font-size: 0.82rem;
  outline: none;
}

.input-group input:focus {
  border-color: var(--primary-blue);
}

.apply-btn {
  width: 100%;
  margin-top: 5px;
}

/* Modals */
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.4);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-box {
  background: white;
  border-radius: 20px;
  padding: 30px;
  max-width: 480px;
  width: 90%;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  position: relative;
  text-align: center;
}

.close-modal-btn {
  position: absolute;
  top: 20px;
  right: 20px;
  background: #f1f5f9;
  border: none;
  font-size: 1.5rem;
  line-height: 1;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  color: #64748b;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-modal-btn:hover {
  background: #e2e8f0;
  color: #1e293b;
}

.back-modal-btn {
  background: none;
  border: none;
  color: #64748b;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  padding: 0;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 4px;
}

.back-modal-btn:hover {
  color: var(--primary-blue);
}

.modal-title {
  font-size: 1.25rem;
  font-weight: 800;
  color: #0f172a;
  margin-bottom: 8px;
}

.modal-subtitle {
  font-size: 0.88rem;
  color: #64748b;
  margin-bottom: 25px;
}

/* Payment Methods Grid */
.payment-methods-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
}

.method-card {
  border: 1px solid #cbd5e1;
  border-radius: 12px;
  padding: 20px;
  background: white;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  transition: all 0.2s;
  font-family: inherit;
}

.method-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(0,0,0,0.06);
  border-color: var(--primary-blue);
}

.method-logo {
  font-weight: 900;
  font-size: 1.25rem;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.mvola .method-logo {
  color: #00a859;
  font-family: 'Arial Black', sans-serif;
  text-shadow: 1px 1px 0 #fff;
}
.orange-money .method-logo {
  color: #ff6600;
  font-family: 'Trebuchet MS', sans-serif;
}
.airtel-money .method-logo {
  color: #e30613;
  font-style: italic;
  text-transform: lowercase;
}
.credit-card .method-logo {
  font-size: 2rem;
}

.method-name {
  font-size: 0.8rem;
  font-weight: 700;
  color: #475569;
  text-align: center;
}

/* Payment Form */
.payment-form {
  text-align: left;
}

.form-instruction {
  font-size: 0.85rem;
  color: #64748b;
  line-height: 1.6;
  margin-bottom: 20px;
}

.form-group {
  margin-bottom: 15px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-group label {
  font-size: 0.8rem;
  font-weight: 700;
  color: #475569;
}

.form-input {
  padding: 10px 14px;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  font-size: 0.9rem;
  font-family: inherit;
  outline: none;
}

.form-input:focus {
  border-color: var(--primary-blue);
}

.form-row-2 {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
}

.error-msg {
  color: #ef4444;
  font-size: 0.75rem;
  font-weight: 600;
}

.w-100 {
  width: 100%;
}

/* Processing View */
.processing-step {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 30px 0;
}

.payment-spinner {
  width: 50px;
  height: 50px;
  border: 4px solid #f1f5f9;
  border-top-color: var(--primary-blue);
  border-radius: 50%;
  animation: rotate 1s infinite linear;
}

@keyframes rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.modal-desc {
  font-size: 0.88rem;
  color: #64748b;
  line-height: 1.6;
  text-align: center;
  max-width: 360px;
  margin: 10px auto 0;
}

/* Success View */
.success-step {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 20px 0;
}

.success-icon-badge {
  width: 64px;
  height: 64px;
  background: #dcfce7;
  border: 4px solid #bbf7d0;
  border-radius: 50%;
  color: #15803d;
  font-size: 2rem;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 15px rgba(22, 163, 74, 0.15);
}

.text-green {
  color: #16a34a;
}

.success-actions {
  display: flex;
  gap: 12px;
  margin-top: 30px;
  width: 100%;
}

.success-actions button {
  flex: 1;
}

.empty-table-msg {
  text-align: center;
  padding: 30px !important;
  color: #94a3b8;
  font-weight: 500;
}
</style>
