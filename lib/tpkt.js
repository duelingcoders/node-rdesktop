var Put = require('put');
var Hash = require('traverse/hash');
var TPDU = require('./tpdu');

module.exports = function (stream) {
    var self = {};
    
    self.tpdu = TPDU();
    
    self.write = function (code, buf) {
        // note: this is just a CR
        Put()
        .word8(3) // version
        .word8(0) // reserved
        .word16le(buf.length + 7) // length
        .put(buf)
        .write(stream);
    };
    
    return self;
};
