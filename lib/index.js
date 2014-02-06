var EventEmitter = require('events').EventEmitter
  , inherts = require('util').inherits
  , binding = require('./binding')
  , fs = require('fs')
  , request = require('request')
  , Speaker = require('speaker')
  , lame = require('lame');

module.exports = Singer;

function Singer() {
  this.decoder = new lame.Decoder();
  this.speaker = new Speaker();
  this.stream = null;
  this.state = 'stoped';

  this.decoder.pipe(this.speaker);
}

inherits(Singer, EventEmitter);

Singer.prototype._setStream = function (s, done) {
  var type = typeof s
    , err = null;

  if (type == 'string') {
    if (s.indexOf('http') == 0) {
      s = request.get(s, { encoding: null });
    } else if (fs.existsSync(s)) {
      s = fs.createReadStream(s);
    } else {
      err = 'File not exists.';
    }
  }

  if (type == 'object' && s.readable === true) {
    this.stream = s;
  } else {
    err = 'It is not a readable stream.';
  }

  done(err);
};

Singer.prototype.sing = function (s) {
  this._setStream(s, function(err) {
    if (err) {
      return;
    }

    this.state = 'singing';
    this.stream.pipe(this.decoder);
  });
};

Singer.prototype.pause = function () {
  if (this.stream) {
    if (this.state == 'singing') {
      this.state = 'paused';
      this.stream.pause();
    } else if (this.state == 'paused') {
      this.state = 'singing';
      this.stream.resume();
    }
  }
};

Singer.prototype.stop = function () {
  if (this.stream) {
    this.stream.unpipe(this.decoder);
    this.stream.destroy();
    this.stream = null;
  }
};

Singer.prototype.turnTo = function (vol) {
  if (this.decoder) {
    vol = vol / 100;
    binding.mpg123_volume(this.decoder.mh, vol);
  }
};

Singer.prototype.getVolume = function () {
  return this.decoder ? binding.mpg123_getvolume(this.decoder.mh) : -1;
};
