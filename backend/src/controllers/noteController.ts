import { Response } from "express";
import Note from "../models/note/Note";
import { AuthRequest } from "../middleware/authMiddleware";

// @desc    Get all notes and tough words for current user
// @route   GET /api/notes
// @access  Private
export const getNotes = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { type, language, mastered, search } = req.query;

    const query: any = { userId: req.user._id };

    if (type && (type === 'vocabulary' || type === 'note')) {
      query.type = type;
    }

    if (language && language !== 'all') {
      query.language = (language as string).toLowerCase();
    }

    if (mastered !== undefined && mastered !== 'all') {
      query.mastered = mastered === 'true';
    }

    if (search && typeof search === 'string' && search.trim() !== '') {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { word: searchRegex },
        { meaning: searchRegex },
        { title: searchRegex },
        { content: searchRegex },
        { contextSentence: searchRegex },
        { notes: searchRegex },
        { tags: searchRegex }
      ];
    }

    const notes = await Note.find(query).sort({ createdAt: -1 });
    res.json(notes);
  } catch (error: any) {
    res.status(500).json({ message: error.message || "Failed to fetch notes" });
  }
};

// @desc    Get notes statistics for current user
// @route   GET /api/notes/stats
// @access  Private
export const getNoteStats = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user._id;

    const [totalNotes, totalToughWords, masteredWords, languageStats] = await Promise.all([
      Note.countDocuments({ userId, type: 'note' }),
      Note.countDocuments({ userId, type: 'vocabulary' }),
      Note.countDocuments({ userId, type: 'vocabulary', mastered: true }),
      Note.aggregate([
        { $match: { userId } },
        {
          $group: {
            _id: "$language",
            count: { $sum: 1 },
            masteredCount: {
              $sum: { $cond: [{ $eq: ["$mastered", true] }, 1, 0] }
            }
          }
        }
      ])
    ]);

    res.json({
      totalNotes,
      totalToughWords,
      masteredWords,
      activeToughWords: Math.max(0, totalToughWords - masteredWords),
      languageStats
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message || "Failed to fetch note statistics" });
  }
};

// @desc    Create a new note or tough word
// @route   POST /api/notes
// @access  Private
export const createNote = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const {
      type = "vocabulary",
      word,
      meaning,
      language = "spanish",
      contextSentence,
      source = "manual",
      title,
      content,
      tags = [],
      mastered = false,
      difficulty = "hard",
      notes
    } = req.body;

    if (type === 'vocabulary' && !word?.trim()) {
      res.status(400).json({ message: "Word is required for vocabulary notes" });
      return;
    }

    if (type === 'note' && !title?.trim() && !content?.trim()) {
      res.status(400).json({ message: "Title or content is required for study notes" });
      return;
    }

    // Check if duplicate vocabulary word already exists for this language
    if (type === 'vocabulary' && word?.trim()) {
      const existingWord = await Note.findOne({
        userId: req.user._id,
        type: 'vocabulary',
        word: { $regex: new RegExp(`^${word.trim()}$`, 'i') },
        language: language.toLowerCase()
      });

      if (existingWord) {
        // Update existing entry with new context/meaning if provided
        existingWord.meaning = meaning?.trim() || existingWord.meaning;
        if (contextSentence?.trim()) existingWord.contextSentence = contextSentence.trim();
        if (notes?.trim()) existingWord.notes = notes.trim();
        existingWord.source = source || existingWord.source;
        await existingWord.save();

        res.status(200).json({
          message: "Existing tough word updated in your notes",
          note: existingWord,
          isUpdated: true
        });
        return;
      }
    }

    const note = await Note.create({
      userId: req.user._id,
      type,
      word: word?.trim(),
      meaning: meaning?.trim(),
      language: language.toLowerCase(),
      contextSentence: contextSentence?.trim(),
      source,
      title: title?.trim(),
      content: content?.trim(),
      tags: Array.isArray(tags) ? tags : [],
      mastered: Boolean(mastered),
      difficulty,
      notes: notes?.trim()
    });

    res.status(201).json({
      message: type === 'vocabulary' ? "Tough word saved to Notes!" : "Note created successfully",
      note
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message || "Failed to create note" });
  }
};

// @desc    Update a note or tough word
// @route   PUT /api/notes/:id
// @access  Private
export const updateNote = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const note = await Note.findOne({ _id: id, userId: req.user._id });

    if (!note) {
      res.status(404).json({ message: "Note not found" });
      return;
    }

    const fields = [
      'word', 'meaning', 'language', 'contextSentence', 'source',
      'title', 'content', 'tags', 'mastered', 'difficulty', 'notes', 'type'
    ];

    fields.forEach((field) => {
      if (req.body[field] !== undefined) {
        if (field === 'language' && typeof req.body[field] === 'string') {
          (note as any)[field] = req.body[field].toLowerCase();
        } else {
          (note as any)[field] = req.body[field];
        }
      }
    });

    const updated = await note.save();
    res.json({ message: "Note updated successfully", note: updated });
  } catch (error: any) {
    res.status(500).json({ message: error.message || "Failed to update note" });
  }
};

// @desc    Delete a note or tough word
// @route   DELETE /api/notes/:id
// @access  Private
export const deleteNote = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const note = await Note.findOneAndDelete({ _id: id, userId: req.user._id });

    if (!note) {
      res.status(404).json({ message: "Note not found" });
      return;
    }

    res.json({ message: "Note deleted successfully", id });
  } catch (error: any) {
    res.status(500).json({ message: error.message || "Failed to delete note" });
  }
};
