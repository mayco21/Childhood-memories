let fish;
let gameStartTime;
let foodParticles = [];
let gameOver = false;
let audioContext;

function resetGame() {
  gameStartTime = millis();
  fish = {
    x: 50,
    y: height / 2,
    direction: 1,
    size: 30,
    foodEaten: 0,
    alive: true
  };
  foodParticles = [];
  gameOver = false;
}

function setup() {
  createCanvas(800, 400);
  resetGame();
}

function drawFish(x, y, direction, size, alive) {
  push();
  translate(x, y);
  scale(direction, alive ? 1 : -1);
  
  fill(alive ? color(255, 100, 0) : color(150));
  ellipse(0, 0, size * 2, size);
  
  fill(alive ? color(255, 70, 0) : color(130));
  triangle(-size * 0.8, 0, -size * 1.3, -size * 0.5, -size * 1.3, size * 0.5);
  
  // סנפיר עליון
  triangle(-size * 0.2, -size * 0.5, size * 0.3, -size * 0.5, 0, -size * 0.8);
  
  // סנפיר תחתון מופנה כלפי מטה
  triangle(-size * 0.2, size * 0.5, size * 0.3, size * 0.5, 0, size * 0.8);
  
  fill(255);
  ellipse(size * 0.6, -size * 0.2, size * 0.3, size * 0.3);
  if (alive) {
    fill(0);
    ellipse(size * 0.65, -size * 0.2, size * 0.1, size * 0.1);
  } else {
    stroke(0);
    line(size * 0.5, -size * 0.3, size * 0.7, -size * 0.1);
    line(size * 0.5, -size * 0.1, size * 0.7, -size * 0.3);
  }
  
  pop();
}

function drawFood(x, y) {
  fill(0, 255, 0);
  ellipse(x, y, 15, 15);
}

function draw() {
  background(200, 230, 255);
  
  let currentGameTime = millis();
  let elapsedTime = (currentGameTime - gameStartTime) / 1000;
  let remainingTime = 60 - elapsedTime;
  
  if (remainingTime > 0 && fish.alive) {
    fish.x += 2 * fish.direction;
    if (fish.x > width - fish.size || fish.x < fish.size) {
      fish.direction *= -1;
    }
    
    if (frameCount % 30 == 0) { // שינוי מ-60 ל-30 להגדלת תדירות הופעת המזון
      foodParticles.push({
        x: random(width),
        y: 0
      });
    }
    
    for (let i = foodParticles.length - 1; i >= 0; i--) {
      let food = foodParticles[i];
      food.y += 1;
      
      if (dist(fish.x, fish.y, food.x, food.y) < fish.size * 1.5) { // הגדלת אזור האכילה
        foodParticles.splice(i, 1);
        fish.foodEaten++;
        fish.size = min(fish.size + 2, 80);
        playEatSound();
      } else if (food.y > height) {
        foodParticles.splice(i, 1);
      } else {
        drawFood(food.x, food.y);
      }
    }
  } else {
    gameOver = true;
    fish.alive = false;
    if (fish.y > fish.size / 2) {
      fish.y -= 1;  // הדג עולה לאט לחלק העליון של האקווריום
    }
  }
  
  drawFish(fish.x, fish.y, fish.direction, fish.size, fish.alive);
  
  if (gameOver) {
    drawGameOver();
  } else {
    drawTimer(remainingTime);
  }
}

function drawTimer(time) {
  push();
  fill(0);
  noStroke();
  textSize(32);
  textAlign(CENTER, TOP);
  text(`${Math.ceil(max(time, 0))}`, width/2, 10);
  
  stroke(0);
  noFill();
  rect(width/2 - 30, 5, 60, 40);
  pop();
}

function drawGameOver() {
  push();
  fill(0, 150);  // שחור עם שקיפות
  rect(0, 0, width, height);
  
  fill(255);
  textSize(64);
  textAlign(CENTER, CENTER);
  text("GAME OVER", width/2, height/2 - 50);
  
  fill(100, 200, 100);
  rect(width/2 - 75, height/2 + 50, 150, 50);
  fill(0);
  textSize(24);
  text("NEW FISH", width/2, height/2 + 75);
  pop();
}

function initAudio() {
  if (!audioContext) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
  }
}

function mousePressed() {
  initAudio(); // אתחול האודיו בלחיצה הראשונה
  if (gameOver) {
    if (mouseX > width/2 - 75 && mouseX < width/2 + 75 &&
        mouseY > height/2 + 50 && mouseY < height/2 + 100) {
      resetGame();
    }
  }
}

function playEatSound() {
  if (!audioContext) return; // אם אין הקשר אודיו, לא נפעיל צליל
  
  let oscillator = audioContext.createOscillator();
  let gainNode = audioContext.createGain();
  
  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);
  
  oscillator.type = 'sine';
  oscillator.frequency.setValueAtTime(440, audioContext.currentTime);
  
  gainNode.gain.setValueAtTime(0.5, audioContext.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
  
  oscillator.start();
  oscillator.stop(audioContext.currentTime + 0.1);
}