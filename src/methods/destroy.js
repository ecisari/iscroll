// IScroll.prototype.delete = function () {
IScroll.prototype.destory = function () {
	utils = IScroll.utils;
	utils.removeEvent(window, 'orientationchange', this);
	utils.removeEvent(window, 'resize', this);

	if ( utils.has.touch ) {
		utils.removeEvent(this.wrapper, 'touchstart', this);
		utils.removeEvent(window, 'touchmove', this);
		utils.removeEvent(window, 'touchcancel', this);
		utils.removeEvent(window, 'touchend', this);
	}

	if ( utils.has.pointer ) {
		utils.removeEvent(this.wrapper, 'MSPointerDown', this);
		utils.removeEvent(window, 'MSPointerMove', this);
		utils.removeEvent(window, 'MSPointerCancel', this);
		utils.removeEvent(window, 'MSPointerUp', this);
	}

	utils.removeEvent(this.wrapper, 'mousedown', this);
	utils.removeEvent(window, 'mousemove', this);
	utils.removeEvent(window, 'mousecancel', this);
	utils.removeEvent(window, 'mouseup', this);

	utils.removeEvent(this.scroller, 'transitionend', this);
	utils.removeEvent(this.scroller, 'webkitTransitionEnd', this);
	utils.removeEvent(this.scroller, 'oTransitionEnd', this);
	utils.removeEvent(this.scroller, 'MSTransitionEnd', this);
};
