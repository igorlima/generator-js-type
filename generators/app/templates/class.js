/* @flow */
<% if ( attributes.filter( function(attr) { return !!attr.isObject || !!attr.isArray } ).length > 0 ) { %>
<% attributes.filter( function(attr) { return !!attr.isObject || !!attr.isArray } ).forEach(function(attribute){ %>
import { <%= attribute.type %> } from "./<%= attribute.type %>";
<% }); %>
<% } %>

class <%= classname %> {

  <% attributes.forEach(function(attribute){ %>
  <%= attribute.name %>: <%- attribute.toString %>;
  <% }); %>

  constructor( <%- attributes.map(function(attr) { return attr.name + ':' + attr.toString }).join(', ') %> ) {
    <% attributes.forEach(function(attribute) { %>
    this.<%= attribute.name %> = <%= attribute.name%>;
    <% }); %>
  }

}

export { <%= classname %> };
