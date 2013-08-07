var canvas = document.getElementById("canvas");
var context = canvas.getContext("2d");

var InitialSnakeLength = 5;

var human = {
  snake: null,
  initialize: function() {
    human.initializeSnake();
    human.initializeControls();
  },
  initializeSnake: function() {
    var snakeHead = new Segment(5, Math.floor(game.grid.height / 2));
    human.snake = new Snake(InitialSnakeLength, snakeHead, "right");
  },
  initializeControls: function() {
    document.onkeydown = function(e) {
      var directions = ["left", "up", "right", "down"];
      if (e.keyCode >= 37 && e.keyCode <= 40) {
        human.snake.changeDirection(directions[e.keyCode - 37]);
      }
    }
  },
  cycle: function() {
    human.snake.update().draw();
  }
};

var computer = {
  snake: null,
  path: [],
  initialize: function() {
    computer.initializeSnake();
  },
  initializeSnake: function() {
    var snakeHead = new Segment(game.grid.width - 6, Math.floor(game.grid.height / 2));
    computer.snake = new Snake(InitialSnakeLength, snakeHead, "left");
  },
  cycle: function() {
    while (computer.path.length == 0) {
      computer.findPath();
    }
    computer.snake.changeDirection(computer.path.shift());
    computer.snake.update().draw();
  },
  findPath: function() {
    var directions = ["up", "left", "right", "down"];
    for (var i = 0; i < 10; i++) {
      var direction = directions[Math.floor(Math.random() * 4)];
      var snakeHead = computer.snake.segments[0];
      if ((direction == "up" && computer.snake.direction != "down" && game.grid.walkable(snakeHead.x, snakeHead.y - 1))
          || (direction == "left" && computer.snake.direction != "right" && game.grid.walkable(snakeHead.x - 1, snakeHead.y))
          || (direction == "right" && computer.snake.direction != "left" && game.grid.walkable(snakeHead.x + 1, snakeHead.y))
          || (direction == "down" && computer.snake.direction != "up" && game.grid.walkable(snakeHead.x, snakeHead.y + 1))) {
        this.path.push(direction);
      }
    }
  }
};

var game = {
  grid: new Grid(20),
  food: null,
  initialize: function() {
    game.initializeCanvas();

    human.initialize();
    computer.initialize();

    game.initializeFood();
  },
  initializeCanvas: function() {
    var world = document.getElementById("world");
    canvas.width = game.grid.width * game.grid.cellDimension;
    canvas.height = game.grid.height * game.grid.cellDimension;
    world.style.left = (window.innerWidth - parseInt(getComputedStyle(world)["width"])) / 2 + "px";
    world.style.top = (window.innerHeight - canvas.height) / 2 - 60 + "px";
  },
  initializeFood: function() {
    game.food = new Food();
  },
  cycle: function() {
    game.clearCanvas();
    human.cycle();
    computer.cycle();

    game.food.draw();
  },
  clearCanvas: function() {
    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, canvas.width, canvas.height);
  }
};

var graphics = {
  circle: function(center, radius) {
    context.beginPath();
    context.arc(center.x, center.y, radius, 2 * Math.PI, false);
    return this;
  },
  stroke: function() {
    context.stroke();
  },
  fill: function() {
    context.fill();
  }
}

game.initialize();
setInterval(game.cycle, 100);





function Grid(cellDimension) {
  this.cellDimension = cellDimension;
  this.width = Math.floor((window.innerWidth - 100) / cellDimension);
  this.height = Math.floor((window.innerHeight - 150) / cellDimension);
  this.cells = [];

  this.initialize = function() {
    for (var i = 0; i < this.height; i++) {
      this.cells[i] = [];
      for (var j = 0; j < this.width; j++) {
        this.cells[i][j] = new Cell(j, i, cellDimension);
      }
    }
  } 
  this.fill = function(x, y, fill) {
    this.cells[y][x].content = fill;
  }
  this.clear = function(x, y) {
    this.cells[y][x].clear();
  }
  this.walkable = function(x, y) {
    return x >= 0 && x < this.width && y >= 0 && y < this.height && this.cells[y][x].walkable();
  }
  this.hasFood = function(x, y) {
    return this.cells[y][x].hasFood();
  }

  this.initialize();
}

