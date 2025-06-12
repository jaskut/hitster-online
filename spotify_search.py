#!/usr/bin/env python3
"""
Spotify Song Search Script
Gets Spotify URI for a given song title and artist.
"""

import spotipy
from spotipy.oauth2 import SpotifyClientCredentials
import os
import sys
import json


def get_spotify_uri(artist, title, client_id=None, client_secret=None):
    """
    Search for a song on Spotify and return its URI.
    
    Args:
        artist (str): The artist name
        title (str): The song title
        client_id (str, optional): Spotify client ID. If not provided, will try to get from env
        client_secret (str, optional): Spotify client secret. If not provided, will try to get from env
    
    Returns:
        str: Spotify URI if found, None if not found
        dict: Full track info if found, None if not found
    """
    
    # Get credentials from parameters or environment variables
    if not client_id:
        client_id = os.getenv('SPOTIFY_CLIENT_ID')
    if not client_secret:
        client_secret = os.getenv('SPOTIFY_CLIENT_SECRET')
    
    if not client_id or not client_secret:
        raise ValueError("Spotify credentials not found. Please provide client_id and client_secret or set SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET environment variables.")
    
    # Authenticate with Spotify
    client_credentials_manager = SpotifyClientCredentials(
        client_id=client_id,
        client_secret=client_secret
    )
    sp = spotipy.Spotify(client_credentials_manager=client_credentials_manager)
    
    # Search for the track
    query = f"artist:{artist} track:{title}"
    results = sp.search(q=query, type='track', limit=10)
    
    if results['tracks']['items']:
        # Return the first (most relevant) result
        track = results['tracks']['items'][0]
        return track['uri'], track
    
    # Try a more general search if specific search fails
    query = f"{artist} {title}"
    results = sp.search(q=query, type='track', limit=10)
    
    if results['tracks']['items']:
        track = results['tracks']['items'][0]
        return track['uri'], track
    
    return None, None


def main():
    """Command line interface for the script."""
    if len(sys.argv) != 3:
        print("Usage: python spotify_search.py <artist> <title>")
        print("Example: python spotify_search.py \"The Beatles\" \"Hey Jude\"")
        sys.exit(1)
    
    artist = sys.argv[1]
    title = sys.argv[2]
    
    try:
        uri, track_info = get_spotify_uri(artist, title)
        
        if uri:
            print(f"Found: {track_info['artists'][0]['name']} - {track_info['name']}")
            print(f"Spotify URI: {uri}")
            print(f"Album: {track_info['album']['name']} ({track_info['album']['release_date'][:4]})")
            
            # Also create the JSON format that your Hitster app expects
            hitster_data = {
                "spotify_uri": uri,
                "artist": track_info['artists'][0]['name'],
                "title": track_info['name'],
                "year": int(track_info['album']['release_date'][:4])
            }
            
            print("\nHitster QR Code JSON:")
            print(json.dumps(hitster_data, indent=2))
            
        else:
            print(f"No results found for: {artist} - {title}")
            sys.exit(1)
            
    except Exception as e:
        print(f"Error: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main() 