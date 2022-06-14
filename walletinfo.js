
  const keys = require('./config/keys');

  var info = 
  { storeWallet:keys.creds.storeWalletAddress,
    usdcContract:keys.creds.usdcContract,
    akdcContract:keys.creds.akdcContract,
    gsn:{
      contract:keys.creds.akdcGSNContract,
      payMaster:keys.creds.gsnPayMaster,
      preferredRelay:keys.creds.preferredRelay,
    },
    swap:{
      currencyContract:keys.creds.akdcGSNContract,
      emitAndTransferContract: keys.creds.emitAndTransferContract
    }};

module.exports = info;