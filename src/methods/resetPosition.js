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
