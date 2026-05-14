import { Router } from 'express';
export const ChatRouter = Router();
import { ChatController } from '../controllers/ChatController.js';

// Endpoint que actúa de proxy hacia Llama 3.1 e implementa Tools (MCP)
ChatRouter.post('/', ChatController.chat);
