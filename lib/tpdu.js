var Hash = require('traverse/hash');

var codes = {
    CR : [ '1110xxxx' ], // Connection request
    CC : [ '1101xxxx' ], // Connection confirm
    DR : [ '10000000' ], // Disconnect request
    DC : [ '11000000' ], // Disconnect confirm
    DT : [ '1111000x' ], // Data
    ED : [ '00010000' ], // Expedited data
    AK : [ '0110xxxx' ], // Data acknowledgement
    EA : [ '00100000' ], // Expedited data acknowledgement
    RJ : [ '0101xxxx' ], // Reject
    ER : [ '01110000' ], // TPDU error
    // Not available:
    NA : [ '00000000', '00110000', '1001xxxx', '1010xxxx' ],
}[code];
    
function base (pat) {
    return parseInt(pat.replace(/x/g,'0'), 2);
}

function mask (pat) {
    return parseInt(pat.replace(/[01]/g,'0').replace(/x/g,'1') , 2);
}

exports.fromByte = function (byte) {
    return Hash(codes).filter(function (patterns, code) {
        return patterns.some(function (pat) {
            return (mask(pat) | byte) == base(pat);
        });
    }).keys[0];
};

exports.toByte = function (code, value) {
    var patterns = codes[code.toUpperCase()];
    if (!patterns) return null;
    var pat = patterns[0];
    return (base(pat) + (value & mask(pat))) & 0xff;
};
