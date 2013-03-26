IScroll.prototype._transitionTime = function (time) {
	time = time || 0;
	this.scrollerStyle[IScroll.utils.style.transitionDuration] = time + 'ms';
};