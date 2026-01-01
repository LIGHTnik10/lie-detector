import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';
import type { PlayerData, AnswerData, RoundResult, GameState } from '../types';

interface GameContextType {
  // Connection
  socket: Socket | null;
  isConnected: boolean;

  // Room state
  roomCode: string | null;
  player: PlayerData | null;
  players: PlayerData[];
  gameState: GameState;

  // Round state
  currentRound: number;
  maxRounds: number;
  prompt: string | null;
  assignment: 'TRUTH' | 'LIE' | null;
  timeLimit: number;

  // Progress
  answeredCount: number;
  votedCount: number;
  hasAnswered: boolean;
  hasVoted: boolean;

  // Voting phase
  answers: AnswerData[];
  selectedVotes: string[];

  // Reveal phase
  currentResult: RoundResult | null;
  revealIndex: number;
  revealTotal: number;

  // Scoreboard
  roundScores: Record<string, number>;

  // Error
  error: string | null;

  // Actions
  createRoom: (playerName: string) => void;
  joinRoom: (roomCode: string, playerName: string) => void;
  startGame: () => void;
  submitAnswer: (answer: string) => void;
  toggleVote: (playerId: string) => void;
  submitVotes: () => void;
  nextReveal: () => void;
  nextRound: () => void;
  playAgain: () => void;
  returnToLobby: () => void;
  clearError: () => void;
}

const GameContext = createContext<GameContextType | null>(null);

export function useGame() {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
}

interface GameProviderProps {
  children: ReactNode;
}

