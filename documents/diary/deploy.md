# Deployment
This is intended for me to remember the steps I take to build and deploy my applications.

- Make sure the builds work on ios and android devices with npx expo run
- update the version codes on app.json. it can sometimes be stale though, so make sure to run `npx expo prebuild`
    - check /android/app/build.gradle versionCode & versionName on android
    - check /ios/Dougu/info.plist CFBundleVersion and CFBundleShortVersionString on ios
- then, to upload to google play developer or apple developer you can:
    - download .aab from EAS and upload directly to google play developer
    - run `eas submit --platform ios` and allow the build to be sent to apple developer
- from then, I ran closed and internal builds, and proceeded with the steps to submit for review (to publish on appstore)