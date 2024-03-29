class Particle {
  constructor(x, y, hu, firework, chase, target) {
    this.pos = createVector(x, y);
    this.firework = firework;
    this.lifespan = 255;
    this.hu = hu;
    this.acc = createVector();
    this.vel = createVector();
    this.chase = chase;

    if (this.chase) {
      this.chaseComplete = false;
      this.target = createVector(target.x, target.y);
    } else {
      this.chaseComplete = true;
    }
    if (this.firework) {
      this.vel = createVector(0, -10);
    }
  }

  applyForce(force) {
    this.acc.add(force);
  }

  update() {
    if (!this.chaseComplete) {
      this.applyForce(this.arrive());
    } else {
      if (!this.firework) {
        this.vel.mult(0.9);
        this.lifespan -= 1;
      }
    }
    this.vel.add(this.acc);
    this.pos.add(this.vel);
    this.acc.mult(0);
    if (this.chase) this.checkChase();
  }

  checkChase() {
    if (this.target.dist(this.pos) < 10) {
      this.chaseComplete = true;
    }
  }

  arrive() {
    let desired = p5.Vector.sub(this.target, this.pos);
    let steer = p5.Vector.sub(desired, this.vel);
    steer.limit(0.2);
    return steer;
  }

  done() {
    if (this.lifespan < 0) {
      return true;
    } else {
      return false;
    }
  }

  show() {
    colorMode(HSB);
    if (!this.firework) {
      strokeWeight(4);
      stroke(this.hu, 255, 255, this.lifespan);
    } else {
      strokeWeight(8);
      stroke(this.hu, 255, 255);
    }
    point(this.pos.x, this.pos.y);
  }
}
