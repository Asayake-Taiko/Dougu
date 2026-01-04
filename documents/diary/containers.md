# 8-3-24 -> 8-9-24

## Displaying Containers

Containers are very similar to folders on the app store, and so today I setup a system to create containers and have it be rendered. After creating a quick method to create containers, I had to overhaul the current equipmentItem context and system of distributing data. Since I valued having a generic item class that encompasses both equipment and container for dragging reusability and sorting items by their label, I created an Item interface. Then, I changed the equipment context to distribute a map of Items rather than of just Equipment. Therefore, on render, all I would need to do is check the item.type and then decide whether to render an equipmentItem or container.

## Container Styling

Over the container overlay, I came to notice that implementing blur is very difficult due to troubles with Android, so I likely will not be implementing it. Additionally, I decided to merge the overlay as part of the container item itself for now instead of having a separated title as in most apps due to the added complexity of creating a custom overlay component. For now, I want to focus more on the gestures of containers.

## Detecting Containers and Opening Modals

After a lot of thought and contemplation, I figured out a way to track if a user has hovered over a modal for an extended period of time. In the interest of trying to keep the process efficient, I first setup a layout where the screen will only show 4 items at a time, spaced equally apart. And the scrollview locks such that the four items are always in the same place. Then, I keep track of the horizontal offset and calculate which square the current hover is in by doing ceiling((x + horizontalOffset) / scrollOffset). And so, by keeping tracking of which grid squares are active through onLayout, I can quickly check if the user is currently over a container square.

Instead of opening the modal, for simplicity's sake I chose to just have the overlay shrink when it hovers over a container it can be placed into. I am starting to get worried about the complexity and performance of my code, because while it's smooth on my test phone, I believe that it may start to struggle against slower models. There are just a lot of calculations.

## Reassignments and Assignments

In order to setup assigning equipment, reassigning equipment, and reassigning containers, I had to write out all the possible combinations in order to find an efficient way to break it down. Additionally, I was having a lot of trouble with the schema, especially with the @hasMany and @belongsTo. Ultimately, I chose to remove that relationship, and I have gotten swapping working (or so I believe).

- @hasMany and @belongsTo was swapped in favor of a one-direction equipment -containerId-> container. I am only worried a little about the speed of querying equipment that belongs to a container, but I only need to do that query for swapping
- The overall swap logic is that: if an equipment goes to a container, it takes on the container's assignedTo. Every other case now requires a swap from one user to the other. Therefore, I then just check for this case, determine who is being swapped to, and reassign the respective item to the recipient.
- I think that mutations, queries, and subscriptions inside /graphql aren't being auto generated? Because new files are bieng generated in workspace root, and /graphql files aren't changing
- SET ID STRINGS TO ID TYPE IN THE FUTURE WHEN WE ADD PROFILE TYPING

## Bug Fixing and Container UI

Issues:

- non-container position was being recognized as a container, cause is that the map isn't being cleared whent he equipment changes
- automatic scroll isn't moving to the next page, not sure when or how to reproduce. However, I believe it occurs when nextTop/BottomPage is already set to the next page (for ex. currPage = 0, want to move right, but next Page is already 1). I addressed this by making sure to keep nextPage = currPage when not scrolling
- containerItem is always null, so you can't add equipment to containers, cause is that determine scroll page setting currItem to null while hovering
- grabbing an equipment, auto scroll to a different page, hover over a container on the edge, and autoscroll back keeps the dragging equipment location keeps it minimized and connected to the container item it was previously hovering over. Cause is that the timeouts were stale because I wasn't using a reference.
- after swapping equipment, spots which used to hold containers would still act as though containers were there. Cause was that maps weren't being reset between swaps, so handle reassign now clears the respective map
- 2 chappa items of different descriptions create duplicates. Cause: I forgot to update the key variable in process equipment.
- after adding an equipment to a container I can no longer add equipment to containers for that section. The caues is that the map was being reset, but the layout wasn't changed, so the map wasn't updated. To fix this, I had the map set both containers and equipment, and check that the position is in range and that the map item is a container

Overall, I fixed a lot of bugs and changed up the logic to make it much cleaner. Additionally, now containers will display items inside of it and allow users to see the items. Moving forward, I notice small amounts of lag that I would like to speed up, as well as adding a page indicator for the swap equipment and container items. I also still need to implement dragging an equipmentItem out of a container.

Speedup ideas:

- useMemo for equipmentUtils
- useMemo for Dimensions calculations, especially for styles
- removing render functions (this creates a new function on every render)
- change scrollview to flatlist (though flatlist isn't compatible with gesture handler :/)
- context provider for Dimensions calculations in styling

## SwapContainerOverlay

Because the container overlay on the swap screen needs to have access to gestures in a way the other screens don't, I decided to create a separate overlay for this. This allowed me to insert it into swap equipmentScreen and pass it the functions to handle the panrespodners. And while this works great, the biggest problem is that when the modal closes, the draggable equipment items are no longer rendered and the panresponder closes. This is quite a big problem, and I don't really know if it's a great solution to simply set opacity of everything to zero and keep the modal. I am likely going to try to play with a new way of setting up a pan responder on the screen level to better handle the complex gestures that occur.

## SwapEquipment Refactor

After realizing that a better design would be to have a panGesture handler at the screen level isntead of at the item level, I now plan on rewriting the swapEquipment setup to utilize this new strategy. This requires some pretty big changes:

- panPressGesture is now at screen level, the order in which you nest your JSX elements matters a lot for gesture handling!
- equipmentItem counts are now stored using state and updated by the grid
- containerOverlay is part of the swapEquipment screen such that screen gestures are detected while it is visible
- Reassign equipment is simplified such that the util functions in SwapUtils handle special cases, swapGestures just calls them.

## Finishing and Cleaning

Ultimately, swapGestures is complete, but it is very bulky. Over time, I hope to break it into smaller components and test it's functionality. Additionally, I need to add animations for opening the container.
