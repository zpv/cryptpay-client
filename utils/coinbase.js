const axios = require('axios');

const fetchPrice = async () => {
  const url = `https://api.coinbase.com/v2/prices/ETH-CAD/buy`;
  const request = await axios.get(url); // this returns a promise - stored in 'request'
  return request.data.data.amount;
};

module.exports = { fetchPrice };
