
import React, { useState, useCallback, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Brain, 
  TrendingUp, 
  MessageSquare, 
  Target, 
  Lightbulb,
  BarChart3,
  FileText,
  Eye,
  Zap,
  Star
} from 'lucide-react';
import { nlpProcessor, type NLPAnalysis } from '@/lib/nlp-processor';
import { useToast } from '@/hooks/use-toast';

interface AdvancedAIProcessorProps {
  content: string;
  onAnalysisComplete?: (analysis: NLPAnalysis) => void;
  className?: string;
}

interface ProcessingState {
  isProcessing: boolean;
  currentStep: string;
  progress: number;
  completed: boolean;
}

const AdvancedAIProcessor: React.FC<AdvancedAIProcessorProps> = ({
  content,
  onAnalysisComplete,
  className = ''
}) => {
  const [analysis, setAnalysis] = useState<NLPAnalysis | null>(null);
  const [processing, setProcessing] = useState<ProcessingState>({
    isProcessing: false,
    currentStep: '',
    progress: 0,
    completed: false
  });
  const [semanticData, setSemanticData] = useState<any>(null);
  const { toast } = useToast();

  // Process content with comprehensive AI analysis
  const processContent = useCallback(async () => {
    if (!content.trim()) {
      toast({
        title: "No Content",
        description: "Please provide content to analyze.",
        variant: "destructive"
      });
      return;
    }

    setProcessing({
      isProcessing: true,
      currentStep: 'Initializing AI analysis...',
      progress: 0,
      completed: false
    });

    try {
      // Step 1: Basic NLP Analysis
      setProcessing(prev => ({
        ...prev,
        currentStep: 'Performing sentiment analysis...',
        progress: 20
      }));

      const nlpAnalysis = await nlpProcessor.analyzeText(content);

      // Step 2: Semantic Analysis
      setProcessing(prev => ({
        ...prev,
        currentStep: 'Extracting semantic keywords...',
        progress: 40
      }));

      const semanticKeywords = await nlpProcessor.extractSemanticKeywords(content);

      // Step 3: Advanced Processing
      setProcessing(prev => ({
        ...prev,
        currentStep: 'Generating insights...',
        progress: 60
      }));

      // Simulate advanced processing
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Step 4: Compile Results
      setProcessing(prev => ({
        ...prev,
        currentStep: 'Compiling results...',
        progress: 80
      }));

      setAnalysis(nlpAnalysis);
      setSemanticData(semanticKeywords);

      // Step 5: Complete
      setProcessing({
        isProcessing: false,
        currentStep: 'Analysis complete!',
        progress: 100,
        completed: true
      });

      onAnalysisComplete?.(nlpAnalysis);

      toast({
        title: "Analysis Complete",
        description: "AI analysis has been completed successfully.",
      });

    } catch (error) {
      console.error('Error during AI processing:', error);
      setProcessing({
        isProcessing: false,
        currentStep: 'Error occurred',
        progress: 0,
        completed: false
      });

      toast({
        title: "Analysis Failed",
        description: "An error occurred during AI analysis. Please try again.",
        variant: "destructive"
      });
    }
  }, [content, onAnalysisComplete, toast]);

  // Auto-process when content changes
  useEffect(() => {
    if (content && content.length > 100) {
      const timer = setTimeout(() => {
        processContent();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [content, processContent]);

  const getSentimentColor = (mood: string) => {
    switch (mood) {
      case 'positive': return 'bg-green-500';
      case 'negative': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getReadabilityColor = (level: string) => {
    const colors: Record<string, string> = {
      'Very Easy': 'bg-green-500',
      'Easy': 'bg-green-400',
      'Fairly Easy': 'bg-yellow-400',
      'Standard': 'bg-orange-400',
      'Fairly Difficult': 'bg-orange-500',
      'Difficult': 'bg-red-400',
      'Very Difficult': 'bg-red-500'
    };
    return colors[level] || 'bg-gray-500';
  };

  return (
    <Card className={`w-full ${className}`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-purple-600" />
          Advanced AI Content Analysis
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Processing Status */}
        {processing.isProcessing && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">{processing.currentStep}</span>
              <Badge variant="secondary">
                <Zap className="h-3 w-3 mr-1" />
                Processing
              </Badge>
            </div>
            <Progress value={processing.progress} className="w-full" />
          </div>
        )}

        {/* Control Buttons */}
        <div className="flex gap-2">
          <Button 
            onClick={processContent}
            disabled={processing.isProcessing || !content.trim()}
            className="flex items-center gap-2"
          >
            <Brain className="h-4 w-4" />
            {processing.isProcessing ? 'Processing...' : 'Analyze Content'}
          </Button>
          {analysis && (
            <Button 
              variant="outline"
              onClick={() => {
                setAnalysis(null);
                setSemanticData(null);
                setProcessing(prev => ({ ...prev, completed: false }));
              }}
            >
              Clear Results
            </Button>
          )}
        </div>

        {/* Analysis Results */}
        {analysis && (
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="sentiment">Sentiment</TabsTrigger>
              <TabsTrigger value="content">Content</TabsTrigger>
              <TabsTrigger value="insights">Insights</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-blue-600" />
                      <span className="text-sm font-medium">Words</span>
                    </div>
                    <p className="text-2xl font-bold">{analysis.wordCount}</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-medium">Sentiment</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${getSentimentColor(analysis.sentiment.mood)}`}></div>
                      <p className="text-lg font-semibold capitalize">{analysis.sentiment.mood}</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <BarChart3 className="h-4 w-4 text-purple-600" />
                      <span className="text-sm font-medium">Readability</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${getReadabilityColor(analysis.readability.level)}`}></div>
                      <p className="text-sm font-medium">{analysis.readability.level}</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <Target className="h-4 w-4 text-orange-600" />
                      <span className="text-sm font-medium">Keywords</span>
                    </div>
                    <p className="text-2xl font-bold">{analysis.keywords.length}</p>
                  </CardContent>
                </Card>
              </div>

              {/* Summary */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Lightbulb className="h-4 w-4" />
                    AI-Generated Summary
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 leading-relaxed">{analysis.summary}</p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="sentiment" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4" />
                    Sentiment Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center">
                      <p className="text-sm text-gray-600">Overall Score</p>
                      <p className="text-2xl font-bold">{analysis.sentiment.score}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-600">Comparative</p>
                      <p className="text-xl font-semibold">{analysis.sentiment.comparative.toFixed(3)}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-600">Mood</p>
                      <Badge className={getSentimentColor(analysis.sentiment.mood)}>
                        {analysis.sentiment.mood}
                      </Badge>
                    </div>
                  </div>

                  <Separator />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="font-medium text-green-600 mb-2">Positive Words</p>
                      <div className="flex flex-wrap gap-1">
                        {analysis.sentiment.positive.map((word, index) => (
                          <Badge key={index} variant="secondary" className="bg-green-100 text-green-800">
                            {word}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="font-medium text-red-600 mb-2">Negative Words</p>
                      <div className="flex flex-wrap gap-1">
                        {analysis.sentiment.negative.map((word, index) => (
                          <Badge key={index} variant="secondary" className="bg-red-100 text-red-800">
                            {word}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="content" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Keywords</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-40">
                      <div className="flex flex-wrap gap-1">
                        {analysis.keywords.map((keyword, index) => (
                          <Badge key={index} variant="outline">
                            {keyword}
                          </Badge>
                        ))}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Topics</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-40">
                      <div className="flex flex-wrap gap-1">
                        {analysis.topics.map((topic, index) => (
                          <Badge key={index} variant="secondary">
                            {topic}
                          </Badge>
                        ))}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              </div>

              {/* Entities */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Named Entities</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                      <p className="font-medium mb-2">People</p>
                      <div className="space-y-1">
                        {analysis.entities.people.map((person, index) => (
                          <Badge key={index} variant="outline" className="block w-fit">
                            {person}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="font-medium mb-2">Places</p>
                      <div className="space-y-1">
                        {analysis.entities.places.map((place, index) => (
                          <Badge key={index} variant="outline" className="block w-fit">
                            {place}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="font-medium mb-2">Organizations</p>
                      <div className="space-y-1">
                        {analysis.entities.organizations.map((org, index) => (
                          <Badge key={index} variant="outline" className="block w-fit">
                            {org}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="font-medium mb-2">Dates</p>
                      <div className="space-y-1">
                        {analysis.entities.dates.map((date, index) => (
                          <Badge key={index} variant="outline" className="block w-fit">
                            {date}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="insights" className="space-y-4">
              {semanticData && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Star className="h-4 w-4" />
                        Semantic Groups
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {Object.entries(semanticData.semanticGroups).map(([group, items]: [string, any]) => (
                          <div key={group}>
                            <p className="font-medium capitalize mb-1">{group}</p>
                            <div className="flex flex-wrap gap-1">
                              {(items as string[]).slice(0, 5).map((item, index) => (
                                <Badge key={index} variant="secondary" className="text-xs">
                                  {item}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Eye className="h-4 w-4" />
                        Key Phrases
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ScrollArea className="h-48">
                        <div className="space-y-2">
                          {semanticData.keyphrases.map((phrase: string, index: number) => (
                            <div key={index} className="p-2 bg-gray-50 rounded">
                              <p className="text-sm">{phrase}</p>
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Readability Analysis */}
              <Card>
                <CardHeader>
                  <CardTitle>Readability Analysis</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center">
                      <p className="text-sm text-gray-600">Flesch-Kincaid Score</p>
                      <p className="text-xl font-semibold">{analysis.readability.fleschKincaid.toFixed(1)}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-600">Reading Level</p>
                      <Badge className={getReadabilityColor(analysis.readability.level)}>
                        {analysis.readability.level}
                      </Badge>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-600">Avg Words/Sentence</p>
                      <p className="text-xl font-semibold">{analysis.averageWordsPerSentence.toFixed(1)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </CardContent>
    </Card>
  );
};

export default AdvancedAIProcessor;
