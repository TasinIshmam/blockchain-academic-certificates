'use strict';




class UniversityProfile {
   /**
    * Public profile of a university
    * @param {String} name 
    * @param {String} publicKey 
    * @param {String} location 
    * @param {String} description 
    */
    constructor(name, publicKey, location, description){
        this.name = name;
        this.publicKey = publicKey;
        this.location = location;
        this.description = description;
        this.dataType = "university"
    }

   

    /**
     * Instantiate object from json argument. 
     * @param {json} data json data of a Profile instance 
     * @returns {UniversityProfile} instantiated University Profile object. 
     */

    static deserialize(data) {
        return new UniversityProfile(data.name, data.publicKey, data.location, data.description);
    }
}

module.exports = UniversityProfile;