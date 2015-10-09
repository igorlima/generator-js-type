/* global describe, it, before */

var path = require('path')
var helpers = require('yeoman-generator').test
var assert = require('yeoman-generator').assert
var yeoman = require('yeoman-environment')
var async = require('async')
var runFlowType = require('./helpers').runFlowType
var runFlowTypeIn = require('./helpers').runFlowTypeIn
var removeFilesSync = require('./helpers').removeFilesSync
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
      assert.fileContent('song.js', 'class Song {')
    })

    it('have a constructor definition in the class', function () {
      assert.fileContent(
        'song.js',
        new RegExp([
          'constructor[(]',
          ' id:number, title:string, artist:string, genre:string ',
          '[)] {'
        ].join(''))
      )
    })

    it('have id variable declared', function () {
      assert.fileContent('song.js', 'id: number;')
    })

    it('have title variable declared', function () {
      assert.fileContent('song.js', 'title: string;')
    })

    it('have genre variable declared', function () {
      assert.fileContent('song.js', 'genre: string;')
    })

    it('need to be validated by FlowType', function (done) {
      runFlowType(this.generator_temporary_dir, function (code) {
        assert.file(path.join(__dirname, 'tmp/test-a/song.js'))
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
      assert.fileContent('song-list.js', 'import { Song } from "./song"')
    })

    it('have song list variable declared', function () {
      assert.fileContent('song-list.js', 'songs: Array<Song>;')
    })

    it('have sont list arguments in the constructor', function () {
      assert.fileContent(
        'song-list.js',
        /constructor[(] songs:Array<Song> [)] {/
      )
    })

    it('need to be validated by FlowType', function (done) {
      runFlowType(this.generator_temporary_dirs, function (code) {
        assert.file(path.join(__dirname, 'tmp/test-a/song.js'))
        assert.file(path.join(__dirname, 'tmp/test-a/song-list.js'))
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
      assert.noFileContent('product.js', 'import')
    })

    it('should not contain space in a variable', function () {
      assert.fileContent('product.js', 'onSale: Array<string>;')
    })

    it('have camel case variables', function () {
      assert.fileContent('product.js', 'hasDynamicImages: boolean;')
    })

    it('convert `integer` to `number` due --convert options', function () {
      assert.fileContent('product.js', 'productId: number;')
    })

    it('need to be validated by FlowType', function (done) {
      runFlowType(this.generator_temporary_dir, function (code) {
        assert.file(path.join(__dirname, 'tmp/test-a/product.js'))
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
        assert.noFileContent('search-filter.js', 'import')
      })

      it('filters is an array of objects', function () {
        assert.fileContent('search-filter.js', 'filters: Array<Object>;')
      })

      it('sortingTemplate is an object', function () {
        assert.fileContent('search-filter.js', 'sortingTemplate: Object;')
      })

      it('need to be validated by FlowType', function (done) {
        runFlowType(this.generator_temporary_dir, function (code) {
          assert.file(path.join(__dirname, 'tmp/test-a/search-filter.js'))
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
          assert.file('search-filter.js')
        })

        it('import Filter class', function () {
          assert.fileContent(
            'search-filter.js',
            'import { Filter } from "./filter"')
        })

        it('filters is an array of filter', function () {
          assert.fileContent('search-filter.js', 'filters: Array<Filter>;')
        })

        it('import SortingTemplate class', function () {
          assert.fileContent(
            'search-filter.js',
            'import { SortingTemplate } from "./sorting-template";')
        })

        it('sortingTemplate is SortingTemplate object', function () {
          assert.fileContent(
            'search-filter.js',
            'sortingTemplate: SortingTemplate;')
        })
      })

      describe('SortingTemplate file', function () {
        it('file exists', function () {
          assert.file('sorting-template.js')
        })

        it('import SortingFilter class', function () {
          assert.fileContent(
            'sorting-template.js',
            'import { SortingFilter } from "./sorting-filter";')
        })

        it('sortingFilters is an array of SortingFilter', function () {
          assert.fileContent(
            'sorting-template.js',
            'sortingFilters: Array<SortingFilter>;')
        })
      })

      describe('Filter file', function () {
        it('file exists', function () {
          assert.file('filter.js')
        })

        it('propertyName is a string', function () {
          assert.fileContent(
            'filter.js',
            'propertyName: string;')
        })

        it('propertyValue is a string', function () {
          assert.fileContent(
            'filter.js',
            'propertyValue: string;')
        })
      })

      describe('SortingFilter file', function () {
        it('file exists', function () {
          assert.file('sorting-filter.js')
        })

        it('propertyName is a string', function () {
          assert.fileContent(
            'sorting-filter.js',
            'propertyName: string;')
        })
      })

      it('need to be validated by FlowType', function (done) {
        runFlowType(this.generator_temporary_dir, function (code) {
          assert.file(path.join(__dirname, 'tmp/test-a/search-filter.js'))
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
        .withArguments(path.join(__dirname, 'json-schema') + '/song*.json')
        .withOptions({
          convert: 'integer:number'
        })
        .on('end', done)
    })

    it('Song file exists', function () {
      assert.file('song.js')
    })

    it('SongList file exists', function () {
      assert.file('song-list.js')
    })
  })

  describe('target another destination path', function () {
    before(function (done) {
      removeFilesSync(path.join(__dirname, 'tmp/test-b', '**/*.js'))
      helpers.run(path.join(__dirname, '../generators/json-schema'))
        .inTmpDir((dir) => {
          this.generator_temporary_dir = dir
        })
        .withArguments(path.join(__dirname, 'json-schema') + '/**/*.json')
        .withOptions({
          convert: ['integer:number', 'object:Object'],
          target: path.join(__dirname, 'tmp/test-b')
        })
        .on('end', done)
    })

    it('Song file exists in tmp/test-b folder', function () {
      assert.file(path.join(__dirname, 'tmp/test-b', 'song.js'))
    })

    it('SongList file exists in tmp/test-b folder', function () {
      assert.file(path.join(__dirname, 'tmp/test-b', 'song-list.js'))
    })

    it('SearchFilter file exists in tmp/test-b folder', function () {
      assert.file(path.join(__dirname, 'tmp/test-b', 'search-filter.js'))
    })

    it('Product file exists in tmp/test-b folder', function () {
      assert.file(path.join(__dirname, 'tmp/test-b', 'product.js'))
    })

    it('Category file exist in tmp/test-b/sub-folder folder', function () {
      assert.file(path.join(__dirname, 'tmp/test-b/sub-folder', 'category.js'))
    })

    it('need to be validated by FlowType', function (done) {
      runFlowTypeIn('tmp/test-b',
        function (code) {
          assert.strictEqual(code, 0)
          done()
        })
    })
  })
})
