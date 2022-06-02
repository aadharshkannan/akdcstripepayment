module.exports = {
    // Required
    googleClientID: process.env.GOOGLE_CLIENT_ID,
    googleClientSecret:process.env.GOOGLE_CLIENT_SECRET,    
    mongoURI:process.env.MONGO_URI,
    cookieKey:process.env.COOKIE_KEY,
    stripeServerSecret:process.env.STRIPE_SERVER_SECRET,
    storeWalletAddress: process.env.STORE_WALLET_ADDRESS,
    usdcContract: process.env.USDC_CONTRACT,
    akdcContract: process.env.AKDC_CONTRACT,
    akdcGSNContract:process.env.AKDC_GSN_CONTRACT,
    gsnPayMaster:process.env.GSN_PAYMASTER,
    preferredRelay:process.env.PREFERRED_RELAY,    
    webHookServerSecret: process.env.WH_SECRET
  };