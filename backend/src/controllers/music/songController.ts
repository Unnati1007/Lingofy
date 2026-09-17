import { Request, Response } from "express";
import axios from "axios";
import Song from "../../models/music/Song";
import LyricSegment from "../../models/music/LyricSegment";
import User from "../../models/user/User";
import UserPreferences from "../../models/user/UserPreference";
import { AuthRequest } from "../../middleware/authMiddleware";
import { YoutubeTranscript } from 'youtube-transcript';
import { translateLyricsWithAI } from "../../services/translationService";

const MAX_USER_SONG_UPLOADS = 5;

// GET /api/admin/quota - Get upload quota for the logged-in user
export const getUploadQuota = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?._id;
    const role = req.user?.role;

    if (!userId) {
      res.status(401).json({ message: "User not authenticated" });
      return;
    }

    if (role === 'admin') {
      res.status(200).json({
        uploadedCount: 0,
        maxLimit: 9999,
        remaining: 9999,
        isUnlimited: true
      });
      return;
    }

    const uploadedCount = await Song.countDocuments({ uploadedBy: userId });
    const remaining = Math.max(0, MAX_USER_SONG_UPLOADS - uploadedCount);

    res.status(200).json({
      uploadedCount,
      maxLimit: MAX_USER_SONG_UPLOADS,
      remaining,
      isUnlimited: false
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/admin/recommendations - Get personalized song recommendations
export const getPersonalizedRecommendations = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?._id;
    const user = userId ? await User.findById(userId) : null;
    const preferences = userId ? await UserPreferences.findOne({ userId }) : null;

    const allSongs = await Song.find().sort({ createdAt: -1 });

    const learningLang = user?.learningLanguage?.toLowerCase() || preferences?.languagesToLearn?.[0]?.toLowerCase() || 'spanish';
    const favoriteArtists = preferences?.favoriteArtists || [];
    const favoriteGenres = preferences?.favoriteGenres || [];

    // Score and rank songs for the user
    const scoredSongs = allSongs.map(song => {
      let score = 0;
      const songLang = (song.language || '').toLowerCase();
      const songArtist = (song.artistName || '').toLowerCase();

      // Language match priority
      if (songLang === learningLang) {
        score += 60;
      } else if (preferences?.languagesToLearn?.some(l => l.toLowerCase() === songLang)) {
        score += 30;
      }

      // Artist match
      if (favoriteArtists.some(fa => songArtist.includes(fa.toLowerCase()) || fa.toLowerCase().includes(songArtist))) {
        score += 40;
      }

      return {
        song,
        score
      };
    });

    // Sort by score descending
    scoredSongs.sort((a, b) => b.score - a.score);

    const recommendations = scoredSongs.slice(0, 8).map(s => s.song);

    // Get quota if user is authenticated
    let quota = { uploadedCount: 0, maxLimit: MAX_USER_SONG_UPLOADS, remaining: MAX_USER_SONG_UPLOADS, isUnlimited: req.user?.role === 'admin' };
    if (userId && req.user?.role !== 'admin') {
      const count = await Song.countDocuments({ uploadedBy: userId });
      quota = {
        uploadedCount: count,
        maxLimit: MAX_USER_SONG_UPLOADS,
        remaining: Math.max(0, MAX_USER_SONG_UPLOADS - count),
        isUnlimited: false
      };
    }

    res.status(200).json({
      recommendations,
      allSongs,
      learningLanguage: learningLang,
      favoriteArtists,
      quota
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// POST /api/admin/song - Add a new song (Admin or Regular User with quota)
export const addSong = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { title, artistName, language, audioUrl, lyrics, youtubeUrl, coverImage } = req.body;
    const userId = req.user?._id;
    const isAdmin = req.user?.role === 'admin';

    if (!title || !artistName || !language || (!audioUrl && !youtubeUrl)) {
      res.status(400).json({ message: "Title, artist, language, and audio/YouTube URL are required." });
      return;
    }

    // Check user upload quota if not admin
    if (!isAdmin && userId) {
      const userUploadedCount = await Song.countDocuments({ uploadedBy: userId });
      if (userUploadedCount >= MAX_USER_SONG_UPLOADS) {
        res.status(403).json({ 
          message: `Upload limit reached! You have already added ${MAX_USER_SONG_UPLOADS} custom songs. You can still add unlimited existing community songs to your playlists!`,
          quotaExceeded: true,
          uploadedCount: userUploadedCount,
          maxLimit: MAX_USER_SONG_UPLOADS
        });
        return;
      }
    }

    // Check for exact duplicate in DB to save storage
    const trimmedTitle = title.trim();
    const trimmedArtist = artistName.trim();
    const existingSong = await Song.findOne({
      title: { $regex: new RegExp(`^${trimmedTitle}$`, 'i') },
      artistName: { $regex: new RegExp(`^${trimmedArtist}$`, 'i') }
    });

    if (existingSong) {
      res.status(200).json({
        message: "This song already exists in the community library! You can add it directly to your playlists without using your upload quota.",
        song: existingSong,
        isExisting: true
      });
      return;
    }

    const song = await Song.create({
      title: trimmedTitle,
      artistName: trimmedArtist,
      language,
      audioUrl: audioUrl || youtubeUrl,
      coverImage: coverImage || '',
      uploadedBy: userId,
      isUserUploaded: !isAdmin,
      durationSeconds: 0,
    });

    let segments: any[] = [];
    const introBuffer = 15;

    // First try to fetch from YouTube transcript if URL is provided
    const targetUrl = youtubeUrl || audioUrl;
    if (targetUrl && (targetUrl.includes('youtube.com') || targetUrl.includes('youtu.be'))) {
      try {
        console.log(`Attempting to fetch transcript for: ${targetUrl}`);
        const transcript = await YoutubeTranscript.fetchTranscript(targetUrl);
        
        segments = transcript.map((item, index) => ({
          songId: song._id,
          segmentOrder: index + 1,
          text: item.text,
          startTime: item.offset / 1000,
          endTime: (item.offset + item.duration) / 1000
        }));
        
        if (segments.length > 0) {
          const lastSegment = segments[segments.length - 1];
          await Song.findByIdAndUpdate(song._id, { durationSeconds: Math.ceil(lastSegment.endTime) });
        }
      } catch (err: any) {
        console.warn("Failed to fetch YouTube transcript:", err.message);
      }
    }

    // Fallback: manual lyrics
    if (segments.length === 0 && lyrics && Array.isArray(lyrics) && lyrics.length > 0) {
      segments = lyrics.map((text, index) => ({
        songId: song._id,
        segmentOrder: index + 1,
        text,
        startTime: introBuffer + (index * 3.5),
        endTime: introBuffer + ((index + 1) * 3.5)
      }));
      await Song.findByIdAndUpdate(song._id, { durationSeconds: Math.ceil(introBuffer + (lyrics.length * 3.5)) });
    }

    if (segments.length > 0) {
      await LyricSegment.insertMany(segments);

      // Trigger automatic AI translation across core languages
      try {
        console.log(`Auto-translating new song "${song.title}" (${song.language})...`);
        const { english, hindi, spanish, korean } = await translateLyricsWithAI(
          segments.map(s => ({ segmentOrder: s.segmentOrder, text: s.text })),
          song.language || "English"
        );

        await Song.findByIdAndUpdate(song._id, {
          translations: { english, hindi, spanish, korean }
        });
        console.log(`AI translations saved for "${song.title}"`);
      } catch (transErr: any) {
        console.warn("Auto translation on song add failed:", transErr.message);
      }
    }

    const updatedSong = await Song.findById(song._id);

    res.status(201).json({
      message: "Song added and processed successfully!",
      song: updatedSong || song,
      fetchedSegments: segments.length,
      segments
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getSongs = async (req: Request, res: Response): Promise<void> => {
  try {
    const songs = await Song.find().sort({ createdAt: -1 });
    res.json(songs);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const autoTranslate = async (req: Request, res: Response): Promise<void> => {
  try {
    const { songId } = req.params;
    const song = await Song.findById(songId);
    if (!song) {
      res.status(404).json({ message: "Song not found" });
      return;
    }

    const segments = await LyricSegment.find({ songId }).sort({ segmentOrder: 1 });
    if (segments.length === 0) {
      res.status(400).json({ message: "No lyrics segments found for this song." });
      return;
    }

    console.log(`Starting translation for song "${song.title}" (${song.language})...`);

    const { english, hindi, spanish, korean } = await translateLyricsWithAI(
      segments.map(s => ({ segmentOrder: s.segmentOrder, text: s.text })),
      song.language || "English"
    );

    // Save all translations to the Song document
    await Song.findByIdAndUpdate(songId, {
      translations: {
        english,
        hindi,
        spanish,
        korean
      }
    });

    console.log(`Translation complete for song "${song.title}"`);
    res.json({ english, hindi, spanish, korean });
  } catch (error: any) {
    console.error("AutoTranslate Overall Error:", error);
    res.status(500).json({ message: error.message });
  }
};

export const getSegments = async (req: Request, res: Response): Promise<void> => {
  try {
    const { songId } = req.params;
    const segments = await LyricSegment.find({ songId }).sort({ segmentOrder: 1 });
    res.json(segments);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getSongSuggestions = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?._id;
    const user = userId ? await User.findById(userId) : null;
    const preferences = userId ? await UserPreferences.findOne({ userId }) : null;
    const userLang = (user?.learningLanguage || preferences?.languagesToLearn?.[0] || '').toLowerCase();

    const users = await User.find({ role: 'user' });
    let hindiCount = 0;
    let spanishCount = 0;
    let koreanCount = 0;

    users.forEach(u => {
      const lang = u.learningLanguage?.toLowerCase() || '';
      if (lang === 'hindi') hindiCount++;
      if (lang === 'spanish') spanishCount++;
      if (lang === 'korean') koreanCount++;
    });

    const hindiSongs = [
      { title: "Tum Hi Ho", artist: "Arijit Singh", language: "Hindi", youtubeUrl: "https://www.youtube.com/watch?v=Umqb9KENgmk", reason: userLang === 'hindi' ? "Tailored for your Hindi goal - high vocabulary depth." : `High demand! ${hindiCount} users are learning Hindi.` },
      { title: "Chaleya", artist: "Arijit Singh, Shilpa Rao", language: "Hindi", youtubeUrl: "https://www.youtube.com/watch?v=VAdGW7QDJiU", reason: userLang === 'hindi' ? "Modern lyrical hit great for conversational rhythm." : `Popular modern hit for your ${hindiCount} Hindi learners.` },
      { title: "Jai Ho", artist: "A.R. Rahman", language: "Hindi", youtubeUrl: "https://www.youtube.com/watch?v=xwtdhWltSIg", reason: "Classic upbeat anthem. Perfect for Hindi learners." }
    ];

    const spanishSongs = [
      { title: "Despacito", artist: "Luis Fonsi, Daddy Yankee", language: "Spanish", youtubeUrl: "https://www.youtube.com/watch?v=kJQP7kiw5Fk", reason: userLang === 'spanish' ? "Top recommended for Spanish learners - clear pronunciation." : `Global phenomenon! ${spanishCount} users are learning Spanish.` },
      { title: "Bailando", artist: "Enrique Iglesias", language: "Spanish", youtubeUrl: "https://www.youtube.com/watch?v=NUsoVlDFqZg", reason: userLang === 'spanish' ? "Great rhythmic flow for rapid vocabulary building." : `Great rhythm for vocabulary building for your ${spanishCount} Spanish learners.` },
      { title: "La Bamba", artist: "Los Lobos", language: "Spanish", youtubeUrl: "https://www.youtube.com/watch?v=jSKJQ18ZoIA", reason: "Classic folk melody, excellent for beginners." }
    ];

    const koreanSongs = [
      { title: "Spring Day", artist: "BTS", language: "Korean", youtubeUrl: "https://www.youtube.com/watch?v=xEeFrLSkMm8", reason: userLang === 'korean' ? "Iconic emotional ballad with clear, paced Korean lyrics." : `Iconic Korean ballad! Perfect for your ${koreanCount} Korean learners.` },
      { title: "Stay With Me", artist: "CHANYEOL, PUNCH", language: "Korean", youtubeUrl: "https://www.youtube.com/watch?v=pK_f_3xJ5vA", reason: "Top drama OST with clear, emotional pronunciation." },
      { title: "Love Scenario", artist: "iKON", language: "Korean", youtubeUrl: "https://www.youtube.com/watch?v=vecSVX1QYbQ", reason: "Easy-to-follow rhythm great for learning Korean vocabulary." }
    ];

    const englishSongs = [
      { title: "Shape of You", artist: "Ed Sheeran", language: "English", youtubeUrl: "https://www.youtube.com/watch?v=JGwWNGJdvx8", reason: "Global pop hit with rhythmic tempo and everyday vocabulary." },
      { title: "Someone You Loved", artist: "Lewis Capaldi", language: "English", youtubeUrl: "https://www.youtube.com/watch?v=zABLecsR5UE", reason: "Emotional ballad with clear vocal pacing." }
    ];

    let suggestions: any[] = [];

    if (userLang === 'spanish') {
      suggestions = [...spanishSongs, ...koreanSongs.slice(0, 1), ...hindiSongs.slice(0, 1)];
    } else if (userLang === 'korean') {
      suggestions = [...koreanSongs, ...spanishSongs.slice(0, 1), ...hindiSongs.slice(0, 1)];
    } else if (userLang === 'hindi') {
      suggestions = [...hindiSongs, ...spanishSongs.slice(0, 1), ...koreanSongs.slice(0, 1)];
    } else if (userLang === 'english') {
      suggestions = [...englishSongs, ...spanishSongs.slice(0, 1), ...koreanSongs.slice(0, 1)];
    } else {
      if (koreanCount > 0) suggestions.push(...koreanSongs.slice(0, 2));
      if (spanishCount > 0) suggestions.push(...spanishSongs.slice(0, 2));
      if (hindiCount > 0) suggestions.push(...hindiSongs.slice(0, 2));
      if (suggestions.length === 0) {
        suggestions = [spanishSongs[0], koreanSongs[0], hindiSongs[0], englishSongs[0]];
      }
    }

    res.json(suggestions);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
