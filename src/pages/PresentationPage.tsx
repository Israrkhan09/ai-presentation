import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { usePresentationStore } from '@/store/presentationStore';
import { toast } from '@/hooks/use-toast';
import PDFViewer from '@/components/PDFViewer';
import VoiceRecorder from '@/components/VoiceRecorder';
import {
  Play,
  Square,
  Home,
  Settings,
  Maximize2,
  Minimize2,
  FileText,
  Brain,
  HelpCircle } from
'lucide-react';

const PresentationPage = () => {
  const { id } = useParams<{id: string;}>();
  const navigate = useNavigate();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [showQuiz, setShowQuiz] = useState(false);
  const [isGenerating, setIsGenerating] = useState({ summary: false, quiz: false });

  const {
    presentations,
    currentPresentation,
    currentPage,
    isPresenting,
    isVoiceControlEnabled,
    setCurrentPresentation,
    setCurrentPage,
    startPresentation,
    endPresentation,
    toggleVoiceControl,
    addVoiceCommand,
    generateSummary,
    generateQuiz
  } = usePresentationStore();

  useEffect(() => {
    const presentation = presentations.find((p) => p.id === id);
    if (presentation) {
      setCurrentPresentation(presentation);
    } else {
      navigate('/dashboard');
    }
  }, [id, presentations, setCurrentPresentation, navigate]);

  const handleVoiceCommand = (command: string) => {
    const lowerCommand = command.toLowerCase();
    addVoiceCommand(command);

    if (lowerCommand.includes('next slide')) {
      if (currentPresentation && currentPage < currentPresentation.totalPages) {
        setCurrentPage(currentPage + 1);
      }
    } else if (lowerCommand.includes('previous slide') || lowerCommand.includes('back')) {
      if (currentPage > 1) {
        setCurrentPage(currentPage - 1);
      }
    } else if (lowerCommand.includes('first slide')) {
      setCurrentPage(1);
    } else if (lowerCommand.includes('last slide')) {
      if (currentPresentation) {
        setCurrentPage(currentPresentation.totalPages);
      }
    } else if (lowerCommand.includes('start presentation')) {
      if (!isPresenting) {
        startPresentation();
      }
    } else if (lowerCommand.includes('end presentation') || lowerCommand.includes('stop')) {
      if (isPresenting) {
        endPresentation();
        handleGenerateContent();
      }
    }
  };

  const handleStartPresentation = () => {
    startPresentation();
    if (document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    }
    toast({
      title: "Presentation Started",
      description: "Use voice commands or keyboard to navigate"
    });
  };

  const handleEndPresentation = () => {
    endPresentation();
    if (document.fullscreenElement) {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
    handleGenerateContent();
  };

  const handleGenerateContent = async () => {
    if (!currentPresentation) return;

    // Generate summary
    setIsGenerating((prev) => ({ ...prev, summary: true }));
    toast({
      title: "Generating Summary",
      description: "AI is analyzing your presentation content..."
    });
    await generateSummary(currentPresentation.id);
    setIsGenerating((prev) => ({ ...prev, summary: false }));

    // Generate quiz
    setIsGenerating((prev) => ({ ...prev, quiz: true }));
    toast({
      title: "Generating Quiz",
      description: "Creating knowledge assessment questions..."
    });
    await generateQuiz(currentPresentation.id);
    setIsGenerating((prev) => ({ ...prev, quiz: false }));

    toast({
      title: "Content Generated",
      description: "Summary and quiz are now available"
    });
    setShowSummary(true);
  };

  const toggleFullscreen = () => {
    if (!isFullscreen) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!isPresenting) return;

      switch (e.key) {
        case 'ArrowRight':
        case ' ':
          if (currentPresentation && currentPage < currentPresentation.totalPages) {
            setCurrentPage(currentPage + 1);
          }
          break;
        case 'ArrowLeft':
          if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
          }
          break;
        case 'Home':
          setCurrentPage(1);
          break;
        case 'End':
          if (currentPresentation) {
            setCurrentPage(currentPresentation.totalPages);
          }
          break;
        case 'Escape':
          handleEndPresentation();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isPresenting, currentPage, currentPresentation]);

  if (!currentPresentation) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Presentation Not Found</h2>
          <Button onClick={() => navigate('/dashboard')}>
            Return to Dashboard
          </Button>
        </div>
      </div>);

  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      {!isFullscreen &&
      <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center gap-3">
                <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard')}>
                  <Home className="h-4 w-4" />
                </Button>
                <h1 className="text-lg font-semibold">{currentPresentation.title}</h1>
                <Badge variant={isPresenting ? "default" : "secondary"}>
                  {isPresenting ? 'Presenting' : 'Ready'}
                </Badge>
              </div>
              
              <div className="flex items-center gap-2">
                <Badge variant={isVoiceControlEnabled ? "default" : "outline"}>
                  Voice {isVoiceControlEnabled ? 'On' : 'Off'}
                </Badge>
                <Button variant="ghost" size="sm" onClick={toggleFullscreen}>
                  {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                </Button>
                <Button variant="ghost" size="sm">
                  <Settings className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </header>
      }

      <div className="flex h-screen">
        {/* Main Presentation Area */}
        <div className={`flex-1 p-4 ${isPresenting ? 'bg-black' : ''}`}>
          <div className="h-full flex flex-col">
            {/* Controls */}
            {!isFullscreen &&
            <div className="flex justify-center gap-4 mb-4">
                {!isPresenting ?
              <Button onClick={handleStartPresentation} size="lg">
                    <Play className="h-4 w-4 mr-2" />
                    Start Presentation
                  </Button> :

              <Button onClick={handleEndPresentation} variant="destructive" size="lg">
                    <Square className="h-4 w-4 mr-2" />
                    End Presentation
                  </Button>
              }
                <Button
                onClick={toggleVoiceControl}
                variant={isVoiceControlEnabled ? "default" : "outline"}>

                  Voice Control {isVoiceControlEnabled ? 'On' : 'Off'}
                </Button>
              </div>
            }

            {/* PDF Viewer */}
            <div className="flex-1">
              <PDFViewer
                fileUrl={currentPresentation.fileUrl}
                currentPage={currentPage}
                onPageChange={setCurrentPage}
                className="h-full" />

            </div>
          </div>
        </div>

        {/* Side Panel */}
        {!isFullscreen &&
        <div className="w-80 bg-muted/50 border-l p-4 space-y-4 overflow-y-auto">
            {/* Voice Control */}
            <VoiceRecorder
            onVoiceCommand={handleVoiceCommand}
            isActive={isVoiceControlEnabled} />


            {/* Post-Presentation Content */}
            {(currentPresentation.summary || currentPresentation.quiz) &&
          <div className="space-y-4">
                {/* Summary */}
                {currentPresentation.summary &&
            <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        AI Summary
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowSummary(!showSummary)}>

                          {showSummary ? 'Hide' : 'Show'} Summary
                        </Button>
                        {showSummary &&
                  <p className="text-sm text-muted-foreground">
                            {currentPresentation.summary}
                          </p>
                  }
                      </div>
                    </CardContent>
                  </Card>
            }

                {/* Quiz */}
                {currentPresentation.quiz &&
            <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <HelpCircle className="h-4 w-4" />
                        Knowledge Quiz
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowQuiz(!showQuiz)}>

                          {showQuiz ? 'Hide' : 'Show'} Quiz ({currentPresentation.quiz.length} questions)
                        </Button>
                        {showQuiz &&
                  <div className="space-y-3">
                            {currentPresentation.quiz.map((question, index) =>
                    <div key={question.id} className="p-3 border rounded-lg">
                                <p className="font-medium text-sm mb-2">
                                  {index + 1}. {question.question}
                                </p>
                                <div className="space-y-1">
                                  {question.options.map((option, optIndex) =>
                        <div key={optIndex} className="flex items-center gap-2">
                                      <div className={`h-2 w-2 rounded-full ${
                          optIndex === question.correctAnswer ?
                          'bg-green-500' :
                          'bg-muted'}`
                          } />
                                      <p className="text-xs">{option}</p>
                                    </div>
                        )}
                                </div>
                              </div>
                    )}
                          </div>
                  }
                      </div>
                    </CardContent>
                  </Card>
            }
              </div>
          }

            {/* Generate Content Button */}
            {isPresenting && !currentPresentation.summary &&
          <Button
            onClick={handleGenerateContent}
            disabled={isGenerating.summary || isGenerating.quiz}
            className="w-full">

                <Brain className="h-4 w-4 mr-2" />
                {isGenerating.summary || isGenerating.quiz ?
            'Generating...' :
            'Generate AI Content'
            }
              </Button>
          }
          </div>
        }
      </div>
    </div>);

};

export default PresentationPage;