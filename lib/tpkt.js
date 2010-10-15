var Put = require('put');
var Hash = require('traverse/hash');

module.exports = function (stream) {
    var self = {};
    
    self.tpdu = TPDU();
    
    self.send = function (code, buf) {
    };
    
    return {
        write : function (code, buf) {
            // note: this is just a CR
            Put()
            .word8(3) // version
            .word8(0) // reserved
            .word16le(buf.length + 7) // length
            .word8(buf.length) // header length
            .buffer(buf)
            .write(stream);
        }
    };
};
