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
