'use strict';

const { Server } = require('socket.io');

// Track live attempts in memory
// { [attemptId]: { id, examId, studentName, startedAt, endTime, status, flags: [], socketId } }
const liveAttempts = new Map();

let io;

const init = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST']
    }
  });

  io.on('connection', (socket) => {
    
    // Student joins an exam session
    socket.on('join_exam', (data) => {
      const { attemptId, examId, studentName, startedAt, endTime } = data;
      
      console.log(`[SOCKET SERVER] Student ${studentName} (${attemptId}) emitting join_exam for exam ${examId}`);
      socket.join(`exam_${examId}`);
      
      const existingAttempt = liveAttempts.get(attemptId);
      
      const attempt = {
        id: attemptId,
        examId,
        studentName,
        startedAt: existingAttempt ? existingAttempt.startedAt : startedAt,
        endTime: existingAttempt ? existingAttempt.endTime : endTime,
        status: 'active',
        flags: existingAttempt ? existingAttempt.flags : [],
        socketId: socket.id
      };
      
      liveAttempts.set(attemptId, attempt);
      
      // Notify admins
      console.log(`[SOCKET SERVER] Re-emitting attempt_update for ${attemptId} to admin_${examId}`);
      io.to(`admin_${examId}`).emit('attempt_update', attempt);
    });

    // Student emits a flag (e.g. tab switch)
    socket.on('flag_event', (data) => {
      const { attemptId, type, description, timestamp } = data;
      const attempt = liveAttempts.get(attemptId);
      if (attempt) {
        console.log(`[SOCKET SERVER] Received flag_event from ${attemptId}`);
        const flag = { type, description, timestamp: timestamp || new Date().toISOString() };
        attempt.flags.push(flag);
        console.log(`[SOCKET SERVER] Re-emitting flag_event for ${attemptId} to admin_${attempt.examId}`);
        io.to(`admin_${attempt.examId}`).emit('flag_event', { attemptId, flag });
      }
    });
    
    // Admin joins to monitor an exam
    const adminExamId = socket.handshake.query.examId;
    if (adminExamId) {
      socket.join(`admin_${adminExamId}`);
    }

    socket.on('disconnect', () => {
      // Find if this was a student
      for (const [attemptId, attempt] of liveAttempts.entries()) {
        if (attempt.socketId === socket.id) {
          attempt.status = 'disconnected';
          io.to(`admin_${attempt.examId}`).emit('attempt_update', attempt);
          break;
        }
      }
    });
  });
};

const getLiveAttempts = (examId) => {
  const attempts = [];
  for (const attempt of liveAttempts.values()) {
    if (attempt.examId === examId) {
      attempts.push(attempt);
    }
  }
  return attempts;
};

const removeAttempt = (attemptId) => {
  const attempt = liveAttempts.get(attemptId);
  if (attempt) {
    attempt.status = 'submitted';
    io?.to(`admin_${attempt.examId}`).emit('attempt_update', attempt);
    liveAttempts.delete(attemptId);
  }
};

const broadcastToExam = (examId, message) => {
  if (io) {
    io.to(`exam_${examId}`).emit('broadcast', { message });
  }
};

const forceSubmit = (attemptId) => {
  const attempt = liveAttempts.get(attemptId);
  if (attempt && io) {
    io.to(attempt.socketId).emit('force_submit');
    attempt.status = 'submitted';
    io.to(`admin_${attempt.examId}`).emit('attempt_update', attempt);
  }
};

const extendTime = (attemptId, minutes) => {
  const attempt = liveAttempts.get(attemptId);
  if (attempt && io) {
    // Update internal endTime
    if (attempt.endTime) {
      const date = new Date(attempt.endTime);
      date.setMinutes(date.getMinutes() + minutes);
      attempt.endTime = date.toISOString();
    }
    io.to(attempt.socketId).emit('extend_time', { minutes });
    io.to(`admin_${attempt.examId}`).emit('attempt_update', attempt);
  }
};

const getAllLiveAttempts = () => {
  return Array.from(liveAttempts.values());
};

module.exports = {
  init,
  getLiveAttempts,
  getAllLiveAttempts,
  removeAttempt,
  broadcastToExam,
  forceSubmit,
  extendTime,
};
