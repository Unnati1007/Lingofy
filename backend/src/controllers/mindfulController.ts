import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import MindfulListeningTrack from '../models/mindful/MindfulListeningTrack';

export const getTracksByLanguage = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // req.user is guaranteed to exist due to the protect middleware
    console.log('User in getTracksByLanguage:', req.user);
    const userLang = req.user.learningLanguage?.toLowerCase() || 'hindi';
    console.log('Resolved userLang:', userLang);
    
    // We allow fetching for a specific language via query if needed, fallback to user's language
    const langQuery = (req.query.language as string)?.toLowerCase() || userLang;

    const tracks = await MindfulListeningTrack.find({ language: langQuery }).sort({ createdAt: -1 });
    res.status(200).json(tracks);
  } catch (error: any) {
    console.error('Error fetching mindful listening tracks:', error);
    res.status(500).json({ message: 'Error fetching tracks' });
  }
};
