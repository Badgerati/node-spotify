Simple node module to correct a local instance of Spotify, also supports some of the external API such as searching.

# Local Examples
```js
var spotify = require('./spotify.js');

// local finds the correct port for your Spotify, and returns the commands
spotify.local(function(cmds) {
    // to play a track/album/artist/playlist, pass the Spotify URI
    cmds.play('spotify:track:4vn4pHD5h0VHu1jzRTS8Dj');

    // resumes the currently playing track
    cmds.resume();

    // pauses the currently playing track
    cmds.pause();

    // returns the status of Spotify, and whatever track is currently set to play
    cmds.status(function(err, result) {
        console.log(result.playing);
    });
});
```

# API Examples
```js
var spotify = require('./spotify.js');

spotify.api().search({ q: 'steps', limit: 3, type: 'artist' }, function(err, result) {
    console.log(result);
});
```