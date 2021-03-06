/* global describe, it, before */
var path = require('path')
var helpers = require('yeoman-generator').test
var assert = require('yeoman-generator').assert
var runFlowType = require('./helpers').runFlowType

describe('generator json schema with class template 3', function () {
  describe('song json schema', function () {
    before(function (done) {
      helpers.run(path.join(__dirname, '../generators/json-schema'))
        .inTmpDir((dir) => {
          this.generator_temporary_dir = dir
        })
        .withArguments(path.join(__dirname, 'json-schema/song.json'))
        .withOptions({
          template: 'class3'
        })
        .on('end', done)
    })

    it('create a Song file', function () {
      assert.file('song.js')
    })

    it('have a class definition in the file', function () {
      assert.fileContent('song.js', 'class Song {')
    })

    it('have setProperties function', function () {
      assert.fileContent('song.js', 'setProperties(values:Object) : Song {')
    })

    it('have setProperty function', function () {
      assert.fileContent(
        'song.js',
        'setProperty(propertyName:string, value:any) : Song {')
    })

    it('need to be validated by FlowType', function (done) {
      runFlowType(this.generator_temporary_dir, function (code) {
        assert.file(path.join(__dirname, 'tmp/test-a/song.js'))
        assert.strictEqual(code, 0)
        done()
      })
    })
  })
})
