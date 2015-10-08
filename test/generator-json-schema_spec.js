/* global describe, it, before */

var path = require('path')
var helpers = require('yeoman-generator').test
var assert = require('yeoman-generator').assert
var yeoman = require('yeoman-environment')
var async = require('async')
var runFlowType = require('./helpers').runFlowType
var createClassFromJsonSchema = require('./helpers').createClassFromJsonSchema

describe('generator json schema with class template 1', function () {
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

  describe('product json schema', function () {
    before(function (done) {
      helpers.run(path.join(__dirname, '../generators/json-schema'))
        .inTmpDir((dir) => {
          this.generator_temporary_dir = dir
        })
        .withArguments(path.join(__dirname, 'json-schema/product.json'))
        .withOptions({
          convert: 'integer:number'
        })
        .on('end', done)
    })

    it('should not import string class', function () {
      assert.noFileContent('Product.js', 'import')
    })

    it('should not contain space in a variable', function () {
      assert.fileContent('Product.js', 'onSale: Array<string>;')
    })

    it('have camel case variables', function () {
      assert.fileContent('Product.js', 'hasDynamicImages: boolean;')
    })

    it('convert `integer` to `number` due --convert options', function () {
      assert.fileContent('Product.js', 'productId: number;')
    })

    it('need to be validated by FlowType', function (done) {
      runFlowType(this.generator_temporary_dir, function (code) {
        assert.file(path.join(__dirname, 'tmp/Product.js'))
        assert.strictEqual(code, 0)
        done()
      })
    })
  })

  describe('searchFilter json schema', function () {
    describe('without cascade option', function () {
      before(function (done) {
        helpers.run(path.join(__dirname, '../generators/json-schema'))
          .inTmpDir((dir) => {
            this.generator_temporary_dir = dir
          })
          .withArguments(path.join(__dirname, 'json-schema/searchFilter.json'))
          .withOptions({
            convert: ['integer:number', 'object:Object']
          })
          .on('end', done)
      })

      it('should NOT import any class', function () {
        assert.noFileContent('SearchFilter.js', 'import')
      })

      it('filters is an array of objects', function () {
        assert.fileContent('SearchFilter.js', 'filters: Array<Object>;')
      })

      it('sortingTemplate is an object', function () {
        assert.fileContent('SearchFilter.js', 'sortingTemplate: Object;')
      })

      it('need to be validated by FlowType', function (done) {
        runFlowType(this.generator_temporary_dir, function (code) {
          assert.file(path.join(__dirname, 'tmp/SearchFilter.js'))
          assert.strictEqual(code, 0)
          done()
        })
      })
    })

    describe('with cascade option', function () {
      before(function (done) {
        helpers.run(path.join(__dirname, '../generators/json-schema'))
          .inTmpDir((dir) => {
            this.generator_temporary_dir = dir
          })
          .withArguments(path.join(__dirname, 'json-schema/searchFilter.json'))
          .withOptions({
            convert: ['integer:number', 'object:Object'],
            cascade: true
          })
          .on('end', done)
      })

      describe('SearchFilter file', function () {
        it('file exists', function () {
          assert.file('SearchFilter.js')
        })

        it('import Filter class', function () {
          assert.fileContent(
            'SearchFilter.js',
            'import { Filter } from "./Filter"')
        })

        it('filters is an array of filter', function () {
          assert.fileContent('SearchFilter.js', 'filters: Array<Filter>;')
        })

        it('import SortingTemplate class', function () {
          assert.fileContent(
            'SearchFilter.js',
            'import { SortingTemplate } from "./SortingTemplate";')
        })

        it('sortingTemplate is SortingTemplate object', function () {
          assert.fileContent(
            'SearchFilter.js',
            'sortingTemplate: SortingTemplate;')
        })
      })

      describe('SortingTemplate file', function () {
        it('file exists', function () {
          assert.file('SortingTemplate.js')
        })

        it('import SortingFilter class', function () {
          assert.fileContent(
            'SortingTemplate.js',
            'import { SortingFilter } from "./SortingFilter";')
        })

        it('sortingFilters is an array of SortingFilter', function () {
          assert.fileContent(
            'SortingTemplate.js',
            'sortingFilters: Array<SortingFilter>;')
        })
      })

      describe('Filter file', function () {
        it('file exists', function () {
          assert.file('Filter.js')
        })

        it('propertyName is a string', function () {
          assert.fileContent(
            'Filter.js',
            'propertyName: string;')
        })

        it('propertyValue is a string', function () {
          assert.fileContent(
            'Filter.js',
            'propertyValue: string;')
        })
      })

      describe('SortingFilter file', function () {
        it('file exists', function () {
          assert.file('SortingFilter.js')
        })

        it('propertyName is a string', function () {
          assert.fileContent(
            'SortingFilter.js',
            'propertyName: string;')
        })
      })

      it('need to be validated by FlowType', function (done) {
        runFlowType(this.generator_temporary_dir, function (code) {
          assert.file(path.join(__dirname, 'tmp/SearchFilter.js'))
          assert.strictEqual(code, 0)
          done()
        })
      })
    })
  })

  describe('match files patterns', function () {
    before(function (done) {
      helpers.run(path.join(__dirname, '../generators/json-schema'))
        .inTmpDir((dir) => {
          this.generator_temporary_dir = dir
        })
        .withArguments([
          path.join(__dirname, 'json-schema/song.json'),
          path.join(__dirname, 'json-schema/songList.json')
        ])
        .withOptions({
          convert: 'integer:number'
        })
        .on('end', done)
    })

    it('Song file exists', function () {
      assert.file('Song.js')
    })

    it('SongList file exists', function () {
      assert.file('SongList.js')
    })
  })
})
