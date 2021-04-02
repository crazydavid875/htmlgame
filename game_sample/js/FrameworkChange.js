Framework.Sprite.prototype.OnClick = function (e) {
    var offset = 0;
    return (e.x > this.upperLeft.x + offset && e.x < this.lowerRight.x - offset) &&
        (e.y > this.upperLeft.y + offset && e.y < this.lowerRight.y - offset);
}

