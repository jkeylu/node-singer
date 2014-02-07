var keypress = require('keypress')
  , Singer = require('./');

keypress(process.stdin);

var singer = new Singer();

process.stdin.on('keypress', function (ch, key) {
  if (!key) return;

  console.log(key.name);
  if (key.ctrl && key.name == 'c') {
    process.stdin.pause();
    process.exit();
  } else if (key.name == 'return') {
    singer.sing('c:\\cygwin64\\home\\jKey\\node-singer\\1.mp3');
  } else if (key.name == 'space') {
    singer.pause();
  } else if (key.name == 'up') {
  } else if (key.name == 'down') {
  } else if (key.name == 'v') {
    console.log(singer.getVolume());
  }
});

process.stdin.setRawMode(true);
process.stdin.resume();
