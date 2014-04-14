var EventEmitter = require('events').EventEmitter
  , inherits = require('util').inherits
  , binding = require('bindings')('binding')
  , debug = require('debug')('singer')
  , fs = require('fs')
  , request = require('request')
  , Speaker = require('speaker')
  , lame = require('lame');

module.exports = Singer;

function SingerState(options) {
  this.decoder = null;
  this.stream = null;
  this.speaker = null;
  this.state = 'stoped';

  var vol = options.defaultVolume;
  this.volume = (vol || vol === 0) ? vol : 10;
  this.volume = ~~this.volume;
}

function Singer(options) {
  options = options || {};
  var ss = this._singerState = new SingerState(options);
  Object.defineProperty(this, 'state', {
    configurable: false,
    get: function () { return ss.state; }
  });
}

inherits(Singer, EventEmitter);

Singer.prototype._setStream = function (s, done) {
  var ss = this._singerState
    , type = typeof s
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
    ss.stream = s;
  } else {
    err = 'It is not a readable stream.';
  }

  done(err);
};

Singer.prototype.sing = function (s) {
  debug('Sing song path: "%s"', s);

  var self = this
    , ss = this._singerState;

  if (ss.state != 'stoped') {
    this.stop();
  }
  this._setStream(s, function(err) {
    if (err) {
      debug(err);
      return;
    }

    ss.state = 'singing';
    ss.decoder = new lame.Decoder();
    ss.stream.pipe(ss.decoder).on('format', function (format) {
      ss.speaker = new Speaker(format);
      ss.decoder.pipe(ss.speaker);
      self.emit('singing');
    });
  });
};

Singer.prototype.pause = function () {
  var ss = this._singerState;
  if (ss.stream && ss.state == 'singing') {
    ss.state = 'paused';
    ss.stream.unpipe();
    this.emit('paused');
  }
};

Singer.prototype.resume = function () {
  var ss = this._singerState;
  if (ss.stream && ss.state == 'paused') {
    ss.state = 'singing';
    ss.stream.pipe(ss.decoder);
    this.emit('singing');
  }
};

Singer.prototype.stop = function () {
  var ss = this._singerState;
  if (ss.stream) {
    ss.state = 'stoped';

    ss.stream.unpipe();
    ss.stream.destroy();
    ss.stream = null;

    ss.decoder.unpipe();
    ss.speaker.end();
    ss.speaker = null;

    this.emit('stoped');
  }
};

Singer.prototype.turnTo = function (vol) {
  var ss = this._singerState;
  if (ss.decoder && vol > 0) {
    ss.volume = vol;
    binding.mpg123_volume(ss.decoder.mh, ss.volume / 100);
    this.emit('volumeChanged');
  }
};

Singer.prototype.turnUp = function (increment, callback) {
  var ss = this._singerState;
  if (ss.decoder && increment > 0) {
    ss.volume += increment;
    binding.mpg123_volume(ss.decoder.mh, ss.volume / 100);
    this.emit('volumeChanged');
    callback(ss.volume);
  }
};

Singer.prototype.turnDown = function (step, callback) {
  var ss = this._singerState;
  if (ss.decoder && increment > 0) {
    if (ss.volume > increment)
      ss.volume -= increment;
    else
      ss.volume = 0;
    binding.mpg123_volume(ss.decoder.mh, ss.volume / 100);
    this.emit('volumeChanged');
    callback(ss.volume);
  }
};

Singer.prototype.getVolume = function (real) {
  var ss = this._singerState
    , vol = -1;
  if (ss.decoder) {
    vol = real === true ? binding.mpg123_getvolume(ss.decoder.mh) * 100 : ss.volume;
  }
  return vol;
};
