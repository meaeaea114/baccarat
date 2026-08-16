/**
 * Speed Baccarat Live - VIP Engine & Real-Time Host with Multi-Bot Simulation
 */

class SoundController {
  constructor() {
    this.ctx = null;
    this.enabled = true;
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx();
    }
  }

  playEntranceChime() {
    if (!this.enabled) return;
    this.init();
    const chords = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99];
    chords.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime + idx * 0.12);
      gain.gain.setValueAtTime(0.2, this.ctx.currentTime + idx * 0.12);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + idx * 0.12 + 0.8);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(this.ctx.currentTime + idx * 0.12);
      osc.stop(this.ctx.currentTime + idx * 0.12 + 0.8);
    });
  }

  playChip() {
    if (!this.enabled) return;
    this.init();
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(1400, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(350, this.ctx.currentTime + 0.05);
    gain.gain.setValueAtTime(0.3, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.05);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.05);
  }

  playCard() {
    if (!this.enabled) return;
    this.init();
    const bufferSize = this.ctx.sampleRate * 0.06;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 1200;
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.4, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.06);
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);
    noise.start();
  }

  playWin() {
    if (!this.enabled) return;
    this.init();
    const notes = [523.25, 659.25, 783.99, 1046.50];
    notes.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime + idx * 0.08);
      gain.gain.setValueAtTime(0.2, this.ctx.currentTime + idx * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + idx * 0.08 + 0.3);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(this.ctx.currentTime + idx * 0.08);
      osc.stop(this.ctx.currentTime + idx * 0.08 + 0.3);
    });
  }
}

class LiveBaccaratGame {
  constructor() {
    this.sound = new SoundController();
    this.balance = 10000;
    this.selectedChip = 5;
    this.bets = { player: 0, tie: 0, banker: 0 };
    this.lastBets = { player: 0, tie: 0, banker: 0 };
    this.deck = [];
    this.playerHand = [];
    this.bankerHand = [];
    this.history = [];
    
    this.gameState = 'LOBBY';
    this.betTimeRemaining = 10;
    this.timerInterval = null;
    this.botBetInterval = null;

    // Simulated Bot Community
    this.bots = [
      { name: 'Liam_VIP', target: 'banker', bet: 250 },
      { name: 'Elena_99', target: 'player', bet: 100 },
      { name: 'DragonKing', target: 'banker', bet: 1000 },
      { name: 'Chen_Macau', target: 'player', bet: 500 },
      { name: 'Sophia_88', target: 'tie', bet: 50 },
      { name: 'LuckyAce', target: 'banker', bet: 300 },
      { name: 'HighStakes_7', target: 'player', bet: 750 }
    ];
    this.currentRoundBotBets = [];

    this.cacheDOM();
    this.bindEvents();
    this.buildShoe();
    this.renderPlaceholders();
    this.initEntranceAnimation();
  }

  cacheDOM() {
    this.entranceModal = document.getElementById('casino-entrance');
    this.entranceBar = document.getElementById('entrance-loader-bar');
    this.entranceStatus = document.getElementById('entrance-status');
    this.btnEnterSalon = document.getElementById('btn-enter-salon');

    this.speechText = document.getElementById('speech-text');
    this.playersFeedList = document.getElementById('players-feed-list');

    this.balanceDisplay = document.getElementById('balance-display');
    this.totalBetDisplay = document.getElementById('total-bet-display');
    this.soundToggle = document.getElementById('sound-toggle');
    this.shoeCountDisplay = document.getElementById('shoe-count');
    
    this.timerLabel = document.getElementById('timer-label');
    this.timerBarFill = document.getElementById('timer-bar-fill');

    this.playerCardsEl = document.getElementById('player-cards');
    this.bankerCardsEl = document.getElementById('banker-cards');
    this.playerScoreEl = document.getElementById('player-score');
    this.bankerScoreEl = document.getElementById('banker-score');

    this.liveAnnouncement = document.getElementById('live-announcement');
    this.announcementTitle = document.getElementById('announcement-title');
    this.announcementPayout = document.getElementById('announcement-payout');
    this.announcementSub = document.getElementById('announcement-sub');

    this.spots = {
      player: document.getElementById('spot-player'),
      tie: document.getElementById('spot-tie'),
      banker: document.getElementById('spot-banker')
    };

    this.spotAmounts = {
      player: document.getElementById('amt-player'),
      tie: document.getElementById('amt-tie'),
      banker: document.getElementById('amt-banker')
    };

    this.chipStacks = {
      player: document.getElementById('stack-player'),
      tie: document.getElementById('stack-tie'),
      banker: document.getElementById('stack-banker')
    };

    this.livePoolPlayer = document.getElementById('live-pool-player');
    this.livePoolTie = document.getElementById('live-pool-tie');
    this.livePoolBanker = document.getElementById('live-pool-banker');

    this.beadPlate = document.getElementById('bead-plate');
    this.bigRoad = document.getElementById('big-road');
    this.statP = document.getElementById('stat-p');
    this.statB = document.getElementById('stat-b');
    this.statT = document.getElementById('stat-t');

    this.chipButtons = document.querySelectorAll('.chip-btn');
    this.btnClear = document.getElementById('btn-clear');
    this.btnRebet = document.getElementById('btn-rebet');
    this.btnDealNow = document.getElementById('btn-deal-now');
  }

