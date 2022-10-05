# Exercise Tracker

Live on replit https://exercise-tracker.mcdanang.repl.co

User Stories:
1. I can create a user by posting form data username to /api/users and returned will be an object with username and _id.
2. I can get an array of all users by getting api/users.
3. I can add an exercise to any user by posting form data userId(_id), description, duration, and optionally date to /api/users/:_id/exercises. If no date supplied, it will use current date. Returned will be the user object with also with the exercise fields added.
4. I can retrieve a full exercise log of any user by getting /api/users/:_id/logs with a parameter of userId(_id). Return will be the user object with added array log and count (total exercise count).
5. I can retrieve part of the log of any user by also passing along optional parameters of from & to or limit. (Date format yyyy-mm-dd, limit = int)
