<template>
  <div>
    <h1>Please wait a moment, you will be redirected</h1>
    {{ authStore.isAuthenticated }}
  </div>
</template>

<script setup lang="ts">
  import { useAuthStore } from '@/stores/auth'
  import { useRouter } from 'vue-router'

  const authStore = useAuthStore()
  const router = useRouter()
  if (authStore.isAuthenticated) {
    router.push({name:'home'})
  }
  authStore.login()
  router.push({name:'home'})
</script>