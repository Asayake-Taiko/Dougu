# 6-16-24:

## Fix Project Directory Structure

I chose to move all the javascript files into /src, such that all project folders can be contained within one directory instead of across the project root. As such, I needed to modify package.json main such that instead of using node_modules/expo/AppEntry.js it uses ./src/App.js. Changing directory structure also required fixing some imports of files.

# 6-19-24:

## Refactoring Context

Currently, I notice that the current method of getting the current user, organization, and userorganization involves a convolued process like so:

```
const user = await Auth.currentAuthenticatedUser();
const key = user.attributes.sub + ' currOrg';
const org = await AsyncStorage.getItem(key);
const orgJSON = JSON.parse(org);
const dataOrg = await DataStore.query(Organization, orgJSON.id);
const orgUserStorage = await DataStore.query(OrgUserStorage, assignUser.id);
```

I think that instead, I'm going to create a userContext that keeps track of userId, orgId, and orgUserStorageId that listens for Auth firing events. Then, I can simply use those ids to query from DataStore. Also, storing userId + 'currOrg' and userId + 'currOrgUser' should hopefully help me keep track of the necessary variables for use with offline sync. Amplify keeps track of user, I will keep track of currOrg and currOrgUser.

# 6-24-24

## Planning for refactoring helper functions

I realized that before I create a userContext, I should first look at how I'm going to modularize and simplify the Datastore functions. So I compiled them into Storage.js for now, where I plan to split it up into Equipment, Organization, Storage, and basically one for each module. I also want to centralize Error Handling, where I found [this article](https://medium.com/@jimmyalbert/handle-errors-in-react-native-897713baf166) explaining how I might do so. Definitely sending error messages to a service like Sentry would be pretty nice.

# 6-27-24

## Adding Sentry

Sentry has now been added to the application, such that any errors on devices can be sent to a more central location. Managing both Apple and Android can be tough, so I think this will be helpful when I release the app to others. Currently Sentry is only setup on login.js, as I need to have Sentry capture the exception too.

# 7-8-24

## Directory and Context change

First, I chose to try to simplify the directory structure of the application by grouping similar sections. I decided to group /Member as all MemberTabs screens pertaining to the individual, and /Organization for Organization information that is more geared towards the manager. This is part of my overall goal of a cleaner project structure. Future improvements are planned for the components directory.

After contemplation, I decided to try using the UserContext idea I've already had. While I considered using Redux or events, I think the userContext only truly needs the 3 variables: user, org, userOrg, so it's best not to overcomplicate. Therefore, I got to work implementing it into Login.js, CreateAcc.js, DrawerNav.js, HomeScreen.js, and App.js.

# 7-15-24

## Further Context Changes

My guiding principle right now is to make it so that **any screens in /Member or /Organization should have user, org, and userOrg context updated**. They should not have to worry about setting or updating those values. And **any screens in /drawer should have user updated, that the user should already be logged in**.

Also, to organize the /components directory, I chose to have it mirror /screens in that there is also a /member and /organization where any components in /components/member are used in /screens/member. Any components not in these are global components.

# 7-16-24

## Context and Pages

- I decided to have UserContext automatically handle updating the orgUserStorage on its own side, so that the context handles its own functionality.
- I created a custom error handler for greater clarity or error origin and avoiding redundancy
- Broke down large functions into smaller chunks for JoinOrgScreen and CreateOrgScreen

