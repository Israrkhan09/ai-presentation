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
      <div className="min-h-screen flex items-center justify-center" data-id="ts7mh6byr" data-path="src/pages/PresentationPage.tsx">
        <div className="text-center" data-id="0khq8l15e" data-path="src/pages/PresentationPage.tsx">
          <h2 className="text-xl font-semibold mb-2" data-id="fzye7x8aq" data-path="src/pages/PresentationPage.tsx">Presentation Not Found</h2>
          <Button onClick={() => navigate('/dashboard')} data-id="aroqqkw7c" data-path="src/pages/PresentationPage.tsx">
            Return to Dashboard
          </Button>
        </div>
      </div>);

  }

  return (
    <div className="min-h-screen bg-background" data-id="iaov6clgl" data-path="src/pages/PresentationPage.tsx">
      {/* Header */}
      {!isFullscreen &&
      <header className="bg-white shadow-sm border-b" data-id="o65aebe32" data-path="src/pages/PresentationPage.tsx">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" data-id="qwgrcnb35" data-path="src/pages/PresentationPage.tsx">
            <div className="flex justify-between items-center h-16" data-id="8q1jofrhr" data-path="src/pages/PresentationPage.tsx">
              <div className="flex items-center gap-3" data-id="xno10j29c" data-path="src/pages/PresentationPage.tsx">
                <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard')} data-id="p5wxh8yz8" data-path="src/pages/PresentationPage.tsx">
                  <Home className="h-4 w-4" data-id="555ujvao4" data-path="src/pages/PresentationPage.tsx" />
                </Button>
                <h1 className="text-lg font-semibold" data-id="j6qe35m5v" data-path="src/pages/PresentationPage.tsx">{currentPresentation.title}</h1>
                <Badge variant={isPresenting ? "default" : "secondary"} data-id="12jho5oxf" data-path="src/pages/PresentationPage.tsx">
                  {isPresenting ? 'Presenting' : 'Ready'}
                </Badge>
              </div>
              
              <div className="flex items-center gap-2" data-id="al9c1ub6r" data-path="src/pages/PresentationPage.tsx">
                <Badge variant={isVoiceControlEnabled ? "default" : "outline"} data-id="d9tmnu3gf" data-path="src/pages/PresentationPage.tsx">
                  Voice {isVoiceControlEnabled ? 'On' : 'Off'}
                </Badge>
                <Button variant="ghost" size="sm" onClick={toggleFullscreen} data-id="riw5zgbvh" data-path="src/pages/PresentationPage.tsx">
                  {isFullscreen ? <Minimize2 className="h-4 w-4" data-id="rhaijt822" data-path="src/pages/PresentationPage.tsx" /> : <Maximize2 className="h-4 w-4" data-id="uiml2c82v" data-path="src/pages/PresentationPage.tsx" />}
                </Button>
                <Button variant="ghost" size="sm" data-id="f740f5gtc" data-path="src/pages/PresentationPage.tsx">
                  <Settings className="h-4 w-4" data-id="oo3wzswvv" data-path="src/pages/PresentationPage.tsx" />
                </Button>
              </div>
            </div>
          </div>
        </header>
      }

      <div className="flex h-screen" data-id="oj7avyo9p" data-path="src/pages/PresentationPage.tsx">
        {/* Main Presentation Area */}
        <div className={`flex-1 p-4 ${isPresenting ? 'bg-black' : ''}`} data-id="c75w088wn" data-path="src/pages/PresentationPage.tsx">
          <div className="h-full flex flex-col" data-id="p9u6lfwd3" data-path="src/pages/PresentationPage.tsx">
            {/* Controls */}
            {!isFullscreen &&
            <div className="flex justify-center gap-4 mb-4" data-id="muwyxo7mg" data-path="src/pages/PresentationPage.tsx">
                {!isPresenting ?
              <Button onClick={handleStartPresentation} size="lg" data-id="gx0jwb2qk" data-path="src/pages/PresentationPage.tsx">
                    <Play className="h-4 w-4 mr-2" data-id="34n8m7kiz" data-path="src/pages/PresentationPage.tsx" />
                    Start Presentation
                  </Button> :

              <Button onClick={handleEndPresentation} variant="destructive" size="lg" data-id="tw3hwo34m" data-path="src/pages/PresentationPage.tsx">
                    <Square className="h-4 w-4 mr-2" data-id="lcpuiubun" data-path="src/pages/PresentationPage.tsx" />
                    End Presentation
                  </Button>
              }
                <Button
                onClick={toggleVoiceControl}
                variant={isVoiceControlEnabled ? "default" : "outline"} data-id="2wh6sb5ho" data-path="src/pages/PresentationPage.tsx">

                  Voice Control {isVoiceControlEnabled ? 'On' : 'Off'}
                </Button>
              </div>
            }

            {/* PDF Viewer */}
            <div className="flex-1" data-id="b8zaqbqhz" data-path="src/pages/PresentationPage.tsx">
              <PDFViewer
                fileUrl={currentPresentation.fileUrl}
                currentPage={currentPage}
                onPageChange={setCurrentPage}
                className="h-full" data-id="5opqq78i6" data-path="src/pages/PresentationPage.tsx" />

            </div>
          </div>
        </div>

        {/* Side Panel */}
        {!isFullscreen &&
        <div className="w-80 bg-muted/50 border-l p-4 space-y-4 overflow-y-auto" data-id="fkkn0h033" data-path="src/pages/PresentationPage.tsx">
            {/* Voice Control */}
            <VoiceRecorder
            onVoiceCommand={handleVoiceCommand}
            isActive={isVoiceControlEnabled} data-id="wae5mphz5" data-path="src/pages/PresentationPage.tsx" />


            {/* Post-Presentation Content */}
            {(currentPresentation.summary || currentPresentation.quiz) &&
          <div className="space-y-4" data-id="x0qtaqywf" data-path="src/pages/PresentationPage.tsx">
                {/* Summary */}
                {currentPresentation.summary &&
            <Card data-id="frfexbb6b" data-path="src/pages/PresentationPage.tsx">
                    <CardHeader data-id="ab1t51f1w" data-path="src/pages/PresentationPage.tsx">
                      <CardTitle className="flex items-center gap-2" data-id="whrs9fzw1" data-path="src/pages/PresentationPage.tsx">
                        <FileText className="h-4 w-4" data-id="zfwo3eirz" data-path="src/pages/PresentationPage.tsx" />
                        AI Summary
                      </CardTitle>
                    </CardHeader>
                    <CardContent data-id="aogju79k6" data-path="src/pages/PresentationPage.tsx">
                      <div className="space-y-2" data-id="5drrr6hal" data-path="src/pages/PresentationPage.tsx">
                        <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowSummary(!showSummary)} data-id="fkfc6y7ls" data-path="src/pages/PresentationPage.tsx">

                          {showSummary ? 'Hide' : 'Show'} Summary
                        </Button>
                        {showSummary &&
                  <p className="text-sm text-muted-foreground" data-id="jpveleab1" data-path="src/pages/PresentationPage.tsx">
                            {currentPresentation.summary}
                          </p>
                  }
                      </div>
                    </CardContent>
                  </Card>
            }

                {/* Quiz */}
                {currentPresentation.quiz &&
            <Card data-id="dv8t25y2g" data-path="src/pages/PresentationPage.tsx">
                    <CardHeader data-id="yx834zzyv" data-path="src/pages/PresentationPage.tsx">
                      <CardTitle className="flex items-center gap-2" data-id="2d83a783s" data-path="src/pages/PresentationPage.tsx">
                        <HelpCircle className="h-4 w-4" data-id="p1nf1ef6q" data-path="src/pages/PresentationPage.tsx" />
                        Knowledge Quiz
                      </CardTitle>
                    </CardHeader>
                    <CardContent data-id="xh1tpszyz" data-path="src/pages/PresentationPage.tsx">
                      <div className="space-y-2" data-id="ebj17hotd" data-path="src/pages/PresentationPage.tsx">
                        <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowQuiz(!showQuiz)} data-id="z8e8ql0p1" data-path="src/pages/PresentationPage.tsx">

                          {showQuiz ? 'Hide' : 'Show'} Quiz ({currentPresentation.quiz.length} questions)
                        </Button>
                        {showQuiz &&
                  <div className="space-y-3" data-id="49vl102qp" data-path="src/pages/PresentationPage.tsx">
                            {currentPresentation.quiz.map((question, index) =>
                    <div key={question.id} className="p-3 border rounded-lg" data-id="pzmgweyy2" data-path="src/pages/PresentationPage.tsx">
                                <p className="font-medium text-sm mb-2" data-id="962d1p4yq" data-path="src/pages/PresentationPage.tsx">
                                  {index + 1}. {question.question}
                                </p>
                                <div className="space-y-1" data-id="h3lv5fw1y" data-path="src/pages/PresentationPage.tsx">
                                  {question.options.map((option, optIndex) =>
                        <div key={optIndex} className="flex items-center gap-2" data-id="kg7zqy8ed" data-path="src/pages/PresentationPage.tsx">
                                      <div className={`h-2 w-2 rounded-full ${
                          optIndex === question.correctAnswer ?
                          'bg-green-500' :
                          'bg-muted'}`
                          } data-id="ce0kvd5fn" data-path="src/pages/PresentationPage.tsx" />
                                      <p className="text-xs" data-id="sptqrzb02" data-path="src/pages/PresentationPage.tsx">{option}</p>
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
            className="w-full" data-id="5m3cquiu9" data-path="src/pages/PresentationPage.tsx">

                <Brain className="h-4 w-4 mr-2" data-id="77tijzmx7" data-path="src/pages/PresentationPage.tsx" />
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