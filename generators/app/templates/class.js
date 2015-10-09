/* @flow */
<% attributes.filter( function(attr) { return attr.shouldBeImported() } ).forEach(function(attribute) { -%>
import { <%= attribute.objectName %> } from "./<%= lodash.kebabCase(attribute.objectName) %>";
<% }) -%>

class <%= classname %> {

  <% attributes.forEach(function(attribute){ %>
  <%= attribute.name %>: <%- attribute.type %>;
  <% }); %>

  constructor( <%- attributes.map(function(attr) { return attr.name + ':' + attr.type }).join(', ') %> ) {
    <% attributes.forEach(function(attribute) { %>
    this.<%= attribute.name %> = <%= attribute.name%>;
    <% }); %>
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

}

export { <%= classname %> };
