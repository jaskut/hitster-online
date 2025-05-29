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
  import { getPlaylist, play } from '@/services/api'

  const songs = ref()
  const current = ref(0)
  const songCard = ref()

  // Fetch playlist from our backend server (no auth needed on client)
  getPlaylist('58y9xPPIRWd8tqlOaKoDOI').then(result => {
    songs.value = result.items.map((item: any) => item.track).sort(() => Math.random() - 0.5)
  }).catch(error => {
    console.error('Failed to load playlist:', error)
    // You might want to show an error message to the user
  })

  function next() {
    setTimeout(() => {
      current.value++
      play(songs.value[current.value].uri)
      songCard.value.icon = true
    }, songCard.value.flipped? 0:500)
    songCard.value.flipped = true
  }

  function previous() {
    current.value--
    play(songs.value[current.value].uri)
    songCard.value.icon = true
  }

</script>