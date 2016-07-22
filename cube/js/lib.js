
RAD = Math.PI / 180;
DEG = 180 / Math.PI;


function pointInRect(x, y, r) {
  return (x > r.x && x < r.x + r.width && y > r.y && y < r.y + r.height);
}


function pointInCircle(px, py, cx, cy, radius) {
  return Math.sqrt((px - cx) * (px - cx) + (py - cy) * (py - cy)) < radius;
}


function distance(x1, y1, x2, y2) {
  return Math.sqrt((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1));
}


function map(value, a1, a2, b1, b2) {
  return ((value - a1) / (a2 - a1)) * (b2 - b1) + b1;
}


function lerp(first, last, value) {
  return value * (last - first) + first;
}
