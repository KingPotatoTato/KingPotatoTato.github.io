let credits = 0;

const creditsDisplay = document.getElementById('credits');

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

window.onload = function () {
  let storedCredits = localStorage.getItem('credits');
  if (storedCredits != null) {
    credits = parseInt(storedCredits, 10);
  } else {
    alert(
      "You don't have any credits. Go to the credits tab in the top left to get some."
    );
  }
  creditsDisplay.textContent = intToString(credits);
  if (document.getElementById('resetCredits')) {
    if (credits >= 100) {
      document.getElementById('resetCredits').disabled = true;
    } else {
      document.getElementById('resetCredits').disabled = false;
    }
  }
  if (document.getElementById('gamesPlayed')) {
    let gamesPlayed = localStorage.getItem('gamesPlayed');
    if (gamesPlayed != null) {
      document.getElementById('gamesPlayed').textContent = intToString(
        parseInt(gamesPlayed, 10)
      );
    } else {
      localStorage.setItem('gamesPlayed', 0);
    }
    let totalWins = localStorage.getItem('totalWins');
    if (totalWins != null) {
      document.getElementById('totalWins').textContent = intToString(
        parseInt(totalWins, 10)
      );
    } else {
      localStorage.setItem('totalWins', 0);
    }
    let biggestWin = localStorage.getItem('biggestWin');
    if (biggestWin != null) {
      document.getElementById('biggestWin').textContent = intToString(
        parseInt(biggestWin, 10)
      );
    } else {
      localStorage.setItem('biggestWin', 0);
    }
    let overall = localStorage.getItem('overall');
    if (overall != null) {
      document.getElementById('overall').textContent = intToString(
        parseInt(overall, 10)
      );
    } else {
      localStorage.setItem('overall', 0);
    }
    if (parseInt(overall, 10) > 0) {
      document.getElementById('overallCoin').className = 'stat-item overallUp';
    } else if (parseInt(overall, 10) < 0) {
      document.getElementById('overallCoin').className =
        'stat-item overallDown';
    } else {
      document.getElementById('overallCoin').className = 'stat-item';
    }
  }
};

if (document.getElementById('plusBtn')) {
  plusBtn.onclick = function () {
    credits += 100;
    localStorage.setItem('credits', credits);
    creditsDisplay.textContent = intToString(credits);
    showPopup('+100', 'plus');
  };

  minusBtn.onclick = function () {
    credits -= 100;
    localStorage.setItem('credits', credits);
    creditsDisplay.textContent = intToString(credits);
    showPopup('-100', 'minus');
  };
}

if (document.getElementById('resetCredits')) {
  resetCredits.onclick = function () {
    if (confirm('This will reset your credits to 100. Are you sure?')) {
      credits = 100;
      localStorage.setItem('credits', credits);
      creditsDisplay.textContent = intToString(credits);
      showPopup('Reset Credits', 'minus');
      document.getElementById('resetCredits').disabled = true;
    }
  };
  enterDevCode.onclick = function () {
    const devInput = document.getElementById('devCode').value;
    if (devInput == 'plus 10000') {
      credits += 10000;
      localStorage.setItem('credits', credits);
      creditsDisplay.textContent = intToString(credits);
    } else if (devInput == 'set 0') {
      credits = 0;
      localStorage.setItem('credits', credits);
      creditsDisplay.textContent = intToString(credits);
    } else if (devInput == 'set inf') {
      credits = Infinity;
      localStorage.setItem('credits', credits);
      creditsDisplay.textContent = intToString(credits);
    } else {
      alert("Don't try and guess.");
    }
  };
}

if (document.getElementById('resetStats')) {
  resetStats.onclick = function () {
    if (confirm('This will reset your stats. Are you sure?')) {
      localStorage.removeItem('gamesPlayed');
      localStorage.removeItem('totalWins');
      localStorage.removeItem('biggestWin');
      localStorage.removeItem('overall');
      alert('Done.');
    }
  };
}
