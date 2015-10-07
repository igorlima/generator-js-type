/* global describe, it, before */
var path = require('path')
var helpers = require('yeoman-generator').test
var assert = require('yeoman-generator').assert
var runFlowType = require('./helpers').runFlowType

describe('generator json schema with class template 2', function () {
  describe('song json schema', function () {
    before(function (done) {
      helpers.run(path.join(__dirname, '../generators/json-schema'))
        .inTmpDir((dir) => {
          this.generator_temporary_dir = dir
        })
        .withArguments(path.join(__dirname, 'json-schema/song.json'))
        .withOptions({
          template: 'class2'
        })
        .on('end', done)
    })

    it('create a Song file', function () {
      assert.file('Song.js')
    })

    it('have a class definition in the file', function () {
      assert.fileContent('Song.js', 'class Song {')
    })

    it('the constructor is empty', function () {
      assert.fileContent('Song.js', 'constructor () {')
    })

    it('need to be validated by FlowType', function (done) {
      runFlowType(this.generator_temporary_dir, function (code) {
        assert.file(path.join(__dirname, 'tmp/Song.js'))
        assert.strictEqual(code, 0)
        done()
      })
    })
  })
})
