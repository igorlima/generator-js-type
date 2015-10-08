var yeomanGenerator = require('yeoman-generator')
var _ = require('lodash')
var fs = require('fs')
var path = require('path')
var pluralize = require('pluralize')
var glob = require('glob')
var async = require('async')

/**
 * To override the yeoman generator constructor, pass a constructor function to
 * `extend()` like so:
 *
 * @see http://yeoman.io/authoring/index.html
 */
module.exports = yeomanGenerator.Base.extend({

  /**
   * @private
   */
  _createObjectTypeConverter: function () {
    typeof temporary_dir === 'string'

    var convertOptions = typeof this.options['convert'] === 'string'
      ? [ this.options.convert ]
      : this.options.convert

    this.converter = {}
    _.map(convertOptions, (option) => {
      this.converter[option.split(':')[0]] = option.split(':')[1]
    })
  },

  /**
   * Overwriting the constructor
   *
   * Some generator methods can only be called inside the `constructor`
   * function. These special methods may do things like set up important state
   * controls and may not function outside of the constructor.
   *
   * @see http://yeoman.io/authoring/index.html
   * @constrcutor
   */
  constructor: function () {
    // Calling the super constructor is important
    // so the generator is correctly set up
    yeomanGenerator.Base.apply(this, arguments)
    // This makes `classname` a required argument.
    this.argument('filepath', {
      type: String,
      required: true,
      desc: 'json-schema file path'
    })
    // And then access it later on this way; e.g. CamelCased
    // this.filepath = _.camelCase(this.filepath)
    // Next, add your custom code
    this.option('coffee') // This method adds support for a `--coffee` flag
    this._createObjectTypeConverter()
  },

  /**
   * @param {object} property
   * @param {string} property.$ref
   * @param {Array.<>} property.items
   * @param {boolean} typeArray True if the property argument is an array
   * @private
   */
  _getObjectName: (property, typeArray, converter) => {
    var prop = typeArray ? property.items : property
    var objectName = !prop.$ref ? prop.type : _.capitalize(
      path.basename(
        prop.$ref,
        path.extname(prop.$ref)
      )
    )
    return converter(objectName)
  },

  /**
   * @private
   */
  _converterObjectName: function () {
    return (objectName) => {
      return this.converter[objectName] || objectName
    }
  },

  /**
   * @private
   */
  _shouldObjectBeImported: function () {
    return (objectName) => {
      return !_.contains(['string', 'number', 'Object'], objectName)
    }
  },

  /**
   * @private
   */
  _getArrayType: function (jsonSchemaProperties, getObjectName, converter) {
    var typeArray = jsonSchemaProperties.type === 'array' ? {} : null

    var objectName = getObjectName(jsonSchemaProperties, typeArray, converter)
    return typeArray && _.extend({}, {
      objectName: objectName,
      type: function () {
        return `Array<${this.objectName}>`
      }
    })
  },

  /**
   * @private
   */
  _changeObjectNameToPropertyName: function (attributes, array, propertyName) {
    var newObjectName = _.capitalize(pluralize.singular(propertyName))
    attributes.isObject = true
    attributes.isArray && (array.objectName = newObjectName)
    attributes.type = array ? array.type() : newObjectName
    attributes.objectName = newObjectName
    attributes.shouldBeImported = function () {
      return true
    }
  },

  /**
   * @private
   */
  _createObjectFileRecursively:
    function (parentProperties, parentPropertyName, attributes, array, folder) {
      this._changeObjectNameToPropertyName(
        attributes,
        array,
        parentPropertyName)

      this._writeFile(
        parentProperties.items || parentProperties,
        folder,
        this._getFileName(attributes.objectName))
    },

  /**
   * @private
   */
  _getTemplateAttributes: function (jsonSchema, folder) {
    var getObjectName = this._getObjectName
    var converter = this._converterObjectName()
    var shouldBeImported = this._shouldObjectBeImported()

    return _.map(jsonSchema.properties, (properties, propertyName) => {
      var array = this._getArrayType(properties, getObjectName, converter)
      var objectName = getObjectName(properties, array, converter)
      var attributes = {
        name: _.camelCase(propertyName),
        isArray: !!array,
        objectName: objectName,
        type: array ? array.type() : objectName,
        shouldBeImported: function () {
          return !!this.isArray && shouldBeImported(this.objectName)
        }
      }

      if (this.options.cascade && attributes.objectName === 'Object') {
        this._createObjectFileRecursively(
          properties,
          propertyName,
          attributes,
          array,
          folder)
      }
      return attributes
    })
  },

  /**
   * This basically remove the file extension from the file path
   *
   * @param {string} filepath The file path
   * @return {string} The file path without extension
   * @private
   */
  _getFilePath: function (filepath) {
    return path.join(
        this._getFileFolder(filepath),
        this._getFileName(filepath)
      )
  },

  _getFileFolder: function (filepath) {
    return path.parse(filepath).dir
  },

  /**
   * This basically remove the file extension from the file name
   *
   * @param {string} filepath The file path
   * @return {string} The file name without extension
   * @private
   */
  _getFileName: function (filepath) {
    return _.camelCase(
      path.basename(filepath, path.extname(filepath))
    )
  },

  /**
   * Yeoman is very careful when it comes to overwriting users files.
   * Basically, every write happening on a pre-existing file will go through
   * a conflict resolution process. This process requires that the user validate
   * every file write that overwrites content to its file.
   *
   * As asynchronous APIs are harder to use, Yeoman provide a synchronous
   * file-system API where every file gets written to an in-memory file system
   * and are only written to disk once when Yeoman is done running.
   *
   * @see http://yeoman.io/authoring/file-system.html
   * @see mem-fs documentation https://github.com/sboudrias/mem-fs
   * @see mem-fs-edito documentation https://github.com/sboudrias/mem-fs-editor
   * @see Template format http://ejs.co/
   * @private
   */
  _writeFile: function (jsonSchema, folder, filename) {
    var templatePath = `../../app/templates/${
      this.options.template || 'class'}.js`
    var destinationPath = this.destinationPath(
      path.join(folder, filename))
    // var destinationPath = this.options.target
    //   ? path.join(folder, filename)
    //   : filename

    this.fs.copyTpl(
      this.templatePath(templatePath),
      this.destinationPath(`${destinationPath}.js`),
      {
        classname: _.capitalize(filename),
        attributes: this._getTemplateAttributes(jsonSchema, folder),
        lodash: _
      }
    )
  },

  /**
   * This read the json-schema passed in the `filepath` argument then writes the
   * JS class file
   *
   * @public
   */
  readJsonSchemaAndWriteJSFile: function () {
    var done = this.async()

    glob(this.filepath, {nosort: true}, (er, files) => {
      var relativePathFrom = this._getFileFolder(files[0])

      async.each(files, (file, callback) => {
        fs.readFile(file, 'utf8', (err, data) => {
          var jsonSchema = JSON.parse(data)
          var folder = path.relative(
            relativePathFrom, this._getFileFolder(file))
          var filename = this._getFileName(file)
          this._writeFile(jsonSchema, folder, filename)
          callback(err)
        })
      }, function () {
        done()
      })
    })
  }
})
