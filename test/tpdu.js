var tpdu = require('rdesktop/tpdu');

exports.CR = function (assert) {
    var pat = '1110xxxx';
    var begin = parseInt(pat.replace(/x/g,'0'), 2);
    var end = parseInt(pat.replace(/x/g,'1'), 2);
    for (var i = begin; i < end; i++) {
        var code = tpdu.fromByte(i)
        assert.equal(code, 'CR');
        var b = tpdu.toByte(code, i - begin);
        assert.equal(b, i);
    }
};
