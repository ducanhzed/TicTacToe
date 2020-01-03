document.addEventListener('DOMContentLoaded', (e) => {
    const form = document.querySelector('.form')
    const button = document.querySelectorAll('button');
    const canvas = document.querySelector('canvas');
    const result = document.querySelector('.result')
    const inputRows = document.querySelector('[name="rows"]');
    const inputNumToWin = document.querySelector('[name="numToWin"]');

    const turnDisplay = document.querySelector('.turn');

    // Kits
    const context = canvas.getContext('2d');
    let gameBoard = [];
    let numToWin = 3;
    let unitSquare = 50;
    let mouseCoords = { x: -1, y: -1 }, move = 0;
    let chess = {};
    let numOfRows = 3;
    let numOfCols = 3;
    let start = false;
    let fontsizeChess = 10;

    function initNewGame() {
        numOfRows = inputRows.value;
        numOfCols = numOfRows;
        unitSquare = canvas.width / numOfRows;
        numToWin = inputNumToWin.value;
        mouseCoords = { x: -1, y: -1 }
        move = 0;
        chess = getTypeOfChess();
        context.clearRect(0, 0, canvas.width, canvas.height)
        gameBoard = [];
        for (let i = 0; i < numOfRows; i++) gameBoard.push([]);
        context.clearRect(0, 0, canvas.width, canvas.height);
        drawGameBoard();
    }
    function startGame() {
        //draw board
        initNewGame();
        addEventToGameBoard();
    }

    let drawGameBoard = () => {
        context.clearRect(0, 0, canvas.width, canvas.height);
        context.lineWidth = 1;
        context.strokeStyle = 'black';
        context.beginPath()
        for (let j = 0; j < canvas.width; j += unitSquare) {
            for (let i = 0; i < canvas.width; i += unitSquare) {
                //draw border left
                context.moveTo(j, i);
                context.lineTo(j + unitSquare, i)
                context.stroke();

                context.moveTo(j + unitSquare, i);
                context.lineTo(j + unitSquare, i + unitSquare)
                context.stroke();
            }
        }
        context.closePath();
    }
    let changeTurn = () => {
        move++;
        chess = getTypeOfChess();
        turnDisplay.innerHTML = `<strong style="color : ${chess.color}">${chess.text}</strong>Turn`
        turnDisplay.style.border = `${chess.color} 2px solid`;
    }
    let getTypeOfChess = () => {
        const X = { text: 'X', color: 'green' };
        const O = { text: 'O', color: 'red' };
        return (move % 2 == 0) ? X : O;
    }
    let drawCheck = () => {
        fontsizeChess = canvas.width / numOfRows * 0.5;
        if (!gameBoard[mouseCoords.y][mouseCoords.x]) {
            context.font = `${fontsizeChess}px Verdana`;
            context.beginPath()
            context.fillStyle = chess.color;
            context.closePath();
            context.fillText(chess.text, mouseCoords.x * unitSquare + unitSquare / 3, mouseCoords.y * unitSquare + unitSquare / 1.5);
            gameBoard[mouseCoords.y][mouseCoords.x] = chess.text;
        }
    }
    let addEventToGameBoard = () => {
        canvas.addEventListener('click', function (e) {
            if (!gameBoard[mouseCoords.y][mouseCoords.x]) {
                drawCheck()
                if (!checkWin())
                    changeTurn()
            }
        });

        canvas.addEventListener('mousemove', function (e) {
            //get mouse in game board's coords
            mouseCoords = { x: Math.floor(e.offsetX / unitSquare), y: Math.floor(e.offsetY / unitSquare) };
            //console.log(mouseCoords);
        });
    }
    let winEffect = (arr) => {
        //console.table(arr)
        let start = arr.shift();
        let end = arr.pop();

        start.x *= unitSquare;
        start.x += unitSquare / 2;
        start.y *= unitSquare;
        start.y += unitSquare / 2;

        end.x *= unitSquare;
        end.y *= unitSquare;
        end.x += unitSquare / 2;
        end.y += unitSquare / 2;

        context.strokeStyle = 'white';
        context.lineWidth = 5;
        context.beginPath();
        context.moveTo(start.x, start.y);
        context.lineTo(end.x, end.y);
        context.stroke();
        context.closePath();

        result.innerHTML = `<span><strong style="color : ${chess.color}">${chess.text}</strong>WIN</span>
                            <p>Click to Restart !</p>`;
        result.classList.add('show');
        result.addEventListener('click', restartGame);
    }
    let restartGame = () => {
        result.classList.remove('show');
        initNewGame();
    }
    let drawEffect = () => {
        result.innerHTML = `<span><strong>DRAW MATCH!</strong></span>
                            <p>Click to Restart !</p>`;
        result.classList.add('show');
        result.addEventListener('click', restartGame);
    }
    let checkWin = () => {
        let diagonalMain = checkWinDiagonalMain();
        let diagonalSub = checkWinDiagonalSub();
        let vertical = checkWinVertical();
        let horizontal = checkWinHorizontal();

        const arr = [diagonalMain, diagonalSub, vertical, horizontal];
        let end = arr.some(e => e.length >= numToWin);

        if (diagonalMain.length >= numToWin) winEffect(diagonalMain);
        else if (diagonalSub.length >= numToWin) winEffect(diagonalSub);
        else if (vertical.length >= numToWin) winEffect(vertical);
        else if (horizontal.length >= numToWin) winEffect(horizontal);
        else if (move >= numOfRows * numOfRows - 1) {
            drawEffect();
            end = true;
        }
        else end = false;
        return end;
    }
    let checkWinDiagonalMain = () => {
        const diagonalMain = [];
        const coords = { x: mouseCoords.x, y: mouseCoords.y };
        let x = coords.x, y = coords.y;

        while (x < numOfRows && y >= 0) {
            if (gameBoard[y][x] == chess.text)
                diagonalMain.push({ x: x, y: y });
            else break;
            x++;
            y--;
        }

        x = coords.x - 1;
        y = coords.y + 1;

        while (x >= 0 && y < numOfCols) {
            if (gameBoard[y][x] == chess.text)
                diagonalMain.unshift({ x: x, y: y });
            else break;
            x--;
            y++;
        }
        return diagonalMain;
    }
    let checkWinDiagonalSub = () => {
        const diagonalSub = [];
        const coords = { x: mouseCoords.x, y: mouseCoords.y };
        let x = coords.x, y = coords.y;

        while (x < numOfRows && y < numOfCols) {
            if (gameBoard[y][x] == chess.text) {
                //console.log(coords)
                diagonalSub.push({ x: x, y: y })
            }
            else break;
            x++;
            y++;
        }

        x = coords.x - 1;
        y = coords.y - 1;
        while (x >= 0 && y >= 0) {
            if (gameBoard[y][x] == chess.text)
                diagonalSub.push({ x: x, y: y });
            else break;
            x--;
            y--;
        }
        return diagonalSub;
    }
    let checkWinVertical = () => {
        let x = mouseCoords.x, y = mouseCoords.y;
        const vertical = []
        while (y >= 0) {
            if (gameBoard[y][x] == chess.text)
                vertical.unshift({ x: x, y: y })
            else break;
            y--;
        }
        y = mouseCoords.y;
        y++;
        while (y < numOfCols) {
            if (gameBoard[y][x] == chess.text)
                vertical.push({ x: x, y: y })
            else break;
            y++;
        }
        return vertical;
    }
    let checkWinHorizontal = () => {
        let x = mouseCoords.x, y = mouseCoords.y;
        const horizontal = []
        while (x >= 0) {
            if (gameBoard[y][x] == chess.text)
                horizontal.unshift({ x: x, y: y })
            else break;
            x--;
        }
        x = mouseCoords.x;
        x++;
        while (x < numOfRows) {
            if (gameBoard[y][x] == chess.text)
                horizontal.push({ x: x, y: y })
            else break;
            x++;
        }
        return horizontal;
    }

    //button events handling
    button.forEach(e => {
        e.addEventListener('click', function () {
            if (start == false)
                startGame();
            else {
                restartGame();
            }
        })

    })
})