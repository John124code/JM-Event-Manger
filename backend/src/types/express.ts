import { Request } from 'express';
import mongoose from 'mongoose';
import { IUser } from '../models/User';

export interface AuthRequest extends Request {
  user?: IUser & { _id: mongoose.Types.ObjectId };
}
