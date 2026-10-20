import { ref } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'

const API_URL = 'http://localhost:3000/api'
const storedToken = localStorage.getItem('token')
const isAuthenticated = ref(!!storedToken)
const currentUser = ref(JSON.parse(localStorage.getItem('portalUser') || 'null'))

if (storedToken) {
  axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`
}

// Global interceptor to handle expired sessions (401 Unauthorized)
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('isAuthenticated')
      localStorage.removeItem('portalUser')
      isAuthenticated.value = false
      currentUser.value = null
      delete axios.defaults.headers.common['Authorization']
      
      // Redirect immediately to login with reason
      if (typeof window !== 'undefined') {
        window.location.href = '/login?reason=session_expired'
      }
    }
    return Promise.reject(error)
  }
)


export const useAuth = () => {
  const router = useRouter()

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await axios.post(`${API_URL}/auth/login`, { email, password })
      
      const { token, user } = response.data
      
      localStorage.setItem('token', token)
      localStorage.setItem('isAuthenticated', 'true')
      localStorage.setItem('portalUser', JSON.stringify(user))
      
      isAuthenticated.value = true
      currentUser.value = user
      
      // Set default header for future requests
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
      
      return true
    } catch (error: any) {
      console.error('Login failed:', error)
      if (!error.response) {
        throw new Error('NETWORK_ERROR')
      }
      return false
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('isAuthenticated')
    localStorage.removeItem('portalUser')
    isAuthenticated.value = false
    currentUser.value = null
    delete axios.defaults.headers.common['Authorization']
    router.push('/login')
  }

  return {
    isAuthenticated,
    currentUser,
    login,
    logout
  }
}

// ── Session timeout composable ──────────────────────────────────────────────
const TIMEOUT_MS = 8 * 60 * 60 * 1000  // 8 hours of inactivity (matches JWT 12h expiry)

export const useSessionTimeout = () => {
  let timer: ReturnType<typeof setTimeout>

  const expireSession = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('isAuthenticated')
    localStorage.removeItem('portalUser')
    isAuthenticated.value = false
    currentUser.value = null
    delete axios.defaults.headers.common['Authorization']
    window.location.href = '/login?reason=timeout'
  }

  const resetTimer = () => {
    clearTimeout(timer)
    if (isAuthenticated.value) {
      timer = setTimeout(expireSession, TIMEOUT_MS)
    }
  }

  const startListening = () => {
    const events = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart']
    events.forEach(e => window.addEventListener(e, resetTimer))
    resetTimer() // start immediately
  }

  const stopListening = () => {
    clearTimeout(timer)
    const events = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart']
    events.forEach(e => window.removeEventListener(e, resetTimer))
  }

  return { startListening, stopListening, resetTimer }
}
