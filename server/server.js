//
// Home of the main server object
//
var express       = require('express'),
	env           = require('./lib/env'),
	vanillaConfig = require('./lib/vanillaConfig'),
	mw            = require('./middleware'),
	DataAdapter   = require('./lib/data_adapter'),
	rendrServer   = require('rendr').server,
	rendrMw       = require('rendr/server/middleware'),
	viewEngine    = require('rendr/server/viewEngine'),
	Sequelize     = require("sequelize"),
	sequelize,
	app;

app = express();

//
// Initialize our server
//
exports.init = function init(options, callback) {
	var vanillaConf = vanillaConfig(env.current.vanillaConf);
	env.current.vanillaConf = vanillaConf;
	sequelize = new Sequelize(vanillaConf.Database.Name, vanillaConf.Database.User,
		vanillaConf.Database.Password, {
		host       : vanillaConf.Database.Host,
		logging    : false,
		timestamps : false
	});

	initMiddleware();

	initLibs(function(err, result) {
		if (err) return callback(err);
		buildRoutes(app);
		callback(null, result);
	});
};

//
// options
// - port
//
exports.start = function start(options) {
	options = options || {};
	var port = options.port || 3030;
	app.listen(port);
	console.log("server pid " + process.pid + " listening on port " + port + " in " + app.settings.env + " mode");
};

//
// Initialize middleware stack
//
function initMiddleware() {
	app.configure(function() {
		// set up views
		app.set('views', __dirname + '/../app/views');
		app.set('view engine', 'js');
		app.engine('js', viewEngine);

		// Static routes
		app.use(express.compress());
		app.use(express.staticCache());
		app.use(express.static(__dirname + '/../public'));

		// Middleware to share authentication state with vanilla
		app.use(express.cookieParser());
		mw.vanillaAuth(app, sequelize, env);

		// set the middleware stack
		app.use(express.logger());
		app.use(express.bodyParser());
		app.use(app.router);
		app.use(mw.errorHandler());
	});
}

//
// Initialize our libraries
//
function initLibs(callback) {
	var options;
	options = {
		dataAdapter  : new DataAdapter(env.current.api),
		errorHandler : mw.errorHandler()
	};
	rendrServer.init(options, callback);
}

//
// Routes & middleware
//

// Attach our routes to our server
function buildRoutes(app) {
	buildApiRoutes(app);
	buildRendrRoutes(app);
	app.get(/^(?!\/api\/)/, mw.handle404());
}

// Insert these methods before Rendr method chain for all routes, plus API.
var preRendrMiddleware = [
	// Initialize Rendr app, and pass in any config as app attributes.
	// Initialize Rendr app, and pass in any config as app attributes.
	// TODO: Remove this hack of loading in session data with app data
	function (req, res, next) {
		var userData = { authenticated : req.isAuthenticated() },
			data = { user : userData },
			user;

		if (userData.authenticated) {
			userData.name = req.user.Name;
			userData.transientKey = req.user.Attributes.TransientKey;
		}

		rendrMw.initApp(_.extend({
			user : userData
		}, env.current.rendrApp))(req, res, next);
	}
];

function buildApiRoutes(app) {
	var fnChain = preRendrMiddleware.concat();
	fnChain.forEach(function(fn) {
		app.use('/api', fn);
	});
}

function buildRendrRoutes(app) {
	var routes, path, definition, fnChain;
	// attach Rendr routes to our Express app.
	routes = rendrServer.router.buildRoutes();
	routes.forEach(function(args) {
		path = args.shift();
		definition = args.shift();

		// Additional arguments are more handlers.
		fnChain = preRendrMiddleware.concat(args);

		// Have to add error handler AFTER all other handlers.
		fnChain.push(mw.errorHandler());

		// Attach the route to the Express server.
		app.get(path, fnChain);
	});
}
