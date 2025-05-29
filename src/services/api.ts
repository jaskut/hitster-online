// API service for server-coordinated playback (music plays in client browsers)

// Get API base URL from environment or default to localhost
const API_BASE_URL = (typeof window !== 'undefined' && window.location.hostname !== 'localhost') 
  ? `http://${window.location.hostname}:3001`
  : 'http://localhost:3001';

// WebSocket connection for real-time coordination
let ws: WebSocket | null = null;
let wsCallbacks: ((data: any) => void)[] = [];

export function connectWebSocket() {
  const wsUrl = API_BASE_URL.replace('http', 'ws');
  ws = new WebSocket(wsUrl);
  
  ws.onopen = () => {
    console.log('Connected to game server');
  };
  
  ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    console.log('Server command:', data.type);
    wsCallbacks.forEach(callback => callback(data));
  };
  
  ws.onclose = () => {
    console.log('Disconnected from server, reconnecting...');
    // Reconnect after 3 seconds
    setTimeout(connectWebSocket, 3000);
  };
  
  ws.onerror = (error) => {
    console.error('WebSocket error:', error);
  };
}

export function onWebSocketMessage(callback: (data: any) => void) {
  wsCallbacks.push(callback);
}

export function sendToServer(message: any) {
  if (ws && ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(message));
  }
}

// API calls to our backend
export async function getPlaylist(playlistId: string, limit: number = 50) {
  const response = await fetch(`${API_BASE_URL}/api/playlist/${playlistId}?limit=${limit}`);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch playlist: ${response.statusText}`);
  }
  
  return await response.json();
}

export async function play(uri?: string) {
  const response = await fetch(`${API_BASE_URL}/api/play`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ uri }),
  });
  
  const result = await response.json();
  
  if (result.error) {
    throw new Error(result.error);
  }
  
  return result;
}

export async function pause() {
  const response = await fetch(`${API_BASE_URL}/api/pause`, {
    method: 'POST',
  });
  
  const result = await response.json();
  
  if (result.error) {
    throw new Error(result.error);
  }
  
  return result;
}

export async function getPlaybackState() {
  const response = await fetch(`${API_BASE_URL}/api/playback-state`);
  
  if (!response.ok) {
    throw new Error(`Failed to get playback state: ${response.statusText}`);
  }
  
  const result = await response.json();
  return result.is_playing;
}

// Initialize WebSocket connection
if (typeof window !== 'undefined') {
  connectWebSocket();
} 