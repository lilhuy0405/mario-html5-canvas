const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
//setup stats
const stats = new Stats();
stats.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom
document.body.appendChild(stats.dom);

if (screen.availHeight > screen.availWidth) {
  alert("Please use Landscape!");
}

const upBtn = document.getElementById('up');
const leftBtn = document.getElementById('left');
const rightBtn = document.getElementById('right');

const gravity = 1;
//helper functions
const createImage = (src) => {
  const image = new Image();
  image.src = src;
  return image;
}


class Player {
  constructor() {
    this.position = {
      x: 100,
      y: 100
    }
    //player speed
    this.velocity = {
      x: 0,
      y: 0
    }
    this.width = 3480 / 60;
    this.height = 115;
    this.speed = 5;
    this.image = createImage("img/standing-right.png")
    this.frame = 0;

    this.sprites = {
      stand: {
        right: createImage("img/standing-right.png"),
        left: createImage("img/standing-left.png"),
        cropWidth: 3480 / 60,
        width: 3480 / 60,
      },
      run: {
        right: createImage("img/run-right.png"),
        left: createImage("img/run-left.png"),
        cropWidth: 5445 / 60,
        width: 5445 / 60
      },
      shuriken: {
        right: createImage("img/throw-right.png"),
        width: 58
      }
    }

    this.currentSprite = this.sprites.stand.right;
    this.currentSpriteCropWidth = 3480 / 60
  }

  draw() {
    ctx.drawImage(
      this.currentSprite,
      this.currentSpriteCropWidth * this.frame,
      0,
      this.currentSpriteCropWidth,
      107,
      this.position.x,
      this.position.y,
      this.width,
      this.height);
  }

  update() {
    this.frame++;
    if (this.frame >= 60) {
      this.frame = 0;
    }
    this.draw()
    //handle movement
    this.position.y += this.velocity.y;
    this.position.x += this.velocity.x;
    if (this.position.y < 0) {
      this.position.y = 0;
    }
    if (this.position.x < 0) {
      this.position.x = 0;
    }

    if (this.position.y + this.height + this.velocity.y <= canvas.height) {
      this.velocity.y += gravity;
    }
  }
}

class Platform {
  constructor(data) {
    this.position = {
      x: data.x,
      y: data.y
    }
    this.width = data.width;
    this.height = data.height;
    this.image = createImage(data.image);
  }

  draw() {
    ctx.drawImage(this.image, this.position.x, this.position.y, this.width, this.height);
  }
}

class Background {
  constructor(data) {
    this.position = {
      x: data.x,
      y: data.y
    }

    this.image = createImage(data.image);
    this.width = data.width || this.image.width;
    this.height = data.height || this.image.height;
  }

  draw() {
    //background scroll
    if (this.position.x > canvas.width) {
      this.position.x = 0;
    }
    if (this.position.x < 0) {
      this.position.x = canvas.width;
    }
    ctx.drawImage(this.image, this.position.x, this.position.y, this.width, this.height);
    ctx.drawImage(this.image, -(canvas.width - this.position.x), this.position.y, this.width, this.height);

  }
}

class Shuriken {
  constructor(data) {
    this.position = {
      x: data.x,
      y: data.y
    }
    this.velocity = {
      x: data.velocity.x,
      y: data.velocity.y
    }
    this.acceleration = 1;
    this.width = 950 / 20;
    this.height = 50
    this.image = createImage("img/shuriken.png")
    this.cropWidth = 950 / 20
    this.frame = 0;


  }

  draw() {
    ctx.drawImage(
      this.image,
      this.cropWidth * this.frame,
      0,
      this.cropWidth,
      this.height,
      this.position.x,
      this.position.y,
      this.width,
      this.height);
  }


  update() {

    this.frame++;
    if (this.frame >= 20) {
      this.frame = 0;
    }

    this.position.x += this.velocity.x;
    this.position.y += gravity;
    //c??ng bay c??ng nhanh
    if (this.velocity.x > 0) {
      this.velocity.x += this.acceleration;
    } else {
      this.velocity.x -= this.acceleration;
    }
    this.draw()
  }
}

//game logic
const keys = {
  'ArrowLeft': false,
  'ArrowRight': false,
  'ArrowUp': false
}


let scrollOffset = 0;
let platforms = [];
let player = new Player();
let genericObjs = []
let staticObject = new Background({
  x: 30,
  y: 30,
  width: 120,
  height: 80,
  image: "img/sun.png"
});


//restart game
const init = () => {
  player = new Player();
  scrollOffset = 0;
  platforms = [];
//create platforms
  for (let i = 0; i < 3; i++) {
    let platform = new Platform({x: i * 250, y: 640, width: 250, height: 60, image: "/img/platform.png"})
    platforms.push(platform);
  }
  const upperPlatForm = new Platform({x: 840, y: 530, width: 40, height: 30, image: "/img/platform.png"})
  platforms.push(upperPlatForm);
  for (let i = 0; i < 2; i++) {
    let platform = new Platform({
      x: (3 * 250 + 220) + (i * 250),
      y: 640,
      width: 250,
      height: 60,
      image: "/img/platform.png"
    })
    platforms.push(platform);
  }

  // const background = new Background({
  //   x: -1,
  //   y: -1,
  //   width: canvas.width,
  //   height: canvas.height,
  //   image: "img/background.png"
  // });

  const clouds = [
    new Background({
      x: 200,
      y: 300,
      width: 200,
      height: 80,
      image: "img/cloud-2.png"
    }),

    new Background({
      x: 600,
      y: 350,
      width: 200,
      height: 80,
      image: "img/cloud-2.png"
    }),

    new Background({
      x: 470,
      y: 100,
      width: 200,
      height: 80,
      image: "img/cloud-2.png"
    }),

  ];

  genericObjs = [...clouds]
  staticObject = new Background({
    x: 30,
    y: 30,
    width: 120,
    height: 80,
    image: "img/sun.png"
  });
}


