import React, { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { toast } from "sonner";
import MemoryGrid from "./MemoryGrid";
import { CircuitBoard, BrainCircuit } from "lucide-react";
import { audioFX } from "../utils/audioEffects";

const GameInterface: React.FC = () => {
  const [level, setLevel] = useState(1);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [gridSize, setGridSize] = useState(4);
  const [mindIntegrity, setMindIntegrity] = useState(100);
  const [gameStatus, setGameStatus] = useState<
    "ready" | "playing" | "won" | "lost"
  >("ready");
  const [comboValue, setComboValue] = useState(1);

  useEffect(() => {
    const savedHighScore = localStorage.getItem("neuroReactiveHighScore");
    if (savedHighScore) {
      setHighScore(parseInt(savedHighScore, 10));
    }
  }, []);

  useEffect(() => {
    if (score > highScore) {
      setHighScore(score);
      localStorage.setItem("neuroReactiveHighScore", score.toString());
    }
  }, [score, highScore]);

  useEffect(() => {
    if (gameStatus === "won") {
      const nextLevel = level + 1;

      if (nextLevel % 2 === 0 && gridSize < 8) {
        const newGridSize = Math.min(gridSize + 2, 8);
        setGridSize(newGridSize);
      }

      setLevel(nextLevel);

      setTimeout(() => {
        setGameStatus("ready");
      }, 2000);
    }
  }, [gameStatus, level, gridSize]);

  useEffect(() => {
    if (mindIntegrity <= 0 && gameStatus !== "lost") {
      setGameStatus("lost");
      audioFX.loose();
      toast.error("Neural Synchronization Failed", {
        description: "Mind integrity collapsed. Simulation terminated.",
      });
    }
  }, [mindIntegrity, gameStatus]);

  const handleScoreUpdate = (points: number) => {
    setScore((prevScore) => prevScore + points);
  };

  const handleMistake = () => {
    const damage = Math.min(10 + Math.floor(level / 3), 20);
    setMindIntegrity((prev) => Math.max(prev - damage, 0));
    setComboValue(1);
  };

  const startNewGame = () => {
    setLevel(1);
    setScore(0);
    setGridSize(4);
    setMindIntegrity(100);
    setGameStatus("ready");
    setComboValue(1);
  };

  const handleClick = () => {
    if (gameStatus === "lost") {
      startNewGame();
    } else {
      setGameStatus("playing");
    }
    audioFX.startNewGame();
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="glassmorphism p-6 rounded-lg mb-6">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center">
            <BrainCircuit className="h-6 w-6 mr-2 text-neural-blue" />
            <h2 className="text-xl text-neural-blue">
              Neural Trial:{" "}
              <span className="text-neural-purple">Level {level}</span>
            </h2>
          </div>
          <div>
            <span className="text-neural-green neon-text text-xl">{score}</span>
            <span className="mx-2 text-neural-blue">|</span>
            <span className="text-neural-purple text-sm">
              High: {highScore}
            </span>
          </div>
        </div>

        <div className="mb-2">
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs text-neural-pink">MIND INTEGRITY</span>
            <span className="text-xs text-neural-blue">{mindIntegrity}%</span>
          </div>
          <div className="mind-integrity-bar">
            <div
              className="integrity-fill"
              style={{ width: `${mindIntegrity}%` }}
            ></div>
          </div>
        </div>

        {(gameStatus === "ready" || gameStatus === "lost") && (
          <div className="flex justify-center mt-4">
            <Button
              onClick={() => handleClick()}
              className="bg-neural-blue hover:bg-neural-purple text-white border border-neural-blue/50 shadow-lg"
            >
              {gameStatus === "lost"
                ? "New Neural Simulation"
                : "Initialize Sequence"}
            </Button>
          </div>
        )}
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        <div className="glassmorphism p-4 rounded-lg w-full md:w-1/4 flex flex-col justify-between">
          <div>
            <div className="mb-4 relative flex items-center">
              <CircuitBoard className="absolute top-1 left-0 text-neural-blue h-5 w-5" />
              <h3 className="text-neural-pink ml-7 mt-1 text-sm font-bold">
                STATUS
              </h3>
            </div>

            <div className="space-y-4 text-sm">
              <p className="text-neural-blue border-l-2 border-neural-blue pl-2">
                {gameStatus === "ready" &&
                  "Neural sync prepared. Awaiting initialization."}
                {gameStatus === "playing" &&
                  "Neural patterns destabilizing. Match memory pairs to recover integrity."}
                {gameStatus === "won" &&
                  "Level complete. Advancing to next neural depth."}
                {gameStatus === "lost" &&
                  "Catastrophic pattern loss. Neural structure collapsed."}
              </p>

              <div className="grid grid-cols-2 gap-2">
                <div className="glassmorphism rounded p-2 text-center">
                  <div className="text-xs text-neural-green">GRID</div>
                  <div className="text-neural-blue text-xl">
                    {gridSize}x{gridSize}
                  </div>
                </div>
                <div className="glassmorphism rounded p-2 text-center">
                  <div className="text-xs text-neural-purple">COMBO</div>
                  <div
                    className={`text-neural-pink text-xl combo-pulse ${
                      comboValue > 1 ? "scale-110" : ""
                    }`}
                  >
                    {comboValue}x
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 text-xs text-neural-blue/70">
            <p>
              <span className="text-neural-pink">PROTOCOL:</span> Match
              identical memory fragments to stabilize neural patterns.
            </p>
            <p className="mt-2">
              <span className="text-neural-pink">WARNING:</span> Mismatches
              damage mind integrity. Neural collapse at 0%.
            </p>
          </div>
        </div>

        <div className="w-full md:w-3/4">
          <MemoryGrid
            gridSize={gridSize}
            level={level}
            onScoreUpdate={(points: number) => {
              handleScoreUpdate(points);
              setComboValue((prev) => prev + 1);
              setTimeout(() => setComboValue(1), 1500);
            }}
            onMistake={handleMistake}
            gameStatus={gameStatus}
            setGameStatus={setGameStatus}
          />
        </div>
      </div>
    </div>
  );
};

export default GameInterface;
