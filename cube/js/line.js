
function Line(a, b, color) {
  // console.log('Line', a, b, color);
  this.a = Vector.copy(a);
  this.b = Vector.copy(b);
  this.color = Color.copy(color);
}

