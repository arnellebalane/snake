var canvas = document.getElementById("canvas");
var context = canvas.getContext("2d");

var human = {
  initialize: function() {
    human.controls();
  },
  controls: function() {
    document.onkeydown = function(e) {
      var directions = ["left", "up", "right", "down"];
      if (e.keyCode >= 37 && e.keyCode <= 40) {
        game.snake.changeDirection(directions[e.keyCode - 37]);
      }
    }
  }
};

var game = {
  grid: new Grid(20),
  snake: null,
  food: null,
  initialize: function() {
    game.readyCanvas();
    game.readySnake();
    game.readyFood();
  },
  readyCanvas: function() {
    var world = document.getElementById("world");
    canvas.width = game.grid.width * game.grid.cellDimension;
    canvas.height = game.grid.height * game.grid.cellDimension;
    world.style.left = (window.innerWidth - canvas.width) / 2 - 10 + "px";
    world.style.top = (window.innerHeight - canvas.height) / 2 - 60 + "px";
  },
  readySnake: function() {
    var start = new Segment(5, Math.floor(game.grid.height / 2));
    game.snake = new Snake(5, start, "right");
  },
  readyFood: function() {
    this.food = new Food();
  },
  cycle: function() {
    game.clearCanvas();
    // game.grid.draw();
    game.food.draw();
    game.snake.update().draw();
  },
  clearCanvas: function() {
    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, canvas.width, canvas.height);
  }
};

var graphics = {
  drawLine: function(start, end) {
    context.lineWidth = 1;
    context.beginPath();
    context.moveTo(start.x, start.y);
    context.lineTo(end.x, end.y);
    context.stroke();
  },
  drawCircle: function(center, radius) {
    context.beginPath();
    context.arc(center.x, center.y, radius, 2 * Math.PI, false);
    context.fill();
  },
  drawSquare: function(x, y, side) {
    context.fillRect(x, y, side, side);
  }
};


human.initialize();
game.initialize();
setInterval(game.cycle, 75);





function Grid(cellDimension) {
  this.cellDimension = cellDimension;
  this.width = Math.floor((window.innerWidth - 100) / cellDimension);
  this.height = Math.floor((window.innerHeight - 150) / cellDimension);
  this.cells = [];

  this.initialize = function() {
    for (var i = 0; i < this.height; i++) {
      this.cells[i] = [];
      for (var j = 0; j < this.width; j++) {
        this.cells[i][j] = null;
      }
    }
  }
  this.walkableCell = function(x, y) {
    return x >= 0 && x < this.width && y >= 0 && y < this.height && this.cells[y][x] != "s";
  }
  this.fillCell = function(x, y, fill) {
    this.cells[y][x] = fill;
  }
  this.clearCell = function(x, y) {
    this.cells[y][x] = null;
  }
  this.hasFood = function(x, y) {
    return this.cells[y][x] == "f";
  }
  this.draw = function() {
    for (var i = 0; i < this.width; i++) {
      var start = new Coordinate(i * this.cellDimension, 0);
      var end = new Coordinate(i * this.cellDimension, canvas.height);
      graphics.drawLine(start, end);
    }
    for (var i = 0; i < this.height; i++) {
      var start = new Coordinate(0, i * this.cellDimension);
      var end = new Coordinate(canvas.width, i * this.cellDimension);
      context.strokeStyle = "#000000";
      graphics.drawLine(start, end);
    }
  }

  this.initialize();
}

function Coordinate(x, y) {
  this.x = x;
  this.y = y;
}

function Segment(x, y) {
  this.x = null;
  this.y = null;
  this.position = null;

  this.updatePosition = function(x, y) {
    if (this.x != null && this.y != null) {
      game.grid.clearCell(this.x, this.y);
    }
    this.x = x;
    this.y = y;
    var centerX = ((x * game.grid.cellDimension) + ((x + 1) * game.grid.cellDimension)) / 2;
    var centerY = ((y * game.grid.cellDimension) + ((y + 1) * game.grid.cellDimension)) / 2;
    this.position = new Coordinate(centerX, centerY);
  }
  this.draw = function() {
    context.fillStyle = "#000000";
    graphics.drawCircle(this.position, game.grid.cellDimension / 2);
    // graphics.drawSquare(this.x * game.grid.cellDimension, this.y * game.grid.cellDimension, game.grid.cellDimension);
  }

  this.updatePosition(x, y);
}

