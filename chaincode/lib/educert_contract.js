'use strict';

// Fabric smart contract class
const { Contract } = require('fabric-contract-api');
const Certificate = require('./certificate');
const UniversityProfile = require('./university_profile');



class EducertContract extends Contract {

    /**
     * Initialize the ledger. 
     * Certificate schema is written to database during initialization. Schema is necessary for encryption. 
     * @param {Context} ctx the transaction context.
     */
    async initLedger(ctx) {
        console.log("-------------------------initLedger Called---------------------------------------")
        //Have nothing to initialize the ledger with at the moment. 

        let schemaCertificate = {
            dataType : "schema",
            version: "v1",
            ordering: ["studentName", "studentEmail", "universityName", "universityEmail", "major", "departmentName", "cgpa", "dateOfIssue"],
            certificateType: "university degree"
        }

        await ctx.stub.putState("schema_v1", Buffer.from(JSON.stringify(schemaCertificate)));

        return schemaCertificate;
    }

    /**
     * Issue a new certificate to the ledger. 
     * @param {Context} ctx The transaction context
     * @param {String} certHash - Hash created from the certificate data. 
     * @param {String} universitySignature - Signature of @certHash signed by private key of issuer(university)
     * @param {String} studentSignature - Signature of @certHash signed by private key of holder(student)
     * @param {String} dateOfIssuing - Date the certificate was issued
     * @param {String} certUUID - UUID for a certificate (automatically generated. Must match with database entry)
     * @param {String} universityPK - Public key or public ID of issuer account
     * @param {String} studentPK - Public key or public ID of student account 
     */
    async issueCertificate(ctx, certHash, universitySignature, studentSignature, dateOfIssuing, certUUID, universityPK, studentPK) {
        console.log("============= START : Issue Certificate ===========");
        //todo: Validate data.

        const certificate = new Certificate(certHash, universitySignature, studentSignature, dateOfIssuing, certUUID, universityPK, studentPK);
        await ctx.stub.putState("CERT" + certUUID, Buffer.from(JSON.stringify(certificate)));

        console.log("============= END : Issue Certificate ===========");
        return certificate;
    }


    /**
    * Register a university. Must be done when a university enrolls into the platform.
    * @param {Context} ctx The transaction context
    * @param {String} name 
    * @param {String} publicKey 
    * @param {String} location 
    * @param {String} description 
    */
    async registerUniversity(ctx, name, publicKey, location, description) {
        console.log("============= START : Register University ===========");
        //todo Add validation.
        const university = new UniversityProfile(name, publicKey, location, description);
        await ctx.stub.putState("UNI" + name, Buffer.from(JSON.stringify(university)));

        console.log("============= END : Register University ===========");
        return university;
    }

    /**
     * Get public profile of a enrolled university based on it's name
     * @param {Context} ctx The transaction context
     * @param {String} name 
     * @returns {JSON} University Profile
     */
    async queryUniversityProfileByName(ctx, name) {
        const profileAsBytes = await ctx.stub.getState("UNI" + name);

        if (!profileAsBytes || profileAsBytes.length === 0) {
            throw new Error(`University ${name} does not exist`);
        }

        console.log(`University ${name} Query Successful. Profile: `);
        console.log(profileAsBytes.toString());
        return JSON.parse(profileAsBytes.toString());
    }

    /**
     * Get the certificate schema and ordering. 
     * @param {Context} ctx The transaction context
     * @param {String} schemaVersion Schema version number. Eg - "v1", "v2" etc
     */
    async queryCertificateSchema(ctx, schemaVersion) {
        let schemaAsBytes = await ctx.stub.getState("schema_" + schemaVersion);

        if (!schemaAsBytes || schemaAsBytes.length === 0) {
            throw new Error(`Schema ${schemaVersion} does not exist`);
        }

        console.log(`Schema ${schemaVersion} Query Successful. Schema: `);
        console.log(schemaAsBytes.toString());
        return JSON.parse(schemaAsBytes.toString());
    }

