const parseJson = require('parse-json');
let fs = require('fs-extra');
let utils = require('../utils/utils.js');
require('colors');

function mkdirpSync() {
  return fs.mkdirpSync.apply(fs.mkdirpSync, arguments);
}

function mkdirp() {
  return fs.mkdirp.apply(fs.mkdirp, arguments);
}

function readdir() {
  return fs.readdir.apply(fs.readdir, arguments);
}

function stat() {
  return fs.stat.apply(fs.stat, arguments);
}

function remove() {
  return fs.remove.apply(fs.remove, arguments);
}

function copy() {
  return fs.copy.apply(fs.copy, arguments);
}

function copySync() {
  return fs.copySync.apply(fs.copySync, arguments);
}

function move(){
  return fs.move.apply(fs.move, arguments);
}

function moveSync() {
  return fs.moveSync.apply(fs.moveSync, arguments);
}

function appendFileSync() {
  return fs.appendFileSync.apply(fs.writeFileSync, arguments);
}

function writeFile() {
  return fs.writeFile.apply(fs.writeFileSync, arguments);
}

function writeFileSync() {
  return fs.writeFileSync.apply(fs.writeFileSync, arguments);
}

function readFile() {
  return fs.readFile.apply(fs.readFile, arguments);
}

function readFileSync() {
  return fs.readFileSync.apply(fs.readFileSync, arguments);
}

function readJSONSync() {
  let content = readFileSync.apply(readFileSync, arguments);
  try {
    return parseJson(content);
  } catch(e) {
    console.error("error: ".red + arguments[0].green.underline + " " + e.message.green);
    process.exit(0);
  }
}

function writeJSONSync() {
  return fs.writeJSONSync.apply(fs.writeJSONSync, arguments);
}

function writeJson() {
  return fs.writeJson.apply(fs.writeJson, arguments);
}

function existsSync() {
  return fs.existsSync.apply(fs.existsSync, arguments);
}

function access() {
  return fs.access.apply(fs.access, arguments);
}

function removeSync() {
  return fs.removeSync.apply(fs.removeSync, arguments);
}

function anchoredPath(envAnchor, ...args) {
  const anchor = process.env[envAnchor];
  if (!anchor) {
    console.error(`process.env.${envAnchor} was not set`.bold.red);
    process.exit(1);
  }
  return utils.joinPath(anchor, ...args);
}

function embarkPath() {
  return anchoredPath('EMBARK_PATH', ...arguments);
}

function dappPath() {
  return anchoredPath('DAPP_PATH', ...arguments);
}

function pkgPath() {
  return anchoredPath('PKG_PATH', ...arguments);
}

function createWriteStream() {
  return fs.createWriteStream.apply(fs.createWriteStream, arguments);
}

function tmpDir() {
  let os = require('os');
  return utils.joinPath(os.tmpdir(), ...arguments);
}

function copyPreserve(sourceFilePath, targetFilePath) {
  const path = require('path');
  let ext = 1;
  let preserved = targetFilePath;
  while (fs.existsSync(preserved)) {
    let extname = path.extname(targetFilePath);
    preserved = utils.joinPath(
      path.dirname(targetFilePath),
      `${path.basename(targetFilePath, extname)}.${ext}${extname}`
    );
    ext++;
  }
  if (preserved !== targetFilePath) {
    fs.copySync(targetFilePath, preserved);
  }
  fs.copySync(sourceFilePath, targetFilePath);
}

module.exports = {
  mkdirpSync,
  mkdirp,
  readdir,
  stat,
  remove,
  copy,
  copySync,
  move,
  moveSync,
  readFile,
  readFileSync,
  appendFileSync,
  writeFile,
  writeFileSync,
  readJSONSync,
  writeJson,
  writeJSONSync,
  access,
  existsSync,
  removeSync,
  embarkPath,
  dappPath,
  pkgPath,
  createWriteStream,
  tmpDir,
  copyPreserve
};
