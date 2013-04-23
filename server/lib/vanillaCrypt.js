var crypto = require('crypto'),
	phpjs  = require('phpjs'),
	VanillaCrypt;

function strXor (a, b) {
	var result = "",
		i;
	for (i = 0; i < a.length; i++) {
		result += String.fromCharCode(a.charCodeAt(i) ^ b.charCodeAt(i));
	}
	return result;
}

// This is a direct port. No attempts have been made to optimize and php.js is used
// even where native features exist.
function _hash(key, data, hashMethod) {
	var packFormat, innerPad, outerPad, innerHash;

	switch (hashMethod) {
	case 'md5':
		packFormat = 'H32';
		break;
	case 'sha1':
		packFormat = 'H40';
		break;
	default:
		throw new Error("Unsupported hash method");
	}

	if (key.length >= 64) {
		phpjs.pack(packFormat, crypto.createHash(hashMethod).update($Key).digest());
	} else {
		key = phpjs.str_pad(key, 64, String.fromCharCode(0));
	}

	innerPad = strXor(phpjs.substr(key, 0, 64), phpjs.str_repeat(String.fromCharCode(0x36), 64));
	outerPad = strXor(phpjs.substr(key, 0, 64), phpjs.str_repeat(String.fromCharCode(0x5C), 64));

	innerHash = crypto.createHash(hashMethod)
		.update(innerPad + data)
		.digest('hex');
	return crypto.createHash(hashMethod)
		.update(outerPad + phpjs.pack(packFormat, innerHash))
		.digest('hex');
}

VanillaCrypt = function (key, hashMethod) {
	// Default to md5
	hashMethod = hashMethod || 'md5';

	return {
		// Data is hash twice, once with a static salt, and a second time
		// with the result of the first as a salt in order to prevent
		// rainbow table lookups or other stochastic methods.
		hash : function (data) {
			return _hash(_hash(key, data, hashMethod), data, hashMethod);
		},
		checkCookie : function (cookie) {
			cookie = cookie.split('|');
			if (cookie.length < 2) {
				return;
			}
			if (this.hash(cookie[0]) === cookie[1]) {
				return cookie[0].split('-')[0];
			}
		}
	};
};


module.exports = VanillaCrypt;