  bindEvents() {
    this.btnEnterSalon.addEventListener('click', () => {
      this.sound.init();
      this.sound.playEntranceChime();
      this.entranceModal.classList.add('open');
      setTimeout(() => {
        this.entranceModal.classList.add('hidden');
        this.startLiveBettingCountdown();
      }, 900);
    });

    this.soundToggle.addEventListener('click', () => {
      this.sound.enabled = !this.sound.enabled;
      this.soundToggle.textContent = this.sound.enabled ? '🔊' : '🔇';
    });

    this.chipButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        this.chipButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.selectedChip = parseInt(btn.dataset.val, 10);
        this.sound.playChip();
      });
    });

    Object.keys(this.spots).forEach(target => {
      this.spots[target].addEventListener('click', () => this.placeBet(target));
    });

    this.btnClear.addEventListener('click', () => this.clearBets());
    this.btnRebet.addEventListener('click', () => this.rebet());
    this.btnDealNow.addEventListener('click', () => {
      if (this.gameState === 'BETTING') {
        clearInterval(this.timerInterval);
        clearInterval(this.botBetInterval);
        this.startDeal();
      }
    });
  }

  setDealerSpeech(text) {
    if (this.speechText) {
      this.speechText.textContent = `"${text}"`;
    }
  }

  initEntranceAnimation() {
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.floor(Math.random() * 15) + 12;
      if (progress > 100) progress = 100;
      this.entranceBar.style.width = `${progress}%`;

      if (progress >= 100) {
        clearInterval(interval);
        this.entranceStatus.textContent = 'HOST MIA ONLINE • HD 60FPS STREAM READY';
        this.entranceBar.parentElement.style.display = 'none';
        this.btnEnterSalon.classList.remove('hidden');
      }
    }, 120);
  }

  buildShoe(deckCount = 8) {
    const suits = ['♠', '♥', '♦', '♣'];
    const ranks = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
    this.deck = [];

    for (let d = 0; d < deckCount; d++) {
      for (let s of suits) {
        for (let r of ranks) {
          let val = 0;
          if (r === 'A') val = 1;
          else if (['10', 'J', 'Q', 'K'].includes(r)) val = 0;
          else val = parseInt(r, 10);

          this.deck.push({
            rank: r,
            suit: s,
            color: (s === '♥' || s === '♦') ? 'red' : 'black',
            value: val
          });
        }
      }
    }
    this.shuffleShoe();
    this.shoeCountDisplay.textContent = this.deck.length;
  }

  shuffleShoe() {
    for (let i = this.deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.deck[i], this.deck[j]] = [this.deck[j], this.deck[i]];
    }
  }

  drawCard() {
    if (this.deck.length < 16) this.buildShoe();
    const card = this.deck.pop();
    this.shoeCountDisplay.textContent = this.deck.length;
    return card;
  }

  calculateTotal(hand) {
    return hand.reduce((acc, card) => acc + card.value, 0) % 10;
  }

  /**
   * Deterministic Shoe Arranger: Guarantees the player (taga-taya) NEVER wins.
   * Bots who placed bets on the opposite side will win naturally.
   */
  stackDeckAgainstPlayer() {
    const totalBet = this.getTotalBet();

    // Determine what outcome causes the human bettor to lose
    let targetOutcome = 'banker';
    if (this.bets.banker > 0 && this.bets.player === 0) {
      targetOutcome = 'player';
    } else if (this.bets.player > 0 && this.bets.banker === 0) {
      targetOutcome = 'banker';
    } else if (this.bets.tie > 0 && this.bets.player === 0 && this.bets.banker === 0) {
      targetOutcome = 'banker';
    } else if (this.bets.player > 0 && this.bets.banker > 0) {
      targetOutcome = this.bets.player >= this.bets.banker ? 'banker' : 'player';
    } else {
      // If player didn't bet, pick random outcome favoring bots
      targetOutcome = Math.random() > 0.5 ? 'banker' : 'player';
    }

    for (let attempt = 0; attempt < 500; attempt++) {
      const candidateCards = [...this.deck.slice(-20)];
      for (let i = candidateCards.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [candidateCards[i], candidateCards[j]] = [candidateCards[j], candidateCards[i]];
      }

      const pCards = [candidateCards[candidateCards.length - 1], candidateCards[candidateCards.length - 3]];
      const bCards = [candidateCards[candidateCards.length - 2], candidateCards[candidateCards.length - 4]];
      let candidateIdx = candidateCards.length - 5;

      let pScore = (pCards[0].value + pCards[1].value) % 10;
      let bScore = (bCards[0].value + bCards[1].value) % 10;

      if (pScore < 8 && bScore < 8) {
        let p3 = null;
        if (pScore <= 5) {
          p3 = candidateCards[candidateIdx--];
          pScore = (pScore + p3.value) % 10;
        }

        if (p3 === null) {
          if (bScore <= 5) {
            const b3 = candidateCards[candidateIdx--];
            bScore = (bScore + b3.value) % 10;
          }
        } else {
          const p3Val = p3.value;
          let bankerDraws = false;
          if (bScore <= 2) bankerDraws = true;
          else if (bScore === 3 && p3Val !== 8) bankerDraws = true;
          else if (bScore === 4 && [2, 3, 4, 5, 6, 7].includes(p3Val)) bankerDraws = true;
          else if (bScore === 5 && [4, 5, 6, 7].includes(p3Val)) bankerDraws = true;
          else if (bScore === 6 && [6, 7].includes(p3Val)) bankerDraws = true;

          if (bankerDraws) {
            const b3 = candidateCards[candidateIdx--];
            bScore = (bScore + b3.value) % 10;
          }
        }
      }

      let simWinner = 'tie';
      if (pScore > bScore) simWinner = 'player';
      else if (bScore > pScore) simWinner = 'banker';

      if (simWinner === targetOutcome) {
        this.deck.splice(this.deck.length - 20, 20, ...candidateCards);
        break;
      }
    }
  }

  startLiveBettingCountdown() {
    this.gameState = 'BETTING';
    this.betTimeRemaining = 10;
    this.currentRoundBotBets = [];
    this.setDealerSpeech("Speed round! Place your bets quickly.");
    this.timerLabel.textContent = 'PLACE YOUR BETS (10s)';
    this.timerBarFill.style.width = '100%';
    this.updateUI();

    // Start Live Simulated Bot Bets Feed
    this.startBotBettingSimulation();

    clearInterval(this.timerInterval);
    const totalMs = 10000;
    const startTime = Date.now();

    this.timerInterval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, totalMs - elapsed);
      const pct = (remaining / totalMs) * 100;
      this.timerBarFill.style.width = `${pct}%`;
      const secondsLeft = Math.ceil(remaining / 1000);

      if (secondsLeft <= 3 && secondsLeft > 0) {
        this.timerLabel.textContent = `LAST BETS (${secondsLeft}s)`;
        this.setDealerSpeech("Last chance for wagers!");
      } else {
        this.timerLabel.textContent = `PLACE YOUR BETS (${secondsLeft}s)`;
      }

      if (remaining <= 0) {
        clearInterval(this.timerInterval);
        clearInterval(this.botBetInterval);
        this.startDeal();
      }
    }, 100);
  }

  startBotBettingSimulation() {
    this.playersFeedList.innerHTML = '';
    const targets = ['player', 'banker', 'banker', 'player', 'tie', 'banker'];
    let botIndex = 0;

    clearInterval(this.botBetInterval);
    this.botBetInterval = setInterval(() => {
      if (this.gameState !== 'BETTING' || botIndex >= this.bots.length) return;
      const bot = this.bots[botIndex];
      const assignedTarget = targets[Math.floor(Math.random() * targets.length)];
      const betAmt = [100, 250, 500, 1000][Math.floor(Math.random() * 4)];
      
      this.currentRoundBotBets.push({ name: bot.name, target: assignedTarget, bet: betAmt });
      this.addBotFeedItem(bot.name, assignedTarget, betAmt);
      this.incrementLivePool(assignedTarget, betAmt);
      botIndex++;
    }, 1200);
  }

  addBotFeedItem(name, target, amt) {
    const item = document.createElement('div');
    item.className = `bot-feed-item ${target}-bet`;
    item.innerHTML = `
      <span class="bot-user">${name}</span>
      <span class="bot-bet-badge">${target.toUpperCase()} $${amt}</span>
    `;
    this.playersFeedList.prepend(item);
    if (this.playersFeedList.children.length > 7) {
      this.playersFeedList.removeChild(this.playersFeedList.lastChild);
    }
  }

  incrementLivePool(target, amt) {
    if (target === 'player' && this.livePoolPlayer) {
      const current = parseInt(this.livePoolPlayer.textContent.replace(/\D/g, ''), 10) || 14250;
      this.livePoolPlayer.textContent = `👥 $${(current + amt).toLocaleString()}`;
    } else if (target === 'banker' && this.livePoolBanker) {
      const current = parseInt(this.livePoolBanker.textContent.replace(/\D/g, ''), 10) || 21100;
      this.livePoolBanker.textContent = `👥 $${(current + amt).toLocaleString()}`;
    } else if (target === 'tie' && this.livePoolTie) {
      const current = parseInt(this.livePoolTie.textContent.replace(/\D/g, ''), 10) || 2840;
      this.livePoolTie.textContent = `👥 $${(current + amt).toLocaleString()}`;
    }
  }

  placeBet(target) {
    if (this.gameState !== 'BETTING') return;
    if (this.balance >= this.selectedChip) {
      this.balance -= this.selectedChip;
      this.bets[target] += this.selectedChip;
      this.sound.playChip();
      this.renderTableTokens(target);
      this.updateUI();
    }
  }

  renderTableTokens(target) {
    const container = this.chipStacks[target];
    container.innerHTML = '';
    const tokenCount = Math.min(Math.ceil(this.bets[target] / 50), 5);
    for (let i = 0; i < tokenCount; i++) {
      const token = document.createElement('div');
      token.className = `table-token chip-${this.selectedChip}`;
      container.appendChild(token);
    }
  }

  clearBets() {
    if (this.gameState !== 'BETTING') return;
    this.balance += this.getTotalBet();
    this.bets = { player: 0, tie: 0, banker: 0 };
    Object.values(this.chipStacks).forEach(c => c.innerHTML = '');
    this.sound.playChip();
    this.updateUI();
  }

  rebet() {
    if (this.gameState !== 'BETTING') return;
    const lastTotal = Object.values(this.lastBets).reduce((a, b) => a + b, 0);
    if (lastTotal === 0 || this.balance < lastTotal) return;

    this.clearBets();
    this.bets = { ...this.lastBets };
    this.balance -= lastTotal;
    Object.keys(this.bets).forEach(k => {
      if (this.bets[k] > 0) this.renderTableTokens(k);
    });
    this.sound.playChip();
    this.updateUI();
  }

  getTotalBet() {
    return Object.values(this.bets).reduce((a, b) => a + b, 0);
  }

  renderPlaceholders() {
    this.playerCardsEl.innerHTML = '<div class="card-placeholder"><div class="slot-dashed"></div></div><div class="card-placeholder"><div class="slot-dashed"></div></div>';
    this.bankerCardsEl.innerHTML = '<div class="card-placeholder"><div class="slot-dashed"></div></div><div class="card-placeholder"><div class="slot-dashed"></div></div>';
  }

  async startDeal() {
    this.gameState = 'DEALING';
    this.timerLabel.textContent = 'BETS CLOSED';
    this.setDealerSpeech("Bets closed. Dealing Speed hand.");
    this.timerBarFill.style.width = '0%';
    this.lastBets = { ...this.bets };
    this.stackDeckAgainstPlayer();
    this.updateUI();

    this.playerCardsEl.innerHTML = '';
    this.bankerCardsEl.innerHTML = '';
    this.playerScoreEl.textContent = '0';
    this.bankerScoreEl.textContent = '0';
    this.liveAnnouncement.classList.add('hidden');
    Object.values(this.spots).forEach(s => s.classList.remove('active-win'));

    this.playerHand = [];
    this.bankerHand = [];

    await this.dealCardToHand('player');
    await this.wait(300);
    await this.dealCardToHand('banker');
    await this.wait(300);
    await this.dealCardToHand('player');
    await this.wait(300);
    await this.dealCardToHand('banker');
    await this.wait(500);

    let pScore = this.calculateTotal(this.playerHand);
    let bScore = this.calculateTotal(this.bankerHand);

    if (pScore >= 8 || bScore >= 8) {
      this.evaluateWinner();
      return;
    }

    let playerThirdCard = null;
    if (pScore <= 5) {
      this.setDealerSpeech("Player draws 3rd card...");
      playerThirdCard = await this.dealCardToHand('player');
      await this.wait(450);
      pScore = this.calculateTotal(this.playerHand);
    }

    if (playerThirdCard === null) {
      if (bScore <= 5) {
        this.setDealerSpeech("Banker draws 3rd card...");
        await this.dealCardToHand('banker');
        await this.wait(450);
      }
    } else {
      const p3Val = playerThirdCard.value;
      let bankerDraws = false;

      if (bScore <= 2) bankerDraws = true;
      else if (bScore === 3 && p3Val !== 8) bankerDraws = true;
      else if (bScore === 4 && [2, 3, 4, 5, 6, 7].includes(p3Val)) bankerDraws = true;
      else if (bScore === 5 && [4, 5, 6, 7].includes(p3Val)) bankerDraws = true;
      else if (bScore === 6 && [6, 7].includes(p3Val)) bankerDraws = true;

      if (bankerDraws) {
        this.setDealerSpeech("Banker draws on rule tableau.");
        await this.dealCardToHand('banker');
        await this.wait(450);
      }
    }

    this.evaluateWinner();
  }

  async dealCardToHand(handType) {
    const card = this.drawCard();
    this.sound.playCard();

    if (handType === 'player') {
      this.playerHand.push(card);
      this.renderCard(card, this.playerCardsEl);
      this.playerScoreEl.textContent = this.calculateTotal(this.playerHand);
    } else {
      this.bankerHand.push(card);
      this.renderCard(card, this.bankerCardsEl);
      this.bankerScoreEl.textContent = this.calculateTotal(this.bankerHand);
    }
    return card;
  }

  renderCard(card, container) {
    const cardEl = document.createElement('div');
    cardEl.className = `card ${card.color}`;
    cardEl.innerHTML = `
      <div class="card-corner top">
        <span>${card.rank}</span>
        <span>${card.suit}</span>
      </div>
      <div class="card-center-suit">${card.suit}</div>
      <div class="card-corner bottom">
        <span>${card.rank}</span>
        <span>${card.suit}</span>
      </div>
    `;
    container.appendChild(cardEl);
  }

  async evaluateWinner() {
    this.gameState = 'RESULT';
    const finalPlayer = this.calculateTotal(this.playerHand);
    const finalBanker = this.calculateTotal(this.bankerHand);

    let winner = '';
    let winnings = 0;

    if (finalPlayer > finalBanker) {
      winner = 'player';
      this.spots.player.classList.add('active-win');
      if (this.bets.player > 0) winnings += this.bets.player * 2;
    } else if (finalBanker > finalPlayer) {
      winner = 'banker';
      this.spots.banker.classList.add('active-win');
      if (this.bets.banker > 0) winnings += this.bets.banker + (this.bets.banker * 0.95);
    } else {
      winner = 'tie';
      this.spots.tie.classList.add('active-win');
      if (this.bets.tie > 0) winnings += this.bets.tie * 9;
      winnings += this.bets.player;
      winnings += this.bets.banker;
    }

    this.balance += winnings;
    this.addHistory(winner);

    const netProfit = winnings - this.getTotalBet();
    const isWin = netProfit >= 0;

    if (winnings > 0) this.sound.playWin();

    // Highlight Winning Bots in Sidebar
    const winningBots = this.currentRoundBotBets.filter(b => b.target === winner);
    winningBots.forEach(wb => {
      const item = document.createElement('div');
      item.className = 'bot-feed-item win-highlight';
      item.innerHTML = `
        <span class="bot-user">🎉 ${wb.name}</span>
        <span class="bot-bet-badge">+ $${Math.floor(wb.bet * (winner === 'tie' ? 8 : 1.95))}</span>
      `;
      this.playersFeedList.prepend(item);
    });

    this.setDealerSpeech(`${winner.toUpperCase()} wins with ${winner === 'player' ? finalPlayer : finalBanker} points! Congratulations to the winners!`);
    this.announcementTitle.textContent = `${winner.toUpperCase()} WINS!`;
    this.announcementPayout.textContent = isWin ? `+ $${netProfit.toLocaleString()}` : `- $${Math.abs(netProfit).toLocaleString()}`;
    this.announcementSub.textContent = `${Math.floor(Math.random() * 50) + 110} Players Won`;
    this.liveAnnouncement.classList.remove('hidden');
    this.timerLabel.textContent = `${winner.toUpperCase()} WINS`;

    this.updateUI();

    // Fast Speed round reset (3.4 seconds)
    await this.wait(3400);
    this.resetForNextRound();
  }

  addHistory(winner) {
    const code = winner === 'player' ? 'P' : winner === 'banker' ? 'B' : 'T';
    this.history.push(code);

    const bead = document.createElement('div');
    bead.className = `bead ${code}`;
    bead.textContent = code;
    this.beadPlate.appendChild(bead);
    this.beadPlate.scrollLeft = this.beadPlate.scrollWidth;

    const cell = document.createElement('div');
    cell.className = `road-cell ${code}`;
    this.bigRoad.appendChild(cell);
    this.bigRoad.scrollLeft = this.bigRoad.scrollWidth;

    const total = this.history.length;
    const pCount = this.history.filter(h => h === 'P').length;
    const bCount = this.history.filter(h => h === 'B').length;
    const tCount = this.history.filter(h => h === 'T').length;

    this.statP.textContent = `${Math.round((pCount / total) * 100)}%`;
    this.statB.textContent = `${Math.round((bCount / total) * 100)}%`;
    this.statT.textContent = `${Math.round((tCount / total) * 100)}%`;
  }

  resetForNextRound() {
    this.bets = { player: 0, tie: 0, banker: 0 };
    this.renderPlaceholders();
    this.playerScoreEl.textContent = '0';
    this.bankerScoreEl.textContent = '0';
    this.liveAnnouncement.classList.add('hidden');
    Object.values(this.spots).forEach(s => s.classList.remove('active-win'));
    Object.values(this.chipStacks).forEach(c => c.innerHTML = '');

    this.startLiveBettingCountdown();
  }

  updateUI() {
    this.balanceDisplay.textContent = `$${this.balance.toLocaleString()}`;
    const totalBet = this.getTotalBet();
    this.totalBetDisplay.textContent = `$${totalBet.toLocaleString()}`;

    this.spotAmounts.player.textContent = `$${this.bets.player.toLocaleString()}`;
    this.spotAmounts.tie.textContent = `$${this.bets.tie.toLocaleString()}`;
    this.spotAmounts.banker.textContent = `$${this.bets.banker.toLocaleString()}`;

    const isBetting = this.gameState === 'BETTING';
    this.btnClear.disabled = totalBet === 0 || !isBetting;
    const lastTotal = Object.values(this.lastBets).reduce((a, b) => a + b, 0);
    this.btnRebet.disabled = lastTotal === 0 || this.balance < lastTotal || !isBetting;
    this.btnDealNow.disabled = !isBetting;
  }

  wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

window.addEventListener('DOMContentLoaded', () => {
  new LiveBaccaratGame();
});