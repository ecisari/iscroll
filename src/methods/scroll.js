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