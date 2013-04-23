module.exports = function(Handlebars) {

var templates = {};

templates["home_index_view"] = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [2,'>= 1.0.0-rc.3'];
helpers = helpers || Handlebars.helpers; data = data || {};
  var buffer = "", stack1, stack2, functionType="function", escapeExpression=this.escapeExpression, self=this;

function program1(depth0,data) {
  
  var buffer = "", stack1;
  buffer += "\n<p>Hello, "
    + escapeExpression(((stack1 = ((stack1 = ((stack1 = ((stack1 = depth0._app),stack1 == null || stack1 === false ? stack1 : stack1.attributes)),stack1 == null || stack1 === false ? stack1 : stack1.user)),stack1 == null || stack1 === false ? stack1 : stack1.name)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "!</p>\n";
  return buffer;
  }

function program3(depth0,data) {
  
  
  return "\n<p>Work in progress.</p>\n";
  }

  buffer += "<h1>Wecome to Proto!</h1>\n\n";
  stack2 = helpers['if'].call(depth0, ((stack1 = ((stack1 = ((stack1 = depth0._app),stack1 == null || stack1 === false ? stack1 : stack1.attributes)),stack1 == null || stack1 === false ? stack1 : stack1.user)),stack1 == null || stack1 === false ? stack1 : stack1.authenticated), {hash:{},inverse:self.program(3, program3, data),fn:self.program(1, program1, data),data:data});
  if(stack2 || stack2 === 0) { buffer += stack2; }
  buffer += "\n";
  return buffer;
  });

return templates;

};