
import natural from 'natural';
import nlp from 'compromise';
import Sentiment from 'sentiment';
import keyword from 'keyword-extractor';
import { removeStopwords } from 'stopword';
import stemmer from 'stemmer';

export interface NLPAnalysis {
  sentiment: {
    score: number;
    comparative: number;
    tokens: string[];
    positive: string[];
    negative: string[];
    mood: 'positive' | 'negative' | 'neutral';
  };
  keywords: string[];
  topics: string[];
  entities: {
    people: string[];
    places: string[];
    organizations: string[];
    dates: string[];
  };
  readability: {
    fleschKincaid: number;
    level: string;
  };
  summary: string;
  language: string;
  wordCount: number;
  averageWordsPerSentence: number;
}

export interface ConversationContext {
  previousQueries: string[];
  currentTopic: string;
  userIntent: string;
  confidence: number;
}

export class NLPProcessor {
  private sentiment: Sentiment;
  private tokenizer: natural.WordTokenizer;
  private stemmer: typeof stemmer;
  
  constructor() {
    this.sentiment = new Sentiment();
    this.tokenizer = new natural.WordTokenizer();
    this.stemmer = stemmer;
  }

  // Comprehensive text analysis
  async analyzeText(text: string): Promise<NLPAnalysis> {
    try {
      console.log('🔍 Starting comprehensive text analysis...');
      
      const doc = nlp(text);
      const tokens = this.tokenizer.tokenize(text.toLowerCase()) || [];
      
      // Sentiment analysis
      const sentimentResult = this.sentiment.analyze(text);
      const mood = sentimentResult.score > 0 ? 'positive' : 
                   sentimentResult.score < 0 ? 'negative' : 'neutral';

      // Keyword extraction
      const extractedKeywords = keyword.extract(text, {
        language: 'english',
        remove_digits: true,
        return_changed_case: true,
        remove_duplicates: true
      });

      // Entity extraction
      const people = doc.people().out('array');
      const places = doc.places().out('array');
      const organizations = doc.organizations().out('array');
      const dates = doc.dates().out('array');

      // Topic modeling using simple clustering
      const topics = this.extractTopics(text);

      // Readability analysis
      const sentences = doc.sentences().out('array');
      const averageWordsPerSentence = tokens.length / Math.max(sentences.length, 1);
      const fleschKincaid = this.calculateFleschKincaid(text);

      // Generate summary
      const summary = this.generateSummary(text);

      const analysis: NLPAnalysis = {
        sentiment: {
          score: sentimentResult.score,
          comparative: sentimentResult.comparative,
          tokens: sentimentResult.tokens,
          positive: sentimentResult.positive,
          negative: sentimentResult.negative,
          mood
        },
        keywords: extractedKeywords.slice(0, 10),
        topics,
        entities: { people, places, organizations, dates },
        readability: {
          fleschKincaid,
          level: this.getReadabilityLevel(fleschKincaid)
        },
        summary,
        language: 'english',
        wordCount: tokens.length,
        averageWordsPerSentence
      };

      console.log('✅ Text analysis completed:', analysis);
      return analysis;
    } catch (error) {
      console.error('❌ Error in text analysis:', error);
      throw new Error('Failed to analyze text');
    }
  }

  // Extract topics using keyword clustering
  private extractTopics(text: string): string[] {
    try {
      const doc = nlp(text);
      const nouns = doc.nouns().out('array');
      const verbs = doc.verbs().out('array');
      const adjectives = doc.adjectives().out('array');
      
      const importantWords = [...nouns, ...verbs, ...adjectives]
        .filter(word => word.length > 3)
        .slice(0, 5);

      return [...new Set(importantWords)];
    } catch (error) {
      console.error('Error extracting topics:', error);
      return [];
    }
  }

  // Calculate Flesch-Kincaid readability score
  private calculateFleschKincaid(text: string): number {
    try {
      const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
      const words = this.tokenizer.tokenize(text) || [];
      const syllables = words.reduce((total, word) => total + this.countSyllables(word), 0);

      if (sentences.length === 0 || words.length === 0) return 0;

      const avgWordsPerSentence = words.length / sentences.length;
      const avgSyllablesPerWord = syllables / words.length;

      return 206.835 - (1.015 * avgWordsPerSentence) - (84.6 * avgSyllablesPerWord);
    } catch (error) {
      console.error('Error calculating readability:', error);
      return 0;
    }
  }

