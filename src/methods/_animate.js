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
