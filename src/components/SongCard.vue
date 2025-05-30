<template>
  <div>
    <v-container height="300px" width="300px">
      <div class="song-card" :style="{'background-color': color}">
        <div class="song-content">
          <!-- Song Info Display -->
          <div class="song-info">
            <h3 class="artist-name">{{ song.artists?.map(artist => artist.name).join(', ') || song.artist }}</h3>
            <h1 class="song-title">{{ song.name || song.title }}</h1>
            <p class="album-info" v-if="song.album?.name">{{ song.album.name }}</p>
          </div>
          
          <!-- Play/Pause Control -->
          <div class="playback-control">
            <v-icon 
              @click="toggle" 
              :icon="icon ? 'mdi-pause-circle-outline' : 'mdi-play-circle-outline'" 
              size="80px"
              color="white"
              class="control-icon"
            />
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
      spotify_uri?: string,
      uri?: string
    },
    color?: string
  }>()

  const icon = ref(true)

  // Get initial playback state
  getPlaybackState(authStore.token || '').then(result => icon.value = result).catch(() => {})

  function toggle() {
    getPlaybackState(authStore.token || '').then(result => {
      icon.value = !result
      const uri = song.spotify_uri || song.uri
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
  padding: 20px;
}

.song-info {
  text-align: center;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.artist-name {
  font-size: 1.1em;
  margin-bottom: 8px;
  opacity: 0.9;
  font-weight: 500;
}

.song-title {
  font-size: 1.3em;
  margin: 10px 0;
  font-weight: 600;
  line-height: 1.2;
}

.album-info {
  font-size: 0.9em;
  opacity: 0.8;
  margin-top: 8px;
  font-style: italic;
}

.playback-control {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 20px;
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
</style>