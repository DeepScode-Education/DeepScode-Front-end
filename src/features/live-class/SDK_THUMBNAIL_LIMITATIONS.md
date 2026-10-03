Zoom Embedded SDK — thumbnail limitations

Summary
-------
The installed Zoom Meeting Embedded SDK (v6.2.0) used in this project does not expose per-participant video DOM nodes or public APIs to start/stop video or to obtain raw MediaStream elements for individual participants. The SDK exposes a single internal canvas for rendering the meeting and supports pinning/adding a participant to that canvas via `addPin(userId)` / `removeAllPins()`.

Implications for this UI
------------------------
- We cannot render live, detached video thumbnails for each participant outside of the SDK's single canvas. The mobile/desktop filmstrip and right-side rail thus show initials/placeholders rather than true live video elements.
- Promoting a thumbnail to the main stage is implemented by calling the SDK's `addPin(userId)` which causes the SDK's single canvas to show that participant's video.
- Screen-share is still prioritized by listening to the SDK's `active-share-change` event and auto-pinning the sharer via `addPin(userId)`.

Options if you need real thumbnails
----------------------------------
1. Use an SDK build that exposes per-participant MediaStream or video elements (if Zoom offers such a build/APIs).
2. Proxy participant streams through a media server and render them yourself (significant backend effort).
3. Replace with a different video provider that supports detached video elements (e.g., WebRTC-based solution where you control rendering).

Recommendation
--------------
Document this limitation for the team and keep the current UX (initials/placeholders + SDK-driven pinning) unless the product is willing to accept the additional complexity of option 1–3 above.
