
var path = require('path')
var spawn = require('child_process').spawn
var fs = require('fs-extra')
var helpers = require('yeoman-generator').test

exports.runFlowType = function (temporary_dir, callback) {
  var flow = spawn('flow', [ 'check', __dirname + '/tmp' ])
  var temporary_dirs = typeof temporary_dir === 'string'
    ? [temporary_dir]
    : temporary_dir

  fs.removeSync(path.join(__dirname, 'tmp/*.js'))
  temporary_dirs.forEach(function (dir) {
    fs.copySync(dir, path.join(__dirname, 'tmp'))
  })

  // https://nodejs.org/api/child_process.html
  flow.stderr.on('data', function (data) {
    // Log error in CI environment if needed
    console.warn('' + data) // eslint-disable-line no-console
  })

  flow.on('close', function (code) {
    callback(code)
  })
}

exports.createEmptyClass = function (classname, temporary_dirs, callback) {
  helpers.run(path.join(__dirname, '../generators/app'))
    .inTmpDir(function (dir) {
      temporary_dirs.push(dir)
    })
    .withArguments([classname])
    .withPrompts({ addAttribute0: false })
    .on('end', callback)
}

exports.createClassFromJsonSchema = function (jsonSchemaPath, dirs, callback) {
  helpers.run(path.join(__dirname, '../generators/json-schema'))
    .inTmpDir(function (dir) {
      dirs.push(dir)
    })
    .withArguments(path.join(__dirname, jsonSchemaPath))
    .on('end', callback)
}
