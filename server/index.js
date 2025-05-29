import express from 'express';
import cors from 'cors';
import { WebSocketServer } from 'ws';
import fetch from 'node-fetch';
import { createServer } from 'http';

const app = express();
const server = createServer(app);
const wss = new WebSocketServer({ server });

app.use(cors());
app.use(express.json());

// Environment variables (you'll need to set these on your server)
const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;
const SPOTIFY_REDIRECT_URI = process.env.SPOTIFY_REDIRECT_URI;

// Spotify endpoints
const SPOTIFY_AUTH_URL = 'https://accounts.spotify.com/authorize';
const SPOTIFY_TOKEN_URL = 'https://accounts.spotify.com/api/token';
const SPOTIFY_API_URL = 'https://api.spotify.com/v1';

// Server state
let spotifyToken = null;
let refreshToken = null;
let currentSong = null;
let isPlaying = false;
let gameState = {
  currentSongIndex: 0,
  songs: [],
  isPlaying: false,
  currentSong: null
};

// Initialize Spotify authentication
async function initializeSpotifyAuth() {
  console.log('Starting Spotify OAuth flow...');
  console.log('Please visit this URL to authenticate:');
  
  const scopes = 'user-read-private user-read-email playlist-read-private playlist-read-collaborative';
  const authUrl = `${SPOTIFY_AUTH_URL}?response_type=code&client_id=${SPOTIFY_CLIENT_ID}&scope=${encodeURIComponent(scopes)}&redirect_uri=${encodeURIComponent(SPOTIFY_REDIRECT_URI)}`;
  
  console.log(authUrl);
  console.log('\nAfter authorizing, you will be redirected. Copy the "code" parameter from the URL and make a POST request to /auth/callback with the code.');
  console.log('\nNote: This server will coordinate playback, but music will play in client browsers (not on this headless server).');
}

// Handle Spotify callback
app.post('/auth/callback', async (req, res) => {
  const { code } = req.body;
  
  try {
    const response = await fetch(SPOTIFY_TOKEN_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: SPOTIFY_REDIRECT_URI,
        client_id: SPOTIFY_CLIENT_ID,
        client_secret: SPOTIFY_CLIENT_SECRET,
      }),
    });

    const tokenData = await response.json();
    spotifyToken = tokenData.access_token;
    refreshToken = tokenData.refresh_token;
    
    console.log('Spotify authentication successful! Server can now access playlists.');
    res.json({ success: true, message: 'Spotify authenticated successfully' });
  } catch (error) {
    console.error('Error exchanging code for token:', error);
    res.status(500).json({ error: 'Failed to authenticate with Spotify' });
  }
});

// Refresh Spotify token
async function refreshSpotifyToken() {
  if (!refreshToken) return false;
  
  try {
    const response = await fetch(SPOTIFY_TOKEN_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
        client_id: SPOTIFY_CLIENT_ID,
        client_secret: SPOTIFY_CLIENT_SECRET,
      }),
    });

    const tokenData = await response.json();
    spotifyToken = tokenData.access_token;
    return true;
  } catch (error) {
    console.error('Error refreshing token:', error);
    return false;
  }
}

// Spotify API helper (for playlist access only, not playback)
async function spotifyRequest(endpoint, options = {}) {
  if (!spotifyToken) throw new Error('No Spotify token available');
  
  const response = await fetch(`${SPOTIFY_API_URL}${endpoint}`, {
    ...options,
    headers: {
      'Authorization': `Bearer ${spotifyToken}`,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (response.status === 401) {
    // Token expired, try to refresh
    if (await refreshSpotifyToken()) {
      // Retry the request with new token
      return spotifyRequest(endpoint, options);
    }
    throw new Error('Spotify authentication expired');
  }

  return response;
}

// API Routes
app.get('/api/playlist/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const limit = req.query.limit || 50;
    
    const response = await spotifyRequest(`/playlists/${id}/tracks?limit=${limit}`);
    const data = await response.json();
    
    res.json(data);
  } catch (error) {
    console.error('Error fetching playlist:', error);
    res.status(500).json({ error: error.message });
  }
});

// Coordinate playback across clients (server doesn't play music itself)
app.post('/api/play', async (req, res) => {
  try {
    const { uri } = req.body;
    
    gameState.currentSong = uri;
    gameState.isPlaying = true;
    
    console.log(`Broadcasting play command for: ${uri}`);
    
    // Broadcast play command to all connected clients
    broadcastToClients({ 
      type: 'play_command', 
      uri: uri,
      isPlaying: true 
    });
    
    res.json({ success: true, message: 'Play command sent to all clients' });
  } catch (error) {
    console.error('Error coordinating playback:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/pause', async (req, res) => {
  try {
    gameState.isPlaying = false;
    
    console.log('Broadcasting pause command');
    
    // Broadcast pause command to all connected clients
    broadcastToClients({ 
      type: 'pause_command',
      isPlaying: false 
    });
    
    res.json({ success: true, message: 'Pause command sent to all clients' });
  } catch (error) {
    console.error('Error coordinating pause:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/playback-state', async (req, res) => {
  try {
    res.json({ is_playing: gameState.isPlaying });
  } catch (error) {
    console.error('Error getting playback state:', error);
    res.status(500).json({ error: error.message });
  }
});

// WebSocket for real-time coordination
function broadcastToClients(message) {
  console.log(`Broadcasting to ${wss.clients.size} clients:`, message.type);
  wss.clients.forEach(client => {
    if (client.readyState === client.OPEN) {
      client.send(JSON.stringify(message));
    }
  });
}

wss.on('connection', (ws) => {
  console.log('Client connected to WebSocket');
  
  // Send current state to new client
  ws.send(JSON.stringify({
    type: 'sync_state',
    isPlaying: gameState.isPlaying,
    currentSong: gameState.currentSong,
  }));
  
  // Handle client status updates
  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);
      if (data.type === 'playback_status') {
        console.log('Client playback status:', data);
      }
    } catch (error) {
      console.error('Error parsing WebSocket message:', error);
    }
  });
  
  ws.on('close', () => {
    console.log('Client disconnected from WebSocket');
  });
});

const PORT = process.env.PORT || 3001;

server.listen(PORT, () => {
  console.log(`🎵 Hitster Online Server running on port ${PORT}`);
  console.log(`🌐 Accessible at: http://your-server-ip:${PORT}`);
  
  if (!SPOTIFY_CLIENT_ID || !SPOTIFY_CLIENT_SECRET) {
    console.log('\n⚠️  Missing Spotify credentials!');
    console.log('Please set these environment variables:');
    console.log('- SPOTIFY_CLIENT_ID');
    console.log('- SPOTIFY_CLIENT_SECRET');
    console.log('- SPOTIFY_REDIRECT_URI (e.g., http://your-server-ip:3001/callback)');
  } else {
    console.log('\n🔐 Server ready for Spotify authentication...');
    initializeSpotifyAuth();
  }
  
  console.log('\n📱 Headless Server Mode:');
  console.log('   - Server coordinates the game');
  console.log('   - Clients play music in their browsers');
  console.log('   - All clients stay synchronized');
}); 