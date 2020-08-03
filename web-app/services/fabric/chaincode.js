//Import Hyperledger Fabric 1.4 programming model - fabric-network
'use strict';

const {  Gateway, Wallets } = require('fabric-network');
const path = require('path');
const fs = require('fs');
const config = require("../../loaders/config");
const logger = require("../logger");



const util = require('util');


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

/**
 * Invoke any chaincode using fabric sdk
 *
 * @param {String} func - The chaincode function to call
 * @param {[String]} args - Arguments to chaincode function
 * @param {Boolean} isQuery - True if query function, False if transaction function
 * @param {String} userEmail - Email of fabric user that invokes chaincode. Must be enrolled and have entity in wallet.
 * @returns {Promise<JSON>}
 */
async function invokeChaincode( func, args, isQuery, userEmail) {
    try {
        let networkObj = await connectToNetwork(userEmail);
        logger.debug('inside invoke');
        logger.debug(`isQuery: ${isQuery}, func: ${func}, args: ${args}`);

        if (isQuery === true) {
            logger.debug('inside isQuery');

            if (args) {
                logger.debug('inside isQuery, args');
                logger.debug(args);
                let response = await networkObj.contract.evaluateTransaction(func, ...args);
                logger.debug(response);
                logger.debug(`Transaction ${func} with args ${args} has been evaluated`);

                await networkObj.gateway.disconnect();
                return JSON.parse(response);

            } else {

                let response = await networkObj.contract.evaluateTransaction(func);
                logger.debug(response);
                logger.debug(`Transaction ${func} without args has been evaluated`);

                await networkObj.gateway.disconnect();

                return JSON.parse(response);
            }
        } else {
            logger.debug('notQuery');
            if (args) {
                logger.debug('notQuery, args');
                logger.debug('$$$$$$$$$$$$$ args: ');
                logger.debug(args);
                logger.debug(func);

                let response = await networkObj.contract.submitTransaction(func, ...args);
                logger.debug('after submit');

                logger.debug(response);
                logger.debug(`Transaction ${func} with args ${args} has been submitted`);

                await networkObj.gateway.disconnect();

                return JSON.parse(response);


            } else {
                let response = await networkObj.contract.submitTransaction(func);
                logger.debug(response);
                logger.debug(`Transaction ${func} with args has been submitted`);

                await networkObj.gateway.disconnect();

                return JSON.parse(response);
            }
        }

    } catch (error) {
        logger.error(`Failed to submit transaction: ${error}`);
        throw error;
    }
}


module.exports = {invokeChaincode};
