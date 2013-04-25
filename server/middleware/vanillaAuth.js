// TODO: Use the ORM built into sequelize
module.exports = function (app, sequelize, env) {
	var vanillaHash   = require('vanilla-hash')(env.current.vanillaConf.Garden.Cookie.Salt, 'md5'),
		cookieParser  = require('cookie');

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

	// Middleware to look for cookies and login if necessary
	app.use(function (req, res, next) {
		var cookies = cookieParser.parse(req.headers.cookie),
			cookie = cookies.Vanilla,
			volatileCookie = cookies['Vanilla-Volatile'],
			isAuthenticated = false,
			userId;

		// Conveinance functions
		req.isAuthenticated = function () {
			return isAuthenticated;
		};
		req.user = {};

		// Missing a cookie, abort!
		console.log(cookie);
		if (cookie === undefined || volatileCookie === undefined) {
			return next();
		}

		// Get the user from the cookie (and validate the hash)
		if (!vanillaHash.checkCookie(cookie)) {
			return next();
		}
		userId = cookie.parse('-')[0];

		// Find the user in the database
		findUser(userId, function (user) {
			// Couldn't find the user
			if (!user) {
				return next();
			}
			// Everything went swell, login!
			isAuthenticated = true;
			req.user = user;
		});
	});
};