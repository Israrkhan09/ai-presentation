import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { StickyNote, Edit, Save, RefreshCw, Eye, EyeOff } from 'lucide-react';

interface SpeakerNote {
  slideIndex: number;
  title: string;
  keyPoints: string[];
  suggestedTiming: string;
  transitions: string;
  aiGenerated: boolean;
}

interface SpeakerNotesProps {
  currentSlide: number;
  slideContent: string[];
  transcript: string;
  onNotesUpdate: (notes: SpeakerNote[]) => void;
}

const SpeakerNotes: React.FC<SpeakerNotesProps> = ({
  currentSlide,
  slideContent,
  transcript,
  onNotesUpdate
}) => {
  const [notes, setNotes] = useState<SpeakerNote[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedNote, setEditedNote] = useState<string>('');
  const [isVisible, setIsVisible] = useState(true);

  // Generate initial speaker notes based on slide content
  useEffect(() => {
    generateInitialNotes();
  }, [slideContent]);

  const generateInitialNotes = async () => {
    setIsGenerating(true);
    
    const mockNotes: SpeakerNote[] = [
      {
        slideIndex: 0,
        title: "Introduction to AI-Powered Presentations",
        keyPoints: [
          "Welcome the audience and introduce the topic",
          "Highlight the revolutionary nature of AI in presentations",
          "Mention key benefits: real-time intelligence, automation, interactivity",
          "Set expectations for the demonstration"
        ],
        suggestedTiming: "3-4 minutes",
        transitions: "Transition: 'Let's dive into how this technology works...'",
        aiGenerated: true
      },
      {
        slideIndex: 1,
        title: "Real-Time Speech Recognition",
        keyPoints: [
          "Explain how the system captures speech with high accuracy",
          "Demonstrate the real-time nature of the technology",
          "Mention browser-based implementation (no downloads required)",
          "Discuss natural language processing capabilities"
        ],
        suggestedTiming: "4-5 minutes",
        transitions: "Transition: 'Now that we understand how it listens, let's see how it analyzes...'",
        aiGenerated: true
      },
      {
        slideIndex: 2,
        title: "AI-Generated Content Analysis",
        keyPoints: [
          "Describe continuous content analysis process",
          "Explain keyword identification and highlighting",
          "Discuss topic completion detection",
          "Show real-time feedback mechanisms"
        ],
        suggestedTiming: "5-6 minutes",
        transitions: "Transition: 'This analysis enables some powerful features, including...'",
        aiGenerated: true
      },
      {
        slideIndex: 3,
        title: "Interactive Quiz Generation",
        keyPoints: [
          "Introduce two types of quizzes: MCQ and theory-based",
          "Explain automatic generation from presentation content",
          "Highlight relevance and accuracy of generated questions",
          "Discuss use cases for audience engagement"
        ],
        suggestedTiming: "4-5 minutes",
        transitions: "Transition: 'Beyond quizzes, the system also offers hands-free control...'",
        aiGenerated: true
      },
      {
        slideIndex: 4,
        title: "Voice-Controlled Presentation",
        keyPoints: [
          "Demonstrate voice command functionality",
          "Show natural presentation flow without manual controls",
          "Explain available commands and their uses",
          "Discuss benefits for presenter engagement"
        ],
        suggestedTiming: "3-4 minutes",
        transitions: "Transition: 'Let's wrap up with the key takeaways...'",
        aiGenerated: true
      }
    ];

    // Simulate AI processing
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setNotes(mockNotes);
    onNotesUpdate(mockNotes);
    setIsGenerating(false);
  };

  const regenerateNotesForSlide = async (slideIndex: number) => {
    setIsGenerating(true);
    
    // Simulate AI regeneration based on current transcript and slide content
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Update notes based on current context
    const updatedNotes = notes.map(note => {
      if (note.slideIndex === slideIndex) {
        return {
          ...note,
          keyPoints: [
            ...note.keyPoints,
            `Updated based on current presentation context: ${new Date().toLocaleTimeString()}`
          ]
        };
      }
      return note;
    });
    
    setNotes(updatedNotes);
    onNotesUpdate(updatedNotes);
    setIsGenerating(false);
  };

  const startEditing = () => {
    const currentNote = notes[currentSlide];
    if (currentNote) {
      setEditedNote(currentNote.keyPoints.join('\n'));
      setIsEditing(true);
    }
  };

  const saveEdits = () => {
    const updatedNotes = notes.map(note => {
      if (note.slideIndex === currentSlide) {
        return {
          ...note,
          keyPoints: editedNote.split('\n').filter(point => point.trim()),
          aiGenerated: false
        };
      }
      return note;
    });
    
    setNotes(updatedNotes);
    onNotesUpdate(updatedNotes);
    setIsEditing(false);
    setEditedNote('');
  };

  const currentNote = notes[currentSlide];

  return (
    <Card className={`w-full transition-all duration-300 ${isVisible ? '' : 'opacity-50'}`}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <StickyNote className="h-5 w-5" />
            Speaker Notes
            {currentNote && (
              <Badge variant={currentNote.aiGenerated ? "default" : "secondary"}>
                {currentNote.aiGenerated ? "AI Generated" : "Custom"}
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={() => setIsVisible(!isVisible)}
              variant="outline"
              size="sm"
            >
              {isVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
            {currentNote && (
              <>
                <Button
                  onClick={() => regenerateNotesForSlide(currentSlide)}
                  disabled={isGenerating}
                  variant="outline"
                  size="sm"
                >
                  {isGenerating ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <RefreshCw className="h-4 w-4" />
                  )}
                </Button>
                <Button
                  onClick={isEditing ? saveEdits : startEditing}
                  variant="outline"
                  size="sm"
                >
                  {isEditing ? <Save className="h-4 w-4" /> : <Edit className="h-4 w-4" />}
                </Button>
              </>
            )}
          </div>
        </CardTitle>
      </CardHeader>
      
      {isVisible && (
        <CardContent className="space-y-4">
          {!currentNote ? (
            <div className="text-center py-8">
              <StickyNote className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">
                {isGenerating ? 'Generating speaker notes...' : 'No notes available for this slide'}
              </p>
            </div>
          ) : (
            <>
              {/* Slide Title */}
              <div>
                <h3 className="font-semibold text-lg">{currentNote.title}</h3>
                <Badge variant="outline" className="mt-1">
                  Slide {currentSlide + 1} • {currentNote.suggestedTiming}
                </Badge>
              </div>

              {/* Key Points */}
              <div>
                <h4 className="font-medium mb-2">Key Points:</h4>
                {isEditing ? (
                  <div className="space-y-2">
                    <Textarea
                      value={editedNote}
                      onChange={(e) => setEditedNote(e.target.value)}
                      placeholder="Enter key points (one per line)"
                      rows={8}
                    />
                    <div className="flex gap-2">
                      <Button onClick={saveEdits} size="sm">
                        <Save className="h-4 w-4 mr-1" />
                        Save
                      </Button>
                      <Button 
                        onClick={() => setIsEditing(false)} 
                        variant="outline" 
                        size="sm"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <ScrollArea className="h-32">
                    <ul className="space-y-2">
                      {currentNote.keyPoints.map((point, index) => (
                        <li key={index} className="flex items-start gap-2 text-sm">
                          <span className="text-blue-500 mt-1 flex-shrink-0">•</span>
                          <span>{point}</span>
                        </li>
                      ))}
                    </ul>
                  </ScrollArea>
                )}
              </div>

              {/* Transition */}
              {currentNote.transitions && (
                <div>
                  <h4 className="font-medium mb-2">Suggested Transition:</h4>
                  <div className="bg-yellow-50 p-3 rounded text-sm border-l-4 border-yellow-400">
                    {currentNote.transitions}
                  </div>
                </div>
              )}

              {/* Live Context */}
              {transcript && (
                <div>
                  <h4 className="font-medium mb-2">Current Context:</h4>
                  <div className="bg-blue-50 p-3 rounded text-sm">
                    <p className="text-gray-700">
                      Words spoken: {transcript.split(' ').length} | 
                      Last updated: {new Date().toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              )}

              {/* Quick Actions */}
              <div className="flex flex-wrap gap-2 pt-2 border-t">
                <Badge 
                  variant="outline" 
                  className="cursor-pointer hover:bg-gray-50"
                  onClick={() => console.log('Practice mode activated')}
                >
                  Practice Mode
                </Badge>
                <Badge 
                  variant="outline" 
                  className="cursor-pointer hover:bg-gray-50"
                  onClick={() => console.log('Timer started')}
                >
                  Start Timer
                </Badge>
                <Badge 
                  variant="outline" 
                  className="cursor-pointer hover:bg-gray-50"
                  onClick={() => console.log('Notes exported')}
                >
                  Export Notes
                </Badge>
              </div>
            </>
          )}
        </CardContent>
      )}
    </Card>
  );
};

export default SpeakerNotes;
