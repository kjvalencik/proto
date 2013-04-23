// TODO: Use the ORM built into sequelize
module.exports = function (app, sequelize, env) {
	var vanillaCrypt  = require('../lib/vanillaCrypt')(env.current.vanillaConf.Garden.Cookie.Salt),
		cookieParser  = require('cookie'),
		passport      = require('passport'),
		LocalStrategy = require('passport-local').Strategy;

	function findUser(id, cb) {
		id = parseInt(id, 10);

		// Since id is always a number, it makes sql injection prevention easy
		if (isNaN(id)) {
			return cb();
		}

		sequelize.query('SELECT * FROM GDN_User WHERE UserID = ' + id)
		.success(function (users) {
			cb(users[0]);
		});
	};

	// Configure passport persistence functions
	// TODO: Serialize the entire user and add functionality
	// to keep in sync.
	// TODO: Error handling when user isn't found
	passport.serializeUser(function (user, done) {
		done(null, { UserID : user.UserID });
	});
	passport.deserializeUser(function(user, done) {
		findUser(user.UserID, function (user) {
			done(null, user);
		});
	});

	app.use(passport.initialize());
	app.use(passport.session());

	// Middleware to look for cookies and login if necessary
	app.use(function (req, res, next){
		var cookies = cookieParser.parse(req.headers.cookie),
			cookie = cookies.Vanilla,
			volatileCookie = cookies['Vanilla-Volatile'],
			userId;

		// Missing a cookie, abort!
		if (cookie === undefined || volatileCookie === undefined) {
			req.logout();
			return next();
		}

		// Get the user from the cookie (and validate the hash)
		userId = vanillaCrypt.checkCookie(cookie);
		if (!userId) {
			req.logout();
			return next();
		}

		// If we are logged in, but our userId doesn't match the
		// one in the cookie, logout first.
		if (req.isAuthenticated() && req.user.UserID.toString() !== userId.toString()) {
			req.logout();
		}

		// If we are authenticated, don't re-authenticate
		if (req.isAuthenticated()) {
			return next();
		}

		// Find the user in the database
		findUser(userId, function (user) {
			// Couldn't find the user
			if (!user) {
				return next();
			}
			// Everything went swell, login!
			req.login(user, function (err) {
				if (err) {
					return next(err);
				}
				next();
			});
		});
	});
};