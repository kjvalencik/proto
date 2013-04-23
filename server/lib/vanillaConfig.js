var fs          = require('fs'),
	Proxy       = require('node-proxy'),
	configMatch = /^\$Configuration\[/,
	VanillaConfig;

VanillaConfig = function (location, defaultConfigFile, configFile) {
	var TRUE = true,
		FALSE = false,
		PATH_LOCAL_CACHE = location + '/../cache',
		$Configuration, readConfig, array, config;

	array = function () {
		return Proxy.create({
			_data : {},
			get : function (rcvr, key) {
				var data;
				if (key === 'toJSON') {
					data = {};

					for (key in this._data) {
						if (Proxy.isProxy(this._data[key])) {
							data[key] = this._data[key].toJSON();
						} else {
							data[key] = this._data[key]; 
						}
					}

					return function () {
						return data;
					}
				}
				data = this._data[key];
				if (data === undefined) {
					data = array();
					this._data[key] = data;
				}
				return data;
			},
			set: function(rcvr, key, value) {
				this._data[key] = value;
			}
		});
	};

	readConfig = function (location, fileName) {
		var file = fs.readFileSync(location + '/' + fileName).toString(),
			lines = file.split('\n');

		lines.forEach(function (line) {
			line = line.replace("PATH_LOCAL_CACHE.", "PATH_LOCAL_CACHE+");

			if (configMatch.test(line)) {
				eval(line);
			}
		});
	};

	$Configuration = array();

	defaultConfigFile = defaultConfigFile || 'config-defaults.php';
	configFile = configFile || 'config.php';

	//readConfig(location, defaultConfigFile);
	readConfig(location, configFile);

	return $Configuration.toJSON();
};

module.exports = VanillaConfig;