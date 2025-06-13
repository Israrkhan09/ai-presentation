import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  FileText, 
  Download, 
  RefreshCw, 
  Eye,
  Clock,
  BarChart3,
  Target,
  Brain,
  CheckCircle,
  TrendingUp
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface SessionSummary {
  sessionId: number;
  title: string;
  duration: number;
  totalSlides: number;
  wordsSpoken: number;
  keyTopics: string[];
  transcriptSegments: any[];
  engagementScore: number;
  speakingPace: number;
  emotionAnalysis: any;
  quizzes: any[];
}

interface PDFSummaryGeneratorProps {
  sessionId: number | null;
  transcriptionData: any[];
  keywords: string[];
  sessionDuration: number;
  currentSlide: number;
  onSummaryGenerated?: (summary: SessionSummary) => void;
}

const PDFSummaryGenerator: React.FC<PDFSummaryGeneratorProps> = ({
  sessionId,
  transcriptionData,
  keywords,
  sessionDuration,
  currentSlide,
  onSummaryGenerated
}) => {
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedSummaries, setGeneratedSummaries] = useState<SessionSummary[]>([]);
  const [currentSummary, setCurrentSummary] = useState<SessionSummary | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  // Load existing summaries
  useEffect(() => {
    if (sessionId) {
      loadExistingSummaries();
    }
  }, [sessionId]);

  const loadExistingSummaries = async () => {
    try {
      // In a real implementation, you'd load summaries from a database
      // For now, we'll generate them on demand
      console.log('Loading existing summaries for session:', sessionId);
    } catch (error) {
      console.error('Error loading summaries:', error);
    }
  };

  const generateSummary = async () => {
    if (!sessionId || transcriptionData.length === 0) {
      toast({
        title: "Cannot Generate Summary",
        description: "Need active session with transcription data.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);

    try {
      // Analyze transcription data
      const analysis = analyzeTranscriptionData();
      
      // Get session data
      const sessionData = await getSessionData();
      
      // Get quiz data
      const quizData = await getQuizData();

      const summary: SessionSummary = {
        sessionId,
        title: `Presentation Summary - ${new Date().toLocaleDateString()}`,
        duration: sessionDuration,
        totalSlides: currentSlide,
        wordsSpoken: analysis.totalWords,
        keyTopics: analysis.keyTopics,
        transcriptSegments: analysis.segments,
        engagementScore: analysis.engagementScore,
        speakingPace: analysis.averagePace,
        emotionAnalysis: analysis.emotions,
        quizzes: quizData
      };

      setCurrentSummary(summary);
      setGeneratedSummaries(prev => [...prev, summary]);

      if (onSummaryGenerated) {
        onSummaryGenerated(summary);
      }

      toast({
        title: "Summary Generated",
        description: "Comprehensive presentation summary is ready.",
      });

    } catch (error) {
      console.error('Error generating summary:', error);
      toast({
        title: "Generation Failed",
        description: "Failed to generate presentation summary.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const analyzeTranscriptionData = () => {
    const totalWords = transcriptionData.reduce((sum, segment) => 
      sum + segment.text.split(/\s+/).length, 0
    );

    const confidenceScores = transcriptionData.map(segment => segment.confidence);
    const averageConfidence = confidenceScores.reduce((sum, score) => sum + score, 0) / confidenceScores.length;

    const emotions = transcriptionData.reduce((acc, segment) => {
      const emotion = segment.emotion || 'neutral';
      acc[emotion] = (acc[emotion] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const speakingPaces = transcriptionData.map(segment => segment.speakingPace || 150);
    const averagePace = speakingPaces.reduce((sum, pace) => sum + pace, 0) / speakingPaces.length;

    const keyTopics = [...new Set(transcriptionData.flatMap(segment => segment.keywords || []))].slice(0, 10);

    const engagementScore = calculateEngagementScore(averageConfidence, keyTopics.length, averagePace);

    const segments = transcriptionData.map((segment, index) => ({
      id: index + 1,
      text: segment.text,
      timestamp: segment.timestamp,
      slide: segment.slideNumber || Math.ceil((index + 1) / (transcriptionData.length / currentSlide)),
      keywords: segment.keywords || [],
      confidence: segment.confidence,
      emotion: segment.emotion || 'neutral'
    }));

    return {
      totalWords,
      averageConfidence,
      emotions,
      averagePace,
      keyTopics,
      engagementScore,
      segments
    };
  };

  const calculateEngagementScore = (confidence: number, keywordCount: number, pace: number): number => {
    // Calculate engagement based on multiple factors
    const confidenceScore = confidence * 30;
    const keywordScore = Math.min(keywordCount * 5, 30);
    const paceScore = (pace >= 120 && pace <= 180) ? 25 : 15; // Optimal speaking pace
    const durationScore = Math.min(sessionDuration / 60 * 2, 15); // Up to 15 points for duration

    return Math.min(100, confidenceScore + keywordScore + paceScore + durationScore);
  };

  const getSessionData = async () => {
    try {
      const { data, error } = await window.ezsite.apis.tablePage('16751', {
        PageNo: 1,
        PageSize: 1,
        Filters: [
          { name: 'ID', op: 'Equal', value: sessionId }
        ]
      });

      if (error) throw error;
      return data?.List?.[0] || {};
    } catch (error) {
      console.error('Error getting session data:', error);
      return {};
    }
  };

  const getQuizData = async () => {
    try {
      const { data, error } = await window.ezsite.apis.tablePage('16753', {
        PageNo: 1,
        PageSize: 10,
        Filters: [
          { name: 'session_id', op: 'Equal', value: sessionId }
        ]
      });

      if (error) throw error;
      return data?.List || [];
    } catch (error) {
      console.error('Error getting quiz data:', error);
      return [];
    }
  };

  const generatePDF = async (summary: SessionSummary) => {
    try {
      // Create HTML content for PDF
      const htmlContent = generatePDFHTML(summary);
      
      // In a real implementation, you'd use a PDF library like jsPDF or send to server
      // For now, we'll create a downloadable HTML file
      const blob = new Blob([htmlContent], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = `presentation-summary-${summary.sessionId}-${Date.now()}.html`;
      a.click();
      
      URL.revokeObjectURL(url);
      
      toast({
        title: "PDF Generated",
        description: "Summary downloaded successfully.",
      });
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast({
        title: "Download Failed",
        description: "Failed to generate PDF summary.",
        variant: "destructive",
      });
    }
  };

  const generatePDFHTML = (summary: SessionSummary): string => {
    return `
<!DOCTYPE html>
<html>
<head>
    <title>${summary.title}</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; line-height: 1.6; }
        .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 30px; }
        .section { margin-bottom: 30px; }
        .metrics { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin: 20px 0; }
        .metric-card { border: 1px solid #ddd; padding: 15px; border-radius: 8px; text-align: center; }
        .metric-value { font-size: 2em; font-weight: bold; color: #0066cc; }
        .metric-label { font-size: 0.9em; color: #666; }
        .keywords { display: flex; flex-wrap: wrap; gap: 10px; margin: 10px 0; }
        .keyword { background: #f0f0f0; padding: 5px 10px; border-radius: 15px; font-size: 0.9em; }
        .transcript { background: #f9f9f9; padding: 15px; border-radius: 8px; margin: 10px 0; }
        .timestamp { color: #666; font-size: 0.8em; }
        table { width: 100%; border-collapse: collapse; margin: 10px 0; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; }
        .emotion-analysis { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 15px; }
        .emotion-item { text-align: center; padding: 10px; border-radius: 8px; }
        .positive { background-color: #d4edda; }
        .negative { background-color: #f8d7da; }
        .neutral { background-color: #e2e3e5; }
    </style>
</head>
<body>
    <div class="header">
        <h1>${summary.title}</h1>
        <p>Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}</p>
    </div>

    <div class="section">
        <h2>Executive Summary</h2>
        <div class="metrics">
            <div class="metric-card">
                <div class="metric-value">${Math.round(summary.duration / 60)}</div>
                <div class="metric-label">Minutes</div>
            </div>
            <div class="metric-card">
                <div class="metric-value">${summary.totalSlides}</div>
                <div class="metric-label">Slides Presented</div>
            </div>
            <div class="metric-card">
                <div class="metric-value">${summary.wordsSpoken}</div>
                <div class="metric-label">Words Spoken</div>
            </div>
            <div class="metric-card">
                <div class="metric-value">${Math.round(summary.engagementScore)}</div>
                <div class="metric-label">Engagement Score</div>
            </div>
            <div class="metric-card">
                <div class="metric-value">${Math.round(summary.speakingPace)}</div>
                <div class="metric-label">Words/Min</div>
            </div>
        </div>
    </div>

    <div class="section">
        <h2>Key Topics</h2>
        <div class="keywords">
            ${summary.keyTopics.map(topic => `<span class="keyword">${topic}</span>`).join('')}
        </div>
    </div>

    <div class="section">
        <h2>Emotional Analysis</h2>
        <div class="emotion-analysis">
            ${Object.entries(summary.emotionAnalysis).map(([emotion, count]) => `
                <div class="emotion-item ${emotion}">
                    <strong>${emotion.charAt(0).toUpperCase() + emotion.slice(1)}</strong><br>
                    ${count} segments
                </div>
            `).join('')}
        </div>
    </div>

    <div class="section">
        <h2>Presentation Timeline</h2>
        ${summary.transcriptSegments.slice(0, 20).map(segment => `
            <div class="transcript">
                <div class="timestamp">Slide ${segment.slide} - ${new Date(segment.timestamp).toLocaleTimeString()}</div>
                <p>${segment.text}</p>
                ${segment.keywords.length > 0 ? `
                    <div class="keywords">
                        ${segment.keywords.map((kw: string) => `<span class="keyword">${kw}</span>`).join('')}
                    </div>
                ` : ''}
            </div>
        `).join('')}
    </div>

    <div class="section">
        <h2>Generated Assessments</h2>
        <table>
            <thead>
                <tr>
                    <th>Quiz Type</th>
                    <th>Questions</th>
                    <th>Estimated Time</th>
                    <th>Difficulty</th>
                </tr>
            </thead>
            <tbody>
                ${summary.quizzes.map(quiz => `
                    <tr>
                        <td>${quiz.quiz_type}</td>
                        <td>${quiz.total_questions}</td>
                        <td>${quiz.estimated_time} min</td>
                        <td>${quiz.difficulty_level}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    </div>

    <div class="section">
        <h2>Recommendations</h2>
        <ul>
            ${generateRecommendations(summary).map(rec => `<li>${rec}</li>`).join('')}
        </ul>
    </div>
</body>
</html>
    `;
  };

  const generateRecommendations = (summary: SessionSummary): string[] => {
    const recommendations = [];

    if (summary.speakingPace < 120) {
      recommendations.push("Consider speaking slightly faster to maintain audience engagement (current pace: " + Math.round(summary.speakingPace) + " WPM)");
    } else if (summary.speakingPace > 180) {
      recommendations.push("Consider slowing down your speaking pace to improve comprehension (current pace: " + Math.round(summary.speakingPace) + " WPM)");
    }

    if (summary.engagementScore < 70) {
      recommendations.push("Work on increasing engagement through more varied vocal tone and interactive elements");
    }

    if (summary.keyTopics.length < 5) {
      recommendations.push("Consider covering more diverse topics to enrich the presentation content");
    }

    if (summary.duration < 300) { // Less than 5 minutes
      recommendations.push("Consider expanding the presentation content for more comprehensive coverage");
    }

    if (summary.quizzes.length === 0) {
      recommendations.push("Generate assessment materials to help measure learning outcomes");
    }

    if (recommendations.length === 0) {
      recommendations.push("Excellent presentation! All metrics are within optimal ranges.");
    }

    return recommendations;
  };

  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    }
    return `${minutes}m ${secs}s`;
  };

  const getEngagementColor = (score: number): string => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="w-full space-y-6">
      {/* Generation Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            PDF Summary Generator
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Button
              onClick={generateSummary}
              disabled={isGenerating || !sessionId || transcriptionData.length === 0}
              className="w-full h-12 flex items-center gap-2"
            >
              {isGenerating ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <Brain className="h-4 w-4" />
              )}
              Generate Comprehensive Summary
            </Button>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="text-center">
                <div className="font-bold text-lg">{formatDuration(sessionDuration)}</div>
                <p className="text-gray-600">Duration</p>
              </div>
              <div className="text-center">
                <div className="font-bold text-lg">{currentSlide}</div>
                <p className="text-gray-600">Slides</p>
              </div>
              <div className="text-center">
                <div className="font-bold text-lg">{transcriptionData.length}</div>
                <p className="text-gray-600">Segments</p>
              </div>
              <div className="text-center">
                <div className="font-bold text-lg">{keywords.length}</div>
                <p className="text-gray-600">Keywords</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Current Summary Preview */}
      {currentSummary && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Generated Summary</span>
              <div className="flex gap-2">
                <Button
                  onClick={() => setShowPreview(!showPreview)}
                  variant="outline"
                  size="sm"
                >
                  <Eye className="h-4 w-4 mr-2" />
                  {showPreview ? 'Hide' : 'Show'} Preview
                </Button>
                <Button
                  onClick={() => generatePDF(currentSummary)}
                  size="sm"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download PDF
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
              <div className="text-center">
                <div className="text-2xl font-bold">{Math.round(currentSummary.duration / 60)}</div>
                <p className="text-sm text-gray-600">Minutes</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{currentSummary.totalSlides}</div>
                <p className="text-sm text-gray-600">Slides</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{currentSummary.wordsSpoken}</div>
                <p className="text-sm text-gray-600">Words</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{Math.round(currentSummary.speakingPace)}</div>
                <p className="text-sm text-gray-600">WPM</p>
              </div>
              <div className="text-center">
                <div className={`text-2xl font-bold ${getEngagementColor(currentSummary.engagementScore)}`}>
                  {Math.round(currentSummary.engagementScore)}
                </div>
                <p className="text-sm text-gray-600">Engagement</p>
              </div>
            </div>

            {showPreview && (
              <div className="space-y-6">
                <Separator />
                
                {/* Key Topics */}
                <div>
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <Target className="h-4 w-4" />
                    Key Topics Covered
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {currentSummary.keyTopics.map((topic, index) => (
                      <Badge key={index} variant="secondary">
                        {topic}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Emotional Analysis */}
                <div>
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    Emotional Tone Analysis
                  </h4>
                  <div className="grid grid-cols-3 gap-4">
                    {Object.entries(currentSummary.emotionAnalysis).map(([emotion, count]) => (
                      <div key={emotion} className="text-center">
                        <div className="text-lg font-bold">{count as number}</div>
                        <p className="text-sm text-gray-600 capitalize">{emotion}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recent Transcript Segments */}
                <div>
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Recent Transcript Segments
                  </h4>
                  <ScrollArea className="h-48 border rounded-lg p-4">
                    <div className="space-y-3">
                      {currentSummary.transcriptSegments.slice(-5).map((segment, index) => (
                        <div key={segment.id} className="border-b pb-2">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="outline" size="sm">
                              Slide {segment.slide}
                            </Badge>
                            <span className="text-xs text-gray-500">
                              {new Date(segment.timestamp).toLocaleTimeString()}
                            </span>
                          </div>
                          <p className="text-sm">{segment.text}</p>
                          {segment.keywords.length > 0 && (
                            <div className="flex gap-1 mt-1">
                              {segment.keywords.map((keyword: string, i: number) => (
                                <Badge key={i} variant="secondary" size="sm">
                                  {keyword}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </div>

                {/* Recommendations */}
                <div>
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <CheckCircle className="h-4 w-4" />
                    Recommendations
                  </h4>
                  <ul className="space-y-1 text-sm text-gray-700">
                    {generateRecommendations(currentSummary).map((recommendation, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
                        {recommendation}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Summary History */}
      {generatedSummaries.length > 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Previous Summaries</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {generatedSummaries.slice(0, -1).map((summary, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">{summary.title}</p>
                    <p className="text-sm text-gray-600">
                      {Math.round(summary.duration / 60)} min • {summary.totalSlides} slides • {summary.wordsSpoken} words
                    </p>
                  </div>
                  <Button
                    onClick={() => generatePDF(summary)}
                    variant="outline"
                    size="sm"
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PDFSummaryGenerator;
