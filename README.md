# Project Title

Test Driven Tetris

## Project Overview

### Project Structure - Classes, Helpers, Components, Routes, etc.

```
frontend                  # Wrapping folder for front-end
├── helpers
│   ├── api               # Class for sending messages to backend
│   ├── data              # Constants to define game settings
│   ├── pubSub            # Publish / subscribe helper functions
│   └── utils             # Utilities (e.g. getNewPlayer, getNewBoard)
└── static
    ├── index             # Main html file
    ├── css               
    │   └── style         # Main stylesheet
    └── js
        ├── game          # Manages score, game status, commands, animation
        │   └── board     # Manages board state and pieces
        │       └── piece # Creates and gets new pieces
        ├── gameDOM       # Manages DOM manipulation
        │   └── gameView  # Manages HTML canvas manipulation
        └── main          # Placeholder for event handlers
        

src                       # Wrapping folder for back-end classes
├── helpers
│   ├── api               # Class for sending messages to backend
│   ├── data              # Constants to define game settings
│   ├── pubSub            # Factory function for creating local pub/sub functions
│   └── utils             # Utilities (e.g. getNewPlayer, getNewBoard)
└── js
    └── gameServer        # Manages adding / removing players, sending messages
        └── player        # Associates game with gameServer        
            └── game      # Manages score, game status, executes commands
                └── board         # Manages board state and pieces
                    └── piece     # Creates and gets new pieces

app                       # Backend-routes
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