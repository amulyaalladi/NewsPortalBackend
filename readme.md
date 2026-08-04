# real time news portal
This is a news portal, where user can read the trending news categorized by different topics. The portal provides a user-friendly interface to browse through the latest news articles, view detailed information, and stay updated with current events. Users can also search for specific news topics and filter articles based on their interest

# Features


user features:
- View trending news articles
- categotries: Technology, Sports, Politics, Entertainment, Health, Business
- Search for specific news topics
- manage alerts
- get alerts/notifications through email or push notifications
- subscribe or unsubscribe to specific news categories
- view received alerts and customize it

# in middleware
- get token from cookies, if no token return used not authenticated
- if token is present, verify using jwt.verify, if token is invalid return 401 invalid token or token must be expired
- if token is valid, get userid from payload 
- add userId in the request body for further use in nnext middleware or routes handling
- call the next middleware or route handler
- get user from db using userId, check roles and gives authorization based on rules, if user is not authorized return 403 unauthorized access
 ## In creating company
 - get all the required fields from request body, validate them, if any field is missing return 400 bad request, if news alredy exists return 409 conflict, if all fields are valid create a new news article in the database and return 201 created with the newly created news article details