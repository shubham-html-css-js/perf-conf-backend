# Perf-Conf-Treasure-Hunt

This is the codebase for the backend part of Perf-Conf Treasure Hunt.

In total, 3 APIs were constructed to serve the Treasure Hunt.

# /team

The /team API is a POST API to authenticate the Teams. To avoid confusion, the teams are already pre-created in the backend,and this API takes username
and password as request and matches it against the already present credentials in database.

# /submit

The /submit API is a POST API that checks if the answer entered by user is correct or not.If the answer is correct, then the total time used by the Team
to answer said number of questions is updated, otherwise no update happens.

# /leaderboard

The /leaderboard API is a GET API that returns the leaderboard.The API sorts the team based on number of Questions solved in descending order, and in case
of a Tie, sorts it based on the total time taken in ascending order.This API is also used in live leaderboard.

Apart from these 3 APIs, the backend code consists of connecting to MongoDB cloud instance, along with the use of Pusher.js to serve the live leaderboard.

You can use this code for your own Treasure Hunt by cloning the repo and running node index.js on your local computer,although you have to use your own set of environment variables for MongoDB and Pusher.

You can also deploy this code on cloud Hosting services like Heroku or on your own VM.
