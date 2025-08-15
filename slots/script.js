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
  document.getElementById('spinButton').disabled = false;
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
  document.getElementById('spinButton').disabled = true;
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

class SlotMachine {
  constructor() {
    this.symbols = ['🍒', '🍋', '🍊', '🍇', '🔔', '💎', '7️⃣', '⭐'];
    this.reels = [
      document.getElementById('reel1'),
      document.getElementById('reel2'),
      document.getElementById('reel3'),
    ];
    this.spinButton = document.getElementById('spinButton');
    this.result = document.getElementById('result');
    this.spinning = false;
    this.finalSymbols = []; // Track what symbols should be visible

    this.initReels();
    this.spinButton.addEventListener('click', () => this.spin());
  }

  initReels() {
    this.reels.forEach((reel) => {
      // Create enough symbols for smooth scrolling
      for (let i = 0; i < 30; i++) {
        const symbol = document.createElement('div');
        symbol.className = 'symbol';
        symbol.textContent =
          this.symbols[Math.floor(Math.random() * this.symbols.length)];
        reel.appendChild(symbol);
      }
    });
  }

  async spin() {
    if (this.spinning || credits <= 0) return;

    this.spinning = true;
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
    this.spinButton.disabled = true;
    creditInput.disabled = true;
    this.result.textContent = 'Spinning...';
    this.result.className = 'result';

    // Pre-determine the final symbols for each reel
    this.finalSymbols = [
      this.symbols[Math.floor(Math.random() * this.symbols.length)],
      this.symbols[Math.floor(Math.random() * this.symbols.length)],
      this.symbols[Math.floor(Math.random() * this.symbols.length)],
    ];

    // Spin each reel with different durations for more realistic effect
    const spinPromises = this.reels.map((reel, index) => {
      return this.spinReel(reel, 2000 + index * 500, this.finalSymbols[index]);
    });

    await Promise.all(spinPromises);

    // Check results
    this.checkWin();
    this.spinning = false;
    this.spinButton.disabled = false;
    creditInput.disabled = false;

    if (credits <= 0) {
      this.result.innerHTML = 'You are out of credits.';
      this.spinButton.disabled = true;
      creditInput.disabled = true;
    }
  }

  spinReel(reel, duration, targetSymbol) {
    return new Promise((resolve) => {
      const startTime = Date.now();
      const symbolHeight = 120;
      const totalSymbols = reel.children.length;

      // Find a position where our target symbol will be visible
      // We need to place the target symbol so it appears in the center of the reel window
      let targetIndex = -1;
      for (let i = 0; i < totalSymbols; i++) {
        if (reel.children[i].textContent === targetSymbol) {
          targetIndex = i;
          break;
        }
      }

      // If target symbol not found, create one at a specific position
      if (targetIndex === -1) {
        targetIndex = Math.floor(totalSymbols / 2);
        reel.children[targetIndex].textContent = targetSymbol;
      }

      // Calculate spinning distance
      const baseSpins = 5; // Number of full cycles through all symbols
      const totalDistance =
        baseSpins * totalSymbols * symbolHeight + targetIndex * symbolHeight;

      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // Smooth easing function that slows down at the end
        const easeOut =
          progress < 0.8
            ? progress
            : 0.8 + 0.2 * (1 - Math.pow(1 - (progress - 0.8) / 0.2, 4));

        const currentPosition = totalDistance * easeOut;

        // Use modulo to keep within our symbol range
        const wrappedPosition = currentPosition % (totalSymbols * symbolHeight);
        reel.style.transform = `translateY(-${wrappedPosition}px)`;

        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          // Ensure we end exactly on the target symbol
          const finalPosition = targetIndex * symbolHeight;
          reel.style.transform = `translateY(-${finalPosition}px)`;
          resolve();
        }
      };

      animate();
    });
  }

  getVisibleSymbols() {
    // Since we now control exactly where each reel stops, we can return our predetermined symbols
    return this.finalSymbols;
  }

  checkWin() {
    let won = 0;
    const symbols = this.getVisibleSymbols();

    if (symbols[0] === symbols[1] && symbols[1] === symbols[2]) {
      // Jackpot!
      if (symbols[0] === '💎') {
        won = inputCredits * 50;
        this.result.textContent = 'DIAMOND JACKPOT! +' + won;
        this.result.className = 'result jackpot';
        credits += won;
      } else if (symbols[0] === '7️⃣') {
        won = inputCredits * 20;
        this.result.textContent = 'LUCKY SEVENS! +' + won;
        this.result.className = 'result jackpot';
        credits += won;
      } else {
        won = inputCredits * 5;
        this.result.textContent = `THREE ${symbols[0]}! +` + won;
        this.result.className = 'result win';
        credits += won;
      }
    } else if (
      symbols[0] === symbols[1] ||
      symbols[1] === symbols[2] ||
      symbols[0] === symbols[2]
    ) {
      won = inputCredits * 2;
      this.result.textContent = 'Two matching! +' + won;
      this.result.className = 'result win';
      credits += won;
    } else {
      const messages = [
        'Better luck next time!',
        'Keep trying!',
        'Almost there!',
        'Spin again!',
        '99% quit before they win big!',
      ];
      this.result.textContent =
        messages[Math.floor(Math.random() * messages.length)];
      this.result.className = 'result';
    }
    localStorage.setItem('credits', credits);
    creditsDisplay.textContent = intToString(credits);
    if (won != 0) {
      showPopup('+' + won, 'plus');
      localStorage.setItem(
        'totalWins',
        parseInt(localStorage.getItem('totalWins'), 10) + 1
      );
      if (won > localStorage.getItem('biggestWin')) {
        localStorage.setItem('biggestWin', won);
      }
      localStorage.setItem(
        'overall',
        parseInt(localStorage.getItem('overall'), 10) + won
      );
    }
  }
}

// Initialize the slot machine when page loads
window.addEventListener('load', () => {
  new SlotMachine();
});
