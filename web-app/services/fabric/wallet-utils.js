const {Wallets} = require('fabric-network');
const config = require('../../loaders/config');
const fs = require('fs');
const path = require('path');
const logger = require('../logger');

/**
 * Adds a new user/entity to the wallet. Creates a separate json file to store hex keys of the user.
 * @param {FabricCAServices.IEnrollResponse} enrollmentObject
 * @param {String} userName
 * @returns {Promise<{} | Error>} public and private key in hex format;
 */
async function createNewWalletEntity(enrollmentObject, userName) {
    const wallet = await Wallets.newFileSystemWallet(config.fabric.walletPath);

    const x509Identity = {
        credentials: {
            certificate: enrollmentObject.certificate,
            privateKey: enrollmentObject.key.toBytes(),

        },
        mspId: 'Org1MSP',
        type: 'X.509',
    };


    let hexKeyEntity = {
        publicKey: enrollmentObject.key._key.pubKeyHex,
        privateKey: enrollmentObject.key._key.prvKeyHex,
        userName: userName
    };

    let hexDataString = JSON.stringify(hexKeyEntity, null, 4);

    await Promise.all([
        wallet.put(userName, x509Identity),
        fs.writeFile(path.join(config.fabric.walletPath, `${userName}.json`), hexDataString,
            (err) => { if (err) throw err})
    ]);

    return hexKeyEntity;
}

/**
 * Load the hex form of public and private keys from wallet folder.
 * @param email
 * @returns eg -{
    "publicKey": "049d4ece36818123e42346c76847a69cc87eea3a61330024a1f....8",
    "privateKey": "b3a4ad5b9aecda932f304bf4b566715eb26fe3d006729b79d7c454e18b861cb9",
    "userName": "Noobsaibot53@yahoo.com"
}
 */
function loadHexKeysFromWallet(email) {
    try {
        let filePath = path.join(config.fabric.walletPath, email +".json");

        if (!fs.existsSync(filePath)) {
            logger.error(`User ${email} does not exist in wallet`);
            return null;
        }

        let rawData = fs.readFileSync(path.join(config.fabric.walletPath, email +".json"));
        return JSON.parse(rawData);
    } catch (e) {
        logger.error("Error in loadHexKeysFromWallet for username " + email);
        logger.error(e);
        return null;
    }
}


module.exports = {createNewWalletEntity, loadHexKeysFromWallet};