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
