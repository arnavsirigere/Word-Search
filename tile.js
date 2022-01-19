class Tile {
  constructor(char, x, y, i, j, w) {
    this.char = char;
    this.x = x;
    this.y = y;
    this.i = i;
    this.j = j;
    this.w = w;
    this.highlighted = false;
    this.h = 255;
    this.valChanged = false; // Is this tile already containing a letter of a word?
    this.changedLetter;
    this.hover = false;
  }

  convert(word, i) {
    this.char = word.charAt(i).toUpperCase();
    this.changedLetter = word.charAt(i).toUpperCase();
    this.valChanged = true;
  }

  show() {
    if (this.hover) {
      fill(127, 255, 255);
    } else if (this.highlighted) {
      fill(this.h, 255, 255);
    } else {
      fill(255);
    }
    ellipse(this.x + this.w / 2, this.y + this.w / 2, this.w - 3, this.w - 3);
    fill(0);
    textAlign(CENTER, CENTER);
    let txtSize = dim == 10 ? 32 : dim == 15 ? 24 : 16;
    textSize(txtSize);
    text(this.char, this.x + this.w / 2, this.y + this.w / 2);
    this.hover = false;
  }

  highlight(h) {
    this.highlighted = true;
    this.h = h;
  }

  isClicked(x, y) {
    return dist(x, y, this.x + this.w / 2, this.y + this.w / 2) < (this.w - 3) / 2;
  }
}