function Snake(length, headSegment, moveDirection) {
  this.segments = [];
  this.moveDirection = moveDirection;
  this.unappliedSegments = [];

  this.initialize = function() {
    this.segments.push(headSegment);
    game.grid.fillCell(headSegment.x, headSegment.y, 1);
    while (length-- > 1) {
      var last = this.segments[this.segments.length - 1];
      var segment = new Segment(last.x - 1, last.y);
      this.segments.push(segment);
      game.grid.fillCell(segment.x, segment.y, 1);
    }
  }
  this.changeDirection = function(direction) {
    if (!(this.moveDirection == "up" && direction == "down")
        && !(this.moveDirection == "left" && direction == "right")
        && !(this.moveDirection == "right" && direction == "left")
        && !(this.moveDirection == "down" && direction == "up")) {
      this.moveDirection = direction;
    }
  }
  this.moveUp = function() {
    var head = this.segments[0];
    var newX = head.x;
    var newY = head.y - 1;
    if (game.grid.walkableCell(newX, newY)) {
      if (game.grid.hasFood(newX, newY)) {
        this.eat(newX, newY);
      }
      for (var i = this.segments.length - 1; i > 0; i--) {
        var nextSegment = this.segments[i - 1];
        this.segments[i].updatePosition(nextSegment.x, nextSegment.y);
      }
      head.updatePosition(newX, newY);
    }
  }
  this.moveLeft = function() {
    var head = this.segments[0];
    var newX = head.x - 1;
    var newY = head.y;
    if (game.grid.walkableCell(newX, newY)) {
      if (game.grid.hasFood(newX, newY)) {
        this.eat(newX, newY);
      }
      for (var i = this.segments.length - 1; i > 0; i--) {
        var nextSegment = this.segments[i - 1];
        this.segments[i].updatePosition(nextSegment.x, nextSegment.y);
      }
      head.updatePosition(newX, newY);
    }
  }
  this.moveRight = function() {
    var head = this.segments[0];
    var newX = head.x + 1;
    var newY = head.y;
    if (game.grid.walkableCell(newX, newY)) {
      if (game.grid.hasFood(newX, newY)) {
        this.eat(newX, newY);
      }
      for (var i = this.segments.length - 1; i > 0; i--) {
        var nextSegment = this.segments[i - 1];
        this.segments[i].updatePosition(nextSegment.x, nextSegment.y);
      }
      head.updatePosition(newX, newY);
    }
  }
  this.moveDown = function() {
    var head = this.segments[0];
    var newX = head.x;
    var newY = head.y + 1;
    if (game.grid.walkableCell(newX, newY)) {
      if (game.grid.hasFood(newX, newY)) {
        this.eat(newX, newY);
      }
      for (var i = this.segments.length - 1; i > 0; i--) {
        var nextSegment = this.segments[i - 1];
        this.segments[i].updatePosition(nextSegment.x, nextSegment.y);
      }
      head.updatePosition(newX, newY);
    }
  }
  this.eat = function(x, y) {
    this.unappliedSegments.push(new Segment(game.food.x, game.food.y));
    game.grid.clearCell(x, y);
    game.food.choosePosition();
  }
  this.update = function() {
    if (this.moveDirection == "up") {
      this.moveUp();
    } else if (this.moveDirection == "left") {
      this.moveLeft();
    } else if (this.moveDirection == "right") {
      this.moveRight();
    } else if (this.moveDirection == "down") {
      this.moveDown();
    }
    if (this.unappliedSegments.length > 0) {
      var first = this.unappliedSegments[0];
      if (game.grid.walkableCell(first.x, first.y)) {
        this.segments.push(this.unappliedSegments.shift());
      }
    }
    for (var i = 0; i < this.segments.length; i++) {
      game.grid.fillCell(this.segments[i].x, this.segments[i].y, "s");
    }
    return this;
  }
  this.draw = function() {
    for (var i = 0; i < this.segments.length; i++) {
      this.segments[i].draw();
    }
    return this;
  }

  this.initialize();
}

function Food() {
  this.x = null;
  this.y = null;
  this.position = null;

  this.choosePosition = function() {
    do {
      this.x = Math.floor(Math.random() * game.grid.width);
      this.y = Math.floor(Math.random() * game.grid.height);
    } while (!game.grid.walkableCell(this.x, this.y));
    var centerX = ((this.x * game.grid.cellDimension) + ((this.x + 1) * game.grid.cellDimension)) / 2;
    var centerY = ((this.y * game.grid.cellDimension) + ((this.y + 1) * game.grid.cellDimension)) / 2;
    this.position = new Coordinate(centerX, centerY);
    game.grid.fillCell(this.x, this.y, "f");
  }
  this.draw = function() {
    context.fillStyle = "#aa0000";
    graphics.drawCircle(this.position, game.grid.cellDimension / 2);
  }

  this.choosePosition();
}