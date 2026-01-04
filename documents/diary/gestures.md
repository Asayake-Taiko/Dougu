# 7-30-24 -> 8-2-2023

Previously, I had a setup where the equipment items would automatically begin dragging everytime a gesture was put over it. However, this would lead to problems with swiping across the scrollview. Especially as I want to add tap functionality and make the equipment items function similar to android or ios apps, I tried to use longPresses and a modified panResponder to get the job done. Unfortunately, panResponder isn't very flexible with layered responders, and therefore I am going to try react-native-gesture-handler.

## React-native-gesture-handler minimal setup

I first started using a basic setup no a temporary screen called TestSwap. For this screen, I simply implemented a scrollview with items that took a long press to start dragging, and could respond to tap events. React-native-gesture-handler actually made the functionality much easier than expected, and it didn't take too long to figure it out. The biggest timesaver was the states emitted by the handlers, especially 'active'. By using the active state from long press, I could ensure the user kept their finger on the item for the specified time before starting the panresponder (no more need to use a timeout).

## Integrating RNGH

Integrating wasn't difficult, though I learned that I needed to specify "worklet" for passed functions called by Gesture. Basically, if I run Gestures on the UI thread, the functions called by the gesture also needs to run on the UI thread. Bringing everything together actually took much longer than I expected, due to learning about UI and Javascript threads. I learned that I had to update the itemReference on a javascript thread, while handling animations and transformation offsets on the UI thread. This took a while to figure out, but once it got working, the code was so much nicer than what I used to have. Right now, I am working out a problem with swapUser not being updated, but that's something I plan to finish tackling tomorrow.

## Stale States

One problem I had a lot of issues with was stale states, especially with references. The first one was with swapUser.current not being up to date, and me being unable to update it, even inside of handleSet when the inputUser was logged correctly. The problem was that swapUser.current was referenced inside the worklet of handleFinalize(), where since it runs on the UI, it shouldn't be able to access swapUser. So even though there were no errors, it was likely messing up swapUser.current. I fixed this by having a JS specific function for reassigning. Additionally, when testing swapping, I noticed that the counts wouldn't update properly for the items. Funnily enough, fixing this issue took me removing the itemRef from draggableEquipment. I think this happens because RNGH is an overhaul of pan responder and likely doesn't have stale item state like the native version, so that me intentionally inserting an itemRef means it wouldn't update across re-renders. Right now, I have a pretty stable version, but I want to write some tests to ensure this won't happen again.

## Equipment Item Selection

One idea I wanted to implement was that by tapping on an item, just like opening an app, it would display a screen of information and details. The overlay and passing information wasn't difficult, but implementing a system to select which equipmentID would be swapped was more difficult. This was because an equipmentItem could be tapped on multiple screens, and each screen would subscribe to equipment changes. TO fix this, I decided to overhaul the equipment system by having an equipment provider that would subscribe to equipment changes and pass that data down to the screens. It should be faster and simpler. Also, I setup selecting a specific equipment ID that you may want to swap with, in preparation for nfc tag reading and also just overall customizability. It does so by modifying the shared equipmentData context, which is shared across all screens (and the screens directly use the data). While the saved customization goes away on any refresh, it still works and I think making it stay across various refreshes is too extra.

P.s: I ran into createOrg issues while testing, turns out userContext was trying to update OrgUserStorage during the clear. So I fixed validation and synchronization issues. Also, I wrote some tests for validating createOrg.

# 8-5-24

## Hover Change Page

I incorporated functionality to detect whether an equipment or container has been hovered on an edge of the screen, and to change the page of the screen. Here are a couple changes

- Changed scrollview from per item snapToAlign to per screenWidth snap to align (or every 4 items). This was because an automatic scroll per item would require many small scrollTos that are computationally expensive
- Implemented another JS threaded callback during pan onChange to check for hovering on edges, and to start a timeout if there has been an extended hover
  For the future, I need to implement some sort of UI to show that the page is able to turn.

# 8-10-24 -> 8-12-24

## Breaking down SwapEquipment

After my previous failed attempt to breaking down swapEquipment, I began to take it seriously this time and learned about the usage of custom hook components in react. Being able to easily create components that accept state and output state makes it much easier to break down a large file. While my break down of swap Equipment isn't going to be perfectly designed, it will help a lot with maintanability. I broke SwapGestures down into:

- useAnimateOverlay
- useItemCounts
- useScroll
- useHover
- useSet
  Ultimately, I have broken the file down, but I definitely believe there is a need for future refactoring. This is because when I wrote the code, I didn't write it with modularity and having each hook handle a specific state in mind. Therefore, a lot of the hooks are interdependent and quite bulky still. In the interest of patience and motivation, I will save this for a later date though.
