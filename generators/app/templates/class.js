/* @flow */
<%
  var PRIMITIVE_TYPES = ['string', 'integer']
  if ( attributes.filter( function(attr) { return !!attr.isObject || !!attr.isArray } ).length > 0 ) {
    attributes.filter( function(attr) { return !!attr.isObject || !!attr.isArray } ).forEach(function(attribute){
      if (!(PRIMITIVE_TYPES.indexOf(attribute.objectName) !== -1)) {
-%>
import { <%= attribute.objectName %> } from "./<%= attribute.objectName %>";
<%
      }
    });
  }
-%>

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
