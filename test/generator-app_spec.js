/* global describe, it, before */

var path = require('path')
var fs = require('fs-extra')
var helpers = require('yeoman-generator').test
var assert = require('yeoman-generator').assert
var spawn = require('child_process').spawn
var yeoman = require('yeoman-environment')

function runFlowType (temporary_dir, callback) {
  var flow = spawn('flow', [ 'check', __dirname + '/tmp' ])

  fs.removeSync(path.join(__dirname, 'tmp/*.js'))
  fs.copySync(temporary_dir, path.join(__dirname, 'tmp'))

  // https://nodejs.org/api/child_process.html
  flow.stderr.on('data', function (data) {
    console.error('flow stderr: ' + data) // Log error in CI environment if needed
  })

  flow.on('close', function (code) {
    callback(code)
  })
}

describe('generator app', function () {
  describe('calling without classname', function () {
    before(function () {
      this.generator_environment = yeoman.createEnv([], {})
      this.generator = path.join(__dirname, '../generators/app')
      this.generator_namespace = this.generator_environment.namespace(this.generator)
    })

    it('throw an error', function () {
      assert.throws(function () {
        this.generator_environment.register(this.generator)
        this.generator_environment.create(this.generator_namespace, {})
      }.bind(this), function (err) {
        return (err instanceof Error) && /Did not provide required argument/.test(err)
      }, 'not throwring any error')
    })
  })

  describe('a class with no attribute', function () {
    before(function (done) {
      helpers.run(path.join(__dirname, '../generators/app'))
        .inTmpDir(function (dir) {
          this.generator_temporary_dir = dir
        }.bind(this))
        .withArguments(['TestClass'])         // Mock the arguments
        .withPrompts({ addAttribute0: false }) // Mock the prompt answers
        .on('ready', function (generator) {
          // This is called right before `generator.run()` is called
        })
        .on('end', done) // generator is available as this.generator in 'end' listener context
    })

    it('create a js file', function () {
      assert.file(['TestClass.js'])
    })

    it('have a class definition in the file', function () {
      assert.fileContent('TestClass.js', 'class TestClass {')
    })

    it('have a constructor definition in the class', function () {
      assert.fileContent('TestClass.js', /constructor[(][\s]*[)] {/)
    })

    it('can be validated via FlowType', function (done) {
      runFlowType(this.generator_temporary_dir, function (code) {
        assert.strictEqual(code, 0)
        done()
      })
    })
  })

  describe('a class with two different attributes', function () {
    before(function (done) {
      helpers.run(path.join(__dirname, '../generators/app'))
        .inTmpDir(function (dir) {
          this.generator_temporary_dir = dir
        }.bind(this))
        .withArguments(['Song'])
        .withPrompts({
          addAttribute0: true,
          attributeName0: 'title',
          attributeType0: 'string',
          addAttribute1: true,
          attributeName1: 'price',
          attributeType1: 'number',
          addAttribute2: false
        })
        .on('end', done)
    })
    it('have a string variable declared', function () {
      assert.fileContent('Song.js', 'title: string;')
    })
  })
})
