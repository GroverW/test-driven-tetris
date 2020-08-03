![Screenshot of Gameplay](https://github.com/GroverW/test-driven-tetris/blob/master/gameplayscreen.png?raw=true)

# Test Driven Tetris

[Try it Out! (Heroku)](https://test-driven-tetris.herokuapp.com)

## Project Overview

[![Maintainability](https://api.codeclimate.com/v1/badges/873cb57f3d83094c75cd/maintainability)](https://codeclimate.com/github/GroverW/test-driven-tetris/maintainability)
[![Test Coverage](https://api.codeclimate.com/v1/badges/873cb57f3d83094c75cd/test_coverage)](https://codeclimate.com/github/GroverW/test-driven-tetris/test_coverage)

### Project Summary

Test-Driven, Multiplayer Tetris written in JavaScript. This project is an ongoing exploration of different concepts, technologies and design patterns:
- websockets
- TDD
- mocking
- publish / subscribe
- other Object Oriented design patterns

### Project Structure - Classes, Helpers, Components, Routes, etc.

```
common                              # Wrapping folder for common js files
├── helpers
│   ├── constants                   # Constants to define game settings
│   └── utils                       # Utilities (randomize, getEmptyBoard)
└── js
    ├── SubscriberBase              # All subscribers inherit from this class
    └── Game                        # Base game class used by frontend and backend
        └── Board                   # Base board class used by frontend and backend
            └── Piece               # Creates and gets new pieces

frontend                            # Wrapping folder for front-end
├── helpers
│   ├── api                         # Class for sending messages to backend
│   ├── clientConstants             # Constants specific to client
│   ├── pubSub                      # Publish / subscribe helper functions
│   ├── DOMSelectors                # Game and Menu DOM selectors
│   ├── gameFunctions               # Create and Connect to game
│   └── clientUtils                 # Utilities (e.g. getNewPlayer, getNewBoard)
└── static
    ├── index                       # Main html file
    ├── css
    │   └── style                   # Main stylesheet
    └── js
        ├── ClientGame              # Manages score, commands, etc.
        │   ├── Command             # Object sent by ClientGame to GameLoop to be executed
        │   ├── Gravity             # Manages automatic dropping of current piece
        │   └── ClientBoard         # Manages board state and pieces
        ├── GameDOM                 # Manages DOM manipulation
        │   └── GameView            # Manages HTML canvas manipulation
        ├── GameLoop                # Manages animation of client side commands
        ├── ClientMessage           # Manages the display of flash messages
        └── main                    # Placeholder for event handlers


src                                 # Wrapping folder for back-end classes
├── middleware
│   └── wsRouteValidation           # validates requests to connect to websocket
├── routes
│   ├── games                       # POST / GET games
│   └── gameWs                      # server-side websocket
├── helpers
│   ├── serverConstants             # Constants specific to server
│   └── pubSub                      # Factory function for creating local pub/sub objects
└── js
    └── GameServer                  # Adds / removes and retrieves games from the server
        └── GameRoom                # Adds / removes players from the current game
            ├── PlayerManager       # Manages the current player list
            ├── GameManager         # Starts / stops / syncs the current game
            │   └── MessageManager  # Handles sending / formatting messages to clients
            └── Player              # Associates game with game room
                └── ServerGame      # Manages score, executes commands, etc
                    └── ServerBoard # Manages board state and piece
```

### Class Inheritance Structure
```
SubscriberBase
├── Game                            # Common Game class
│   ├── ClientGame
│   └── ServerGame
├── GameDOM
├── GameView
├── GameLoop
└── Gravity
```

### Technologies Used

1. Vanilla JS for front-end views
2. Webpack for bundling front-end
3. Axios for making API calls
4. Node / Express back-end
5. Express-ws for utilizing Websockets

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

What things you need to install the software and how to install them

* Make that you have Node.js and npm installed.
* No database required.

### Installing

Simply clone this repository

```
git clone git@github.com:GroverW/test-driven-tetris.git
```

Then, from inside the root directory run

```
npm install
```

And you should be good to go!

### Bundling the Frontend with Webpack

From the root directory, run the following command

```
npx webpack --watach --mode="development"
```

Where mode is your desired build process (e.g. development).

### Starting The Backend

From the root directory, run the following command

```
nodemon --watch src server.js
```

The backend will be automatically restarted on save.

## Running the tests

To run unit-tests - from the root directory, run the following command:
```
npm test
```

## Built With

* [Node Packet Manager](https://www.npmjs.com/) - Dependency Management

## Authors

* **Will Grover** - [GroverW](https://github.com/GroverW)