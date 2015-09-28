/* @flow */
<% if ( attributes.filter( function(attr) { return !!attr.isObject } ).length > 0 ) { %>
<% attributes.filter( function(attr) { return !!attr.isObject } ).forEach(function(attribute){ %>
import { <%= attribute.type %> } from "./<%= attribute.type %>";
<% }); %>
<% } %>

class <%= classname %> {

  <% attributes.forEach(function(attribute){ %>
  <%= attribute.name %>: <%= attribute.type %>;
  <% }); %>

  constructor( <%= attributes.map(function(attr) { return attr.name + ':' + attr.type }).join(', ') %> ) {
    <% attributes.forEach(function(attribute) { %>
    this.<%= attribute.name %> = <%= attribute.name%>;
    <% }); %>
  }

}

export { <%= classname %> };
