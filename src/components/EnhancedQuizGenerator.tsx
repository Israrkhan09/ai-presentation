import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  Brain, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Target, 
  BookOpen,
  FileText,
  Download,
  RefreshCw,
  Lightbulb
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface QuizQuestion {
  id: number;
  question_number: number;
  question_text: string;
  question_type: string;
  options: string[];
  correct_answer: string;
  explanation: string;
  points: number;
  keywords: string[];
}

interface Quiz {
  id: number;
  quiz_title: string;
  quiz_type: string;
  difficulty_level: string;
  total_questions: number;
  estimated_time: number;
  topics_covered: string[];
  questions: QuizQuestion[];
}

interface EnhancedQuizGeneratorProps {
  sessionId: number | null;
  transcriptionData: any[];
  keywords: string[];
  onQuizGenerated?: (quiz: Quiz) => void;
}

const EnhancedQuizGenerator: React.FC<EnhancedQuizGeneratorProps> = ({
  sessionId,
  transcriptionData,
  keywords,
  onQuizGenerated
}) => {
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedQuizzes, setGeneratedQuizzes] = useState<Quiz[]>([]);
  const [activeQuiz, setActiveQuiz] = useState<Quiz | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});
  const [quizResults, setQuizResults] = useState<any>(null);
  const [isQuizMode, setIsQuizMode] = useState(false);
  const [quizStartTime, setQuizStartTime] = useState<Date | null>(null);

  // Load existing quizzes for the session
  useEffect(() => {
    if (sessionId) {
      loadQuizzes();
    }
  }, [sessionId]);

  const loadQuizzes = async () => {
    try {
      const { data, error } = await window.ezsite.apis.tablePage('16753', {
        PageNo: 1,
        PageSize: 10,
        Filters: [
          { name: 'session_id', op: 'Equal', value: sessionId }
        ]
      });

      if (error) throw error;

      if (data?.List) {
        const quizzesWithQuestions = await Promise.all(
          data.List.map(async (quiz: any) => {
            const questionsResponse = await window.ezsite.apis.tablePage('16754', {
              PageNo: 1,
              PageSize: 50,
              Filters: [
                { name: 'quiz_id', op: 'Equal', value: quiz.ID }
              ],
              OrderByField: 'question_number',
              IsAsc: true
            });

            const questions = questionsResponse.data?.List || [];
            
            return {
              ...quiz,
              id: quiz.ID,
              topics_covered: JSON.parse(quiz.topics_covered || '[]'),
              questions: questions.map((q: any) => ({
                ...q,
                id: q.ID,
                options: JSON.parse(q.options || '[]'),
                keywords: JSON.parse(q.keywords || '[]')
              }))
            };
          })
        );

        setGeneratedQuizzes(quizzesWithQuestions);
      }
    } catch (error) {
      console.error('Error loading quizzes:', error);
    }
  };

  const generateMCQQuiz = async () => {
    if (!sessionId || keywords.length === 0) {
      toast({
        title: "Cannot Generate Quiz",
        description: "Need active session and keywords from presentation.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    
    try {
      // Create quiz record
      const { data: quizId, error: quizError } = await window.ezsite.apis.tableCreate('16753', {
        session_id: sessionId,
        quiz_title: `MCQ Quiz - ${new Date().toLocaleDateString()}`,
        quiz_type: 'MCQ',
        difficulty_level: 'Medium',
        total_questions: Math.min(keywords.length, 10),
        estimated_time: Math.min(keywords.length * 2, 20),
        topics_covered: JSON.stringify(keywords.slice(0, 10)),
        auto_generated: true
      });

      if (quizError) throw quizError;

      // Generate MCQ questions
      const questions = await generateMCQQuestions(keywords.slice(0, 10));
      
      for (let i = 0; i < questions.length; i++) {
        const question = questions[i];
        await window.ezsite.apis.tableCreate('16754', {
          quiz_id: quizId,
          question_number: i + 1,
          question_text: question.text,
          question_type: 'MCQ',
          options: JSON.stringify(question.options),
          correct_answer: question.correct,
          explanation: question.explanation,
          points: 1,
          keywords: JSON.stringify([question.keyword])
        });
      }

      toast({
        title: "MCQ Quiz Generated",
        description: `Created ${questions.length} multiple choice questions.`,
      });

      await loadQuizzes();
    } catch (error) {
      console.error('Error generating MCQ quiz:', error);
      toast({
        title: "Generation Failed",
        description: "Failed to generate MCQ quiz.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const generateTheoryQuiz = async () => {
    if (!sessionId || keywords.length === 0) {
      toast({
        title: "Cannot Generate Quiz",
        description: "Need active session and keywords from presentation.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    
    try {
      // Create quiz record
      const { data: quizId, error: quizError } = await window.ezsite.apis.tableCreate('16753', {
        session_id: sessionId,
        quiz_title: `Theory Quiz - ${new Date().toLocaleDateString()}`,
        quiz_type: 'Theory',
        difficulty_level: 'Hard',
        total_questions: Math.min(keywords.length, 5),
        estimated_time: Math.min(keywords.length * 5, 30),
        topics_covered: JSON.stringify(keywords.slice(0, 5)),
        auto_generated: true
      });

      if (quizError) throw quizError;

      // Generate theory questions
      const questions = await generateTheoryQuestions(keywords.slice(0, 5));
      
      for (let i = 0; i < questions.length; i++) {
        const question = questions[i];
        await window.ezsite.apis.tableCreate('16754', {
          quiz_id: quizId,
          question_number: i + 1,
          question_text: question.text,
          question_type: 'Essay',
          options: JSON.stringify([]),
          correct_answer: question.sampleAnswer,
          explanation: question.explanation,
          points: 5,
          keywords: JSON.stringify([question.keyword])
        });
      }

      toast({
        title: "Theory Quiz Generated",
        description: `Created ${questions.length} essay questions.`,
      });

      await loadQuizzes();
    } catch (error) {
      console.error('Error generating theory quiz:', error);
      toast({
        title: "Generation Failed",
        description: "Failed to generate theory quiz.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const generateMCQQuestions = async (keywords: string[]) => {
    return keywords.map((keyword, index) => {
      const questionTypes = [
        `What is the primary significance of "${keyword}" in the context of this presentation?`,
        `Which statement best describes the role of "${keyword}"?`,
        `How does "${keyword}" relate to the main topic discussed?`,
        `What is the most important aspect of "${keyword}" mentioned?`
      ];

      const questionText = questionTypes[index % questionTypes.length];
      
      const correctOption = `${keyword} is a key concept that plays a central role in understanding the topic`;
      const incorrectOptions = [
        `${keyword} is only mentioned as a minor detail`,
        `${keyword} is not directly relevant to the main discussion`,
        `${keyword} represents an outdated perspective on the topic`
      ];

      // Shuffle options
      const allOptions = [correctOption, ...incorrectOptions];
      const shuffledOptions = allOptions.sort(() => Math.random() - 0.5);

      return {
        text: questionText,
        options: shuffledOptions,
        correct: correctOption,
        explanation: `Based on the presentation content, "${keyword}" was identified as a significant concept that contributes to the overall understanding of the topic.`,
        keyword
      };
    });
  };

  const generateTheoryQuestions = async (keywords: string[]) => {
    return keywords.map((keyword, index) => {
      const questionTypes = [
        `Explain the importance of "${keyword}" and its implications in detail.`,
        `Analyze the role of "${keyword}" and provide examples of its application.`,
        `Discuss the significance of "${keyword}" and how it relates to the broader context.`,
        `Evaluate the impact of "${keyword}" and explain its relevance to the field.`
      ];

      const questionText = questionTypes[index % questionTypes.length];
      
      return {
        text: questionText,
        sampleAnswer: `A comprehensive answer should explain the key aspects of "${keyword}", its significance in the context discussed, and provide relevant examples or applications. Students should demonstrate understanding of how this concept relates to the broader topic and its practical implications.`,
        explanation: `This question tests the student's deep understanding of "${keyword}" and their ability to articulate its importance and applications.`,
        keyword
      };
    });
  };

  const startQuiz = (quiz: Quiz) => {
    setActiveQuiz(quiz);
    setCurrentQuestionIndex(0);
    setUserAnswers({});
    setQuizResults(null);
    setIsQuizMode(true);
    setQuizStartTime(new Date());
  };

  const handleAnswerChange = (questionId: number, answer: string) => {
    setUserAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const nextQuestion = () => {
    if (activeQuiz && currentQuestionIndex < activeQuiz.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const previousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const submitQuiz = () => {
    if (!activeQuiz || !quizStartTime) return;

    const endTime = new Date();
    const timeTaken = Math.round((endTime.getTime() - quizStartTime.getTime()) / 1000 / 60); // minutes

    let correctAnswers = 0;
    let totalPoints = 0;
    let earnedPoints = 0;

    const results = activeQuiz.questions.map(question => {
      const userAnswer = userAnswers[question.id];
      const isCorrect = userAnswer === question.correct_answer;
      
      if (isCorrect) {
        correctAnswers++;
        earnedPoints += question.points;
      }
      
      totalPoints += question.points;

      return {
        question: question.question_text,
        userAnswer,
        correctAnswer: question.correct_answer,
        isCorrect,
        explanation: question.explanation,
        points: isCorrect ? question.points : 0
      };
    });

    const score = Math.round((earnedPoints / totalPoints) * 100);

    setQuizResults({
      score,
      correctAnswers,
      totalQuestions: activeQuiz.questions.length,
      timeTaken,
      results,
      earnedPoints,
      totalPoints
    });

    setIsQuizMode(false);
  };

  const resetQuiz = () => {
    setActiveQuiz(null);
    setCurrentQuestionIndex(0);
    setUserAnswers({});
    setQuizResults(null);
    setIsQuizMode(false);
    setQuizStartTime(null);
  };

  const exportQuizResults = () => {
    if (!quizResults || !activeQuiz) return;

    const content = {
      quiz: activeQuiz.quiz_title,
      score: quizResults.score,
      timeTaken: quizResults.timeTaken,
      results: quizResults.results
    };

    const blob = new Blob([JSON.stringify(content, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `quiz-results-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const currentQuestion = activeQuiz?.questions[currentQuestionIndex];

  if (isQuizMode && activeQuiz) {
    return (
      <div className="w-full max-w-4xl mx-auto space-y-6">
        {/* Quiz Header */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>{activeQuiz.quiz_title}</span>
              <Badge variant="outline">
                Question {currentQuestionIndex + 1} of {activeQuiz.questions.length}
              </Badge>
            </CardTitle>
            <Progress 
              value={((currentQuestionIndex + 1) / activeQuiz.questions.length) * 100} 
              className="w-full"
            />
          </CardHeader>
        </Card>

        {/* Current Question */}
        {currentQuestion && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Question {currentQuestion.question_number}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-lg">{currentQuestion.question_text}</p>

              {currentQuestion.question_type === 'MCQ' && (
                <RadioGroup
                  value={userAnswers[currentQuestion.id] || ''}
                  onValueChange={(value) => handleAnswerChange(currentQuestion.id, value)}
                >
                  {currentQuestion.options.map((option, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <RadioGroupItem value={option} id={`option-${index}`} />
                      <Label htmlFor={`option-${index}`} className="text-base cursor-pointer">
                        {option}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              )}

              {currentQuestion.question_type === 'Essay' && (
                <Textarea
                  placeholder="Type your answer here..."
                  value={userAnswers[currentQuestion.id] || ''}
                  onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                  rows={6}
                />
              )}

              <div className="flex justify-between">
                <Button
                  onClick={previousQuestion}
                  disabled={currentQuestionIndex === 0}
                  variant="outline"
                >
                  Previous
                </Button>

                {currentQuestionIndex === activeQuiz.questions.length - 1 ? (
                  <Button
                    onClick={submitQuiz}
                    disabled={!userAnswers[currentQuestion.id]}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    Submit Quiz
                  </Button>
                ) : (
                  <Button
                    onClick={nextQuestion}
                    disabled={!userAnswers[currentQuestion.id]}
                  >
                    Next
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  if (quizResults && activeQuiz) {
    return (
      <div className="w-full max-w-4xl mx-auto space-y-6">
        {/* Results Header */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              Quiz Completed: {activeQuiz.quiz_title}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">{quizResults.score}%</div>
                <p className="text-sm text-gray-600">Score</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold">{quizResults.correctAnswers}</div>
                <p className="text-sm text-gray-600">Correct</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold">{quizResults.timeTaken}</div>
                <p className="text-sm text-gray-600">Minutes</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold">{quizResults.earnedPoints}/{quizResults.totalPoints}</div>
                <p className="text-sm text-gray-600">Points</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Detailed Results */}
        <Card>
          <CardHeader>
            <CardTitle>Detailed Results</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-96">
              <div className="space-y-4">
                {quizResults.results.map((result: any, index: number) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      {result.isCorrect ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-500" />
                      )}
                      <span className="font-medium">Question {index + 1}</span>
                      <Badge variant={result.isCorrect ? "default" : "destructive"}>
                        {result.points} points
                      </Badge>
                    </div>
                    
                    <p className="mb-2">{result.question}</p>
                    
                    <div className="text-sm space-y-1">
                      <p><strong>Your Answer:</strong> {result.userAnswer || 'No answer provided'}</p>
                      <p><strong>Correct Answer:</strong> {result.correctAnswer}</p>
                      <p className="text-gray-600">{result.explanation}</p>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex gap-4">
          <Button onClick={resetQuiz} variant="outline">
            Take Another Quiz
          </Button>
          <Button onClick={exportQuizResults} className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Export Results
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      {/* Quiz Generation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            Enhanced Quiz Generator
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button
                onClick={generateMCQQuiz}
                disabled={isGenerating || !sessionId || keywords.length === 0}
                className="flex items-center gap-2 h-20"
              >
                {isGenerating ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <CheckCircle className="h-4 w-4" />
                )}
                <div className="text-left">
                  <div className="font-medium">Generate MCQ Quiz</div>
                  <div className="text-xs opacity-80">Multiple choice questions</div>
                </div>
              </Button>

              <Button
                onClick={generateTheoryQuiz}
                disabled={isGenerating || !sessionId || keywords.length === 0}
                variant="outline"
                className="flex items-center gap-2 h-20"
              >
                {isGenerating ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <FileText className="h-4 w-4" />
                )}
                <div className="text-left">
                  <div className="font-medium">Generate Theory Quiz</div>
                  <div className="text-xs opacity-80">Essay-based questions</div>
                </div>
              </Button>
            </div>

            {keywords.length > 0 && (
              <div>
                <p className="text-sm font-medium mb-2">Available Keywords ({keywords.length}):</p>
                <div className="flex flex-wrap gap-2">
                  {keywords.slice(0, 10).map((keyword, index) => (
                    <Badge key={index} variant="secondary">
                      {keyword}
                    </Badge>
                  ))}
                  {keywords.length > 10 && (
                    <Badge variant="outline">+{keywords.length - 10} more</Badge>
                  )}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Generated Quizzes */}
      {generatedQuizzes.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Generated Quizzes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {generatedQuizzes.map((quiz) => (
                <div key={quiz.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium">{quiz.quiz_title}</h3>
                    <div className="flex items-center gap-2">
                      <Badge variant={quiz.quiz_type === 'MCQ' ? 'default' : 'secondary'}>
                        {quiz.quiz_type}
                      </Badge>
                      <Badge variant="outline">
                        {quiz.difficulty_level}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                    <div className="flex items-center gap-1">
                      <BookOpen className="h-4 w-4" />
                      {quiz.total_questions} questions
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      ~{quiz.estimated_time} min
                    </div>
                  </div>
                  
                  <div className="mb-3">
                    <p className="text-sm font-medium mb-1">Topics Covered:</p>
                    <div className="flex flex-wrap gap-1">
                      {quiz.topics_covered.slice(0, 5).map((topic: string, index: number) => (
                        <Badge key={index} variant="outline" size="sm">
                          {topic}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <Button 
                    onClick={() => startQuiz(quiz)}
                    className="w-full"
                  >
                    Start Quiz
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {generatedQuizzes.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <Lightbulb className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500">
              No quizzes generated yet. Start a presentation session to create quizzes based on your content.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default EnhancedQuizGenerator;
