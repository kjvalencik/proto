var BaseAppView = require('rendr/shared/base/app_view');

var $body    = $('body'),
	$loading = $('.loading-indicator');

module.exports = BaseAppView.extend({
	events : {
		"click .forums-link"  : "enableLoading",
		"click #main-menu li" : "switchNav"
	},
	postInitialize : function() {
		this.app.on('change:loading', function(app, loading) {
			$body.toggleClass('loading', loading);
		}, this);
	},
	enableLoading : function (e) {
		$loading.show();
	},
	switchNav : function (e) {
		$(e.currentTarget).addClass('active')
			.siblings().removeClass('active');
	},
	// Make sure we only intercept clicks for relevent elements
	shouldInterceptClick : function (href, el) {
		var $el = $(el);
		// Use the base click intercepter
		return BaseAppView.shouldInterceptClick
			// Make sure this don't have a don't intercept attr
			&& ($el.attr('intercept') === false)
			// Make sure this is in a "proto" section
			&& ($el.parents('.proto').length > 0);
	}
});
