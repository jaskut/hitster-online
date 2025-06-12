<template>
  <main>
    <div class="game-container">
      <div class="d-flex justify-center mb-4">
        <h1>🎵 Hitster Game</h1>
      </div>

      <!-- Current Song Display -->
      <div v-if="currentSong" class="song-display">
        <song-card :song="currentSong" ref="songCard" />
      </div>

      <!-- QR Scanner Section -->
      <div class="scanner-section">
        <div v-if="!currentSong" class="welcome-message">
          <h2>Ready to Play!</h2>
          <p>Scan your first Hitster card to begin</p>
        </div>
        
        <div v-else class="next-song-section">
          <v-divider class="my-4"></v-divider>
          <p class="text-center mb-3">Ready for the next song?</p>
        </div>

        <QRScanner 
          @song-scanned="handleSongScanned" 
          @scan-error="handleScanError"
        />
      </div>

      <!-- Error Display -->
      <v-alert 
        v-if="errorMessage" 
        :type="errorMessage.includes('web player') ? 'info' : 'error'"
        closable 
        @click:close="errorMessage = ''"
        class="mt-4"
      >
        {{ errorMessage }}
      </v-alert>

      <!-- Game Instructions -->
      <div class="instructions mt-6">
        <v-card variant="outlined">
          <v-card-text>
            <h3>How to Play:</h3>
            <ol>
              <li>📱 Scan a Hitster QR code</li>
              <li>🎵 Listen to the song</li>
              <li>🤔 Guess what year it was released</li>
              <li>🃏 Check the answer on the physical card</li>
              <li>🔄 Scan the next card to continue!</li>
            </ol>
          </v-card-text>
        </v-card>
      </div>
    </div>
  </main>
</template>

<script setup lang="ts">
  import SongCard from '@/components/SongCard.vue'
  import QRScanner from '@/components/QRScanner.vue'
  import { play } from '@/spotify/calls'
  import { useAuthStore } from '@/stores/auth'

  const authStore = useAuthStore()
  const currentSong = ref(null)
  const errorMessage = ref('')
  const songCard = ref()

  function handleSongScanned(songData: any) {
    console.log('Song scanned:', songData)
    
    try {
      // Set the current song
      currentSong.value = songData
      
      // Play the song immediately
      if (songData.spotify_uri) {
        play(authStore.token || '', songData.spotify_uri)
          .then((result) => {
            console.log('Playback result:', result)
            if (result?.method === 'web_player') {
              errorMessage.value = 'Opened in Spotify web player. For best experience, keep Spotify open and playing.'
            } else {
              console.log('Song started playing on device')
            }
            
            if (songCard.value) {
              songCard.value.icon = true
            }
          })
          .catch(error => {
            console.error('Playback error:', error)
            errorMessage.value = 'Could not play song. Make sure you have Spotify Premium and the app is open.'
          })
      }
      
      // Clear any previous errors (but not the web player message)
      if (!errorMessage.value.includes('web player')) {
        errorMessage.value = ''
      }
      
    } catch (error) {
      console.error('Error handling scanned song:', error)
      errorMessage.value = 'Error processing scanned card'
    }
  }

  function handleScanError(error: string) {
    errorMessage.value = error
  }
</script>

<style scoped>
.game-container {
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
}

.song-display {
  display: flex;
  justify-content: center;
  margin: 20px 0;
}

.scanner-section {
  text-align: center;
  margin: 30px 0;
}

.welcome-message {
  margin-bottom: 30px;
}

.welcome-message h2 {
  color: #1976d2;
  margin-bottom: 10px;
}

.next-song-section {
  margin: 20px 0;
}

.instructions {
  margin-top: 40px;
}

.instructions ol {
  text-align: left;
  margin-left: 20px;
}

.instructions li {
  margin: 8px 0;
  font-size: 1.1em;
}
</style>