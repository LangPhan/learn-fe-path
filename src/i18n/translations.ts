import type { BilingualText, Locale } from '@/types/curriculum';

export function t(text: BilingualText, locale: Locale): string {
  return locale === 'vi' ? text.vi : text.en;
}

export const UI_STRINGS = {
  brand: {
    name: 'FE System Design',
    tagline: {
      vi: 'Nền tảng học & thực hành thiết kế hệ thống Front End với sandbox chạy trực tiếp',
      en: 'Front End System Design reference, interactive labs, and live offline sandbox',
    },
  },
  nav: {
    cheatsheet: { vi: 'Bản đồ kỹ năng', en: 'Cheatsheet' },
    challenges: { vi: 'Thử thách code', en: 'Challenges' },
    scenarios: { vi: 'Thiết kế RADIO', en: 'System Design' },
    quiz: { vi: 'Quiz Arena', en: 'Quiz Arena' },
    searchShortcut: { vi: 'Tìm kỹ năng...', en: 'Search skills...' },
  },
  home: {
    heading: {
      vi: 'Front End System Design — 86 kỹ năng cốt lõi',
      en: 'Front End System Design — 86 Core Skills',
    },
    subheading: {
      vi: '14 nhóm kiến thức từ ảnh hệ thống chuẩn phỏng vấn: lý thuyết súc tích, 17 mô phỏng trực quan, 37 bài test code tự động và sandbox chạy offline.',
      en: '14 core categories from the interview cheatsheet: concise theory, 17 interactive labs, 37 unit-tested coding challenges, and an offline code sandbox.',
    },
    masteredLabel: { vi: 'Đã thành thạo', en: 'Mastered' },
    inProgressLabel: { vi: 'Đang học', en: 'In progress' },
    challengesLabel: { vi: 'Bài code đã giải', en: 'Challenges solved' },
    quizAccuracyLabel: { vi: 'Độ chính xác Quiz', en: 'Quiz accuracy' },
    continueLearning: { vi: 'Học tiếp bài gần nhất', en: 'Resume last topic' },
    startFirst: { vi: 'Bắt đầu từ Architecture', en: 'Start with Architecture' },
    filters: {
      all: { vi: 'Tất cả (86)', en: 'All (86)' },
      notStarted: { vi: 'Chưa học', en: 'Not started' },
      inProgress: { vi: 'Đang học', en: 'In progress' },
      mastered: { vi: 'Thành thạo', en: 'Mastered' },
      hasLab: { vi: 'Có Lab trực quan', en: 'Has Lab' },
      hasChallenge: { vi: 'Có bài Code Test', en: 'Has Challenge' },
      bookmarked: { vi: 'Đã lưu', en: 'Bookmarked' },
    },
    exportProgress: { vi: 'Xuất tiến độ', en: 'Export JSON' },
    importProgress: { vi: 'Nhập tiến độ', en: 'Import JSON' },
    resetProgress: { vi: 'Đặt lại tiến độ', en: 'Reset progress' },
    resetConfirm: {
      vi: 'Bạn chắc chắn muốn xóa toàn bộ tiến độ, quiz và ghi chú đã lưu?',
      en: 'Reset all saved mastery status, challenge completions, quiz history, and notes?',
    },
    labBadge: { vi: 'Lab', en: 'Lab' },
    codeBadge: { vi: 'Code', en: 'Code' },
    noFilterMatch: {
      vi: 'Không có kỹ năng nào khớp bộ lọc hiện tại.',
      en: 'No skills match the active filter.',
    },
  },
  topic: {
    allTopics: { vi: 'Danh mục 86 kỹ năng', en: 'All 86 skills' },
    tabs: {
      learn: { vi: 'Lý thuyết', en: 'Learn' },
      lab: { vi: 'Mô phỏng Lab', en: 'Interactive Lab' },
      practice: { vi: 'Quiz & Thực hành', en: 'Quiz & Practice' },
      notes: { vi: 'Ghi chú', en: 'Notes' },
      code: { vi: 'Code trực tiếp', en: 'Live Code' },
    },
    status: {
      not_started: { vi: 'Chưa học', en: 'Not started' },
      in_progress: { vi: 'Đang học', en: 'In progress' },
      mastered: { vi: 'Thành thạo', en: 'Mastered' },
    },
    sections: {
      mentalModel: { vi: 'Mô hình tư duy (Mental Model)', en: 'Mental Model' },
      keyPoints: { vi: 'Điểm cốt lõi cần nắm', en: 'Key Mechanics' },
      whenToUse: { vi: 'Khi nào nên dùng', en: 'When to use' },
      whenToAvoid: { vi: 'Khi nào cần tránh', en: 'When to avoid' },
      pitfalls: { vi: 'Lỗi thường gặp trong Production', en: 'Common Production Pitfalls' },
      interviewTips: { vi: 'Ghi điểm khi phỏng vấn System Design', en: 'Interview Talking Points' },
      relatedTopics: { vi: 'Kỹ năng liên quan', en: 'Related Skills' },
      topicChallengeCta: {
        vi: 'Mở Coding Challenge có Unit Test ở khung bên phải',
        en: 'Open the Unit-Tested Coding Challenge on the right',
      },
    },
    notesPlaceholder: {
      vi: 'Ghi lại tóm tắt cá nhân, trade-off hoặc câu hỏi phỏng vấn cho kỹ năng này (tự động lưu)...',
      en: 'Write personal takeaways, trade-offs, or interview notes for this skill (auto-saved)...',
    },
    notesSaved: { vi: 'Đã lưu tự động vào LocalStorage', en: 'Auto-saved to LocalStorage' },
    prevTopic: { vi: 'Bài trước', en: 'Previous' },
    nextTopic: { vi: 'Bài tiếp', en: 'Next' },
    bookmarkAdd: { vi: 'Lưu bài học', en: 'Bookmark skill' },
    bookmarkRemove: { vi: 'Bỏ lưu', en: 'Remove bookmark' },
  },
  playground: {
    exampleMode: { vi: 'Ví dụ chạy trực tiếp', en: 'Live Example' },
    challengeMode: { vi: 'Bài tập Coding Test', en: 'Coding Challenge' },
    runCode: { vi: 'Chạy code', en: 'Run code' },
    runTests: { vi: 'Chạy Unit Tests', en: 'Run Unit Tests' },
    resetCode: { vi: 'Khôi phục gốc', en: 'Reset' },
    copyCode: { vi: 'Sao chép', en: 'Copy' },
    copied: { vi: 'Đã chép', en: 'Copied' },
    expand: { vi: 'Phóng to', en: 'Expand' },
    collapse: { vi: 'Thu gọn', en: 'Collapse' },
    previewTab: { vi: 'Preview', en: 'Preview' },
    consoleTab: { vi: 'Console', en: 'Console' },
    testsTab: { vi: 'Tests', en: 'Tests' },
    clearConsole: { vi: 'Xóa log', en: 'Clear' },
    tryItLabel: { vi: 'Thử chỉnh sửa nhanh:', en: 'Try this tweak:' },
    noConsoleLogs: {
      vi: 'Chưa có output từ console.log. Nhấn "Chạy code" hoặc Ctrl+Enter.',
      en: 'No console output yet. Press "Run code" or Ctrl+Enter.',
    },
    noTestsYet: {
      vi: 'Nhấn "Chạy Unit Tests" để chấm tự động bài làm của bạn.',
      en: 'Click "Run Unit Tests" to grade your implementation.',
    },
    hintsTitle: { vi: 'Gợi ý từng bước', en: 'Step-by-step Hints' },
    showSolution: { vi: 'Xem lời giải mẫu', en: 'Show Solution' },
    confirmSolutionTitle: {
      vi: 'Thay thế code hiện tại bằng lời giải mẫu?',
      en: 'Replace current editor code with the reference solution?',
    },
    confirmSolutionDesc: {
      vi: 'Code bạn đang gõ sẽ được thay bằng lời giải mẫu để bạn chạy test và đối chiếu.',
      en: 'Your current draft will be replaced by the reference solution so you can run tests and inspect it.',
    },
    cancel: { vi: 'Hủy', en: 'Cancel' },
    confirm: { vi: 'Xem lời giải', en: 'Load solution' },
    challengeSolvedToast: {
      vi: 'Hoàn thành xuất sắc! Tất cả unit tests đều đạt.',
      en: 'All unit tests passed. Challenge marked as solved.',
    },
    testsPassedSummary: { vi: 'đạt', en: 'passed' },
  },
  challenges: {
    heading: { vi: 'Coding Challenges với Unit Test tự động', en: 'Automated Coding Challenges' },
    subheading: {
      vi: 'Tự cài đặt các thuật toán & pattern thiết kế Front End cốt lõi, chạy test ngay trên trình duyệt không cần server.',
      en: 'Implement core Front End system design algorithms and patterns with instant in-browser unit testing.',
    },
    allCategories: { vi: 'Tất cả nhóm', en: 'All categories' },
    allDifficulties: { vi: 'Mọi độ khó', en: 'All difficulties' },
    solvedBadge: { vi: 'Đã giải', en: 'Solved' },
    unsolvedBadge: { vi: 'Chưa giải', en: 'Unsolved' },
    openChallenge: { vi: 'Mở IDE', en: 'Open IDE' },
    backToList: { vi: 'Danh sách bài tập', en: 'All challenges' },
    viewRelatedTopic: { vi: 'Xem bài lý thuyết gốc', en: 'Open source lesson' },
  },
  quiz: {
    heading: { vi: 'Quiz Arena — Luyện phản xạ phỏng vấn', en: 'Quiz Arena — System Design Drills' },
    subheading: {
      vi: 'Chọn nhóm kỹ năng hoặc lọc các bài chưa thành thạo để kiểm tra hiểu sâu trade-offs.',
      en: 'Filter by category or unmastered skills to drill real-world Front End architecture trade-offs.',
    },
    scopeAll: { vi: 'Tất cả 14 nhóm', en: 'All 14 categories' },
    scopeUnmastered: { vi: 'Chỉ bài chưa thành thạo', en: 'Unmastered topics only' },
    questionCount: { vi: 'Số câu hỏi', en: 'Question count' },
    startSession: { vi: 'Bắt đầu bài thi', en: 'Start quiz session' },
    nextQuestion: { vi: 'Câu tiếp theo', en: 'Next question' },
    finishQuiz: { vi: 'Xem kết quả', en: 'View results' },
    restartQuiz: { vi: 'Làm bài mới', en: 'Start new quiz' },
    correct: { vi: 'Chính xác', en: 'Correct' },
    incorrect: { vi: 'Chưa đúng', en: 'Incorrect' },
    scoreHeading: { vi: 'Kết quả phiên luyện tập', en: 'Session Results' },
    reviewWeakTopics: { vi: 'Các bài cần ôn thêm', en: 'Topics to review' },
    checkTopicQuiz: { vi: 'Kiểm tra hiểu biết kỹ năng này', en: 'Check your understanding' },
    resetTopicQuiz: { vi: 'Làm lại Quiz', en: 'Retake Quiz' },
  },
  scenarios: {
    heading: { vi: 'System Design Studio (Framework RADIO)', en: 'System Design Studio (RADIO Framework)' },
    subheading: {
      vi: 'Thực hành thiết kế 6 hệ thống thực tế theo chuẩn RADIO: Requirements, Architecture, Data Model, Interface/API, Optimizations.',
      en: 'Practice designing 6 production systems using the RADIO framework: Requirements, Architecture, Data Model, Interface/API, Optimizations.',
    },
    decisionsTitle: {
      vi: 'Bài tập quyết định kiến trúc (Interactive Decisions)',
      en: 'Interactive Architecture Decisions',
    },
    relatedSkillsTitle: {
      vi: 'Kỹ năng liên quan trong Cheatsheet',
      en: 'Related Cheatsheet Skills',
    },
    optimalChoice: { vi: 'Lựa chọn tối ưu', en: 'Optimal choice' },
    suboptimalChoice: { vi: 'Cần cân nhắc trade-off', en: 'Suboptimal trade-off' },
  },
  command: {
    placeholder: {
      vi: 'Tìm trong 86 kỹ năng, 17 labs, 37 challenges, 6 case study...',
      en: 'Search 86 skills, 17 labs, 37 challenges, 6 case studies...',
    },
    empty: { vi: 'Không tìm thấy kết quả phù hợp.', en: 'No matching results found.' },
    groups: {
      topics: { vi: 'Kỹ năng (Topics)', en: 'Skills (Topics)' },
      challenges: { vi: 'Bài tập Coding', en: 'Coding Challenges' },
      scenarios: { vi: 'System Design Case Studies', en: 'System Design Case Studies' },
    },
  },
  difficulty: {
    beginner: { vi: 'Cơ bản', en: 'Beginner' },
    intermediate: { vi: 'Trung bình', en: 'Intermediate' },
    advanced: { vi: 'Nâng cao', en: 'Advanced' },
    easy: { vi: 'Dễ', en: 'Easy' },
    medium: { vi: 'Trung bình', en: 'Medium' },
    hard: { vi: 'Khó', en: 'Hard' },
  },
} as const;
