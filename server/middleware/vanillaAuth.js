// TODO: Use the ORM built into sequelize
module.exports = function (app, sequelize, env) {
	var vanillaHash = require('vanilla-hash')(env.current.vanillaConf.Garden.Cookie.Salt, 'md5'),
		cookieName = 'Vanilla';

	function findUser(id, cb) {
		id = parseInt(id, 10);

		// Since id is always a number, it makes sql injection prevention easy
		if (isNaN(id)) {
			return cb();
		}

		sequelize.query('SELECT * FROM GDN_User WHERE UserID = ' + id + ' LIMIT 1')
		.success(function (users) {
			cb(users[0]);
		});
	};

	// Middleware to look for cookies and login if necessary
	app.use(function (req, res, next) {
		var cookie = req.cookies[cookieName],
			isAuthenticated = false,
			ts, userId;
		req.user = {};

		// Convenience functions
		req.isAuthenticated = function () {
			return isAuthenticated;
		};
		req.login = function (userId, callback) {
			findUser(userId, function (user) {
				// Couldn't find the user
				if (!user) {
					res.clearCookie(cookieName);
					return callback("Couldn't find the user.");
				}

				try {
					user.Attributes = phpjs.unserialize(user.Attributes);
				} catch (e) {}
				try {
					user.Preferences = phpjs.unserialize(user.Preferences);
				} catch (e) {}				

				// Everything went swell, login!
				isAuthenticated = true;
				req.user = user;
				return callback(null, user);
			});
		};
		req.logIn = req.login;
		req.logout = function () {
			isAuthenticated = false;
			req.user = {};
			res.clearCookie(cookieName);
		};
		req.logOut = req.logout;

		// Missing a cookie, abort!
		if (cookie === undefined) {
			return next();
		}

		// Check the cookie for tampering
		if (!vanillaHash.checkCookie(cookie)) {
			res.clearCookie(cookieName);
			return next();
		}

		// Check that we have a valid cookie
		cookie = cookie.split("|");
		if (cookie.length < 5) {
			res.clearCookie(cookieName);
			return next();
		}

		// Check if the login expired
		ts = parseInt(cookie.pop(), 10);
		if (isNaN(ts) || ts < ((new Date()).getTime() / 1000)) {
			res.clearCookie(cookieName);
			return next();
		}

		// Login
		req.login(cookie.pop(), function (err, user) {
			if (err || !user) {
				res.clearCookie(cookieName);
			}
			next();
		});
	});
};