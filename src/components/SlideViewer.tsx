import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight, Upload, Presentation, Eye } from 'lucide-react';

interface Slide {
  id: number;
  title: string;
  content: string;
  keywords?: string[];
  imageUrl?: string;
}

interface SlideViewerProps {
  highlightedKeywords: string[];
  onSlideChange: (slideIndex: number) => void;
  autoAdvance?: boolean;
}

const SlideViewer: React.FC<SlideViewerProps> = ({
  highlightedKeywords,
  onSlideChange,
  autoAdvance = false
}) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [slides, setSlides] = useState<Slide[]>([
    {
      id: 1,
      title: "Introduction to AI-Powered Presentations",
      content: "Welcome to the future of presentations! Today we'll explore how artificial intelligence can transform the way we create, deliver, and interact with presentations. Our AI system listens in real-time, generates summaries, and creates interactive experiences for both presenters and audiences.",
      keywords: ["AI", "artificial intelligence", "presentations", "real-time", "interactive"],
      imageUrl: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=400&h=300&fit=crop"
    },
    {
      id: 2,
      title: "Real-Time Speech Recognition",
      content: "Our advanced speech recognition system captures every word you speak with high accuracy. It processes natural language, understands context, and provides intelligent insights about your presentation flow. The system works entirely through the web browser without requiring additional software or installations.",
      keywords: ["speech recognition", "natural language", "accuracy", "browser", "web"],
      imageUrl: "https://images.unsplash.com/photo-1589254065878-42c9da997008?w=400&h=300&fit=crop"
    },
    {
      id: 3,
      title: "AI-Generated Content Analysis",
      content: "The AI continuously analyzes your spoken content, identifying key concepts, measuring topic completion, and suggesting optimal timing for slide transitions. It creates intelligent keyword highlighting and provides real-time feedback to enhance your presentation delivery.",
      keywords: ["content analysis", "key concepts", "timing", "transitions", "feedback"],
      imageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop"
    },
    {
      id: 4,
      title: "Interactive Quiz Generation",
      content: "After your presentation, the AI automatically generates two types of assessments: Multiple Choice Questions (MCQs) for quick evaluation and Theory-based questions for deeper understanding. These quizzes are based on the actual content you presented, ensuring relevance and accuracy.",
      keywords: ["quiz generation", "MCQs", "multiple choice", "theory questions", "assessment"],
      imageUrl: "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=400&h=300&fit=crop"
    },
    {
      id: 5,
      title: "Voice-Controlled Presentation",
      content: "Control your presentation hands-free with voice commands. Navigate between slides, highlight important points, or trigger specific features just by speaking. This allows for a more natural, engaging presentation style while maintaining full control over your content flow.",
      keywords: ["voice control", "hands-free", "navigation", "commands", "natural"],
      imageUrl: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=300&fit=crop"
    }
  ]);

  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    onSlideChange(currentSlide);
  }, [currentSlide, onSlideChange]);

  const nextSlide = () => {
    setCurrentSlide(prev => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide(prev => (prev - 1 + slides.length) % slides.length);
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  const highlightText = (text: string, keywords: string[]) => {
    if (!keywords.length) return text;
    
    let highlightedText = text;
    keywords.forEach(keyword => {
      const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
      highlightedText = highlightedText.replace(
        regex, 
        `<span class="bg-yellow-200 px-1 rounded font-semibold">$&</span>`
      );
    });
    
    return highlightedText;
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const uploadSlides = () => {
    // Mock file upload
    console.log('Upload slides functionality would be implemented here');
  };

  const current = slides[currentSlide];

  return (
    <div className={`${isFullscreen ? 'fixed inset-0 z-50 bg-white' : ''}`}>
      <Card className="w-full h-full">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="flex items-center gap-2">
            <Presentation className="h-5 w-5" />
            Slide Viewer ({currentSlide + 1} of {slides.length})
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={uploadSlides}
              className="flex items-center gap-1"
            >
              <Upload className="h-4 w-4" />
              Upload
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={toggleFullscreen}
              className="flex items-center gap-1"
            >
              <Eye className="h-4 w-4" />
              {isFullscreen ? 'Exit' : 'Fullscreen'}
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Slide Content */}
          <div className={`${isFullscreen ? 'h-screen p-8' : 'min-h-96'} bg-gradient-to-br from-blue-50 to-indigo-100 rounded-lg p-6 flex flex-col justify-center`}>
            {current.imageUrl && (
              <div className="mb-6 flex justify-center">
                <img 
                  src={current.imageUrl} 
                  alt={current.title}
                  className="rounded-lg shadow-lg max-h-48 object-cover"
                />
              </div>
            )}
            
            <h2 className={`${isFullscreen ? 'text-4xl' : 'text-2xl'} font-bold text-gray-800 mb-4 text-center`}>
              {current.title}
            </h2>
            
            <div 
              className={`${isFullscreen ? 'text-xl' : 'text-base'} text-gray-700 leading-relaxed text-center`}
              dangerouslySetInnerHTML={{
                __html: highlightText(current.content, highlightedKeywords)
              }}
            />
            
            {/* Keywords */}
            {current.keywords && (
              <div className="mt-6 flex flex-wrap justify-center gap-2">
                {current.keywords.map((keyword, index) => (
                  <Badge 
                    key={index} 
                    variant={highlightedKeywords.includes(keyword) ? "default" : "secondary"}
                    className={highlightedKeywords.includes(keyword) ? "bg-yellow-500" : ""}
                  >
                    {keyword}
                  </Badge>
                ))}
              </div>
            )}
          </div>
          
          {/* Navigation Controls */}
          <div className="flex items-center justify-between">
            <Button 
              variant="outline" 
              onClick={prevSlide}
              disabled={currentSlide === 0}
              className="flex items-center gap-1"
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            
            {/* Slide Indicators */}
            <div className="flex items-center gap-1">
              {slides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={`w-3 h-3 rounded-full transition-all ${
                    index === currentSlide 
                      ? 'bg-blue-600' 
                      : 'bg-gray-300 hover:bg-gray-400'
                  }`}
                />
              ))}
            </div>
            
            <Button 
              variant="outline" 
              onClick={nextSlide}
              disabled={currentSlide === slides.length - 1}
              className="flex items-center gap-1"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          
          {/* Auto-advance indicator */}
          {autoAdvance && (
            <div className="text-center">
              <Badge variant="outline" className="bg-green-50 text-green-700">
                Auto-advance enabled
              </Badge>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SlideViewer;
