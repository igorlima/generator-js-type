var generators = require('yeoman-generator');
var _ = require('lodash');

module.exports = generators.Base.extend({

  _paths: function () {
    this.log( this.destinationRoot() );
    this.log( this.destinationPath( this.classname + '.js') );
    this.log( this.sourceRoot() );
    this.log( this.templatePath('index.js') );
  },

  // The name `constructor` is important here
  constructor: function () {
    // Calling the super constructor is important so our generator is correctly set up
    generators.Base.apply(this, arguments);

    // This makes `classname` a required argument.
    this.argument('classname', { type: String, required: true, desc: 'Class name' });
    // And you can then access it later on this way; e.g. CamelCased
    this.classname = _.camelCase(this.classname);

    this.attrs = [];

    // Next, add your custom code
    this.option('coffee'); // This method adds support for a `--coffee` flag

  },

  _method: function() {
    this.log('won\'t be called automatically');
    this.log('Cause method name is prefixed by an underscore (e.g. _method).');
  },

  askForAttribute: function() {
    var done = this.async();
    this.prompt( {
      type    : 'confirm',
      name    : 'newAttribute',
      message : 'Do you wanna add new attribute',
      default : true
    }, function (answers) {
      if (answers.newAttribute) {
        this._promptAttribute.apply( this, arguments );
      } else {
        this._writing.apply( this, arguments );
      }
      done();
    }.bind( this ) );
  },

  _addAttribute: function (answers, arguments, done) {
    this.attrs.push( answers );
    this.askForAttribute.apply( this, arguments );
    done();
  },

  _promptObjectAttribute: function(objectAnswer, callback) {
    this.prompt( {
      type    : 'input',
      name    : 'classname',
      message : 'Class name',
      validate: function( input ) {
        return input.length > 0;
      }
    }, function (answers) {
      objectAnswer.isObject = true;
      objectAnswer.type = answers.classname;
      callback();
    }.bind( this ) );
  },

  _promptAttribute: function () {
    var done = this.async();
    this.prompt( [ {
      type    : 'input',
      name    : 'name',
      message : 'Attribute name',
      validate: function( input ) {
        return input.length > 0;
      }
    }, {
      type    : 'list',
      name    : 'type',
      message : 'Which type',
      choices : [ 'string', 'number', 'object' ]
    } ], function (answers) {
      if (answers.type !== 'object' ) {
        this._addAttribute( answers, arguments, done );
        return;
      }

      this._promptObjectAttribute.call( this, answers, function() {
        this._addAttribute( answers, arguments, done );
      }.bind(this) );

    }.bind( this ) );
  },

  _writing: function () {
    // this.log( this.attrs );
    this.fs.copyTpl(
      this.templatePath('class.js'),
      this.destinationPath( this.classname + '.js' ),
      {
        classname: this.classname,
        attributes: this.attrs
      }
    );
  }
});
