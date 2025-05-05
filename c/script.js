let balance = 1000;
const MAX_BALANCE = 1_000_000_000_000_000;

let companiesOwned = 0;
let restaurantsOwned = 0;
let companyInterval = null;

// Update balance display
function updateBalance() {
    document.getElementById('balance').innerText = `Balance: $${balance.toLocaleString()}`;
}

// Show selected game
function showGame(gameId) {
    const games = document.querySelectorAll('.game');
    games.forEach(game => game.style.display = 'none');
    document.getElementById(gameId).style.display = 'block';
}

// Get bet amount
function getBetAmount() {
    const bet = parseInt(document.getElementById('bet-amount').value);
    if (isNaN(bet) || bet <= 0) {
        alert("Please enter a valid bet amount.");
        return null;
    }
    if (bet > balance) {
        alert("You don't have enough balance for this bet.");
        return null;
    }
    return bet;
}

// Balance management
function addBalance(amount) {
    balance = Math.min(balance + amount, MAX_BALANCE);
    if (balance === MAX_BALANCE) {
        alert("You've reached the maximum balance of $1 Quadrillion!");
    }
}

function subtractBalance(amount) {
    balance -= amount;
}

// Passive income generator
function startCompanyInterval() {
    if (companyInterval) return;

    companyInterval = setInterval(() => {
        const companyIncome = 100 * companiesOwned;
        const restaurantIncome = 1000 * restaurantsOwned;
        addBalance(companyIncome + restaurantIncome);
        updateBalance();
    }, 1000);
}

// Purchases
function buyCompany() {
    const confirmPurchase = confirm("Buy a company for $30,000? It generates $100 every second.");
    if (!confirmPurchase) return;

    if (balance < 30000) {
        alert("You don't have enough money to buy a company.");
        return;
    }

    subtractBalance(30000);
    companiesOwned += 1;
    updateBalance();
    updateBusinessesDisplay();
    startCompanyInterval();
}

function buyRestaurant() {
    const confirmPurchase = confirm("Buy a restaurant for $70,000? It generates $1,000 every second.");
    if (!confirmPurchase) return;

    if (balance < 70000) {
        alert("You don't have enough money to buy a restaurant.");
        return;
    }

    subtractBalance(70000);
    restaurantsOwned += 1;
    updateBalance();
    updateBusinessesDisplay();
    startCompanyInterval();
}

function updateBusinessesDisplay() {
    const info = document.getElementById('company-info');
    if (info) {
        const income = (companiesOwned * 100) + (restaurantsOwned * 1000);
        info.innerText = `Companies Owned: ${companiesOwned} | Restaurants Owned: ${restaurantsOwned} | Income: $${income}/sec`;
    }
}

// Blackjack Game
let playerCards = [];
let dealerCards = [];

function startBlackjack() {
    const bet = getBetAmount();
    if (bet === null) return;

    playerCards = [drawCard(), drawCard()];
    dealerCards = [drawCard(), drawCard()];

    document.getElementById('blackjack-status').innerText = 'Game started. Your move!';
    showBlackjackCards();
}

function drawCard() {
    return Math.floor(Math.random() * 11) + 1;
}

function calculateTotal(cards) {
    return cards.reduce((a, b) => a + b, 0);
}

function showBlackjackCards() {
    document.getElementById('blackjack-cards').innerText =
        `Your cards: ${playerCards.join(', ')} (Total: ${calculateTotal(playerCards)})\n` +
        `Dealer shows: ${dealerCards[0]}`;
}

function hit() {
    playerCards.push(drawCard());
    showBlackjackCards();
    const total = calculateTotal(playerCards);
    if (total > 21) endBlackjackGame('lose');
}

function stand() {
    while (calculateTotal(dealerCards) < 17) {
        dealerCards.push(drawCard());
    }

    const playerTotal = calculateTotal(playerCards);
    const dealerTotal = calculateTotal(dealerCards);

    if (dealerTotal > 21 || playerTotal > dealerTotal) {
        endBlackjackGame('win');
    } else if (playerTotal === dealerTotal) {
        endBlackjackGame('draw');
    } else {
        endBlackjackGame('lose');
    }
}

function endBlackjackGame(result) {
    const bet = getBetAmount();
    if (bet === null) return;

    let message = '';
    if (result === 'win') {
        addBalance(bet);
        message = `You win $${bet}!`;
    } else if (result === 'lose') {
        subtractBalance(bet);
        message = `You lose $${bet}.`;
    } else {
        message = "It's a draw!";
    }

    updateBalance();
    document.getElementById('blackjack-status').innerText =
        `${message} Dealer's cards: ${dealerCards.join(', ')} (Total: ${calculateTotal(dealerCards)})`;
}

// Slots Game
function playSlots() {
    const bet = getBetAmount();
    if (bet === null) return;

    const symbols = ['🍒', '🍋', '🍊', '🍉', '⭐'];
    const spin = [randomSymbol(symbols), randomSymbol(symbols), randomSymbol(symbols)];

    let resultMessage = `Result: ${spin.join(' ')}`;
    if (spin.every(s => s === spin[0])) {
        const winnings = bet * 5;
        addBalance(winnings);
        resultMessage += `\nJackpot! You win $${winnings}!`;
    } else if (new Set(spin).size === 2) {
        const winnings = bet * 2;
        addBalance(winnings);
        resultMessage += `\nTwo of a kind! You win $${winnings}!`;
    } else {
        subtractBalance(bet);
        resultMessage += `\nYou lose $${bet}.`;
    }

    document.getElementById('slots-result').innerText = resultMessage;
    updateBalance();
}

function randomSymbol(symbols) {
    return symbols[Math.floor(Math.random() * symbols.length)];
}

// Coin Flip Game
function flipCoin() {
    const bet = getBetAmount();
    if (bet === null) return;

    const playerChoice = document.getElementById('coin-choice').value;
    const outcomes = ['Heads', 'Tails'];
    const result = outcomes[Math.floor(Math.random() * outcomes.length)];

    let resultMessage = `You chose ${playerChoice}. The coin landed on ${result}. `;

    if (playerChoice === result) {
        addBalance(bet);
        resultMessage += `You win $${bet}!`;
    } else {
        subtractBalance(bet);
        resultMessage += `You lose $${bet}.`;
    }

    document.getElementById('coin-flip-result').innerText = resultMessage;
    updateBalance();
}

// Export Balance + Purchases
function exportBalance() {
    const data = {
        balance,
        companiesOwned,
        restaurantsOwned
    };
    const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = 'balance.json';
    a.click();

    URL.revokeObjectURL(url);
}

// Import Balance + Purchases
function importBalance() {
    const fileInput = document.getElementById('import-file');
    const file = fileInput.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (e) {
        try {
            const data = JSON.parse(e.target.result);
            if (typeof data.balance === 'number') {
                balance = Math.min(data.balance, MAX_BALANCE);
            }
            if (typeof data.companiesOwned === 'number') {
                companiesOwned = data.companiesOwned;
            }
            if (typeof data.restaurantsOwned === 'number') {
                restaurantsOwned = data.restaurantsOwned;
            }
            updateBalance();
            updateBusinessesDisplay();
            startCompanyInterval();
            alert("Balance and purchases imported successfully!");
        } catch (err) {
            alert("Error reading file.");
        }
    };
    reader.readAsText(file);
}
