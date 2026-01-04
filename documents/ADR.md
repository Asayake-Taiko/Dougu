# Architectural Decision Record:

- Chose react-native as the main framework due to my past experience with react
- AWS and Amplify are both valuable skills with powerful integration with react native, so I chose it as my backend
- Expo Go is beginner-friendly, especially with deploying the app, which is why I use it
- Chose to utilize github organizations for its project feature, since from CSE110 it was a helpful way to keep track of tasks to accomplish
- I chose to add Sentry to the project in anticipation for when the app is pre-released for Asa Members to test. Sentry should allow all errors, whether on Apple or Android, to come towards a central location in Sentry.io.
- Sentry is temporarily removed due to causing runtime issues when it was enabled that didn't previously exist. Due to a large time constraint, sentry is temporarily put on hold.
- Decided to add ESLint to solidify naming conventions and coding styles, as I occasionally have issues with that. It also helps to cleanup code.
- Added Prettier for cleaner syntax that is easily configured
- Added TypeScript due to type ambiguity, especially during DataStore calls. Since this is a relatively large-scale app, I decided TypeScript's reliability would be beneficial.
- Jest is an important tool for unit and integrated tests. Testing is very important to ensure code quality.
- For my UI components and themes, I have decided to use react-native-elements. It appears to have the best documentation and overall look to the components I need. And I want to use its theming feature as my current CSS is hard-coded and disorganized.
- Instead of utilizing SVGs for equipment images, I chose to use pngs due to the lack of react-native support and the performance issues from multiple SVGs.
