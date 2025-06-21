# Spotify Playlist Cleaner

Spotify Playlist Cleaner is a web app that helps you manage and clean up your Spotify playlists. You can view your playlists, see the songs in each playlist, remove unwanted tracks, and play songs directly from your browser.

## Features

- **Spotify OAuth Login**: Securely log in with your Spotify account.
- **View Playlists**: See all your playlists and their details.
- **Edit Playlists**: Remove songs from any playlist.
- **Play Songs**: Instantly play any song in your playlists (requires Spotify Premium and an active device).
- **Responsive UI**: Built with Bootstrap for a clean, responsive interface.

## Setup

### Prerequisites

- [Node.js](https://nodejs.org/) (v14+ recommended)
- A [Spotify Developer Application](https://developer.spotify.com/dashboard/applications) with:
  - Redirect URI set to `http://localhost:3000/callback`

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/yourusername/Spotify_playlist_cleaner.git
   cd Spotify_playlist_cleaner
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment variables:**

   Create a `.env` file in the root directory with your Spotify credentials:
   ```
   SPOTIFY_CLIENT_ID=your_spotify_client_id
   SPOTIFY_CLIENT_SECRET=your_spotify_client_secret
   SPOTIFY_REDIRECT_URI=http://localhost:3000/callback
   ```

4. **Start the server:**
   ```bash
   npm run start
   ```
   The app will be available at [http://localhost:3000](http://localhost:3000).

## Usage

1. Open [http://localhost:3000](http://localhost:3000) in your browser.
2. Click "Click to Login" and authorize the app with your Spotify account.
3. Browse your playlists, remove songs, and play tracks as desired.

## Notes

- **Spotify Premium Required:** Playback features require a Spotify Premium account and an active Spotify device (desktop, mobile, or web player open and active).
- **Scopes:** The app requests the following Spotify scopes:
  - `user-read-private`
  - `user-read-email`
  - `user-modify-playback-state`
  - `playlist-modify-private`
  - `playlist-modify-public`

## Project Structure

```
/client
  /scripts
    index.js         # Frontend logic
  index.html         # Main UI
server.js            # Express backend
.env                 # Environment variables 
```

## License

MIT

---

*This project is not affiliated with or endorsed by Spotify.*