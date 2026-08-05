export function parseTextToQuestions(text, defaultTopic = 'Uncategorized') {
  let baseTopic = defaultTopic;
  if (baseTopic.includes('.')) {
    baseTopic = baseTopic.split('.').slice(0, -1).join('.');
  }
  baseTopic = baseTopic.replace(/[_-]/g, ' ').trim();
  baseTopic = baseTopic.replace(/\b\w/g, c => c.toUpperCase());
  if (!baseTopic) baseTopic = 'Uncategorized';

  const questions = [];
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  
  // Smart inference based on content keywords
  const TOPIC_KEYWORDS = {
    'Python': /\b(python|def |import |tuple|dictionary|elif|__init__|len\(\)|type\(\))\b/gi,
    'React': /\b(react|usestate|useeffect|jsx|components?|virtual dom|hooks)\b/gi,
    'JavaScript': /\b(javascript|js|let |const |console\.log|promise|async)\b/gi,
    'Java': /\b(java|public static void|system\.out\.println|interface)\b/gi,
    'HTML': /\b(html|<div>|<span>|<body>|href|img src)\b/gi,
    'CSS': /\b(css|margin|padding|flexbox|grid|stylesheet)\b/gi,
    'SQL': /\b(sql|select |where |insert into|update |table|database)\b/gi,
  };

  let inferredContentTopic = null;
  let maxScore = 0;
  for (const [topic, regex] of Object.entries(TOPIC_KEYWORDS)) {
    const matches = text.match(regex);
    if (matches && matches.length > maxScore) {
      maxScore = matches.length;
      inferredContentTopic = topic;
    }
  }

  let currentTopic = baseTopic;
  
  // If baseTopic is Uncategorized but we inferred something strong from the content, use it!
  if (currentTopic === 'Uncategorized' && inferredContentTopic && maxScore >= 2) {
    currentTopic = inferredContentTopic;
  }

  // Attempt to extract title/topic from the first few lines
  for (let i = 0; i < Math.min(5, lines.length); i++) {
    const line = lines[i];
    if (line.match(/^(\d+\.|Q\d+:?)\s*(.*)/i) || /^Instructions?:/i.test(line)) break;
    
    if (line.length > 2 && line.length < 60 && !/^(Topic|Category|Subject):/i.test(line)) {
      let inferredTopic = line.replace(/\b(Assessment|Quiz|Test|Exam|Questions?)\b/ig, '').trim();
      if (inferredTopic) {
        // e.g. "Python Programming Assessment" -> "Python Programming"
        currentTopic = inferredTopic;
        break;
      }
    }
  }

  let currentQuestion = null;

  const pushCurrentQuestion = () => {
    if (currentQuestion && currentQuestion.question) {
      // Extract marks from the question text: e.g. "[5 Marks]" or "(10 marks)"
      const marksMatch = currentQuestion.question.match(/[\[\(]\s*(\d+)\s*Marks?[\]\)]/i);
      if (marksMatch) {
        currentQuestion.mark = parseInt(marksMatch[1], 10);
        // Remove the marks part from the question text
        currentQuestion.question = currentQuestion.question.replace(marksMatch[0], '').trim();
      }
      
      // Clean up any double spaces that might result from removal
      currentQuestion.question = currentQuestion.question.replace(/\s{2,}/g, ' ');
      
      questions.push(currentQuestion);
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Detect Topic changes
    const topicMatch = line.match(/^(?:Topic|Category|Subject):\s*(.*)/i);
    if (topicMatch) {
      currentTopic = topicMatch[1].trim();
      continue;
    }
    
    const qMatch = line.match(/^(\d+\.|Q\d+:?)\s*(.*)/i);
    const isQuestionWord = /^(what|how|why|explain|describe|when|where|which|list|discuss|define)/i.test(line);
    const endsWithQuestion = line.endsWith('?');
    
    // Treat as a new question if it's numbered, or if it looks like a standalone question
    const isNewQuestion = qMatch || (isQuestionWord && (endsWithQuestion || line.length > 15));

    if (isNewQuestion) {
      pushCurrentQuestion();
      
      let qText = line;
      if (qMatch && qMatch[2]) {
        qText = qMatch[2];
      }

      currentQuestion = {
        question: qText,
        options: [],
        correctAnswerIndex: 0,
        mark: 1,
        type: 'short_answer', // default to short answer, changed to mcq if options found
        topic: currentTopic,
        difficulty: 'medium'
      };
      continue;
    }

    if (!currentQuestion) {
       continue;
    }

    const optMatch = line.match(/^([A-D])[\.\)]\s*(.*)/i) || line.match(/^\(([A-D])\)\s*(.*)/i);
    if (optMatch) {
      currentQuestion.type = 'mcq';
      currentQuestion.options.push(optMatch[2].trim());
      continue;
    }

    const ansMatch = line.match(/^(?:Correct )?Answer:\s*([A-D])/i);
    if (ansMatch) {
      const char = ansMatch[1].toUpperCase();
      currentQuestion.correctAnswerIndex = char.charCodeAt(0) - 65;
      continue;
    }
    
    // Continuation of the question text
    if (currentQuestion.options.length === 0) {
      currentQuestion.question += ' ' + line;
    }
  }

  pushCurrentQuestion();

  return questions;
}
