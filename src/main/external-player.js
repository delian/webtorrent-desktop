module.exports = {
  spawn,
  kill,
  checkInstall
}

// OS
const os = require('os');
const fs = require('fs');
const path = require('path');
// OS

const cp = require('child_process')
const vlcCommand = require('vlc-command')

const log = require('./log')
const windows = require('./windows')

// holds a ChildProcess while we're playing a video in an external player, null otherwise
let proc = null

function checkInstall (path, cb) {
  // check for VLC if external player has not been specified by the user
  // otherwise assume the player is installed
  if (path == null) return vlcCommand((err) => cb(!err))
  process.nextTick(() => cb(true))
}

function spawn (path, url, title) {
  if (path != null) return spawnExternal(path, [url])

  if (os.platform()=='win32') {
    var vlcPathExe = path.join(process.resourcesPath, 'app.asar.unpacked', 'static', 'vlc-2.2.4','vlc.exe');
    console.log('FS',fs.statSync(vlcPathExe));
    if (fs.statSync(vlcPathExe)) {
      return spawnExternal(vlcPathExe,[url]);
    }
  }

  // Try to find and use VLC if external player is not specified
  vlcCommand(function (err, vlcPath) {
    if (err) return windows.main.dispatch('externalPlayerNotFound')
    const args = [
      '--play-and-exit',
      '--video-on-top',
      '--quiet',
      `--meta-title=${JSON.stringify(title)}`,
      url
    ]
    spawnExternal(vlcPath, args)
  })
}

function kill () {
  if (!proc) return
  log('Killing external player, pid ' + proc.pid)
  proc.kill('SIGKILL') // kill -9
  proc = null
}

function spawnExternal (path, args) {
  log('Running external media player:', path + ' ' + args.join(' '))

  proc = cp.spawn(path, args, {stdio: 'ignore'})

  // If it works, close the modal after a second
  const closeModalTimeout = setTimeout(() =>
    windows.main.dispatch('exitModal'), 1000)

  proc.on('close', function (code) {
    clearTimeout(closeModalTimeout)
    if (!proc) return // Killed
    log('External player exited with code ', code)
    if (code === 0) {
      windows.main.dispatch('backToList')
    } else {
      windows.main.dispatch('externalPlayerNotFound')
    }
    proc = null
  })

  proc.on('error', function (e) {
    log('External player error', e)
  })
}
