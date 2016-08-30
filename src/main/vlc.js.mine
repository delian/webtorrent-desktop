module.exports = {
  checkForVLC,
  spawn
}


var os = require('os')
var fs = require('fs')
var cp = require('child_process')
var vlcCommand = require('vlc-command')

// Finds if VLC is installed on Mac, Windows, or Linux.
// Calls back with true or false: whether VLC was detected
function checkForVLC (cb) {
  if (os.platform()=='win32') {
    console.log('FS',fs.statSync('static/vlc-2.2.4/vlc.exe'));
    if (fs.statSync('static/vlc-2.2.4/vlc.exe')) {
      return cb(true);
    }
  }
  vlcCommand((err) => cb(!err))
}

// Spawns VLC with child_process.spawn() to return a ChildProcess object
// Calls back with (err, childProcess)
function spawn (args, cb) {
  if (os.platform()=='win32') {
    console.log('spawn vlc FS', fs.statSync('static/vlc-2.2.4/vlc.exe'));
    if (fs.statSync('static/vlc-2.2.4/vlc.exe')) {
      return cb(null, cb.spawn('static/vlc-2.2.4/vlc.exe', args));
    }
  }
  vlcCommand(function (err, vlcPath) {
    if (err) return cb(err)
    cb(null, cp.spawn(vlcPath, args))
  })
}
