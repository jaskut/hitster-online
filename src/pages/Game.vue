<template>
  <main>
  <div v-if="songs">
    <div class="d-flex justify-center">
      <h1>GameView</h1>
    </div>
    <div class="d-flex justify-center align-center">
      <v-btn icon="mdi-chevron-left" size="x-large" @click="previous"/>
      <song-card v-if="current>=0" :song="songs[current]" ref="songCard"/>
      <v-btn icon="mdi-chevron-right" size="x-large" @click="next"/>
      </div>
  </div>
  </main>
</template>

<script setup lang="ts">
  import SongCard from '@/components/SongCard.vue'
  import { useAuthStore } from '@/stores/auth'
  import { getPlaylist, play } from '@/spotify/calls';
  //const href = "spotify:track:0QtJZpyfZF67QF32p41NXa"

  const authStore = useAuthStore()
  const songs = ref()
  const current = ref(0)

  const songCard = ref()

  getPlaylist(authStore.token || '', '58y9xPPIRWd8tqlOaKoDOI').then(result => songs.value = result.map((item:any) => item.track).sort(() => Math.random() - 0.5))
  //window.open("https://open.spotify.com/track/0QtJZpyfZF67QF32p41NXa")

  function next() {
    setTimeout(() => {
      current.value++
      play(authStore.token || '', songs.value[current.value].uri)
      songCard.value.icon = true
    }, songCard.value.flipped? 0:500)
    songCard.value.flipped = true
  }

  function previous() {
    current.value--
    play(authStore.token || '', songs.value[current.value].uri)
    songCard.value.icon = true
  }

</script>