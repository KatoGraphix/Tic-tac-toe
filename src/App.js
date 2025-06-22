import React, { useState, useRef, useEffect } from 'react';
import './App.css';

const WINNING_COMBOS = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

function calculateWinner(squares) {
  for (let combo of WINNING_COMBOS) {
    const [a, b, c] = combo;
    if (
      squares[a] &&
      squares[a] === squares[b] &&
      squares[a] === squares[c]
    ) {
      return { winner: squares[a], line: combo };
    }
  }
  return null;
}

function Square({ value, onClick, highlight, animate }) {
  return (
    <button className={`square${highlight ? ' highlight' : ''}${animate ? ' animate' : ''}`} onClick={onClick}>
      {value}
    </button>
  );
}

function getBestMove(squares, isOMove) {
  // Minimax algorithm for Tic-Tac-Toe
  const winnerInfo = calculateWinner(squares);
  if (winnerInfo) {
    if (winnerInfo.winner === 'O') return { score: 1 };
    if (winnerInfo.winner === 'X') return { score: -1 };
  }
  if (squares.every(Boolean)) return { score: 0 };

  let best;
  if (isOMove) {
    best = { score: -Infinity };
    for (let i = 0; i < 9; i++) {
      if (!squares[i]) {
        const newSquares = squares.slice();
        newSquares[i] = 'O';
        const result = getBestMove(newSquares, false);
        if (result.score > best.score) {
          best = { score: result.score, move: i };
        }
      }
    }
  } else {
    best = { score: Infinity };
    for (let i = 0; i < 9; i++) {
      if (!squares[i]) {
        const newSquares = squares.slice();
        newSquares[i] = 'X';
        const result = getBestMove(newSquares, true);
        if (result.score < best.score) {
          best = { score: result.score, move: i };
        }
      }
    }
  }
  return best;
}

function App() {
  // Player names and scores
  const [player1, setPlayer1] = useState('Player 1');
  const [player2, setPlayer2] = useState('Player 2');
  const [score, setScore] = useState({ X: 0, O: 0 });
  const [editNames, setEditNames] = useState(true);
  const [mode, setMode] = useState('user'); // 'user' or 'cpu'

  // Game state
  const [squares, setSquares] = useState(Array(9).fill(null));
  const [xIsNext, setXIsNext] = useState(true);
  const [animateWin, setAnimateWin] = useState(false);
  const winnerInfo = calculateWinner(squares);
  const isDraw = !winnerInfo && squares.every(Boolean);

  // Track previous winner/draw state
  const prevResult = useRef({ winner: null, isDraw: false });

  // Handle player name input
  function handleNameSubmit(e) {
    e.preventDefault();
    setEditNames(false);
  }

  // Handle mode switch
  function handleModeChange(e) {
    setMode(e.target.value);
    handleRestart();
  }

  // Handle square click
  function handleClick(i) {
    if (squares[i] || winnerInfo) return;
    const nextSquares = squares.slice();
    nextSquares[i] = xIsNext ? 'X' : 'O';
    setSquares(nextSquares);
    setXIsNext(!xIsNext);
  }

  // Handle restart
  function handleRestart() {
    setSquares(Array(9).fill(null));
    setXIsNext(true);
    setAnimateWin(false);
    prevResult.current = { winner: null, isDraw: false };
  }

  // Handle win/draw and update score/animation
  useEffect(() => {
    // Only update score if transitioning from no result to win/draw
    if (winnerInfo && !prevResult.current.winner) {
      setScore(s => ({ ...s, [winnerInfo.winner]: s[winnerInfo.winner] + 1 }));
      setAnimateWin(true);
    } else if (isDraw && !prevResult.current.isDraw) {
      setAnimateWin(true);
    }
    prevResult.current = { winner: winnerInfo ? winnerInfo.winner : null, isDraw };
  }, [winnerInfo, isDraw]);

  // CPU move
  useEffect(() => {
    if (
      mode === 'cpu' &&
      !winnerInfo &&
      !isDraw &&
      !xIsNext // O is CPU
    ) {
      // Use minimax for smart AI
      const best = getBestMove(squares, true);
      const move = best.move;
      if (move !== undefined) {
        setTimeout(() => handleClick(move), 500);
      }
    }
  }, [squares, xIsNext, mode, winnerInfo, isDraw]);

  let status;
  if (winnerInfo) {
    status = `Winner: ${winnerInfo.winner === 'X' ? player1 : player2}`;
  } else if (isDraw) {
    status = "It's a draw!";
  } else {
    status = `Next player: ${xIsNext ? player1 : player2}`;
  }

  return (
    <div className="game-container">
      <h1>Tic-Tac-Toe</h1>
      <div className="mode-select">
        <label>
          <input
            type="radio"
            value="user"
            checked={mode === 'user'}
            onChange={handleModeChange}
          />
          2 Players
        </label>
        <label>
          <input
            type="radio"
            value="cpu"
            checked={mode === 'cpu'}
            onChange={handleModeChange}
          />
          Play vs CPU
        </label>
      </div>
      {editNames ? (
        <form className="name-form" onSubmit={handleNameSubmit}>
          <input
            className="name-input"
            value={player1}
            onChange={e => setPlayer1(e.target.value)}
            placeholder="Player 1 Name"
            required
          />
          <input
            className="name-input"
            value={player2}
            onChange={e => setPlayer2(e.target.value)}
            placeholder={mode === 'cpu' ? 'CPU Name' : 'Player 2 Name'}
            required
            disabled={mode === 'cpu'}
          />
          <button className="start-btn" type="submit">Start Game</button>
        </form>
      ) : (
        <div className="scoreboard">
          <div className="score">
            <span className="player-name">{player1} (X)</span>: {score.X}
          </div>
          <div className="score">
            <span className="player-name">{mode === 'cpu' ? 'CPU' : player2} (O)</span>: {score.O}
          </div>
          <button className="edit-names-btn" onClick={() => setEditNames(true)}>
            Edit Names
          </button>
        </div>
      )}
      <div className="status">{status}</div>
      <div className={`board${animateWin ? ' animate-board' : ''}`}>
        {squares.map((square, i) => (
          <Square
            key={i}
            value={square}
            onClick={() => handleClick(i)}
            highlight={winnerInfo && winnerInfo.line.includes(i)}
            animate={animateWin && (winnerInfo ? winnerInfo.line.includes(i) : true)}
          />
        ))}
      </div>
      <button className="restart-btn" onClick={handleRestart}>
        Restart Game
      </button>
    </div>
  );
}

export default App;
