const express = require('express');
const bodyParser = require('body-parser');
const { INR_BALANCES, ORDERBOOK, STOCK_BALANCES } = require('./globals');

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

function itos(price) {
  return price.toString();
}

function stoi(price) {
  return parseInt(price);
}

const checkInrBalance = (req, res, next) => {
  const { userId, quantity, price } = req.body;
  if (INR_BALANCES[userId]['balance'] < (price * stoi(quantity))) {
    return res.status(403).json({ error: 'Insufficient balance' });
  }
  return next();
};

// Get INR Balance
app.get("/balance/inr/:userId", (req, res) => {
  const userId = req.params.userId;
  res.send(INR_BALANCES[userId]);
})

// Onramp INR
app.post('/onramp/inr', (req, res) => {
  const { userId, amount } = req.body;
  INR_BALANCES[userId].balance += parseInt(amount);
  res.send(INR_BALANCES[userId])
})

// Get Stock Balance
app.get("/balance/stock/:userId", (req, res) => {
  const userId = req.params.userId;
  res.send(STOCK_BALANCES[userId]);
})

// Buy the yes stock
app.post('/order/buy/yes', checkInrBalance, (req, res) => {
  const { userId, stockSymbol, quantity, price } = req.body;
  // TODO check if user has enough inr to make the trade.
  // Order book update - user1 bids to buy yes for X rs -> order for 'no' should placed at 10 - X rs to balance the total price to 10rs
  const noPrice = (10 - stoi(price)).toString();
  const quant = stoi(quantity)

  if (ORDERBOOK[stockSymbol]['no'].hasOwnProperty(noPrice)) {
    if (ORDERBOOK[stockSymbol]['no'][noPrice]['orders'].hasOwnProperty(userId)) {
      ORDERBOOK[stockSymbol]['no'][noPrice]['orders'][userId] += quant;
    }
    else {
      ORDERBOOK[stockSymbol]['no'][noPrice]['orders'][userId] = quant;
    }
    ORDERBOOK[stockSymbol]['no'][noPrice]['total'] += quant;
  }
  else {
    ORDERBOOK[stockSymbol]['no'][noPrice] = {
      "total": quant,
      "orders": {
        [userId]: quant,
      }
    }
  }
  // INR Balance update
  const cost = stoi(price) * quant
  INR_BALANCES[userId]['balance'] -= cost;
  INR_BALANCES[userId]['locked'] += cost;

  // Stock Balance update
  // After order matching 
  res.send(ORDERBOOK[stockSymbol]);
})

// Buy the no stock
app.post('/order/buy/no', checkInrBalance, (req, res) => {
  const { userId, stockSymbol, quantity, price } = req.body;

  const yesPrice = (10 - stoi(price)).toString();
  const quant = stoi(quantity)

  if (ORDERBOOK[stockSymbol]['yes'].hasOwnProperty(yesPrice)) {
    if (ORDERBOOK[stockSymbol]['yes'][yesPrice]['orders'].hasOwnProperty(userId)) {
      ORDERBOOK[stockSymbol]['yes'][yesPrice]['orders'][userId] += quant;
    }
    else {
      ORDERBOOK[stockSymbol]['yes'][yesPrice]['orders'][userId] = quant;
    }
    ORDERBOOK[stockSymbol]['yes'][yesPrice]['total'] += quant;
  }
  else {
    ORDERBOOK[stockSymbol]['yes'][yesPrice] = {
      "total": quant,
      "orders": {
        [userId]: quant,
      }
    }
  }
  // INR Balance update
  const cost = stoi(price) * quant
  INR_BALANCES[userId]['balance'] -= cost;
  INR_BALANCES[userId]['locked'] += cost;

  // Stock Balance update
  // After order matching 
  res.send(ORDERBOOK[stockSymbol]);
})

// Sell the yes stock
app.post('/order/sell/yes', (req, res) => {
  const { userId, stockSymbol, quantity, price } = req.body;

  const quant = stoi(quantity)

  if (ORDERBOOK[stockSymbol]['yes'].hasOwnProperty(price)) {
    if (ORDERBOOK[stockSymbol]['yes'][price]['orders'].hasOwnProperty(userId)) {
      ORDERBOOK[stockSymbol]['yes'][price]['orders'][userId] += quant;
    }
    else {
      ORDERBOOK[stockSymbol]['yes'][price]['orders'][userId] = quant;
    }
    ORDERBOOK[stockSymbol]['yes'][price]['total'] += quant;
  }
  else {
    ORDERBOOK[stockSymbol]['yes'][price] = {
      "total": quant,
      "orders": {
        [userId]: quant,
      }
    }
  }
  // INR Balance update
  // Update after matching the order

  // Stock Balance update

  res.send(ORDERBOOK[stockSymbol]);
})

// Sell the no stock
app.post('/order/sell/no', (req, res) => {
  const { userId, stockSymbol, quantity, price } = req.body;

  const quant = stoi(quantity)

  if (ORDERBOOK[stockSymbol]['no'].hasOwnProperty(price)) {
    if (ORDERBOOK[stockSymbol]['no'][price]['orders'].hasOwnProperty(userId)) {
      ORDERBOOK[stockSymbol]['no'][price]['orders'][userId] += quant;
    }
    else {
      ORDERBOOK[stockSymbol]['no'][price]['orders'][userId] = quant;
    }
    ORDERBOOK[stockSymbol]['no'][price]['total'] += quant;
  }
  else {
    ORDERBOOK[stockSymbol]['no'][price] = {
      "total": quant,
      "orders": {
        [userId]: quant,
      }
    }
  }
  // INR Balance update
  // Update after matching the order

  // Stock Balance update

  res.send(ORDERBOOK[stockSymbol]);
})

app.get('/orderbook/:stockSymbol', (req, res) => {
  const stockSymbol = req.params.stockSymbol;
  res.send(ORDERBOOK[stockSymbol]);
})

module.exports = app;
