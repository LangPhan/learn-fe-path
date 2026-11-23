export type Locale = 'vi' | 'en';
export type Theme = 'dark' | 'light';

export interface BilingualText {
  vi: string;
  en: string;
}

export type CategoryId =
  | 'architecture'
  | 'state-management'
  | 'backend-apis'
  | 'realtime-updates'
  | 'component-apis'
  | 'networking'
  | 'performance'
  | 'images'
  | 'accessibility'
  | 'seo'
  | 'user-experience'
  | 'security'
  | 'i18n'
  | 'common-patterns';

export type VisualizerId =
  | 'rendering-strategy'
  | 'flux-normalized'
  | 'pagination-api'
  | 'realtime-protocols'
  | 'component-composition'
  | 'retry-backoff'
  | 'race-conditions'
  | 'debounce-throttle'
  | 'virtual-list'
  | 'core-web-vitals'
  | 'responsive-images'
  | 'a11y-lab'
  | 'seo-preview'
  | 'ui-states'
  | 'security-sandbox'
  | 'i18n-playground'
  | 'undo-redo-events';

export type SandboxMode = 'js' | 'ts' | 'react' | 'html';
export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced';
export type ChallengeDifficulty = 'easy' | 'medium' | 'hard';
export type MasteryStatus = 'not_started' | 'in_progress' | 'mastered';

export interface CategoryMeta {
  id: CategoryId;
  column: 1 | 2 | 3;
  order: number;
  color: string;
  badgeTextColor: string;
  title: BilingualText;
  description: BilingualText;
  iconName: string;
}

export interface TopicMeta {
  id: string;
  categoryId: CategoryId;
  shortTitle: string;
  title: BilingualText;
  difficulty: DifficultyLevel;
  summary: BilingualText;
  tags: string[];
  visualizerId?: VisualizerId;
  hasChallenge: boolean;
  sandboxMode: SandboxMode;
}

export interface TopicExample {
  title: BilingualText;
  description: BilingualText;
  mode: SandboxMode;
  code: string;
  css?: string;
  tryItPrompt: BilingualText;
}

export interface CodingChallenge {
  id: string;
  topicId: string;
  categoryId: CategoryId;
  title: BilingualText;
  difficulty: ChallengeDifficulty;
  prompt: BilingualText;
  starterCode: string;
  solutionCode: string;
  testCode: string;
  hints: BilingualText[];
}

export interface QuizQuestion {
  id: string;
  topicId: string;
  categoryId: CategoryId;
  question: BilingualText;
  options: BilingualText[];
  correctIndex: number;
  explanation: BilingualText;
}

export interface TopicContent extends TopicMeta {
  mentalModel: BilingualText;
  keyPoints: BilingualText[];
  tradeoffs: {
    whenToUse: BilingualText[];
    whenToAvoid: BilingualText[];
  };
  pitfalls: BilingualText[];
  interviewTips: BilingualText[];
  example: TopicExample;
  challenge?: CodingChallenge;
  quiz: QuizQuestion[];
  relatedTopicIds: string[];
}

export interface RadioStepItem {
  heading: BilingualText;
  bullets: BilingualText[];
}

export interface ScenarioDecisionOption {
  label: BilingualText;
  isOptimal: boolean;
  tradeoff: BilingualText;
}

export interface ScenarioDecision {
  id: string;
  prompt: BilingualText;
  options: ScenarioDecisionOption[];
}

export interface SystemDesignScenario {
  id: string;
  title: BilingualText;
  subtitle: BilingualText;
  difficulty: ChallengeDifficulty;
  iconName: string;
  relatedTopicIds: string[];
  radio: {
    requirements: RadioStepItem;
    architecture: RadioStepItem;
    dataModel: RadioStepItem;
    interfaceApi: RadioStepItem;
    optimizations: RadioStepItem;
  };
  decisions: ScenarioDecision[];
}

export interface QuizAttempt {
  selectedIndex: number;
  isCorrect: boolean;
  answeredAt: number;
}

export interface UserProgress {
  topicStatus: Record<string, MasteryStatus>;
  solvedChallenges: string[];
  quizAnswers: Record<string, QuizAttempt>;
  bookmarks: string[];
  notes: Record<string, string>;
  lastVisitedTopicId?: string;
  updatedAt: number;
}

export interface TestCaseResult {
  name: string;
  passed: boolean;
  error?: string;
  durationMs: number;
}

export interface SandboxLogEntry {
  id: string;
  level: 'log' | 'info' | 'warn' | 'error' | 'table';
  args: string[];
  timestamp: number;
}
