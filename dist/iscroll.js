/*!
 * iScroll v5.0.0 pre-alpha-use-it-and-kittens-die ~ Copyright (c) 2012 Matteo Spinelli, http://cubiq.org
 * Released under MIT license, http://cubiq.org/license
 */
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

IScroll.utils = (function (window, document) {
	var _dummyStyle = document.createElement('div').style;

	var getTime = Date.now || function () { return new Date().getTime(); };

	var rAF = window.requestAnimationFrame  ||
		window.webkitRequestAnimationFrame  ||
		window.mozRequestAnimationFrame   ||
		window.oRequestAnimationFrame   ||
		window.msRequestAnimationFrame    ||
		function (callback) { window.setTimeout(callback, 1000 / 60); };

	var _vendor = (function () {
		var vendors = ['t', 'webkitT', 'MozT', 'msT', 'OT'],
			transform,
			i = 0,
			l = vendors.length;

		for ( ; i < l; i++ ) {
			transform = vendors[i] + 'ransform';
			if ( transform in _dummyStyle ) return vendors[i].substr(0, vendors[i].length-1);
		}

		return false;
	})();

	function _prefixStyle (style) {
		if ( _vendor === false ) return false;
		if ( _vendor === '' ) return style;
		return _vendor + style.charAt(0).toUpperCase() + style.substr(1);
	}

	function addEvent (el, type, fn, capture) {
		el.addEventListener(type, fn, !!capture);
	}

	function removeEvent (el, type, fn, capture) {
		el.removeEventListener(type, fn, !!capture);
	}

	function getComputedPosition (el, useTransform) {
		var matrix = getComputedStyle(el, null),
			x, y;

		if ( useTransform ) {
			matrix = matrix[style.transform].split(')')[0].split(', ');
			x = +(matrix[12] || matrix[4]);
			y = +(matrix[13] || matrix[5]);
		} else {
			x = +matrix.left.replace(/[^-\d]/g, '');
			y = +matrix.top.replace(/[^-\d]/g, '');
		}

		return { x: x, y: y };
	}

	function momentum (current, start, time, lowerMargin, maxOvershot) {
		var distance = current - start,
			speed = Math.abs(distance) / time,
			destination,
			duration,
			deceleration = 0.0009;

		destination = current + ( speed * speed ) / ( 2 * deceleration ) * ( distance < 0 ? -1 : 1 );
		duration = speed / deceleration;

		if ( destination < lowerMargin ) {
			destination = maxOvershot ? lowerMargin - ( maxOvershot / 2 * ( speed / 10 ) ) : lowerMargin;
			distance = Math.abs(destination - current);
			duration = distance / speed;
		} else if ( destination > 0 ) {
			destination = maxOvershot ? maxOvershot / 2 * ( speed / 10 ) : 0;
			distance = Math.abs(current) + destination;
			duration = distance / speed;
		}

		return {
			destination: Math.round(destination),
			duration: duration
		};
	}

	var _transform = _prefixStyle('transform');

	var has = {
		transform: _transform !== false,
		perspective: _prefixStyle('perspective') in _dummyStyle,
		touch: 'ontouchstart' in window,
		pointer: navigator.msPointerEnabled,
		transition: _prefixStyle('transition') in _dummyStyle
	};

	var style = {
		transform: _transform,
		transitionTimingFunction: _prefixStyle('transitionTimingFunction'),
		transitionDuration: _prefixStyle('transitionDuration'),
		translateZ: has.perspective ? ' translateZ(0)' : ''
	};

	return {
		getTime: getTime,
		rAF: rAF,
		has: has,
		style: style,
		addEvent: addEvent,
		removeEvent: removeEvent,
		getComputedPosition: getComputedPosition,
		momentum: momentum
	};
})(window, document);

