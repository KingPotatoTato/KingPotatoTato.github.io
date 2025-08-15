let credits = 0;
let inputCredits = 0;

const creditInput = document.getElementById('creditInput');
const creditsDisplay = document.getElementById('credits');

creditInput.addEventListener('input', function (e) {
  creditInput.value = Math.round(creditInput.value);
  if (creditInput.value < 1) {
    creditInput.value = 1;
  }
  if (creditInput.value > credits) {
    creditInput.value = credits;
  }
  document.getElementById('dropButton').disabled = false;
  inputCredits = creditInput.value;
});

window.onload = function () {
  let storedCredits = localStorage.getItem('credits');
  if (storedCredits != null) {
    credits = parseInt(storedCredits, 10);
  }
  creditsDisplay.textContent = intToString(credits);
  if (credits <= 0) {
    creditInput.disabled = true;
  } else {
    creditInput.disabled = false;
  }
  document.getElementById('dropButton').disabled = true;
};

function intToString(num) {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

function showPopup(text, className) {
  const el = document.createElement('div');
  el.textContent = text;
  el.className = `popup ${className}`;
  creditsDisplay.appendChild(el);
  el.addEventListener('animationend', () => el.remove());
}

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
let balls = [];
let pegs = [];
let buckets = [];
let animationId;

// Game settings
const GRAVITY = 0.3;
const BOUNCE_DAMPING = 0.6;
const FRICTION = 0.98;
const BALL_RADIUS = 8;
const PEG_RADIUS = 7;

// Diagonal boundary walls that match peg triangle slope
const wallTop = 0;
const wallBottom = canvas.height;
const wallCenterX = canvas.width / 2;
const wallWidth = canvas.width * 1.1; // Width at bottom

document.getElementById('dropButton').addEventListener('click', dropBall);

// Initialize game
function initGame() {
  // Create pegs in a triangular pattern
  pegs = [];
  const rows = 13;
  const startY = 50;
  const rowSpacing = 45;

  for (let row = 0; row < rows; row++) {
    const pegsInRow = row + 2;
    const startX = (canvas.width - (pegsInRow - 1) * 40) / 2;

    for (let col = 0; col < pegsInRow; col++) {
      pegs.push({
        x: startX + col * 40,
        y: startY + row * rowSpacing,
        radius: PEG_RADIUS,
      });
    }
  }

  // Create buckets at the bottom
  buckets = [];
  const bucketCount = 13;
  const bucketWidth = canvas.width / bucketCount;
  const bucketValues = [2, 1.5, 1.2, 1, 0.5, 0.2, 0, 0.2, 0.5, 1, 1.2, 1.5, 2];

  for (let i = 0; i < bucketCount; i++) {
    buckets.push({
      x: i * bucketWidth,
      y: canvas.height - 60,
      width: bucketWidth,
      height: 60,
      value: bucketValues[i],
      color: getBucketColor(bucketValues[i]),
    });
  }
}

function getBucketColor(value) {
  switch (value) {
    case 2:
      return '#FFD700';
    case 1.5:
      return '#6bff6b';
    case 1.2:
      return '#6b6bff';
    case 1:
      return '#ff6bb5';
    case 0.5:
      return '#ffb56b';
    case 0.2:
      return '#4ECDC4';
    case 0:
      return '#FF6B6B';
    default:
      return '#FFA07A';
  }
}

function dropBall() {
  // Random starting position at the top, centered
  const startX = wallCenterX;
  credits -= inputCredits;
  localStorage.setItem('credits', credits);
  creditsDisplay.textContent = intToString(credits);
  showPopup('-' + inputCredits, 'minus');
  localStorage.setItem(
    'gamesPlayed',
    parseInt(localStorage.getItem('gamesPlayed'), 10) + 1
  );
  localStorage.setItem(
    'overall',
    parseInt(localStorage.getItem('overall'), 10) - inputCredits
  );
  if (inputCredits > credits) {
    creditInput.value = credits;
    inputCredits = credits;
  }
  if (credits <= 0) {
    document.getElementById('dropButton').disabled = true;
    creditInput.disabled = true;
  }
  balls.push({
    x: startX,
    y: 10,
    vx: 0,
    vy: 0,
    radius: BALL_RADIUS,
    color: `hsl(${Math.random() * 360}, 70%, 60%)`,
    trail: [],
    value: inputCredits,
  });
}

// Function to check collision with diagonal walls
function checkWallCollision(ball) {
  // Calculate the expected position of the diagonal walls at the ball's Y position
  const progress = Math.max(
    0,
    Math.min(1, (ball.y - wallTop) / (wallBottom - wallTop))
  );
  const currentWallWidth = 40 + wallWidth * progress; // Start narrow, get wider
  const leftWallX = wallCenterX - currentWallWidth / 2;
  const rightWallX = wallCenterX + currentWallWidth / 2;

  // Check collision with left diagonal wall
  if (
    ball.x - ball.radius <= leftWallX &&
    ball.y >= wallTop &&
    ball.y <= wallBottom
  ) {
    const wallSlope = wallWidth / (2 * (wallBottom - wallTop)); // Positive slope for left wall
    const normalX = -wallSlope;
    const normalY = 1;
    const normalLength = Math.sqrt(normalX * normalX + normalY * normalY);
    const nx = normalX / normalLength;
    const ny = normalY / normalLength;

    // Reflect velocity off the diagonal surface
    const dotProduct = ball.vx * nx + ball.vy * ny;
    ball.vx = (ball.vx - 2 * dotProduct * nx) * BOUNCE_DAMPING;
    ball.vy = (ball.vy - 2 * dotProduct * ny) * BOUNCE_DAMPING;

    // Push ball away from wall
    ball.x = leftWallX + ball.radius;
    return true;
  }

  // Check collision with right diagonal wall
  if (
    ball.x + ball.radius >= rightWallX &&
    ball.y >= wallTop &&
    ball.y <= wallBottom
  ) {
    const wallSlope = -wallWidth / (2 * (wallBottom - wallTop)); // Negative slope for right wall
    const normalX = -wallSlope;
    const normalY = 1;
    const normalLength = Math.sqrt(normalX * normalX + normalY * normalY);
    const nx = normalX / normalLength;
    const ny = normalY / normalLength;

    // Reflect velocity off the diagonal surface
    const dotProduct = ball.vx * nx + ball.vy * ny;
    ball.vx = (ball.vx - 2 * dotProduct * nx) * BOUNCE_DAMPING;
    ball.vy = (ball.vy - 2 * dotProduct * ny) * BOUNCE_DAMPING;

    // Push ball away from wall
    ball.x = rightWallX - ball.radius;
    return true;
  }

  return false;
}

function updatePhysics() {
  balls.forEach((ball, ballIndex) => {
    // Add to trail
    ball.trail.push({ x: ball.x, y: ball.y });
    if (ball.trail.length > 8) {
      ball.trail.shift();
    }

    // Apply gravity
    ball.vy += GRAVITY;

    // Apply friction
    ball.vx *= FRICTION;
    ball.vy *= FRICTION;

    // Update position
    ball.x += ball.vx;
    ball.y += ball.vy;

    // Check collision with pegs
    pegs.forEach((peg) => {
      const dx = ball.x - peg.x;
      const dy = ball.y - peg.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < ball.radius + peg.radius) {
        // Collision detected
        const angle = Math.atan2(dy, dx);
        const targetX = peg.x + Math.cos(angle) * (peg.radius + ball.radius);
        const targetY = peg.y + Math.sin(angle) * (peg.radius + ball.radius);

        ball.x = targetX;
        ball.y = targetY;

        // Reflect velocity
        const dotProduct =
          ball.vx * Math.cos(angle) + ball.vy * Math.sin(angle);
        ball.vx = (ball.vx - 2 * dotProduct * Math.cos(angle)) * BOUNCE_DAMPING;
        ball.vy = (ball.vy - 2 * dotProduct * Math.sin(angle)) * BOUNCE_DAMPING;

        // Add some randomness
        ball.vx += (Math.random() - 0.5) * 2;
        ball.vy += (Math.random() - 0.5) * 1;
      }
    });

    // Check collision with diagonal walls first
    if (!checkWallCollision(ball)) {
      // Only check outer canvas walls if not handled by diagonal walls
      if (ball.x - ball.radius <= 0 || ball.x + ball.radius >= canvas.width) {
        ball.vx = -ball.vx * BOUNCE_DAMPING;
        ball.x = Math.max(
          ball.radius,
          Math.min(canvas.width - ball.radius, ball.x)
        );
      }
    }

    // Check if ball landed in bucket
    if (ball.y + ball.radius >= canvas.height - 60 && ball.y < canvas.height) {
      buckets.forEach((bucket) => {
        if (ball.x >= bucket.x && ball.x <= bucket.x + bucket.width) {
          let won = Math.round(ball.value * bucket.value);

          credits += won;
          localStorage.setItem('credits', credits);
          creditsDisplay.textContent = intToString(credits);
          if (won != 0) {
            showPopup('+' + won, 'plus');
            document.getElementById('result').textContent =
              'You won ' + won + '!';
            if (won > ball.value) {
              localStorage.setItem(
                'totalWins',
                parseInt(localStorage.getItem('totalWins'), 10) + 1
              );
            }
            if (won > localStorage.getItem('biggestWin')) {
              localStorage.setItem('biggestWin', won);
            }
            localStorage.setItem(
              'overall',
              parseInt(localStorage.getItem('overall'), 10) + won
            );
            if (bucket.value == 2) {
              document.getElementById('result').className = 'result jackpot';
            } else {
              document.getElementById('result').className = 'result win';
            }
          } else {
            document.getElementById('result').textContent = 'X0 :(';
            document.getElementById('result').className = 'result';
          }

          // Create particle effect
          createParticleEffect(ball.x, ball.y);
          balls.splice(ballIndex, 1);
          if (credits > 0 && creditInput.disabled == true) {
            document.getElementById('dropButton').disabled = false;
            creditInput.disabled = false;
          }
        }
      });
    }

    // Remove balls that fall off screen
    if (ball.y > canvas.height + 100) {
      balls.splice(ballIndex, 1);
    }
  });
}

