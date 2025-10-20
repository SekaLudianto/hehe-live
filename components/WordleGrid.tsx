import React from 'react';
import Tile from './Tile';
import { GuessData, TileStatus } from '../types';

interface WordleGridProps {
  bestGuess: GuessData | null;
  recentGuesses: GuessData[];
  wordLength: number;
}

const GuessRow: React.FC<{ guessData: GuessData; wordLength: number }> = ({ guessData, wordLength }) => {
    return (
        <div
            className="grid gap-1 flex-1"
            style={{ gridTemplateColumns: `repeat(${wordLength}, 1fr)` }}
        >
            {Array.from({ length: wordLength }).map((_, i) => {
                const letter = guessData.guess[i] || '';
                const status = guessData.statuses[i] || 'empty';
                return <Tile key={i} letter={letter} status={status} />;
            })}
        </div>
    );
}

const EmptyRow: React.FC<{ wordLength: number }> = ({ wordLength }) => {
     return (
        <div
            className="grid gap-1 flex-1"
            style={{ gridTemplateColumns: `repeat(${wordLength}, 1fr)` }}
        >
            {Array.from({ length: wordLength }).map((_, i) => (
                <Tile key={i} status="empty" />
            ))}
        </div>
    );
}

const WordleGrid: React.FC<WordleGridProps> = ({ bestGuess, recentGuesses, wordLength }) => {
  const emptyRecentRowsCount = 5 - recentGuesses.length;

  return (
    <div className="space-y-1.5">
      <div className="text-center text-xs text-cyan-400 font-semibold tracking-wider uppercase pb-1">Tebakan Terbaik</div>
      <div className="bg-gray-800/50 p-2 rounded-lg flex items-center gap-2">
        <div className="flex-1">
            {bestGuess ? <GuessRow guessData={bestGuess} wordLength={wordLength} /> : <EmptyRow wordLength={wordLength} />}
        </div>
        <div className="w-10 flex-shrink-0" title={bestGuess?.user.nickname}>
          {bestGuess && <img src={bestGuess.user.profilePictureUrl} alt={bestGuess.user.nickname} className="w-10 h-10 rounded-full"/>}
        </div>
      </div>

      <div className="pt-2 pb-1">
        <div className="text-center text-xs text-gray-400 font-semibold tracking-wider uppercase">Tebakan Terbaru</div>
      </div>

      {recentGuesses.map((guess, i) => (
        <div key={`${guess.guess}-${i}-${guess.user.uniqueId}`} className="flex items-center gap-2">
            <GuessRow guessData={guess} wordLength={wordLength} />
            <div className="w-10 flex-shrink-0" title={guess.user.nickname}>
                <img src={guess.user.profilePictureUrl} alt={guess.user.nickname} className="w-10 h-10 rounded-full"/>
            </div>
        </div>
      ))}
      
      {Array.from({ length: emptyRecentRowsCount }).map((_, i) => (
        <div key={`empty-${i}`} className="flex items-center gap-2">
            <EmptyRow wordLength={wordLength} />
            <div className="w-10 flex-shrink-0" />
        </div>
      ))}
    </div>
  );
};

export default WordleGrid;