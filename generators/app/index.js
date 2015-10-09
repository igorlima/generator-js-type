var yeomanGenerator = require('yeoman-generator')
var _ = require('lodash')

/**
 * To override the yeoman generator constructor, pass a constructor function to
 * `extend()` like so:
 *
 * @see http://yeoman.io/authoring/index.html
 */
module.exports = yeomanGenerator.Base.extend({

  /**
   * Helper and private methods
   *
   * The prototype methods are considered as action, you may wonder how to
   * define helper or private methods that won't be called automatically.
   * There's three different methods to achieve this.
   * <ul>
   * <li>Prefix method name by an underscore (e.g. `_method`)
   * <li>Use instance methods
   * <li>Extend a parent yeoman generator
   * </ul>
   *
   * @see http://yeoman.io/authoring/running-context.html
   * @private
   */
  _exampleForPrivateMethod: function () {
    this.log('won\'t be called automatically')
    this.log('Cause method name is prefixed by an underscore (e.g. _method).')

    /**
     * Destination context
     *
     * The first context is the destination context.
     * The destination is the folder in which Yeoman will be scaffolding a new
     * application. It is the user project folder, it is where it'll write most
     * of the scaffolding. The template context is defined as `./templates/` by
     * default. You can overwrite this default by using
     * `generator.sourceRoot('new/template/path')`. You can get the path value
     * using `generator.sourceRoot()` or by joining a path using
     * `generator.templatePath('app/index.js')`
     *
     * @see http://yeoman.io/authoring/file-system.html
     */
    this.log(this.destinationRoot())
    this.log(this.destinationPath(`${this.classname}.js`))
    this.log(this.sourceRoot())
    this.log(this.templatePath('index.js'))
  },

  /**
   *
   * `st` is used with numbers ending in 1 (e.g. 1st, pronounced first)
   * `nd` is used with numbers ending in 2 (e.g. 92nd, pronounced ninety-second)
   * `rd` is used with numbers ending in 3 (e.g. 33rd, pronounced thirty-third)
   * As an exception to the above rules, all the "teen" numbers ending with 11,
   * 12 or 13 use -th (e.g. 11th, pronounced eleventh, 112th, pronounced one
   * hundred [and] twelfth)
   * `th` is used for all other numbers (e.g. 9th, pronounced ninth).
   *
   * @see Gist: https://gist.github.com/jlbruno/1535691
   * @see Rules: https://en.wikipedia.org/wiki/Ordinal_indicator#English
   * @private
  */
  _getOrdinal: (number) => {
    var suffix = ['th', 'st', 'nd', 'rd']
    var v = number % 100
    return number + (suffix[(v - 20) % 10] || suffix[v] || suffix[0])
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
    this.argument('classname', {
      type: String,
      required: true,
      desc: 'Class name'
    })
    // And then access it later on this way; e.g. CamelCased
    this.classname = _.camelCase(this.classname)
    // @{code this.attrs} stores will answers from user interactions
    this.attrs = []
    // Next, add your custom code
    this.option('coffee') // This method adds support for a `--coffee` flag
  },

  /**
   * Basically, behind the scene Yeoman always call a callback. This will call
   * `this.async()` to keep a reference variable and return the callback.
   * Then Yeoman will wait to go on to the next function until that callback
   * gets executed.
   *
   * @see Build Your Own Yeoman Generator http://goo.gl/0wjB8g
   * @public
   */
  promptForUserInput: function () {
    this._promptAttribute(arguments, this.async())
  },

  /**
   * User interactions
   * Prompts are the main way a yeoman generator interacts with a user.
   * The prompt module is provided by `Inquirer.js`.
   * Refer to its API for a list of available prompt options.
   *
   * @param {Array.<>} args A list of arguments
   * @param {Function} done A callback returned by `this.async()` in
   *                        {@code this.promptForUserInput}. This callback
   *                        should be called manually after finishing the
   *                        interactive command line with the user
   * @see http://yeoman.io/authoring/user-interactions.html
   * @see Inquirer documentation https://github.com/SBoudrias/Inquirer.js
   * @private
   */
  _promptAttribute: function (args, done) {
    var ordinalNumber = this._getOrdinal(this.attrs.length + 1)
    this.prompt({
      type: 'confirm',
      name: `addAttribute${this.attrs.length}`,
      message: `Add ${ordinalNumber} attribute?`,
      default: true
    }, (answers) => {
      if (answers[`addAttribute${this.attrs.length}`]) {
        this._promptAttributeName(arguments, done)
      } else {
        this._writeFile.apply(this, arguments)
        done()
      }
    })
  },

  /**
   *
   * @param {Array.<>} args A list of arguments
   * @param {Function} done A callback returned by `this.async()` in
   *                        {@code this.promptForUserInput}. This callback
   *                        should be called manually after finishing the
   *                        interactive command line with the user
   * @see http://yeoman.io/authoring/user-interactions.html
   * @see Inquirer documentation https://github.com/SBoudrias/Inquirer.js
   * @private
   */
  _promptAttributeName: function (args, done) {
    this.prompt({
      type: 'input',
      name: `attributeName${this.attrs.length}`,
      message: 'Attribute name',
      validate: this._validateUserInputIsNotEmpty
    }, (answers) => {
      this._promptAttributeType(answers, args, done)
    })
  },

  /**
   * @param {object} attributeNameAnswers
   * @param {Array.<>} args A list of arguments
   * @param {Function} done A callback returned by `this.async()` in
   *                        {@code this.promptForUserInput}. This callback
   *                        should be called manually after finishing the
   *                        interactive command line with the user
   * @see http://yeoman.io/authoring/user-interactions.html
   * @see Inquirer documentation https://github.com/SBoudrias/Inquirer.js
   * @private
   */
  _promptAttributeType: function (attributeNameAnswers, args, done) {
    this.prompt({
      type: 'list',
      name: `attributeType${this.attrs.length}`,
      message: 'Which type',
      choices: [ 'string', 'number', 'object' ]
    }, (answers) => {
      _.extend(answers, attributeNameAnswers)
      if (answers[`attributeType${this.attrs.length}`] !== 'object') {
        this._addAttribute(answers, args, done)
        return
      }

      this._promptAttributeClassName(answers, () => {
        this._addAttribute(answers, args, done)
      })
    })
  },

  /**
   * @param {object} objectAnswer
   * @param {Function} callback
   * @see http://yeoman.io/authoring/user-interactions.html
   * @see Inquirer documentation https://github.com/SBoudrias/Inquirer.js
   * @private
   */
  _promptAttributeClassName: function (objectAnswer, callback) {
    this.prompt({
      type: 'input',
      name: `attributeClassName${this.attrs.length}`,
      message: 'Class name',
      validate: this._validateUserInputIsNotEmpty
    }, (answers) => {
      objectAnswer.isObject = true
      objectAnswer[`attributeType${this.attrs.length}`] =
        answers[`attributeClassName${this.attrs.length}`]
      callback()
    })
  },

  /**
   * @param {object} answers
   * @param {Array.<>} args A list of arguments
   * @param {Function} done A callback returned by `this.async()` in
   *                        {@code this.promptForUserInput}. This callback
   *                        should be called manually after finishing the
   *                        interactive command line with the user
   * @private
   */
  _addAttribute: function (answers, args, done) {
    this.attrs.push({
      name: answers[`attributeName${this.attrs.length}`],
      type: answers[`attributeType${this.attrs.length}`],
      isObject: answers.isObject,
      objectName: answers[`attributeType${this.attrs.length}`]
    })
    this._promptAttribute(args, done)
  },

  _validateUserInputIsNotEmpty: (input) => {
    return input.length > 0
  },

  /**
   * Yeoman is very careful when it comes to overwriting users files.
   * Basically, every write happening on a pre-existing file will go through
   * a conflict resolution process.
   * This process requires that the user validate every file write that
   * overwrites content to its file.
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
  _writeFile: function () {
    _.forEach(this.attrs, (attr) => {
      _.extend(attr, {
        shouldBeImported: () => {
          return !!attr.isObject &&
            !_.contains(['string', 'number'], attr.objectName)
        }
      })
    })
    /**
     * Yeoman generators expose all file methods on `this.fs`,
     * which is an instance of `mem-fs editor`.
     * Make sure to check the module documentation for all available methods.
     *
     * Use the `copyTpl` method to copy the file while processing the content
     *  as a template. `copyTpl` is using ejs template syntax.
     */
    this.fs.copyTpl(
      this.templatePath('class.js'),
      this.destinationPath(`${_.kebabCase(this.classname)}.js`),
      {
        classname: this.classname,
        attributes: this.attrs,
        lodash: _
      }
    )
  }
})
