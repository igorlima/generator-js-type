/* global describe, it, before */
var path = require('path')
var helpers = require('yeoman-generator').test
var assert = require('yeoman-generator').assert

describe('json-schema generator private methods', function () {
  before(function (done) {
    helpers.run(path.join(__dirname, '../generators/json-schema'))
      .withArguments(path.join(__dirname, 'json-schema/song.json'))
      .on('ready', (generator) => {
        this.myYeomanGenerator = generator
        done()
      })
  })

  describe('_getFileName', function () {
    it(`transform 'product.js' to 'product'`, function () {
      var filename = this.myYeomanGenerator._getFileName('product.js')
      assert.equal(filename, 'product')
    })

    it(`'firstFolder/product.json' to 'firstFolder/product'`, function () {
      var filename =
        this.myYeomanGenerator._getFileName('firstFolder/product.json')
      assert.equal(filename, 'firstFolder/product')
    })

    it(`'first/second/category.json' to 'first/second/category'`, function () {
      var filename =
        this.myYeomanGenerator._getFileName('first/second/category.json')
      assert.equal(filename, 'first/second/category')
    })
  })
})
