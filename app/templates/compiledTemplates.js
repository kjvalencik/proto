module.exports = function(Handlebars) {

var templates = {};

templates["home_index_view"] = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [2,'>= 1.0.0-rc.3'];
helpers = helpers || Handlebars.helpers; data = data || {};
  


  return "<h1>Wecome to Proto!</h1>\n<p>Work in progress.</p>\n";
  });

return templates;

};