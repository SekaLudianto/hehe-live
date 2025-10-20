import React, { useState, useEffect, useCallback, useRef } from 'react';
import WordleGrid from './WordleGrid';
import Modal from './Modal';
import { ChatMessage, GuessData, TileStatus, User } from '../types';
import wordService from '../services/wordService';
import { SpinnerIcon } from './icons/SpinnerIcon';

interface WordleGameProps {
    latestChatMessage: ChatMessage | null;
    isConnected: boolean;
    updateLeaderboard: (winner: User) => void;
}

const WORD_LENGTH = 5;
const TIMER_DURATION = 300; // 5 menit dalam detik

const calculateStatuses = (guess: string, solution: string): TileStatus[] => {
    const guessChars = guess.split('');
    const solutionChars = solution.split('');
    const statuses: TileStatus[] = Array(solution.length).fill('absent');
  
    // Find 'correct' matches
    guessChars.forEach((letter, i) => {
      if (solutionChars[i] === letter) {
        statuses[i] = 'correct';
        solutionChars[i] = ''; // Mark as used
      }
    });
  
    // Find 'present' matches
    guessChars.forEach((letter, i) => {
      if (statuses[i] !== 'correct') {
        const indexInSolution = solutionChars.indexOf(letter);
        if (indexInSolution !== -1) {
          statuses[i] = 'present';
          solutionChars[indexInSolution] = ''; // Mark as used
        }
      }
    });
  
    return statuses;
};

const calculateScore = (statuses: TileStatus[]): number => {
    return statuses.reduce((score, status) => {
        if (status === 'correct') return score + 2;
        if (status === 'present') return score + 1;
        return score;
    }, 0);
};


