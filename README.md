# Swipe to Archive

A swipe-to-archive gesture UI built with React Native, Expo, and Reanimated.

<div align="center">
  <img src="./swipe-to-archive-demo.gif" width="400" alt="Demo" />
</div>

## How it works

Swipe any email card to the left to archive it. A toast appears at the bottom with an **Undo** button that restores the email to its original position in the list.

- Swipe left past the threshold to archive.
- Release early and the card snaps back smoothly.
- Tap **Undo** within 2.5 seconds to restore the item.

## Gesture Handling

The pan gesture prioritizes vertical scrolling so that it doesn't conflict with normal list movement:

```ts
Gesture.Pan()
  .activeOffsetX([-12, -1]) // only activates on a clear leftward drag
  .failOffsetY([-6, 6]); // yields to ScrollView if vertical movement comes first
```

## Quick Start

```bash
bun install
bun run start
```
