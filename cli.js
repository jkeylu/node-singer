var fs = require('fs')
  , path = require('path')
  , os = require('os')
  , Singer = require('./index')

if (process.argv.length < 3
    || process.argv[2] == '-h'
    || process.argv[2] == 'help'
    || process.argv[2] == '--help') {
  printHelp();
  return;
}

var file_path = process.argv[2];

fs.stat(file_path, function (err, stats) {
  if (err)
    return printHelp();

  var songs = [];

  if (stats.isFile()) {
    if (path.extname(file_path) == '.mp3') {
      songs.push(file_path);
      singSongs(songs);

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
        singSongs(songs);
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
      singSongs(songs);
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

function singSongs(songs) {
  if (!songs || songs.length == 0)
    printHelp();

  var singer = new Singer()
    , i = 0;

  singer.sing(songs[i % songs.length]);
  singer.on('end', function () {
    singer.sing(songs[(++i) % songs.length]);
  });
}
