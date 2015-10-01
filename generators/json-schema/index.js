var generators = require('yeoman-generator')
var _ = require('lodash')
var fs = require('fs')
var path = require('path')

module.exports = generators.Base.extend({

  // The name `constructor` is important here
  constructor: function () {
    // Calling the super constructor is important so our generator is correctly set up
    generators.Base.apply(this, arguments)

    // This makes `classname` a required argument.
    this.argument('filepath', { type: String, required: true, desc: 'json-schema file path' })
    // And you can then access it later on this way; e.g. CamelCased
    this.filepath = _.camelCase(this.filepath)

    // Next, add your custom code
    this.option('coffee') // This method adds support for a `--coffee` flag
  },

  _getPropertyType: function (property, isArray) {
    var prop = isArray ? property.items : property
    return !prop.$ref ? prop.type : _.capitalize(
      path.basename(
        prop.$ref,
        path.extname(prop.$ref)
      )
    )
  },

  writing: function () {
    var done = this.async()
    fs.readFile(this.filepath, 'utf8', function (err, data) {
      if (err) throw err

      var jsonSchema = JSON.parse(data)
      var ext = path.extname(this.filepath)
      var filename = _.capitalize(path.basename(this.filepath, ext))
      var getPropertyType = this._getPropertyType

      this.fs.copyTpl(
        this.templatePath('../../app/templates/class.js'),
        this.destinationPath(filename + '.js'),
        {
          classname: filename,
          attributes: _.map(jsonSchema.properties, function (property, propertyName) {
            var array = property.type === 'array' && {
              type: getPropertyType(property, true),
              toString: function () {
                return 'Array<' + this.type + '>'
              }
            }
            var type = array ? array.type : getPropertyType(property)

            return {
              name: propertyName,
              isArray: !!array,
              type: type,
              toString: array ? array.toString() : type
            }
          })
        }
      )

      done()
    }.bind(this))
  }

})
