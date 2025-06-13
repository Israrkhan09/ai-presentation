import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { FileText, Download, Clock, CheckCircle } from 'lucide-react';

interface PDFGeneratorProps {
  transcript: string;
  slideContent: string[];
  keywords: string[];
  sessionDuration: number;
}

interface LectureSection {
  title: string;
  content: string;
  timestamp: string;
  keywords: string[];
}

const PDFGenerator: React.FC<PDFGeneratorProps> = ({
  transcript,
  slideContent,
  keywords,
  sessionDuration
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [lastGenerated, setLastGenerated] = useState<Date | null>(null);

  const generateLectureSummary = async () => {
    setIsGenerating(true);
    setGenerationProgress(0);

    // Simulate AI processing steps
    const steps = [
      'Analyzing transcript...',
      'Extracting key concepts...',
      'Organizing content sections...',
      'Generating summary...',
      'Creating PDF document...'
    ];

    for (let i = 0; i < steps.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 800));
      setGenerationProgress(((i + 1) / steps.length) * 100);
    }

    // Process the transcript into structured sections
    const sections = processTranscriptIntoSections(transcript, slideContent);
    
    // Generate PDF (simplified version without jsPDF)
    await createTextSummary(sections);
    
    setIsGenerating(false);
    setLastGenerated(new Date());
  };

  const processTranscriptIntoSections = (transcript: string, slides: string[]): LectureSection[] => {
    // Mock processing - in real implementation, this would use AI to intelligently segment content
    const words = transcript.split(' ');
    const wordsPerSection = Math.ceil(words.length / 5);
    const sections: LectureSection[] = [];

    for (let i = 0; i < 5; i++) {
      const startIndex = i * wordsPerSection;
      const endIndex = Math.min((i + 1) * wordsPerSection, words.length);
      const sectionWords = words.slice(startIndex, endIndex);
      
      // Extract section-specific keywords
      const sectionKeywords = keywords.filter(keyword => 
        sectionWords.some(word => word.toLowerCase().includes(keyword.toLowerCase()))
      );

      sections.push({
        title: `Section ${i + 1}: ${getSectionTitle(sectionWords)}`,
        content: sectionWords.join(' '),
        timestamp: formatTimestamp(i * 5), // Mock timestamp
        keywords: sectionKeywords
      });
    }

    return sections;
  };

  const getSectionTitle = (words: string[]): string => {
    // Simple title extraction - find the most relevant words
    const commonWords = ['the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by'];
    const meaningfulWords = words
      .filter(word => word.length > 3 && !commonWords.includes(word.toLowerCase()))
      .slice(0, 3);
    
    return meaningfulWords.join(' ') || 'Content Overview';
  };

  const formatTimestamp = (minutes: number): string => {
    const mins = Math.floor(minutes);
    const secs = Math.floor((minutes - mins) * 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const createTextSummary = async (sections: LectureSection[]) => {
    // Create a comprehensive text summary
    let summaryContent = `AI-Generated Lecture Summary\n`;
    summaryContent += `Generated on: ${new Date().toLocaleDateString()}\n`;
    summaryContent += `Session Duration: ${Math.floor(sessionDuration / 60)}:${(sessionDuration % 60).toString().padStart(2, '0')}\n\n`;
    
    // Keywords Section
    summaryContent += `Key Topics Covered:\n${keywords.join(', ')}\n\n`;
    
    // Content Sections
    sections.forEach((section) => {
      summaryContent += `${section.title} (${section.timestamp})\n`;
      summaryContent += `${section.content}\n`;
      if (section.keywords.length > 0) {
        summaryContent += `Keywords: ${section.keywords.join(', ')}\n`;
      }
      summaryContent += '\n---\n\n';
    });

    // Create and download the text file
    const blob = new Blob([summaryContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `lecture-summary-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const formatDuration = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          AI Lecture Summary Generator
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {transcript.split(' ').length}
            </div>
            <div className="text-sm text-gray-600">Words Spoken</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {keywords.length}
            </div>
            <div className="text-sm text-gray-600">Key Topics</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {slideContent.length}
            </div>
            <div className="text-sm text-gray-600">Slides Covered</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600 flex items-center justify-center gap-1">
              <Clock className="h-5 w-5" />
              {formatDuration(sessionDuration)}
            </div>
            <div className="text-sm text-gray-600">Duration</div>
          </div>
        </div>

        {/* Generation Status */}
        {isGenerating && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Generating Summary...</span>
              <span className="text-sm text-gray-600">{Math.round(generationProgress)}%</span>
            </div>
            <Progress value={generationProgress} className="w-full" />
          </div>
        )}

        {/* Last Generated Info */}
        {lastGenerated && (
          <div className="flex items-center gap-2 text-sm text-green-600">
            <CheckCircle className="h-4 w-4" />
            Last generated: {lastGenerated.toLocaleString()}
          </div>
        )}

        {/* Keywords Preview */}
        <div>
          <h4 className="text-sm font-medium mb-2">Detected Keywords:</h4>
          <div className="flex flex-wrap gap-1">
            {keywords.slice(0, 8).map((keyword, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {keyword}
              </Badge>
            ))}
            {keywords.length > 8 && (
              <Badge variant="outline" className="text-xs">
                +{keywords.length - 8} more
              </Badge>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button 
            onClick={generateLectureSummary}
            disabled={isGenerating || transcript.length < 100}
            className="flex-1"
          >
            {isGenerating ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Generating Summary...
              </>
            ) : (
              <>
                <Download className="h-4 w-4 mr-2" />
                Generate Text Summary
              </>
            )}
          </Button>
        </div>

        {/* Instructions */}
        {transcript.length < 100 && (
          <div className="text-sm text-gray-600 bg-yellow-50 p-3 rounded">
            <strong>Note:</strong> Continue speaking to accumulate more content for a comprehensive summary. 
            At least 100 words are recommended for meaningful summary generation.
          </div>
        )}

        {/* Sample Summary Preview */}
        {transcript.length >= 100 && (
          <div className="mt-4">
            <h4 className="text-sm font-medium mb-2">Summary Preview:</h4>
            <div className="bg-gray-50 p-3 rounded text-sm max-h-32 overflow-y-auto">
              <p className="font-medium">AI-Generated Lecture Summary</p>
              <p className="text-gray-600 mt-1">
                This presentation covered {keywords.length} key topics including {keywords.slice(0, 3).join(', ')}.
                The session lasted {formatDuration(sessionDuration)} with approximately {transcript.split(' ').length} words spoken.
              </p>
              <p className="text-gray-500 text-xs mt-2">
                Click "Generate Text Summary" to download the complete summary.
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PDFGenerator;
