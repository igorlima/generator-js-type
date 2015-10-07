/* @flow */
<% attributes.filter( function(attr) { return attr.shouldBeImported() } ).forEach(function(attribute) { -%>
import { <%= attribute.objectName %> } from "./<%= attribute.objectName %>";
<% }) -%>

class <%= classname %> {

  <% attributes.forEach(function(attribute){ %>
  <%= attribute.name %>: <%- attribute.type %>;
  <% }); %>

  constructor () {

  }

  <% attributes.forEach(function(attr) { %>
  <%= lodash.camelCase( 'get_' + attr.name ) %>() : <%- attr.type %> {
    return this.<%= attr.name %>;
  }

  <%= lodash.camelCase( 'set_' + attr.name ) %>( <%- attr.name %>:<%- attr.type %> ) : <%= classname %> {
    this.<%= attr.name %> = <%= attr.name%>;
    return this;
  }
  <% }); %>

  setProperties(values:Object) : <%= classname %> {
    for(var key in values) {
      this.setProperty(key, values[key])
    }
    return this
  }

  setProperty(propertyName:string, value:any) : <%= classname %> {
    var self : any = this
    propertyName = [].concat( propertyName.match(/[a-z_][a-zA-Z0-9_]+/g) )[0]
    var capitalizePropertyName = propertyName.charAt(0).toUpperCase() + propertyName.slice(1)
    var setter = 'set' + capitalizePropertyName
    var object = null
    if (eval('typeof ' + capitalizePropertyName) === 'function' ) {
      object = new (eval(capitalizePropertyName))
      object.setProperties && object.setProperties(value)
    }
    self[setter] && self[setter](object || value)
    return self
  }

}

export { <%= classname %> };
