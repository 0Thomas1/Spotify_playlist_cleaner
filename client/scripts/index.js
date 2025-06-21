(async () => {
  function getHashParams() {
    const hash = window.location.hash.substring(1);
    return hash.split("&").reduce((res, item) => {
      const [key, value] = item.split("=");
      res[key] = decodeURIComponent(value);
      return res;
    }, {});
  }

  function displayPlaylists(playlists) {
    if (playlists && playlists.items) {
      playlists.items.forEach((playlist) => {
        const playlistItemframe = document.createElement("div");
        playlistItemframe.classList.add("col-3");
        const playlistItem = document.createElement("div");
        playlistItem.classList.add("card", "m-2");
        playlistItem.innerHTML = `<strong>${playlist.name}</strong> - ${
          playlist.description || "No description"
        }
        <a href="${
          playlist.external_urls.spotify
        }" target="_blank">View Playlist</a>
        <button class="btn btn-primary m-2 edit-playlist" id="${
          playlist.id
        }">Edit Playlist</button>`;
        playlistDiv.appendChild(playlistItemframe);
        playlistItemframe.appendChild(playlistItem);
      });
    } else {
      playlistDiv.innerHTML = "No playlists found.";
    }
  }

  async function displaySongs(playlistId) {
    playlistDiv.style.display = "none"; // Clear previous playlists

    let playlist = await fetch(
      "/fetchSongs?access_token=" + access_token + "&playlistId=" + playlistId
    );
    playlist = await playlist.json();
    console.log("Fetched Playlist:", playlist);
    let songs = playlist.items;

    songs.forEach((song) => {
      const songItem = document.createElement("div");
      songItem.classList.add("card", "m-2", "width-50");
      songItem.textContent = `${song.track.name} by ${song.track.artists
        .map((artist) => artist.name)
        .join(", ")}`;

      const btnsDiv = document.createElement("div");
      btnsDiv.classList.add("d-flex", "justify-content-between", "w-50");
      const removeBtn = document.createElement("button");
      removeBtn.classList.add("btn", "btn-danger");
      removeBtn.textContent = "Remove";
      removeBtn.onclick = async () => {
        const res = await fetch(
          "/removeSong?access_token=" +
            access_token +
            "&songId=" +
            song.track.uri +
            "&playlistId=" +
            playlistId,
          {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
        songItem.remove(); // Remove the song item from the UI
      };
      btnsDiv.appendChild(removeBtn);

      const playBtn = document.createElement("button");
      playBtn.classList.add("btn", "btn-success");
      playBtn.textContent = "Play";
      playBtn.onclick = async () => {
        let res = await fetch(
          "/playSong?access_token=" +
            access_token +
            "&songId=" +
            song.track.uri,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
        res = await res.json();
        console.log("Play response:", res);
      };

      btnsDiv.appendChild(playBtn);

      const nextBtn = document.createElement("button");
      nextBtn.classList.add("btn", "btn-secondary");
      nextBtn.textContent = "Next";
      btnsDiv.appendChild(nextBtn);

      songItem.appendChild(btnsDiv);
      songsDiv.appendChild(songItem);
    });
    songsDiv.style.display = "block"; // Show songs after fetching
  }

  const params = getHashParams();
  let access_token = params.access_token;
  let refresh_token = params.refresh_token;
  let error = params.error;
  let userDiv = document.getElementById("user-profile");
  const playlistDiv = document.getElementById("playlists");
  const songsDiv = document.getElementById("songs");
  if (error) {
    alert("error authing user");
  } else {
    if (access_token !== null) {
      let userInfo = await fetch("/fetchUser?access_token=" + access_token);
      userInfo = await userInfo.json();
      userDiv.innerHTML = userInfo.display_name || "No user info available";
      let userPlaylists = await fetch(
        "/fetchUserPlaylists?access_token=" + access_token
      );
      userPlaylists = await userPlaylists.json();
      displayPlaylists(userPlaylists);
    }
  }

  // You can now use access_token and refresh_token as needed
  console.log("Access Token:", access_token);
  console.log("Refresh Token:", refresh_token);
  console.log("Error: ", error);

  document.addEventListener("click", async (event) => {
    if (event.target.classList.contains("edit-playlist")) {
      songsDiv.innerHTML = ""; // Clear previous songs

      const playlistId = event.target.id;
      console.log("Selected Playlist ID:", playlistId);
      await displaySongs(playlistId);
      playlistDiv.classList.add("d-none"); // Hide playlists
    }
  });
})();
