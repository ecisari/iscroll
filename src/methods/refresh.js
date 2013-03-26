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
