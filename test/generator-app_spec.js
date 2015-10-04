/* global describe, it, before */

var path = require('path')
var helpers = require('yeoman-generator').test
var assert = require('yeoman-generator').assert
var yeoman = require('yeoman-environment')
var async = require('async')
var runFlowType = require('./helpers').runFlowType
var createEmptyClass = require('./helpers').createEmptyClass

describe('example for testing private method', function () {
  before(function (done) {
    helpers.run(path.join(__dirname, '../generators/app'))
      .withArguments(['TestClass']) // Mock the arguments
      .on('ready', (generator) => {
        // This is called right before `generator.run()` is called
        this.myYeomanGenerator = generator
        done()
      })
  })
  it('call any private method', function () {
    assert(this.myYeomanGenerator._exampleForPrivateMethod)
    assert.doesNotThrow(() => {
      this.myYeomanGenerator._exampleForPrivateMethod()
    })
  })
})

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

    it('need to be validated via FlowType', function (done) {
      runFlowType(this.generator_temporary_dir, function (code) {
        assert.file(path.join(__dirname, 'tmp/TestClass.js'))
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

    it('have a number variable declared', function () {
      assert.fileContent('Song.js', 'price: number;')
    })

    it('have both string and number arguments in the constructor', function () {
      assert.fileContent('Song.js', /constructor[(] title:string, price:number [)] {/)
    })

    it('need to be validated by FlowType', function (done) {
      runFlowType(this.generator_temporary_dir, function (code) {
        assert.file(path.join(__dirname, 'tmp/Song.js'))
        assert.strictEqual(code, 0)
        done()
      })
    })
  })

  describe('a class importing other classes', function () {
    before(function (done) {
      this.generator_temporary_dirs = []
      async.waterfall([
        function (callback) {
          createEmptyClass('Track', this.generator_temporary_dirs, callback)
        }.bind(this),
        function (callback) {
          createEmptyClass('Artirst', this.generator_temporary_dirs, callback)
        }.bind(this)
      ], function () {
        helpers.run(path.join(__dirname, '../generators/app'))
        .inTmpDir(function (dir) {
          this.generator_temporary_dirs.push(dir)
        }.bind(this))
        .withArguments(['Song'])
        .withPrompts({
          addAttribute0: true,
          attributeName0: 'track',
          attributeType0: 'object',
          attributeClassName0: 'Track',
          addAttribute1: true,
          attributeName1: 'artist',
          attributeType1: 'object',
          attributeClassName1: 'Artirst',
          addAttribute2: false
        })
        .on('end', done)
      }.bind(this))
    })

    it('import all classes', function () {
      assert.fileContent('Song.js', 'import { Track } from "./Track"')
    })

    it('need to be validated by FlowType', function (done) {
      runFlowType(this.generator_temporary_dirs, function (code) {
        assert.file(path.join(__dirname, 'tmp/Track.js'))
        assert.file(path.join(__dirname, 'tmp/Artirst.js'))
        assert.file(path.join(__dirname, 'tmp/Song.js'))
        assert.strictEqual(code, 0)
        done()
      })
    })
  })
})
