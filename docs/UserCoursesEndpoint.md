# User Courses with Statistics Endpoint

## Overview

This endpoint provides comprehensive statistics about all courses a user has started or completed, including progress details, quiz results, and course metadata.

## Endpoint

```
GET /api/v1/user/courses/:userId?
```

- If `userId` is provided, it will return courses for that specific user.
- If no `userId` is provided, it will use the authenticated user's ID from the token.

## Authentication

This endpoint requires authentication. Include your auth token in the request header:

```
Authorization: Bearer <your_token>
```

## Response Format

The endpoint returns a JSON response with the following structure:

```json
{
  "success": true,
  "data": {
    "user": {
      "_id": "userId",
      "firstName": "John",
      "lastName": "Doe",
      "fullName": "John Doe",
      "email": "john@example.com",
      "profilePic": "url/to/profile.jpg",
      "department": "Engineering",
      "position": "Developer",
      "employeeCode": "EMP123"
    },
    "stats": {
      "coursesStarted": 10,
      "coursesCompleted": 5,
      "averageProgress": 65,
      "totalMinutesSpent": 320,
      "quizzesPassed": 4,
      "quizzesFailed": 2
    },
    "courses": [
      {
        "_id": "courseId",
        "title": "Course Title",
        "description": "Course description...",
        "category": {
          "_id": "categoryId",
          "name": "Category Name"
        },
        "level": "Intermediate",
        "courseDuration": 60,
        "instructorName": "Instructor Name",
        "instructor": {
          "_id": "instructorId",
          "name": "Instructor Full Name",
          "profilePic": "url/to/instructor.jpg"
        },
        "thumbnail": "url/to/thumbnail.jpg",
        "tags": ["tag1", "tag2"],
        "rating": 4.5,
        "comments": "User comments on the course",
        "featured": false,
        "createdAt": "2023-01-01T00:00:00.000Z",
        "progress": {
          "percentage": 75,
          "minutesSpent": 45,
          "startedAt": "2023-01-15T00:00:00.000Z",
          "lastAccessedAt": "2023-01-20T00:00:00.000Z",
          "completedAt": null
        },
        "quiz": {
          "_id": "quizId",
          "title": "Quiz Title",
          "passingScore": 70,
          "userSubmission": {
            "score": 85,
            "passed": true,
            "submittedAt": "2023-01-21T00:00:00.000Z"
          }
        },
        "completionStatus": {
          "inProgress": true,
          "contentCompleted": false,
          "quizCompleted": true,
          "fullyCompleted": false
        }
      }
    ]
  }
}
```

## Completion Status Explained

- `inProgress`: The user has started the course but not completed it (progress between 1% and 99%)
- `contentCompleted`: The user has finished watching/reading all course content (progress = 100%)
- `quizCompleted`: The user has passed the course quiz
- `fullyCompleted`: The user has both completed the content AND passed the quiz (or completed the content if no quiz exists)

## Examples

### Get Courses for the Current User

```
GET /api/v1/user/courses
```

### Get Courses for a Specific User (Admin Only)

```
GET /api/v1/user/courses/60b8e3f92f78c82470123456
```

## Error Responses

### User Not Found (404)

```json
{
  "success": false,
  "message": "User not found"
}
```

### Server Error (500)

```json
{
  "success": false,
  "message": "Server error",
  "error": "Error details..."
}
``` 