///////////////////////////////////////
// FOR TESTING
///////////////////////////////////////

var spotify = require('./spotify.js');

spotify.local(function(cmds) {
    cmds.status(function(err, result) {
        console.log(result.playing);
    });

    //cmds.resume();

    //cmds.play('spotify:track:4vn4pHD5h0VHu1jzRTS8Dj');
});

spotify.api().search({ q: 'steps', limit: 3, type: 'artist' }, function(err, result) {
    console.log(result);
});

//spotify.local(function(cmds) {
//    cmds.play('spotify:track:4vn4pHD5h0VHu1jzRTS8Dj');
//});