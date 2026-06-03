import { Request, Response } from 'express';
import LessonAttempt from '../../models/LessonAttempt';

export const getComparisonAnalytics = async (req: Request, res: Response) => {
  try {
    const pipeline = [
      // Lookup the user to get their learning mode
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'user'
        }
      },
      // Unwind the user array
      {
        $unwind: '$user'
      },
      // Calculate derived fields per attempt (e.g., accuracy percentage)
      {
        $addFields: {
          totalQuestions: { $size: '$questions' },
          accuracy: {
            $cond: [
              { $gt: [{ $size: '$questions' }, 0] },
              { $divide: ['$score', { $size: '$questions' }] },
              0
            ]
          }
        }
      },
      // Group by learning mode
      {
        $group: {
          _id: '$user.learningMode',
          totalAttempts: { $sum: 1 },
          averageScore: { $avg: '$score' },
          averageAccuracy: { $avg: '$accuracy' },
          totalXPEarned: { $sum: '$xpEarned' },
          averageXPEarned: { $avg: '$xpEarned' },
          uniqueUsers: { $addToSet: '$userId' }
        }
      },
      // Project the final structure
      {
        $project: {
          _id: 0,
          learningMode: '$_id',
          totalAttempts: 1,
          averageScore: 1,
          averageAccuracy: { $multiply: ['$averageAccuracy', 100] }, // Convert to percentage
          totalXPEarned: 1,
          averageXPEarned: 1,
          uniqueUsersCount: { $size: '$uniqueUsers' }
        }
      }
    ];

    const results = await LessonAttempt.aggregate(pipeline);

    // If a group has no data, we should still return it as 0
    const formattedResults = {
      traditional: results.find(r => r.learningMode === 'traditional') || { learningMode: 'traditional', totalAttempts: 0, averageScore: 0, averageAccuracy: 0, totalXPEarned: 0, averageXPEarned: 0, uniqueUsersCount: 0 },
      music: results.find(r => r.learningMode === 'music') || { learningMode: 'music', totalAttempts: 0, averageScore: 0, averageAccuracy: 0, totalXPEarned: 0, averageXPEarned: 0, uniqueUsersCount: 0 }
    };

    res.status(200).json(formattedResults);
  } catch (error: any) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({ message: 'Failed to fetch comparison analytics' });
  }
};
