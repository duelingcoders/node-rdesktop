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

exports.toCode = function (b) {
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

// Take a whole TPDU with checksum bytes at index n and n + 1 set to 0,
// returning the whole TPDU with the checksum bytes set.
exports.checksum = function (n, buf) {
    var value = undefined; // checksum algorithm, 6.17
    // the itu x224 spec says "modulo 255 arithmetic"
    // but it probably means 256 since then you can just "char c0, c1"
    var c0 = 0, c1 = 0;
    
    function char (i) { return (256 + (i % 256)) % 256 }
    
    for (var i = 0; i < buf.length; i++) {
        c0 = char(c0 + buf[i]);
        c1 = char(c1 + c0);
    }
    
    var buffer = buf.slice(0, buf.length);
    buffer[n] = char(char(- c1 + buf.length - n) * c0); // x
    buffer[n + 1] = char(c1 - char(char(buf.length - n + 1) * c0)); // y
    
    return { code : parseInt('11000011', 2), buffer : buffer };
};

Hash(exports.codes).forEach(function (patterns, code) {
    // codes with Xs take a value argument
    var hasX = patterns.join('').match(/x/);
    var f = function (value, data, fParams, vParams, ver) {
        var fixed = fParams.reduce(function (put, param) {
            return put.word8(param)
        }, Put()).buffer();
        
        var variable = vParams.reduce(function (put, param) {
            return put
                .word8(param.code)
                .word8(param.value.length)
                .put(param.value)
        }, Put()).buffer();
        
        // header length, excludes itself and payload data
        var hLen = fixed.length + variable.reduce(function (sum, param) {
            return sum + param.value.length + 2;
        }, 0);
        
        return Put()
            .word8(hLen) // header length
            .word8(this.toByte(code, value, ver)) // tpdu
            .put(fixed)
            .put(variable)
            .put(data)
        ;
    };
    exports[code] = hasX ? f : f.bind(exports, 0);
});
