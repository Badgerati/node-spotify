const https = require('https');
const request = require('request');
const querystring = require('querystring');


// add to module exports
module.exports = new Spotify();


// main spotify object
function Spotify() { }


// local control commands
Spotify.prototype.local = function(callback) {
    var port_and_tokens_found = false;    
    var local_endpoint = 'https://www.spotilocal.com:{port}';
    var oauth_token = null;
    var csrf_token = null;

    // complete the endpoint, and find the correct port.
    if (!port_and_tokens_found) {
        findPort.call(this, 4370, local_endpoint, function(err, port) {
            if (err) {
                console.log('Cannot find port for local instance of spotify');
                return;
            }
            else {
                local_endpoint = local_endpoint.replace('{port}', port);

                // get the auth tokens
                get.call(this, local_endpoint + '/simplecsrf/token.json', true, function(err, status, body) {
                    if (err) {
                        console.log('Failed to rerieve CSRF token for Spotify');
                        return;
                    }

                    csrf_token = body.token;

                    get.call(this, 'https://open.spotify.com/token', true, function(err, status, body) {
                        if (err) {
                            console.log('Failed to retrieve OAuth token for Spotify');
                            return;
                        }

                        oauth_token = body.t;
                        port_and_tokens_found = true;
                        callback(commands());
                    });
                });
            }
        });
    }
    else {
        callback(commands());
    }

    // local commands
    function commands() {
        return {
            play(uri, callback) {
                var url = getUrl('play', { uri: uri });

                get.call(this, url, false, function(err, status, body) {
                    if (callback) { callback(err); }
                });
            },

            pause(callback) {
                var url = getUrl('pause', { pause: true });

                get.call(this, url, false, function(err, status, body) {
                    if (callback) { callback(err); }
                });
            },

            resume(callback) {
                var url = getUrl('pause', { pause: false });

                get.call(this, url, false, function(err, status, body) {
                    if (callback) { callback(err); }
                });
            },

            status(callback) {
                var url = getUrl('status');

                get.call(this, url, true, function(err, status, body) {
                    callback(err, body);
                });
            }
        }
    }

    function getUrl(command, opts) {
        opts = Object.assign({ csrf: csrf_token, oauth: oauth_token }, opts);
        var query = querystring.stringify(opts);
        return (local_endpoint + `/remote/${command}.json?${query}`);
    }
}


// external api
Spotify.prototype.api = function() {
    const api_endpoint = 'https://api.spotify.com/v1';

    return {
        search(opts, callback) {
            var query = querystring.stringify(opts);
            var url = (api_endpoint + `/search?${query}`);
            get.call(this, url, true, function(err, status, body) {
                callback(err, body.artists);
            });
        },
        
        search_next(url, callback) {
            get.call(this, url, true, function(err, status, body) {
                callback(err, body.artists);
            });
        }
    }
}


// run a get request
function get(url, parse, callback) {
    var req_opts = {
        url: url,
        method: 'GET',
        headers: {
            'Origin': 'https://open.spotify.com'
        }
    };

    request((parse ? req_opts : url), function(err, res, body) {
        callback(err, (res ? res.statusCode : 0), (parse ? JSON.parse(body) : body));
    });
}

// attempt to locate the port number for the local spotify, this is usually 4370, but can be 4370-4380
function findPort(port, endpoint, callback) {
    if (port < 4370 || port > 4380) {
        callback(true, null);
        return;
    }

    var url = endpoint.replace('{port}', port);

    get(url, null, function(err, status, body) {
        // port found
        if (status == 404 && body.match(/missing method/i)) {
            callback(false, port);
        }
        // keep trying
        else {
            //console.log(`code: ${status}, port: ${port}, body: ${body}`);
            findPort(port + 1, endpoint, callback);
        }
    });
}