function createParticleEffect(x, y) {
  // Simple particle effect - could be expanded
  for (let i = 0; i < 10; i++) {
    setTimeout(() => {
      ctx.fillStyle = `hsl(${Math.random() * 360}, 100%, 50%)`;
      ctx.beginPath();
      ctx.arc(
        x + (Math.random() - 0.5) * 30,
        y + (Math.random() - 0.5) * 30,
        Math.random() * 3 + 1,
        0,
        Math.PI * 2
      );
      ctx.fill();
    }, i * 50);
  }
}

function draw() {
  // Clear canvas with gradient
  const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
  gradient.addColorStop(0, '#87CEEB');
  gradient.addColorStop(1, '#E0F6FF');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Draw diagonal boundary walls
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
  ctx.lineWidth = 2;
  ctx.setLineDash([5, 5]);

  // Left diagonal wall
  const leftTopX = wallCenterX - 20;
  const leftBottomX = wallCenterX - wallWidth / 2;
  ctx.beginPath();
  ctx.moveTo(leftTopX, wallTop);
  ctx.lineTo(leftBottomX, wallBottom);
  ctx.stroke();

  // Right diagonal wall
  const rightTopX = wallCenterX + 20;
  const rightBottomX = wallCenterX + wallWidth / 2;
  ctx.beginPath();
  ctx.moveTo(rightTopX, wallTop);
  ctx.lineTo(rightBottomX, wallBottom);
  ctx.stroke();

  ctx.setLineDash([]);

  // Draw pegs with glow effect
  pegs.forEach((peg) => {
    // Glow effect
    ctx.shadowColor = '#4ECDC4';
    ctx.shadowBlur = 10;

    ctx.fillStyle = '#2C3E50';
    ctx.beginPath();
    ctx.arc(peg.x, peg.y, peg.radius, 0, Math.PI * 2);
    ctx.fill();

    // Inner highlight
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#34495E';
    ctx.beginPath();
    ctx.arc(peg.x - 1, peg.y - 1, peg.radius * 0.6, 0, Math.PI * 2);
    ctx.fill();
  });

  // Draw buckets
  buckets.forEach((bucket) => {
    // Bucket body
    ctx.fillStyle = bucket.color;
    ctx.fillRect(bucket.x, bucket.y, bucket.width, bucket.height);

    // Bucket border
    ctx.strokeStyle = '#2C3E50';
    ctx.lineWidth = 2;
    ctx.strokeRect(bucket.x, bucket.y, bucket.width, bucket.height);

    // Bucket value text
    ctx.fillStyle = '#2C3E50';
    ctx.font = 'bold 14px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(
      bucket.value,
      bucket.x + bucket.width / 2,
      bucket.y + bucket.height / 2 + 5
    );
  });

  // Draw balls with trails
  balls.forEach((ball) => {
    // Draw trail
    ball.trail.forEach((point, index) => {
      const alpha = index / ball.trail.length;
      ctx.globalAlpha = alpha * 0.5;
      ctx.fillStyle = ball.color;
      ctx.beginPath();
      ctx.arc(point.x, point.y, ball.radius * alpha, 0, Math.PI * 2);
      ctx.fill();
    });

    // Draw ball
    ctx.globalAlpha = 1;
    ctx.fillStyle = ball.color;
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    ctx.fill();

    // Ball highlight
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.beginPath();
    ctx.arc(ball.x - 2, ball.y - 2, ball.radius * 0.5, 0, Math.PI * 2);
    ctx.fill();
  });

  ctx.shadowBlur = 0;
  ctx.globalAlpha = 1;
}

function gameLoop() {
  updatePhysics();
  draw();
  animationId = requestAnimationFrame(gameLoop);
}

// Initialize and start game
initGame();
gameLoop();