//game loop
const shurikens = []

function animate() {
  stats.begin();
  const id = requestAnimationFrame(animate);
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  //position is matter here need to drawl background first then player
  genericObjs.forEach(genericObj => {
    genericObj.draw();
  });
  staticObject.draw();
  player.update();
  //shuriken.velocity.x += 5;
  platforms.forEach(platform => {
    platform.draw();
  })

  shurikens.forEach(shuriken => {
    shuriken.update();
  })
  if (keys['ArrowRight'] && player.position.x < canvas.width / 2) {
    player.velocity.x = 5;

  } else if (keys['ArrowLeft'] && player.position.x >= 100) {
    player.velocity.x = -5;
  } else {
    player.velocity.x = 0;
    //move platform to the left
    if (keys['ArrowRight']) {
      genericObjs.forEach(genericObj => {
        genericObj.position.x -= player.speed * 0.6;
      });
      platforms.forEach(platform => {
        platform.position.x -= player.speed;
      })
      scrollOffset += player.speed;
    } else if (keys['ArrowLeft'] && scrollOffset > 0) {
      //move platform to the right
      platforms.forEach(platform => {
        platform.position.x += player.speed;
      })
      genericObjs.forEach(genericObj => {
        genericObj.position.x += player.speed * 0.6;
      });
      scrollOffset -= player.speed;
    }


    if (scrollOffset > 2000) {
      alert('You win!')
      window.cancelAnimationFrame(id);
    }

    if (player.position.y > canvas.height) {
      init()
    }
  }
  //collision detection for top right left of the platform not the bottom of the platform
  platforms.forEach(platform => {
    if (player.position.y + player.height + player.velocity.y >= platform.position.y && // when player falls below the platform
      player.position.y + player.height <= platform.position.y && // when player jumps on the platform
      player.position.x + player.width >= platform.position.x && // when player is to the right of the platform
      player.position.x <= platform.position.x + platform.width // when player is to the left of the platform
    ) {
      player.velocity.y = 0;
    }
  })
  stats.end();
}

init()
animate()

window.addEventListener('keydown', function (event) {
  switch (event.code) {
    case 'ArrowUp':
      //run one time only
      if (player.velocity.y === 0) {
        player.velocity.y = -18;
      }
      break;
    case 'ArrowDown':
      keys['ArrowDown'] = true;
      break;
    case 'ArrowLeft':
      player.currentSprite = player.sprites.run.left;
      player.currentSpriteCropWidth = player.sprites.run.cropWidth;
      player.width = player.sprites.run.width;
      keys['ArrowLeft'] = true;
      break;
    case 'ArrowRight':
      keys['ArrowRight'] = true;
      player.currentSprite = player.sprites.run.right;
      player.currentSpriteCropWidth = player.sprites.run.cropWidth;
      player.width = player.sprites.run.width;
      break;
  }
})

window.addEventListener('keyup', function (event) {
  switch (event.code) {
    case 'ArrowLeft':
      keys['ArrowLeft'] = false;
      if (player.currentSprite === player.sprites.run.left) {
        player.currentSprite = player.sprites.stand.left;
        player.currentSpriteCropWidth = player.sprites.stand.cropWidth;
        player.width = player.sprites.stand.width;
      }
      break;
    case 'ArrowRight':
      keys['ArrowRight'] = false;
      if (player.currentSprite === player.sprites.run.right) {
        player.currentSprite = player.sprites.stand.right;
        player.currentSpriteCropWidth = player.sprites.stand.cropWidth;
        player.width = player.sprites.stand.width;
      }
      break;
    case 'Space':
      let shuriken;
      if (player.currentSprite === player.sprites.stand.right ||
        player.currentSprite === player.sprites.run.right) {
        shuriken = new Shuriken({
          x: player.position.x + player.width / 2,
          y: player.position.y + player.height / 2,
          velocity: {
            x: 5,
          }
        })
      } else if (player.currentSprite === player.sprites.stand.left ||
        player.currentSprite === player.sprites.run.left) {
        shuriken = new Shuriken({
          x: player.position.x + player.width / 2,
          y: player.position.y + player.height / 2,
          velocity: {
            x: -5,
          }
        })
      }
      shurikens.push(shuriken);
      break;
  }
})

upBtn.addEventListener("touchstart", e => {
  if (player.velocity.y === 0) {
    player.velocity.y = -18;
  }
})

leftBtn.addEventListener("touchstart", () => {
  player.currentSprite = player.sprites.run.left;
  player.currentSpriteCropWidth = player.sprites.run.cropWidth;
  player.width = player.sprites.run.width;
  keys['ArrowLeft'] = true;
})
leftBtn.addEventListener("touchend", () => {
  keys['ArrowLeft'] = false;
  if (player.currentSprite === player.sprites.run.left) {
    player.currentSprite = player.sprites.stand.left;
    player.currentSpriteCropWidth = player.sprites.stand.cropWidth;
    player.width = player.sprites.stand.width;
  }
})

rightBtn.addEventListener("touchstart", () => {
  keys['ArrowRight'] = true;
  player.currentSprite = player.sprites.run.right;
  player.currentSpriteCropWidth = player.sprites.run.cropWidth;
  player.width = player.sprites.run.width;
})
rightBtn.addEventListener("touchend", () => {
  keys['ArrowRight'] = false;
  if (player.currentSprite === player.sprites.run.right) {
    player.currentSprite = player.sprites.stand.right;
    player.currentSpriteCropWidth = player.sprites.stand.cropWidth;
    player.width = player.sprites.stand.width;
  }
})


