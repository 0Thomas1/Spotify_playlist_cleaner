const express = require("express");
const app = express();
const PORT = process.env.PORT || 3000;
const redirect_uri = "http://localhost:" + PORT + "/callback";
const stateKey = "spotify_auth_state";
const client_id = process.env.SPOTIFY_CLIENT_ID;
const client_secret = process.env.SPOTIFY_CLIENT_SECRET;
const crypto = require("crypto");
const querystring = require("querystring");
const cookieParser = require("cookie-parser");
const request = require("request");

const generateRandomString = (length) => {
  return crypto.randomBytes(60).toString("hex").slice(0, length);
};

app
  .use(express.static(__dirname + "/client", { index: "index.html" }))
  .use(cookieParser())
  .use(express.json());

app.get("/fetchUser", async (req, res) => {
  let query = req.query;
  console.log("Query Parameters:", query);
  let token = query.access_token || req.headers.authorization?.split(" ")[1];
  console.log("Access Token:", token);
  let result = await fetch("https://api.spotify.com/v1/me", {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
  });
  result = await result.json();
  console.log("User Info:", result);
  res.send(result);
});

app.get("/playSong", async (req, res) => {
  let query = req.query;
  console.log("Query Parameters:", query);
  let token = query.access_token || req.headers.authorization?.split(" ")[1];
  let songId = query.songId;


  let result = await fetch(`https://api.spotify.com/v1/me/player/play`, {
    method: "PUT",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({ uris: [songId] }),
  });

  if (result.error) {
    res.send(result.error);
  } else {
    res.send({ message: "Song is now playing" });
  }
});
app.get("/fetchSongs", async (req, res) => {
  let query = req.query;
  console.log("Query Parameters:", query);
  let token = query.access_token;
  let playlistId = query.playlistId;
  console.log("Access Token:", token);
  let result = await fetch(
    `https://api.spotify.com/v1/playlists/${playlistId}/tracks`,
    {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  result = await result.json();
  res.send(result);
});

app.delete("/removeSong", async (req, res) => {
  let query = req.query;
  console.log("Query Parameters:", query);
  let token = query.access_token || req.headers.authorization?.split(" ")[1];
  let songId = query.songId;
  let playlistId = query.playlistId;
  console.log("Access Token:", token);
  console.log("Song ID:", songId);
  console.log("Playlist ID:", playlistId);

  let result = await fetch(
    `https://api.spotify.com/v1/playlists/${playlistId}/tracks`,
    {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify({ tracks: [{ uri: songId }] }),
    }
  );

  if (result.error) {
    res.send(result.error);
  } else {
    res.send({ message: "Song removed from playlist" });
  }
});

app.get("/fetchUserPlaylists", async (req, res) => {
  let query = req.query;
  console.log("Query Parameters:", query);
  let token = query.access_token || req.headers.authorization?.split(" ")[1];
  console.log("Access Token:", token);
  let result = await fetch("https://api.spotify.com/v1/me/playlists", {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
  });
  result = await result.json();
  console.log("User Playlists:", result);
  res.send(result);
});
app.get("/login", (req, res) => {
  let state = generateRandomString(16);
  res.cookie(stateKey, state);

  // your application requests authorization
  let scope =
    "user-read-private user-read-email user-modify-playback-state playlist-modify-private playlist-modify-public";
  res.redirect(
    "https://accounts.spotify.com/authorize?" +
      querystring.stringify({
        response_type: "code",
        client_id: client_id,
        scope: scope,
        redirect_uri: redirect_uri,
        state: state,
      })
  );
});
app.get("/", (req, res) => {});

app.get("/callback", function (req, res) {
  // your application requests refresh and access tokens
  // after checking the state parameter

  let code = req.query.code || null;
  let state = req.query.state || null;
  let storedState = req.cookies ? req.cookies[stateKey] : null;

  if (state === null || state !== storedState) {
    res.redirect(
      "/#" +
        querystring.stringify({
          error: "state_mismatch",
        })
    );
  } else {
    res.clearCookie(stateKey);
    let authOptions = {
      url: "https://accounts.spotify.com/api/token",
      form: {
        code: code,
        redirect_uri: redirect_uri,
        grant_type: "authorization_code",
      },
      headers: {
        "content-type": "application/x-www-form-urlencoded",
        Authorization:
          "Basic " +
          new Buffer.from(client_id + ":" + client_secret).toString("base64"),
      },
      json: true,
    };
    request.post(authOptions, function (error, response, body) {
      if (!error && response.statusCode === 200) {
        let access_token = body.access_token,
          refresh_token = body.refresh_token;

        let options = {
          url: "https://api.spotify.com/v1/me",
          headers: { Authorization: "Bearer " + access_token },
          json: true,
        };

        // use the access token to access the Spotify Web API
        request.get(options, function (error, response, body) {
          console.log(body);
        });

        // we can also pass the token to the browser to make requests from there
        res.redirect(
          "/#" +
            querystring.stringify({
              access_token: access_token,
              refresh_token: refresh_token,
            })
        );
      } else {
        res.redirect(
          "/#" +
            querystring.stringify({
              error: "invalid_token",
            })
        );
      }
    });
  }
});

app.get("/refresh_token", function (req, res) {
  var refresh_token = req.query.refresh_token;
  var authOptions = {
    url: "https://accounts.spotify.com/api/token",
    headers: {
      "content-type": "application/x-www-form-urlencoded",
      Authorization:
        "Basic " +
        new Buffer.from(client_id + ":" + client_secret).toString("base64"),
    },
    form: {
      grant_type: "refresh_token",
      refresh_token: refresh_token,
    },
    json: true,
  };

  request.post(authOptions, function (error, response, body) {
    if (!error && response.statusCode === 200) {
      let access_token = body.access_token,
        refresh_token = body.refresh_token;
      res.send({
        access_token: access_token,
        refresh_token: refresh_token,
      });
    }
  });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
