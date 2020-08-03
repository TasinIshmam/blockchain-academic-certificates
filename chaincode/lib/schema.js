// eg UniversitySchema = {
//     dataType : "schema",
//     id: "v1",
//     ordering: ["studentName", "studentEmail", "universityName", "universityEmail", "major", "departmentName", "cgpa"],
//     certificateType: "university degree"
// }


class Schema {
    
    
    /**
    * Schema for a certain type of certificate
    * @param {String} certificateType 
    * @param {String} id 
    * @param {String[]} ordering 
    */
    constructor(certificateType, id, ordering){
        this.certificateType = certificateType;
        this.id = id;
        this.ordering = ordering;
        this.dataType = "schema"
    }
    
    
    
    /**
    * Instantiate object from json argument. 
    * @param {json} data json data of a Profile instance 
    * @returns {UniversityProfile} instantiated University Profile object. 
    */
    static deserialize(data) {
        return new Schema(data.certificateType, data.id, data.ordering);
    }
    
}