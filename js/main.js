'use strict';
(function () {
  // настройка холста
  var canvas = document.querySelector('#canvas');
  var ctx = canvas.getContext('2d');

  // получаем ширину и высоту canvas
  var width = canvas.width;
  var height = canvas.height;
  // вычисляем ширину и высоту в ячейках
  var blockSize = 10;
  var widthInBlocks = width / blockSize;
  var heightInBlock = height / blockSize;

  // устанавливаем счет 0
  var score = 0;

  // рисуем рамку
  var drawBorder = function () {
    ctx.fillStyle = 'Gray';
    ctx.fillRect(0, 0, width, blockSize);
    ctx.fillRect(0, height - blockSize, width, blockSize);
    ctx.fillRect(0, 0, blockSize, height);
    ctx.fillRect(width - blockSize, 0, blockSize, height);
  };
  var drawText = function (font, colorTxt, textAlign, baseline, text, sizeX, sizeY) {
    ctx.font = font;
    ctx.fillStyle = colorTxt;
    ctx.textAlign = textAlign;
    ctx.textBaseline = baseline;
    ctx.fillText(text, sizeX, sizeY);
  };
  // рисуем счет игры в левом верхнем углу
  drawText('20px Courier', 'orange', 'left', 'top', 'Score: ' + score, blockSize, blockSize);

  // отменяем действия setInterval и печатаем сообщение конец игры
  var gameOver = function () {
    clearInterval(intervalId);
    drawText('50px Courier', 'red', 'center', 'middle', 'Game Over!', width / 2, height / 2);
  };
  // рисуем окружность
  var circle = function (x, y, radius, fillCircle) {
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2, false);
    if (fillCircle) {
      ctx.fill();
    } else {
      ctx.stroke();
    }
  };
  // задаем конструктор блок ячейка
  var Block = function (col, row) {
    this.col = col;
    this.row = row;
  };
  // рисуем квадрат в позиции ячейки
  Block.prototype.drawSquare = function (color) {
    var x = this.col * blockSize;
    var y = this.row * blockSize;
    ctx.fillStyle = color;
    ctx.fillRect(x, y, blockSize, blockSize);
  };
  // рисуем круг в позиции ячейки
  Block.prototype.drawCircle = function (color) {
    var centerX = (this.col * blockSize) + (blockSize / 2);
    var centerY = (this.row * blockSize) + (blockSize / 2);
    ctx.fillStyle = color;
    circle(centerX, centerY, blockSize / 2, true);
  };
  // проверяем, находится ли эта ячейка в той же позиции, что и ячейка otherBlock
  Block.prototype.equal = function (otherBlock) {
    return this.col === otherBlock.col && this.row === otherBlock.row;
  };
  // Задаем конструктор Snake
  var Snake = function () {
    this.segments = [
      new Block(7, 5),
      new Block(6, 5),
      new Block(5, 5)
    ];
    this.direction = 'right';
    this.nextDirection = 'right';
  };
  // рисуем квадратик для каждого сегмента тела змейки
  Snake.prototype.draw = function () {
    for (var i = 0; i < this.segments.length; i++) {
      this.segments[i].drawSquare('Blue');
    }
  };
  // создаем новую голову и добавляем ее к началу змейки
  // чтобы передвинуть змейку в текущем направлении
  Snake.prototype.move = function () {
    var head = this.segments[0];
    var newHead;
    this.direction = this.nextDirection;
    if (this.direction === 'right') {
      newHead = new Block(head.col + 1, head.row);
    } else if (this.direction === 'down') {
      newHead = new Block(head.col, head.row + 1);
    } else if (this.direction === 'left') {
      newHead = new Block(head.col - 1, head.row);
    } else if (this.direction === 'up') {
      newHead = new Block(head.col, head.row - 1);
    }
    if (this.checkCollision(newHead)) {
      gameOver();
      return;
    }
    this.segments.unshift(newHead);
    if (newHead.equal(apple.position)) {
      score++;
      apple.move();
    } else {
      this.segments.pop();
    }
  };
  // проверяем не столкнулась ли змейка со стеной или собственным телом
  Snake.prototype.checkCollision = function (head) {
    var leftCollision = (head.col === 0);
    var topCollision = (head.row === 0);
    var rightCollision = (head.col === widthInBlocks - 1);
    var bottomCollision = (head.row === widthInBlocks - 1);

    var wallCollision = leftCollision || topCollision || rightCollision || bottomCollision;

    var selfCollision = false;

    for (var i = 0; i < this.segments.length; i++) {
      if (head.equal(this.segments[i])) {
        selfCollision = true;
      }
    }
    return wallCollision || selfCollision;
  };
  // задаем следующее направления движения змейки на основе нажатой клавише
  Snake.prototype.setDirection = function (newDirection) {
    if (this.direction === 'up' && newDirection === 'down') {
      return;
    } else if (this.direction === 'right' && newDirection === 'left') {
      return;
    } else if (this.direction === 'down' && newDirection === 'up') {
      return;
    } else if (this.direction === 'left' && newDirection === 'right') {
      return;
    }
    this.nextDirection = newDirection;
  };
  // задаем конструктор яблоко
  var Apple = function () {
    this.position = new Block(10, 10);
  };
  // рисуем кружочек в позиции яблока
  Apple.prototype.draw = function () {
    this.position.drawCircle('LimeGreen');
  };
  // перемещаем яблоко в случайную позицию
  Apple.prototype.move = function () {
    var randomCol = Math.floor(Math.random() * (widthInBlocks - 2)) + 1;
    var randomRow = Math.floor(Math.random() * (heightInBlock - 2)) + 1;
    this.position = new Block(randomCol, randomRow);
  };
  // создаем объект змейку и яблоко
  var snake = new Snake();
  var apple = new Apple();

  // запускаем функцию анимации
  var intervalId = setInterval(function () {
    ctx.clearRect(0, 0, width, height);
    drawText('20px Courier', 'orange', 'left', 'top', 'Your score: ' + score, blockSize, blockSize);
    snake.move();
    snake.draw();
    apple.draw();
    drawBorder();
  }, 100);

  // преобразуем коды клавиш в направления
  var directions = {
    37: 'left',
    38: 'up',
    39: 'right',
    40: 'down'
  };
  // задаем обработчик события клавиш
  $('body').keydown(function (evt) {
    var newDirection = directions[evt.keyCode];
    if (newDirection !== undefined) {
      snake.setDirection(newDirection);
    }
  });
})();
