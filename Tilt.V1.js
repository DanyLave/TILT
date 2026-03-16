/*
    Simple Multiplayer Card Game - Core Logic (JavaScript)
    To be used with a frontend (e.g., React) and backend (Firebase)
    This file contains the main game logic and data structures.
*/

// Example symbols and categories
const SYMBOLS = ['apple', 'umbrella', 'airplane', 'flower', 'star'];
const CATEGORIES = ['movie', 'drink', 'sports with a ball', 'city in italy'];

// Utility to shuffle an array
function shuffle(array) {
    let arr = array.slice();
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

// Generate deck: each symbol appears evenly, each category once
// categoriesArray is optional — falls back to the built-in CATEGORIES constant
function generateDeck(numPlayers, cardsPerPlayer, categoriesArray) {
    const cats = categoriesArray || CATEGORIES;
    const totalCards = numPlayers * cardsPerPlayer;
    const symbolsPerSymbol = Math.floor(totalCards / SYMBOLS.length);
    let symbols = [];
    SYMBOLS.forEach(s => {
        for (let i = 0; i < symbolsPerSymbol; i++) symbols.push(s);
    });
    // Fill up remaining with random symbols if needed
    while (symbols.length < totalCards) {
        symbols.push(SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)]);
    }
    symbols = shuffle(symbols);

    // Each category appears once
    let categories = shuffle(cats);
    while (categories.length < totalCards) {
        categories = categories.concat(shuffle(cats));
    }
    categories = categories.slice(0, totalCards);

    // Combine into cards
    let deck = [];
    for (let i = 0; i < totalCards; i++) {
        deck.push({
            symbol: symbols[i],
            category: categories[i],
            id: i + 1
        });
    }
    return shuffle(deck);
}

// Game state
class Game {
    constructor(numPlayers, cardsPerPlayer) {
        this.numPlayers = numPlayers;
        this.cardsPerPlayer = cardsPerPlayer;
        this.deck = generateDeck(numPlayers, cardsPerPlayer);
        this.players = Array.from({ length: numPlayers }, () => ({
            stack: [], // cards drawn (top is active)
            points: [] // captured cards
        }));
        this.currentPlayer = 0;
        this.turn = 0;
    }

    // Player draws a card
    drawCard(playerIndex) {
        if (this.deck.length === 0) return null;
        const card = this.deck.pop();
        this.players[playerIndex].stack.push(card);
        this.currentPlayer = (this.currentPlayer + 1) % this.numPlayers;
        this.turn++;
        return card;
    }

    // Remove another player's active card
    captureCard(fromPlayer, toPlayer) {
        if (this.players[fromPlayer].stack.length === 0) return null;
        const card = this.players[fromPlayer].stack.pop();
        this.players[toPlayer].points.push(card);
        return card;
    }

    // Get active card for a player
    getActiveCard(playerIndex) {
        const stack = this.players[playerIndex].stack;
        return stack.length ? stack[stack.length - 1] : null;
    }

    // Get all cards beneath the active card for a player
    getStack(playerIndex) {
        return this.players[playerIndex].stack.slice(0, -1);
    }
}

if (typeof module !== 'undefined') {
    // Example usage (Node.js only):
    const game = new Game(3, 5);
    game.drawCard(0);
    game.drawCard(1);
    game.drawCard(2);
    game.captureCard(1, 0);

    module.exports = { Game, SYMBOLS, CATEGORIES };
}