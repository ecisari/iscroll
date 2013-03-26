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