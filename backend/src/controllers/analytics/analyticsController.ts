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
          completedAttempts: {
            $sum: { $cond: [{ $in: ['$status', ['completed', null]] }, 1, 0] } // Treat legacy null as completed
          },
          abandonedAttempts: {
            $sum: { $cond: [{ $in: ['$status', ['in_progress', 'abandoned']] }, 1, 0] }
          },
          averageScore: { $avg: '$score' },
          averageAccuracy: { $avg: '$accuracy' },
          totalXPEarned: { $sum: '$xpEarned' },
          averageXPEarned: { $avg: '$xpEarned' },
          uniqueUsers: { $addToSet: '$userId' },
          averageTimeSpentSeconds: {
            $avg: {
              $cond: [
                { $and: [{ $eq: ['$status', 'completed'] }, { $gt: ['$avgTimePerTextQuestionSeconds', 0] }] },
                '$avgTimePerTextQuestionSeconds',
                null
              ]
            }
          }
        }
      },
      // Project the final structure
      {
        $project: {
          _id: 0,
          learningMode: '$_id',
          totalAttempts: 1,
          completedAttempts: 1,
          abandonedAttempts: 1,
          dropoutRate: {
            $cond: [
              { $gt: ['$totalAttempts', 0] },
              { $multiply: [{ $divide: ['$abandonedAttempts', '$totalAttempts'] }, 100] },
              0
            ]
          },
          averageScore: 1,
          averageAccuracy: { $multiply: ['$averageAccuracy', 100] }, // Convert to percentage
          totalXPEarned: 1,
          averageXPEarned: 1,
          uniqueUsersCount: { $size: '$uniqueUsers' },
          averageTimeSpentSeconds: 1
        }
      }
    ];

    const results = await LessonAttempt.aggregate(pipeline);

    // If a group has no data, we should still return it as 0
    // If a group has no data, we should still return it as 0
    const emptyStats = { learningMode: '', totalAttempts: 0, completedAttempts: 0, abandonedAttempts: 0, dropoutRate: 0, averageScore: 0, averageAccuracy: 0, totalXPEarned: 0, averageXPEarned: 0, uniqueUsersCount: 0, averageTimeSpentSeconds: 0 };
    const formattedResults = {
      traditional: results.find(r => r.learningMode === 'traditional') || { ...emptyStats, learningMode: 'traditional' },
      music: results.find(r => r.learningMode === 'music') || { ...emptyStats, learningMode: 'music' }
    };

    res.status(200).json(formattedResults);
  } catch (error: any) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({ message: 'Failed to fetch comparison analytics' });
  }
};
