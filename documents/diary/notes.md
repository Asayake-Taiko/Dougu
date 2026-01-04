- I chose to lazily render the image keys into URIs inside of each equipmentDisplay component. This is to prevent loading all the images from showing the rest of the data.

# Lessons learned
- Separation of components of important. Because I had my headerProfile inside of DrawerNav, it was unnecessarily being re-rendered everytime DrawerNav re-renders.
- IOS and Android caching differs in expo-image implementation. For example, in ` uri: orgSource.uri, cacheKey: imageKey }`, in android, the uri field takes priority. Meanwhile, in ios, the cacheKey takes priority (example even if source changes, if cacheKey is same, the image is same while on android a source change is an image change)