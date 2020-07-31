'use strict';

const FabricCAServices = require('fabric-ca-client');
const { Wallets } = require('fabric-network');
const path = require('path');
const config = require('../../loaders/config');
const fs = require('fs');
const walletUtils = require('./wallet-utils');
const logger = require('../logger');

//Connection Profile;
const ccp =  JSON.parse(fs.readFileSync(config.fabric.ccpPath, 'utf8'));

/**
 * Enrolls Admin object into wallet.
 * @returns {Promise<{Keys}>}
 */
async function enrollAdmin() {
    try {

        // Create a new CA client for interacting with the CA.
        const caInfo = ccp.certificateAuthorities['ca.org1.example.com'];
        const caTLSCACerts = caInfo.tlsCACerts.pem;
        const ca = new FabricCAServices(caInfo.url, { trustedRoots: caTLSCACerts, verify: false }, caInfo.caName);

        // Create a new file system based wallet for managing identities.
        const wallet = await Wallets.newFileSystemWallet(config.fabric.walletPath);

        const identity = await wallet.get('admin');
        if (identity) {
            logger.info('An identity for the admin user "admin" already exists in the wallet.');
            return;
        }

        // Enroll the admin user, and import the new identity into the wallet.
        const enrollment = await ca.enroll({ enrollmentID: 'admin', enrollmentSecret: 'adminpw' });
        let adminKeys = await walletUtils.createNewWalletEntity(enrollment, "admin");
        logger.info('Successfully enrolled admin user "admin" and imported it into the wallet.');
        return adminKeys;
    } catch (error) {
        logger.error(`Failed to enroll admin user "admin": ${error}`);
        process.exit(1);
    }
}

/**
 * Enrolls a generic user into the client (Used for students and universities)
 * @param email
 * @returns {Promise<{Keys} | Error>}
 * TODO: There's no way to differentiate students and universities in the MSP this way. Possibly consider changing.
 */
async function registerUser(email){
    try {
        // Create a new CA client for interacting with the CA.
        const caURL = ccp.certificateAuthorities['ca.org1.example.com'].url;
        const ca = new FabricCAServices(caURL);

        // Create a new file system based wallet for managing identities.
        const wallet = await Wallets.newFileSystemWallet(config.fabric.walletPath);

        // Check to see if we've already enrolled the user.
        const userIdentity = await wallet.get(email);
        if (userIdentity) {
            throw Error(`An identity for the user ${email} already exists in the wallet`);
        }

        // Check to see if we've already enrolled the admin user.
        const adminIdentity = await wallet.get('admin');
        if (!adminIdentity) {
            throw Error('An identity for the admin user "admin" does not exist in the wallet');

        }

        // build a user object for authenticating with the CA
        const provider = wallet.getProviderRegistry().getProvider(adminIdentity.type);
        const adminUser = await provider.getUserContext(adminIdentity, 'admin');

        // Register the user, enroll the user, and import the new identity into the wallet.
        const secret = await ca.register({
            affiliation: 'org1.department1',
            enrollmentID: email,
            role: 'client'
        }, adminUser);

        const enrollment = await ca.enroll({
            enrollmentID: email,
            enrollmentSecret: secret
        });

        let userKeys = await walletUtils.createNewWalletEntity(enrollment, email);
        logger.info(`Successfully registered and enrolled  user ${email} and imported it into the wallet`);
        return userKeys;

    } catch (error){
        logger.error(`Failed to register user ${email}": ${error}`);
        throw error;
    }
}

module.exports = {enrollAdmin, registerUser};
