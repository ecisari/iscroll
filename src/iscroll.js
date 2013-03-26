var IScroll = function (el, options) {
	el = typeof el == 'string' ? document.querySelector(el) : el;

	var utils = IScroll.utils;

	this.wrapper = el;
	this.scroller = this.wrapper.children[0];
	this.scrollerStyle = this.scroller.style;		// cache style for better performance

	this.options = {
		startX: 0,
		startY: 0,
		scrollX: true,
		scrollY: true,
		lockDirection: true,
		overshoot: true,
		momentum: true,
		//eventPassthrough: false,	TODO: preserve native vertical scroll on horizontal JS scroll (and vice versa)

		HWCompositing: true,		// set to false to skip the hardware compositing
		useTransition: true,
		useTransform: true
	};

	for ( var i in options ) {
		this.options[i] = options[i];
	}

	// Normalize options
	if ( !this.options.HWCompositing ) {
		utils.style.translateZ = '';
	}

	this.options.useTransition = utils.has.transition && this.options.useTransition;
	this.options.useTransform = utils.has.transform && this.options.useTransform;

	// default easing
	if ( this.options.useTransition ) {
		this.scroller.style[utils.style.transitionTimingFunction] = 'cubic-bezier(0.33,0.66,0.66,1)';
	}

	this.refresh();
	this.scrollTo(this.options.startX, this.options.startY, 0);
	this.enabled = true;

	utils.addEvent(window, 'orientationchange', this);
	utils.addEvent(window, 'resize', this);

	if ( utils.has.touch ) {
		utils.addEvent(this.wrapper, 'touchstart', this);
		utils.addEvent(window, 'touchmove', this);
		utils.addEvent(window, 'touchcancel', this);
		utils.addEvent(window, 'touchend', this);
	}

	if ( utils.has.pointer ) {
		utils.addEvent(this.wrapper, 'MSPointerDown', this);
		utils.addEvent(window, 'MSPointerMove', this);
		utils.addEvent(window, 'MSPointerCancel', this);
		utils.addEvent(window, 'MSPointerUp', this);
	}

	utils.addEvent(this.wrapper, 'mousedown', this);
	utils.addEvent(window, 'mousemove', this);
	utils.addEvent(window, 'mousecancel', this);
	utils.addEvent(window, 'mouseup', this);

	utils.addEvent(this.scroller, 'transitionend', this);
	utils.addEvent(this.scroller, 'webkitTransitionEnd', this);
	utils.addEvent(this.scroller, 'oTransitionEnd', this);
	utils.addEvent(this.scroller, 'MSTransitionEnd', this);
};

IScroll.prototype.disable = function () {
	this.enabled = false;
};

IScroll.prototype.enable = function () {
	this.enabled = true;
};

IScroll.prototype._resize = function () {
	this.refresh();
	this.resetPosition();
};
