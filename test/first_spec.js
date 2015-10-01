var path    = require('path');
var fs      = require('fs-extra');
var helpers = require('yeoman-generator').test;
var assert  = require('yeoman-generator').assert;
var spawn   = require('child_process').spawn;
var yeoman  = require('yeoman-environment');

function runFlowType ( temporary_dir, callback ) {
  var flow = spawn( 'flow', ['check', __dirname + '/tmp' ] );

  fs.removeSync( path.join(__dirname, 'tmp/*.js') );
  fs.copySync( temporary_dir, path.join(__dirname, 'tmp') );

  // https://nodejs.org/api/child_process.html
  flow.stderr.on('data', function (data) {
    console.error('flow stderr: ' + data); // Log error in CI environment if needed
  } );

  flow.on( 'close', function( code ) {
    callback( code );
  } );
}

describe('Create TestClass with no attribute', function() {
  var generator, temporary_dir;

  before(function (done) {
    helpers.run( path.join( __dirname, '../generators/app') )
      .inTmpDir(function (dir) {
        temporary_dir = dir;
      })
      .withArguments(['TestClass'])         // Mock the arguments
      .withPrompts({ newAttribute: false }) // Mock the prompt answers
      .on('ready', function (generator) {
        // This is called right before `generator.run()` is called
      })
      .on('end', function() {
        generator = this.generator;
        done();
      } );
  } );

  it( 'should create a file named TestClass.js', function() {
    assert.file(['TestClass.js']);
  } );

  it( 'should declare the class porperly', function() {
    assert.fileContent( 'TestClass.js', 'class TestClass {' );
  } );

  it( 'should have a constructor in the class', function() {
    assert.fileContent( 'TestClass.js', /constructor[(][\s]*[)] {/ );
  } );

  it( 'should terminate the FlowType with code signal as 0', function(done) {
    runFlowType( temporary_dir, function(code) {
      assert.strictEqual( code, 0 );
      done();
    } );
  } );

} );

describe('Call generator without classname', function() {
  var env, generator, namespace;

  before(function () {
    env = yeoman.createEnv( [], {} );
    generator = path.join( __dirname, '../generators/app' );
    namespace = env.namespace( generator );
  } );

  it( 'should throw an error', function() {
    assert.throws( function() {
      env.register( generator );
      env.create( namespace, {} );
    }, function( err ) {
      return (err instanceof Error) && /Did not provide required argument/.test(err);
    }, "unexpected error" );

  } );

} );
