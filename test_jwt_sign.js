import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';

// Create a dummy ObjectId like mongoose would
const dummyId = new mongoose.Types.ObjectId();

// Sign it
const token = jwt.sign({ id: dummyId }, 'secret');

// Decode it
const decoded = jwt.verify(token, 'secret');
console.log("Decoded:", decoded);
console.log("Type of id:", typeof decoded.id);
