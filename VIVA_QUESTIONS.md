# NoSQL & MongoDB Viva Questions - Event Management System

Use these questions and answers to prepare for your college project presentation.

### 1. Why did you choose MongoDB (NoSQL) over a Relational Database (SQL) for this project?
**Answer**: MongoDB is document-oriented and offers a flexible schema. In event management, event details can vary (some might have special requirements, extra fields, or different locations). NoSQL allows us to store these as BSON documents, which is more natural for web applications using JSON. It also allows for easier horizontal scaling and high-performance reads using embedded documents.

### 2. What are "Embedded Documents" and where did you use them?
**Answer**: Embedded documents (or nested documents) are documents stored inside another document. I used this for the `location` field in the `events` collection. Instead of having a separate `locations` table and performing a join, we store `venue` and `city` directly inside the event. This improves read performance and demonstrates data locality.

### 3. How do you handle relationships in MongoDB if it's not a relational database?
**Answer**: Relationships are handled using **References** (Normalization) or **Embedding** (Denormalization). In this project, I used references (ObjectId) for `organizerId` and `categoryId` because these entities (Users/Categories) exist independently and are reused across many events. I used embedding for `location` because it belongs specifically to one event.

### 4. What is a "Compound Index" and why is it important in your Registration model?
**Answer**: A compound index is an index on multiple fields. In the `registrations` collection, I created a compound unique index on `{ userId: 1, eventId: 1 }`. This ensures that a specific user cannot register for the same event more than once at the database level, maintaining data integrity.

### 5. Explain the purpose of the Aggregation Framework in your project.
**Answer**: The Aggregation Framework is used for advanced data processing and reporting. I used it to calculate statistics, such as the total number of registrations per event and event counts by category. It uses a pipeline approach ($match, $group, $sort, $lookup) to transform data within the database rather than processing it in the application code.

### 6. What is the $lookup operator used for?
**Answer**: The `$lookup` operator performs a left outer join to a collection in the same database. It allows us to pull in data from another collection. For example, when generating registration reports, I use `$lookup` to join the `registrations` collection with the `events` collection to display the Event Title instead of just an ID.

### 7. How does Mongoose help in this project?
**Answer**: Mongoose is an ODM (Object Data Modeling) library. It provides a schema-based solution to model application data. It handles validation, type casting, query building, and business logic (like password hashing via middleware) in a structured way, making the code more maintainable.

### 8. What is "BSON"?
**Answer**: BSON stands for Binary JSON. It is the binary-encoded serialization of JSON-like documents that MongoDB uses to store data. It supports more data types than standard JSON, such as `Date` and `BinData`.
