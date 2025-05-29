# Hitster Online Server - Headless Mode

This server coordinates the Hitster game across multiple clients without requiring a GUI. Perfect for headless servers accessed via SSH.

## Architecture

- **Server**: Coordinates game state, manages playlists, synchronizes all clients
- **Clients**: Handle actual music playback in their browsers
- **No GUI Required**: Server runs entirely in CLI mode

## Setup

### 1. Environment Variables

Create a `.env` file in the server directory with:

```env
SPOTIFY_CLIENT_ID=your_spotify_client_id_here
SPOTIFY_CLIENT_SECRET=your_spotify_client_secret_here
SPOTIFY_REDIRECT_URI=http://your-server-ip:3001/callback
PORT=3001
```

**Important**: Use your server's actual IP address in the redirect URI, not localhost.

### 2. Spotify App Configuration

1. Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. Create a new app or edit existing one
3. Add redirect URI: `http://your-server-ip:3001/callback`
4. Copy Client ID and Client Secret to your `.env` file

### 3. Installation & Startup

```bash
# Install dependencies
npm install

# Start the server
npm run server
```

### 4. Authentication (One-time Setup)

1. **Server will print an authentication URL** - copy this URL
2. **Open the URL in any browser** (can be on a different machine)
3. **Authorize your Spotify account** 
4. **Copy the 'code' parameter** from the redirect URL
5. **Make the callback request**:

```bash
curl -X POST http://your-server-ip:3001/auth/callback \
  -H "Content-Type: application/json" \
  -d '{"code": "YOUR_CODE_HERE"}'
```

✅ Server is now authenticated and ready!

## How It Works

### Server Responsibilities:
- ✅ Fetch playlists from Spotify
- ✅ Coordinate which song to play
- ✅ Synchronize all connected clients
- ✅ Manage game state

### Client Responsibilities:
- 🎵 Play music in browser using Spotify embeds
- 🎮 Display game interface
- 📡 Receive commands from server

### No Spotify App Needed on Server!
The server only needs API access to read playlists. All music playback happens in client browsers.

## API Endpoints

- `GET /api/playlist/:id` - Get playlist tracks from Spotify
- `POST /api/play` - Coordinate play command across all clients
- `POST /api/pause` - Coordinate pause command across all clients
- `GET /api/playback-state` - Get current game state
- `POST /auth/callback` - Spotify OAuth callback (one-time setup)

## WebSocket Commands

The server broadcasts these commands to keep clients synchronized:

- `play_command` - Tells all clients to play a specific track
- `pause_command` - Tells all clients to pause
- `sync_state` - Initial state when client connects

## Troubleshooting

### "No active Spotify device" Error
This error no longer applies! Clients handle their own playback.

### Authentication Issues
1. Make sure redirect URI matches exactly (including IP address)
2. Check that environment variables are set correctly
3. Verify Spotify app is configured properly

### Client Connection Issues
1. Check firewall settings on server
2. Ensure port 3001 is accessible
3. Verify clients can reach `http://your-server-ip:3001`

## Perfect for:
- ✅ Cloud servers (AWS, GCP, DigitalOcean, etc.)
- ✅ Raspberry Pi setups
- ✅ Docker containers
- ✅ Any headless Linux server
- ✅ SSH-only environments 