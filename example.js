var keypress = require('keypress')
  , Singer = require('./')
  , fs = require('fs')
  , events = require('events')
  , path = require('path');

keypress(process.stdin);

var singer = new Singer();

process.stdin.on('keypress', function (ch, key) {
  if (!key) return;

  console.log(key.name);

  var mp3, vol;

  if (key.name == 'q') {
    singer.stop();
    process.stdin.pause();
    process.exit();

  } else if (key.name == 'return') {
    mp3 = getmp3();
    if (mp3) {
      singer.sing(mp3);
    } else {
      console.log('Can not find mp3 file in "%s"', __dirname)
    }

  } else if (key.name == 'space') {
    if (singer.state == 'singing') {
      singer.pause();
    } else if (singer.state == 'paused') {
      singer.resume();
    }

  } else if (key.name == 'up') {
    vol = singer.getVolume();
    if (vol < 100) {
      vol += 1;
      singer.turnTo(vol);
      console.log('turn up %d', vol)
    }

  } else if (key.name == 'down') {
    vol = singer.getVolume();
    if (vol > 0) {
      vol -= 1;
      singer.turnTo(vol);
      console.log('turn down %d', vol)
    }

  } else if (key.name == 'v') {
    console.log(singer.getVolume());

  } else if (key.name == 'n') {
    mp3 = getmp3();
    if (mp3) {
      singer.sing(mp3);
    } else {
      console.log('Can not find mp3 file in "%s"', __dirname)
    }
  };
});

process.stdin.setRawMode(true);
process.stdin.resume();

function getmp3() {
  var files = fs.readdirSync(__dirname);
  for (var i = 0, l = files.length; i < l; i++) {
    if (path.extname(files[i]) == '.mp3') {
      return path.join(__dirname, files[i]);
    }
  }
  return null;
}