const WordleGame: React.FC<WordleGameProps> = ({ latestChatMessage, isConnected, updateLeaderboard }) => {
    const [targetWord, setTargetWord] = useState<string>('');
    const [guessHistory, setGuessHistory] = useState<GuessData[]>([]);
    const [bestGuess, setBestGuess] = useState<GuessData | null>(null);
    const [recentGuesses, setRecentGuesses] = useState<GuessData[]>([]);

    const [isGameOver, setIsGameOver] = useState(false);
    const [gameMessage, setGameMessage] = useState<string>('');
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalContent, setModalContent] = useState<{ title: string; word: string; definitions: string[]; examples: string[], winner?: User }>({ title: '', word: '', definitions: [], examples: [], winner: undefined });
    const [validationToast, setValidationToast] = useState<{ show: boolean, content: string }>({ show: false, content: '' });
    const [timeLeft, setTimeLeft] = useState<number | null>(null);

    const isProcessingGuess = useRef(false);
    const processedGuesses = useRef(new Set<string>());
    const validationTimeoutRef = useRef<number | null>(null);
    const timerIntervalRef = useRef<number | null>(null);
    const lastProcessedMessageRef = useRef<ChatMessage | null>(null);
    const isEndingGame = useRef(false);
    const modalTimeoutRef = useRef<number | null>(null);
    const restartTimeoutRef = useRef<number | null>(null);


    const showValidationToast = (content: string) => {
        if(validationTimeoutRef.current) {
            clearTimeout(validationTimeoutRef.current);
        }
        setValidationToast({ show: true, content });
        validationTimeoutRef.current = window.setTimeout(() => {
            setValidationToast({ show: false, content: '' });
        }, 3000);
    };

    const clearTimer = useCallback(() => {
        if (timerIntervalRef.current) {
            clearInterval(timerIntervalRef.current);
            timerIntervalRef.current = null;
        }
    }, []);

    const startNewGame = useCallback(async () => {
        setIsLoading(true);
        setGameMessage('Membuat kata baru...');
        
        clearTimer();
        if (modalTimeoutRef.current) clearTimeout(modalTimeoutRef.current);
        if (restartTimeoutRef.current) clearTimeout(restartTimeoutRef.current);

        isEndingGame.current = false;
        
        setGuessHistory([]);
        setBestGuess(null);
        setRecentGuesses([]);
        
        setIsGameOver(false);
        setGameMessage('');
        processedGuesses.current.clear();

        await wordService.initialize();
        const newWord = wordService.getRandomWord(WORD_LENGTH);
        setTargetWord(newWord);
        console.log(`New Game (Timer Mode): ${newWord}`);
        
        setTimeLeft(TIMER_DURATION);

        setIsLoading(false);
    }, [clearTimer]);

    useEffect(() => {
        startNewGame();
    }, []);
    
    const autoRestartGame = useCallback(() => {
        if (restartTimeoutRef.current) {
            clearTimeout(restartTimeoutRef.current);
        }
        setIsModalOpen(false);
        setTimeout(() => {
            startNewGame();
        }, 500);
    }, [startNewGame]);

    useEffect(() => {
        if (timeLeft !== null && timeLeft > 0 && !isGameOver) {
            timerIntervalRef.current = window.setInterval(() => {
                setTimeLeft(prevTime => (prevTime !== null ? prevTime - 1 : null));
            }, 1000);
        } else if (timeLeft === 0 && !isGameOver) {
            if (isEndingGame.current) return;
            isEndingGame.current = true;

            clearTimer();
            setGameMessage(`WAKTU HABIS! Kata yang benar adalah ${targetWord}`);
            setIsGameOver(true);
            modalTimeoutRef.current = window.setTimeout(() => {
                const def = wordService.getWordDefinition(targetWord);
                setModalContent({
                    title: 'WAKTU HABIS!',
                    word: targetWord,
                    definitions: def?.submakna || ['Definisi tidak ditemukan.'],
                    examples: def?.contoh || [],
                    winner: undefined,
                });
                setIsModalOpen(true);
                restartTimeoutRef.current = window.setTimeout(autoRestartGame, 5000);
            }, 1500);
        }

        return () => clearTimer();
    }, [timeLeft, isGameOver, targetWord, clearTimer, autoRestartGame]);

    const handleGuess = useCallback(async (guess: string, user: ChatMessage) => {
        if (!isConnected) return;
    
        const upperGuess = guess.toUpperCase();
    
        if (isGameOver || isProcessingGuess.current || upperGuess.length !== WORD_LENGTH) {
            return;
        }

        const isValid = wordService.isValidWord(guess);
    
        if (!isValid) {
            const toastContent = `Kata <b>${upperGuess}</b> tidak valid! <br/><span class="text-xs opacity-75">Dari: ${user.nickname}</span>`;
            showValidationToast(toastContent);
            return;
        }
    
        if (processedGuesses.current.has(upperGuess)) {
            return;
        }

        isProcessingGuess.current = true;
        
        processedGuesses.current.add(upperGuess);
        const statuses = calculateStatuses(upperGuess, targetWord);
        const newGuessData: GuessData = { guess: upperGuess, user, statuses };
        
        setGuessHistory(prev => [...prev, newGuessData]);
        
        // Update recent and best guesses
        setRecentGuesses(prev => [newGuessData, ...prev].slice(0, 5));
        
        const newScore = calculateScore(statuses);
        setBestGuess(prevBest => {
            const prevBestScore = prevBest ? calculateScore(prevBest.statuses) : -1;
            return newScore > prevBestScore ? newGuessData : prevBest;
        });

        if (upperGuess === targetWord) {
            if (isEndingGame.current) {
                isProcessingGuess.current = false;
                return;
            };
            isEndingGame.current = true;

            clearTimer();
            setTimeLeft(null);
            setGameMessage(`BERHASIL! ${user.nickname} menebak kata yang benar!`);
            setIsGameOver(true);
            updateLeaderboard(user);
            
            modalTimeoutRef.current = window.setTimeout(() => {
                const def = wordService.getWordDefinition(targetWord);
                setModalContent({
                    title: '🎉 PEMENANG! 🎉',
                    word: targetWord,
                    definitions: def?.submakna || ['Definisi tidak ditemukan.'],
                    examples: def?.contoh || [],
                    winner: user,
                });
                setIsModalOpen(true);
                restartTimeoutRef.current = window.setTimeout(autoRestartGame, 5000);
            }, 1500);
        }
        
        setTimeout(() => { isProcessingGuess.current = false; }, 250);
    }, [isGameOver, isConnected, targetWord, clearTimer, updateLeaderboard, autoRestartGame]);

    useEffect(() => {
        if (latestChatMessage && latestChatMessage !== lastProcessedMessageRef.current) {
            lastProcessedMessageRef.current = latestChatMessage;
            const potentialGuess = latestChatMessage.comment.trim();
            if (potentialGuess.length === WORD_LENGTH && /^[a-zA-Z]+$/.test(potentialGuess)) {
                handleGuess(potentialGuess, latestChatMessage);
            }
        }
    }, [latestChatMessage, handleGuess]);
    
    const formatTime = (seconds: number | null) => {
        if (seconds === null) return null;
        const minutes = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <>
            <div className="bg-gray-900/50 p-4 md:p-6 rounded-lg flex flex-col h-full">
                
                {timeLeft !== null && (
                    <div className="bg-gray-800/50 rounded-lg p-2 my-2">
                        <div className={`text-center text-4xl font-bold ${timeLeft <= 30 ? 'text-red-500 animate-pulse' : 'text-white'}`}>
                            {formatTime(timeLeft)}
                        </div>
                    </div>
                )}
                
                <p className="text-center text-gray-400 mb-4 text-sm">
                    {isConnected ? 'Kata valid pertama dari chat akan menjadi tebakan!' : 'Hubungkan ke TikTok LIVE untuk memulai!'}
                </p>
                <div className="w-full max-w-sm mx-auto flex flex-col justify-center flex-grow">
                    {isLoading ? (
                        <div className="flex items-center justify-center h-full">
                            <SpinnerIcon className="w-10 h-10" />
                        </div>
                    ) : (
                        <WordleGrid 
                            bestGuess={bestGuess}
                            recentGuesses={recentGuesses}
                            wordLength={WORD_LENGTH} 
                        />
                    )}
                </div>
                <div className="text-center text-lg font-medium mt-4 h-6 text-cyan-400">{gameMessage}</div>
                <div className="mt-4 flex justify-center">
                    <button onClick={() => startNewGame()} className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-2 px-4 rounded-lg transition-transform transform hover:scale-105">
                        Game Baru
                    </button>
                </div>
            </div>

            <Modal isOpen={isModalOpen} onClose={autoRestartGame} title={modalContent.title}>
                 {modalContent.winner ? (
                    <div className="text-center">
                        <img src={modalContent.winner.profilePictureUrl} alt={modalContent.winner.nickname} className="w-24 h-24 rounded-full mx-auto mb-4 border-4 border-cyan-400"/>
                        <p className="text-xl font-bold text-white">{modalContent.winner.nickname}</p>
                        <p>Berhasil menebak kata:</p>
                        <p className="text-cyan-400 text-2xl font-bold my-2">{modalContent.word}</p>
                         {modalContent.definitions.length > 0 && modalContent.definitions[0] !== 'Definisi tidak ditemukan.' && (
                             <div className="mt-2 pt-2 border-t border-gray-700 text-left">
                                 <p className="font-semibold">Definisi:</p>
                                 <ul className="text-sm list-disc list-inside space-y-1">
                                    {modalContent.definitions.map((def, i) => <li key={i}>{def}</li>)}
                                 </ul>
                                  {modalContent.examples.length > 0 && (
                                    <>
                                     <p className="font-semibold mt-2">Contoh:</p>
                                     <ul className="text-sm list-disc list-inside space-y-1">
                                        {modalContent.examples.map((ex, i) => <li key={i} className="italic">"{ex}"</li>)}
                                     </ul>
                                    </>
                                  )}
                             </div>
                         )}
                    </div>
                 ) : (
                    <>
                         <p>Kata rahasianya adalah: <b className="text-cyan-400 text-xl">{modalContent.word}</b></p>
                         {modalContent.definitions.length > 0 && modalContent.definitions[0] !== 'Definisi tidak ditemukan.' && (
                             <div className="mt-2 pt-2 border-t border-gray-700 text-left">
                                 <p className="font-semibold">Definisi:</p>
                                 <ul className="text-sm list-disc list-inside space-y-1">
                                    {modalContent.definitions.map((def, i) => <li key={i}>{def}</li>)}
                                 </ul>
                                  {modalContent.examples.length > 0 && (
                                    <>
                                     <p className="font-semibold mt-2">Contoh:</p>
                                     <ul className="text-sm list-disc list-inside space-y-1">
                                        {modalContent.examples.map((ex, i) => <li key={i} className="italic">"{ex}"</li>)}
                                     </ul>
                                    </>
                                  )}
                             </div>
                         )}
                    </>
                 )}
                 <p className="text-xs text-gray-400 mt-4">Game baru akan dimulai secara otomatis...</p>
            </Modal>
            
            <div id="validationToast" className={`fixed top-28 right-5 bg-red-600 text-white py-3 px-5 rounded-lg shadow-lg z-50 transition-all duration-300 ease-in-out ${validationToast.show ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-full'}`}>
                <p dangerouslySetInnerHTML={{ __html: validationToast.content }} />
            </div>
        </>
    );
};

export default WordleGame;