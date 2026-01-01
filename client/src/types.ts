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

export interface RoundResult {
  playerId: string;
  playerName: string;
  answer: string;
  assignment: 'TRUTH' | 'LIE';
  votersWhoCalledLie: string[];
  pointsEarned: number;
}

export type GameState =
  | 'idle'
  | 'lobby'
  | 'answering'
  | 'voting'
  | 'revealing'
  | 'scoreboard'
  | 'gameOver';
