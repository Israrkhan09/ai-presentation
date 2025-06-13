import { create } from 'zustand';

interface Presentation {
  id: string;
  title: string;
  fileName: string;
  fileUrl: string;
  totalPages: number;
  createdAt: Date;
  lastPresented?: Date;
  summary?: string;
  quiz?: QuizQuestion[];
}

interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
}

interface PresentationStore {
  presentations: Presentation[];
  currentPresentation: Presentation | null;
  currentPage: number;
  isPresenting: boolean;
  isVoiceControlEnabled: boolean;
  voiceCommands: string[];
  
  addPresentation: (presentation: Omit<Presentation, 'id' | 'createdAt'>) => void;
  setCurrentPresentation: (presentation: Presentation) => void;
  setCurrentPage: (page: number) => void;
  startPresentation: () => void;
  endPresentation: () => void;
  toggleVoiceControl: () => void;
  addVoiceCommand: (command: string) => void;
  generateSummary: (presentationId: string) => Promise<void>;
  generateQuiz: (presentationId: string) => Promise<void>;
}

export const usePresentationStore = create<PresentationStore>((set, get) => ({
  presentations: [],
  currentPresentation: null,
  currentPage: 1,
  isPresenting: false,
  isVoiceControlEnabled: false,
  voiceCommands: [],
  
  addPresentation: (presentation) => {
    const newPresentation: Presentation = {
      ...presentation,
      id: Date.now().toString(),
      createdAt: new Date(),
    };
    set(state => ({
      presentations: [...state.presentations, newPresentation]
    }));
  },
  
  setCurrentPresentation: (presentation) => {
    set({ currentPresentation: presentation, currentPage: 1 });
  },
  
  setCurrentPage: (page) => {
    set({ currentPage: page });
  },
  
  startPresentation: () => {
    set({ isPresenting: true });
  },
  
  endPresentation: () => {
    set({ isPresenting: false, isVoiceControlEnabled: false });
    const current = get().currentPresentation;
    if (current) {
      set(state => ({
        presentations: state.presentations.map(p =>
          p.id === current.id ? { ...p, lastPresented: new Date() } : p
        )
      }));
    }
  },
  
  toggleVoiceControl: () => {
    set(state => ({ isVoiceControlEnabled: !state.isVoiceControlEnabled }));
  },
  
  addVoiceCommand: (command) => {
    set(state => ({
      voiceCommands: [...state.voiceCommands.slice(-9), command]
    }));
  },
  
  generateSummary: async (presentationId: string) => {
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const mockSummary = `This presentation covered key concepts including data analysis, market trends, and strategic recommendations. The main points discussed were: 1) Current market positioning and competitive landscape, 2) Analysis of customer behavior patterns, 3) Strategic initiatives for growth, and 4) Implementation timeline and success metrics.`;
    
    set(state => ({
      presentations: state.presentations.map(p =>
        p.id === presentationId ? { ...p, summary: mockSummary } : p
      )
    }));
  },
  
  generateQuiz: async (presentationId: string) => {
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const mockQuiz: QuizQuestion[] = [
      {
        id: '1',
        question: 'What was the primary focus of the market analysis?',
        options: ['Customer retention', 'Competitive positioning', 'Product development', 'Financial planning'],
        correctAnswer: 1
      },
      {
        id: '2',
        question: 'Which metric was identified as the key success indicator?',
        options: ['Revenue growth', 'Customer satisfaction', 'Market share', 'All of the above'],
        correctAnswer: 3
      },
      {
        id: '3',
        question: 'What is the recommended implementation timeline?',
        options: ['3 months', '6 months', '9 months', '12 months'],
        correctAnswer: 1
      }
    ];
    
    set(state => ({
      presentations: state.presentations.map(p =>
        p.id === presentationId ? { ...p, quiz: mockQuiz } : p
      )
    }));
  },
}));