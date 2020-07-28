const NodeCache = require('node-cache');
const myCache = new NodeCache({deleteOnExpire:true, useClones:true});


/**
 * Takes one argument, returns a JSON object containing a status and data
 * @param key - a key that will be used to search the cache
 * @returns {{data: null, status: boolean}|{data: (null|JSON), status: boolean}} 
 */
function getCachedData(key) {
    try {
        let data = myCache.get(key);

        return {
            status: (!(data === undefined || data === null)),
            data: ( data === undefined || data === null ) ? null : data
        }
    } catch (e) {
        return {
            status: false,
            data: null
        }
    }
}


/**
 * Takes two arguments, returns a JSON object containing a status
 * @param key - the key to set the value against
 * @param val - the value to be set against the key
 * @returns {{status: boolean}}
 */
function setCache(key, val) {
    try {
        myCache.set(key, val);
        return {
            status: true
        }
    } catch (e) {
        return {
            status: false
        }
    }
}

/**
 * Takes three arguments, returns a JSON object containing a status
 * @param key - the key to set the value against
 * @param val - the value to be set against the key
 * @param exp - the expiration time (in seconds)
 * @returns {{status: boolean}}
 */

function setCacheWithExpiration(key, val, exp) {
    try {
        myCache.set(key, val, exp);
        return {
            status: true
        }
    } catch (e) {
        return {
            status: false
        }
    }
}

module.exports = {getCachedData, setCache, setCacheWithExpiration};