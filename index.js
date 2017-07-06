var net = require('net');

// Get IP and port range from arguments or initialize default variables
// IP selector supports ranges (Ex: 192.168.0-2.0-255)
// As well as ports...
const ipSelector = process.argv[2] || '127.0.0.1';
const portSelector = process.argv[3] || '0-65535';

// Load IPs and ports as arrays
var ips = getIPs(ipSelector);
var ports = getPorts(portSelector);

// Try to connect each IP - port combination
ips.forEach(function (ip) {
    ports.forEach(function (port) {
        var socket = net.connect({ port: port, host: ip });
        socket.setTimeout(2000, function () {
            // Destroy connection after 2 seconds
            socket.destroy();
        });
        socket.on('connect', function () {
            // Print port if connection is successful
            console.log('OPEN : ' + ip + ':' + port);
        });
        socket.on('data', function (data) {
            // Print if any data is received
            console.log('DATA (' + ip + ':' + port + ') : ' + data.toString());
        });
        socket.on('error', function (e) {
            // Destroy connection silently if any error has occurred
            socket.destroy(e);
        });
    });
    console.log('Scanning : ' + ip);
});

/**
 *
 * @param {string} selector
 * @returns {Array}
 */
function getIPs(selector) {
    // Split selector from dots
    var tokens = selector.split('.');
    // Return if selector doesn't contain dots (Ex: localhost), return selector as single item array
    if (tokens.length === 1) return [ selector ];
    // Loop each part of selector
    for (var index = 0; index < tokens.length; index++) {
        var value = tokens[index];
        // If part contains a dash(-), return array of IPs.
        if (value.indexOf('-') !== -1) {
            var start = value.split('-')[0];
            var end = value.split('-')[1];
            var ret = [];
            for (var i = start; i <= end; i++) {
                var ip = '';
                for (var j = 0; j < 4; j++) {
                    if (index !== j) ip += tokens[j];
                    else ip += i;
                    if (j !== 3) ip += '.';
                }
                // If IP still contains dash(-), process it again.
                if (ip.indexOf('-') !== -1) {
                    ip = getIPs(ip);
                }
                if (ip instanceof Array) {
                    for (var k = 0; k < ip.length; k++) {
                        ret.push(ip[k]);
                    }
                } else {
                    ret.push(ip);
                }
            }
            return ret;
        }
    }
    return [ selector ];
}
/**
 *
 * @param {string} selector
 * @returns {Array}
 */
function getPorts(selector) {
    // Code is self explanatory
    var start = selector.split('-')[0];
    var end = selector.split('-')[1];
    var ret = [];
    for (var i = start; i <= end; i++) {
        ret.push(i);
    }
    return ret;
}