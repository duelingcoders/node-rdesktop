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
};
    
function base (pat) {
    return parseInt(pat.replace(/x/g,'0'), 2);
}

exports.fromByte = function (b) {
    return Hash(codes).filter(function (patterns, code) {
        return patterns.some(function (pat) {
            var mask = parseInt(pat.replace(/[01]/g,'1').replace(/x/g,'0') , 2);
            return (b & mask) == base(pat);
        });
    }).keys[0];
};

exports.toByte = function (code, value, ver) {
    var patterns = codes[code.toUpperCase()];
    if (!patterns) return null;
    var pat = patterns[ver || 0];
    var mask = parseInt(pat.replace(/[01]/g,'0').replace(/x/g,'1') , 2);
    return (base(pat) + ((value || 0) & mask)) & 0xff;
};
