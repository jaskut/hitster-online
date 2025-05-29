<template>
  <div>
  <v-container height="300px" width="300px">
  <div @click="flipped=!flipped" class="flip-card" :class="flipped?'':'flip'">
    <div class="flip-card-inner">
      <div class="flip-card-back" :style="{'background-color':color}">
        <div style="height:100%; padding: 30px">
          <h3>{{ song.artists.map(artist => artist.name).join(', ') }}</h3>
          <h1 style="font-size: 4em;">{{ song.album.release_date.substring(0,4) }}</h1>
          <h3><i>{{ song.name }}</i></h3>
        </div>
      </div>
      <div class="flip-card-front">
        <div style="height:100%; display: flex; justify-content: center; align-items: center">
          <v-icon @click="toggle" :icon="icon ? 'mdi-pause-circle-outline' : 'mdi-play-circle-outline'" size="150px"/>
        </div>
      </div>
    </div>
  </div>
  </v-container>
</div>
</template>

<script lang="ts" setup>
  import { play, pause, getPlaybackState, onWebSocketMessage, sendToServer } from '@/services/api'
  import { getSpotifyPlayer } from '@/services/spotify-client'

  const { song, color="green"} = defineProps<{
    song: {name:string, artists:Array<{name:string}>, album:{release_date:string}},
    color?: string
  }>()

  const icon=ref(true)
  const flipped = ref(true)
  const spotifyPlayer = getSpotifyPlayer()

  // Get initial playback state from server
  getPlaybackState().then(result => icon.value = result).catch(console.error)

  // Listen for server coordination commands
  onWebSocketMessage((data) => {
    switch (data.type) {
      case 'play_command':
        // Server tells us to play a specific track
        if (data.uri) {
          spotifyPlayer.playTrack(data.uri)
          icon.value = true
        }
        break;
      
      case 'pause_command':
        // Server tells us to pause
        spotifyPlayer.pauseTrack()
        icon.value = false
        break;
      
      case 'sync_state':
        // Initial state sync from server
        icon.value = data.isPlaying
        if (data.currentSong && data.isPlaying) {
          spotifyPlayer.playTrack(data.currentSong)
        }
        break;
    }
  })

  function toggle() {
    flipped.value=!flipped.value
    
    // Send command to server for coordination
    getPlaybackState().then(result => {
      const nextState = !result
      icon.value = nextState
      
      // Send playback command to server (which coordinates all clients)
      if (nextState) {
        play() // Server will broadcast play command to all clients
      } else {
        pause() // Server will broadcast pause command to all clients
      }
      
      // Report our local status back to server
      sendToServer({
        type: 'playback_status',
        isPlaying: nextState,
        clientId: 'client-' + Math.random().toString(36).substr(2, 9)
      })
      
    }).catch(error => {
      console.error('Playback control error:', error)
    })
  }

  defineExpose({flipped, icon})
</script>

<style>

  .flip-card {
    width: 100%;
    height: 100%;
    perspective: 1000px; /* Remove this if you don't want the 3D effect */
  }
  .flip-card-inner {
    position: relative;
    width: 100%;
    height: 100%;
    text-align: center;
    transition: transform 0.8s;
    transform-style: preserve-3d;
    backface-visibility:hidden
  }

  .flip .flip-card-inner {
    transform: rotateY(180deg);
  }

  /* Position the front and back side */
  .flip-card-front, .flip-card-back {
    border-radius: 15px;
    box-shadow: 0px 0px 10px 2px rgba(125,125,125,0.5);
    position: absolute;
    width: 100%;
    height: 100%;
    -webkit-backface-visibility: hidden; /* Safari */
    backface-visibility: hidden;
  }



  .flip-card-back {
    transform: rotateY(180deg);
  }
</style>