var EventEmitter = require('events').EventEmitter
  , inherits = require('util').inherits
  , binding = require('bindings')('binding')
  , debug = require('debug')('singer')
  , fs = require('fs')
  , request = require('request')
  , Speaker = require('speaker')
  , lame = require('lame');

module.exports = Singer;

function Singer() {
  this.decoder = null;
  this.stream = null;
  this.speaker = null;
  this.state = 'stoped';
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

  type = typeof s;

  if (type == 'object' && s.readable === true) {
    this.stream = s;
  } else {
    err = 'It is not a readable stream.';
  }

  done(err);
};

Singer.prototype.sing = function (s) {
  debug('Sing song path: "%s"', s);

  var self = this;

  if (this.state != 'stoped') {
    this.stop();
  }
  this._setStream(s, function(err) {
    if (err) {
      debug(err);
      return;
    }

    self.state = 'singing';
    self.decoder = new lame.Decoder();
    self.stream.pipe(self.decoder).on('format', function (format) {
      self.speaker = new Speaker(format);
      self.decoder.pipe(self.speaker);
      this.emit('singing');
    });
  });
};

Singer.prototype.pause = function () {
  if (this.stream && this.state == 'singing') {
    this.state = 'paused';
    this.stream.unpipe();
    this.emit('paused');
  }
};

Singer.prototype.resume = function () {
  if (this.stream && this.state == 'paused') {
    this.state = 'singing';
    this.stream.pipe(this.decoder);
    this.emit('singing');
  }
};

Singer.prototype.stop = function () {
  if (this.stream) {
    this.state = 'stoped';

    this.stream.unpipe();
    this.stream.destroy();
    this.stream = null;

    this.decoder.unpipe();
    this.speaker.end();
    this.speaker = null;

    this.emit('stoped');
  }
};

Singer.prototype.turnTo = function (vol) {
  if (this.decoder && vol > 0) {
    vol = vol / 100;
    binding.mpg123_volume(this.decoder.mh, vol);
    this.emit('volumeChanged');
  }
};

Singer.prototype.getVolume = function () {
  return this.decoder ? binding.mpg123_getvolume(this.decoder.mh) * 100 : -1;
};
