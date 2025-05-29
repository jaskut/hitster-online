// Client-side Spotify Web Playback SDK integration
// This handles actual music playback in the browser

export class SpotifyWebPlayer {
  private player: any = null;
  private deviceId: string = '';
  private accessToken: string = '';
  private isReady: boolean = false;

  constructor() {
    this.initializePlayer();
  }

  private async initializePlayer() {
    // Load Spotify Web Playback SDK
    if (!window.Spotify) {
      await this.loadSpotifySDK();
    }

    // For now, we'll use embedded Spotify URLs as a simple solution
    // In a full implementation, you'd need proper OAuth for each client
    console.log('Spotify client player initialized (using embeds for demo)');
    this.isReady = true;
  }

  private loadSpotifySDK(): Promise<void> {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://sdk.scdn.co/spotify-player.js';
      script.async = true;
      document.body.appendChild(script);

      window.onSpotifyWebPlaybackSDKReady = () => {
        resolve();
      };
    });
  }

  // Simple implementation using Spotify embeds for demo
  async playTrack(uri: string) {
    console.log(`Client playing: ${uri}`);
    
    try {
      // Extract track ID from Spotify URI
      const trackId = uri.split(':')[2];
      
      // Create or update embedded player
      this.createEmbeddedPlayer(trackId);
      
      return true;
    } catch (error) {
      console.error('Error playing track:', error);
      return false;
    }
  }

  async pauseTrack() {
    console.log('Client pausing playback');
    
    // Find and pause any embedded players
    const iframes = document.querySelectorAll('iframe[src*="spotify.com/embed"]');
    iframes.forEach((iframe: any) => {
      // For embedded players, we'd need to use postMessage API
      // This is a simplified implementation
    });
    
    return true;
  }

  private createEmbeddedPlayer(trackId: string) {
    // Remove existing player
    const existingPlayer = document.getElementById('spotify-embed');
    if (existingPlayer) {
      existingPlayer.remove();
    }

    // Create new embedded player
    const iframe = document.createElement('iframe');
    iframe.id = 'spotify-embed';
    iframe.style.borderRadius = '12px';
    iframe.src = `https://open.spotify.com/embed/track/${trackId}?utm_source=generator&theme=0`;
    iframe.width = '100%';
    iframe.height = '152';
    iframe.frameBorder = '0';
    iframe.allow = 'autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture';
    iframe.loading = 'lazy';
    
    // Add to hidden container for background playback
    let container = document.getElementById('spotify-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'spotify-container';
      container.style.position = 'fixed';
      container.style.bottom = '20px';
      container.style.right = '20px';
      container.style.width = '300px';
      container.style.zIndex = '1000';
      container.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
      container.style.borderRadius = '12px';
      container.style.padding = '10px';
      document.body.appendChild(container);
    }
    
    container.appendChild(iframe);
  }

  getDeviceId(): string {
    return this.deviceId;
  }

  isPlayerReady(): boolean {
    return this.isReady;
  }
}

// Global player instance
let spotifyPlayer: SpotifyWebPlayer | null = null;

export function getSpotifyPlayer(): SpotifyWebPlayer {
  if (!spotifyPlayer) {
    spotifyPlayer = new SpotifyWebPlayer();
  }
  return spotifyPlayer;
}

// Declare global Spotify interface
declare global {
  interface Window {
    Spotify: any;
    onSpotifyWebPlaybackSDKReady: () => void;
  }
} 