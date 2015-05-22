// Required modules
var _ = require("underscore");
var express = require("express");
var app = express();
var http = require("http").Server(app);
var io = require("socket.io")(http);
var gameManager = require("./gameManager.js");

// Appropriate port number for Doom related, right?
var port = process.env.PORT || 666;

http.listen(port, function () {
    console.log("Listening on *:" + port);
});

// Provide resources
app.use(express.static(__dirname + "/public"));
app.get("/", function (req, res) {
    res.sendFile(__dirname + "/index.html");
});

// To keep track of clients
var clients = [];

io.sockets.on("connection", function (socket) {
    // Add a new client
    addClient(socket);

    // Someone kills an enemy
    socket.on("enemyHit", function (enemyId) {
        gameManager.onEnemyHit(enemyId);
    });
    
    // Someone goes offline
    socket.on("disconnect", function () {
        removeClient(socket);
    });
});

/**
 * Adds a client in the list.
 */
function addClient(socket) {
    clients.push(socket);
    gameManager.addPlayer();
}

/**
 * Removes a client from the list.
 */
function removeClient(socket) {
    delete clients[clients.indexOf(socket)];
    gameManager.removePlayer();
}

// Start the game and send frequent updates to the clients
gameManager.start();
gameManager.onUpdate = function (gameState) {
    io.emit("update", gameState);
};