IScroll.prototype._animate = function (destX, destY, duration) {
	var that = this,
		startX = this.x,
		startY = this.y,
		startTime = IScroll.utils.getTime(),
		destTime = startTime + duration;

	function step () {
		var now = IScroll.utils.getTime(),
			newX, newY,
			easing;

		if ( now >= destTime ) {
			that.isAnimating = false;
			that._translate(destX, destY);
			that.resetPosition(435);
			return;
		}

		now = ( now - startTime ) / duration - 1;
		easing = Math.sqrt( 1 - now * now );
		newX = ( destX - startX ) * easing + startX;
		newY = ( destY - startY ) * easing + startY;
		that._translate(newX, newY);

		if ( that.isAnimating ) {
			rAF(step);
		}
	}

	this.isAnimating = true;
	step();
};

IScroll.prototype._end = function (e) {
	if ( !this.enabled || !this.initiated ) {
		return;
	}

	var point = e.changedTouches ? e.changedTouches[0] : e,
		momentumX,
		momentumY,
		duration = IScroll.utils.getTime() - this.startTime,
		newX = Math.round(this.x),
		newY = Math.round(this.y),
		time;

	this.initiated = false;

	// reset if we are outside of the boundaries
	if ( this.resetPosition(300) ) {
		return;
	}

	// we scrolled less than 10 pixels
	if ( !this.moved ) {
		return;
	}

	// start momentum animation if needed
	if ( this.options.momentum && duration < 300 ) {
		momentumX = this.hasHorizontalScroll ? IScroll.utils.momentum(this.x, this.startX, duration, this.maxScrollX, this.options.overshoot ? this.wrapperWidth : 0) : { destination: newX, duration: 0 };
		momentumY = this.hasVerticalScroll ? IScroll.utils.momentum(this.y, this.startY, duration, this.maxScrollY, this.options.overshoot ? this.wrapperHeight : 0) : { destination: newY, duration: 0 };
		newX = momentumX.destination;
		newY = momentumY.destination;
		time = Math.max(momentumX.duration, momentumY.duration);
	}

	if ( newX != this.x || newY != this.y ) {
		this.scrollTo(newX, newY, time);
	}
};

IScroll.prototype._move = function (e) {
	if ( !this.enabled || !this.initiated ) {
		return;
	}

	var point   = e.touches ? e.touches[0] : e,
		deltaX    = this.hasHorizontalScroll ? point.pageX - this.pointX : 0,
		deltaY    = this.hasVerticalScroll ? point.pageY - this.pointY : 0,
		timestamp = IScroll.utils.getTime(),
		newX, newY,
		absDistX, absDistY;

	this.pointX   = point.pageX;
	this.pointY   = point.pageY;

	this.distX    += deltaX;
	this.distY    += deltaY;
	absDistX    = Math.abs(this.distX);
	absDistY    = Math.abs(this.distY);

	// We need to move at least 10 pixels for the scrolling to initiate
	if ( absDistX < 10 && absDistY < 10 ) {
		return;
	}

	// If you are scrolling in one direction lock the other
	if ( !this.directionLocked && this.options.lockDirection ) {
		if ( absDistX > absDistY + 5 ) {
			this.directionLocked = 'h';   // lock horizontally
		} else if ( absDistY > absDistX + 5 ) {
			this.directionLocked = 'v';   // lock vertically
		} else {
			this.directionLocked = 'n';   // no lock
		}
	}

	if ( this.directionLocked == 'h' ) {
		deltaY = 0;
	} else if ( this.directionLocked == 'v' ) {
		deltaX = 0;
	}

	newX = this.x + deltaX;
	newY = this.y + deltaY;

	// Slow down if outside of the boundaries
	if ( newX > 0 || newX < this.maxScrollX ) {
		newX = this.options.overshoot ? this.x + deltaX / 3 : newX > 0 ? 0 : this.maxScrollX;
	}
	if ( newY > 0 || newY < this.maxScrollY ) {
		newY = this.options.overshoot ? this.y + deltaY / 3 : newY > 0 ? 0 : this.maxScrollY;
	}

	this.moved = true;

	if ( timestamp - this.startTime > 300 ) {
		this.startTime = timestamp;
		this.startX = this.x;
		this.startY = this.y;
	}

	this._translate(newX, newY);
};

