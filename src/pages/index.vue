<template>
  <RouterLink v-if="! authStore.isAuthenticated" to="/login">Login</RouterLink>
    <RouterLink v-if="authStore.isAuthenticated" @click="authStore.logout" to="/">Logout</RouterLink>
    <RouterLink v-if="authStore.isAuthenticated" to="/game">Play</RouterLink>
</template>

<script lang="ts" setup>
  import { useAuthStore } from '@/stores/auth'

  const authStore = useAuthStore()
</script>