    /**
     * Get a certificate based on its UUID
     * @param {Context} ctx The transaction context
     * @param {String} UUID Certificate unique ID
     * @returns {JSON} Certificate data
     */
    async queryCertificateByUUID(ctx, UUID) {
        const certificateAsBytes = await ctx.stub.getState("CERT" + UUID);

        if (!certificateAsBytes || certificateAsBytes.length === 0) {
            throw new Error(`Certificate with UUID: ${UUID} does not exist`);
        }

        console.log(`Certificate ${UUID} Query Successful. Certificate Info: `);
        console.log(certificateAsBytes.toString());
        return JSON.parse(certificateAsBytes.toString());
    }

    /**
     * Returns all the certificates received by a specific student
     * @param {Context} ctx The transaction context
     * @param {*} studentPK Public Key of students account in platform
     * @returns {[Certificate]} 
     */
    async getAllCertificateByStudent(ctx, studentPK) {
        let queryString = {
            selector: {
                studentPK: studentPK,
                dataType: "certificate"
            }
        };

        let queryResults = await this.queryWithQueryString(ctx, JSON.stringify(queryString));

        let certArray = [];
        for (let i = 0; i < queryResults.length; i++) {
            try {
                certArray.push(Certificate.deserialize(queryResults[i].value))
            } catch (err) {
                console.log("Failed to instantiate Certificate object from JSON in getAllCertificateByStudent\n" + err);
                console.log("DATA TYPE:  " + typeof queryResults[i])
                certArray.push(queryResults[i])
            }
        }

        return certArray;
    }

    /**
     * Returns al the certificates issued by a specific university
     * @param {Context} ctx The transaction context
     * @param {*} universityPK Public Key of university that issued the certificate
     * @returns {[Certificate]} 
     */
    async getAllCertificateByUniversity(ctx, universityPK) {
        let queryString = {
            selector: {
                universityPK: universityPK,
                dataType: "certificate"
            }
        };

        let queryResults = await this.queryWithQueryString(ctx, JSON.stringify(queryString));

        let certArray = [];
        for (let i = 0; i < queryResults.length; i++) {
            try {
                certArray.push(Certificate.deserialize(queryResults[i].value))
            } catch (err) {
                console.log("Failed to instantiate Certificate object from JSON in getAllCertificateByUniversity\n" + err);
                console.log("DATA TYPE:  " + typeof queryResults[i])
                certArray.push(queryResults[i])
            }
        }

        return certArray;
    }



    /**
     * Query and return all key value pairs in the world state.
     *
     * @param {Context} ctx the transaction context
     * @returns - all key-value pairs in the world state
    */
    async queryAll(ctx) {

        let queryString = {
            selector: {}
        };

        let queryResults = await this.queryWithQueryString(ctx, JSON.stringify(queryString));
        return queryResults;

    }

    /**
       * Evaluate a queryString and return all key-value pairs that match that query. 
       * Only possible if CouchDB is used as state database. 
       * @param {Context} ctx the transaction context
       * @param {String} queryString the query string to be evaluated
       * @returns {[JSON]} - Two objects, key and value. 
       * NOTE: In case "value" of the key-value pair cannot be parsed to JSON, the string is returned directly for that entry.
       * 
      */
    async queryWithQueryString(ctx, queryString) {

        console.log("============= START : queryWithQueryString ===========");
        console.log(JSON.stringify(queryString));

        let resultsIterator = await ctx.stub.getQueryResult(queryString);

        let allResults = [];

        // eslint-disable-next-line no-constant-condition
        while (true) {
            let res = await resultsIterator.next();

            if (res.value && res.value.value.toString()) {
                let jsonRes = {};

                console.log(res.value.value.toString('utf8'));

                jsonRes.key = res.value.key;

                try {
                    jsonRes.value = JSON.parse(res.value.value.toString('utf8'));
                } catch (err) {
                    console.log(err);
                    jsonRes.value = res.value.value.toString('utf8');
                }

                allResults.push(jsonRes);
            }
            if (res.done) {
                console.log('end of data');
                await resultsIterator.close();
                console.log(allResults);
                console.log("============= END : queryWithQueryString ===========");
                return allResults;
            }
        }
    }

}




module.exports = EducertContract;