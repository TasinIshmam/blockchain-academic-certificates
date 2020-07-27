'use strict';


class Certificate {
    /**
     * constructor for the certificate transaction object. This will be written to the blockchain ledger for each
     * certificate issued. 
     *  
     * @param {String} certHash - Hash created from the certificate data. 
     * @param {String} universitySignature - Signature of @certHash signed by private key of issuer(university)
     * @param {String} studentSignature - Signature of @certHash signed by private key of holder(student)
     * @param {String} dateOfIssuing - Date the certificate was issued
     * @param {String} certUUID - UUID for a certificate (automatically generated. Must match with database entry)
     * @param {String} universityPK - Public key or public ID of issuer account
     * @param {String} studentPK - Public key or public ID of student account 
     */

     //todo: universityPK and studentPK should ideally be public keys. If you can't accomplish this, look into using 
     // some kind of UUID instead. 
    constructor(certHash, universitySignature, studentSignature, dateOfIssuing, certUUID, universityPK, studentPK) {
        this.certHash = certHash;
        this.universityPK = universityPK;
        this.studentPK = studentPK;
        this.universitySignature = universitySignature;
        this.studentSignature = studentSignature;
        this.dateOfIssuing = dateOfIssuing;
        this.certUUID = certUUID;
        this.dataType = "certificate"
    }

   

    /**
     * Instantiate object from json argument. 
     * @param {json} data json data of a Product instance 
     * @returns {Certificate} instantiated Certificate object. 
     */

    static deserialize(data) {
        return new Certificate(data.certHash, data.universitySignature, data.studentSignature, data.dateOfIssuing, data.certUUID, data.universityPK, data.studentPK);
    }
    

    //todo: Add validation of some kind to see that the signatures match and stuff. (LATER)
}

module.exports = Certificate;