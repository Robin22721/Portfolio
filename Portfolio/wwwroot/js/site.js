
// Please see documentation at https://docs.microsoft.com/aspnet/core/client-side/bundling-and-minification
// for details on configuring this project to bundle and minify static web assets.

// Write your JavaScript code.

var toggled = true;
if (screen.width > 768) {
    toggled = false;
}

$("#menu-toggle").click(function (e) {
    toggled = !toggled;
    e.preventDefault();
    $("#toggleIcon").toggleClass("fa fa-angle-double-down fa fa-angle-double-up")

    if (toggled) {
        $('#wrapper').css("margin-left", "-220px")
        $('#sidebar-wrapper').css("margin-left", "-500px")
    } else {
        $('#wrapper').css("margin-left", "-20px")
        $('#sidebar-wrapper').css("margin-left", "-250px")
    }
});

class Tile {
    constructor() {
        this.flagged = false;
    }
}

var tiles = [];
var gridSize = 20;
var totalMines = 60;
var currentMines = 0;
var checkingTiles = [[-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0], [1, 1]];
var colors = ["blue", "green", "red", "navy", "maroon", "cyan", "black", "gray"];

for (var i = 0; i < gridSize; i++) {
    tiles[i] = [];
    for (var j = 0; j < gridSize; j++) {
        tiles[i][j] = [];
        $("#grid").append(`<button class=\"grid-item\" data-coord="${i + "-" + j}"></button>`);
        tiles[i][j][0] = $(".grid-item").get(-1);
        tiles[i][j][1] = new Tile();
    }
}

SetMines();
SetTileNumbers();

//events
$(".grid-item").mousedown(function (event) {
    switch (event.which) {
        case 1:
            RevealTile($(this));
            break;
        case 3:
            PlaceFlag($(this));
            break;
    }
})
$(".grid-container").css({ "width": gridSize * 20, "grid-template-columns": "auto ".repeat(gridSize) });
$(".grid-item").css({ "height": "20px", width: "20px" });

//functions

//this runs whenever you click an unrevealed tile with LMB
function RevealTile(tile) {
    var coord = GetTileCoordinates(tile);
    var tileValue = tiles[coord[0]][coord[1]];
    if (tile[0].getAttribute("disabled")) return;
    if (tileValue[1].flagged) return;
    tile[0].setAttribute("disabled", true);
    if (tileValue[1].number >= 0) {
        tile[0].innerHTML = tileValue[1].number;
        tile[0].classList.remove("black");
    } else {
        var icon = document.createElement("i");
        icon.classList.add("bi", "bi-x-square-fill")
        tile[0].insertBefore(icon, tile[0].children[0]);
    }
    if (tileValue[1].number != 0)
        tile[0].classList.add(colors[tileValue[1].number != -1 ? tileValue[1].number - 1 : 6]);

    if (tileValue[1].number == 0) {
        checkingTiles.forEach(function (v) {
            if (IsAtBorder(coord[0], coord[1], v)) return;
            var tileToCheck = [tiles[coord[0] + v[0]][coord[1] + v[1]][0]];
            RevealTile(tileToCheck);
        })
    }
}

//this runs whenever you click an unrevealed tile with RMB
function PlaceFlag(tile) {
    var coord = GetTileCoordinates(tile);
    var tileValue = tiles[coord[0]][coord[1]];
    if (tileValue[1].flagged) {
        tile.text(" ");
    } else {
        tile.append('<i class="bi bi-flag-fill"></i>').addClass("black");
    }
    tileValue[1].flagged = !tileValue[1].flagged;
}

//gets the coordinates from a tile's data-coord value
function GetTileCoordinates(tile) {
    var coord = tile[0].getAttribute("data-coord").split("-");
    coord = coord.map(function (v) {
        return Number(v);
    });
    return coord;
}

//places mines around the grid
function SetMines() {
    for (var i = 0; i < gridSize; i++) {
        for (var j = 0; j < gridSize; j++) {
            if (currentMines >= totalMines) return;
            var randomNum = Math.floor(Math.random() * gridSize * totalMines)
            if (randomNum > 0) continue;
            if (tiles[i][j][1].number == -1) continue;
            tiles[i][j][1].number = -1;
            currentMines++;
        }
    }
    SetMines();
}

//gives every tile their own number
function SetTileNumbers() {
    for (var i = 0; i < gridSize; i++) {
        for (var j = 0; j < gridSize; j++) {
            if (tiles[i][j][1].number == -1) continue;
            SetAdjacentMines(i, j);
        }
    }
}

//get sum of adjacent mines for said tile
function SetAdjacentMines(i, j) {
    var currentAdjacent = 0;
    checkingTiles.forEach(function (v) {
        //checking borders so it doesnt throw an error
        if (IsAtBorder(i, j, v)) return;
        //see if tile has adjacent mine
        if (tiles[i + v[0]][j + v[1]][1].number == -1) {
            currentAdjacent++;
        }
    })
    tiles[i][j][1].number = currentAdjacent == 0 ? "" : currentAdjacent;
}

//checks if said tile is at a border
function IsAtBorder(i, j, v) {
    if (i + v[0] >= gridSize || i + v[0] < 0) return true;
    if (j + v[1] >= gridSize || j + v[1] < 0) return true;
    return false;
}