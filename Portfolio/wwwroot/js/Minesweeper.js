class Tile {
    constructor() {
        this.flagged = false;
    }
}

// Will store the tiles
var tiles = [];
// Size of the grid in both x and y
var gridSizeX;
var gridSizeY;
// Amount of mines on the grid
var totalMines;

// Keeps track of how many mines there are on the grid when making mines
var currentMines = 0;
// Used for checking adjacent tiles
var checkingTiles = [[-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0], [1, 1]];
// Colors for the numbers
var colors = ["blue", "green", "red", "navy", "maroon", "cyan", "black", "gray"];

// Touching variables

// Finger start x/y
var startX, startY;
// The current mouse/touchevent
var thisEvent;
// Made so you can't reveal a tile when you flagged it
var placedFlag = false;

// Create a grid upon opening the page
CreateGrid();

// Events

// Whenever a mouse button or tap has been pressed, either reveal a tile or place a flag. Also places a flag if lmb/tap is held for 300 ms
function CallEvents() {
    $(".grid-item").on("mousedown touchstart", function (event) {
        if (event.touches != null) {
            startX = event.touches[0].clientX;
            startY = event.touches[0].clientY;
        }
        thisEvent = $(this);
        switch (event.which) {
            case 0:
            case 1:
                clearTimeout(thisEvent.downTimer);
                thisEvent.downTimer = setTimeout(function () {
                    placedFlag = true;
                    PlaceFlag(thisEvent);
                }, 400)
                break;
            case 3:
                PlaceFlag(thisEvent);
                break;
        }
    }).on("mouseup touchend", function (event) {
        clearTimeout(thisEvent.downTimer);
        if (placedFlag || event.which != 1) {
            placedFlag = false;
            return;
        }
        RevealTile(thisEvent);
    }).on("touchmove", function (event) {
        var currentX = event.touches[0].clientX;
        var currentY = event.touches[0].clientY;

        // Calculate the distance between the start and current touch positions
        var distance = Math.sqrt(Math.pow(currentX - startX, 2) + Math.pow(currentY - startY, 2));

        // If the distance exceeds a threshold, consider it as scrolling action
        if (distance > 30) {
            scrolling = true;
            clearTimeout(thisEvent.downTimer);
        }
    });

    $(".grid-container").css({ "width": Math.min(screen.width - 100, gridSizeX * 20), "grid-template-columns": "auto ".repeat(gridSizeX) });
    $(".grid-item").css({ "height": "20px", width: "20px" });
}

$(".make-grid").on("click", function () {
    CreateGrid();
});

$(document).ready(function () {

    // Check element size on window resize
    $(window).on('resize', function () {
        checkElementSize();
    });
});

// Functions

// Sets scrollbars on the grid if the grid exceeds max lengths
function checkElementSize() {
    var element = $('.grid-container');
    var viewportHeight = $(window).height();
    var elementHeight = element.outerHeight();
    var elementWidth = element.outerWidth();

    if (elementHeight <= viewportHeight / 100 * 79) {
        // Element fits on the screen, make it unscrollable
        element.css('overflow-y', 'hidden');
    } else {
        // Element is larger than the screen, enable scrolling if it was disabled previously
        element.css('overflow-y', 'auto');
    }
    if (elementWidth != screen.width - 100) {
        element.css('overflow-x', 'hidden');
    } else {
        element.css('overflow-x', 'auto');
    }
}

// Create the grid
function CreateGrid() {
    ClearGrid();
    GetUserInputs();
    FillGrid();
    SetMines();
    SetTileNumbers();
    CallEvents();
    checkElementSize();
}

// Gets the user inputs and stores them
function GetUserInputs() {
    gridSizeX = $(".height").val();
    gridSizeY = $(".width").val();
    totalMines = $(".mine-amount").val();
    currentMines = 0;
}

// Clears the grid
function ClearGrid() {
    $(".grid-container").empty();
    tiles = [];
}

// Fills the grid with data
function FillGrid() {
    // Creates the grid
    for (var i = 0; i < gridSizeY; i++) {
        tiles[i] = [];
        for (var j = 0; j < gridSizeX; j++) {
            tiles[i][j] = [];
            $("#grid").append(`<button class=\"grid-item\" data-coord="${i + "-" + j}"></button>`);
            tiles[i][j][0] = $(".grid-item").get(-1);
            tiles[i][j][1] = new Tile();
        }
    }

}

// This runs whenever you click an unrevealed tile with LMB
function RevealTile(tile) {
    if (tile[0].getAttribute("disabled")) return;
    var coord = GetTileCoordinates(tile);
    var tileValue = tiles[coord[0]][coord[1]];
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

// This runs whenever you click an unrevealed tile with RMB
function PlaceFlag(tile) {
    if (tile[0].getAttribute("disabled")) return;
    var coord = GetTileCoordinates(tile);
    var tileValue = tiles[coord[0]][coord[1]];
    if (tileValue[1].flagged) {
        tile.text(" ");
    } else {
        tile.append('<i class="bi bi-flag-fill"></i>').addClass("black");
    }
    tileValue[1].flagged = !tileValue[1].flagged;
}

// Gets the coordinates from a tile's data-coord value
function GetTileCoordinates(tile) {
    var coord = tile[0].getAttribute("data-coord").split("-");
    coord = coord.map(function (v) {
        return Number(v);
    });
    return coord;
}

// Places mines around the grid
function SetMines() {
    for (var i = 0; i < gridSizeY; i++) {
        for (var j = 0; j < gridSizeX; j++) {
            if (currentMines >= totalMines) return;
            var randomNum = Math.floor(Math.random() * Math.max(gridSizeY, gridSizeX) * totalMines)
            if (randomNum > 0) continue;
            if (tiles[i][j][1].number == -1) continue;
            tiles[i][j][1].number = -1;
            currentMines++;
        }
    }
    SetMines();
}

// Gives every tile their own number
function SetTileNumbers() {
    for (var i = 0; i < gridSizeY; i++) {
        for (var j = 0; j < gridSizeX; j++) {
            if (tiles[i][j][1].number == -1) continue;
            SetAdjacentMines(i, j);
        }
    }
}

// Get sum of adjacent mines for said tile
function SetAdjacentMines(i, j) {
    var currentAdjacent = 0;
    checkingTiles.forEach(function (v) {
        // Checking borders so it doesnt throw an error
        if (IsAtBorder(i, j, v)) return;
        //see if tile has adjacent mine
        if (tiles[i + v[0]][j + v[1]][1].number == -1) {
            currentAdjacent++;
        }
    })
    tiles[i][j][1].number = currentAdjacent == 0 ? "" : currentAdjacent;
}

// Checks if said tile is at a border
function IsAtBorder(i, j, v) {
    if (i + v[0] >= gridSizeY || i + v[0] < 0) return true;
    if (j + v[1] >= gridSizeX || j + v[1] < 0) return true;
    return false;
}