var generators = require('yeoman-generator')
var _ = require('lodash')

module.exports = generators.Base.extend({

  _paths: function () {
    this.log(this.destinationRoot())
    this.log(this.destinationPath(this.classname + '.js'))
    this.log(this.sourceRoot())
    this.log(this.templatePath('index.js'))
  },

  _method: function () {
    this.log('won\'t be called automatically')
    this.log('Cause method name is prefixed by an underscore (e.g. _method).')
  },

  /**
    Rules: https://en.wikipedia.org/wiki/Ordinal_indicator#English

    `st` is used with numbers ending in 1 (e.g. 1st, pronounced first)
    `nd` is used with numbers ending in 2 (e.g. 92nd, pronounced ninety-second)
    `rd` is used with numbers ending in 3 (e.g. 33rd, pronounced thirty-third)
    As an exception to the above rules, all the "teen" numbers ending with 11, 12 or 13 use -th
    (e.g. 11th, pronounced eleventh, 112th, pronounced one hundred [and] twelfth)
    `th` is used for all other numbers (e.g. 9th, pronounced ninth).

    Gist: https://gist.github.com/jlbruno/1535691
  */
  _getOrdinal: function (number) {
    var suffix = ['th', 'st', 'nd', 'rd']
    var v = number % 100
    return number + (suffix[(v - 20) % 10] || suffix[v] || suffix[0])
  },

  // The name `constructor` is important here
  constructor: function () {
    // Calling the super constructor is important so our generator is correctly set up
    generators.Base.apply(this, arguments)

    // This makes `classname` a required argument.
    this.argument('classname', { type: String, required: true, desc: 'Class name' })
    // And you can then access it later on this way; e.g. CamelCased
    this.classname = _.camelCase(this.classname)

    this.attrs = []

    // Next, add your custom code
    this.option('coffee') // This method adds support for a `--coffee` flag
  },

  askForAttribute: function () {
    this._promptAttribute(arguments, this.async())
  },

  _promptAttribute: function (args, done) {
    var ordinalNumber = this._getOrdinal(this.attrs.length + 1)
    this.prompt({
      type: 'confirm',
      name: 'addAttribute' + this.attrs.length,
      message: 'Add ' + ordinalNumber + ' attribute?',
      default: true
    }, function (answers) {
      if (answers['addAttribute' + this.attrs.length]) {
        this._promptAttributeName(arguments, done)
      } else {
        this._writing.apply(this, arguments)
        done()
      }
    }.bind(this))
  },

  _promptAttributeName: function (args, done) {
    this.prompt({
      type: 'input',
      name: 'attributeName' + this.attrs.length,
      message: 'Attribute name',
      validate: function (input) {
        return input.length > 0
      }
    }, function (answers) {
      this._promptAttributeType(answers, args, done)
    }.bind(this))
  },

  _promptAttributeType: function (attributeNameAnswers, args, done) {
    this.prompt({
      type: 'list',
      name: 'attributeType' + this.attrs.length,
      message: 'Which type',
      choices: [ 'string', 'number', 'object' ]
    }, function (answers) {
      _.extend(answers, attributeNameAnswers)
      if (answers.type !== 'object') {
        this._addAttribute(answers, args, done)
        return
      }

      this._promptAttributeObjectName(answers, function () {
        this._addAttribute(answers, args, done)
      }.bind(this))
    }.bind(this))
  },

  _promptAttributeObjectName: function (objectAnswer, callback) {
    this.prompt({
      type: 'input',
      name: 'classname',
      message: 'Class name',
      validate: function (input) {
        return input.length > 0
      }
    }, function (answers) {
      objectAnswer.isObject = true
      objectAnswer.type = answers.classname
      callback()
    })
  },

  _addAttribute: function (answers, args, done) {
    this.attrs.push({
      name: answers['attributeName' + this.attrs.length],
      type: answers['attributeType' + this.attrs.length]
    })
    this._promptAttribute(args, done)
  },

  _writing: function () {
    // this.log( this.attrs );
    this.fs.copyTpl(
      this.templatePath('class.js'),
      this.destinationPath(this.classname + '.js'),
      {
        classname: this.classname,
        attributes: this.attrs
      }
    )
  }
})