Potential Future Things to Add:
[Adding TypeScript](https://reactnative.dev/docs/typescript?package-manager=npm)
[Adding ESLint](https://eslint.org/docs/latest/use/getting-started)
[Testing](https://reactnative.dev/docs/testing-overview)

# 7-17-24

## TypeScript

In order to remove ambiguity in objects, I decided to add TypeScript for the entire app. This initiated a couple of key changes, especially in defining types for navigators in react-native-navigation and for contexts (LoadingContext, UserContext).

When working on types for Contexts, I created custom ContextTypes with fields for each of the values they provide. Additionally, each context's use hook (useLoad, useUser) had a check to ensure a non-null context. By doing so, it ensured that the fields the contexts distributes are reliable.

When working on Typing for react-native-navigation, I first had to create a custom type for each navigator. Then, each screen also contains a custom type that the navigator prop in the screen file imports. It makes `navigation.navigate()` a little more complex, but it is a good way to ensure all the paths are valid at compile-time.

## EsLint and Prettier

As static checkers for code style and quality, I decided to add Eslint and Prettier. This is starting to get complex, so I will try to slow down adding more, but I felt that it was worth it after seeing the recommendations they give. It also works conveniently well with expo go and VS Code. I followed this [procedure](https://docs.expo.dev/guides/using-eslint/). Things work pretty well, and to run from the command line, you can also just do `npx expo lint` and `npx prettier --write .` to run eslint and prettier, respectively.

# 7-18-24

# Typescript

I learned that composite screen props are necessary for nested navigators if you want to navigation.navigate to a screen only in the parent navigator not directly accessible from your current navigator. If you don't need to access the parent, don't use composite.

I noticed that when querying for an OrgUserStorage, the requirements

```
c.and((c) => [
          c.organization.name.eq(org.name),
          c.user.userId.eq(user.attributes.sub),
        ]),
```

isn't always enough, and that you may still need to specify USER or STORAGE as storages are created using the user's ID. I don't think this is the best approach, and a future refactor may be to change it from OrgUserStorage -> OrgUser and OrgStorage. I originally wanted to keep Users and Storages together to minimize API calls, but I think it would be cleaner overall to separate them, especially with the current confusion and the fact that user's of the app shouldn't be the same as a storage location anyway.

Today if inished refactoring all screens in DrawerNav.

Currently working on an issue with CurrMembersDropdown and SwapEquipment, stemming from a problem with SwapUser.current reference. They seem to be misaligned, and the CurrMembersDropdown is unmounting at different times than SwapEquipment, leading to issues.

# 7-19-24 to 7-21-24

## Swap Equipment

Swap Equipment is the most difficult screen to break down, simply because it relies on handling all the equipment and overlay calculations on the same screen. My main refactoring for now is just to setup a dragging overlay component and try to simplify the code, in the interest of not wasting all my time trying to find a perfect solution.

After finally refactoring the code, I realized the previous problem I had with the equipment being dragged despite not being touched was that the AnimatedView was getting too large, so I had to hardcode some values. Additionally, I now believe it would be better to do dragging functionality by first having the user hold on a circle for 1-2 seconds before it is then dragged, similar to apps on a phone. That should make horizontal scrolling much smoother.

## Indicator

For fun, I changed the look of the loading indicator. I chose to use the design by Hiroto Kakitani on the old Asayake Taiko website, not big reason other than nostalgia and I liked the look of it.

## Organization Directory

The organizations directory was very simple and didn't take too long to refactor. One thing I realized during an attempt to refactor the organizations into another nested stack navigator was that it really wasn't necessary, as there would be overlapping headers and unnecessary nesting. I am not completely done with this directory though, as:

# 7-22-2924

## Refactor Organizations Directory

After a lot of debate with myself, I decided to add another nested stack navigator inside of membersTabs for the OrgInfo section. The reasoning for this was that if the orgInfo screens were part of the RootStackNavigator, then popping from OrgInfo always brings you back to MembersTabs: Equipment, since the parent navigator handles it so a custom back button can't be used. It also makes more sense to me in terms of the flow of the app, though now the app is a little more nested than I would like: rootStack -> drawer -> materialTopTabs -> orgStack.

Other than that, I refactored the organizations directory. Even though I didn't change it too much, it is nice to implement static checking and simplify the code.

## Conclusion

Overall, this concludes the refactoring of the code for now. While there are mroe simplifications or better logic I'm sure that could be made, my main focus for now will be adding testing, more features, and fixing up the graphQL schema.

These links seem important for linking native nfc scanner with my app:
[Custom Native Code](https://docs.expo.dev/workflow/customizing/)  
[Example](https://docs.expo.dev/modules/native-module-tutorial/)
