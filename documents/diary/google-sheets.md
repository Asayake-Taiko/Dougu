# 8-15-24
## Getting CSV Data
Today, I setup a system to get the CSV data format that I want to write to google sheets. In the interest of keeping my code simple and consistent, I plan on rewriting the entire spreadsheet on every update, as an organization's data shouldn't be any larger than 2MB, which is free.

## Google Service Account
After some deliberation, I think my best approach is to create a google service account that will store all the spreadsheets for the organizations in a single drive. This is so that the users won't have to allow google access everytime they use the app, while also keeping the data updated regardless of who makes data changes. My plan is to call an AWS lambda function that requires AWS Cognito tokens to call the service account and make the relevant API calls. Today, I setup creating a very basic spreadsheet though. I simply utilized the service account key and called it locally using the google-auth-library for now. Definitely not going to keep it so local though. `export GOOGLE_APPLICATION_CREDENTIALS="C:\Users\kanel\Documents\GitHub\Dougu\lambda\nodejs\asa-app-417920-ddf937c90832.json"`

## Not implementing
After playing around with lambda functions and a lot of deliberation, I ultimately decided not to incorporate google sheets for now. My main reasoning for this is simply because of the unnecessary complexity it would take to implement for the small amounts of improved customization and sharing. First of all, managing an entire google cloud account with keys and credentials creates further vulnerabilities and costs if the system was to scale up. Additionally, I would need to sync up the sheets to the serverside, meaning that every time the online data was modified, I would have to run some sort of lambda function to update the respective google sheet for the user. But in doing so, I feel as though it can become easy for numbers to become incorrect, lose track of indexes, or even face issues if the user changes the sheet formatting around. And all this is really for a minimal amount of customization and cleaner UI. If I were to implement this system, however, I would likely setup dynamoDB triggers for OrgUserStorages, Equipment, and Containers. I would also create a new table model called spreadsheet, which keeps track of an organization's spreadsheetID, headers, and row labels. Every time one of the models changed, I would then find the respective cell and modify it in the spreadsheet.

## Things I learned
- Oauth2 is a community/group standard that can be used to manage user tokens
- utilize a service account if you want to have an organization google account that creates files, etc.
- AWS Lambda is more vulnerable than one might expect, even on the server don't store credentials

## Implementing a sheet in react native
There is no easy build-in implementation of creating a table sheet with a frozen row and a frozen column, but luckily I found a solution [here](https://build.affinity.co/building-a-highly-responsive-sheet-view-with-react-native-51129ec34c63). That works pretty well. 