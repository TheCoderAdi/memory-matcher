import React, { useState, useEffect } from "react";
import MemoryTile from "./MemoryTile";
import { toast } from "sonner";
import { audioFX } from "../utils/audioEffects.ts";

interface MemoryGridProps {
  gridSize: number;
  level: number;
  onScoreUpdate: (points: number) => void;
  onMistake: () => void;
  gameStatus: "ready" | "playing" | "won" | "lost";
  setGameStatus: (status: "ready" | "playing" | "won" | "lost") => void;
}

const MEMORY_GLYPHS = [
  "⏣",
  "⏢",
  "⏥",
  "⏤",
  "💡",
  "🧠",
  "🧩",
  "🎮",
  "⌘",
  "⌬",
  "⎊",
  "⍚",
  "🐱",
  "🐶",
  "🐸",
  "🐵",
  "🔥",
  "❄️",
  "⚡",
  "🌈",
  "🍎",
  "🍌",
  "🍇",
  "🍉",
  "🚀",
  "🛰️",
  "👾",
  "🤖",
];

const MemoryGrid: React.FC<MemoryGridProps> = ({
  gridSize,
  level,
  onScoreUpdate,
  onMistake,
  gameStatus,
  setGameStatus,
}) => {
  const [tiles, setTiles] = useState<
    Array<{ id: number; value: string; isFlipped: boolean; isMatched: boolean }>
  >([]);
  const [flippedTiles, setFlippedTiles] = useState<number[]>([]);
  const [matchedPairs, setMatchedPairs] = useState<number>(0);
  const [comboCount, setComboCount] = useState<number>(0);
  const [lastMatchTime, setLastMatchTime] = useState<number>(0);
  const [isCheckingMatch, setIsCheckingMatch] = useState<boolean>(false);

  useEffect(() => {
    if (gameStatus === "ready" || gameStatus === "won") {
      initializeGame();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameStatus, gridSize, level]);

  useEffect(() => {
    if (
      matchedPairs === (gridSize * gridSize) / 2 &&
      gameStatus === "playing"
    ) {
      setGameStatus("won");
      toast.success(`Neural Circuit Level ${level} Complete!`, {
        description:
          "Memory patterns stabilized. Advancing to next difficulty.",
      });

      const levelBonus = level * 100;
      onScoreUpdate(levelBonus);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [matchedPairs, gridSize, level, gameStatus]);

  const initializeGame = () => {
    const totalTiles = gridSize * gridSize;
    const pairsCount = totalTiles / 2;

    const levelOffset = Math.min(
      Math.floor(level / 2),
      MEMORY_GLYPHS.length - pairsCount
    );
    const selectedGlyphs = [
      ...MEMORY_GLYPHS.slice(levelOffset, levelOffset + pairsCount),
    ];
    const gameTiles = [...selectedGlyphs, ...selectedGlyphs].map(
      (value, index) => ({
        id: index,
        value,
        isFlipped: false,
        isMatched: false,
      })
    );

    const shuffledTiles = gameTiles.sort(() => Math.random() - 0.5);

    setTiles(shuffledTiles);
    setFlippedTiles([]);
    setMatchedPairs(0);
    setComboCount(0);
    setLastMatchTime(0);
    setGameStatus("playing");
  };

  const handleTileClick = (id: number) => {
    if (
      isCheckingMatch ||
      flippedTiles.includes(id) ||
      tiles.find((t) => t.id === id)?.isMatched
    ) {
      return;
    }

    if (flippedTiles.length === 2) {
      return;
    }

    audioFX.click();
    const updatedTiles = tiles.map((tile) =>
      tile.id === id ? { ...tile, isFlipped: true } : tile
    );
    setTiles(updatedTiles);

    const newFlippedTiles = [...flippedTiles, id];
    setFlippedTiles(newFlippedTiles);

    if (newFlippedTiles.length === 2) {
      setIsCheckingMatch(true);

      const [firstId, secondId] = newFlippedTiles;
      const firstTile = updatedTiles.find((t) => t.id === firstId);
      const secondTile = updatedTiles.find((t) => t.id === secondId);

      if (firstTile && secondTile && firstTile.value === secondTile.value) {
        setTimeout(() => {
          const matchedTiles = tiles.map((tile) =>
            tile.id === firstId || tile.id === secondId
              ? { ...tile, isMatched: true, isFlipped: false }
              : tile
          );
          setTiles(matchedTiles);
          setFlippedTiles([]);
          setMatchedPairs((prev) => prev + 1);

          const now = Date.now();
          const isCombo = now - lastMatchTime < 3000;
          const newComboCount = isCombo ? comboCount + 1 : 1;
          setComboCount(newComboCount);
          setLastMatchTime(now);

          const baseScore = 10;
          const comboMultiplier = Math.min(newComboCount, 5);
          const levelFactor = level;
          const points = baseScore + comboMultiplier * levelFactor;

          onScoreUpdate(points);
          audioFX.success();

          if (newComboCount > 1) {
            toast(`${newComboCount}x Combo!`, {
              position: "bottom-center",
              duration: 1000,
            });
          }

          setIsCheckingMatch(false);
        }, 500);
      } else {
        setTimeout(() => {
          const resetTiles = tiles.map((tile) =>
            newFlippedTiles.includes(tile.id)
              ? { ...tile, isFlipped: false }
              : tile
          );
          setTiles(resetTiles);
          setFlippedTiles([]);
          setComboCount(0);
          onMistake();

          setIsCheckingMatch(false);
        }, 1000);
      }
    }
  };

  const gridTemplateColumns = `repeat(${gridSize}, minmax(0, 1fr))`;

  return (
    <div
      className="neuro-grid relative animate-neural-pulse"
      style={{
        gridTemplateColumns,
        maxWidth: "100%",
        width: "100%",
      }}
    >
      {tiles.map((tile) => (
        <div key={tile.id} className="h-[9rem]">
          <MemoryTile
            id={tile.id}
            value={tile.value}
            isFlipped={tile.isFlipped}
            isMatched={tile.isMatched}
            onClick={() => handleTileClick(tile.id)}
            disabled={isCheckingMatch || gameStatus !== "playing"}
            glitchLevel={level}
          />
        </div>
      ))}
    </div>
  );
};

export default MemoryGrid;
