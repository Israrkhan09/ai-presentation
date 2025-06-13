import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { HelpCircle, CheckCircle, XCircle, Download, RefreshCw } from 'lucide-react';

interface MCQQuestion {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

interface TheoryQuestion {
  id: number;
  question: string;
  suggestedAnswer: string;
  keyPoints: string[];
}

interface QuizGeneratorProps {
  transcript: string;
  slideContent: string[];
  onQuizGenerated: (mcqs: MCQQuestion[], theory: TheoryQuestion[]) => void;
}

const QuizGenerator: React.FC<QuizGeneratorProps> = ({
  transcript,
  slideContent,
  onQuizGenerated
}) => {
  const [mcqQuestions, setMcqQuestions] = useState<MCQQuestion[]>([]);
  const [theoryQuestions, setTheoryQuestions] = useState<TheoryQuestion[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentMCQIndex, setCurrentMCQIndex] = useState(0);
  const [mcqAnswers, setMcqAnswers] = useState<{[key: number]: number;}>({});
  const [theoryAnswers, setTheoryAnswers] = useState<{[key: number]: string;}>({});
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);

  // Generate quiz based on transcript and slide content
  const generateQuiz = async () => {
    setIsGenerating(true);

    // Simulate AI processing
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Mock MCQ generation based on content
    const mockMCQs: MCQQuestion[] = [
    {
      id: 1,
      question: "What is the primary benefit of AI-powered presentations mentioned in the content?",
      options: [
      "Better visual design",
      "Real-time intelligence and adaptation",
      "Faster slide creation",
      "Better audio quality"],

      correctAnswer: 1,
      explanation: "The main benefit is real-time intelligence that adapts the presentation experience for both presenter and audience."
    },
    {
      id: 2,
      question: "Which feature automatically generates content after the presentation ends?",
      options: [
      "Voice commands",
      "Slide advancement",
      "PDF lecture summary",
      "Keyword highlighting"],

      correctAnswer: 2,
      explanation: "The AI automatically generates a structured PDF summary of the entire lecture after the session ends."
    },
    {
      id: 3,
      question: "How does the AI determine when to advance slides?",
      options: [
      "Based on time intervals",
      "Manual presenter input only",
      "Analyzing speech content and context",
      "Audience feedback"],

      correctAnswer: 2,
      explanation: "The AI continuously analyzes the spoken content and context to detect when the current slide's topic is complete."
    },
    {
      id: 4,
      question: "What types of quizzes can the AI generate?",
      options: [
      "Only multiple choice",
      "Only theory-based",
      "Both MCQ and theory-based",
      "Only visual quizzes"],

      correctAnswer: 2,
      explanation: "The AI can generate both MCQ (Multiple Choice Questions) and theory-based Q&A quizzes from the presentation content."
    }];


    const mockTheoryQuestions: TheoryQuestion[] = [
    {
      id: 1,
      question: "Explain how real-time speech recognition enhances the presentation experience.",
      suggestedAnswer: "Real-time speech recognition allows the AI system to continuously monitor and analyze the presenter's speech, enabling features like automatic slide advancement, keyword highlighting, and content analysis. This creates a more interactive and intelligent presentation environment that adapts to the presenter's flow and helps maintain audience engagement.",
      keyPoints: [
      "Continuous monitoring of speech",
      "Enables automatic slide advancement",
      "Facilitates keyword highlighting",
      "Provides content analysis",
      "Enhances audience engagement"]

    },
    {
      id: 2,
      question: "Describe the benefits of AI-generated speaker notes for presenters.",
      suggestedAnswer: "AI-generated speaker notes provide presenters with concise, relevant talking points based on their slide content. This helps maintain presentation flow, ensures key points are covered, reduces preparation time, and gives presenters confidence by having intelligent prompts available during delivery.",
      keyPoints: [
      "Concise talking points",
      "Maintains presentation flow",
      "Ensures key points coverage",
      "Reduces preparation time",
      "Increases presenter confidence"]

    },
    {
      id: 3,
      question: "How do voice-activated commands improve presentation delivery?",
      suggestedAnswer: "Voice-activated commands enable hands-free presentation control, allowing presenters to navigate slides, trigger features, and manage their presentation without physical interaction with devices. This creates a more natural, engaging presentation style and allows presenters to focus on audience interaction rather than technical controls.",
      keyPoints: [
      "Hands-free operation",
      "Natural presentation flow",
      "Enhanced audience interaction",
      "Reduced technical distractions",
      "More engaging delivery style"]

    }];


    setMcqQuestions(mockMCQs);
    setTheoryQuestions(mockTheoryQuestions);
    setIsGenerating(false);

    onQuizGenerated(mockMCQs, mockTheoryQuestions);
  };

  const handleMCQAnswer = (questionId: number, answerIndex: number) => {
    setMcqAnswers((prev) => ({
      ...prev,
      [questionId]: answerIndex
    }));
  };

