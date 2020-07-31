//add configuration files
//initialize environment variables
//try to use the export from this file instead of touching process.env directly.


const env = process.env.NODE_ENV || 'development';

if (env === 'development') {
    process.env.MONGODB_URI = process.env.MONGODB_URI_LOCAL;  //in case of dev, connect to local URI.
    process.env.NODE_ENV = 'development';
}


module.exports = {
    mongodbURI: process.env.MONGODB_URI,
    port: process.env.PORT,
    logLevel: process.env.LOG_LEVEL || "info",
    expressSessionSecret: process.env.EXPRESS_SESSION_SECRET,


    fabric: {
        ccpPath: process.env.CCP_PATH,
        walletPath: require('path').resolve(__dirname, "..", "wallet"),
        channelName : process.env.FABRIC_CHANNEL_NAME,
        chaincodeName : process.env.FABRIC_CHAINCODE_NAME
    }
};




