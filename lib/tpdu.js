var Hash = require('traverse/hash');

exports.codes = Object.freeze({
    CR : [ '1110xxxx' ],
    CC : [ '1101xxxx' ],
    DR : [ '10000000' ],
    DC : [ '11000000' ],
    DT : [ '1111000x' ],
    ED : [ '00010000' ],
    AK : [ '0110xxxx' ],
    EA : [ '00100000' ],
    RJ : [ '0101xxxx' ],
    ER : [ '01110000' ],
    NA : [ '00000000', '00110000', '1001xxxx', '1010xxxx' ],
});

exports.names = Object.freeze({
    CR : 'Connection request',
    CC : 'Connection confirm',
    DR : 'Disconnect request',
    DC : 'Disconnect confirm',
    DT : 'Data',
    ED : 'Expedited data',
    AK : 'Data acknowledgement',
    EA : 'Expedited data acknowledgement',
    RJ : 'Reject',
    ER : 'TPDU error',
    NA : 'Not available',
});

function base (pat) {
    return parseInt(pat.replace(/x/g,'0'), 2);
}

exports.fromByte = function (b) {
    return Hash(this.codes).filter(function (patterns, code) {
        return patterns.some(function (pat) {
            var mask = parseInt(pat.replace(/[01]/g,'1').replace(/x/g,'0') , 2);
            return (b & mask) == base(pat);
        });
    }).keys[0];
};

exports.toByte = function (code, value, ver) {
    var patterns = this.codes[code.toUpperCase()];
    if (!patterns) return null;
    var pat = patterns[ver || 0];
    var mask = parseInt(pat.replace(/[01]/g,'0').replace(/x/g,'1') , 2);
    return (base(pat) + ((value || 0) & mask)) & 0xff;
};
