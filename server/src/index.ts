import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { prompts } from './prompts.js';
import type {
  Room,
  Player,
  PlayerData,
  AnswerData,
  RoundResult,
  ServerToClientEvents,
  ClientToServerEvents
} from './types.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const httpServer = createServer(app);

const io = new Server<ClientToServerEvents, ServerToClientEvents>(httpServer, {
  cors: {
    origin: process.env.NODE_ENV === 'production'
      ? false
      : ['http://localhost:5173', 'http://localhost:3000'],
    methods: ['GET', 'POST']
  }
});

app.use(cors());
app.use(express.json());

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../../client/dist')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../../client/dist/index.html'));
  });
}

// In-memory storage
const rooms = new Map<string, Room>();
const playerRooms = new Map<string, string>(); // socketId -> roomCode

// Helper functions
function generateRoomCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  let code = '';
  for (let i = 0; i < 4; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

function getUniqueRoomCode(): string {
  let code = generateRoomCode();
  while (rooms.has(code)) {
    code = generateRoomCode();
  }
  return code;
}

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function getPlayerData(player: Player): PlayerData {
  return {
    id: player.id,
    name: player.name,
    isHost: player.isHost,
    score: player.score,
    hasAnswered: player.hasAnswered,
    hasVoted: player.hasVoted
  };
}

function getPlayersData(room: Room): PlayerData[] {
  return Array.from(room.players.values()).map(getPlayerData);
}

function getRandomPrompt(room: Room): string {
  const available = prompts.filter(p => !room.usedPrompts.includes(p));
  if (available.length === 0) {
    room.usedPrompts = [];
    return prompts[Math.floor(Math.random() * prompts.length)];
  }
  const prompt = available[Math.floor(Math.random() * available.length)];
  room.usedPrompts.push(prompt);
  return prompt;
}

function assignTruthOrLie(room: Room): void {
  const players = Array.from(room.players.values());
  const shuffled = shuffleArray(players);

  // Roughly half truth, half lie
  const halfPoint = Math.ceil(shuffled.length / 2);

  shuffled.forEach((player, index) => {
    player.assignment = index < halfPoint ? 'TRUTH' : 'LIE';
    player.answer = undefined;
    player.hasAnswered = false;
    player.hasVoted = false;
    player.votes = [];
  });
}

function calculateRoundScores(room: Room): Map<string, number> {
  const scores = new Map<string, number>();
  const players = Array.from(room.players.values());

  players.forEach(player => {
    scores.set(player.id, 0);
  });

  players.forEach(player => {
    const votersWhoCalledLie = players.filter(
      p => p.id !== player.id && p.votes.includes(player.id)
    );

    if (player.assignment === 'TRUTH') {
      // +1 for each player who correctly believed you (didn't mark as lie)
      const believedCount = players.filter(
        p => p.id !== player.id && !p.votes.includes(player.id)
      ).length;
      scores.set(player.id, (scores.get(player.id) || 0) + believedCount);
    } else {
      // LIE: +1 for each player you fooled (didn't mark as lie)
      const fooledCount = players.filter(
        p => p.id !== player.id && !p.votes.includes(player.id)
      ).length;
      scores.set(player.id, (scores.get(player.id) || 0) + fooledCount);
    }
  });

  // Voting accuracy points
  players.forEach(voter => {
    voter.votes.forEach(votedPlayerId => {
      const votedPlayer = room.players.get(votedPlayerId);
      if (votedPlayer) {
        if (votedPlayer.assignment === 'LIE') {
          // +2 for correctly identifying a lie
          scores.set(voter.id, (scores.get(voter.id) || 0) + 2);
        }
      }
    });

    // +1 for each truth correctly believed
    players.forEach(p => {
      if (p.id !== voter.id && p.assignment === 'TRUTH' && !voter.votes.includes(p.id)) {
        scores.set(voter.id, (scores.get(voter.id) || 0) + 1);
      }
    });
  });

  return scores;
}

function getRoundResults(room: Room): RoundResult[] {
  const players = Array.from(room.players.values());
  const roundScores = room.roundScores;

  return players.map(player => {
    const votersWhoCalledLie = players
      .filter(p => p.id !== player.id && p.votes.includes(player.id))
      .map(p => p.name);

    return {
      playerId: player.id,
      playerName: player.name,
      answer: player.answer || '(No answer)',
      assignment: player.assignment!,
      votersWhoCalledLie,
      pointsEarned: roundScores.get(player.id) || 0
    };
  });
}

// Socket.IO handlers
io.on('connection', (socket) => {
  console.log(`Client connected: ${socket.id}`);

  socket.on('createRoom', ({ playerName }) => {
    const roomCode = getUniqueRoomCode();

    const player: Player = {
      id: socket.id,
      name: playerName,
      isHost: true,
      score: 0,
      hasAnswered: false,
      hasVoted: false,
      votes: []
    };

    const room: Room = {
      code: roomCode,
      hostId: socket.id,
      players: new Map([[socket.id, player]]),
      gameState: 'lobby',
      currentRound: 0,
      maxRounds: 5,
      currentPrompt: null,
      usedPrompts: [],
      answerTimeLimit: 60,
      voteTimeLimit: 45,
      revealIndex: 0,
      roundScores: new Map()
    };

    rooms.set(roomCode, room);
    playerRooms.set(socket.id, roomCode);
    socket.join(roomCode);

    socket.emit('roomCreated', { roomCode });
    socket.emit('roomJoined', {
      roomCode,
      player: getPlayerData(player),
      players: getPlayersData(room)
    });

    console.log(`Room ${roomCode} created by ${playerName}`);
  });

  socket.on('joinRoom', ({ roomCode, playerName }) => {
    const code = roomCode.toUpperCase();
    const room = rooms.get(code);

    if (!room) {
      socket.emit('error', { message: 'Room not found' });
      return;
    }

    if (room.gameState !== 'lobby') {
      socket.emit('error', { message: 'Game already in progress' });
      return;
    }

    if (room.players.size >= 8) {
      socket.emit('error', { message: 'Room is full' });
      return;
    }

    const nameTaken = Array.from(room.players.values()).some(
      p => p.name.toLowerCase() === playerName.toLowerCase()
    );
    if (nameTaken) {
      socket.emit('error', { message: 'Name already taken' });
      return;
    }

    const player: Player = {
      id: socket.id,
      name: playerName,
      isHost: false,
      score: 0,
      hasAnswered: false,
      hasVoted: false,
      votes: []
    };

    room.players.set(socket.id, player);
    playerRooms.set(socket.id, code);
    socket.join(code);

    socket.emit('roomJoined', {
      roomCode: code,
      player: getPlayerData(player),
      players: getPlayersData(room)
    });

    socket.to(code).emit('playerJoined', {
      player: getPlayerData(player),
      players: getPlayersData(room)
    });

    console.log(`${playerName} joined room ${code}`);
  });

  socket.on('startGame', () => {
    const roomCode = playerRooms.get(socket.id);
    if (!roomCode) return;

    const room = rooms.get(roomCode);
    if (!room) return;

    if (room.hostId !== socket.id) {
      socket.emit('error', { message: 'Only the host can start the game' });
      return;
    }

    if (room.players.size < 3) {
      socket.emit('error', { message: 'Need at least 3 players' });
      return;
    }

    room.currentRound = 1;
    room.gameState = 'answering';
    room.currentPrompt = getRandomPrompt(room);
    assignTruthOrLie(room);

    io.to(roomCode).emit('gameStarted', {
      round: room.currentRound,
      maxRounds: room.maxRounds
    });

    // Send individual assignments to each player
    room.players.forEach((player, playerId) => {
      io.to(playerId).emit('newRound', {
        round: room.currentRound,
        prompt: room.currentPrompt!,
        assignment: player.assignment!,
        timeLimit: room.answerTimeLimit
      });
    });

    console.log(`Game started in room ${roomCode}`);
  });

  socket.on('submitAnswer', ({ answer }) => {
    const roomCode = playerRooms.get(socket.id);
    if (!roomCode) return;

    const room = rooms.get(roomCode);
    if (!room || room.gameState !== 'answering') return;

    const player = room.players.get(socket.id);
    if (!player || player.hasAnswered) return;

    player.answer = answer;
    player.hasAnswered = true;

    const answered = Array.from(room.players.values()).filter(p => p.hasAnswered).length;
    const total = room.players.size;

    io.to(roomCode).emit('answerProgress', { answered, total });

    // Check if all players answered
    if (answered === total) {
      startVotingPhase(room, roomCode);
    }
  });

  socket.on('submitVotes', ({ votes }) => {
    const roomCode = playerRooms.get(socket.id);
    if (!roomCode) return;

    const room = rooms.get(roomCode);
    if (!room || room.gameState !== 'voting') return;

    const player = room.players.get(socket.id);
    if (!player || player.hasVoted) return;

    player.votes = votes;
    player.hasVoted = true;

    const voted = Array.from(room.players.values()).filter(p => p.hasVoted).length;
    const total = room.players.size;

    io.to(roomCode).emit('voteProgress', { voted, total });

    // Check if all players voted
    if (voted === total) {
      startRevealPhase(room, roomCode);
    }
  });

  socket.on('nextReveal', () => {
    const roomCode = playerRooms.get(socket.id);
    if (!roomCode) return;

    const room = rooms.get(roomCode);
    if (!room || room.gameState !== 'revealing') return;
    if (room.hostId !== socket.id) return;

    room.revealIndex++;
    const results = getRoundResults(room);

    if (room.revealIndex < results.length) {
      io.to(roomCode).emit('revealAnswer', {
        result: results[room.revealIndex],
        index: room.revealIndex,
        total: results.length
      });
    } else {
      // All revealed, show scoreboard
      showRoundScoreboard(room, roomCode);
    }
  });

  socket.on('nextRound', () => {
    const roomCode = playerRooms.get(socket.id);
    if (!roomCode) return;

    const room = rooms.get(roomCode);
    if (!room || room.gameState !== 'scoreboard') return;
    if (room.hostId !== socket.id) return;

    if (room.currentRound >= room.maxRounds) {
      // Game over
      room.gameState = 'gameOver';
      const sortedPlayers = Array.from(room.players.values())
        .sort((a, b) => b.score - a.score);
      io.to(roomCode).emit('gameOver', { players: sortedPlayers.map(getPlayerData) });
    } else {
      // Start next round
      room.currentRound++;
      room.gameState = 'answering';
      room.currentPrompt = getRandomPrompt(room);
      assignTruthOrLie(room);

      room.players.forEach((player, playerId) => {
        io.to(playerId).emit('newRound', {
          round: room.currentRound,
          prompt: room.currentPrompt!,
          assignment: player.assignment!,
          timeLimit: room.answerTimeLimit
        });
      });
    }
  });

  socket.on('playAgain', () => {
    const roomCode = playerRooms.get(socket.id);
    if (!roomCode) return;

    const room = rooms.get(roomCode);
    if (!room) return;
    if (room.hostId !== socket.id) return;

    // Reset scores and start new game
    room.players.forEach(player => {
      player.score = 0;
      player.hasAnswered = false;
      player.hasVoted = false;
      player.votes = [];
    });
    room.currentRound = 1;
    room.gameState = 'answering';
    room.usedPrompts = [];
    room.currentPrompt = getRandomPrompt(room);
    assignTruthOrLie(room);

    io.to(roomCode).emit('gameStarted', {
      round: room.currentRound,
      maxRounds: room.maxRounds
    });

    room.players.forEach((player, playerId) => {
      io.to(playerId).emit('newRound', {
        round: room.currentRound,
        prompt: room.currentPrompt!,
        assignment: player.assignment!,
        timeLimit: room.answerTimeLimit
      });
    });
  });

  socket.on('returnToLobby', () => {
    const roomCode = playerRooms.get(socket.id);
    if (!roomCode) return;

    const room = rooms.get(roomCode);
    if (!room) return;
    if (room.hostId !== socket.id) return;

    // Reset everything
    room.players.forEach(player => {
      player.score = 0;
      player.hasAnswered = false;
      player.hasVoted = false;
      player.votes = [];
      player.assignment = undefined;
      player.answer = undefined;
    });
    room.currentRound = 0;
    room.gameState = 'lobby';
    room.usedPrompts = [];
    room.currentPrompt = null;

    io.to(roomCode).emit('returnedToLobby', { players: getPlayersData(room) });
  });

  socket.on('disconnect', () => {
    const roomCode = playerRooms.get(socket.id);
    if (!roomCode) return;

    const room = rooms.get(roomCode);
    if (!room) return;

    room.players.delete(socket.id);
    playerRooms.delete(socket.id);

    if (room.players.size === 0) {
      rooms.delete(roomCode);
      console.log(`Room ${roomCode} deleted (empty)`);
      return;
    }

    // Transfer host if needed
    let newHostId: string | undefined;
    if (room.hostId === socket.id) {
      const firstPlayer = room.players.values().next().value;
      if (firstPlayer) {
        firstPlayer.isHost = true;
        room.hostId = firstPlayer.id;
        newHostId = firstPlayer.id;
      }
    }

    io.to(roomCode).emit('playerLeft', {
      playerId: socket.id,
      players: getPlayersData(room),
      newHostId
    });

    console.log(`Player ${socket.id} left room ${roomCode}`);
  });
});

function startVotingPhase(room: Room, roomCode: string): void {
  room.gameState = 'voting';

  const answers: AnswerData[] = Array.from(room.players.values()).map(p => ({
    playerId: p.id,
    playerName: p.name,
    answer: p.answer || '(No answer)'
  }));

  io.to(roomCode).emit('votingPhase', {
    answers: shuffleArray(answers),
    timeLimit: room.voteTimeLimit
  });
}

function startRevealPhase(room: Room, roomCode: string): void {
  room.gameState = 'revealing';
  room.revealIndex = 0;
  room.roundScores = calculateRoundScores(room);

  // Apply round scores to player totals
  room.roundScores.forEach((points, playerId) => {
    const player = room.players.get(playerId);
    if (player) {
      player.score += points;
    }
  });

  const results = getRoundResults(room);

  io.to(roomCode).emit('revealAnswer', {
    result: results[0],
    index: 0,
    total: results.length
  });
}

function showRoundScoreboard(room: Room, roomCode: string): void {
  room.gameState = 'scoreboard';

  const sortedPlayers = Array.from(room.players.values())
    .sort((a, b) => b.score - a.score);

  const roundScoresObj: Record<string, number> = {};
  room.roundScores.forEach((value, key) => {
    roundScoresObj[key] = value;
  });

  io.to(roomCode).emit('roundScoreboard', {
    players: sortedPlayers.map(getPlayerData),
    roundScores: roundScoresObj
  });
}

const PORT = process.env.PORT || 3001;

httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
