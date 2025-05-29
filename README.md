# Hitster Online

Online version of Hitster - a music timeline guessing game.

## Architecture

This app uses a **client-server architecture** where:

- **Server (Machine A)**: Handles Spotify authentication and music playback
- **Client (Machine B)**: Web browser interface for game control

This allows multiple users to join the game from different devices without needing their own Spotify accounts.

## Install

### Frontend Setup

Set up your project using your preferred package manager:

| Package Manager                                               | Command        |
|---------------------------------------------------------------|----------------|
| [yarn](https://yarnpkg.com/getting-started)                   | `yarn install` |
| [npm](https://docs.npmjs.com/cli/v7/commands/npm-install)     | `npm install`  |
| [pnpm](https://pnpm.io/installation)                          | `pnpm install` |
| [bun](https://bun.sh/#getting-started)                        | `bun install`  |

### Backend Setup

1. **Set up Spotify App** (see [Getting started](https://developer.spotify.com/documentation/web-api/tutorials/getting-started)):
   - Set Redirect URI to `http://localhost:3001/callback`
   - Get Client ID and Client Secret

2. **Configure Server Environment**:
   Create `server/.env` file:
   ```env
   SPOTIFY_CLIENT_ID=your_client_id
   SPOTIFY_CLIENT_SECRET=your_client_secret
   SPOTIFY_REDIRECT_URI=http://localhost:3001/callback
   PORT=3001
   ```

3. **Install and Start Server**:
   ```bash
   npm install
   npm run server
   ```

4. **Authenticate Spotify**:
   - Server will print authentication URL
   - Visit URL and authorize your Spotify account
   - Follow authentication steps in `server/README.md`

## Usage

### Starting the Full Application

```bash
# Start both server and frontend
npm run dev:full

# Or start separately:
npm run server    # Backend on port 3001
npm run dev       # Frontend on port 3000
```

### Important Notes

- **Server Machine (A)**: Must have Spotify app open and playing before starting game
- **Client Machine (B)**: Just needs web browser access to `http://MACHINE_A_IP:3000`
- **First Time**: Make sure to authenticate server with Spotify (see server/README.md)

### Troubleshooting Music Playback

If music doesn't start playing:

1. **On Server Machine**: Open Spotify app and play any song
2. **Check Authentication**: Ensure server is authenticated with Spotify
3. **Active Device**: Spotify needs an "active device" - play something in Spotify first
4. **Server Logs**: Check server console for error messages

### Building for Production

To build your project for production:

```bash
npm run build
```

## Game Instructions

1. **Listen** to the song snippet
2. **Guess** what year it was released
3. **Click** the card to reveal the answer
4. **Navigate** with left/right arrows to next/previous songs

The goal is to build a mental timeline of music history!
