import { Request, Response } from "express";
import axios from "axios";
import Song from "../../models/music/Song";
import LyricSegment from "../../models/music/LyricSegment";
import User from "../../models/user/User";

import { YoutubeTranscript } from 'youtube-transcript';

export const addSong = async (req: Request, res: Response): Promise<void> => {
  try {
    const { title, artistName, language, audioUrl, lyrics, youtubeUrl } = req.body;

    const song = await Song.create({
      title,
      artistName,
      language,
      audioUrl,
      durationSeconds: 0, // Default for now
    });

    let segments: any[] = [];
    const introBuffer = 15;

    // First try to fetch from YouTube transcript if URL is provided
    if (youtubeUrl) {
      try {
        console.log(`Attempting to fetch transcript for: ${youtubeUrl}`);
        const transcript = await YoutubeTranscript.fetchTranscript(youtubeUrl);
        
        segments = transcript.map((item, index) => ({
          songId: song._id,
          segmentOrder: index + 1,
          text: item.text,
          startTime: item.offset / 1000, // offset is in ms, convert to seconds
          endTime: (item.offset + item.duration) / 1000 // duration is also in ms
        }));
        
        // Update song duration based on the last segment if we have one
        if (segments.length > 0) {
          const lastSegment = segments[segments.length - 1];
          await Song.findByIdAndUpdate(song._id, { durationSeconds: Math.ceil(lastSegment.endTime) });
        }
      } catch (err: any) {
        console.warn("Failed to fetch YouTube transcript:", err.message);
        // Fallback to manual lyrics if provided, else it will just have 0 segments
      }
    }

    // Fallback: If no segments were fetched from YouTube, but manual lyrics are provided
    if (segments.length === 0 && lyrics && Array.isArray(lyrics)) {
      segments = lyrics.map((text, index) => ({
        songId: song._id,
        segmentOrder: index + 1,
        text,
        startTime: introBuffer + (index * 3.5), // Estimate 3.5s per line + intro
        endTime: introBuffer + ((index + 1) * 3.5)
      }));
    }

    if (segments.length > 0) {
      await LyricSegment.insertMany(segments);
    }

    res.status(201).json({ message: "Song added successfully", song, fetchedSegments: segments.length, segments });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getSongs = async (req: Request, res: Response): Promise<void> => {
  try {
    const songs = await Song.find();
    res.json(songs);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

const getLanguageCode = (lang: string): string => {
  const mapping: { [key: string]: string } = {
    english: "en",
    korean: "ko",
    spanish: "es",
    french: "fr",
    hindi: "hi",
    japanese: "ja",
    german: "de",
    italian: "it"
  };
  return mapping[lang.toLowerCase()] || "auto";
};

import { translateLyricsWithAI } from "../../services/translationService";

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

    console.log(`Translation complete for song "${song.title}" (EN: ${english.length}, HI: ${hindi.length}, ES: ${spanish.length}, KO: ${korean.length})`);
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

export const getSongSuggestions = async (req: Request, res: Response): Promise<void> => {
  try {
    // 1. Aggregate User preferences
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

    const suggestions = [];

    // Pre-defined curated list of popular songs
    const hindiSongs = [
      { title: "Tum Hi Ho", artist: "Arijit Singh", language: "Hindi", youtubeUrl: "https://www.youtube.com/watch?v=Umqb9KENgmk", reason: `High demand! ${hindiCount} users are learning Hindi.` },
      { title: "Chaleya", artist: "Arijit Singh, Shilpa Rao", language: "Hindi", youtubeUrl: "https://www.youtube.com/watch?v=VAdGW7QDJiU", reason: `Popular modern hit for your ${hindiCount} Hindi learners.` },
      { title: "Jai Ho", artist: "A.R. Rahman", language: "Hindi", youtubeUrl: "https://www.youtube.com/watch?v=xwtdhWltSIg", reason: `Classic upbeat song. Perfect for Hindi learners.` }
    ];

    const spanishSongs = [
      { title: "Despacito", artist: "Luis Fonsi, Daddy Yankee", language: "Spanish", youtubeUrl: "https://www.youtube.com/watch?v=kJQP7kiw5Fk", reason: `Global phenomenon! ${spanishCount} users are learning Spanish.` },
      { title: "Bailando", artist: "Enrique Iglesias", language: "Spanish", youtubeUrl: "https://www.youtube.com/watch?v=NUsoVlDFqZg", reason: `Great rhythm for vocabulary building for your ${spanishCount} Spanish learners.` },
      { title: "La Bamba", artist: "Los Lobos", language: "Spanish", youtubeUrl: "https://www.youtube.com/watch?v=jSKJQ18ZoIA", reason: `Classic folk song, excellent for beginners.` }
    ];

    const koreanSongs = [
      { title: "Spring Day", artist: "BTS", language: "Korean", youtubeUrl: "https://www.youtube.com/watch?v=xEeFrLSkMm8", reason: `Iconic Korean ballad! Perfect for your ${koreanCount} Korean learners.` },
      { title: "Stay With Me", artist: "CHANYEOL, PUNCH", language: "Korean", youtubeUrl: "https://www.youtube.com/watch?v=pK_f_3xJ5vA", reason: `Top drama OST with clear, emotional pronunciation.` },
      { title: "Love Scenario", artist: "iKON", language: "Korean", youtubeUrl: "https://www.youtube.com/watch?v=vecSVX1QYbQ", reason: `Easy-to-follow rhythm great for learning Korean vocabulary.` }
    ];

    // Combine them according to popularity
    if (koreanCount > 0) suggestions.push(...koreanSongs);
    if (hindiCount > 0) suggestions.push(...hindiSongs);
    if (spanishCount > 0) suggestions.push(...spanishSongs);

    // Fallback if no users have preferences yet
    if (suggestions.length === 0) {
      suggestions.push(koreanSongs[0], hindiSongs[0], spanishSongs[0]);
    }

    res.json(suggestions);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
