import React, { useState, useEffect } from "react";
import { cn } from "../lib/utils";

interface MemoryTileProps {
  id: number;
  value: string;
  isFlipped: boolean;
  isMatched: boolean;
  onClick: () => void;
  disabled: boolean;
  glitchLevel: number;
}

const MemoryTile: React.FC<MemoryTileProps> = ({
  id,
  value,
  isFlipped,
  isMatched,
  onClick,
  disabled,
  glitchLevel = 0,
}) => {
  const [isGlitching, setIsGlitching] = useState(false);

  useEffect(() => {
    if (glitchLevel > 0 && !isFlipped && !isMatched) {
      const glitchChance = Math.min(glitchLevel * 0.05, 0.3);

      const glitchInterval = setInterval(() => {
        if (Math.random() < glitchChance) {
          setIsGlitching(true);
          setTimeout(() => setIsGlitching(false), 300);
        }
      }, 2000);

      return () => clearInterval(glitchInterval);
    }
  }, [glitchLevel, isFlipped, isMatched]);

  const tileClass = cn(
    "memory-tile w-full h-full",
    isMatched ? "matched" : isFlipped ? "face-up" : "face-down",
    isGlitching && "animate-glitch",
    disabled && "opacity-80"
  );

  return (
    <div
      className={tileClass}
      onClick={!disabled && !isMatched && !isFlipped ? onClick : undefined}
      key={id}
    >
      {(isFlipped || isMatched) && (
        <div className="text-3xl text-neural-blue neon-text">{value}</div>
      )}
      {!isFlipped && !isMatched && (
        <div className="grid grid-cols-2 gap-1 opacity-30 w-4/5 h-4/5">
          <div className="circuit-line"></div>
          <div className="circuit-line"></div>
          <div className="circuit-node"></div>
          <div className="circuit-line"></div>
          <div className="circuit-line rotate-45"></div>
          <div className="circuit-node"></div>
        </div>
      )}
    </div>
  );
};

export default MemoryTile;
