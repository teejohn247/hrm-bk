# MongoDB Index Management Scripts

This directory contains scripts to manage MongoDB indexes, particularly for fixing duplicate key errors in the Notifications collection.

## The Problem

You might encounter this error when working with the Notifications collection:

```
MongoServerError: E11000 duplicate key error collection: greenpeg.notifications index: notificationType_1 dup key: { notificationType: "Leave Application" }
```

This happens because there are unique indexes on fields like `notificationType`, `notificationContent`, and `recipientId` that should not be unique, as multiple users can receive the same type of notification.

## Solution: Drop the Indexes

We've fixed the schema in `model/Notification.js` by removing the `unique: true` constraints, but existing indexes in MongoDB need to be dropped for the changes to take effect.

## How to Use These Scripts

### Option 1: Using the Shell Script (Recommended)

1. Make the script executable (first time only):
   ```bash
   chmod +x scripts/drop_indexes.sh
   ```

2. Run the script:
   ```bash
   ./scripts/drop_indexes.sh
   ```

   This script will:
   - Check if Node.js is installed
   - Install required dependencies
   - Run the Node.js script to drop indexes
   - Provide colored output on progress

### Option 2: Using the Node.js Script Directly

If you prefer to run the Node.js script directly:

1. Ensure you have the required packages:
   ```bash
   npm install mongoose dotenv
   ```

2. Run the script:
   ```bash
   node scripts/drop_notification_indexes.js
   ```

## Script Details

- **drop_notification_indexes.js**: NodeJS script that connects to MongoDB and drops all indexes from the Notifications collection except the primary `_id` index.
- **drop_indexes.sh**: Bash wrapper script to set up the environment and run the Node.js script.

## Expected Output

If successful, you should see output like:

```
MongoDB Connected
Current indexes:
[
  { v: 2, key: { _id: 1 }, name: '_id_' },
  { v: 2, key: { notificationType: 1 }, name: 'notificationType_1', unique: true },
  { v: 2, key: { recipientId: 1 }, name: 'recipientId_1', unique: true },
  { v: 2, key: { notificationContent: 1 }, name: 'notificationContent_1', unique: true }
]
Dropping index: notificationType_1
Index notificationType_1 dropped successfully
Dropping index: recipientId_1
Index recipientId_1 dropped successfully
Dropping index: notificationContent_1
Index notificationContent_1 dropped successfully
All indexes dropped except _id
Remaining indexes:
[ { v: 2, key: { _id: 1 }, name: '_id_' } ]
MongoDB Disconnected

Indexes dropped successfully. You should now be able to create notifications without duplicate key errors.
```

## After Running the Script

After running the script successfully, restart your application. New notifications will be created without the duplicate key errors, as the unique constraints have been removed both from the schema and the database indexes. 