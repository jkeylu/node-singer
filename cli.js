var fs = require('fs')
  , path = require('path')
  , os = require('os')
  , keypress = require('keypress')
  , Singer = require('./index');

if (process.argv.length < 3
    || process.argv[2] == '-h'
    || process.argv[2] == 'help'
    || process.argv[2] == '--help') {
  printHelp();
  return;
}

var songs = []
  , n = -1
  , singer = new Singer()
  , file_path = process.argv[2];

singer.on('end', function () {
  singNextSong();
});

fs.stat(file_path, function (err, stats) {
  if (err)
    return printHelp();

  if (stats.isFile()) {
    if (path.extname(file_path) == '.mp3') {
      songs.push(file_path);
      singSongs();

    } else if (path.extname(file_path) == '.list') {
      fs.readFile(file_path, function (err, data) {
        if (err || !data)
          return printHelp();

        data = data.replace('\r', '\n');
        var lines = data.split('\n');
        for (var i = 0, l = lines.length; i < l; i++) {
          if (lines[i])
            songs.push(lines[i]);
        }
        singSongs();
      });

    } else {
      printHelp();
    }

  } else if (stats.isDirectory()) {
    fs.readdir(file_path, function (err, files) {
      if (err)
        return printHelp();

      for (var i = 0, l = files.length; i < l; i++) {
        if (path.extname(files[i]) == '.mp3') {
          songs.push(path.join(file_path, files[i]));
        }
      }
      singSongs();
    });

  } else {
    printHelp();
  }
});

function printHelp() {
  console.log('singer 1.mp3');
  console.log('singer ~/musics/');
  console.log('singer musics.list');
}

function singSongs() {
  if (!songs || songs.length == 0)
    printHelp();

  singNextSong();

  keypress(process.stdin);
  process.stdin.on('keypress', function (ch, key) {
    if (!key) return;

    var vol;
    switch (key.name) {
      case 'n':
        singNextSong();
        break;
      case 'q':
        singer.stop();
        process.stdin.pause();
        process.exit();
        break;
      case 'space':
        if (singer.state == 'singing') {
          singer.pause();
        } else if (singer.state == 'paused') {
          singer.resume();
        }
        break;
      case 'up':
        vol = singer.getVolume();
        if (vol < 100) {
          vol = parseInt(vol) + 1;
          singer.turnTo(vol);
          if (vol % 10 == 0)
            console.log('Turn up: %d', vol)
        }
        break;
      case 'down':
        vol = singer.getVolume();
        if (vol > 0) {
          vol = parseInt(vol) - 1;
          singer.turnTo(vol);
          if (vol % 10 == 0)
            console.log('Turn down: %d', vol)
        }
        break;
      case 'v':
        console.log('Current volume: %d', singer.getVolume());
        break;
      case 's':
        console.log('Current song: %s', path.basename(songs[n % songs.length]));
        break;
      default:
        break;
    }

  }
  process.stdin.setRawMode(true);
  process.stdin.resume();
}

function singNextSong() {
  var song = songs[(++n) % songs.length];
  console.log(path.basename(song));
  singer.sing(song);
}
