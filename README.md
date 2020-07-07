![Screenshot of Gameplay](https://github.com/GroverW/test-driven-tetris/blob/master/gameplayscreen.png?raw=true)

# Test Driven Tetris

## Project Overview

### Project Structure - Classes, Helpers, Components, Routes, etc.

```
common                              # Wrapping folder for common js files
├── helpers
│   ├── constants                   # Constants to define game settings
│   └── utils                       # Utilities (randomize, getEmptyBoard)
└── js
    ├── Game                        # Base game class used by frontend and backend
    │   └── Board                   # Base board class used by frontend and backend
    │       └── Piece               # Creates and gets new pieces
    ├── GameLoop                    # Manages animation of client side commands
    └── ClientMessage               # Manages the display of flash messages for errors / notices

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
        ├── ClientGame              # Manages score, commands, etc. (extends common Game class)
        │   ├── Command             # Object sent by ClientGame to GameLoop to be executed
        │   ├── Gravity             # Manages automatic dropping of current piece
        │   └── ClientBoard         # Manages board state and pieces (extends common Board class)
        ├── GameDOM                 # Manages DOM manipulation
        │   └── GameView            # Manages HTML canvas manipulation
        ├── GameLoop                # Manages animation of client side commands
        └── main                    # Placeholder for event handlers
        

src                                 # Wrapping folder for back-end classes
├── helpers
│   ├── serverConstants             # Constants specific to server
│   └── pubSub                      # Factory function for creating local pub/sub functions
└── js
    └── GameServer                  # Manages adding / removing players, sending messages
        └── Player                  # Associates game with gameServer        
            └── ServerGame          # Manages score, executes commands, etc (extends common Game class)
                └── ServerBoard     # Manages board state and pieces (extends common Board class)

app                                 # Backend-routes
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
npx webpack --mode="<MODE>"
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
jest
```

## Built With

* [Node Packet Manager](https://www.npmjs.com/) - Dependency Management

## Authors

* **Will Grover** - [GroverW](https://github.com/GroverW)