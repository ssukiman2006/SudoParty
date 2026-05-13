# Sudoparty

Sudoparty is a multiplayer Sudoku party game where friends can create a room, join from different devices, and race to solve the same puzzle in real time.

The project turns a usually solo puzzle into a social game: everyone in one room gets the same Sudoku board, progress is synced live, and the first player to complete the puzzle wins. After the game, the app shows a winner screen, leaderboard, and a funny punishment for the party.

## Who It Is For

Sudoparty is made for people who want a quick shared game without complicated setup:

- friends hanging out in the same room
- classmates or students practicing logic together
- families who want a casual browser game
- party groups who want something competitive but simple
- anyone who wants to play Sudoku on desktop and phone at the same time

The game works well when one person creates a room on a laptop and other players join from their phones using the room code.

## Why It Is Valuable

Traditional Sudoku is usually quiet and individual. Sudoparty makes it more social, competitive, and fun.

The value of the project is that it combines:

- real-time multiplayer rooms
- the same puzzle for every player in a room
- mobile-friendly gameplay
- no login requirement
- simple room codes
- visible progress for every player
- a playful party theme with punishments and upgrades

This makes the game easy to start, easy to share, and fun to play across multiple devices.

## Main Features

### Room Creation

Players can create a new game room by entering a name, choosing a color, and selecting a Sudoku difficulty.

When a room is created, the app generates a unique room code. Other players can use this code to join the same room.

### Join From Different Devices

Players can join the same room from:

- another browser tab
- another laptop
- a phone on the same network
- multiple phones at the same time

This means the game can be tested and played across desktop and mobile devices. For local testing, players can open the network URL shown by the Next.js dev server on their phone.

### Same Sudoku For Everyone

Every player in a room receives the exact same Sudoku puzzle.

The puzzle is selected when the room is created and saved in Firebase with the room data. This prevents each player from accidentally getting a different board.

### Difficulty Levels

The game includes four difficulty categories:

- Easy
- Medium
- Hard
- Chaos

Each category has multiple Sudoku puzzles, so games do not always repeat the same board.

### Real-Time Progress

Player progress is synced live through Firebase.

Each player can see how far others have progressed, which makes the game feel like a race instead of a solo puzzle.

### Leaderboard And Winner Screen

When a player finishes the puzzle, the game ends and shows:

- the winner
- player progress percentages
- leaderboard ranking
- total time
- mistakes
- party punishment

The leaderboard preserves each player's real progress, so losing players do not incorrectly show as 100%.

### Mobile Support

Sudoparty is designed to work on phones.

The create and join flows use mobile-friendly form behavior, and the layout supports scrolling on smaller screens. This allows users to create rooms, join rooms, choose colors, select difficulty, and play from a phone browser.

### Punishment Mode And Pro Upgrade

The lobby includes a Punishment Mode section.

Funny mode is available by default. Evil mode is locked as a Pro feature. When a user taps Evil mode, the app shows an upgrade modal with options to close it or open the Pro upgrade page.

### Pro Upgrade Page

The project includes an upgrade page that presents paid-feature ideas such as:

- Evil punishment mode
- custom punishments
- extra room themes
- advanced party features

## Tech Stack

- Next.js
- React
- TypeScript
- Tailwind CSS
- Firebase Realtime Database

## Project Structure

Important files:

- `app/page.tsx` - landing page
- `app/room/create/page.tsx` - create room flow
- `app/room/join/page.tsx` - join room flow
- `app/room/[code]/lobby/page.tsx` - room lobby
- `app/room/[code]/game/page.tsx` - Sudoku game screen
- `app/room/[code]/win/page.tsx` - winner and leaderboard screen
- `lib/roomService.ts` - Firebase room logic
- `lib/sudokuPuzzle.ts` - Sudoku puzzle bank
- `lib/roomStorage.ts` - local room and win summary storage

## Running Locally

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Open the local URL in a browser:

```text
http://localhost:3000
```

If port 3000 is already busy, Next.js may start on another port such as:

```text
http://localhost:3001
```

## Testing On A Phone

To test Sudoparty on a phone:

1. Make sure the phone and laptop are on the same Wi-Fi network.
2. Start the dev server with `npm run dev`.
3. In the terminal, find the `Network` URL shown by Next.js.
4. Open that URL in the phone browser.

Example:

```text
http://192.168.1.23:3000
```

If Next.js blocks the phone as a development origin, add the phone IP to `allowedDevOrigins` in `next.config.ts`, restart the dev server, and reopen the page on the phone.

## Current Status

Sudoparty currently supports the full basic multiplayer flow:

1. Create a room.
2. Join the room from another device.
3. Start the game.
4. Solve the same Sudoku puzzle.
5. Track live progress.
6. Show the winner and leaderboard.
7. Display a party punishment.

The project is ready for local multiplayer testing on desktop and mobile browsers.
