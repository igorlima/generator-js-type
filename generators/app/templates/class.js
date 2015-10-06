/* @flow */
<% attributes.filter( function(attr) { return attr.shouldBeImported() } ).forEach(function(attribute) { -%>
import { <%= attribute.objectName %> } from "./<%= attribute.objectName %>";
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

}

export { <%= classname %> };
