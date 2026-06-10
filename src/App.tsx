import { useState, useRef, useEffect, type JSX } from "react";
import Die from "./Die";
import { nanoid } from "nanoid";
import Confetti from "react-confetti";

type Die = {
  value: number;
  isHeld: boolean;
  readonly id: string;
};

export default function App(): JSX.Element {
  const [dice, setDice] = useState<Die[]>(() => generateAllNewDice());
  const [moveCount, setMoveCount] = useState<number>(0);
  const [bestRecord, setBestRecord] = useState<number>(() => {
    const saved = localStorage.getItem("record");
    return saved !== null ? Number(saved) : Infinity;
  });
  const [startTime, setStartTime] = useState<number>(Date.now());
  const [bestTime, setBestTime] = useState<number>(() => {
    const saved = localStorage.getItem("bestTime");
    return saved !== null ? Number(saved) : Infinity;
  });

  const buttonRef = useRef<HTMLButtonElement | null>(null);

  const gameWon =
    dice.every((die) => die.isHeld) &&
    dice.every((die) => die.value === dice[0].value);

  useEffect(() => {
    if (gameWon && buttonRef.current) {
      buttonRef.current.focus();
    }
  }, [gameWon]);

  function generateAllNewDice(): Die[] {
    return new Array(10).fill(0).map(() => ({
      value: Math.ceil(Math.random() * 6),
      isHeld: false,
      id: nanoid(),
    }));
  }

  function rollDice(): void {
    if (!gameWon) {
      setDice((oldDice) =>
        oldDice.map((die) =>
          die.isHeld ? die : { ...die, value: Math.ceil(Math.random() * 6) },
        ),
      );
      setMoveCount((prev) => prev + 1);
    } else {
      const endTime = Date.now();
      const duration = Math.floor((endTime - startTime) / 1000);
      setBestRecord((prev) => (moveCount < prev ? moveCount : prev));
      setBestTime((prev) => (duration < prev ? duration : prev));
      localStorage.setItem("record", String(moveCount));
      localStorage.setItem("bestTime", String(duration));
      setMoveCount(0);
      setStartTime(Date.now());
      setDice(generateAllNewDice());
    }
  }

  function hold(id: string): void {
    setDice((oldDice) =>
      oldDice.map((die) =>
        die.id === id ? { ...die, isHeld: !die.isHeld } : die,
      ),
    );
  }

  const diceElements = dice.map((dieObj) => (
    <Die
      key={dieObj.id}
      value={dieObj.value}
      isHeld={dieObj.isHeld}
      hold={() => hold(dieObj.id)}
    />
  ));

  return (
    <main>
      {gameWon && <Confetti />}
      <div aria-live="polite" className="sr-only">
        {gameWon && (
          <p>Congratulations! You won! Press "New Game" to start again.</p>
        )}
      </div>
      <h1 className="title">Tenzies</h1>
      <p className="instructions">
        Roll until all dice are the same. Click each die to freeze it at its
        current value between rolls.
      </p>
      <span>Moves: {moveCount}</span>
      <span>
        Best Record (moves): {bestRecord === Infinity ? "-" : bestRecord}
      </span>
      <span>Best Time (seconds): {bestTime === Infinity ? "-" : bestTime}</span>
      <div className="dice-container">{diceElements}</div>
      <button ref={buttonRef} className="roll-dice" onClick={rollDice}>
        {gameWon ? "New Game" : "Roll"}
      </button>
    </main>
  );
}
