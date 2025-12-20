# 7-23-24

## DataStoreUtils

### Search and SOrting

Since I am not very familiar with testing, my idea is to build from the ground up with unit -> component -> integration -> e2e tests (that's a lot!). So, I think the best place to start for unit testing using jest would be DataStoreUtils.tsx. Recalling a lesson from an audiobook about the life of Elon Musk, however, before automating testing I would first like to make sure that my DataStoreUtils is actually properly designed. Therefore, I first plan on implementing searching and sorting functionality since that could potentially shape the way I return my data in the utils.

As part of search and sorting, I decided to add react-native-elements for the searchbar. I also believe that it will be valuable in setting upt he overall theming and styles of the project as a whole, since my current CSS is a bit of a mess.

Ultimately, I implemented searching in TeamEquipment.js only, and sorted any members or equipment lists in alphabetical order (ignore upper/lower case). It should also be able to handle special characters.

### Refactoring GraphQL Schema

Similar to how I wanted to implemented searching and sorting, I also came to realize that since I may change the graphQl schema, it may change DataStoreUtils and therefore I should update the schema and fianlize how I want it to work. My current concerns are breaking down OrgUserStorage, handling containers, and implementing custom images.

- I decided to keep OrgUserStorages because there are no interfaces or union types to break it up and ensure equipment always has someone it's assigned to
- I added image fields with strings so that equipment, containers, users, and organizations can have profiles
- I added an audit log model so that all changes in the datastore can be tracked
- Changed from public to private authorization (use AWS Cognito to verify login)
- Want to add owner access and checking int he future\
- `amplify codegen models` -> `amplify push`

# 70-24-24

## DraggableEquipment Bug

There is a strange bug inside DraggableEquipment.tsx where the item prop that is passed in has a correct count of 6 inside of the <EquipmentItem>, but whenever I log it in onPanResponderGrant, it has a count of 2. This was fixed by useEffect logs, but I'm not sure why it happened so I should test and keep a lookout for this.
Notes:

- The problem is fixed on any refresh, suggesting an issue with state
- Whenever more than 1 of the same item is swapped, the 2nd item's count isn't properly updated
- When multiple of the same item are assigned to one user, the count isn't properly updated
  The fix: item was becoming stale inside of PanResponder only. I had to make sure to create an itemRef and keep it updated such that the panResponder only uses itemRef.current.

## Login and Create Bug

Login issues:

- Organization and OrgUserStorages from Datastore isn't being found on first run, but on refresh are
- Happening due to DataStore not being fully synced and ready, so I'm gonna build a homepage loading screen
  The problem: DataStore.clear() and DataStore.start() are long-waiting asynchronous operation, which you can't just await. So I created a loading page and added its handling to loading context.

## Profile Bug
There appears to be a bug where after the very initial login, if the userContext updates too slowly when changing the profileImage, there is an error thrown that datastore query was called during clear. This only occurs if the userContext is slow to update, and on the very first login. Refreshes or faster updates will fix it, I'm not sure why. After further investigation, I believe this is occuring because queries to OrgUserStorage of Amplify are occurring simultaneously. Updating the userContext refreshes the OrgUserStorage, and setting the profile image also changes the OrgUserStorage profiles of that user.

Things to test:

- Create account valid inputs
- Create anything valid inputs
- Integration between swapScreen, draggableEquipment, and draggingOverlay
- DatastoreUtils
-
