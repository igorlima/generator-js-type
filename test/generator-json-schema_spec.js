/* global describe, it, before */

var path = require('path')
var helpers = require('yeoman-generator').test
var assert = require('yeoman-generator').assert
var yeoman = require('yeoman-environment')
var async = require('async')
var runFlowType = require('./helpers').runFlowType
var createClassFromJsonSchema = require('./helpers').createClassFromJsonSchema

describe('generator json schema', function () {
  describe('calling without filepath', function () {
    before(function () {
      this.generator_environment = yeoman.createEnv([], {})
      this.generator = path.join(__dirname, '../generators/json-schema')
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

  describe('song json schema', function () {
    before(function (done) {
      helpers.run(path.join(__dirname, '../generators/json-schema'))
        .inTmpDir(function (dir) {
          this.generator_temporary_dir = dir
        }.bind(this))
        .withArguments(path.join(__dirname, 'json-schema/song.json'))
        .on('end', done)
    })

    it('have a class definition in the file', function () {
      assert.fileContent('Song.js', 'class Song {')
    })

    it('have a constructor definition in the class', function () {
      assert.fileContent(
        'Song.js',
        new RegExp([
          'constructor[(]',
          ' id:number, title:string, artist:string, genre:string ',
          '[)] {'
        ].join(''))
      )
    })

    it('have id variable declared', function () {
      assert.fileContent('Song.js', 'id: number;')
    })

    it('have title variable declared', function () {
      assert.fileContent('Song.js', 'title: string;')
    })

    it('have genre variable declared', function () {
      assert.fileContent('Song.js', 'genre: string;')
    })

    it('need to be validated by FlowType', function (done) {
      runFlowType(this.generator_temporary_dir, function (code) {
        assert.file(path.join(__dirname, 'tmp/Song.js'))
        assert.strictEqual(code, 0)
        done()
      })
    })
  })

  describe('song list json schema', function () {
    before(function (done) {
      this.generator_temporary_dirs = []
      async.waterfall([
        function (callback) {
          createClassFromJsonSchema(
            'json-schema/song.json',
            this.generator_temporary_dirs,
            callback
          )
        }.bind(this),
        function (callback) {
          createClassFromJsonSchema(
            'json-schema/songList.json',
            this.generator_temporary_dirs,
            callback
          )
        }.bind(this)
      ], done)
    })

    it('import Song class', function () {
      assert.fileContent('SongList.js', 'import { Song } from "./Song"')
    })

    it('have song list variable declared', function () {
      assert.fileContent('SongList.js', 'songs: Array<Song>;')
    })

    it('have sont list arguments in the constructor', function () {
      assert.fileContent(
        'SongList.js',
        /constructor[(] songs:Array<Song> [)] {/
      )
    })

    it('need to be validated by FlowType', function (done) {
      runFlowType(this.generator_temporary_dirs, function (code) {
        assert.file(path.join(__dirname, 'tmp/Song.js'))
        assert.file(path.join(__dirname, 'tmp/SongList.js'))
        assert.strictEqual(code, 0)
        done()
      })
    })
  })
})