  // Count syllables in a word
  private countSyllables(word: string): number {
    const vowels = 'aeiouy';
    let count = 0;
    let prevWasVowel = false;

    for (let i = 0; i < word.length; i++) {
      const isVowel = vowels.includes(word[i].toLowerCase());
      if (isVowel && !prevWasVowel) count++;
      prevWasVowel = isVowel;
    }

    return Math.max(1, count);
  }

  private getReadabilityLevel(score: number): string {
    if (score >= 90) return 'Very Easy';
    if (score >= 80) return 'Easy';
    if (score >= 70) return 'Fairly Easy';
    if (score >= 60) return 'Standard';
    if (score >= 50) return 'Fairly Difficult';
    if (score >= 30) return 'Difficult';
    return 'Very Difficult';
  }

  // Generate extractive summary
  private generateSummary(text: string, maxSentences: number = 3): string {
    try {
      const doc = nlp(text);
      const sentences = doc.sentences().out('array');
      
      if (sentences.length <= maxSentences) {
        return sentences.join(' ');
      }

      // Score sentences based on keyword frequency
      const keywords = keyword.extract(text, { language: 'english' });
      const keywordSet = new Set(keywords.map(k => k.toLowerCase()));

      const scoredSentences = sentences.map((sentence, index) => {
        const sentenceWords = this.tokenizer.tokenize(sentence.toLowerCase()) || [];
        const keywordCount = sentenceWords.filter(word => keywordSet.has(word)).length;
        const score = keywordCount / Math.max(sentenceWords.length, 1);
        
        return { sentence, score, index };
      });

      // Sort by score and take top sentences
      const topSentences = scoredSentences
        .sort((a, b) => b.score - a.score)
        .slice(0, maxSentences)
        .sort((a, b) => a.index - b.index)
        .map(item => item.sentence);

      return topSentences.join(' ');
    } catch (error) {
      console.error('Error generating summary:', error);
      return text.slice(0, 200) + '...';
    }
  }

  // Analyze user intent from voice commands
  async analyzeIntent(query: string, context?: ConversationContext): Promise<{
    intent: string;
    entities: Record<string, any>;
    confidence: number;
    response: string;
  }> {
    try {
      console.log('🎯 Analyzing user intent:', query);
      
      const doc = nlp(query);
      const verbs = doc.verbs().out('array');
      const nouns = doc.nouns().out('array');
      const numbers = doc.values().out('array');

      // Intent classification
      let intent = 'unknown';
      let confidence = 0.5;

      // Navigation intents
      if (query.match(/\b(go|next|forward|advance)\b/i)) {
        intent = 'navigate_next';
        confidence = 0.9;
      } else if (query.match(/\b(back|previous|return)\b/i)) {
        intent = 'navigate_back';
        confidence = 0.9;
      } else if (query.match(/\b(slide|page)\s*(\d+)\b/i)) {
        intent = 'navigate_to_slide';
        confidence = 0.95;
      }
      // Control intents
      else if (query.match(/\b(start|begin|play)\b/i)) {
        intent = 'start_presentation';
        confidence = 0.85;
      } else if (query.match(/\b(stop|pause|end)\b/i)) {
        intent = 'stop_presentation';
        confidence = 0.85;
      } else if (query.match(/\b(fullscreen|full screen)\b/i)) {
        intent = 'toggle_fullscreen';
        confidence = 0.8;
      }
      // Content intents
      else if (query.match(/\b(summary|summarize|overview)\b/i)) {
        intent = 'generate_summary';
        confidence = 0.8;
      } else if (query.match(/\b(quiz|question|test)\b/i)) {
        intent = 'generate_quiz';
        confidence = 0.8;
      } else if (query.match(/\b(note|notes|reminder)\b/i)) {
        intent = 'add_note';
        confidence = 0.75;
      }

      const entities = {
        verbs,
        nouns,
        numbers,
        slideNumber: query.match(/\b(\d+)\b/)?.[1]
      };

      const response = this.generateResponse(intent, entities, context);

      console.log('✅ Intent analysis completed:', { intent, confidence, entities });
      
      return { intent, entities, confidence, response };
    } catch (error) {
      console.error('❌ Error analyzing intent:', error);
      return {
        intent: 'unknown',
        entities: {},
        confidence: 0,
        response: "I'm sorry, I didn't understand that command."
      };
    }
  }