export function GameProvider({ children }: GameProviderProps) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  // Room state
  const [roomCode, setRoomCode] = useState<string | null>(null);
  const [player, setPlayer] = useState<PlayerData | null>(null);
  const [players, setPlayers] = useState<PlayerData[]>([]);
  const [gameState, setGameState] = useState<GameState>('idle');

  // Round state
  const [currentRound, setCurrentRound] = useState(0);
  const [maxRounds, setMaxRounds] = useState(5);
  const [prompt, setPrompt] = useState<string | null>(null);
  const [assignment, setAssignment] = useState<'TRUTH' | 'LIE' | null>(null);
  const [timeLimit, setTimeLimit] = useState(60);

  // Progress
  const [answeredCount, setAnsweredCount] = useState(0);
  const [votedCount, setVotedCount] = useState(0);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [hasVoted, setHasVoted] = useState(false);

  // Voting phase
  const [answers, setAnswers] = useState<AnswerData[]>([]);
  const [selectedVotes, setSelectedVotes] = useState<string[]>([]);

  // Reveal phase
  const [currentResult, setCurrentResult] = useState<RoundResult | null>(null);
  const [revealIndex, setRevealIndex] = useState(0);
  const [revealTotal, setRevealTotal] = useState(0);

  // Scoreboard
  const [roundScores, setRoundScores] = useState<Record<string, number>>({});

  // Error
  const [error, setError] = useState<string | null>(null);

  // Initialize socket
  useEffect(() => {
    const serverUrl = import.meta.env.PROD
      ? window.location.origin
      : 'http://localhost:3001';

    const socketInstance = io(serverUrl, {
      transports: ['websocket', 'polling']
    });

    socketInstance.on('connect', () => {
      console.log('Connected to server');
      setIsConnected(true);
    });

    socketInstance.on('disconnect', () => {
      console.log('Disconnected from server');
      setIsConnected(false);
    });

    socketInstance.on('roomCreated', ({ roomCode }) => {
      setRoomCode(roomCode);
    });

    socketInstance.on('roomJoined', ({ roomCode, player, players }) => {
      setRoomCode(roomCode);
      setPlayer(player);
      setPlayers(players);
      setGameState('lobby');
    });

    socketInstance.on('playerJoined', ({ players }) => {
      setPlayers(players);
    });

    socketInstance.on('playerLeft', ({ players, newHostId }) => {
      setPlayers(players);
      if (newHostId) {
        setPlayer(prev => {
          if (prev && prev.id === newHostId) {
            return { ...prev, isHost: true };
          }
          return prev;
        });
      }
    });

    socketInstance.on('gameStarted', ({ round, maxRounds }) => {
      setCurrentRound(round);
      setMaxRounds(maxRounds);
    });

    socketInstance.on('newRound', ({ round, prompt, assignment, timeLimit }) => {
      setCurrentRound(round);
      setPrompt(prompt);
      setAssignment(assignment);
      setTimeLimit(timeLimit);
      setGameState('answering');
      setHasAnswered(false);
      setHasVoted(false);
      setAnsweredCount(0);
      setVotedCount(0);
      setSelectedVotes([]);
      setCurrentResult(null);
    });

    socketInstance.on('answerProgress', ({ answered }) => {
      setAnsweredCount(answered);
      setPlayers(prev => prev.map(p => ({ ...p })));
    });

    socketInstance.on('votingPhase', ({ answers, timeLimit }) => {
      setAnswers(answers);
      setTimeLimit(timeLimit);
      setGameState('voting');
      setVotedCount(0);
    });

    socketInstance.on('voteProgress', ({ voted }) => {
      setVotedCount(voted);
    });

    socketInstance.on('revealAnswer', ({ result, index, total }) => {
      setCurrentResult(result);
      setRevealIndex(index);
      setRevealTotal(total);
      setGameState('revealing');
    });

    socketInstance.on('roundScoreboard', ({ players, roundScores }) => {
      setPlayers(players);
      setRoundScores(roundScores);
      setGameState('scoreboard');
    });

    socketInstance.on('gameOver', ({ players }) => {
      setPlayers(players);
      setGameState('gameOver');
    });

    socketInstance.on('returnedToLobby', ({ players }) => {
      setPlayers(players);
      setGameState('lobby');
      setCurrentRound(0);
      setPrompt(null);
      setAssignment(null);
    });

    socketInstance.on('error', ({ message }) => {
      setError(message);
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, []);

  // Actions
  const createRoom = useCallback((playerName: string) => {
    socket?.emit('createRoom', { playerName });
  }, [socket]);

  const joinRoom = useCallback((roomCode: string, playerName: string) => {
    socket?.emit('joinRoom', { roomCode, playerName });
  }, [socket]);

  const startGame = useCallback(() => {
    socket?.emit('startGame');
  }, [socket]);

  const submitAnswer = useCallback((answer: string) => {
    socket?.emit('submitAnswer', { answer });
    setHasAnswered(true);
  }, [socket]);

  const toggleVote = useCallback((playerId: string) => {
    setSelectedVotes(prev =>
      prev.includes(playerId)
        ? prev.filter(id => id !== playerId)
        : [...prev, playerId]
    );
  }, []);

  const submitVotes = useCallback(() => {
    socket?.emit('submitVotes', { votes: selectedVotes });
    setHasVoted(true);
  }, [socket, selectedVotes]);

  const nextReveal = useCallback(() => {
    socket?.emit('nextReveal');
  }, [socket]);

  const nextRound = useCallback(() => {
    socket?.emit('nextRound');
  }, [socket]);

  const playAgain = useCallback(() => {
    socket?.emit('playAgain');
  }, [socket]);

  const returnToLobby = useCallback(() => {
    socket?.emit('returnToLobby');
  }, [socket]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const value: GameContextType = {
    socket,
    isConnected,
    roomCode,
    player,
    players,
    gameState,
    currentRound,
    maxRounds,
    prompt,
    assignment,
    timeLimit,
    answeredCount,
    votedCount,
    hasAnswered,
    hasVoted,
    answers,
    selectedVotes,
    currentResult,
    revealIndex,
    revealTotal,
    roundScores,
    error,
    createRoom,
    joinRoom,
    startGame,
    submitAnswer,
    toggleVote,
    submitVotes,
    nextReveal,
    nextRound,
    playAgain,
    returnToLobby,
    clearError
  };

  return (
    <GameContext.Provider value={value}>
      {children}
    </GameContext.Provider>
  );
}
