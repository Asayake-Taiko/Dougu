# 6-13-24:

## Get App Working Again

Today I managed to get `npx expo start` to run and open the app, however after logging in, I have been getting:

```
[ERROR] 36:54.579 DataStore - Sync processor retry error: {"data": {}, "errors": [[GraphQLError: Request failed with status code 401]]}
 WARN  [WARN] 36:54.635 DataStore - User is unauthorized to query syncUsers with auth mode API_KEY. No data could be returned.
```

This error was fixed by running `amplify update api` and configuring a new api key.

## Swap problems

When I swap, I get a warning.

```
[WARN] 16:38.653 DataStore {"cause": [GraphQLError: Request failed with status code 401], "errorInfo": undefined, "errorType": "Unauthorized", "localModel": {"_version": 1, "containerEquipmentId": undefined, "id": "fcdc1d50-78bb-4ed5-9576-6fb056b5c570", "lastUpdatedDate": "2024-06-13T21:16:38.230Z", "orgUserStorageEquipmentId": "434a6c8a-4e38-4f2e-8e89-0a02e1cf5973", "organizationEquipmentId": undefined}, "message": "Request failed with status code 401", "operation": "Update", "process": "mutate", "recoverySuggestion": "Ensure app code is up to date, auth directives exist and are correct on each model, and that server-side data has not been invalidated by a schema change. If the problem persists, search for or create an issue: https://github.com/aws-amplify/amplify-js/issues", "remoteModel": null}
```

This appears to be an expired key error, but amplify had an issue where using an expired key made it impossible to push a new key. Luckily, making a schema change fixed this.
Create and configure new API Key: [link](https://docs.amplify.aws/gen1/javascript/tools/cli-legacy/config-params/#createapikey)

# 6-15-24:

## Setup Amplify on New Laptop

Today I setup amplify and the Dougu project on a new machine. Right now, i am setting up Amplify again using `amplify configure`. As such, I am also creating a new IAM user with permissions called good-laptop. Now `npx expo start` works!