  private generateResponse(intent: string, entities: Record<string, any>, context?: ConversationContext): string {
    const responses: Record<string, string[]> = {
      navigate_next: [
        "Moving to the next slide.",
        "Going forward to the next slide.",
        "Advancing to the next slide."
      ],
      navigate_back: [
        "Going back to the previous slide.",
        "Returning to the previous slide.",
        "Moving back one slide."
      ],
      navigate_to_slide: [
        `Navigating to slide ${entities.slideNumber}.`,
        `Going to slide number ${entities.slideNumber}.`,
        `Jumping to slide ${entities.slideNumber}.`
      ],
      start_presentation: [
        "Starting the presentation.",
        "Beginning the presentation now.",
        "Let's start the presentation."
      ],
      stop_presentation: [
        "Stopping the presentation.",
        "Pausing the presentation.",
        "Presentation stopped."
      ],
      generate_summary: [
        "Generating a summary of the content.",
        "Creating an overview of the presentation.",
        "Summarizing the key points."
      ],
      generate_quiz: [
        "Creating a quiz based on the content.",
        "Generating questions for this presentation.",
        "Building a quiz to test understanding."
      ],
      unknown: [
        "I'm not sure what you want me to do.",
        "Could you please rephrase that command?",
        "I didn't understand that. Try saying it differently."
      ]
    };

    const responseList = responses[intent] || responses.unknown;
    return responseList[Math.floor(Math.random() * responseList.length)];
  }

  // Advanced keyword extraction with semantic analysis
  async extractSemanticKeywords(text: string): Promise<{
    keywords: string[];
    keyphrases: string[];
    technicalTerms: string[];
    semanticGroups: Record<string, string[]>;
  }> {
    try {
      console.log('🔍 Extracting semantic keywords...');
      
      const doc = nlp(text);
      
      // Extract different types of terms
      const nouns = doc.nouns().out('array');
      const adjectives = doc.adjectives().out('array');
      const verbs = doc.verbs().out('array');
      const organizations = doc.organizations().out('array');
      const places = doc.places().out('array');

      // Extract keyphrases (noun phrases)
      const nounPhrases = doc.match('#Noun+ #Noun').out('array');
      
      // Technical terms (capitalized words, acronyms)
      const technicalTerms = text.match(/\b[A-Z]{2,}\b|\b[A-Z][a-z]+(?:[A-Z][a-z]+)+\b/g) || [];
      
      // Semantic grouping
      const semanticGroups = {
        concepts: nouns.filter(n => n.length > 4),
        actions: verbs,
        qualities: adjectives,
        entities: [...organizations, ...places],
        technical: [...new Set(technicalTerms)]
      };

      // Combined keywords with filtering
      const allKeywords = [...nouns, ...verbs, ...adjectives]
        .filter(word => word.length > 2)
        .filter(word => !this.isStopWord(word));

      const uniqueKeywords = [...new Set(allKeywords)].slice(0, 15);
      const uniqueKeyphrases = [...new Set(nounPhrases)].slice(0, 10);

      console.log('✅ Semantic keyword extraction completed');
      
      return {
        keywords: uniqueKeywords,
        keyphrases: uniqueKeyphrases,
        technicalTerms: [...new Set(technicalTerms)],
        semanticGroups
      };
    } catch (error) {
      console.error('❌ Error extracting semantic keywords:', error);
      return {
        keywords: [],
        keyphrases: [],
        technicalTerms: [],
        semanticGroups: {}
      };
    }
  }

  private isStopWord(word: string): boolean {
    const stopWords = ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'must', 'can', 'this', 'that', 'these', 'those'];
    return stopWords.includes(word.toLowerCase());
  }
}

// Singleton instance
export const nlpProcessor = new NLPProcessor();
