const bip39 = require("bip39");
const hdkey = require('ethereumjs-wallet/hdkey');
const fs = require('../core/fs');

class AccountParser {
  static parseAccountsConfig(accountsConfig, web3, logger) {
    let accounts = [];
    if (accountsConfig && accountsConfig.length) {
      accountsConfig.forEach(accountConfig => {
        const account = AccountParser.getAccount(accountConfig, web3, logger);
        if (!account) {
          return;
        }
        if (Array.isArray(account)) {
          accounts = accounts.concat(account);
          return;
        }
        accounts.push(account);
      });
    }
    return accounts;
  }

  static getHexBalance(balanceString, web3) {
    if (!balanceString) {
      return 0xFFFFFFFFFFFFFFFFFF;
    }
    if (web3.utils.isHexStrict(balanceString)) {
      return balanceString;
    }
    const match = balanceString.match(/([0-9]+) ?([a-zA-Z]*)/);
    if (!match) {
      throw new Error(__('Unrecognized balance string "%s"', balanceString));
    }
    if (!match[2]) {
      return web3.utils.toHex(parseInt(match[1], 10));
    }

    return web3.utils.toHex(web3.utils.toWei(match[1], match[2]));
  }

  static getAccount(accountConfig, web3, logger) {
    if (!logger) {
      logger = console;
    }
    let hexBalance = null;
    if (accountConfig.balance) {
      hexBalance = AccountParser.getHexBalance(accountConfig.balance, web3);
    }

    if (accountConfig.privateKey === 'random') {
      let randomAccount = web3.eth.accounts.create();
      accountConfig.privateKey = randomAccount.privateKey;
    }

    if (accountConfig.privateKey) {
      if (!accountConfig.privateKey.startsWith('0x')) {
        accountConfig.privateKey = '0x' + accountConfig.privateKey;
      }
      if (!web3.utils.isHexStrict(accountConfig.privateKey)) {
        logger.warn(`Private key ending with ${accountConfig.privateKey.substr(accountConfig.privateKey.length - 5)} is not a HEX string`);
        return null;
      }
      return Object.assign(web3.eth.accounts.privateKeyToAccount(accountConfig.privateKey), {hexBalance});
    }
    if (accountConfig.privateKeyFile) {
      let fileContent = fs.readFileSync(fs.dappPath(accountConfig.privateKeyFile)).toString();
      fileContent = fileContent.trim().split(/[,;]/);
      return fileContent.map((key, index) => {
        if (!key.startsWith('0x')) {
          key = '0x' + key;
        }
        if (!web3.utils.isHexStrict(key)) {
          logger.warn(`Private key is not a HEX string in file ${accountConfig.privateKeyFile} at index ${index}`);
          return null;
        }
        return Object.assign(web3.eth.accounts.privateKeyToAccount(key), {hexBalance});
      });
    }
    if (accountConfig.mnemonic) {
      const hdwallet = hdkey.fromMasterSeed(bip39.mnemonicToSeed(accountConfig.mnemonic.trim()));

      const addressIndex = accountConfig.addressIndex || 0;
      const numAddresses = accountConfig.numAddresses || 1;
      const wallet_hdpath = accountConfig.hdpath || "m/44'/60'/0'/0/";

      const accounts = [];
      for (let i = addressIndex; i < addressIndex + numAddresses; i++) {
        const wallet = hdwallet.derivePath(wallet_hdpath + i).getWallet();
        accounts.push(Object.assign(web3.eth.accounts.privateKeyToAccount('0x' + wallet.getPrivateKey().toString('hex')), {hexBalance}));
      }
      return accounts;
    }
    logger.warn('Unsupported account configuration: ' + JSON.stringify(accountConfig));
    logger.warn('Try using one of those: ' +
      '{ "privateKey": "your-private-key", "privateKeyFile": "path/to/file/containing/key", "mnemonic": "12 word mnemonic" }');
    return null;
  }
}

module.exports = AccountParser;
