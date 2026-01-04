# 7-25-2024

## UserGroups

One issue I realized when working on `DataStore.start()` is that it would automatically sync the entire datastore locally, which is not ideal as the application gets bigger. Even though my application isn't big enough for it to really be a problem right now and that it might be a bit excessive, I think it's worth setting up a system where users are added to userGroups by organizations. In doing so, it would allow for more selective syncing, and better graphQL security rules. Additionally, it would be difficult to migrate the data and models to this new schema if this actually becomes a problem.
[Controlling AWS From API](https://docs.aws.amazon.com/IAM/latest/APIReference/welcome.html)
[UserGroup Authentication](https://docs.amplify.aws/gen1/react-native/build-a-backend/graphqlapi/customize-authorization-rules/#user-group-based-data-access)

After creating a testing screen, i was able to verify that using user groups works as intended, and helps to create a more selective syncing while still allowing users to access all the data they need. My current plan for this setup is to have users automatically create a user group whenever an organization is created and to add users to a user group whenever an orgUserStorage is created. This would need to make use of lambda functions, as I learned that it's unsafe to create an IAM user and put their access keys into the app bundle. (Even though Amplify does something similar, I'm not sure how to restrict the permissions of my IAM to the least like Amplify does, and I think ti's important to practice lambda functions for google sheets integration).

# 7-26-2024 - 7-29-2024

## CreateUserGroup, AddUserToGroup

I tried to setup a multiple methods to createUserGruops and add users to groups in AWS Cognito from my app, here are the methods that didn't work:

- **DynamoDB triggers lambda function**: In this strategy, I planned to have a trigger that listens to when the Organizations or OrgUserStorage table is changed in order to activate a lambda function. While I got a working function, I came to realize that my app wouldn't get a response from the triggers and potentially have stale user data, as well as strange latency bugs.
- **Use IAM credentials and AWS SDK**: Even though bundling credentials into an app isn't secure, I hoped to create an extremely limited IAM role and then directly call the AWS SDK (cognito-identity-service-provider) by passing in the IAM access keys. However, the aws-sdk uses javascript dependencies that conflict with react-native, and overall it's not very secure.

Ultimately, I ended up creating an API Gateway on AWS that calls a lambda function that updates AWS Cognito. To do this, I first defined my lambda functions on AWS cognito. Then, after creating an API gateway, I attached an authorization schema of using my asaapp cognito userpool to require an authorization header with tokens from that pool. The API gateway then was given a /user-group route, where POST will create a userGroup, and PUT will add a user to a group. After testing with Postman, I finally placed the api url into a .env and call it inside of UserGroups.ts. [link](https://docs.aws.amazon.com/apigateway/latest/developerguide/api-gateway-create-api-as-simple-proxy-for-lambda.html)

## Refreshing

One problem I had after adding a user to a userGroup was that the changes wouldn't be reflected in Datastore. After multiple attempts trying to use Auth.getCurrentSession(), clearing the datastore, and even setting up an API gateway to refresh the user's token, I came to realize the solution was easier than I though. Just call `await Auth.updateUserAttributes()` and reupdate with the user's own values so that the new Auth user is updated, for Datastore to properly access when it is refreshed.
