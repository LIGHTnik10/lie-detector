export interface Player {
  id: string;
  name: string;
  isHost: boolean;
  score: number;
  assignment?: 'TRUTH' | 'LIE';
  answer?: string;
  hasAnswered: boolean;
  hasVoted: boolean;
  votes: string[]; // IDs of players they voted as liars
}

export interface Room {
  code: string;
  hostId: string;
  players: Map<string, Player>;
  gameState: GameState;
  currentRound: number;
  maxRounds: number;
  currentPrompt: string | null;
  usedPrompts: string[];
  answerTimeLimit: number;
  voteTimeLimit: number;
  revealIndex: number;
  roundScores: Map<string, number>;
}

export type GameState =
  | 'lobby'
  | 'answering'
  | 'voting'
  | 'revealing'
  | 'scoreboard'
  | 'gameOver';

export interface RoundResult {
  playerId: string;
  playerName: string;
  answer: string;
  assignment: 'TRUTH' | 'LIE';
  votersWhoCalledLie: string[];
  pointsEarned: number;
}

// Socket Events
export interface ServerToClientEvents {
  roomCreated: (data: { roomCode: string }) => void;
  roomJoined: (data: { roomCode: string; player: PlayerData; players: PlayerData[] }) => void;
  playerJoined: (data: { player: PlayerData; players: PlayerData[] }) => void;
  playerLeft: (data: { playerId: string; players: PlayerData[]; newHostId?: string }) => void;
  gameStarted: (data: { round: number; maxRounds: number }) => void;
  newRound: (data: { round: number; prompt: string; assignment: 'TRUTH' | 'LIE'; timeLimit: number }) => void;
  answerProgress: (data: { answered: number; total: number }) => void;
  votingPhase: (data: { answers: AnswerData[]; timeLimit: number }) => void;
  voteProgress: (data: { voted: number; total: number }) => void;
  revealAnswer: (data: { result: RoundResult; index: number; total: number }) => void;
  roundScoreboard: (data: { players: PlayerData[]; roundScores: Record<string, number> }) => void;
  gameOver: (data: { players: PlayerData[] }) => void;
  returnedToLobby: (data: { players: PlayerData[] }) => void;
  error: (data: { message: string }) => void;
}

export interface ClientToServerEvents {
  createRoom: (data: { playerName: string }) => void;
  joinRoom: (data: { roomCode: string; playerName: string }) => void;
  startGame: () => void;
  submitAnswer: (data: { answer: string }) => void;
  submitVotes: (data: { votes: string[] }) => void;
  nextReveal: () => void;
  nextRound: () => void;
  playAgain: () => void;
  returnToLobby: () => void;
}

export interface PlayerData {
  id: string;
  name: string;
  isHost: boolean;
  score: number;
  hasAnswered?: boolean;
  hasVoted?: boolean;
}

export interface AnswerData {
  playerId: string;
  playerName: string;
  answer: string;
}
