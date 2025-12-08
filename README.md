# Hitster Online

Online version of Hitster - a music timeline guessing game using **QR code scanning** from physical cards.

## Game Concept

**Hitster Online** combines physical cards with digital gameplay:

- 🃏 **Physical Cards**: Each card has a QR code containing song information
- 📱 **Digital Interface**: Smartphone/tablet scans QR codes and plays music
- 🎵 **Interactive Gameplay**: Listen, guess the year, check the physical card for answers
- 👥 **Social Gaming**: Perfect for parties and group play

## How to Play

1. **📱 Scan QR Code**: Point your phone camera at a Hitster card's QR code
2. **🎵 Listen to Song**: Music starts playing automatically from Spotify
3. **🤔 Make Your Guess**: Discuss and guess what year the song was released
4. **🃏 Check Answer**: Flip the physical card to see the correct year
5. **🔄 Repeat**: Scan the next card to continue the game!

## Install

Set up your project using your preferred package manager:

| Package Manager                                               | Command        |
|---------------------------------------------------------------|----------------|
| [yarn](https://yarnpkg.com/getting-started)                   | `yarn install` |
| [npm](https://docs.npmjs.com/cli/v7/commands/npm-install)     | `npm install`  |
| [pnpm](https://pnpm.io/installation)                          | `pnpm install` |
| [bun](https://bun.sh/#getting-started)                        | `bun install`  |

### Spotify Setup

1. **Create Spotify App** (see [Getting started](https://developer.spotify.com/documentation/web-api/tutorials/getting-started)):
   - Set Redirect URI to where your app runs, e.g., `https://localhost:3000/login`
   - Get Client ID and Client Secret

2. **Add Environment Variables**:
   Create `.env` file:
   ```env
   VITE_SPOTIFY_CLIENT_ID=your_client_id
   VITE_SPOTIFY_CLIENT_SECRET=your_client_secret
   VITE_SPOTIFY_REDIRECT_URL=https://localhost:3000/login
   VITE_SPOTIFY_AUTH_URL=https://accounts.spotify.com/authorize
   VITE_SPOTIFY_TOKEN_URL=https://accounts.spotify.com/api/token
   ```

### Https Setup
   Add a `localhost.pem` and `localhost-key.pem` file (for testing a self-signed is sufficient).

## Usage

### Starting the Application

```bash
# Start development server
npm run dev

# Access at: https://localhost:3000
```

### First Time Setup

1. **Open the app** on your smartphone/tablet
2. **Login with Spotify** when prompted
3. **Allow camera permissions** for QR scanning
4. **Test with a QR code** (see format below)

## QR Code Format

QR codes should contain JSON with song information:

```json
{
  "spotify_uri": "spotify:track:4iV5W9uYEdYUVa79Axb7Rh",
  "artist": "The Beatles",
  "title": "Hey Jude", 
  "year": 1968
}
```

**Supported formats:**
- ✅ **JSON format** (recommended) - includes all song data
- ✅ **Spotify URI** - e.g., `spotify:track:TRACK_ID`
- ✅ **Spotify URL** - e.g., `https://open.spotify.com/track/TRACK_ID`

## Mobile-First Design

This app is **optimized for smartphones**:
- 📱 **Touch-friendly** interface
- 📷 **Camera integration** for QR scanning
- 🎵 **Spotify Web Playback** - no app switching needed
- 💫 **Responsive design** works on any screen size

## Troubleshooting

### Camera Issues
- **Grant camera permissions** when prompted
- **Use HTTPS** (required for camera access)
- **Good lighting** helps QR code detection

### Music Playback Issues
- **Login to Spotify** in the app
- **Have Spotify Premium** (required for Web Playback API)
- **Start playing music** in Spotify app first to activate device

### QR Code Issues
- **Check QR format** - must be valid JSON or Spotify URI
- **Ensure good contrast** and clear printing
- **Hold steady** when scanning

## Perfect For:

- 🎉 **House Parties** - interactive music game
- 👨‍👩‍👧‍👦 **Family Gatherings** - test your music knowledge across generations  
- 🍻 **Game Nights** - social and educational
- 🎓 **Music Education** - learn about music history
- 🎁 **Custom Gift** - create personalized card sets

## Future Features

- 📊 **Score tracking** across multiple rounds
- 🎯 **Difficulty levels** by decade/genre
- 🎨 **Custom card creation** tool
- 👥 **Multiplayer tournaments**

Enjoy your musical journey through time! 🎵✨
