import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Download,
  FileText,
  HelpCircle,
  CheckCircle,
  Loader2,
  Calendar,
  Clock } from
'lucide-react';
import { useToast } from '@/hooks/use-toast';

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

interface SessionData {
  presentationId: number;
  presentationTitle: string;
  startTime: Date;
  endTime?: Date;
  duration: number;
  spokenContent: string[];
  slideTransitions: number[];
  voiceCommands: string[];
}

interface DownloadManagerProps {
  sessionData: SessionData;
  processedContent: ProcessedContent;
}

const DownloadManager: React.FC<DownloadManagerProps> = ({
  sessionData,
  processedContent
}) => {
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentDownload, setCurrentDownload] = useState<string | null>(null);
  const { toast } = useToast();

  // Generate PDF summary
  const generatePDFSummary = async () => {
    setIsGenerating(true);
    setCurrentDownload('summary');
    setDownloadProgress(0);

    try {
      // Simulate PDF generation progress
      for (let i = 0; i <= 100; i += 10) {
        setDownloadProgress(i);
        await new Promise((resolve) => setTimeout(resolve, 150));
      }

      // Create PDF content
      const pdfContent = createPDFSummaryContent();

      // Create and download blob
      const blob = new Blob([pdfContent], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${sessionData.presentationTitle}_Summary_${formatDate(new Date())}.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({
        title: "Summary Downloaded",
        description: "PDF summary has been generated and downloaded successfully."
      });

    } catch (error) {
      console.error('Error generating PDF:', error);
      toast({
        title: "Download Error",
        description: "Failed to generate PDF summary. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
      setCurrentDownload(null);
      setDownloadProgress(0);
    }
  };

  // Generate quiz files
  const generateQuizFiles = async () => {
    setIsGenerating(true);
    setCurrentDownload('quiz');
    setDownloadProgress(0);

    try {
      // Simulate quiz generation progress
      for (let i = 0; i <= 100; i += 10) {
        setDownloadProgress(i);
        await new Promise((resolve) => setTimeout(resolve, 120));
      }

      // Create quiz content
      const quizContent = createQuizContent();

      // Create and download blob
      const blob = new Blob([quizContent], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${sessionData.presentationTitle}_Quiz_${formatDate(new Date())}.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({
        title: "Quiz Downloaded",
        description: "Quiz file has been generated and downloaded successfully."
      });

    } catch (error) {
      console.error('Error generating quiz:', error);
      toast({
        title: "Download Error",
        description: "Failed to generate quiz file. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
      setCurrentDownload(null);
      setDownloadProgress(0);
    }
  };

  // Create PDF summary content
  const createPDFSummaryContent = (): string => {
    const date = formatDate(sessionData.startTime);
    const duration = formatDuration(sessionData.duration);

    return `
AI-GENERATED PRESENTATION SUMMARY
=================================

Presentation: ${sessionData.presentationTitle}
Date: ${date}
Duration: ${duration}
Slides Covered: ${sessionData.slideTransitions.length}
Voice Commands Used: ${sessionData.voiceCommands.length}

EXECUTIVE SUMMARY
=================
${processedContent.summary}

KEY POINTS COVERED
==================
${processedContent.keyPoints.map((point, index) => `${index + 1}. ${point}`).join('\n')}

SESSION STATISTICS
==================
• Total Speaking Time: ${duration}
• Speech Segments Recorded: ${sessionData.spokenContent.length}
• Slide Transitions: ${sessionData.slideTransitions.length}
• Voice Commands Executed: ${sessionData.voiceCommands.length}

VOICE COMMANDS USED
===================
${sessionData.voiceCommands.map((cmd, index) => `${index + 1}. ${cmd.replace('_', ' ')}`).join('\n')}

PRESENTATION FLOW
=================
The presentation followed a structured approach with ${sessionData.slideTransitions.length} slide transitions,
maintaining audience engagement through voice-controlled navigation and interactive elements.

RECOMMENDATIONS
===============
• Continue using voice-controlled presentations for enhanced engagement
• Consider expanding on topics that generated the most discussion
• Review slide timing for optimal pacing in future presentations

---
Generated by AI Presentation System
${new Date().toISOString()}
    `.trim();
  };

  // Create quiz content
  const createQuizContent = (): string => {
    const date = formatDate(sessionData.startTime);

    let content = `
AI-GENERATED QUIZ
=================

Based on: ${sessionData.presentationTitle}
Date: ${date}
Generated: ${formatDate(new Date())}

MULTIPLE CHOICE QUESTIONS
=========================

`;

    processedContent.mcqs.forEach((mcq, index) => {
      content += `${index + 1}. ${mcq.question}\n`;
      mcq.options.forEach((option, optIndex) => {
        const letter = String.fromCharCode(65 + optIndex); // A, B, C, D
        const marker = optIndex === mcq.correctAnswer ? '* ' : '  ';
        content += `   ${marker}${letter}. ${option}\n`;
      });
      content += '\n';
    });

    content += `
THEORY QUESTIONS
================

`;

    processedContent.theoryQuestions.forEach((question, index) => {
      content += `${index + 1}. ${question}\n\n`;
    });

    content += `
ANSWER KEY
==========

Multiple Choice Answers:
`;

    processedContent.mcqs.forEach((mcq, index) => {
      const correctLetter = String.fromCharCode(65 + mcq.correctAnswer);
      content += `${index + 1}. ${correctLetter}\n`;
    });

    content += `
---
Generated by AI Presentation System
${new Date().toISOString()}
    `.trim();

    return content;
  };

  // Utility functions
  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor(seconds % 3600 / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    }
    return `${minutes}m ${secs}s`;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Download Generated Content
          </CardTitle>
          <CardDescription>
            Download your AI-generated presentation materials
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Session Info */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">{formatDate(sessionData.startTime)}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">{formatDuration(sessionData.duration)}</span>
            </div>
          </div>

          {/* Download Progress */}
          {isGenerating &&
          <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm font-medium">
                  Generating {currentDownload === 'summary' ? 'Summary' : 'Quiz'}...
                </span>
              </div>
              <Progress value={downloadProgress} className="w-full" />
            </div>
          }

          {/* Download Options */}
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Presentation Summary
                </CardTitle>
                <CardDescription>
                  Comprehensive summary with key points and session stats
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Key Points:</span>
                    <Badge variant="outline">{processedContent.keyPoints.length}</Badge>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Voice Commands:</span>
                    <Badge variant="outline">{sessionData.voiceCommands.length}</Badge>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Speech Segments:</span>
                    <Badge variant="outline">{sessionData.spokenContent.length}</Badge>
                  </div>
                </div>
                
                <Button
                  onClick={generatePDFSummary}
                  disabled={isGenerating}
                  className="w-full">

                  {isGenerating && currentDownload === 'summary' ?
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" /> :

                  <Download className="h-4 w-4 mr-2" />
                  }
                  Download Summary
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <HelpCircle className="h-4 w-4" />
                  Assessment Quiz
                </CardTitle>
                <CardDescription>
                  MCQs and theory questions based on presentation content
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>MCQs:</span>
                    <Badge variant="outline">{processedContent.mcqs.length}</Badge>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Theory Questions:</span>
                    <Badge variant="outline">{processedContent.theoryQuestions.length}</Badge>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Total Questions:</span>
                    <Badge variant="outline">
                      {processedContent.mcqs.length + processedContent.theoryQuestions.length}
                    </Badge>
                  </div>
                </div>
                
                <Button
                  onClick={generateQuizFiles}
                  disabled={isGenerating}
                  className="w-full">

                  {isGenerating && currentDownload === 'quiz' ?
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" /> :

                  <Download className="h-4 w-4 mr-2" />
                  }
                  Download Quiz
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Success Alert */}
          {!isGenerating &&
          <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                Files will be downloaded in text format. For PDF generation, consider using 
                your preferred document editor to format the content.
              </AlertDescription>
            </Alert>
          }
        </CardContent>
      </Card>
    </div>);

};

export default DownloadManager;