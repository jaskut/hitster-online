<template>
  <main>
    <v-container v-if="songs">
    <h1>GameView</h1>
    <v-btn @click="previous">Previous</v-btn>
    <v-btn @click="next">Next</v-btn>
    <song-card v-if="current>=0" :song="songs[current]" ref="songCard"/>
    </v-container>
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
    }, songCard.value.flipped? 0:500)
    songCard.value.flipped = true
  }

  function previous() {
    current.value--
    play(authStore.token || '', songs.value[current.value].uri)
  }

</script>