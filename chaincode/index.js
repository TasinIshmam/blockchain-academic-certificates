'use strict';

const FabCar = require('./lib/educert_contract');

console.log(FabCar)
//NOTE: Estore was changed to Educert.
//Todo: During chaincode invocation, each chaincode is given a name. Find out where that name originates from. 
module.exports.FabCar = FabCar;
module.exports.contracts = [ FabCar ];
