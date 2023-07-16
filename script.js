const cvs = document.getElementById("bird");
const ctx = cvs.getContext("2d");

let frames = 0;
const DEGREE = Math.PI / 180;
const sprite = new Image();
sprite.src = "img/sprite.png";

const SCORE_S = new Audio();
SCORE_S.src = "audio/sfx_point.wav";

const FLAP = new Audio();
FLAP.src = "audio/sfx_flap.wav";

const HIT = new Audio();
HIT.src = "audio/sfx_hit.wav";

const SWOOSHING = new Audio();
SWOOSHING.src = "audio/sfx_swooshing.wav";

const DIE = new Audio();
DIE.src = "audio/sfx_die.wav";

const state = {
  current: 0,
  getReady: 0,
  game: 1,
  over: 2,
};

const startBtn = {
  x: 120,
  y: 263,
  w: 83,
  h: 29,
};

class Bird {
  constructor() {
    this.animation = [
      { sX: 276, sY: 112 },
      { sX: 276, sY: 139 },
      { sX: 276, sY: 164 },
      { sX: 276, sY: 139 },
    ];
    this.x = 50;
    this.y = 150;
    this.w = 34;
    this.h = 26;
    this.radius = 12;
    this.frame = 0;
    this.gravity = 0.25;
    this.jump = 4.6;
    this.speed = 0;
    this.rotation = 0;
  }

  draw() {
    const bird = this.animation[this.frame];

    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rotation);
    ctx.drawImage(
      sprite,
      bird.sX,
      bird.sY,
      this.w,
      this.h,
      -this.w / 2,
      -this.h / 2,
      this.w,
      this.h
    );

    ctx.restore();
  }

  flap() {
    this.speed = -this.jump;
  }

  update() {
    this.period = state.current == state.getReady ? 10 : 5;
    this.frame += frames % this.period == 0 ? 1 : 0;
    this.frame = this.frame % this.animation.length;

    if (state.current == state.getReady) {
      this.y = 150;
      this.rotation = 0 * DEGREE;
    } else {
      this.speed += this.gravity;
      this.y += this.speed;

      if (this.y + this.h / 2 >= cvs.height - foreground.h) {
        this.y = cvs.height - foreground.h - this.h / 2;
        if (state.current == state.game) {
          state.current = state.over;
          DIE.play();
        }
      }

      if (this.speed >= this.jump) {
        this.rotation = 90 * DEGREE;
        this.frame = 1;
      } else {
        this.rotation = -25 * DEGREE;
      }
    }
  }

  speedReset() {
    this.speed = 0;
  }
}

class Game {
  constructor() {
    this.clickEvent = this.clickEvent.bind(this);
    this.spaceEvent = this.spaceEvent.bind(this);
  }

  clickEvent() {
    switch (state.current) {
      case state.getReady:
        state.current = state.game;
        SWOOSHING.play();
        break;
      case state.game:
        if (bird.y - bird.radius <= 0) return;
        bird.flap();
        FLAP.play();
        break;
      case state.over:
        let rect = cvs.getBoundingClientRect();
        let clickX = event.clientX - rect.left;
        let clickY = event.clientY - rect.top;

        if (
          clickX >= startBtn.x &&
          clickX <= startBtn.x + startBtn.w &&
          clickY >= startBtn.y &&
          clickY <= startBtn.y + startBtn.h
        ) {
          pipes.reset();
          bird.speedReset();
          score.reset();
          state.current = state.getReady;
        }
        break;
    }
  }

  spaceEvent(event) {
    if (event.code === "Space") {
      event.preventDefault();
      this.clickEvent();
    }
  }

  init() {
    document.addEventListener("click", this.clickEvent);
    document.addEventListener("keydown", this.spaceEvent);
  }

  destroy() {
    document.removeEventListener("click", this.clickEvent);
    document.removeEventListener("keydown", this.spaceEvent);
  }
}

class Background {
  constructor() {
    this.sX = 0;
    this.sY = 0;
    this.w = 275;
    this.h = 226;
    this.x = 0;
    this.y = cvs.height - 226;
  }

  draw() {
    ctx.drawImage(
      sprite,
      this.sX,
      this.sY,
      this.w,
      this.h,
      this.x,
      this.y,
      this.w,
      this.h
    );

    ctx.drawImage(
      sprite,
      this.sX,
      this.sY,
      this.w,
      this.h,
      this.x + this.w,
      this.y,
      this.w,
      this.h
    );
  }
}

class Foreground {
  constructor() {
    this.sX = 276;
    this.sY = 0;
    this.w = 224;
    this.h = 112;
    this.x = 0;
    this.y = cvs.height - 112;
    this.dx = 2;
  }

