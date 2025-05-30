<template>
  <div class="qr-scanner">
    <div v-if="!isScanning" class="scanner-controls">
      <v-btn 
        @click="startScanning" 
        color="primary" 
        size="large"
        prepend-icon="mdi-qrcode-scan"
        :disabled="!canScan"
      >
        Scan QR Code
      </v-btn>
      
      <div v-if="!canScan" class="error-message">
        <v-icon color="warning">mdi-camera-off</v-icon>
        <p>Camera access required to scan QR codes</p>
      </div>
    </div>

    <div v-if="isScanning" class="scanner-container">
      <div class="scanner-header">
        <h3>Scan a Hitster QR Code</h3>
        <v-btn 
          @click="stopScanning" 
          icon="mdi-close" 
          variant="text"
          color="white"
        />
      </div>
      
      <div class="camera-container">
        <video ref="videoElement" autoplay playsinline></video>
        <div class="scanner-overlay">
          <div class="scanner-frame"></div>
          <p class="scanner-instruction">Point camera at QR code</p>
        </div>
      </div>
      
      <div v-if="scanError" class="scan-error">
        <v-icon color="error">mdi-alert</v-icon>
        <span>{{ scanError }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Use dynamic import to avoid build issues
let QrScanner: any = null

const emit = defineEmits<{
  songScanned: [songData: any]
  scanError: [error: string]
}>()

const isScanning = ref(false)
const canScan = ref(false)
const scanError = ref('')
const videoElement = ref<HTMLVideoElement>()
let qrScanner: any = null

// Initialize QR Scanner library
onMounted(async () => {
  try {
    // Dynamic import to handle module loading
    const QrScannerModule = await import('qr-scanner')
    QrScanner = QrScannerModule.default || QrScannerModule
    
    // Check if camera is available
    canScan.value = await QrScanner.hasCamera()
  } catch (error) {
    console.error('Failed to load QR Scanner library:', error)
    scanError.value = 'QR Scanner not available'
  }
})

async function startScanning() {
  console.log('startScanning called')
  console.log('videoElement:', videoElement.value)
  console.log('QrScanner loaded:', !!QrScanner)
  
  if (!videoElement.value || !QrScanner) {
    console.error('Missing requirements:', { videoElement: !!videoElement.value, QrScanner: !!QrScanner })
    scanError.value = 'QR Scanner not ready'
    return
  }
  
  try {
    console.log('Starting camera...')
    scanError.value = ''
    
    qrScanner = new QrScanner(
      videoElement.value,
      async (result) => {
        console.log('QR code detected:', result.data)
        await handleQRResult(result.data)
      },
      {
        onDecodeError: (error) => {
          console.log('QR decode error:', error)
        },
        highlightScanRegion: true,
        highlightCodeOutline: true,
      }
    )
    
    console.log('QrScanner created, starting...')
    await qrScanner.start()
    console.log('Camera started successfully')
    isScanning.value = true
    
  } catch (error) {
    console.error('Scanner error:', error)
    scanError.value = `Failed to start camera: ${error.message}`
    emit('scanError', scanError.value)
  }
}

function stopScanning() {
  if (qrScanner) {
    qrScanner.stop()
    qrScanner.destroy()
    qrScanner = null
  }
  isScanning.value = false
  scanError.value = ''
}

async function handleQRResult(qrData: string) {
  try {
    console.log('QR Code scanned:', qrData)
    
    let songData = null
    
    // Try to parse as JSON first (our preferred format)
    try {
      songData = JSON.parse(qrData)
      
      // Validate required fields
      if (!songData.spotify_uri && !songData.uri) {
        throw new Error('Missing Spotify URI in QR code')
      }
      
      // Ensure we have all required fields
      if (!songData.artist && !songData.artists) {
        songData.artist = 'Unknown Artist'
      }
      if (!songData.title && !songData.name) {
        songData.title = 'Unknown Song'
      }
      if (!songData.year) {
        songData.year = 'Unknown Year'
      }
      
      // Normalize the format to match SongCard expectations
      if (songData.artist && !songData.artists) {
        songData.artists = [{ name: songData.artist }]
      }
      if (songData.title && !songData.name) {
        songData.name = songData.title
      }
      
    } catch {
      // Not JSON, try other formats
      if (qrData.startsWith('spotify:track:')) {
        // Spotify URI format: spotify:track:TRACK_ID
        songData = await fetchSpotifyTrackData(qrData)
      } else if (qrData.startsWith('https://open.spotify.com/track/')) {
        // Spotify URL format: https://open.spotify.com/track/TRACK_ID
        const trackId = qrData.split('/track/')[1].split('?')[0]
        songData = await fetchSpotifyTrackData(`spotify:track:${trackId}`)
      } else {
        throw new Error('Unrecognized QR code format. Expected JSON with song data.')
      }
    }
    
    if (songData) {
      emit('songScanned', songData)
      stopScanning()
    }
    
  } catch (error) {
    console.error('QR processing error:', error)
    scanError.value = `Invalid QR code: ${error.message}`
    emit('scanError', scanError.value)
  }
}

async function fetchSpotifyTrackData(uri: string) {
  // Import the Spotify API calls
  const { useAuthStore } = await import('@/stores/auth')
  const { getUserData } = await import('@/spotify/calls')
  
  const authStore = useAuthStore()
  const trackId = uri.split(':')[2]
  
  try {
    // Make a request to Spotify API to get track details
    const response = await fetch(`https://api.spotify.com/v1/tracks/${trackId}`, {
      headers: {
        'Authorization': `Bearer ${authStore.token}`
      }
    })
    
    if (!response.ok) {
      throw new Error('Failed to fetch track data from Spotify')
    }
    
    const trackData = await response.json()
    
    // Convert to our expected format
    return {
      spotify_uri: uri,
      uri: uri,
      id: trackData.id,
      name: trackData.name,
      title: trackData.name,
      artists: trackData.artists,
      artist: trackData.artists[0]?.name || 'Unknown Artist',
      album: {
        name: trackData.album?.name,
        release_date: trackData.album?.release_date
      },
      year: trackData.album?.release_date ? new Date(trackData.album.release_date).getFullYear() : 'Unknown',
      preview_url: trackData.preview_url
    }
    
  } catch (error) {
    console.error('Error fetching Spotify track data:', error)
    
    // Return a basic structure if API fails
    return {
      spotify_uri: uri,
      uri: uri,
      id: trackId,
      name: 'Unknown Song',
      title: 'Unknown Song',
      artists: [{ name: 'Unknown Artist' }],
      artist: 'Unknown Artist',
      album: { 
        name: 'Unknown Album',
        release_date: '2000-01-01'
      },
      year: 'Unknown'
    }
  }
}

// Cleanup on unmount
onUnmounted(() => {
  stopScanning()
})
</script>

<style scoped>
.qr-scanner {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}

.scanner-controls {
  text-align: center;
}

.error-message {
  margin-top: 16px;
  opacity: 0.7;
}

.scanner-container {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: black;
  z-index: 1000;
  display: flex;
  flex-direction: column;
}

.scanner-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background: rgba(0, 0, 0, 0.8);
  color: white;
}

.camera-container {
  flex: 1;
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
}

video {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.scanner-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  pointer-events: none;
}

.scanner-frame {
  width: 250px;
  height: 250px;
  border: 3px solid white;
  border-radius: 12px;
  box-shadow: 0 0 0 99999px rgba(0, 0, 0, 0.5);
}

.scanner-instruction {
  color: white;
  margin-top: 20px;
  text-align: center;
  background: rgba(0, 0, 0, 0.7);
  padding: 8px 16px;
  border-radius: 20px;
}

.scan-error {
  position: absolute;
  bottom: 100px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(244, 67, 54, 0.9);
  color: white;
  padding: 12px 20px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 8px;
}
</style> 