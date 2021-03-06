/* global describe, it, before */

var path = require('path')
var helpers = require('yeoman-generator').test
var assert = require('yeoman-generator').assert
var yeoman = require('yeoman-environment')
var async = require('async')
var runFlowType = require('./helpers').runFlowType
var createEmptyClass = require('./helpers').createEmptyClass

describe('private methods', function () {
  before(function (done) {
    helpers.run(path.join(__dirname, '../generators/app'))
      .withArguments(['TestClass']) // Mock the arguments
      .on('ready', (generator) => {
        // This is called right before `generator.run()` is called
        this.myYeomanGenerator = generator
        done()
      })
  })

  it('simple example calling any private method', function () {
    assert(this.myYeomanGenerator._exampleForPrivateMethod)
    assert.doesNotThrow(() => {
      this.myYeomanGenerator._exampleForPrivateMethod()
    })
  })

  it('any empty user input is NOT validated', function () {
    assert.strictEqual(
      this.myYeomanGenerator._validateUserInputIsNotEmpty(''),
      false
    )
  })

  it('user input is validated if length longer than 0', function () {
    assert(this.myYeomanGenerator._validateUserInputIsNotEmpty('any value'))
  })
})

describe('generator app', function () {
  describe('calling without classname', function () {
    before(function () {
      this.generator_environment = yeoman.createEnv([], {})
      this.generator = path.join(__dirname, '../generators/app')
      this.generator_namespace =
        this.generator_environment.namespace(this.generator)
    })

    it('throw an error', function () {
      assert.throws(function () {
        this.generator_environment.register(this.generator)
        this.generator_environment.create(this.generator_namespace, {})
      }.bind(this), function (err) {
        return (err instanceof Error) &&
          /Did not provide required argument/.test(err)
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
        .on('ready', function () {
          // `generator` is available as the first argument here
          // This is called right before `generator.run()` is called
        })
        // generator is available as this.generator in 'end' listener context
        .on('end', done)
    })

    it('create a js file', function () {
      assert.file(['test-class.js'])
    })

    it('have a class definition in the file', function () {
      assert.fileContent('test-class.js', 'class TestClass {')
    })

    it('have a constructor definition in the class', function () {
      assert.fileContent('test-class.js', /constructor[(][\s]*[)] {/)
    })

    it('need to be validated via FlowType', function (done) {
      runFlowType(this.generator_temporary_dir, function (code) {
        assert.file(path.join(__dirname, 'tmp/test-a/test-class.js'))
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
      assert.fileContent('song.js', 'title: string;')
    })

    it('have a number variable declared', function () {
      assert.fileContent('song.js', 'price: number;')
    })

    it('have both string and number arguments in the constructor', function () {
      assert.fileContent(
        'song.js',
        /constructor[(] title:string, price:number [)] {/
      )
    })

    it('need to be validated by FlowType', function (done) {
      runFlowType(this.generator_temporary_dir, function (code) {
        assert.file(path.join(__dirname, 'tmp/test-a/song.js'))
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
      assert.fileContent('song.js', 'import { Track } from "./track"')
    })

    it('need to be validated by FlowType', function (done) {
      runFlowType(this.generator_temporary_dirs, function (code) {
        assert.file(path.join(__dirname, 'tmp/test-a/track.js'))
        assert.file(path.join(__dirname, 'tmp/test-a/artirst.js'))
        assert.file(path.join(__dirname, 'tmp/test-a/song.js'))
        assert.strictEqual(code, 0)
        done()
      })
    })
  })
})
