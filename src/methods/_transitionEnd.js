IScroll.prototype._transitionEnd = function (e) {
	if ( e.target != this.scroller ) {
		return;
	}

	this._transitionTime(0);
	this.resetPosition(435);
};
