# Notification System Design

## Stage 2

### 1. Database Selection
PostgreSQL is a good choice for this system because it is reliable, supports structured data well, and works smoothly with Node.js applications. It also gives strong support for relationships, indexing, and data integrity.

### 2. Database Schema

#### students
| Column | Data Type | Key | Description |
|---|---|---|---|
| id | UUID | Primary Key | Unique student ID |
| student_id | VARCHAR(50) | Unique | Student number from the campus system |
| full_name | VARCHAR(100) |  | Student full name |
| email | VARCHAR(150) |  | Student email address |
| created_at | TIMESTAMP |  | Account creation time |

#### notifications
| Column | Data Type | Key | Description |
|---|---|---|---|
| id | UUID | Primary Key | Unique notification ID |
| student_id | UUID | Foreign Key | Reference to students.id |
| notification_type | VARCHAR(50) |  | Type of notification |
| title | VARCHAR(150) |  | Notification title |
| message | TEXT |  | Notification content |
| is_read | BOOLEAN |  | Read status |
| created_at | TIMESTAMP |  | Notification creation time |

### 3. Relationship
One student can have many notifications. That means the students table is the parent table and the notifications table is the child table.

### 4. SQL Schema
```sql
CREATE TABLE students (
  id UUID PRIMARY KEY,
  student_id VARCHAR(50) UNIQUE NOT NULL,
  full_name VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE notifications (
  id UUID PRIMARY KEY,
  student_id UUID NOT NULL,
  notification_type VARCHAR(50) NOT NULL,
  title VARCHAR(150) NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_notifications_students
    FOREIGN KEY (student_id) REFERENCES students(id)
);
```

### 5. Indexing
Indexes should be added on student_id, is_read, notification_type, and created_at. These indexes help the database find records faster, especially when loading notifications for one student or filtering unread messages.

### 6. Scalability
If the system grows to millions of notifications, PostgreSQL can still handle it with good planning. Indexing helps with fast searches, pagination helps load data in smaller parts, partitioning can split old and new records, and archiving old notifications reduces the size of active tables. Read replicas can help with read-heavy traffic, and Redis caching can improve unread count lookups.

### 7. API Interaction
The POST API inserts a new notification record into the notifications table. The GET API reads notifications from the database for a specific student. The PATCH API updates the is_read field for one notification or for all notifications of a student. The DELETE API removes a notification record when it is no longer needed.

## Stage 3

### 1. Introduction
Query optimization is important because the notification system may need to load many records quickly. If the query is slow, users will notice delays when opening their inbox.

### 2. Example Query
```sql
SELECT *
FROM notifications
WHERE student_id = ?
AND is_read = false
ORDER BY created_at DESC
LIMIT 20;
```

### 3. Performance Problems
If the notifications table grows to millions of records, this query can become slow. The database may need to scan many rows, sort them, and then return only a small part of the result.

### 4. Suggested Indexes
A good index for this query is a composite index on student_id, is_read, and created_at. This helps the database filter rows faster and sort them in the right order.

### 5. SQL Index Commands
```sql
CREATE INDEX idx_notifications_student_read_created
ON notifications (student_id, is_read, created_at DESC);
```

### 6. Why Composite Index Is Better
A composite index is better than separate indexes because it lets PostgreSQL use one index for the full query pattern. This reduces extra work and makes the query faster than checking several single indexes.

### 7. Role of LIMIT
LIMIT reduces the amount of data returned to the application. Instead of sending all matching rows, the database only returns the first 20 results, which saves time and memory.

### 8. Avoid SELECT *
Using SELECT * is not ideal because it fetches more columns than needed. Selecting only the required columns makes the query lighter and faster.

### 9. Pagination
Pagination should be used when loading notifications page by page. It helps the database return smaller result sets and improves performance for large tables.

### 10. Summary
These optimizations help reduce query execution time and make the system more scalable. With proper indexing, pagination, and smaller result sets, the database can handle more users and more notifications without slowing down too much.

## Stage 4

### 1. Introduction
Notification retrieval should be optimized because users expect their inbox to load fast. If the system fetches too much data at once, the response becomes slow and the database gets more load.

### 2. Performance Techniques
Pagination can be used with LIMIT and OFFSET to load a small number of notifications per request. Cursor-based pagination is even better for large datasets because it is more stable when new items are added. Only the needed columns should be selected instead of using SELECT *. Proper database indexing also helps the server find unread notifications faster. Redis can be used to cache unread counts and frequently accessed notifications, and lazy loading can be used to load older notifications only when needed.

### 3. Why Caching Helps
Caching reduces database load because repeated requests can be answered from memory instead of querying the database every time. This makes the system faster and reduces pressure on the database.

### 4. Why Pagination Helps
Pagination improves response time because the server returns only a small part of the data at once. It also reduces memory usage on both the server and the client.

### 5. Why Indexes Help
Indexes help fetch unread notifications faster by allowing the database to find matching rows more quickly. This is especially useful when filters like is_read and sorting by created_at are involved.

### 6. Sorting by Time
Notifications are usually shown from the newest to the oldest. Sorting by created_at in descending order makes the inbox more useful and helps the database return the most recent updates first.

### 7. Archiving Old Notifications
Old notifications can be archived to another table or storage area so the main notification table stays smaller. This helps queries run faster and keeps the system more organized.

### 8. Monitoring Performance
Database tools like EXPLAIN can be used to check how a query is executed. This helps find slow parts of the query and improve them before the system gets too large.

### 9. Summary
These techniques help the system stay fast and scalable as the number of users and notifications grows. Better fetching methods, caching, pagination, indexing, and archiving all work together to keep performance strong.

## Stage 5

### 1. Introduction
A notification system should be reliable and scalable because students and staff may receive important updates at any time. If the sending process fails, people may miss important information, so the system needs to handle load and failures carefully.

### 2. Simple Architecture
A simple design can include a client, a backend API, a message queue such as RabbitMQ or Kafka, a notification worker, a database, and a WebSocket server. The client sends an action to the backend, the backend puts the task into the queue, and the worker handles the actual delivery and storage.

### 3. Request Flow
When a user performs an action, the backend creates a notification. That notification is then added to the message queue. A worker reads the message, saves the notification in the database, and delivers it to the user through WebSocket or push notification.

### 4. Why Use a Message Queue
A message queue is better than sending notifications directly because it helps the system handle traffic smoothly. If the worker is busy or the database is slow, the queue keeps the messages safe until they can be processed.

### 5. Retry Mechanism
Retry mechanisms help when delivery fails. If a worker crashes or a network problem happens, the message can be retried later instead of being lost.

### 6. Multiple Worker Instances
Running multiple worker instances improves scalability because several notifications can be processed at the same time. This helps the system handle more users and more requests without slowing down.

### 7. Preventing Duplicate Notifications
Duplicate notifications can be prevented by giving each notification a unique ID. The worker can check whether that ID already exists before saving or sending it again.

### 8. Monitoring and Logging
Monitoring and logging help identify failures quickly. If a message fails repeatedly or a worker stops working, the team can find the issue and fix it faster.

### 9. Horizontal Scaling
The system can be scaled horizontally by adding more backend servers and more workers. This allows the system to grow as the number of users increases.

### 10. Summary
This design improves reliability, fault tolerance, and scalability. It helps notifications be delivered safely, recover from failures, and handle more traffic as the system grows.
