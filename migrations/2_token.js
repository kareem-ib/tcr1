/* global artifacts */

const Token = artifacts.require('tokens/eip20/EIP20.sol');

const fs = require('fs');

module.exports = (deployer, network) => {
  let config = JSON.parse(fs.readFileSync('./conf/config.json'));

  if (network !== 'test') {
    config = JSON.parse(fs.readFileSync('./conf/configDecimals.json'));
  }

  if (process.argv[5] && (network === 'ganache' || network === 'rinkeby')) {
    config = JSON.parse(fs.readFileSync(`./conf/${process.argv[5]}.json`));
  }

  async function giveTokensTo(tokenHolders) {
    if (tokenHolders.length === 0) { return; }
    const token = await Token.deployed();
    const tokenHolder = tokenHolders[0];

    const displayAmt = tokenHolder.amount.slice(
      0,
      tokenHolder.amount.length - parseInt(config.token.decimals, 10),
    );
    // eslint-disable-next-line
    console.log(`Allocating ${displayAmt} ${config.token.symbol} tokens to ` +
    `${tokenHolder.address}.`);

    await token.transfer(tokenHolder.address, tokenHolder.amount);

    giveTokensTo(tokenHolders.slice(1));
  }

  if (config.token.deployToken) {
    deployer.deploy(
      Token, config.token.supply, config.token.name, config.token.decimals,
      config.token.symbol,
    )
      .then(async () => giveTokensTo(config.token.tokenHolders));
  } else {
    // eslint-disable-next-line
    console.log('skipping optional token deploy and using the token at address ' +
      `${config.token.address} on network ${network}.`);
  }
};
