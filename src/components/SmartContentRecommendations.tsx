
import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Lightbulb, 
  TrendingUp, 
  BookOpen, 
  Target, 
  Brain,
  Sparkles,
  Clock,
  Users,
  BarChart3,
  CheckCircle
} from 'lucide-react';
import { nlpProcessor, type NLPAnalysis } from '@/lib/nlp-processor';
import { useToast } from '@/hooks/use-toast';

interface ContentRecommendation {
  id: string;
  type: 'improvement' | 'addition' | 'structure' | 'engagement';
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  confidence: number;
  category: string;
  action?: string;
  examples?: string[];
}

interface EngagementMetrics {
  attentionScore: number;
  readabilityScore: number;
  emotionalEngagement: number;
  interactivityLevel: number;
  contentDensity: number;
}

interface SmartContentRecommendationsProps {
  content: string;
  presentationData?: {
    duration?: number;
    slideCount?: number;
    audience?: string;
    topic?: string;
  };
  onApplyRecommendation?: (recommendation: ContentRecommendation) => void;
  className?: string;
}

const SmartContentRecommendations: React.FC<SmartContentRecommendationsProps> = ({
  content,
  presentationData,
  onApplyRecommendation,
  className = ''
}) => {
  const [recommendations, setRecommendations] = useState<ContentRecommendation[]>([]);
  const [metrics, setMetrics] = useState<EngagementMetrics | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<NLPAnalysis | null>(null);
  const [appliedRecommendations, setAppliedRecommendations] = useState<Set<string>>(new Set());

  const { toast } = useToast();

  // Generate smart recommendations based on content analysis
  const generateRecommendations = useCallback(async () => {
    if (!content.trim()) return;

    setIsAnalyzing(true);
    
    try {
      console.log('🎯 Generating smart content recommendations...');

      // Perform comprehensive NLP analysis
      const nlpAnalysis = await nlpProcessor.analyzeText(content);
      setAnalysis(nlpAnalysis);

      // Calculate engagement metrics
      const engagementMetrics = calculateEngagementMetrics(nlpAnalysis);
      setMetrics(engagementMetrics);

      // Generate specific recommendations
      const contentRecommendations = await generateSpecificRecommendations(nlpAnalysis, engagementMetrics);
      setRecommendations(contentRecommendations);

      console.log('✅ Recommendations generated:', contentRecommendations);

      toast({
        title: "Recommendations Generated",
        description: `Found ${contentRecommendations.length} suggestions to improve your content.`,
      });

    } catch (error) {
      console.error('Error generating recommendations:', error);
      toast({
        title: "Analysis Failed",
        description: "Failed to analyze content for recommendations.",
        variant: "destructive"
      });
    } finally {
      setIsAnalyzing(false);
    }
  }, [content, toast]);

  // Calculate engagement metrics from NLP analysis
  const calculateEngagementMetrics = (analysis: NLPAnalysis): EngagementMetrics => {
    const attentionScore = Math.min(100, (analysis.keywords.length * 10) + (analysis.topics.length * 15));
    const readabilityScore = Math.max(0, Math.min(100, analysis.readability.fleschKincaid));
    const emotionalEngagement = Math.abs(analysis.sentiment.score) * 10;
    const interactivityLevel = (analysis.entities.people.length + analysis.entities.organizations.length) * 5;
    const contentDensity = Math.min(100, (analysis.wordCount / 100) * 10);

    return {
      attentionScore,
      readabilityScore,
      emotionalEngagement,
      interactivityLevel,
      contentDensity
    };
  };

  // Generate specific recommendations based on analysis
  const generateSpecificRecommendations = async (
    analysis: NLPAnalysis, 
    metrics: EngagementMetrics
  ): Promise<ContentRecommendation[]> => {
    const recs: ContentRecommendation[] = [];

    // Readability recommendations
    if (analysis.readability.fleschKincaid < 30) {
      recs.push({
        id: 'readability-complex',
        type: 'improvement',
        title: 'Simplify Complex Language',
        description: 'Your content is quite complex. Consider using simpler words and shorter sentences to improve accessibility.',
        priority: 'high',
        confidence: 0.9,
        category: 'Readability',
        action: 'Simplify language',
        examples: ['Break long sentences into shorter ones', 'Replace complex terms with simpler alternatives', 'Use active voice instead of passive voice']
      });
    }

    if (analysis.averageWordsPerSentence > 20) {
      recs.push({
        id: 'sentence-length',
        type: 'improvement',
        title: 'Reduce Sentence Length',
        description: 'Your sentences are quite long. Shorter sentences improve readability and comprehension.',
        priority: 'medium',
        confidence: 0.8,
        category: 'Structure',
        action: 'Shorten sentences',
        examples: ['Aim for 15-20 words per sentence', 'Use bullet points for lists', 'Split complex ideas into multiple sentences']
      });
    }

    // Sentiment recommendations
    if (analysis.sentiment.mood === 'negative') {
      recs.push({
        id: 'sentiment-negative',
        type: 'improvement',
        title: 'Add Positive Elements',
        description: 'Your content has a negative tone. Consider adding more positive or neutral language to engage your audience better.',
        priority: 'medium',
        confidence: 0.75,
        category: 'Engagement',
        action: 'Improve tone',
        examples: ['Use positive action words', 'Focus on solutions rather than problems', 'Add encouraging statements']
      });
    }

    // Keyword density recommendations
    if (analysis.keywords.length < 5) {
      recs.push({
        id: 'keyword-density',
        type: 'addition',
        title: 'Increase Keyword Density',
        description: 'Your content lacks key terms. Adding more relevant keywords will improve searchability and topic clarity.',
        priority: 'medium',
        confidence: 0.7,
        category: 'SEO & Clarity',
        action: 'Add keywords',
        examples: ['Include domain-specific terminology', 'Repeat important concepts', 'Add synonyms for key terms']
      });
    }

    // Structure recommendations
    if (analysis.wordCount > 1000 && analysis.topics.length < 3) {
      recs.push({
        id: 'content-structure',
        type: 'structure',
        title: 'Improve Content Structure',
        description: 'Your content is lengthy but covers few topics. Consider breaking it into clear sections with distinct themes.',
        priority: 'high',
        confidence: 0.85,
        category: 'Structure',
        action: 'Restructure content',
        examples: ['Add clear headings', 'Create topic-based sections', 'Use transitions between ideas']
      });
    }

    // Engagement recommendations
    if (metrics.interactivityLevel < 20) {
      recs.push({
        id: 'interactivity',
        type: 'addition',
        title: 'Add Interactive Elements',
        description: 'Your content lacks interactive elements. Consider adding questions, examples, or engaging scenarios.',
        priority: 'medium',
        confidence: 0.7,
        category: 'Engagement',
        action: 'Add interactivity',
        examples: ['Include rhetorical questions', 'Add real-world examples', 'Use case studies or scenarios']
      });
    }

    // Entity recommendations
    if (analysis.entities.people.length === 0 && analysis.entities.organizations.length === 0) {
      recs.push({
        id: 'add-context',
        type: 'addition',
        title: 'Add Contextual References',
        description: 'Your content lacks specific references to people, organizations, or concrete examples. This can make it feel abstract.',
        priority: 'low',
        confidence: 0.6,
        category: 'Context',
        action: 'Add references',
        examples: ['Include expert quotes', 'Reference relevant organizations', 'Add specific examples or case studies']
      });
    }

    // Presentation-specific recommendations
    if (presentationData) {
      if (presentationData.slideCount && analysis.wordCount / presentationData.slideCount > 100) {
        recs.push({
          id: 'slide-content-density',
          type: 'improvement',
          title: 'Reduce Content per Slide',
          description: 'You have too much content per slide. Consider distributing content across more slides for better presentation flow.',
          priority: 'high',
          confidence: 0.9,
          category: 'Presentation',
          action: 'Redistribute content',
          examples: ['Use one main idea per slide', 'Create additional slides for complex topics', 'Use bullet points instead of paragraphs']
        });
      }
    }

    return recs.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  };

  // Apply a recommendation
  const applyRecommendation = (recommendation: ContentRecommendation) => {
    setAppliedRecommendations(prev => new Set(prev).add(recommendation.id));
    onApplyRecommendation?.(recommendation);
    
    toast({
      title: "Recommendation Applied",
      description: `Applied: ${recommendation.title}`,
    });
  };

  // Auto-generate recommendations when content changes
  useEffect(() => {
    if (content && content.length > 100) {
      const timer = setTimeout(() => {
        generateRecommendations();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [content, generateRecommendations]);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'improvement': return <TrendingUp className="h-4 w-4" />;
      case 'addition': return <Sparkles className="h-4 w-4" />;
      case 'structure': return <BarChart3 className="h-4 w-4" />;
      case 'engagement': return <Users className="h-4 w-4" />;
      default: return <Lightbulb className="h-4 w-4" />;
    }
  };

  return (
    <Card className={`w-full ${className}`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-purple-600" />
          Smart Content Recommendations
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Analysis Status */}
        <div className="flex items-center justify-between">
          <Button
            onClick={generateRecommendations}
            disabled={isAnalyzing || !content.trim()}
            className="flex items-center gap-2"
          >
            <Lightbulb className="h-4 w-4" />
            {isAnalyzing ? 'Analyzing...' : 'Generate Recommendations'}
          </Button>
          
          {isAnalyzing && (
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-purple-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-purple-600">AI Analysis in progress...</span>
            </div>
          )}
        </div>

        {/* Engagement Metrics */}
        {metrics && (
          <Card className="bg-gradient-to-r from-blue-50 to-purple-50">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Content Engagement Metrics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Attention Score</span>
                    <span className="text-sm">{metrics.attentionScore.toFixed(0)}%</span>
                  </div>
                  <Progress value={metrics.attentionScore} className="h-2" />
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Readability</span>
                    <span className="text-sm">{metrics.readabilityScore.toFixed(0)}%</span>
                  </div>
                  <Progress value={metrics.readabilityScore} className="h-2" />
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Emotional Engagement</span>
                    <span className="text-sm">{metrics.emotionalEngagement.toFixed(0)}%</span>
                  </div>
                  <Progress value={metrics.emotionalEngagement} className="h-2" />
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Interactivity</span>
                    <span className="text-sm">{metrics.interactivityLevel.toFixed(0)}%</span>
                  </div>
                  <Progress value={metrics.interactivityLevel} className="h-2" />
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Content Density</span>
                    <span className="text-sm">{metrics.contentDensity.toFixed(0)}%</span>
                  </div>
                  <Progress value={metrics.contentDensity} className="h-2" />
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Recommendations List */}
        <div>
          <h3 className="font-medium mb-4 flex items-center gap-2">
            <Target className="h-4 w-4" />
            Improvement Recommendations ({recommendations.length})
          </h3>
          
          {recommendations.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <BookOpen className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No recommendations yet. Analyze your content to get AI-powered suggestions.</p>
            </div>
          ) : (
            <ScrollArea className="h-96">
              <div className="space-y-4">
                {recommendations.map((rec) => (
                  <Card key={rec.id} className="p-4 border-l-4 border-l-purple-500">
                    <div className="space-y-3">
                      {/* Header */}
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          {getTypeIcon(rec.type)}
                          <h4 className="font-medium">{rec.title}</h4>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={getPriorityColor(rec.priority)}>
                            {rec.priority}
                          </Badge>
                          <Badge variant="outline">
                            {(rec.confidence * 100).toFixed(0)}%
                          </Badge>
                        </div>
                      </div>

                      {/* Description */}
                      <p className="text-gray-700 text-sm">{rec.description}</p>

                      {/* Examples */}
                      {rec.examples && rec.examples.length > 0 && (
                        <div>
                          <p className="text-xs font-medium text-gray-600 mb-1">Suggested Actions:</p>
                          <ul className="list-disc list-inside space-y-1">
                            {rec.examples.map((example, index) => (
                              <li key={index} className="text-xs text-gray-600">{example}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Action Button */}
                      <div className="flex items-center justify-between pt-2">
                        <Badge variant="secondary" className="text-xs">
                          {rec.category}
                        </Badge>
                        
                        {appliedRecommendations.has(rec.id) ? (
                          <Badge className="bg-green-100 text-green-800">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Applied
                          </Badge>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => applyRecommendation(rec)}
                            className="text-xs"
                          >
                            Apply Suggestion
                          </Button>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          )}
        </div>

        {/* Summary Stats */}
        {recommendations.length > 0 && (
          <Card className="bg-gray-50">
            <CardContent className="p-4">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold text-red-600">
                    {recommendations.filter(r => r.priority === 'high').length}
                  </p>
                  <p className="text-xs text-gray-600">High Priority</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-yellow-600">
                    {recommendations.filter(r => r.priority === 'medium').length}
                  </p>
                  <p className="text-xs text-gray-600">Medium Priority</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-green-600">
                    {appliedRecommendations.size}
                  </p>
                  <p className="text-xs text-gray-600">Applied</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </CardContent>
    </Card>
  );
};

export default SmartContentRecommendations;
