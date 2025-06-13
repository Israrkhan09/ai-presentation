import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Brain, Lightbulb, TrendingUp } from 'lucide-react';

interface AIProcessorProps {
  transcript: string;
  onKeywordsDetected: (keywords: string[]) => void;
  onSlideAdvance: () => void;
  onTopicComplete: (topic: string) => void;
}

interface AIAnalysis {
  keywords: string[];
  sentiment: string;
  topicProgress: number;
  suggestedAction: string;
  confidence: number;
}

const AIProcessor: React.FC<AIProcessorProps> = ({
  transcript,
  onKeywordsDetected,
  onSlideAdvance,
  onTopicComplete
}) => {
  const [analysis, setAnalysis] = useState<AIAnalysis>({
    keywords: [],
    sentiment: 'neutral',
    topicProgress: 0,
    suggestedAction: 'Continue speaking',
    confidence: 0
  });

  const [isProcessing, setIsProcessing] = useState(false);

  // Mock AI processing function
  const processTranscript = async (text: string): Promise<AIAnalysis> => {
    setIsProcessing(true);
    
    // Simulate AI processing delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Extract keywords (simple keyword extraction)
    const words = text.toLowerCase().split(/\s+/);
    const importantWords = words.filter(word => 
      word.length > 4 && 
      !['that', 'this', 'with', 'have', 'will', 'from', 'they', 'been', 'said', 'each', 'which', 'their', 'time', 'said'].includes(word)
    );
    
    const keywords = [...new Set(importantWords)].slice(0, 8);
    
    // Calculate topic progress based on text length and content
    const topicProgress = Math.min((text.length / 500) * 100, 100);
    
    // Determine if topic is complete (simple heuristic)
    const isTopicComplete = text.includes('conclusion') || 
                           text.includes('summary') || 
                           text.includes('next') ||
                           text.includes('moving on') ||
                           topicProgress > 80;
    
    // Generate sentiment analysis
    const positiveWords = ['good', 'great', 'excellent', 'amazing', 'wonderful', 'fantastic'];
    const negativeWords = ['bad', 'terrible', 'awful', 'horrible', 'worst'];
    
    const positiveCount = positiveWords.filter(word => text.toLowerCase().includes(word)).length;
    const negativeCount = negativeWords.filter(word => text.toLowerCase().includes(word)).length;
    
    let sentiment = 'neutral';
    if (positiveCount > negativeCount) sentiment = 'positive';
    else if (negativeCount > positiveCount) sentiment = 'negative';
    
    // Determine suggested action
    let suggestedAction = 'Continue speaking';
    if (isTopicComplete) {
      suggestedAction = 'Ready to advance slide';
    } else if (topicProgress > 60) {
      suggestedAction = 'Approaching topic completion';
    } else if (keywords.length > 5) {
      suggestedAction = 'Rich content detected';
    }
    
    const confidence = Math.min(text.length / 100, 1);
    
    setIsProcessing(false);
    
    return {
      keywords,
      sentiment,
      topicProgress,
      suggestedAction,
      confidence
    };
  };

  useEffect(() => {
    if (transcript.length > 50) {
      processTranscript(transcript).then(result => {
        setAnalysis(result);
        onKeywordsDetected(result.keywords);
        
        // Auto-advance slide if topic is complete and confidence is high
        if (result.topicProgress > 80 && result.confidence > 0.7) {
          onTopicComplete('Current topic completed');
          setTimeout(() => {
            onSlideAdvance();
          }, 2000);
        }
      });
    }
  }, [transcript, onKeywordsDetected, onSlideAdvance, onTopicComplete]);

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return 'bg-green-100 text-green-800';
      case 'negative': return 'bg-red-100 text-red-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5" />
          AI Analysis
          {isProcessing && (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Keywords */}
        <div>
          <h4 className="text-sm font-medium mb-2 flex items-center gap-1">
            <Lightbulb className="h-4 w-4" />
            Detected Keywords
          </h4>
          <div className="flex flex-wrap gap-1">
            {analysis.keywords.map((keyword, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {keyword}
              </Badge>
            ))}
          </div>
        </div>

        {/* Sentiment */}
        <div>
          <h4 className="text-sm font-medium mb-2">Sentiment</h4>
          <Badge className={getSentimentColor(analysis.sentiment)}>
            {analysis.sentiment.charAt(0).toUpperCase() + analysis.sentiment.slice(1)}
          </Badge>
        </div>

        {/* Topic Progress */}
        <div>
          <h4 className="text-sm font-medium mb-2 flex items-center gap-1">
            <TrendingUp className="h-4 w-4" />
            Topic Progress
          </h4>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-500"
              style={{ width: `${analysis.topicProgress}%` }}
            ></div>
          </div>
          <p className="text-xs text-gray-600 mt-1">{Math.round(analysis.topicProgress)}% complete</p>
        </div>

        {/* AI Suggestion */}
        <div>
          <h4 className="text-sm font-medium mb-2">AI Suggestion</h4>
          <p className="text-sm text-gray-700 bg-blue-50 p-2 rounded">
            {analysis.suggestedAction}
          </p>
        </div>

        {/* Confidence */}
        <div>
          <h4 className="text-sm font-medium mb-2">Analysis Confidence</h4>
          <div className="flex items-center gap-2">
            <div className="w-full bg-gray-200 rounded-full h-1">
              <div 
                className="bg-green-600 h-1 rounded-full transition-all duration-500"
                style={{ width: `${analysis.confidence * 100}%` }}
              ></div>
            </div>
            <span className="text-xs text-gray-600">
              {Math.round(analysis.confidence * 100)}%
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AIProcessor;
