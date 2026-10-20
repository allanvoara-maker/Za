import { defineStore } from 'pinia'
import { ref, watch } from 'vue'
import axios from 'axios'

const API_URL = 'http://localhost:3000/api'

export const useApplicationStore = defineStore('application', () => {
  // ── Dossiers ───────────────────────────────────────────────────────────────
  const dossiers = ref<
    Array<{
      id: string
      type: string
      name: string
      status: string
      date: string
      icon: string
      created_at?: string
    }>
  >([])

  const searchQuery = ref('')

  const fetchDossiers = async () => {
    try {
      const response = await axios.get(`${API_URL}/dossiers`)
      dossiers.value = response.data.map((d: any) => ({
        ...d,
        icon: d.type === 'Marque' ? 'trademark' : d.type === 'Brevet' ? 'patent' : 'shop',
      }))
    } catch {
      console.warn('Could not fetch dossiers from backend.')
    }
  }

  const deleteDossier = async (id: string) => {
    try {
      await axios.delete(`${API_URL}/dossiers/${id}`)
      dossiers.value = dossiers.value.filter((d) => d.id !== id)
    } catch {
      // Fallback: just remove locally
      dossiers.value = dossiers.value.filter((d) => d.id !== id)
    }
  }

  // ── Notifications ──────────────────────────────────────────────────────────
  const notifications = ref<
    Array<{
      id: number | string
      message: string
      read: boolean
      is_read?: number
      date: string
    }>
  >([])

  const unreadCount = ref(0)

  const fetchNotifications = async () => {
    try {
      const response = await axios.get(`${API_URL}/notifications`)
      notifications.value = response.data.map((n: any) => ({
        id: n.id,
        message: n.message,
        read: n.is_read === 1,
        date: new Date(n.created_at).toLocaleDateString('fr-FR', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        }),
      }))
      unreadCount.value = notifications.value.filter((n) => !n.read).length
    } catch {
      // Keep empty if API fails
    }
  }

  const markAllRead = async () => {
    try {
      await axios.put(`${API_URL}/notifications/read-all`)
      notifications.value.forEach((n) => {
        n.read = true
      })
      unreadCount.value = 0
    } catch {
      notifications.value.forEach((n) => {
        n.read = true
      })
      unreadCount.value = 0
    }
  }

  // ── Wizard Form State ──────────────────────────────────────────────────────
  const currentStep = ref(1)
  const isBatchMode = ref(false)
  const batchBrands = ref<
    Array<{
      id: string
      name: string
      type: string
      logo: string | null
      colors: string
      description: string
      originalityReport: any
      logoOriginalityReport: any
      classification: { selectedClasses: number[] }
    }>
  >([])

  const applicant = ref({
    type: 'Personne physique',
    name: '',
    address: '',
    email: '',
    phone: '',
    nationality: 'Malgache',
    lat: null as number | null,
    lng: null as number | null,
  })

  const brand = ref({
    name: '',
    type: 'Marque verbale',
    logo: null as string | null,
    colors: '',
    description: '',
    originalityReport: null as {
      score: number
      explanation: string
      topMatches: any[]
      logoAnalysis?: {
        hasVisualConflict: boolean
        conflictDetails: string
        visualScorePenalty: number
        logoDescription: string
        conflictingBrand?: string
        conflictSource?: string
      } | null
    } | null,
    logoOriginalityReport: null as {
      visualOriginalityScore: number
      explanation: string
      logoAnalysis: {
        hasVisualConflict: boolean
        conflictDetails: string
        visualScorePenalty: number
        logoDescription: string
        conflictingBrand?: string
        conflictSource?: string
      }
      totalKnownLogos?: number
    } | null,
  })

  const classification = ref({
    selectedClasses: [] as number[],
  })

  // ── Wizard Actions ─────────────────────────────────────────────────────────
  const nextStep = () => {
    if (currentStep.value < 4) currentStep.value++
  }
  const prevStep = () => {
    if (currentStep.value > 1) currentStep.value--
  }
  const setStep = (step: number) => {
    if (step >= 1 && step <= 4) currentStep.value = step
  }

  const buildMergedOriginalityReport = () => {
    const nameReport = brand.value.originalityReport
    const logoReport = brand.value.logoOriginalityReport

    if (!nameReport && !logoReport) return null
    if (!nameReport && logoReport) {
      return {
        score: logoReport.visualOriginalityScore,
        explanation: logoReport.explanation,
        topMatches: [],
        logoAnalysis: logoReport.logoAnalysis,
      }
    }
    if (nameReport && !logoReport) return nameReport

    const logoAnalysis = logoReport!.logoAnalysis
    const existingPenalty = nameReport!.logoAnalysis?.visualScorePenalty || 0
    const newPenalty = logoAnalysis?.visualScorePenalty || 0
    const delta = Math.max(0, newPenalty - existingPenalty)

    return {
      ...nameReport!,
      score: Math.max(0, nameReport!.score - delta),
      logoAnalysis,
      explanation: nameReport!.explanation,
    }
  }

  const mergeLogoReport = (logoReport: typeof brand.value.logoOriginalityReport) => {
    brand.value.logoOriginalityReport = logoReport
    if (!logoReport) return

    if (brand.value.originalityReport) {
      const existingPenalty = brand.value.originalityReport.logoAnalysis?.visualScorePenalty || 0
      const newPenalty = logoReport.logoAnalysis?.visualScorePenalty || 0
      const delta = Math.max(0, newPenalty - existingPenalty)
      brand.value.originalityReport = {
        ...brand.value.originalityReport,
        score: Math.max(0, brand.value.originalityReport.score - delta),
        logoAnalysis: logoReport.logoAnalysis,
      }
    }
  }

  const submitApplication = async () => {
    try {
      // Try to get GPS location via geocoding the address first
      let location: { lat: number; lng: number } | null = null

      if (applicant.value.lat && applicant.value.lng) {
        location = { lat: applicant.value.lat, lng: applicant.value.lng }
        console.log(`✅ Using pre-geocoded coordinates:`, location)
      } else if (applicant.value.address && applicant.value.address.trim()) {
        try {
          const query = encodeURIComponent(applicant.value.address.trim())
          const url = `https://nominatim.openstreetmap.org/search?format=json&q=${query}&limit=1`
          const response = await fetch(url)
          if (response.ok) {
            const data = await response.json()
            if (data && data.length > 0) {
              const place = data[0]
              location = {
                lat: parseFloat(place.lat),
                lng: parseFloat(place.lon),
              }
              console.log(
                `✅ Geocoded address "${applicant.value.address}" using Nominatim:`,
                location,
              )
            } else {
              console.warn(
                `⚠️ Nominatim found no results for address: "${applicant.value.address}"`,
              )
            }
          }
        } catch (error) {
          console.warn('❌ Nominatim geocoding failed, falling back to browser GPS:', error)
        }
      }

      // Fallback to browser GPS if geocoding failed or address was not specified
      if (!location) {
        try {
          const pos: GeolocationPosition = await new Promise((resolve, reject) =>
            navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 }),
          )
          location = { lat: pos.coords.latitude, lng: pos.coords.longitude }
          console.log('✅ Fallback to browser GPS location:', location)
        } catch {
          // GPS denied or unavailable – proceed without it
        }
      }

      const logoSize = brand.value.logo ? Math.round(brand.value.logo.length / 1024) : 0
      if (logoSize > 0) console.log(`Logo size: ~${logoSize}KB`)

      const payload = {
        type: 'Marque',
        name: brand.value.name.trim() || 'Marque sans nom',
        applicant: applicant.value,
        brand: {
          ...brand.value,
          originalityReport: buildMergedOriginalityReport(),
        },
        classification: classification.value,
        location,
      }

      const response = await axios.post(`${API_URL}/dossiers`, payload)

      // Add to local state immediately without a refetch
      dossiers.value.unshift({
        ...response.data,
        icon: 'trademark',
      })

      // Add notification locally (backend also creates one)
      const today = new Date().toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      })
      notifications.value.unshift({
        id: 'n' + Date.now(),
        message: `Votre dossier "${response.data.name}" (${response.data.id}) a été soumis avec succès.`,
        read: false,
        date: today,
      })
      unreadCount.value++

      resetWizard()
      clearDraft()
      return true
    } catch (error: any) {
      const msg = error?.response?.data?.message || error?.message || 'Unknown error'
      const status = error?.response?.status || 'No response'
      console.error(`Failed to submit application. Status: ${status}, Message: ${msg}`)
      return false
    }
  }

  // ── Batch Mode Functions ───────────────────────────────────────────────────
  const addToBatch = () => {
    const newBrand = {
      id: Date.now().toString(),
      name: brand.value.name,
      type: brand.value.type,
      logo: brand.value.logo,
      colors: brand.value.colors,
      description: brand.value.description,
      originalityReport: brand.value.originalityReport,
      logoOriginalityReport: brand.value.logoOriginalityReport,
      classification: {
        selectedClasses: [...classification.value.selectedClasses],
      },
    }
    batchBrands.value.push(newBrand)
    // Reset brand fields for next entry
    brand.value = {
      name: '',
      type: 'Marque verbale',
      logo: null,
      colors: '',
      description: '',
      originalityReport: null,
      logoOriginalityReport: null,
    }
    classification.value.selectedClasses = []
  }

  const removeFromBatch = (id: string) => {
    batchBrands.value = batchBrands.value.filter((b) => b.id !== id)
  }

  const submitBatch = async () => {
    if (batchBrands.value.length === 0) return false

    try {
      // Generate a unique batch ID
      const batchId = 'BATCH-' + Date.now()

      // Get GPS location once for all submissions
      let location: { lat: number; lng: number } | null = null
      if (applicant.value.lat && applicant.value.lng) {
        location = { lat: applicant.value.lat, lng: applicant.value.lng }
      } else if (applicant.value.address && applicant.value.address.trim()) {
        try {
          const query = encodeURIComponent(applicant.value.address.trim())
          const url = `https://nominatim.openstreetmap.org/search?format=json&q=${query}&limit=1`
          const response = await fetch(url)
          if (response.ok) {
            const data = await response.json()
            if (data && data.length > 0) {
              const place = data[0]
              location = {
                lat: parseFloat(place.lat),
                lng: parseFloat(place.lon),
              }
            }
          }
        } catch (error) {
          console.warn('Geocoding failed:', error)
        }
      }

      const today = new Date().toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      })

      // Submit each brand with the batch ID
      for (const batchBrand of batchBrands.value) {
        const payload = {
          type: 'Marque',
          name: batchBrand.name.trim() || 'Marque sans nom',
          applicant: applicant.value,
          brand: {
            ...batchBrand,
            originalityReport: batchBrand.originalityReport,
          },
          classification: batchBrand.classification,
          location,
          batchId, // Add batch reference
        }

        const response = await axios.post(`${API_URL}/dossiers`, payload)

        dossiers.value.unshift({
          ...response.data,
          icon: 'trademark',
        })

        notifications.value.unshift({
          id: 'n' + Date.now() + Math.random(),
          message: `Votre dossier "${response.data.name}" (${response.data.id}) a été soumis avec succès.`,
          read: false,
          date: today,
        })
      }

      unreadCount.value += batchBrands.value.length
      batchBrands.value = []
      resetWizard()
      clearDraft()
      return true
    } catch (error: any) {
      const msg = error?.response?.data?.message || error?.message || 'Unknown error'
      console.error(`Failed to submit batch. Message: ${msg}`)
      return false
    }
  }

  const resetWizard = () => {
    currentStep.value = 1
    applicant.value = {
      type: 'Personne physique',
      name: '',
      address: '',
      email: '',
      phone: '',
      nationality: 'Malgache',
      lat: null,
      lng: null,
    }
    brand.value = {
      name: '',
      type: 'Marque verbale',
      logo: null,
      colors: '',
      description: '',
      originalityReport: null,
      logoOriginalityReport: null,
    }
    classification.value.selectedClasses = []
  }

  // ── Auto-save Draft ────────────────────────────────────────────────────────
  const loadDraft = () => {
    try {
      const saved = localStorage.getItem('omapi_dossier_draft')
      if (saved) {
        const parsed = JSON.parse(saved)
        if (parsed.currentStep) currentStep.value = parsed.currentStep
        if (parsed.applicant) applicant.value = { ...applicant.value, ...parsed.applicant }
        if (parsed.brand) brand.value = { ...brand.value, ...parsed.brand }
        if (parsed.classification)
          classification.value = { ...classification.value, ...parsed.classification }
        console.log('✅ Draft successfully restored from localStorage')
      }
    } catch (e) {
      console.warn('Failed to load draft:', e)
    }
  }

  const saveDraft = () => {
    try {
      const dataToSave = {
        currentStep: currentStep.value,
        applicant: applicant.value,
        brand: brand.value,
        classification: classification.value,
      }
      localStorage.setItem('omapi_dossier_draft', JSON.stringify(dataToSave))
    } catch (e) {
      console.warn('Failed to save draft:', e)
    }
  }

  const clearDraft = () => {
    try {
      localStorage.removeItem('omapi_dossier_draft')
    } catch (e) {
      console.warn('Failed to clear draft:', e)
    }
  }

  // Watch for changes deep and save to local storage
  watch(
    [currentStep, applicant, brand, classification],
    () => {
      saveDraft()
    },
    { deep: true },
  )

  // Initialize draft loading
  loadDraft()

  return {
    // Data
    dossiers,
    searchQuery,
    notifications,
    unreadCount,
    // Wizard
    currentStep,
    isBatchMode,
    batchBrands,
    applicant,
    brand,
    classification,
    // Actions
    nextStep,
    prevStep,
    setStep,
    fetchDossiers,
    fetchNotifications,
    submitApplication,
    deleteDossier,
    markAllRead,
    resetWizard,
    loadDraft,
    clearDraft,
    mergeLogoReport,
    buildMergedOriginalityReport,
    addToBatch,
    removeFromBatch,
    submitBatch,
  }
})
