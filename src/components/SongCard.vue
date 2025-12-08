<template>
  <div>
    <v-container height="300px" width="300px">
      <div @click="flipped=!flipped" class="flip-card" :class="flipped?'':'flip'">
        <div class="flip-card-inner song-content">
          <div class="flip-card-back" :style="{'background-color':randomColor}">
            <!-- Song Info Display -->
            <div class="song-info" >
              <h3 class="artist-name">{{ song.artists?.map(artist => artist.name).join(', ') || song.artist }}</h3>
              <h1 class="song-title">{{ song.name || song.title }}</h1>
              <p class="album-info" v-if="song.album?.name">{{ song.album.name }}</p>
              <h1 class="year-info" v-if="song.album?.release_date || song.year">{{song.year || new Date(song.album!.release_date!).getFullYear() }}</h1>
            </div>
          </div>
          
          <div class="flip-card-front">
            <!-- Play/Pause Control -->
            <div class="playback-control">
              <v-icon 
                @click="toggle" 
                :icon="icon ? 'mdi-pause-circle-outline' : 'mdi-play-circle-outline'" 
                size="100px"
                color="white"
                class="control-icon"
              />
            </div>
          </div>
        </div>
      </div>
    </v-container>
  </div>
</template>

<script lang="ts" setup>
  import { useAuthStore } from '@/stores/auth'
  import { play, pause, getPlaybackState } from '@/spotify/calls'

  const authStore = useAuthStore()

  const { song, color="primary"} = defineProps<{
    song: {
      name?: string, 
      title?: string,
      artists?: Array<{name: string}>, 
      artist?: string,
      album?: {name?: string, release_date?: string},
      year?: string | number,
      uri?: string
    },
    color?: string
  }>()

  const icon = ref(true)
  watch(() => song, () => {
    flipped.value = true
  })

  const colors = ['blue', 'green', 'purple', 'orange', 'teal']
  const randomColor = colors[Math.floor(Math.random() * colors.length)]

  // Get initial playback state
  getPlaybackState(authStore.token || '').then(result => icon.value = result).catch(() => {})

  const flipped = ref(true)

  function toggle() {
    flipped.value=!flipped.value
    console.log('Toggled flip:', flipped.value)
    getPlaybackState(authStore.token || '').then(result => {
      icon.value = !result
      const uri = song.uri
      if (result) {
        pause(authStore.token || '')
      } else if (uri) {
        play(authStore.token || '', uri)
      }
    }).catch(error => {
      console.error('Playback control error:', error)
    })
  }

  defineExpose({icon})
</script>

<style scoped>
.song-card {
  border-radius: 15px;
  box-shadow: 0px 0px 10px 2px rgba(125,125,125,0.3);
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  position: relative;
}

.song-content {
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.song-info {
  margin: auto;
  height: 100%;
  text-align: center;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.artist-name {
  font-size: 1.1em;
  opacity: 0.9;
  font-weight: 500;
}

.song-title {
  font-size: 1.3em;
  margin: 10px 0;
  font-weight: 600;
  line-height: 1.2;
}

.year-info {
  font-size: 4em;
}

.album-info {
  font-size: 0.9em;
  opacity: 0.8;
  margin-top: 8px;
  font-style: italic;
}

.playback-control {
  display: flex;
  height: 100%;
  justify-content: center;
  align-items: center;
  margin: auto;
}

.control-icon {
  cursor: pointer;
  transition: transform 0.2s, opacity 0.2s;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  padding: 10px;
}

.control-icon:hover {
  transform: scale(1.1);
  opacity: 0.8;
  background: rgba(255, 255, 255, 0.2);
}

.control-icon:active {
  transform: scale(0.95);
}

/* Color variants */
.song-card {
  background: linear-gradient(135deg, var(--v-theme-primary) 0%, var(--v-theme-secondary, #764ba2) 100%);
}


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