function Cell(x, y, dimension) {
  this.content = null;
  this.parentCell = null;
  this.distanceToStart = 0;
  this.distanceToEnd = 0;
  this.totalDistance = 0;
  this.dimension = dimension;
  this.position = new Coordinate(x * dimension, y * dimension);
  this.middle = new Coordinate(x * dimension + dimension / 2, y * dimension + dimension / 2);

  this.walkable = function() {
    return this.content != "segment";
  }
  this.hasFood = function() {
    return this.content == "food";
  }
  this.clear = function() {
    this.content = null;
  }
}

function Snake(length, head, direction) {
  this.segments = [];
  this.direction = direction;
  this.unappliedSegments = [];
  
  this.initialize = function() {
    this.segments.push(head);
    game.grid.fill(head.x, head.y, "segment");
    while (length-- > 1) {
      var last = this.segments[this.segments.length - 1];
      var segment = null;
      if (direction == "up" && last.y + 1 < game.grid.height) {
        segment = new Segment(last.x, last.y + 1);
      } else if (direction == "left" && last.x + 1 < game.grid.width) {
        segment = new Segment(last.x + 1, last.y);
      } else if (direction == "right" && last.x - 1 >= 0) {
        segment = new Segment(last.x - 1, last.y);
      } else if (direction == "down" && last.y - 1 >= 0) {
        segment = new Segment(last.x, last.y - 1);
      } else {
        break;
      }
      this.segments.push(segment);
      game.grid.fill(segment.x, segment.y, "segment");
    }
  }
  this.changeDirection = function(direction) {
    if (!(direction == "up" && this.direction == "down")
        && !(direction == "left" && this.direction == "right")
        && !(direction == "right" && this.direction == "left")
        && !(direction == "down" && this.direction == "up")) {
      this.direction = direction;
    }
  }
  this.up = function() {
    return {x: this.segments[0].x, y: this.segments[0].y - 1};
  }
  this.left = function() {
    return {x: this.segments[0].x - 1, y: this.segments[0].y};
  }
  this.right = function() {
    return {x: this.segments[0].x + 1, y: this.segments[0].y};
  }
  this.down = function() {
    return {x: this.segments[0].x, y: this.segments[0].y + 1};
  }
  this.move = function(cell) {
    if (game.grid.walkable(cell.x, cell.y)) {
      if (game.grid.hasFood(cell.x, cell.y)) {
        this.eat(cell.x, cell.y);
      }
      for (var i = this.segments.length - 1; i > 0; i--) {
        var nextSegment = this.segments[i - 1];
        this.segments[i].updatePosition(nextSegment.x, nextSegment.y);
      }
      head.updatePosition(cell.x, cell.y);
    }
  }
  this.eat = function(x, y) {
    this.unappliedSegments.push(new Segment(game.food.x, game.food.y));
    game.grid.clear(x, y);
    game.food.choosePosition();
  }
  this.update = function() {
    this.move(this[this.direction]());
    if (this.unappliedSegments.length > 0) {
      var first = this.unappliedSegments[0];
      if (game.grid.walkable(first.x, first.y)) {
        this.segments.push(this.unappliedSegments.shift());
      }
    }
    for (var i = 0; i < this.segments.length; i++) {
      game.grid.fill(this.segments[i].x, this.segments[i].y, "segment");
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

function Segment(x, y) {
  this.x = null;
  this.y = null;
  this.cell = null;

  this.updatePosition = function(x, y) {
    if (this.x != null && this.y != null) {
      game.grid.clear(this.x, this.y);
    }
    this.x = x;
    this.y = y;
    this.cell = game.grid.cells[y][x];
  }
  this.draw = function() {
    context.fillStyle = "#000000";
    graphics.circle(this.cell.middle, this.cell.dimension / 2).fill();
  }

  this.updatePosition(x, y);
}

function Food() {
  this.x = null;
  this.y = null;
  this.cell = null;

  this.choosePosition = function() {
    do {
      this.x = Math.floor(Math.random() * game.grid.width);
      this.y = Math.floor(Math.random() * game.grid.height);
    } while (!game.grid.walkable(this.x, this.y));
    this.cell = game.grid.cells[this.y][this.x];
    game.grid.fill(this.x, this.y, "food");
  }
  this.draw = function() {
    context.fillStyle = "#aa0000";
    graphics.circle(this.cell.middle, this.cell.dimension / 2).fill();
  }

  this.choosePosition();
}

function Coordinate(x, y) {
  this.x = x;
  this.y = y;
}