  const handleTheoryAnswer = (questionId: number, answer: string) => {
    setTheoryAnswers((prev) => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const calculateScore = () => {
    let correctAnswers = 0;
    mcqQuestions.forEach((question) => {
      if (mcqAnswers[question.id] === question.correctAnswer) {
        correctAnswers++;
      }
    });
    const percentage = Math.round(correctAnswers / mcqQuestions.length * 100);
    setScore(percentage);
    setShowResults(true);
  };

  const resetQuiz = () => {
    setMcqAnswers({});
    setTheoryAnswers({});
    setShowResults(false);
    setScore(0);
    setCurrentMCQIndex(0);
  };

  const exportQuiz = () => {
    const quizData = {
      mcqQuestions,
      theoryQuestions,
      generatedAt: new Date().toISOString()
    };

    const dataStr = JSON.stringify(quizData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'ai-generated-quiz.json';
    link.click();
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <HelpCircle className="h-5 w-5" />
            AI Quiz Generator
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={generateQuiz}
              disabled={isGenerating}
              variant="outline"
              size="sm">

              {isGenerating ?
              <>
                  <RefreshCw className="h-4 w-4 animate-spin mr-1" />
                  Generating...
                </> :

              'Generate Quiz'
              }
            </Button>
            {(mcqQuestions.length > 0 || theoryQuestions.length > 0) &&
            <Button
              onClick={exportQuiz}
              variant="outline"
              size="sm">

                <Download className="h-4 w-4 mr-1" />
                Export
              </Button>
            }
          </div>
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        {mcqQuestions.length === 0 && theoryQuestions.length === 0 ?
        <div className="text-center py-8">
            <HelpCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">
              Click "Generate Quiz" to create questions based on your presentation content.
            </p>
          </div> :

        <Tabs defaultValue="mcq" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="mcq">
                MCQ Questions ({mcqQuestions.length})
              </TabsTrigger>
              <TabsTrigger value="theory">
                Theory Questions ({theoryQuestions.length})
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="mcq" className="space-y-4">
              {mcqQuestions.length > 0 &&
            <>
                  <div className="flex items-center justify-between">
                    <Badge variant="outline">
                      Question {currentMCQIndex + 1} of {mcqQuestions.length}
                    </Badge>
                    {showResults &&
                <Badge className={score >= 70 ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                        Score: {score}%
                      </Badge>
                }
                  </div>
                  
                  {mcqQuestions.map((question, index) =>
              <Card key={question.id} className={index === currentMCQIndex ? "border-blue-500" : "opacity-50"}>
                      {index === currentMCQIndex &&
                <CardContent className="pt-6">
                          <h3 className="font-medium mb-4">{question.question}</h3>
                          
                          <RadioGroup
                    value={mcqAnswers[question.id]?.toString()}
                    onValueChange={(value) => handleMCQAnswer(question.id, parseInt(value))}
                    disabled={showResults}>

                            {question.options.map((option, optionIndex) =>
                    <div key={optionIndex} className="flex items-center space-x-2">
                                <RadioGroupItem
                        value={optionIndex.toString()}
                        id={`q${question.id}-${optionIndex}`} />

                                <Label
                        htmlFor={`q${question.id}-${optionIndex}`}
                        className={`flex-1 ${
                        showResults && optionIndex === question.correctAnswer ?
                        "text-green-600 font-medium" :
                        showResults && mcqAnswers[question.id] === optionIndex && optionIndex !== question.correctAnswer ?
                        "text-red-600" :
                        ""}`
                        }>

                                  {option}
                                  {showResults && optionIndex === question.correctAnswer &&
                        <CheckCircle className="h-4 w-4 text-green-600 ml-2 inline" />
                        }
                                  {showResults && mcqAnswers[question.id] === optionIndex && optionIndex !== question.correctAnswer &&
                        <XCircle className="h-4 w-4 text-red-600 ml-2 inline" />
                        }
                                </Label>
                              </div>
                    )}
                          </RadioGroup>
                          
                          {showResults &&
                  <div className="mt-4 p-3 bg-blue-50 rounded">
                              <p className="text-sm text-blue-800">
                                <strong>Explanation:</strong> {question.explanation}
                              </p>
                            </div>
                  }
                        </CardContent>
                }
                    </Card>
              )}
                  
                  <div className="flex items-center justify-between">
                    <Button
                  variant="outline"
                  onClick={() => setCurrentMCQIndex(Math.max(0, currentMCQIndex - 1))}
                  disabled={currentMCQIndex === 0}>

                      Previous
                    </Button>
                    
                    {currentMCQIndex === mcqQuestions.length - 1 ?
                <div className="flex gap-2">
                        {!showResults ?
                  <Button onClick={calculateScore}>
                            Submit Quiz
                          </Button> :

                  <Button onClick={resetQuiz} variant="outline">
                            Retake Quiz
                          </Button>
                  }
                      </div> :

                <Button
                  onClick={() => setCurrentMCQIndex(Math.min(mcqQuestions.length - 1, currentMCQIndex + 1))}>

                        Next
                      </Button>
                }
                  </div>
                </>
            }
            </TabsContent>
            
            <TabsContent value="theory" className="space-y-4">
              {theoryQuestions.map((question) =>
            <Card key={question.id}>
                  <CardContent className="pt-6">
                    <h3 className="font-medium mb-4">{question.question}</h3>
                    
                    <Textarea
                  placeholder="Enter your answer here..."
                  value={theoryAnswers[question.id] || ''}
                  onChange={(e) => handleTheoryAnswer(question.id, e.target.value)}
                  className="mb-4"
                  rows={4} />

                    
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium">Key Points to Consider:</h4>
                      <ul className="text-sm text-gray-600 space-y-1">
                        {question.keyPoints.map((point, index) =>
                    <li key={index} className="flex items-start gap-2">
                            <span className="text-blue-500 mt-1">•</span>
                            {point}
                          </li>
                    )}
                      </ul>
                    </div>
                    
                    <details className="mt-4">
                      <summary className="cursor-pointer text-sm font-medium text-blue-600">
                        View Suggested Answer
                      </summary>
                      <div className="mt-2 p-3 bg-green-50 rounded text-sm">
                        {question.suggestedAnswer}
                      </div>
                    </details>
                  </CardContent>
                </Card>
            )}
            </TabsContent>
          </Tabs>
        }
      </CardContent>
    </Card>);

};

export default QuizGenerator;