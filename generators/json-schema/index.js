var yeomanGenerator = require('yeoman-generator')
var _ = require('lodash')
var fs = require('fs')
var path = require('path')

/**
 * To override the yeoman generator constructor, pass a constructor function to
 * `extend()` like so:
 *
 * @see http://yeoman.io/authoring/index.html
 */
module.exports = yeomanGenerator.Base.extend({

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
    this.filepath = _.camelCase(this.filepath)
    // Next, add your custom code
    this.option('coffee') // This method adds support for a `--coffee` flag
  },

  /**
   * @param {object} property
   * @param {string} property.$ref
   * @param {Array.<>} property.items
   * @param {boolean} isArray True if the property argument is an array
   * @private
   */
  _getObjectName: (property, isArray) => {
    var prop = isArray ? property.items : property
    return !prop.$ref ? prop.type : _.capitalize(
      path.basename(
        prop.$ref,
        path.extname(prop.$ref)
      )
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
   * @public
   */
  writing: function () {
    var done = this.async()
    fs.readFile(this.filepath, 'utf8', (err, data) => {
      if (err) throw err

      var jsonSchema = JSON.parse(data)
      var ext = path.extname(this.filepath)
      var filename = _.capitalize(path.basename(this.filepath, ext))
      var getObjectName = this._getObjectName

      this.fs.copyTpl(
        this.templatePath('../../app/templates/class.js'),
        this.destinationPath(`${filename}.js`),
        {
          classname: filename,
          attributes: _.map(jsonSchema.properties,
            (property, propertyName) => {
              var array = property.type === 'array' && {
                objectName: getObjectName(property, true),
                type: () => {
                  return `Array<${objectName}>`
                }
              }
              var objectName = array ? array.objectName : getObjectName(property)

              return {
                name: _.camelCase(propertyName),
                isArray: !!array,
                objectName: objectName,
                type: array ? array.type() : objectName
              }
            })
        }
      )

      done()
    })
  }

})
