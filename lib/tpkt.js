var Put = require('rfb/put');

module.exports = function (stream) {
    return {
        write : function (buf) {
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
