const ORDERBOOK = require('../globals');

export default function(price, stock, stockSymbol, userId, quant) {
  // Order book update - user1 bids to buy yes for X rs -> order for 'no' should placed at 10 - X rs to balance the total price to 10rs

  if (ORDERBOOK[stockSymbol][stock].hasOwnProperty(price)) {
    if (ORDERBOOK[stockSymbol][stock][price]['orders'].hasOwnProperty(userId)) {
      ORDERBOOK[stockSymbol][stock][price]['orders'][userId] += quant;
    }
    else {
      ORDERBOOK[stockSymbol][stock][price]['orders'][userId] = quant;
    }
    ORDERBOOK[stockSymbol][stock][price]['total'] += quant;
  }
  else {
    ORDERBOOK[stockSymbol][stock][price] = {
      "total": quant,
      "orders": {
        [userId]: quant,
      }
    }
  }
}

