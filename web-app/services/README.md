# Service Layer.

The service layer encapsulates and abstracts all of our business logic from the rest of the application. Controllers and other parts of the application should levarage the service layer to perform computation.

**Organization**

- Services should be separated based on functionality. (Eg - cache.js, logger.js, email-service.js etc)
- If a specific functionality is too large, split it into multiple files and create a subdirectory in servies.
- A lot of small misc functionality can be merged together to create a util.js inside the services layer. 

**The Service Layer SHOULD:**

- Contain business logic
- Leverage the data access layer to interact with the data in any shape or form.
- Be framework agnostic ( ideally :'3 )

**The Service Layer SHOULD NOT:**
- Be provided the req or res objects
- Handle responding to clients
- Provide anything related to HTTP Transport layer; status codes, headers, etc.
- Directly interact with the database