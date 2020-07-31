//Import Hyperledger Fabric 1.4 programming model - fabric-network
'use strict';

const {  Gateway, Wallets } = require('fabric-network');
const path = require('path');
const fs = require('fs');
const config = require("../../loaders/config");
const logger = require("../logger");

// //connect to the config file
// const configPath = path.join(process.cwd(), './config.json');
// const configJSON = fs.readFileSync(configPath, 'utf8');
// const config = JSON.parse(configJSON);
// let connection_file = config.connection_file;
// // let userName = config.userName;
// let gatewayDiscovery = config.gatewayDiscovery;
// let appAdmin = config.appAdmin;
// let orgMSPID = config.orgMSPID;
//
// // connect to the connection file
// const ccpPath = path.join(process.cwd(), connection_file);
// const ccpJSON = fs.readFileSync(ccpPath, 'utf8');
// const ccp = JSON.parse(ccpJSON);


const util = require('util');
//
// exports.connectToNetwork2 = async function (userName) {
//
//     const gateway = new Gateway();
//
//     try {
//         const walletPath = path.join(process.cwd(), 'wallet');
//         const wallet = new FileSystemWallet(walletPath);
//         logger.debug(`Wallet path: ${walletPath}`);
//         logger.debug('userName: ');
//         logger.debug(userName);
//
//         logger.debug('wallet: ');
//         logger.debug(util.inspect(wallet));
//         logger.debug('ccp: ');
//         logger.debug(util.inspect(ccp));
//         // userName = 'V123412';
//         const userExists = await wallet.exists(userName);
//         if (!userExists) {
//             logger.debug('An identity for the user ' + userName + ' does not exist in the wallet');
//             logger.debug('Run the registerUser.js application before retrying');
//             let response = {};
//             response.error = 'An identity for the user ' + userName + ' does not exist in the wallet. Register ' + userName + ' first';
//             return response;
//         }
//
//         logger.debug('before gateway.connect: ');
//
//         await gateway.connect(ccp, { wallet, identity: userName, discovery: gatewayDiscovery });
//
//         // Connect to our local fabric
//         const network = await gateway.getNetwork('mychannel');
//
//         logger.debug('Connected to mychannel. ');
//         // Get the contract we have installed on the peer
//         const contract = await network.getContract('voterContract');
//
//
//         let networkObj = {
//             contract: contract,
//             network: network,
//             gateway: gateway
//         };
//
//         return networkObj;
//
//     } catch (error) {
//         logger.debug(`Error processing transaction. ${error}`);
//         logger.debug(error.stack);
//         let response = {};
//         response.error = error;
//         return response;
//     } finally {
//         logger.debug('Done connecting to network.');
//         // gateway.disconnect();
//     }
// };

/**
 * Do all initialization needed to invoke chaincode
 * @param userEmail
 * @returns {Promise<{contract: Contract, gateway: Gateway, network: Network} | Error>} Network objects needed to interact with chaincode
 */
async function connectToNetwork(userEmail) {

    let ccp = JSON.parse(fs.readFileSync(config.fabric.ccpPath, 'utf8'));
    let wallet = await Wallets.newFileSystemWallet(config.fabric.walletPath);

    const identity = await wallet.get(userEmail);
    if (!identity) {
        logger.error(`An identity for the user with ${userEmail} does not exist in the wallet`);
        logger.info('Run the registerUser.js application before retrying');
        throw new Error(`An identity for the user with ${userEmail} does not exist in the wallet`);
    }

    const gateway = new Gateway();
    await gateway.connect(ccp, { wallet, identity: userEmail, discovery: { enabled: true, asLocalhost: true } });

    const network =  await gateway.getNetwork(config.fabric.channelName);
    const contract = network.getContract(config.fabric.chaincodeName);

    return {
        gateway, network, contract
    }

}

async function invokeChaincode(isQuery, func, args, userEmail) {
    try {
        let networkObj = await connectToNetwork(userEmail);
        logger.debug('inside invoke');
        logger.debug(`isQuery: ${isQuery}, func: ${func}, args: ${args}`);


        // logger.debug(util.inspect(JSON.parse(args[0])));

        if (isQuery === true) {
            logger.debug('inside isQuery');

            if (args) {
                logger.debug('inside isQuery, args');
                logger.debug(args);
                let response = await networkObj.contract.evaluateTransaction(func, args);
                logger.debug(response);
                logger.debug(`Transaction ${func} with args ${args} has been evaluated`);

                await networkObj.gateway.disconnect();

                return response;

            } else {

                let response = await networkObj.contract.evaluateTransaction(func);
                logger.debug(response);
                logger.debug(`Transaction ${func} without args has been evaluated`);

                await networkObj.gateway.disconnect();

                return response;
            }
        } else {
            logger.debug('notQuery');
            if (args) {
                logger.debug('notQuery, args');
                logger.debug('$$$$$$$$$$$$$ args: ');
                logger.debug(args);
                logger.debug(func);
                logger.debug(typeof args);

                args = JSON.parse(args[0]);

                logger.debug(util.inspect(args));
                args = JSON.stringify(args);
                logger.debug(util.inspect(args));

                logger.debug('before submit');
                logger.debug(util.inspect(networkObj));
                let response = await networkObj.contract.submitTransaction(func, args);
                logger.debug('after submit');

                logger.debug(response);
                logger.debug(`Transaction ${func} with args ${args} has been submitted`);

                await networkObj.gateway.disconnect();

                return response;


            } else {
                let response = await networkObj.contract.submitTransaction(func);
                logger.debug(response);
                logger.debug(`Transaction ${func} with args has been submitted`);

                await networkObj.gateway.disconnect();

                return response;
            }
        }

    } catch (error) {
        logger.error(`Failed to submit transaction: ${error}`);
        throw error;
    }
}


module.exports = {invokeChaincode};
