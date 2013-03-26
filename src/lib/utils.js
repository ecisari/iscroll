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
