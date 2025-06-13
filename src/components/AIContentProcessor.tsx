import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Brain, FileText, HelpCircle, Download, Loader2 } from 'lucide-react';

interface SessionData {
  presentationId: number;
  spokenContent: string[];
  slideTransitions: number[];
  sessionDuration: number;
  presentationTitle: string;
}

interface ProcessedContent {
  summary: string;
  keyPoints: string[];
  mcqs: Array<{
    question: string;
    options: string[];
    correctAnswer: number;
  }>;
  theoryQuestions: string[];
}

interface AIContentProcessorProps {
  sessionData: SessionData;
  onProcessingComplete: (content: ProcessedContent) => void;
  onDownload: (type: 'summary' | 'quiz') => void;
}

const AIContentProcessor: React.FC<AIContentProcessorProps> = ({
  sessionData,
  onProcessingComplete,
  onDownload
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [processedContent, setProcessedContent] = useState<ProcessedContent | null>(null);
  const [currentStep, setCurrentStep] = useState('');

  // Mock AI processing steps
  const processContent = async () => {
    setIsProcessing(true);
    setProgress(0);
    
    try {
      // Step 1: Analyze spoken content
      setCurrentStep('Analyzing spoken content...');
      setProgress(20);
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Step 2: Extract key concepts
      setCurrentStep('Extracting key concepts...');
      setProgress(40);
      await new Promise(resolve => setTimeout(resolve, 1200));

      // Step 3: Generate summary
      setCurrentStep('Generating summary...');
      setProgress(60);
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Step 4: Create quiz questions
      setCurrentStep('Creating quiz questions...');
      setProgress(80);
      await new Promise(resolve => setTimeout(resolve, 1300));

      // Step 5: Finalizing content
      setCurrentStep('Finalizing content...');
      setProgress(100);
      await new Promise(resolve => setTimeout(resolve, 800));

      // Mock processed content based on session data
      const processed: ProcessedContent = {
        summary: generateSummary(sessionData),
        keyPoints: extractKeyPoints(sessionData),
        mcqs: generateMCQs(sessionData),
        theoryQuestions: generateTheoryQuestions(sessionData)
      };

      setProcessedContent(processed);
      onProcessingComplete(processed);
    } catch (error) {
      console.error('Error processing content:', error);
    } finally {
      setIsProcessing(false);
      setCurrentStep('');
    }
  };

  // Mock AI functions
  const generateSummary = (data: SessionData): string => {
    const topics = extractTopicsFromSpokenContent(data.spokenContent);
    return `This ${Math.round(data.sessionDuration / 60)}-minute presentation on "${data.presentationTitle}" covered ${topics.length} main topics including ${topics.slice(0, 3).join(', ')}. The presenter emphasized key concepts through ${data.slideTransitions.length} slide transitions, providing comprehensive coverage of the subject matter. Key insights were delivered through interactive explanations and detailed examples, making complex concepts accessible to the audience.`;
  };

  const extractKeyPoints = (data: SessionData): string[] => {
    const topics = extractTopicsFromSpokenContent(data.spokenContent);
    return [
      `Presentation Duration: ${Math.round(data.sessionDuration / 60)} minutes`,
      `Total Slides Covered: ${data.slideTransitions.length}`,
      `Main Topics Discussed: ${topics.join(', ')}`,
      `Average Time per Slide: ${Math.round(data.sessionDuration / data.slideTransitions.length)} seconds`,
      'Interactive voice-controlled navigation used throughout',
      'Comprehensive coverage of all presentation materials'
    ];
  };

  const generateMCQs = (data: SessionData): Array<{
    question: string;
    options: string[];
    correctAnswer: number;
  }> => {
    const topics = extractTopicsFromSpokenContent(data.spokenContent);
    return [
      {
        question: `What was the main focus of the "${data.presentationTitle}" presentation?`,
        options: [
          topics[0] || 'Primary concept discussion',
          'Secondary topic analysis',
          'Background information only',
          'General overview'
        ],
        correctAnswer: 0
      },
      {
        question: `How long was the presentation session?`,
        options: [
          `${Math.round(data.sessionDuration / 60)} minutes`,
          `${Math.round(data.sessionDuration / 60) + 5} minutes`,
          `${Math.round(data.sessionDuration / 60) - 3} minutes`,
          `${Math.round(data.sessionDuration / 60) + 10} minutes`
        ],
        correctAnswer: 0
      },
      {
        question: `How many slides were covered in the presentation?`,
        options: [
          `${data.slideTransitions.length} slides`,
          `${data.slideTransitions.length + 2} slides`,
          `${data.slideTransitions.length - 1} slides`,
          `${data.slideTransitions.length + 5} slides`
        ],
        correctAnswer: 0
      }
    ];
  };

  const generateTheoryQuestions = (data: SessionData): string[] => {
    const topics = extractTopicsFromSpokenContent(data.spokenContent);
    return [
      `Explain the key concepts presented in "${data.presentationTitle}" and their practical applications.`,
      `Discuss the main themes covered during the ${Math.round(data.sessionDuration / 60)}-minute presentation session.`,
      `Analyze how the voice-controlled presentation format enhanced the learning experience.`,
      `Compare and contrast the different topics covered: ${topics.join(', ')}.`,
      `Evaluate the effectiveness of the presentation structure and content delivery.`
    ];
  };

  const extractTopicsFromSpokenContent = (spokenContent: string[]): string[] => {
    // Mock topic extraction from spoken content
    const commonTopics = [
      'Data Analysis', 'Machine Learning', 'Business Strategy', 'Technology Innovation',
      'Market Research', 'User Experience', 'Project Management', 'Digital Transformation',
      'Artificial Intelligence', 'Software Development', 'Cloud Computing', 'Cybersecurity'
    ];
    
    // Simulate topic extraction based on content length
    const numTopics = Math.min(3 + Math.floor(spokenContent.length / 5), 6);
    return commonTopics.slice(0, numTopics);
  };

  useEffect(() => {
    if (sessionData) {
      processContent();
    }
  }, [sessionData]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            AI Content Processing
          </CardTitle>
          <CardDescription>
            Analyzing presentation session and generating educational content
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isProcessing && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{currentStep}</span>
                <span className="text-sm text-muted-foreground">{progress}%</span>
              </div>
              <Progress value={progress} className="w-full" />
            </div>
          )}

          {processedContent && (
            <div className="space-y-4">
              <Badge variant="outline" className="bg-green-50 text-green-700">
                Processing Complete
              </Badge>
              
              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Summary Generated
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-3">
                      {processedContent.summary.substring(0, 100)}...
                    </p>
                    <Button 
                      onClick={() => onDownload('summary')}
                      size="sm"
                      className="w-full"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download Summary
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <HelpCircle className="h-4 w-4" />
                      Quiz Generated
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-3">
                      {processedContent.mcqs.length} MCQs and {processedContent.theoryQuestions.length} theory questions
                    </p>
                    <Button 
                      onClick={() => onDownload('quiz')}
                      size="sm"
                      className="w-full"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download Quiz
                    </Button>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-3">
                <h4 className="font-semibold">Key Points Extracted:</h4>
                <ul className="space-y-1">
                  {processedContent.keyPoints.map((point, index) => (
                    <li key={index} className="text-sm flex items-start gap-2">
                      <span className="text-primary">•</span>
                      {point}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AIContentProcessor;