  draw() {
    ctx.drawImage(
      sprite,
      this.sX,
      this.sY,
      this.w,
      this.h,
      this.x,
      this.y,
      this.w,
      this.h
    );

    ctx.drawImage(
      sprite,
      this.sX,
      this.sY,
      this.w,
      this.h,
      this.x + this.w,
      this.y,
      this.w,
      this.h
    );
  }

  update() {
    if (state.current == state.game) {
      this.x = (this.x - this.dx) % (this.w / 2);
    }
  }
}

class GetReady {
  constructor() {
    this.sX = 0;
    this.sY = 228;
    this.w = 173;
    this.h = 152;
    this.x = cvs.width / 2 - 173 / 2;
    this.y = 80;
  }

  draw() {
    if (state.current == state.getReady) {
      ctx.drawImage(
        sprite,
        this.sX,
        this.sY,
        this.w,
        this.h,
        this.x,
        this.y,
        this.w,
        this.h
      );
    }
  }
}

class GameOver {
  constructor() {
    this.sX = 175;
    this.sY = 228;
    this.w = 225;
    this.h = 202;
    this.x = cvs.width / 2 - 225 / 2;
    this.y = 90;
  }

  draw() {
    if (state.current == state.over) {
      ctx.drawImage(
        sprite,
        this.sX,
        this.sY,
        this.w,
        this.h,
        this.x,
        this.y,
        this.w,
        this.h
      );
    }
  }
}

class Pipe {
  constructor() {
    this.position = [];
    this.top = { sX: 553, sY: 0 };
    this.bottom = { sX: 502, sY: 0 };
    this.w = 53;
    this.h = 400;
    this.gap = 85;
    this.maxYPos = -150;
    this.dx = 2;
  }

  draw() {
    for (let i = 0; i < this.position.length; i++) {
      let p = this.position[i];

      let topYPos = p.y;
      let bottomYPos = p.y + this.h + this.gap;

      ctx.drawImage(
        sprite,
        this.top.sX,
        this.top.sY,
        this.w,
        this.h,
        p.x,
        topYPos,
        this.w,
        this.h
      );

      ctx.drawImage(
        sprite,
        this.bottom.sX,
        this.bottom.sY,
        this.w,
        this.h,
        p.x,
        bottomYPos,
        this.w,
        this.h
      );
    }
  }

  update() {
    if (state.current !== state.game) return;

    if (frames % 100 == 0) {
      this.position.push({
        x: cvs.width,
        y: this.maxYPos * (Math.random() + 1),
      });
    }

    for (let i = 0; i < this.position.length; i++) {
      let p = this.position[i];
      let bottomPipeYPos = p.y + this.h + this.gap;

      if (
        bird.x + bird.radius > p.x &&
        bird.x - bird.radius < p.x + this.w &&
        bird.y + bird.radius > p.y &&
        bird.y - bird.radius < p.y + this.h
      ) {
        state.current = state.over;
        HIT.play();
      }

      if (
        bird.x + bird.radius > p.x &&
        bird.x - bird.radius < p.x + this.w &&
        bird.y + bird.radius > bottomPipeYPos &&
        bird.y - bird.radius < bottomPipeYPos + this.h
      ) {
        state.current = state.over;
        HIT.play();
      }

      p.x -= this.dx;

      if (p.x + this.w <= 0) {
        this.position.shift();
        score.value += 1;
        SCORE_S.play();
        score.best = Math.max(score.value, score.best);
        localStorage.setItem("best", score.best);
      }
    }
  }

  reset() {
    this.position = [];
  }
}

class Score {
  constructor() {
    this.best = parseInt(localStorage.getItem("best")) || 0;
    this.value = 0;
  }

  draw() {
    ctx.fillStyle = "#FFF";
    ctx.strokeStyle = "#000";

    if (state.current == state.game) {
      ctx.lineWidth = 2;
      ctx.font = "35px Teko";
      ctx.fillText(this.value, cvs.width / 2, 50);
      ctx.strokeText(this.value, cvs.width / 2, 50);
    } else if (state.current == state.over) {
      ctx.font = "25px Teko";
      ctx.fillText(this.value, 225, 186);
      ctx.strokeText(this.value, 225, 186);

      ctx.fillText(this.best, 225, 228);
      ctx.strokeText(this.best, 225, 228);
    }
  }

  reset() {
    this.value = 0;
  }
}

const background = new Background();
const foreground = new Foreground();
const bird = new Bird();
const getReady = new GetReady();
const gameOver = new GameOver();
const pipes = new Pipe();
const score = new Score();

function draw() {
  ctx.fillStyle = "#70c5ce";
  ctx.fillRect(0, 0, cvs.width, cvs.height);

  background.draw();
  pipes.draw();
  foreground.draw();
  bird.draw();
  getReady.draw();
  gameOver.draw();
  score.draw();
}

function update() {
  bird.update();
  foreground.update();
  pipes.update();
}

function loop() {
  update();
  draw();
  frames++;

  requestAnimationFrame(loop);
}

const game = new Game();
game.init();
loop();
