// Utilities
import { defineStore } from 'pinia'
import { tokenAuth, refreshToken } from '@/spotify/auth'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: localStorage.getItem('access_token') || null,
    refresh_token: localStorage.getItem('refresh_token') || null,
    expires: localStorage.getItem('expires') ? new Date(localStorage.getItem('expires') || '') : null,
    refreshTokenTimeOut: null as number | null,
  }),
  getters: {
    isAuthenticated: (state) => Boolean(state.token),
  },
  actions: {
    setToken(token:any) {
      const { access_token, refresh_token, expires_in } = token;
        this.token = access_token
        this.refresh_token = refresh_token
        this.expires = new Date(new Date().getTime() + (expires_in * 1000))
        this.refreshTokenTimeOut = setTimeout(this.refresh, (expires_in - 60) * 1000)

        localStorage.setItem('access_token', access_token);
        localStorage.setItem('refresh_token', refresh_token);
        localStorage.setItem('expires', this.expires.toISOString());
    },
    login() {
      clearTimeout(this.refreshTokenTimeOut || undefined)
      tokenAuth().then(result => {result?this.setToken(result):null})
    },
    refresh() {
      refreshToken(this.refresh_token || '').then(result => {this.setToken(result)})
    },
    logout() {
      clearTimeout(this.refreshTokenTimeOut || undefined);
      this.token = null
      this.refresh_token = null
      this.expires = null
      
      localStorage.removeItem("access_token")
      localStorage.removeItem("refresh_token")
      localStorage.removeItem("expires")
    }
  }
})
