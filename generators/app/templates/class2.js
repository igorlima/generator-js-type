/* @flow */

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

}

export { <%= classname %> };
