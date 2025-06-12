const baseUrl = import.meta.env.VITE_SPOTIFY_API_URL

export async function getUserData(token:string) {
  const response = await fetch(`${baseUrl}/me`, {
    method: 'GET',
    headers: { 'Authorization': 'Bearer ' + token },
  });

  return await response.json()
}

export async function search(token:string, query:string, type:string='track', limit:number=10) {
  const params = new URLSearchParams({
    q: `${query}`,
    type: type,
    limit: limit.toString(),
  })
  const searchUrl = new URL(`${baseUrl}/search`)
  searchUrl.search = params.toString()
  const response = await fetch(searchUrl, {
    method: 'GET',
    headers: { 'Authorization': 'Bearer ' + token },
  });

  return await response.json()
}

export async function play(token:string, uri?:string) {
  const playUrl = new URL(`${baseUrl}/me/player/play`)
  const response = await fetch(playUrl, {
    method: 'PUT',
    headers: { 
      'Authorization': 'Bearer ' + token,
      'Content-Type': 'application/json',
    },
    body: uri? `{"uris": ["${uri || ''}"]}` : undefined,
  });
  
  if (response.status == 404 && uri) {
    console.log('No active Spotify device found, opening in web player')
    let uriArray = uri?.split(':')
    window.open(`https://open.spotify.com/${uriArray[1]}/${uriArray[2]}`)
    return { success: true, method: 'web_player' }
  } else if (response.ok) {
    console.log('Song started playing on Spotify device')
    return { success: true, method: 'device' }
  } else {
    console.error('Playback failed:', response.status, response.statusText)
    throw new Error(`Playback failed: ${response.status} ${response.statusText}`)
  }
}

export async function pause(token:string) {
  const pauseUrl = new URL(`${baseUrl}/me/player/pause`)
  const response = await fetch(pauseUrl, {
    method: 'PUT',
    headers: { 
      'Authorization': 'Bearer ' + token,
    },
  });
}

export async function getPlaybackState(token:string) {
  const pauseUrl = new URL(`${baseUrl}/me/player`)
  const response = await fetch(pauseUrl, {
    method: 'GET',
    headers: { 
      'Authorization': 'Bearer ' + token,
      'Content-Type': 'application/json',
    },
  });

  const state = await response.json()
  return state.is_playing
}

export async function getPlaylist(token:string, id:string, limit:number=50) {
  var result = Array<any>()

  const params = new URLSearchParams({
    limit: limit.toString(),
  })
  const getUrl = new URL(`${baseUrl}/playlists/${id}/tracks`)
  getUrl.search = new URLSearchParams(params).toString()
  var response = await fetch(getUrl, {
    method: 'GET',
    headers: { 'Authorization': 'Bearer ' + token },
  })
  var answer = await response.json()
  result = result.concat(answer.items)

  while (answer.next) {
    response = await fetch(answer.next, {
      method: 'GET',
      headers: { 'Authorization': 'Bearer ' + token },
    });
    answer = await response.json()
    result = result.concat(answer.items)
  }

  return result
}

/*
export async function setDevice(token:string) {
  const response = await fetch(`${baseUrl}/me/player/devices`, {
    method: 'GET',
    headers: { 'Authorization': 'Bearer ' + token },
  });
  const devices = await response.json()
  console.log(devices)
  await fetch(`${baseUrl}/me/player`, {
    method: 'PUT',
    headers: { 
      'Authorization': 'Bearer ' + token,
      'Content-Type': 'application/json',
    },
    body: `{"device_ids": ["${devices.devices[0].id}"], "play": true}`,
  });
}*/