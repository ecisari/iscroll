IScroll.prototype.handleEvent = function (e) {
	switch ( e.type ) {
		case 'touchstart':
		case 'MSPointerDown':
		case 'mousedown':
			this._start(e);
			break;
		case 'touchmove':
		case 'MSPointerMove':
		case 'mousemove':
			this._move(e);
			break;
		case 'touchend':
		case 'MSPointerUp':
		case 'mouseup':
			this._end(e);
			break;
		case 'touchcancel':
		case 'MSPointerCancel':
		case 'mousecancel':
			this._end(e);
			break;
		case 'orientationchange':
		case 'resize':
			this._resize();
			break;
		case 'transitionend':
		case 'webkitTransitionEnd':
		case 'oTransitionEnd':
		case 'MSTransitionEnd':
			this._transitionEnd(e);
			break;
	}
};