IScroll.prototype._start = function (e) {
  //e.returnValue = false;
  if ( !this.enabled ) {
    return;
  }

  // stick with one event type (touches only or mouse only)
  if ( this.initiated && e.type != this.initiated ) {
    return;
  }

  var point = e.touches ? e.touches[0] : e,
    pos;

  this.initiated  = e.type;
  this.moved    = false;
  this.distX    = 0;
  this.distY    = 0;
  this.directionLocked = 0;

  this._transitionTime();

  this.isAnimating = false;

  if ( this.options.momentum ) {
    pos = IScroll.utils.getComputedPosition(this.scroller, this.options.useTransform);

    if ( pos.x != this.x || pos.y != this.y ) {
      this._translate(pos.x, pos.y);
    }
  }

  this.startX = this.x;
  this.startY = this.y;
  this.pointX = point.pageX;
  this.pointY = point.pageY;

  this.startTime = IScroll.utils.getTime();
};
IScroll.prototype._transitionEnd = function (e) {
	if ( e.target != this.scroller ) {
		return;
	}

	this._transitionTime(0);
	this.resetPosition(435);
};

IScroll.prototype._transitionTime = function (time) {
	time = time || 0;
	this.scrollerStyle[IScroll.utils.style.transitionDuration] = time + 'ms';
};
IScroll.prototype._translate = function (x, y) {
	if ( this.options.useTransform ) {
		this.scrollerStyle[IScroll.utils.style.transform] = 'translate(' + x + 'px,' + y + 'px)' + IScroll.utils.style.translateZ;
	} else {
		x = Math.round(x);
		y = Math.round(y);
		this.scrollerStyle.left = x + 'px';
		this.scrollerStyle.top = y + 'px';
	}

	this.x = x;
	this.y = y;
};

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
IScroll.prototype.refresh = function () {
	// Force refresh (fake assignment to x for linters)
	var x = this.wrapper.offsetHeight;

	this.wrapperWidth = this.wrapper.clientWidth;
	this.wrapperHeight  = this.wrapper.clientHeight;

	this.scrollerWidth  = Math.round(this.scroller.offsetWidth);
	this.scrollerHeight = Math.round(this.scroller.offsetHeight);

	this.maxScrollX   = this.wrapperWidth - this.scrollerWidth;
	this.maxScrollY   = this.wrapperHeight - this.scrollerHeight;

	this.hasHorizontalScroll  = this.options.scrollX && this.maxScrollX < 0;
	this.hasVerticalScroll    = this.options.scrollY && this.maxScrollY < 0;
};

IScroll.prototype.resetPosition = function (time) {
	if ( this.x <= 0 && this.x >= this.maxScrollX && this.y <= 0 && this.y >= this.maxScrollY ) {
		return false;
	}

	var x = this.x,
		y = this.y;

	time = time || 0;

	if ( !this.hasHorizontalScroll || this.x > 0 ) {
		x = 0;
	} else if ( this.x < this.maxScrollX ) {
		x = this.maxScrollX;
	}

	if ( !this.hasVerticalScroll || this.y > 0 ) {
		y = 0;
	} else if ( this.y < this.maxScrollY ) {
		y = this.maxScrollY;
	}

	this.scrollTo(x, y, time);

	return true;
};

IScroll.prototype.scrollBy = function (x, y, time) {
	x = this.x + x;
	y = this.y + y;
	time = time || 0;

	this.scrollTo(x, y, time);
};

IScroll.prototype.scrollTo = function (x, y, time) {
	if ( !time || this.options.useTransition ) {
		this._transitionTime(time);
		this._translate(x, y);
	} else {
		this._animate(x, y, time);
	}
};