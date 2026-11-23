import React, { useState, useMemo, useEffect } from 'react';
import { 
  Upload, FileText, CheckCircle2, AlertTriangle, Award, 
  RefreshCw, Edit3, ChevronDown, ChevronUp, Sparkles, BookOpen, 
  BarChart3, Printer, Info, Sliders, Search, Copy, Check,
  User, Hash, Settings, History, Trash2, Clock, MessageSquare, ShieldAlert, HelpCircle, Target
} from 'lucide-react';

declare global {
  interface Window {
    pdfjsLib?: any;
  }
}

const RUBRIC_CRITERIA = [
  {
    id: "abstract",
    category: "Abstract",
    maxCategoryMarks: 10,
    subCriteria: "Problem statement, Objective, Methodology, Future work",
    multiplier: 2,
    descriptors: {
      1: "Abstract is irrelevant and does not provide the summary of the whole project.",
      2: "Abstract is relevant but did not include some of the elements stated.",
      3: "Abstract is relevant, and include all elements, however, is vague and fail to highlight appropriate details about the research.",
      4: "Abstract is relevant, include all elements, and highlight appropriate details about the research.",
      5: "Abstract is relevant, clear and concise description of all elements, highlighting the importance of the research."
    }
  },
  {
    id: "intro_background",
    category: "Introduction",
    maxCategoryMarks: 5,
    subCriteria: "Background of study and problem statement",
    multiplier: 1,
    descriptors: {
      1: "Irrelevant background of study and problem statement.",
      2: "Background of study is partially relevant, and unclear problem statement.",
      3: "Background of study is sufficient to highlight the research work; however, problem statement is generic and unclear.",
      4: "Good background of study that shows connection to the problem statement. Problem statement is clearly presented.",
      5: "Well written, articulate and concise background of study that justifies the problem statement. Problem statement is clearly presented."
    }
  },
  {
    id: "intro_objectives",
    category: "Introduction",
    maxCategoryMarks: 5,
    subCriteria: "Objective and scope of study",
    multiplier: 1,
    descriptors: {
      1: "Research objectives are irrelevant to the problem statement; Scope of Study are irrelevant to research objectives.",
      2: "Research objectives are unclear and partially relevant to problem statement; Scope of Study are partially relevant to research objectives and poorly described.",
      3: "Research objectives are clear, however, partially relevant to problem statements; Scope of Study partially relevant to research objectives, and fairly described.",
      4: "Research objectives are clear and relevant to the problem statement; Scope of Study are relevant to research objectives and sufficiently described.",
      5: "Research objectives are clear and justified towards answering the problem statement; Scope of Study are relevant to research objective and clearly described, highlighting the limitation of the study."
    }
  },
  {
    id: "lit_critical",
    category: "Literature Review",
    maxCategoryMarks: 5,
    subCriteria: "Critical analysis, relevancy and recentness of literature",
    multiplier: 1,
    descriptors: {
      1: "Irrelevant literature review.",
      2: "Literature review explains previous study, without connecting it to the current study. Lack in critical analysis.",
      3: "Literature review explains previous study relevant to the current study, however, lack in critical analysis.",
      4: "Literature review provides good discussion on previous study relevant to the current study, and sufficiently highlights the problem statement.",
      5: "Literature review is comprehensive, critically analyse previous work relevant to current studies, with proper cross referencing. Clearly established the importance of the current work."
    }
  },
  {
    id: "lit_references",
    category: "Literature Review",
    maxCategoryMarks: 5,
    subCriteria: "Quality of references (journals / conferences / etc.)",
    multiplier: 1,
    descriptors: {
      1: "Insufficient references, none from published journal / conferences.",
      2: "Insufficient references, minimal number of references from published journal / conferences.",
      3: "Adequate references, some are relevant, and from published journal / conferences.",
      4: "Sufficient references, almost all are relevant, and almost all are from published journal / references.",
      5: "Sufficient references and all are relevant, and almost all from published journal / references."
    }
  },
  {
    id: "methodology",
    category: "Research Methodology",
    maxCategoryMarks: 5,
    subCriteria: "Research methodology clarity and feasibility",
    multiplier: 1,
    descriptors: {
      1: "Insufficient and poorly described methodology.",
      2: "Methodology is unsuitable to achieve the objectives.",
      3: "Methodology is partially relevant to achieving the objectives.",
      4: "Methodology is relevant to achieving objectives and fairly described and achievable within the time frame.",
      5: "Methodology is relevant to achieving the objectives and comprehensively described, and highly achievable within the time frame."
    }
  },
  {
    id: "results_discussion",
    category: "Result and Discussion",
    maxCategoryMarks: 40,
    subCriteria: "Validation of objectives, analysis quality & literature comparison",
    multiplier: 8,
    descriptors: {
      1: "All results do not meet the research / project objectives.",
      2: "Few results validate some of the project objectives; Analysis and discussion of the results are poor or inaccurate.",
      3: "Few, or most results validate some of the project objectives; Analysis and discussion of the results are correct.",
      4: "Results validate most of the research / project objectives; Analysis and presentation of results are correct but does not link to theory; Significance of results mentioned but deviation from literature is not properly discussed.",
      5: "Results validate most of the research / project objectives; Analysis and presentation of results are correct, critically analysed and linked to theory; Significance of results and its deviation from literature is sufficiently discussed."
    }
  },
  {
    id: "conclusion_recs",
    category: "Conclusion & Recommendation",
    maxCategoryMarks: 10,
    subCriteria: "Conclusion relevance and future work recommendations",
    multiplier: 2,
    descriptors: {
      1: "Insufficient conclusion and irrelevant with objective; No future work recommended.",
      2: "Insufficient conclusion and irrelevant with objective; Insufficient future work related to the research / project recommended.",
      3: "Most conclusions are relevant with objective, but some are not clearly written; Future work recommended is related to the research and briefly outlined.",
      4: "Provide good conclusion relevant to the objective; Future work recommended is related to the research and briefly described.",
      5: "Provide excellent conclusion that is comprehensive; Future work recommended is related to the research is well described."
    }
  },
  {
    id: "org_formatting",
    category: "Organisation and Clarity",
    maxCategoryMarks: 5,
    subCriteria: "Standard Guidelines and formatting",
    multiplier: 1,
    descriptors: {
      1: "Report does not follow the standard guidelines and formatting.",
      2: "Report that has frequent major mistakes with the standard guidelines and format.",
      3: "Report that has frequent minor mistakes with the standard guidelines and format.",
      4: "Report that has some mistakes with the standard guidelines and format.",
      5: "Report that complies with the standard guidelines and format."
    }
  },
  {
    id: "org_writing",
    category: "Organisation and Clarity",
    maxCategoryMarks: 5,
    subCriteria: "English usage and writing skills (clear, coherent & systematic)",
    multiplier: 1,
    descriptors: {
      1: "Very poor English and writing skills.",
      2: "Poor English and writing skills with many spellings and grammar mistake.",
      3: "Fair English and writing skills with noticeable spelling and grammar mistake.",
      4: "Good English and writing skills with minimal spelling or grammar mistake.",
      5: "Excellent English and writing skills with no spelling or grammar mistakes."
    }
  },
  {
    id: "org_citations",
    category: "Organisation and Clarity",
    maxCategoryMarks: 5,
    subCriteria: "Referencing and citations",
    multiplier: 1,
    descriptors: {
      1: "Most references are missing from reference list and did not follow style guide.",
      2: "Many references are missing from reference list and did not follow style guide.",
      3: "Some references are missing from reference list and / or most did not follow style guide.",
      4: "Most references are cited in the reference list, which follow the style guide.",
      5: "All references are cited in the reference list, which follow the style guide."
    }
  }
];

const CRITERION_EXTRA_CONSIDERATIONS: Record<string, string> = {
  methodology: `
ADDITIONAL EVALUATION REQUIREMENT (REALISM & PRACTICALITY):
- Verify whether the methodology is realistic, practical, and technically/logistically feasible to achieve the stated project objective and produce the reported results (consider tools, datasets/samples, equipment, experimental design, and timeframe).
- Flag any unrealistic assumptions, missing practical steps, or mismatches between the method and the objective/results, and factor this directly into your score and justification.`,
  results_discussion: `
ADDITIONAL EVALUATION REQUIREMENT (PLAUSIBILITY & METHODOLOGICAL CONSISTENCY):
- Cross-check the reported results against the methodology described in the thesis to assess whether the results are likely true, credible, and logically achievable using that methodology.
- Watch for implausible or overly convenient metrics, results that do not follow from the stated experimental/analytical setup, missing validation details, or contradictions with the methodology, and factor this directly into your score and justification.`
};

const buildCriterionPrompt = (criterion: (typeof RUBRIC_CRITERIA)[number], isRecompute = false) => {
  const extraConsideration = CRITERION_EXTRA_CONSIDERATIONS[criterion.id] || '';
  const actionVerb = isRecompute ? 're-evaluate' : 'evaluate strictly for';

  return `You are a strict academic evaluator. Read the full thesis document and ${actionVerb} this ONE specific rubric criterion:
Item ID: "${criterion.id}"
Category: "${criterion.category}"
Sub-criteria: "${criterion.subCriteria}"
Multiplier: x${criterion.multiplier} (Max category mark: ${criterion.maxCategoryMarks})

RUBRIC DESCRIPTORS SCALE (1 to 5):
1: ${criterion.descriptors[1]}
2: ${criterion.descriptors[2]}
3: ${criterion.descriptors[3]}
4: ${criterion.descriptors[4]}
5: ${criterion.descriptors[5]}${extraConsideration}

Return JSON with:
1. score: integer 1, 2, 3, 4, or 5.
2. justification: Clear, objective academic reasoning for this score based on the thesis content.
3. summaryExtract: Direct verbatim quotes or concise summarized excerpts from the thesis supporting this score.
4. improvementTip: Specific, actionable advice for the author.`;
};

const getSafeApiKey = (userEnteredKey) => {
  if (userEnteredKey && userEnteredKey.trim()) {
    return userEnteredKey.trim();
  }
  try {
    const proc = (globalThis as any).process;
    if (proc && proc.env && proc.env.GEMINI_API_KEY) {
      return proc.env.GEMINI_API_KEY;
    }
  } catch (e) {
    // Process is not defined in standard browser environment
  }
  return '';
};

const HISTORY_STORAGE_KEY = 'thesis_evaluator_history_v1';
const CONFIG_STORAGE_KEY = 'thesis_evaluator_ai_config_v1';
const MAX_HISTORY_ITEMS = 10;

const DEFAULT_AI_CONFIG = {
  aiProvider: 'gemini',
  geminiApiKey: '',
  geminiModel: 'gemini-3-flash-preview',
  openaiApiKey: '',
  openaiBaseUrl: 'https://api.openai.com/v1',
  openaiModel: 'gpt-4o'
};

const readStoredAiConfig = () => {
  try {
    const raw = window.localStorage.getItem(CONFIG_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') {
        return {
          ...DEFAULT_AI_CONFIG,
          aiProvider: parsed.aiProvider === 'openai' ? 'openai' : 'gemini',
          geminiApiKey: typeof parsed.geminiApiKey === 'string' ? parsed.geminiApiKey : '',
          geminiModel: typeof parsed.geminiModel === 'string' && parsed.geminiModel.trim() ? parsed.geminiModel : DEFAULT_AI_CONFIG.geminiModel,
          openaiApiKey: typeof parsed.openaiApiKey === 'string' ? parsed.openaiApiKey : '',
          openaiBaseUrl: typeof parsed.openaiBaseUrl === 'string' && parsed.openaiBaseUrl.trim() ? parsed.openaiBaseUrl : DEFAULT_AI_CONFIG.openaiBaseUrl,
          openaiModel: typeof parsed.openaiModel === 'string' && parsed.openaiModel.trim() ? parsed.openaiModel : DEFAULT_AI_CONFIG.openaiModel
        };
      }
    }
  } catch (e) {
    // localStorage may be restricted in sandboxed preview iframes
  }
  return { ...DEFAULT_AI_CONFIG };
};

const writeStoredAiConfig = (config) => {
  try {
    window.localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(config));
  } catch (e) {
    // Ignore storage errors if localStorage is unavailable
  }
};

// Resilient storage helper that survives page refreshes even in sandboxed iframes
const readStoredHistory = () => {
  try {
    const raw = window.localStorage.getItem(HISTORY_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {
    // localStorage may be restricted in sandboxed preview iframes
  }
  try {
    if (window.name && window.name.startsWith('THESIS_HISTORY:')) {
      const parsed = JSON.parse(window.name.slice('THESIS_HISTORY:'.length));
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {
    // Ignore fallback parse error
  }
  return [];
};

const writeStoredHistory = (items) => {
  const serialized = JSON.stringify(items);
  try {
    window.localStorage.setItem(HISTORY_STORAGE_KEY, serialized);
  } catch (e) {
    // Fallback to window.name so history survives page reload in sandboxed iframes
  }
  try {
    window.name = 'THESIS_HISTORY:' + serialized;
  } catch (e) {
    // Ignore if window.name is locked
  }
};

export default function App() {
  const [extractedText, setExtractedText] = useState('');
  const [fileName, setFileName] = useState('');
  const [pageCount, setPageCount] = useState(0);

  // Student metadata
  const [studentName, setStudentName] = useState('');
  const [studentId, setStudentId] = useState('');
  const [thesisTitle, setThesisTitle] = useState('');

  // Status flags
  const [isExtractingPdf, setIsExtractingPdf] = useState(false);
  const [pdfProgress, setPdfProgress] = useState(0);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [hasIncompleteRun, setHasIncompleteRun] = useState(false);
  const [analysisError, setAnalysisError] = useState('');

  // AI Endpoint Config (persisted in localStorage)
  const [initialAiConfig] = useState(() => readStoredAiConfig());
  const [aiProvider, setAiProvider] = useState(initialAiConfig.aiProvider); // 'gemini' | 'openai'
  const [geminiApiKey, setGeminiApiKey] = useState(initialAiConfig.geminiApiKey);
  const [geminiModel, setGeminiModel] = useState(initialAiConfig.geminiModel);
  const [openaiApiKey, setOpenaiApiKey] = useState(initialAiConfig.openaiApiKey);
  const [openaiBaseUrl, setOpenaiBaseUrl] = useState(initialAiConfig.openaiBaseUrl);
  const [openaiModel, setOpenaiModel] = useState(initialAiConfig.openaiModel);

  useEffect(() => {
    writeStoredAiConfig({
      aiProvider,
      geminiApiKey,
      geminiModel,
      openaiApiKey,
      openaiBaseUrl,
      openaiModel
    });
  }, [aiProvider, geminiApiKey, geminiModel, openaiApiKey, openaiBaseUrl, openaiModel]);

  const [showApiKeyModal, setShowApiKeyModal] = useState(false);
  const [insightDialog, setInsightDialog] = useState(null); // { type: 'strengths' | 'weaknesses', title: string, items: string[] }

  // Results & score tracking
  const [analysis, setAnalysis] = useState(null);
  const [analysisProgress, setAnalysisProgress] = useState({ current: 0, total: 11, statusText: '' });
  const [userScores, setUserScores] = useState({});
  const [userJustifications, setUserJustifications] = useState({});
  const [expandedItems, setExpandedItems] = useState({});
  const [reevaluatingItems, setReevaluatingItems] = useState({});
  const [isGeneratingQuestions, setIsGeneratingQuestions] = useState(false);
  const [isRegeneratingSummary, setIsRegeneratingSummary] = useState(false);
  const [regeneratingSection, setRegeneratingSection] = useState<Record<string, boolean>>({});
  const [questionFilter, setQuestionFilter] = useState('All');
  const [copiedQuestionIdx, setCopiedQuestionIdx] = useState(null);

  // UI state
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedSuccess, setCopiedSuccess] = useState(false);

  // History persistence (stores up to 10 previous analyses without PDF text)
  const [historyList, setHistoryList] = useState(() => readStoredHistory());
  const [activeHistoryId, setActiveHistoryId] = useState(null);
  const [showHistoryModal, setShowHistoryModal] = useState(false);

  const persistHistory = (nextList) => {
    setHistoryList(nextList);
    writeStoredHistory(nextList);
  };

  // Sync manual edits (scores, metadata, single-item recomputes) to active history entry
  useEffect(() => {
    if (!activeHistoryId || !analysis || isAnalyzing) return;
    setHistoryList((prev) => {
      const idx = prev.findIndex((item) => item.id === activeHistoryId);
      if (idx === -1) return prev;
      const grandTotal = RUBRIC_CRITERIA.reduce(
        (sum, c) => sum + (userScores[c.id] || 0) * c.multiplier,
        0
      );
      const updated = [...prev];
      updated[idx] = {
        ...updated[idx],
        studentName: studentName || updated[idx].studentName,
        studentId: studentId || updated[idx].studentId,
        thesisTitle: thesisTitle || updated[idx].thesisTitle,
        grandTotal,
        analysis,
        userScores,
        userJustifications
      };
      writeStoredHistory(updated);
      return updated;
    });
  }, [activeHistoryId, analysis, userScores, userJustifications, studentName, studentId, thesisTitle, isAnalyzing]);

  const loadHistoryEntry = (entry) => {
    setAnalysis(entry.analysis);
    setUserScores(entry.userScores || {});
    setUserJustifications(entry.userJustifications || {});
    setStudentName(entry.studentName || '');
    setStudentId(entry.studentId || '');
    setThesisTitle(entry.thesisTitle || '');
    setFileName(entry.fileName || '');
    setPageCount(entry.pageCount || 0);
    setExtractedText(''); // PDF text is excluded from storage
    setActiveHistoryId(entry.id);
    setExpandedItems({});
    setHasIncompleteRun(false);
    setAnalysisError('');
    setShowHistoryModal(false);
  };

  const deleteHistoryEntry = (id, e) => {
    e.stopPropagation();
    const filtered = historyList.filter((item) => item.id !== id);
    persistHistory(filtered);
    if (activeHistoryId === id) {
      setActiveHistoryId(null);
    }
  };

  const clearAllHistory = () => {
    persistHistory([]);
    setActiveHistoryId(null);
  };

  const loadPdfJs = async () => {
    if (window.pdfjsLib) return window.pdfjsLib;
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
      script.onload = () => {
        window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
        resolve(window.pdfjsLib);
      };
      script.onerror = () => reject(new Error('Failed to load PDF library.'));
      document.head.appendChild(script);
    });
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf' && !file.name.endsWith('.pdf')) {
      setAnalysisError('Please upload a valid PDF file.');
      return;
    }

    setFileName(file.name);
    setIsExtractingPdf(true);
    setPdfProgress(10);
    setHasIncompleteRun(false);
    setAnalysisError('');

    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdfjs = await loadPdfJs();
      setPdfProgress(30);

      const loadingTask = pdfjs.getDocument({ data: arrayBuffer });
      const pdf = await loadingTask.promise;
      setPageCount(pdf.numPages);

      let fullText = '';
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map(item => item.str).join(' ');
        fullText += `\n--- PAGE ${i} ---\n` + pageText + '\n';
        setPdfProgress(Math.min(95, Math.round(30 + (i / pdf.numPages) * 65)));
      }

      setExtractedText(fullText);
      setPdfProgress(100);
    } catch (err) {
      console.error(err);
      setAnalysisError('Error extracting text from PDF: ' + err.message);
    } finally {
      setIsExtractingPdf(false);
    }
  };

  const fetchSummaryAndMetadata = async (textToAnalyze: string, includeVivaQuestions = true) => {
    const effectiveApiKey = aiProvider === 'gemini'
      ? geminiApiKey.trim()
      : openaiApiKey.trim();

    const vivaInstruction = includeVivaQuestions
      ? `, and 6 targeted oral defense / viva questions to ask the student.

For the 6 viva questions (2 per category), categorize each strictly as one of:
- "Understanding": Questions that test deep conceptual/technical comprehension of their methodology, design choices, or results.
- "AI Verification": Questions designed to catch lazy 100% AI delegation (e.g., probing sudden shifts in writing polish, generic buzzwords without concrete implementation specifics, unverified citations, or asking them to walk through exact steps/decisions an AI hallucinated or generalized).
- "Clarification": Questions targeting vague, under-elaborated, or poorly justified claims in the thesis.

Return JSON format with keys:
"studentName", "studentId", "thesisTitle", "projectObjective", "researchQuestions" (array of strings), "executiveSummary", "overallGrade", "keyStrengths" (array), "keyWeaknesses" (array), and "vivaQuestions" (array of objects with keys: "category", "question", "thesisReference", "whatToLookFor").`
      : `.

Return JSON format with keys:
"studentName", "studentId", "thesisTitle", "projectObjective", "researchQuestions" (array of strings), "executiveSummary", "overallGrade", "keyStrengths" (array), and "keyWeaknesses" (array).`;

    const metadataPrompt = `Extract Student Name, Student ID, Thesis Title, Project Objective (a clear, concise statement of the thesis's main project/research objective), and Research Questions (an array of the specific research questions stated or addressed in the thesis) from this thesis document text. Also provide an overall executive summary (2-3 paragraphs), overall letter grade (e.g. A, B+, B, C), key 3 strengths, and key 3 weaknesses${vivaInstruction}`;

    if (aiProvider === 'gemini') {
      const selectedModel = geminiModel.trim() || 'gemini-3-flash-preview';
      const targetApiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${selectedModel}:generateContent?key=${effectiveApiKey}`;

      const properties: Record<string, any> = {
        studentName: { type: "STRING" },
        studentId: { type: "STRING" },
        thesisTitle: { type: "STRING" },
        projectObjective: { type: "STRING" },
        researchQuestions: { type: "ARRAY", items: { type: "STRING" } },
        executiveSummary: { type: "STRING" },
        overallGrade: { type: "STRING" },
        keyStrengths: { type: "ARRAY", items: { type: "STRING" } },
        keyWeaknesses: { type: "ARRAY", items: { type: "STRING" } }
      };

      if (includeVivaQuestions) {
        properties.vivaQuestions = {
          type: "ARRAY",
          items: {
            type: "OBJECT",
            properties: {
              category: { type: "STRING" },
              question: { type: "STRING" },
              thesisReference: { type: "STRING" },
              whatToLookFor: { type: "STRING" }
            },
            required: ["category", "question", "thesisReference", "whatToLookFor"]
          }
        };
      }

      const metaPayload = {
        contents: [{ role: "user", parts: [{ text: `${metadataPrompt}\n\n--- FULL THESIS DOCUMENT TEXT ---\n${textToAnalyze}` }] }],
        generationConfig: {
          responseMimeType: "application/json",
          responseSchema: {
            type: "OBJECT",
            properties
          }
        }
      };

      const metaRes = await fetch(targetApiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(metaPayload)
      });
      if (!metaRes.ok) {
        throw new Error(`Gemini API error (${metaRes.status})`);
      }
      const metaJson = await metaRes.json();
      const rawMeta = metaJson?.candidates?.[0]?.content?.parts?.[0]?.text;
      return rawMeta ? JSON.parse(rawMeta) : {};
    }

    const baseUrl = (openaiBaseUrl.trim() || 'https://api.openai.com/v1').replace(/\/+$/, '');
    const targetApiUrl = `${baseUrl}/chat/completions`;
    const selectedModel = openaiModel.trim() || 'gpt-4o';
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (effectiveApiKey) headers["Authorization"] = `Bearer ${effectiveApiKey}`;

    const metaPayload = {
      model: selectedModel,
      messages: [
        { role: "system", content: metadataPrompt },
        { role: "user", content: `--- FULL THESIS DOCUMENT TEXT ---\n${textToAnalyze}` }
      ],
      response_format: { type: "json_object" }
    };

    const metaRes = await fetch(targetApiUrl, {
      method: "POST",
      headers,
      body: JSON.stringify(metaPayload)
    });
    if (!metaRes.ok) {
      throw new Error(`OpenAI API error (${metaRes.status})`);
    }
    const metaJson = await metaRes.json();
    const rawMeta = metaJson?.choices?.[0]?.message?.content;
    return rawMeta ? JSON.parse(rawMeta) : {};
  };

  const runThesisAnalysis = async (textToAnalyze, { resume = false } = {}) => {
    if (!textToAnalyze || textToAnalyze.trim().length < 50) {
      setAnalysisError('The thesis text is too short or empty for analysis.');
      return;
    }

    if (aiProvider === 'openai' && !openaiApiKey.trim()) {
      setShowApiKeyModal(true);
      setAnalysisError('OpenAI API Key is required when using OpenAI provider.');
      return;
    }

    const effectiveApiKey = aiProvider === 'gemini' 
      ? geminiApiKey.trim()
      : openaiApiKey.trim();

    const isResuming = Boolean(resume && analysis);
    const existingEvaluations = isResuming && Array.isArray(analysis.criteriaEvaluations)
      ? [...analysis.criteriaEvaluations]
      : [];

    setIsAnalyzing(true);
    setHasIncompleteRun(false);
    setAnalysisError('');
    setAnalysisProgress({
      current: existingEvaluations.length,
      total: RUBRIC_CRITERIA.length,
      statusText: isResuming
        ? `Resuming thesis evaluation (${existingEvaluations.length}/${RUBRIC_CRITERIA.length} completed)...`
        : 'Initializing thesis evaluation...'
    });

    if (!isResuming) {
      setAnalysis(null);
      setUserScores({});
      setUserJustifications({});
      setExpandedItems({});
      setActiveHistoryId(null);
    }

    try {
      let metaDataObj = isResuming
        ? {
            studentName: analysis.studentName || "Not Provided",
            studentId: analysis.studentId || "Not Provided",
            thesisTitle: analysis.thesisTitle || "Not Provided",
            projectObjective: analysis.projectObjective || "",
            researchQuestions: Array.isArray(analysis.researchQuestions) ? analysis.researchQuestions : [],
            executiveSummary: analysis.executiveSummary || "Evaluation complete.",
            overallGrade: analysis.overallGrade || "Satisfactory",
            keyStrengths: Array.isArray(analysis.keyStrengths) ? analysis.keyStrengths : [],
            keyWeaknesses: Array.isArray(analysis.keyWeaknesses) ? analysis.keyWeaknesses : [],
            vivaQuestions: Array.isArray(analysis.vivaQuestions) ? analysis.vivaQuestions : []
          }
        : {
            studentName: "Not Provided",
            studentId: "Not Provided",
            thesisTitle: "Not Provided",
            projectObjective: "",
            researchQuestions: [],
            executiveSummary: "Evaluation complete.",
            overallGrade: "Satisfactory",
            keyStrengths: [],
            keyWeaknesses: [],
            vivaQuestions: []
          };

      if (!isResuming) {
        setAnalysisProgress({ current: 0, total: RUBRIC_CRITERIA.length, statusText: 'Extracting student metadata & summary...' });

        try {
          const extractedMeta = await fetchSummaryAndMetadata(textToAnalyze, true);
          if (extractedMeta && typeof extractedMeta === 'object') {
            metaDataObj = { ...metaDataObj, ...extractedMeta };
          }
        } catch (err) {
          console.warn('Metadata extraction non-fatal error:', err);
        }

        if (metaDataObj.studentName && metaDataObj.studentName !== "Not Provided") setStudentName(metaDataObj.studentName);
        if (metaDataObj.studentId && metaDataObj.studentId !== "Not Provided") setStudentId(metaDataObj.studentId);
        if (metaDataObj.thesisTitle && metaDataObj.thesisTitle !== "Not Provided") setThesisTitle(metaDataObj.thesisTitle);

        setAnalysis({
          ...metaDataObj,
          criteriaEvaluations: []
        });
      }

      const currentEvaluations = [...existingEvaluations];
      const updatedScores = isResuming ? { ...userScores } : {};
      const updatedJustifications = isResuming ? { ...userJustifications } : {};
      const updatedExpanded = isResuming ? { ...expandedItems } : {};

      for (let i = 0; i < RUBRIC_CRITERIA.length; i++) {
        const criterion = RUBRIC_CRITERIA[i];
        if (currentEvaluations.some((e) => e.id === criterion.id)) {
          setAnalysisProgress({
            current: i + 1,
            total: RUBRIC_CRITERIA.length,
            statusText: `Skipping already evaluated [${criterion.category}] ${criterion.subCriteria}...`
          });
          continue;
        }
        setAnalysisProgress({
          current: i + 1,
          total: RUBRIC_CRITERIA.length,
          statusText: `Evaluating [${criterion.category}] ${criterion.subCriteria}...`
        });

        const singlePrompt = buildCriterionPrompt(criterion, false);

        let evalResult;
        const promptTextCombined = `${singlePrompt}\n\n--- FULL THESIS DOCUMENT TEXT ---\n${textToAnalyze}`;

        if (aiProvider === 'gemini') {
          const selectedModel = geminiModel.trim() || 'gemini-3-flash-preview';
          const targetApiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${selectedModel}:generateContent?key=${effectiveApiKey}`;

          const payload = {
            contents: [{ role: "user", parts: [{ text: promptTextCombined }] }],
            generationConfig: {
              responseMimeType: "application/json",
              responseSchema: {
                type: "OBJECT",
                properties: {
                  score: { type: "INTEGER" },
                  justification: { type: "STRING" },
                  summaryExtract: { type: "STRING" },
                  improvementTip: { type: "STRING" }
                },
                required: ["score", "justification", "summaryExtract", "improvementTip"]
              }
            }
          };

          const res = await fetch(targetApiUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
          });

          if (!res.ok) {
            const errJson = await res.json().catch(() => ({}));
            const detailedMsg = errJson?.error?.message || `HTTP ${res.status}: ${res.statusText}`;
            throw new Error(`API Error for "${criterion.subCriteria}": ${detailedMsg}`);
          }

          const data = await res.json();
          const raw = data?.candidates?.[0]?.content?.parts?.[0]?.text;
          evalResult = { id: criterion.id, ...JSON.parse(raw) };

        } else {
          const baseUrl = (openaiBaseUrl.trim() || 'https://api.openai.com/v1').replace(/\/+$/, '');
          const targetApiUrl = `${baseUrl}/chat/completions`;
          const selectedModel = openaiModel.trim() || 'gpt-4o';
          const headers = { "Content-Type": "application/json" };
          if (effectiveApiKey) headers["Authorization"] = `Bearer ${effectiveApiKey}`;

          const payload = {
            model: selectedModel,
            messages: [
              { role: "system", content: singlePrompt + "\n\nReturn ONLY a valid JSON object with keys: score, justification, summaryExtract, improvementTip." },
              { role: "user", content: `--- FULL THESIS DOCUMENT TEXT ---\n${textToAnalyze}` }
            ],
            response_format: { type: "json_object" },
            temperature: 0.2
          };

          const res = await fetch(targetApiUrl, { method: "POST", headers, body: JSON.stringify(payload) });
          if (!res.ok) {
            const errJson = await res.json().catch(() => ({}));
            const detailedMsg = errJson?.error?.message || errJson?.message || `HTTP ${res.status}: ${res.statusText}`;
            throw new Error(`API Error for "${criterion.subCriteria}": ${detailedMsg}`);
          }
          const data = await res.json();
          evalResult = { id: criterion.id, ...JSON.parse(data?.choices?.[0]?.message?.content) };
        }

        currentEvaluations.push(evalResult);
        updatedScores[criterion.id] = evalResult.score;
        updatedJustifications[criterion.id] = evalResult.justification;
        updatedExpanded[criterion.id] = false;

        setAnalysis({
          ...metaDataObj,
          criteriaEvaluations: [...currentEvaluations]
        });
        setUserScores({ ...updatedScores });
        setUserJustifications({ ...updatedJustifications });
        setExpandedItems({ ...updatedExpanded });
      }

      // Compute final weighted total and synthesize executive insights if missing or empty
      const finalGrandTotal = RUBRIC_CRITERIA.reduce(
        (sum, c) => sum + (updatedScores[c.id] || 0) * c.multiplier,
        0
      );

      const needsSummarySynthesis =
        !metaDataObj.executiveSummary ||
        metaDataObj.executiveSummary === 'Evaluation complete.' ||
        !Array.isArray(metaDataObj.keyStrengths) ||
        metaDataObj.keyStrengths.length === 0 ||
        !Array.isArray(metaDataObj.keyWeaknesses) ||
        metaDataObj.keyWeaknesses.length === 0;

      if (needsSummarySynthesis) {
        setAnalysisProgress({
          current: RUBRIC_CRITERIA.length,
          total: RUBRIC_CRITERIA.length,
          statusText: 'Synthesizing executive summary, strengths & improvement areas...'
        });

        const rubricDigest = RUBRIC_CRITERIA.map((c) => {
          const ev = currentEvaluations.find((e) => e.id === c.id) || {};
          return `- [${c.category}] ${c.subCriteria}: Score ${ev.score || 3}/5. Justification: ${ev.justification || ''} | Tip: ${ev.improvementTip || ''}`;
        }).join('\n');

        const synthesisPrompt = `Based on these 11 rubric evaluation results (Total Score: ${finalGrandTotal}/100) and the thesis document, generate:
1. "executiveSummary": A clear, cohesive 2-paragraph academic executive summary of the thesis quality and key findings.
2. "overallGrade": Appropriate academic classification/grade for ${finalGrandTotal}/100 (e.g., "Distinction (A)", "Merit (B+)", "Satisfactory (B)", "Pass (C)", "Needs Revision (D)").
3. "keyStrengths": Exactly 3 specific, substantive key strengths of the thesis (array of strings).
4. "keyWeaknesses": Exactly 3 specific, actionable areas for improvement (array of strings).
5. "vivaQuestions": If empty, generate 6 oral defense questions (2 "Understanding", 2 "AI Verification", 2 "Clarification") with keys "category", "question", "thesisReference", "whatToLookFor".

Return ONLY valid JSON.`;

        try {
          if (aiProvider === 'gemini') {
            const selectedModel = geminiModel.trim() || 'gemini-3-flash-preview';
            const targetApiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${selectedModel}:generateContent?key=${effectiveApiKey}`;
            const synPayload = {
              contents: [{ role: 'user', parts: [{ text: `${synthesisPrompt}\n\n--- RUBRIC RESULTS ---\n${rubricDigest}\n\n--- THESIS EXCERPT ---\n${textToAnalyze.slice(0, 25000)}` }] }],
              generationConfig: {
                responseMimeType: 'application/json',
                responseSchema: {
                  type: 'OBJECT',
                  properties: {
                    executiveSummary: { type: 'STRING' },
                    overallGrade: { type: 'STRING' },
                    keyStrengths: { type: 'ARRAY', items: { type: 'STRING' } },
                    keyWeaknesses: { type: 'ARRAY', items: { type: 'STRING' } },
                    vivaQuestions: {
                      type: 'ARRAY',
                      items: {
                        type: 'OBJECT',
                        properties: {
                          category: { type: 'STRING' },
                          question: { type: 'STRING' },
                          thesisReference: { type: 'STRING' },
                          whatToLookFor: { type: 'STRING' }
                        },
                        required: ['category', 'question', 'thesisReference', 'whatToLookFor']
                      }
                    }
                  },
                  required: ['executiveSummary', 'overallGrade', 'keyStrengths', 'keyWeaknesses']
                }
              }
            };
            const synRes = await fetch(targetApiUrl, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(synPayload)
            });
            if (synRes.ok) {
              const synJson = await synRes.json();
              const parsedSyn = JSON.parse(synJson?.candidates?.[0]?.content?.parts?.[0]?.text || '{}');
              if (parsedSyn.executiveSummary) metaDataObj.executiveSummary = parsedSyn.executiveSummary;
              if (parsedSyn.overallGrade) metaDataObj.overallGrade = parsedSyn.overallGrade;
              if (parsedSyn.keyStrengths?.length) metaDataObj.keyStrengths = parsedSyn.keyStrengths;
              if (parsedSyn.keyWeaknesses?.length) metaDataObj.keyWeaknesses = parsedSyn.keyWeaknesses;
              if ((!metaDataObj.vivaQuestions || metaDataObj.vivaQuestions.length === 0) && parsedSyn.vivaQuestions?.length) {
                metaDataObj.vivaQuestions = parsedSyn.vivaQuestions;
              }
            }
          } else {
            const baseUrl = (openaiBaseUrl.trim() || 'https://api.openai.com/v1').replace(/\/+$/, '');
            const targetApiUrl = `${baseUrl}/chat/completions`;
            const selectedModel = openaiModel.trim() || 'gpt-4o';
            const headers = { 'Content-Type': 'application/json' };
            if (effectiveApiKey) headers['Authorization'] = `Bearer ${effectiveApiKey}`;
            const synPayload = {
              model: selectedModel,
              messages: [
                { role: 'system', content: synthesisPrompt },
                { role: 'user', content: `--- RUBRIC RESULTS ---\n${rubricDigest}\n\n--- THESIS EXCERPT ---\n${textToAnalyze.slice(0, 25000)}` }
              ],
              response_format: { type: 'json_object' }
            };
            const synRes = await fetch(targetApiUrl, {
              method: 'POST',
              headers,
              body: JSON.stringify(synPayload)
            });
            if (synRes.ok) {
              const synJson = await synRes.json();
              const parsedSyn = JSON.parse(synJson?.choices?.[0]?.message?.content || '{}');
              if (parsedSyn.executiveSummary) metaDataObj.executiveSummary = parsedSyn.executiveSummary;
              if (parsedSyn.overallGrade) metaDataObj.overallGrade = parsedSyn.overallGrade;
              if (parsedSyn.keyStrengths?.length) metaDataObj.keyStrengths = parsedSyn.keyStrengths;
              if (parsedSyn.keyWeaknesses?.length) metaDataObj.keyWeaknesses = parsedSyn.keyWeaknesses;
              if ((!metaDataObj.vivaQuestions || metaDataObj.vivaQuestions.length === 0) && parsedSyn.vivaQuestions?.length) {
                metaDataObj.vivaQuestions = parsedSyn.vivaQuestions;
              }
            }
          }
        } catch (synErr) {
          console.warn('Synthesis fallback error:', synErr);
        }

        // Deterministic fallback derived directly from scored rubric items if API synthesis still left arrays empty
        if (!metaDataObj.keyStrengths || metaDataObj.keyStrengths.length === 0) {
          const topItems = [...currentEvaluations]
            .sort((a, b) => (b.score || 0) - (a.score || 0))
            .slice(0, 3);
          metaDataObj.keyStrengths = topItems.map((ev) => {
            const spec = RUBRIC_CRITERIA.find((c) => c.id === ev.id);
            return `${spec?.category || 'Criterion'} (${ev.score}/5): ${ev.justification}`;
          });
        }
        if (!metaDataObj.keyWeaknesses || metaDataObj.keyWeaknesses.length === 0) {
          const lowestItems = [...currentEvaluations]
            .sort((a, b) => (a.score || 0) - (b.score || 0))
            .slice(0, 3);
          metaDataObj.keyWeaknesses = lowestItems.map((ev) => {
            const spec = RUBRIC_CRITERIA.find((c) => c.id === ev.id);
            return `${spec?.category || 'Criterion'} (${ev.score}/5): ${ev.improvementTip || ev.justification}`;
          });
        }
        if (!metaDataObj.executiveSummary || metaDataObj.executiveSummary === 'Evaluation complete.') {
          metaDataObj.executiveSummary = `This thesis achieved a total weighted score of ${finalGrandTotal}/100 across the 11 evaluation criteria. Strongest performance was observed in ${metaDataObj.keyStrengths[0]?.split(':')[0] || 'core sections'}, while primary opportunities for improvement center around ${metaDataObj.keyWeaknesses[0]?.split(':')[0] || 'detailed analytical depth'}.`;
        }
      }

      // Save completed evaluation results to storage (excluding PDF binary/text)
      const finalAnalysis = {
        ...metaDataObj,
        criteriaEvaluations: [...currentEvaluations]
      };
      setAnalysis(finalAnalysis);

      const resolvedName =
        metaDataObj.studentName && metaDataObj.studentName !== 'Not Provided'
          ? metaDataObj.studentName
          : studentName || 'Unknown Student';
      const resolvedId =
        metaDataObj.studentId && metaDataObj.studentId !== 'Not Provided'
          ? metaDataObj.studentId
          : studentId || '';
      const resolvedTitle =
        metaDataObj.thesisTitle && metaDataObj.thesisTitle !== 'Not Provided'
          ? metaDataObj.thesisTitle
          : thesisTitle || fileName || 'Untitled Thesis';

      const newHistoryId = `eval_${Date.now()}`;
      const historyRecord = {
        id: newHistoryId,
        timestamp: new Date().toISOString(),
        fileName,
        pageCount,
        studentName: resolvedName,
        studentId: resolvedId,
        thesisTitle: resolvedTitle,
        grandTotal: finalGrandTotal,
        overallGrade: metaDataObj.overallGrade || 'Satisfactory',
        analysis: finalAnalysis,
        userScores: { ...updatedScores },
        userJustifications: { ...updatedJustifications }
      };

      setActiveHistoryId(newHistoryId);
      setHasIncompleteRun(false);
      persistHistory([historyRecord, ...historyList].slice(0, MAX_HISTORY_ITEMS));

    } catch (err) {
      console.error(err);
      setHasIncompleteRun(true);
      setAnalysisError('Evaluation interrupted: ' + err.message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const totalMarksAndDetails = useMemo(() => {
    let grandTotal = 0;
    const categoryTotals: Record<string, { earned: number; max: number }> = {};

    RUBRIC_CRITERIA.forEach(c => {
      const score = userScores[c.id] || 0;
      const earnedMarks = score * c.multiplier;

      grandTotal += earnedMarks;

      if (!categoryTotals[c.category]) {
        categoryTotals[c.category] = { earned: 0, max: 0 };
      }
      categoryTotals[c.category].earned += earnedMarks;
      categoryTotals[c.category].max += c.maxCategoryMarks;
    });

    return { grandTotal, categoryTotals };
  }, [userScores]);

  const handleScoreChange = (criterionId, newScore) => {
    setUserScores(prev => ({ ...prev, [criterionId]: parseInt(newScore, 10) }));
  };

  const toggleExpand = (criterionId) => {
    setExpandedItems(prev => ({ ...prev, [criterionId]: !prev[criterionId] }));
  };

  const getAnalysisContextText = () => {
    if (extractedText && extractedText.trim().length > 0) {
      return extractedText;
    }
    if (!analysis) return '';

    const evalDigest = (analysis.criteriaEvaluations || [])
      .map((ev) => {
        const spec = RUBRIC_CRITERIA.find((c) => c.id === ev.id);
        return `[${spec?.category || ev.id}] ${spec?.subCriteria || ''} (Score: ${ev.score}/5)\nJustification: ${ev.justification || ''}\nExcerpt: ${ev.summaryExtract || ''}\nTip: ${ev.improvementTip || ''}`;
      })
      .join('\n\n');

    return [
      `Thesis Title: ${thesisTitle || analysis.thesisTitle || 'N/A'}`,
      `Student Name: ${studentName || analysis.studentName || 'N/A'}`,
      `Student ID: ${studentId || analysis.studentId || 'N/A'}`,
      analysis.projectObjective ? `Project Objective: ${analysis.projectObjective}` : '',
      analysis.researchQuestions?.length
        ? `Research Questions:\n${analysis.researchQuestions.map((rq, i) => `${i + 1}. ${rq}`).join('\n')}`
        : '',
      analysis.executiveSummary ? `Executive Summary:\n${analysis.executiveSummary}` : '',
      evalDigest ? `Rubric Evaluation Digest & Excerpts:\n${evalDigest}` : ''
    ]
      .filter(Boolean)
      .join('\n\n');
  };

  const recomputeCriterionScore = async (criterionId) => {
    const criterionSpec = RUBRIC_CRITERIA.find(c => c.id === criterionId);
    const contextText = getAnalysisContextText();
    if (!criterionSpec || !contextText) return;

    if (aiProvider === 'openai' && !openaiApiKey.trim()) {
      setShowApiKeyModal(true);
      setAnalysisError('OpenAI API Key is required to recompute scores.');
      return;
    }

    const effectiveApiKey = aiProvider === 'gemini' 
      ? geminiApiKey.trim()
      : openaiApiKey.trim();

    setReevaluatingItems(prev => ({ ...prev, [criterionId]: true }));

    try {
      const singlePrompt = buildCriterionPrompt(criterionSpec, true);

      let newItem;
      const promptTextCombined = `${singlePrompt}\n\n--- FULL THESIS DOCUMENT TEXT ---\n${contextText}`;

      if (aiProvider === 'gemini') {
        const selectedModel = geminiModel.trim() || 'gemini-3-flash-preview';
        const targetApiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${selectedModel}:generateContent?key=${effectiveApiKey}`;

        const payload = {
          contents: [{ role: "user", parts: [{ text: promptTextCombined }] }],
          generationConfig: {
            responseMimeType: "application/json",
            responseSchema: {
              type: "OBJECT",
              properties: {
                score: { type: "INTEGER" },
                justification: { type: "STRING" },
                summaryExtract: { type: "STRING" },
                improvementTip: { type: "STRING" }
              },
              required: ["score", "justification", "summaryExtract", "improvementTip"]
            }
          }
        };

        const res = await fetch(targetApiUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });

        if (!res.ok) throw new Error(`Gemini API error (${res.status})`);
        const data = await res.json();
        const raw = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        newItem = { id: criterionId, ...JSON.parse(raw) };
      } else {
        const baseUrl = (openaiBaseUrl.trim() || 'https://api.openai.com/v1').replace(/\/+$/, '');
        const targetApiUrl = `${baseUrl}/chat/completions`;
        const selectedModel = openaiModel.trim() || 'gpt-4o';

        const headers = { "Content-Type": "application/json" };
        if (effectiveApiKey) headers["Authorization"] = `Bearer ${effectiveApiKey}`;

        const payload = {
          model: selectedModel,
          messages: [
            { role: "system", content: singlePrompt + "\n\nReturn ONLY a valid JSON object with keys: score, justification, summaryExtract, improvementTip." },
            { role: "user", content: `--- FULL THESIS DOCUMENT TEXT ---\n${contextText}` }
          ],
          response_format: { type: "json_object" },
          temperature: 0.2
        };

        const res = await fetch(targetApiUrl, { method: "POST", headers, body: JSON.stringify(payload) });
        if (!res.ok) throw new Error(`OpenAI API error (${res.status})`);
        const data = await res.json();
        newItem = { id: criterionId, ...JSON.parse(data?.choices?.[0]?.message?.content) };
      }

      setAnalysis(prev => {
        if (!prev) return prev;
        const updatedEvals = prev.criteriaEvaluations.map(e => e.id === criterionId ? newItem : e);
        if (!updatedEvals.find(e => e.id === criterionId)) {
          updatedEvals.push(newItem);
        }
        return { ...prev, criteriaEvaluations: updatedEvals };
      });

      setUserScores(prev => ({ ...prev, [criterionId]: newItem.score }));
      setUserJustifications(prev => ({ ...prev, [criterionId]: newItem.justification }));

    } catch (err) {
      console.error(err);
      setAnalysisError(`Failed to recompute item '${criterionSpec.subCriteria}': ${err.message}`);
    } finally {
      setReevaluatingItems(prev => ({ ...prev, [criterionId]: false }));
    }
  };

  const regenerateSummaryAndMetadata = async () => {
    const contextText = getAnalysisContextText();
    if (!contextText) return;

    if (aiProvider === 'openai' && !openaiApiKey.trim()) {
      setShowApiKeyModal(true);
      setAnalysisError('OpenAI API Key is required to regenerate summary & metadata.');
      return;
    }

    setIsRegeneratingSummary(true);
    setAnalysisError('');

    try {
      const updatedMeta = await fetchSummaryAndMetadata(contextText, false);

      if (updatedMeta.studentName && updatedMeta.studentName !== 'Not Provided') {
        setStudentName(updatedMeta.studentName);
      }
      if (updatedMeta.studentId && updatedMeta.studentId !== 'Not Provided') {
        setStudentId(updatedMeta.studentId);
      }
      if (updatedMeta.thesisTitle && updatedMeta.thesisTitle !== 'Not Provided') {
        setThesisTitle(updatedMeta.thesisTitle);
      }

      setAnalysis((prev) =>
        prev
          ? {
              ...prev,
              studentName: updatedMeta.studentName ?? prev.studentName,
              studentId: updatedMeta.studentId ?? prev.studentId,
              thesisTitle: updatedMeta.thesisTitle ?? prev.thesisTitle,
              projectObjective: updatedMeta.projectObjective ?? prev.projectObjective,
              researchQuestions: Array.isArray(updatedMeta.researchQuestions)
                ? updatedMeta.researchQuestions
                : prev.researchQuestions,
              executiveSummary: updatedMeta.executiveSummary ?? prev.executiveSummary,
              overallGrade: updatedMeta.overallGrade ?? prev.overallGrade,
              keyStrengths: Array.isArray(updatedMeta.keyStrengths)
                ? updatedMeta.keyStrengths
                : prev.keyStrengths,
              keyWeaknesses: Array.isArray(updatedMeta.keyWeaknesses)
                ? updatedMeta.keyWeaknesses
                : prev.keyWeaknesses
            }
          : prev
      );
    } catch (err) {
      console.error(err);
      setAnalysisError(`Failed to regenerate summary & metadata: ${err.message}`);
    } finally {
      setIsRegeneratingSummary(false);
    }
  };

  const regenerateSummaryField = async (
    fieldKey: 'projectObjective' | 'researchQuestions' | 'keyStrengths' | 'keyWeaknesses'
  ) => {
    const contextText = getAnalysisContextText();
    if (!contextText) return;

    if (aiProvider === 'openai' && !openaiApiKey.trim()) {
      setShowApiKeyModal(true);
      setAnalysisError('OpenAI API Key is required to regenerate this section.');
      return;
    }

    const effectiveApiKey = aiProvider === 'gemini'
      ? geminiApiKey.trim()
      : openaiApiKey.trim();

    const sectionConfig = {
      projectObjective: {
        label: 'project objective',
        prompt: 'Extract a clear, concise statement of the main project/research objective from this thesis document text. Return JSON with key "projectObjective" (string).',
        schema: { projectObjective: { type: 'STRING' } }
      },
      researchQuestions: {
        label: 'research questions',
        prompt: 'Extract all specific research questions stated or addressed in this thesis document text. Return JSON with key "researchQuestions" (array of strings).',
        schema: { researchQuestions: { type: 'ARRAY', items: { type: 'STRING' } } }
      },
      keyStrengths: {
        label: 'key strengths',
        prompt: 'Analyze this thesis document text and identify exactly 3 specific, substantive key strengths of the thesis. Return JSON with key "keyStrengths" (array of 3 strings).',
        schema: { keyStrengths: { type: 'ARRAY', items: { type: 'STRING' } } }
      },
      keyWeaknesses: {
        label: 'areas for improvement',
        prompt: 'Analyze this thesis document text and identify exactly 3 specific, actionable areas for improvement in the thesis. Return JSON with key "keyWeaknesses" (array of 3 strings).',
        schema: { keyWeaknesses: { type: 'ARRAY', items: { type: 'STRING' } } }
      }
    }[fieldKey];

    setRegeneratingSection((prev) => ({ ...prev, [fieldKey]: true }));
    setAnalysisError('');

    try {
      let parsed: Record<string, any> = {};

      if (aiProvider === 'gemini') {
        const selectedModel = geminiModel.trim() || 'gemini-3-flash-preview';
        const targetApiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${selectedModel}:generateContent?key=${effectiveApiKey}`;
        const payload = {
          contents: [{ role: 'user', parts: [{ text: `${sectionConfig.prompt}\n\n--- FULL THESIS DOCUMENT TEXT ---\n${contextText}` }] }],
          generationConfig: {
            responseMimeType: 'application/json',
            responseSchema: {
              type: 'OBJECT',
              properties: sectionConfig.schema,
              required: [fieldKey]
            }
          }
        };

        const res = await fetch(targetApiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (!res.ok) throw new Error(`Gemini API error (${res.status})`);
        const data = await res.json();
        const raw = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        parsed = raw ? JSON.parse(raw) : {};
      } else {
        const baseUrl = (openaiBaseUrl.trim() || 'https://api.openai.com/v1').replace(/\/+$/, '');
        const targetApiUrl = `${baseUrl}/chat/completions`;
        const selectedModel = openaiModel.trim() || 'gpt-4o';
        const headers: Record<string, string> = { 'Content-Type': 'application/json' };
        if (effectiveApiKey) headers['Authorization'] = `Bearer ${effectiveApiKey}`;

        const payload = {
          model: selectedModel,
          messages: [
            { role: 'system', content: sectionConfig.prompt },
            { role: 'user', content: `--- FULL THESIS DOCUMENT TEXT ---\n${contextText}` }
          ],
          response_format: { type: 'json_object' }
        };

        const res = await fetch(targetApiUrl, {
          method: 'POST',
          headers,
          body: JSON.stringify(payload)
        });
        if (!res.ok) throw new Error(`OpenAI API error (${res.status})`);
        const data = await res.json();
        const raw = data?.choices?.[0]?.message?.content;
        parsed = raw ? JSON.parse(raw) : {};
      }

      if (parsed[fieldKey] !== undefined) {
        setAnalysis((prev) => (prev ? { ...prev, [fieldKey]: parsed[fieldKey] } : prev));
      }
    } catch (err) {
      console.error(err);
      setAnalysisError(`Failed to regenerate ${sectionConfig.label}: ${err.message}`);
    } finally {
      setRegeneratingSection((prev) => ({ ...prev, [fieldKey]: false }));
    }
  };

  const regenerateVivaQuestions = async () => {
    const contextText = getAnalysisContextText();
    if (!contextText) return;

    if (aiProvider === 'openai' && !openaiApiKey.trim()) {
      setShowApiKeyModal(true);
      setAnalysisError('OpenAI API Key is required to generate viva questions.');
      return;
    }

    const effectiveApiKey = aiProvider === 'gemini'
      ? geminiApiKey.trim()
      : openaiApiKey.trim();

    setIsGeneratingQuestions(true);
    setAnalysisError('');

    try {
      const qPrompt = `You are an experienced thesis examiner. Analyze the full thesis text and generate 6 sharp, specific oral defense (viva) questions (2 per category) to ask the student:
1. "Understanding": Test whether the student genuinely understands their own methodology, equations, architecture, or analytical choices.
2. "AI Verification": Detect lazy 100% AI delegation—probe overly generic LLM-style prose, unsubstantiated claims, abrupt tone shifts, or surface-level technical jargon that a student who didn't write the thesis themselves would struggle to defend.
3. "Clarification": Drill into poorly elaborated, ambiguous, or missing details in the thesis.

Return JSON with key "vivaQuestions", an array of 6 objects each having:
- "category": strictly "Understanding", "AI Verification", or "Clarification"
- "question": The exact question to ask the student
- "thesisReference": Specific section, claim, or topic in the thesis that triggered this question
- "whatToLookFor": Expected strong answer vs. red flags of superficial/AI-delegated work`;

      let newQuestions = [];

      if (aiProvider === 'gemini') {
        const selectedModel = geminiModel.trim() || 'gemini-3-flash-preview';
        const targetApiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${selectedModel}:generateContent?key=${effectiveApiKey}`;
        const payload = {
          contents: [{ role: "user", parts: [{ text: `${qPrompt}\n\n--- FULL THESIS DOCUMENT TEXT ---\n${contextText}` }] }],
          generationConfig: {
            responseMimeType: "application/json",
            responseSchema: {
              type: "OBJECT",
              properties: {
                vivaQuestions: {
                  type: "ARRAY",
                  items: {
                    type: "OBJECT",
                    properties: {
                      category: { type: "STRING" },
                      question: { type: "STRING" },
                      thesisReference: { type: "STRING" },
                      whatToLookFor: { type: "STRING" }
                    },
                    required: ["category", "question", "thesisReference", "whatToLookFor"]
                  }
                }
              },
              required: ["vivaQuestions"]
            }
          }
        };

        const res = await fetch(targetApiUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
        if (!res.ok) throw new Error(`Gemini API error (${res.status})`);
        const data = await res.json();
        const parsed = JSON.parse(data?.candidates?.[0]?.content?.parts?.[0]?.text || '{}');
        newQuestions = parsed.vivaQuestions || [];
      } else {
        const baseUrl = (openaiBaseUrl.trim() || 'https://api.openai.com/v1').replace(/\/+$/, '');
        const targetApiUrl = `${baseUrl}/chat/completions`;
        const selectedModel = openaiModel.trim() || 'gpt-4o';
        const headers = { "Content-Type": "application/json" };
        if (effectiveApiKey) headers["Authorization"] = `Bearer ${effectiveApiKey}`;

        const payload = {
          model: selectedModel,
          messages: [
            { role: "system", content: qPrompt },
            { role: "user", content: `--- FULL THESIS DOCUMENT TEXT ---\n${contextText}` }
          ],
          response_format: { type: "json_object" },
          temperature: 0.4
        };

        const res = await fetch(targetApiUrl, { method: "POST", headers, body: JSON.stringify(payload) });
        if (!res.ok) throw new Error(`OpenAI API error (${res.status})`);
        const data = await res.json();
        const parsed = JSON.parse(data?.choices?.[0]?.message?.content || '{}');
        newQuestions = parsed.vivaQuestions || [];
      }

      setAnalysis((prev) => (prev ? { ...prev, vivaQuestions: newQuestions } : prev));
    } catch (err) {
      console.error(err);
      setAnalysisError(`Failed to regenerate viva questions: ${err.message}`);
    } finally {
      setIsGeneratingQuestions(false);
    }
  };

  const copySingleQuestion = (qObj, idx) => {
    const text = `[${qObj.category}] ${qObj.question}\n(Context: ${qObj.thesisReference})`;
    navigator.clipboard.writeText(text);
    setCopiedQuestionIdx(idx);
    setTimeout(() => setCopiedQuestionIdx(null), 2000);
  };

  const filteredQuestions = useMemo(() => {
    const list = analysis?.vivaQuestions || [];
    if (questionFilter === 'All') return list;
    return list.filter((q) => q.category?.toLowerCase() === questionFilter.toLowerCase());
  }, [analysis, questionFilter]);

  const filteredCriteria = useMemo(() => {
    return RUBRIC_CRITERIA.filter(criterion => {
      const matchesCategory = categoryFilter === 'All' || criterion.category === categoryFilter;
      const matchesSearch = searchQuery === '' || 
        criterion.subCriteria.toLowerCase().includes(searchQuery.toLowerCase()) ||
        criterion.category.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [categoryFilter, searchQuery]);

  const copyFormattedFeedback = () => {
    let reportText = `ACADEMIC THESIS EVALUATION REPORT\n`;
    reportText += `Thesis Title: ${thesisTitle || 'N/A'}\n`;
    reportText += `Student Name: ${studentName || 'N/A'}\n`;
    reportText += `Student ID: ${studentId || 'N/A'}\n`;
    reportText += `Overall Score: ${totalMarksAndDetails.grandTotal} / 100\n`;
    reportText += `Classification: ${analysis?.overallGrade || 'N/A'}\n\n`;
    reportText += `EXECUTIVE SUMMARY:\n${analysis?.executiveSummary || ''}\n\n`;
    if (analysis?.projectObjective) {
      reportText += `PROJECT OBJECTIVE:\n${analysis.projectObjective}\n\n`;
    }
    if (analysis?.researchQuestions?.length > 0) {
      reportText += `RESEARCH QUESTIONS:\n`;
      analysis.researchQuestions.forEach((rq, idx) => {
        reportText += `${idx + 1}. ${rq}\n`;
      });
      reportText += `\n`;
    }
    reportText += `RUBRIC BREAKDOWN:\n`;

    RUBRIC_CRITERIA.forEach((c) => {
      const score = userScores[c.id] || 0;
      const evalObj = analysis?.criteriaEvaluations?.find(e => e.id === c.id) || {};
      reportText += `\n[${c.category}] ${c.subCriteria}\n`;
      reportText += `- Score: ${score}/5 (Marks: ${score * c.multiplier}/${c.maxCategoryMarks})\n`;
      reportText += `- Justification: ${userJustifications[c.id] || evalObj.justification || 'N/A'}\n`;
      if (evalObj.summaryExtract) {
        reportText += `- Evidence Extract: "${evalObj.summaryExtract}"\n`;
      }
    });

    if (analysis?.vivaQuestions?.length > 0) {
      reportText += `\nSUGGESTED VIVA / DEFENSE QUESTIONS:\n`;
      analysis.vivaQuestions.forEach((q, idx) => {
        reportText += `\n${idx + 1}. [${q.category}] ${q.question}\n`;
        reportText += `   - Thesis Reference: ${q.thesisReference}\n`;
        reportText += `   - What to Look For: ${q.whatToLookFor}\n`;
      });
    }

    navigator.clipboard.writeText(reportText);
    setCopiedSuccess(true);
    setTimeout(() => setCopiedSuccess(false), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      
      {/* HEADER BAR */}
      <header className="border-b border-slate-800 bg-slate-900/90 backdrop-blur sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-3.5 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-600/20 border border-indigo-500/30 rounded-xl text-indigo-400">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white tracking-wide">
                Thesis Rubric Automated Evaluator
              </h1>
              <p className="text-xs text-slate-400">
                Context-Aware Thesis Document Grading & Evaluation
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setShowHistoryModal(true)}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center gap-2 transition"
            >
              <History className="w-4 h-4 text-emerald-400" />
              <span>Previous Analyses</span>
              <span className="px-1.5 py-0.5 rounded-md bg-slate-900 text-emerald-400 font-bold text-[11px] border border-slate-700">
                {historyList.length}/{MAX_HISTORY_ITEMS}
              </span>
            </button>

            <button
              onClick={() => setShowApiKeyModal(true)}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center gap-2 transition"
            >
              <Settings className="w-4 h-4 text-indigo-400" />
              AI Model Config
            </button>
          </div>
        </div>
      </header>

      {/* PREVIOUS ANALYSES HISTORY MODAL */}
      {showHistoryModal && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setShowHistoryModal(false)}
        >
          <div
            className="bg-slate-900 border border-slate-700 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-4 animate-fadeIn"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <History className="w-5 h-5 text-emerald-400" />
                  Previous Thesis Analyses ({historyList.length} / {MAX_HISTORY_ITEMS})
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Saved locally in your browser (scores &amp; feedback only; PDF files are not stored).
                </p>
              </div>
              <button
                onClick={() => setShowHistoryModal(false)}
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            {historyList.length === 0 ? (
              <div className="py-10 text-center space-y-2 border border-dashed border-slate-800 rounded-xl bg-slate-950/40">
                <History className="w-8 h-8 text-slate-600 mx-auto" />
                <p className="text-sm font-semibold text-slate-300">No saved evaluations yet</p>
                <p className="text-xs text-slate-500">
                  Completed thesis evaluations will automatically appear here (up to 10 most recent).
                </p>
              </div>
            ) : (
              <div className="space-y-2.5 max-h-[60vh] overflow-y-auto pr-1">
                {historyList.map((item) => {
                  const isCurrent = item.id === activeHistoryId;
                  const formattedDate = new Date(item.timestamp).toLocaleString(undefined, {
                    dateStyle: 'medium',
                    timeStyle: 'short'
                  });
                  return (
                    <div
                      key={item.id}
                      onClick={() => loadHistoryEntry(item)}
                      className={`p-3.5 rounded-xl border transition cursor-pointer flex items-center justify-between gap-4 ${
                        isCurrent
                          ? 'bg-indigo-950/40 border-indigo-500/60'
                          : 'bg-slate-950/70 hover:bg-slate-800/70 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="min-w-0 flex-1 space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-bold text-white truncate">
                            {item.thesisTitle || item.fileName || 'Untitled Thesis'}
                          </span>
                          {isCurrent && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
                              Active
                            </span>
                          )}
                        </div>
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-400">
                          <span className="flex items-center gap-1">
                            <User className="w-3.5 h-3.5 text-indigo-400" />
                            {item.studentName || 'Unknown Student'}
                            {item.studentId ? ` (${item.studentId})` : ''}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-slate-500" />
                            {formattedDate}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 flex-shrink-0">
                        <div className="text-right">
                          <p className="text-sm font-extrabold text-emerald-400">
                            {item.grandTotal} <span className="text-xs text-slate-500">/ 100</span>
                          </p>
                          <p className="text-[11px] text-indigo-300 font-medium">
                            {item.overallGrade}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => deleteHistoryEntry(item.id, e)}
                          className="p-2 rounded-lg bg-slate-900 hover:bg-red-950/60 text-slate-400 hover:text-red-400 border border-slate-800 hover:border-red-500/30 transition"
                          title="Delete saved analysis"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="pt-2 flex items-center justify-between border-t border-slate-800">
              {historyList.length > 0 ? (
                <button
                  type="button"
                  onClick={clearAllHistory}
                  className="px-3.5 py-2 rounded-xl bg-red-950/40 hover:bg-red-900/50 text-red-300 border border-red-500/30 text-xs font-semibold flex items-center gap-1.5 transition"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Clear All History
                </button>
              ) : (
                <div />
              )}
              <button
                type="button"
                onClick={() => setShowHistoryModal(false)}
                className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AI MODEL CONFIG MODAL */}
      {showApiKeyModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5 animate-fadeIn">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Settings className="w-5 h-5 text-indigo-400" />
                AI Model Configuration
              </h3>
              <button
                onClick={() => setShowApiKeyModal(false)}
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                  Select Provider
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setAiProvider('gemini')}
                    className={`px-4 py-2.5 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-2 ${
                      aiProvider === 'gemini'
                        ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300'
                        : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Google Gemini
                  </button>
                  <button
                    type="button"
                    onClick={() => setAiProvider('openai')}
                    className={`px-4 py-2.5 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-2 ${
                      aiProvider === 'openai'
                        ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300'
                        : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    OpenAI Compatible
                  </button>
                </div>
              </div>

              {aiProvider === 'gemini' ? (
                <div className="space-y-3 pt-1">
                  <div>
                    <label className="block text-xs text-slate-400 mb-1 font-medium">
                      Gemini API Key
                    </label>
                    <input
                      type="password"
                      placeholder="AIzaSy..."
                      value={geminiApiKey}
                      onChange={(e) => setGeminiApiKey(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3.5 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1 font-medium">
                      Model Identifier
                    </label>
                    <input
                      type="text"
                      placeholder="gemini-3-flash-preview"
                      value={geminiModel}
                      onChange={(e) => setGeminiModel(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3.5 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                    />
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {[
                        { id: 'gemini-3-flash-preview', label: 'Gemini 3 Flash (Default)' },
                        { id: 'gemini-3.1-pro-preview', label: 'Gemini 3.1 Pro' },
                        { id: 'gemini-3.1-flash-lite-preview', label: 'Gemini 3.1 Flash-Lite' }
                      ].map((preset) => (
                        <button
                          key={preset.id}
                          type="button"
                          onClick={() => setGeminiModel(preset.id)}
                          className={`px-2 py-1 rounded-md text-[11px] font-medium border transition ${
                            geminiModel === preset.id
                              ? 'bg-indigo-600/30 border-indigo-500 text-indigo-200'
                              : 'bg-slate-800/80 border-slate-700 text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          {preset.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-3 pt-1">
                  <div>
                    <label className="block text-xs text-slate-400 mb-1 font-medium">
                      Base Endpoint URL
                    </label>
                    <input
                      type="text"
                      placeholder="https://api.openai.com/v1"
                      value={openaiBaseUrl}
                      onChange={(e) => setOpenaiBaseUrl(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3.5 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1 font-medium">
                      API Key
                    </label>
                    <input
                      type="password"
                      placeholder="sk-..."
                      value={openaiApiKey}
                      onChange={(e) => setOpenaiApiKey(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3.5 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1 font-medium">
                      Model Name
                    </label>
                    <input
                      type="text"
                      placeholder="gpt-4o"
                      value={openaiModel}
                      onChange={(e) => setOpenaiModel(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3.5 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>
              )}
            </div>

            <p className="text-[11px] text-slate-500">
              Configuration and API keys are saved locally in your browser&apos;s storage.
            </p>

            <div className="pt-2 flex items-center justify-between gap-3">
              {(geminiApiKey || openaiApiKey) ? (
                <button
                  type="button"
                  onClick={() => {
                    setGeminiApiKey('');
                    setOpenaiApiKey('');
                  }}
                  className="px-3.5 py-2 rounded-xl bg-red-950/40 hover:bg-red-900/50 text-red-300 border border-red-500/30 text-xs font-semibold transition"
                >
                  Clear Saved Keys
                </button>
              ) : (
                <div />
              )}
              <button
                onClick={() => setShowApiKeyModal(false)}
                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs"
              >
                Save Settings
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MAIN CONTENT AREA */}
      <main className="max-w-7xl mx-auto px-4 py-8 flex-1 space-y-8 w-full">
        
        {/* PDF UPLOAD SECTION */}
        <section className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
          <div className="mb-4">
            <h2 className="text-base font-bold text-white flex items-center gap-2 uppercase tracking-wider">
              <Upload className="w-5 h-5 text-indigo-400" />
              Upload Thesis PDF
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Select a complete thesis document in PDF format to initiate automated rubric grading.
            </p>
          </div>

          <div className="border-2 border-dashed border-slate-700 hover:border-indigo-500/60 rounded-xl p-8 text-center bg-slate-950/40 transition relative group">
            <input
              type="file"
              accept=".pdf,application/pdf"
              onChange={handleFileUpload}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            />
            <div className="flex flex-col items-center justify-center space-y-3 pointer-events-none">
              <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl text-indigo-400 group-hover:scale-110 transition">
                <FileText className="w-8 h-8" />
              </div>
              {fileName ? (
                <div>
                  <p className="text-sm font-bold text-emerald-400 flex items-center justify-center gap-2">
                    <CheckCircle2 className="w-4 h-4" /> {fileName}
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    {pageCount > 0 ? `${pageCount} pages parsed` : 'Processing pages...'}
                  </p>
                </div>
              ) : (
                <div>
                  <p className="text-sm font-semibold text-slate-200">
                    Click or drag & drop thesis PDF here
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    Accepts .pdf files containing thesis content
                  </p>
                </div>
              )}
            </div>
          </div>

          {isExtractingPdf && (
            <div className="mt-4 p-4 rounded-xl bg-indigo-950/40 border border-indigo-500/30 space-y-2">
              <div className="flex justify-between text-xs text-indigo-300 font-medium">
                <span className="flex items-center gap-2">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-indigo-400" />
                  Reading PDF Text...
                </span>
                <span>{pdfProgress}%</span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-indigo-500 h-full transition-all duration-300 rounded-full"
                  style={{ width: `${pdfProgress}%` }}
                ></div>
              </div>
            </div>
          )}

          <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-800">
            <div className="text-xs text-slate-400 flex items-center gap-2">
              <Info className="w-4 h-4 text-indigo-400 flex-shrink-0" />
              <span>
                Processes full thesis document context against standard 100-mark evaluation rubric.
              </span>
            </div>

            {hasIncompleteRun && !isAnalyzing && extractedText ? (
              <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
                <button
                  onClick={() => runThesisAnalysis(extractedText, { resume: true })}
                  className="flex-1 sm:flex-initial px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition shadow-lg bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/30 active:scale-95"
                >
                  <RefreshCw className="w-4 h-4 text-white" />
                  Resume ({analysis?.criteriaEvaluations?.length || 0}/{RUBRIC_CRITERIA.length} Done)
                </button>
                <button
                  onClick={() => runThesisAnalysis(extractedText, { resume: false })}
                  className="px-4 py-3 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700"
                >
                  Start Over
                </button>
              </div>
            ) : (
              <button
                onClick={() => runThesisAnalysis(extractedText)}
                disabled={isAnalyzing || !extractedText}
                className={`w-full sm:w-auto px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition shadow-lg ${
                  isAnalyzing || !extractedText
                    ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                    : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/30 active:scale-95'
                }`}
              >
                {isAnalyzing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-white" />
                    Evaluating ({analysisProgress.current}/{analysisProgress.total})...
                  </>
                ) : (
                  <>
                    <Award className="w-4 h-4 text-white" />
                    Evaluate Thesis & Generate Scorecard
                  </>
                )}
              </button>
            )}
          </div>

          {isAnalyzing && (
            <div className="mt-4 p-4 rounded-xl bg-indigo-950/40 border border-indigo-500/30 space-y-2">
              <div className="flex justify-between text-xs text-indigo-300 font-medium">
                <span className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-indigo-400 animate-pulse" />
                  {analysisProgress.statusText}
                </span>
                <span>{Math.round((analysisProgress.current / analysisProgress.total) * 100)}%</span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-gradient-to-r from-indigo-500 to-purple-500 h-full transition-all duration-300 rounded-full"
                  style={{ width: `${Math.round((analysisProgress.current / analysisProgress.total) * 100)}%` }}
                ></div>
              </div>
            </div>
          )}

          {analysisError && (
            <div className="mt-4 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-4 h-4 flex-shrink-0 text-red-400" />
                <span>{analysisError}</span>
              </div>
              {hasIncompleteRun && !isAnalyzing && extractedText && (
                <button
                  type="button"
                  onClick={() => runThesisAnalysis(extractedText, { resume: true })}
                  className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center gap-1.5 self-start sm:self-auto flex-shrink-0 transition"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Resume ({analysis?.criteriaEvaluations?.length || 0}/{RUBRIC_CRITERIA.length})
                </button>
              )}
            </div>
          )}
        </section>

        {/* RESULTS SECTION */}
        {analysis && (
          <div className="space-y-8 animate-fadeIn">
            
            <section className="bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950/40 border border-indigo-500/30 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>

              {/* STUDENT METADATA DISPLAY */}
              <div className="mb-6 p-4 bg-slate-950/80 rounded-xl border border-slate-800 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Document Metadata</span>
                  <span className="text-xs text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20 font-medium flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    Auto-extracted & Editable
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                  <div className="md:col-span-12 flex items-center gap-2.5">
                    <BookOpen className="w-4 h-4 text-indigo-400 flex-shrink-0" />
                    <span className="text-xs text-slate-400 font-medium whitespace-nowrap min-w-[90px]">Thesis Title:</span>
                    <input
                      type="text"
                      value={thesisTitle}
                      onChange={(e) => setThesisTitle(e.target.value)}
                      placeholder="Thesis Title"
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white font-semibold focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div className="md:col-span-6 flex items-center gap-2.5">
                    <User className="w-4 h-4 text-indigo-400 flex-shrink-0" />
                    <span className="text-xs text-slate-400 font-medium whitespace-nowrap min-w-[90px]">Student Name:</span>
                    <input
                      type="text"
                      value={studentName}
                      onChange={(e) => setStudentName(e.target.value)}
                      placeholder="Student Name"
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white font-semibold focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div className="md:col-span-6 flex items-center gap-2.5">
                    <Hash className="w-4 h-4 text-purple-400 flex-shrink-0" />
                    <span className="text-xs text-slate-400 font-medium whitespace-nowrap min-w-[90px]">Student ID:</span>
                    <input
                      type="text"
                      value={studentId}
                      onChange={(e) => setStudentId(e.target.value)}
                      placeholder="Student ID"
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white font-semibold focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
                
                <div className="flex flex-col items-center lg:items-start text-center lg:text-left border-b lg:border-b-0 lg:border-r border-slate-800 lg:pr-6 pb-6 lg:pb-0">
                  <span className="text-xs font-semibold text-indigo-400 tracking-wider uppercase mb-1">
                    Total Evaluated Score
                  </span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-5xl font-extrabold bg-gradient-to-r from-emerald-400 to-indigo-400 bg-clip-text text-transparent">
                      {totalMarksAndDetails.grandTotal}
                    </span>
                    <span className="text-xl text-slate-400 font-bold">/ 100</span>
                  </div>
                  <div className="mt-3 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-xs font-bold">
                    <Award className="w-4 h-4 text-indigo-400" />
                    Classification: {analysis.overallGrade}
                  </div>
                </div>

                <div className="lg:col-span-2 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                      <BarChart3 className="w-4 h-4 text-indigo-400" />
                      Executive Assessment Summary
                    </h3>
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={regenerateSummaryAndMetadata}
                        disabled={isRegeneratingSummary || (!extractedText && !analysis)}
                        title={extractedText ? 'Regenerate summary & metadata' : 'Regenerate summary & metadata from saved evaluation context'}
                        className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 transition flex items-center gap-1.5 disabled:opacity-40"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 text-indigo-400 ${isRegeneratingSummary ? 'animate-spin' : ''}`} />
                        <span>{isRegeneratingSummary ? 'Regenerating...' : 'Regenerate'}</span>
                      </button>
                      <button
                        onClick={copyFormattedFeedback}
                        className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 transition flex items-center gap-1.5"
                      >
                        {copiedSuccess ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                            Copied!
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5 text-slate-300" />
                            Copy Feedback
                          </>
                        )}
                      </button>
                      <button
                        onClick={handlePrint}
                        className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 transition flex items-center gap-1.5"
                      >
                        <Printer className="w-3.5 h-3.5 text-slate-300" />
                        Print / PDF
                      </button>
                    </div>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/60 p-3.5 rounded-xl border border-slate-800">
                    {analysis.executiveSummary}
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3.5 space-y-1.5">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-xs font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
                          <Target className="w-3.5 h-3.5" /> Project Objective
                        </p>
                        <button
                          type="button"
                          onClick={() => regenerateSummaryField('projectObjective')}
                          disabled={regeneratingSection.projectObjective || (!extractedText && !analysis)}
                          title={extractedText ? 'Regenerate project objective' : 'Regenerate project objective from saved evaluation context'}
                          className="p-1 rounded-md bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-indigo-300 border border-slate-800 transition disabled:opacity-40"
                        >
                          <RefreshCw className={`w-3.5 h-3.5 ${regeneratingSection.projectObjective ? 'animate-spin text-indigo-400' : ''}`} />
                        </button>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed">
                        {analysis.projectObjective && analysis.projectObjective !== 'Not Provided'
                          ? analysis.projectObjective
                          : 'Not explicitly stated in the thesis.'}
                      </p>
                    </div>

                    <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3.5 space-y-1.5">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-xs font-bold text-purple-400 uppercase tracking-wider flex items-center gap-1.5">
                          <HelpCircle className="w-3.5 h-3.5" /> Research Questions
                        </p>
                        <button
                          type="button"
                          onClick={() => regenerateSummaryField('researchQuestions')}
                          disabled={regeneratingSection.researchQuestions || (!extractedText && !analysis)}
                          title={extractedText ? 'Regenerate research questions' : 'Regenerate research questions from saved evaluation context'}
                          className="p-1 rounded-md bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-purple-300 border border-slate-800 transition disabled:opacity-40"
                        >
                          <RefreshCw className={`w-3.5 h-3.5 ${regeneratingSection.researchQuestions ? 'animate-spin text-purple-400' : ''}`} />
                        </button>
                      </div>
                      {analysis.researchQuestions && analysis.researchQuestions.length > 0 ? (
                        <ol className="text-xs text-slate-300 space-y-1 list-decimal list-inside leading-relaxed">
                          {analysis.researchQuestions.map((rq, idx) => (
                            <li key={idx}>{rq}</li>
                          ))}
                        </ol>
                      ) : (
                        <p className="text-xs text-slate-400">
                          No explicit research questions identified.
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                    <div
                      role="button"
                      tabIndex={0}
                      onClick={() =>
                        setInsightDialog({
                          type: 'strengths',
                          title: 'Key Strengths',
                          items: analysis.keyStrengths || []
                        })
                      }
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          setInsightDialog({
                            type: 'strengths',
                            title: 'Key Strengths',
                            items: analysis.keyStrengths || []
                          });
                        }
                      }}
                      className="bg-emerald-950/30 hover:bg-emerald-950/50 border border-emerald-500/20 hover:border-emerald-500/50 rounded-xl p-3 cursor-pointer transition group text-left"
                      title="Click to view full key strengths"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Key Strengths
                        </p>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              regenerateSummaryField('keyStrengths');
                            }}
                            disabled={regeneratingSection.keyStrengths || (!extractedText && !analysis)}
                            title={extractedText ? 'Regenerate key strengths' : 'Regenerate key strengths from saved evaluation context'}
                            className="p-1 rounded-md bg-emerald-950/70 hover:bg-emerald-900/70 text-emerald-300/80 hover:text-emerald-200 border border-emerald-500/20 transition disabled:opacity-40"
                          >
                            <RefreshCw className={`w-3.5 h-3.5 ${regeneratingSection.keyStrengths ? 'animate-spin text-emerald-300' : ''}`} />
                          </button>
                          <span className="text-[11px] text-emerald-300/70 group-hover:text-emerald-300 underline">
                            View full
                          </span>
                        </div>
                      </div>
                      <ul className="text-xs text-emerald-200/90 space-y-1 list-disc list-inside">
                        {analysis.keyStrengths?.map((str, idx) => (
                          <li key={idx} className="truncate">{str}</li>
                        ))}
                      </ul>
                    </div>

                    <div
                      role="button"
                      tabIndex={0}
                      onClick={() =>
                        setInsightDialog({
                          type: 'weaknesses',
                          title: 'Areas for Improvement',
                          items: analysis.keyWeaknesses || []
                        })
                      }
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          setInsightDialog({
                            type: 'weaknesses',
                            title: 'Areas for Improvement',
                            items: analysis.keyWeaknesses || []
                          });
                        }
                      }}
                      className="bg-amber-950/30 hover:bg-amber-950/50 border border-amber-500/20 hover:border-amber-500/50 rounded-xl p-3 cursor-pointer transition group text-left"
                      title="Click to view full areas for improvement"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1">
                          <AlertTriangle className="w-3.5 h-3.5" /> Areas for Improvement
                        </p>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              regenerateSummaryField('keyWeaknesses');
                            }}
                            disabled={regeneratingSection.keyWeaknesses || (!extractedText && !analysis)}
                            title={extractedText ? 'Regenerate areas for improvement' : 'Regenerate areas for improvement from saved evaluation context'}
                            className="p-1 rounded-md bg-amber-950/70 hover:bg-amber-900/70 text-amber-300/80 hover:text-amber-200 border border-amber-500/20 transition disabled:opacity-40"
                          >
                            <RefreshCw className={`w-3.5 h-3.5 ${regeneratingSection.keyWeaknesses ? 'animate-spin text-amber-300' : ''}`} />
                          </button>
                          <span className="text-[11px] text-amber-300/70 group-hover:text-amber-300 underline">
                            View full
                          </span>
                        </div>
                      </div>
                      <ul className="text-xs text-amber-200/90 space-y-1 list-disc list-inside">
                        {analysis.keyWeaknesses?.map((wk, idx) => (
                          <li key={idx} className="truncate">{wk}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

              </div>
            </section>

            {/* INSIGHT FULL DETAILS DIALOG */}
            {insightDialog && (
              <div
                className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                onClick={() => setInsightDialog(null)}
              >
                <div
                  className={`bg-slate-900 border rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-4 animate-fadeIn ${
                    insightDialog.type === 'strengths'
                      ? 'border-emerald-500/40'
                      : 'border-amber-500/40'
                  }`}
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <h3
                      className={`text-base font-bold flex items-center gap-2 ${
                        insightDialog.type === 'strengths'
                          ? 'text-emerald-400'
                          : 'text-amber-400'
                      }`}
                    >
                      {insightDialog.type === 'strengths' ? (
                        <CheckCircle2 className="w-5 h-5" />
                      ) : (
                        <AlertTriangle className="w-5 h-5" />
                      )}
                      {insightDialog.title}
                    </h3>
                    <button
                      onClick={() => setInsightDialog(null)}
                      className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition"
                      aria-label="Close dialog"
                    >
                      ✕
                    </button>
                  </div>

                  {insightDialog.items && insightDialog.items.length > 0 ? (
                    <ul className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
                      {insightDialog.items.map((item, idx) => (
                        <li
                          key={idx}
                          className={`p-3.5 rounded-xl border text-sm leading-relaxed flex items-start gap-3 ${
                            insightDialog.type === 'strengths'
                              ? 'bg-emerald-950/30 border-emerald-500/20 text-emerald-100'
                              : 'bg-amber-950/30 border-amber-500/20 text-amber-100'
                          }`}
                        >
                          <span
                            className={`font-bold text-xs px-2 py-0.5 rounded-md mt-0.5 ${
                              insightDialog.type === 'strengths'
                                ? 'bg-emerald-500/20 text-emerald-300'
                                : 'bg-amber-500/20 text-amber-300'
                            }`}
                          >
                            {idx + 1}
                          </span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-slate-400">No items available.</p>
                  )}

                  <div className="pt-2 flex justify-end border-t border-slate-800">
                    <button
                      type="button"
                      onClick={() => setInsightDialog(null)}
                      className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs transition"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* SUGGESTED VIVA & DEFENSE QUESTIONS WIDGET */}
            <section className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-indigo-400" />
                    Suggested Viva &amp; Defense Questions
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Targeted questions to probe student comprehension, detect unverified AI delegation, and clarify vague sections.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {[
                    { id: 'All', label: 'All' },
                    { id: 'Understanding', label: 'Test Understanding' },
                    { id: 'AI Verification', label: 'AI Check' },
                    { id: 'Clarification', label: 'Clarify Points' }
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setQuestionFilter(tab.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${
                        questionFilter === tab.id
                          ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}

                  <button
                    type="button"
                    onClick={regenerateVivaQuestions}
                    disabled={isGeneratingQuestions || (!extractedText && !analysis)}
                    title={extractedText ? 'Generate fresh defense questions' : 'Generate defense questions from saved evaluation context'}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition disabled:opacity-40"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 text-indigo-400 ${isGeneratingQuestions ? 'animate-spin' : ''}`} />
                    <span>{isGeneratingQuestions ? 'Generating...' : 'Regenerate'}</span>
                  </button>
                </div>
              </div>

              {filteredQuestions.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredQuestions.map((qItem, idx) => {
                    const isAiCheck = qItem.category?.toLowerCase().includes('ai');
                    const isClarify = qItem.category?.toLowerCase().includes('clarif');

                    const badgeStyle = isAiCheck
                      ? 'bg-rose-500/15 text-rose-300 border-rose-500/30'
                      : isClarify
                      ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                      : 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30';

                    const CategoryIcon = isAiCheck
                      ? ShieldAlert
                      : isClarify
                      ? HelpCircle
                      : Sparkles;

                    return (
                      <div
                        key={idx}
                        className="bg-slate-950/80 border border-slate-800 hover:border-slate-700 rounded-xl p-4 flex flex-col justify-between gap-3 transition"
                      >
                        <div className="space-y-2.5">
                          <div className="flex items-center justify-between gap-2">
                            <span
                              className={`px-2.5 py-0.5 rounded-md text-[11px] font-bold uppercase tracking-wider border inline-flex items-center gap-1.5 ${badgeStyle}`}
                            >
                              <CategoryIcon className="w-3.5 h-3.5" />
                              {qItem.category}
                            </span>

                            <button
                              type="button"
                              onClick={() => copySingleQuestion(qItem, idx)}
                              className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 transition"
                              title="Copy question"
                            >
                              {copiedQuestionIdx === idx ? (
                                <Check className="w-3.5 h-3.5 text-emerald-400" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </div>

                          <p className="text-sm font-semibold text-white leading-snug">
                            "{qItem.question}"
                          </p>
                        </div>

                        <div className="space-y-2 pt-2 border-t border-slate-800/80 text-xs">
                          <div className="text-slate-400">
                            <span className="font-semibold text-slate-300">Thesis Context: </span>
                            <span>{qItem.thesisReference}</span>
                          </div>
                          <div className="bg-slate-900/90 p-2.5 rounded-lg border border-slate-800/80 text-slate-300">
                            <span className="font-semibold text-indigo-300">Evaluator Cue: </span>
                            <span>{qItem.whatToLookFor}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="py-8 text-center border border-dashed border-slate-800 rounded-xl bg-slate-950/40 space-y-2">
                  <MessageSquare className="w-7 h-7 text-slate-600 mx-auto" />
                  <p className="text-xs text-slate-400">
                    {extractedText
                      ? 'No questions in this filter. Click "Regenerate" to generate defense questions for this thesis.'
                      : 'No defense questions saved for this evaluation.'}
                  </p>
                </div>
              )}
            </section>

            {/* CATEGORY BREAKDOWN */}
            <section className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                Category Weighted Score Breakdown
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(totalMarksAndDetails.categoryTotals).map(([catName, stats]) => {
                  const percentage = Math.round((stats.earned / stats.max) * 100);
                  return (
                    <div key={catName} className="bg-slate-950/80 border border-slate-800 p-3.5 rounded-xl space-y-2">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-semibold text-slate-200">{catName}</span>
                        <span className="font-bold text-indigo-400">{stats.earned} / {stats.max} pts</span>
                      </div>
                      <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            percentage >= 80 ? 'bg-emerald-500' :
                            percentage >= 60 ? 'bg-indigo-500' :
                            percentage >= 40 ? 'bg-amber-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                      <div className="flex justify-between text-[11px] text-slate-400">
                        <span>Achieved: {percentage}%</span>
                        <span>Weight: {stats.max} marks</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* DETAILED SCORECARD & CITATIONS */}
            <section className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
              
              <div className="flex flex-col md:flex-row items-center justify-between gap-4 border-b border-slate-800 pb-4">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-indigo-400" />
                    Detailed Rubric Scorecard & Citations
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Adjust score sliders below to override ratings or click refresh to re-evaluate individual items.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="All">All Categories (11)</option>
                    <option value="Abstract">Abstract (10 marks)</option>
                    <option value="Introduction">Introduction (10 marks)</option>
                    <option value="Literature Review">Literature Review (10 marks)</option>
                    <option value="Research Methodology">Research Methodology (5 marks)</option>
                    <option value="Result and Discussion">Result and Discussion (40 marks)</option>
                    <option value="Conclusion & Recommendation">Conclusion & Recommendation (10 marks)</option>
                    <option value="Organisation and Clarity">Organisation & Clarity (15 marks)</option>
                  </select>

                  <div className="relative flex-1 md:w-48">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      placeholder="Search rubric..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                {filteredCriteria.map((criterion) => {
                  const evalItem = analysis.criteriaEvaluations.find(e => e.id === criterion.id) || {};
                  const currentScore = userScores[criterion.id] ?? evalItem.score ?? 3;
                  const itemMarks = currentScore * criterion.multiplier;
                  const maxMarks = 5 * criterion.multiplier;
                  const isExpanded = expandedItems[criterion.id];

                  return (
                    <div
                      key={criterion.id}
                      className="bg-slate-950/80 border border-slate-800 rounded-xl overflow-hidden hover:border-slate-700 transition"
                    >
                      <div className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                              {criterion.category}
                            </span>
                            <span className="text-[11px] text-slate-400 font-mono">
                              Multiplier: x{criterion.multiplier}
                            </span>
                          </div>
                          <h4 className="text-sm font-bold text-white">
                            {criterion.subCriteria}
                          </h4>
                        </div>

                        <div className="flex items-center gap-5 border-t md:border-t-0 border-slate-800 pt-3 md:pt-0">
                          
                          <div className="flex flex-col items-center sm:items-end">
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-slate-400 font-medium">Rating:</span>
                              <input
                                type="range"
                                min="1"
                                max="5"
                                step="1"
                                value={currentScore}
                                onChange={(e) => handleScoreChange(criterion.id, e.target.value)}
                                className="w-24 accent-indigo-500 cursor-pointer"
                              />
                              <span className="text-xs font-bold text-white w-4 text-center">
                                {currentScore}
                              </span>
                            </div>
                            <span className="text-[11px] text-indigo-400 font-semibold mt-0.5">
                              {currentScore === 1 ? 'Very Weak (1)' :
                               currentScore === 2 ? 'Weak (2)' :
                               currentScore === 3 ? 'Fair (3)' :
                               currentScore === 4 ? 'Good (4)' : 'Very Good (5)'}
                            </span>
                          </div>

                          <div className="text-right min-w-[70px]">
                            <p className="text-[11px] text-slate-400 font-medium">Marks</p>
                            <p className="text-base font-extrabold text-emerald-400">
                              {itemMarks} <span className="text-[11px] text-slate-500">/ {maxMarks}</span>
                            </p>
                          </div>

                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => recomputeCriterionScore(criterion.id)}
                              disabled={reevaluatingItems[criterion.id] || (!extractedText && !analysis)}
                              className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-indigo-400 transition disabled:opacity-40"
                              title={extractedText ? "Recompute AI score for this item" : "Recompute AI score from saved evaluation context"}
                            >
                              <RefreshCw className={`w-4 h-4 ${reevaluatingItems[criterion.id] ? 'animate-spin text-indigo-400' : ''}`} />
                            </button>

                            <button
                              onClick={() => toggleExpand(criterion.id)}
                              className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 transition"
                              title="View Justification & Excerpts"
                            >
                              {isExpanded ? (
                                <ChevronUp className="w-4 h-4" />
                              ) : (
                                <ChevronDown className="w-4 h-4" />
                              )}
                            </button>
                          </div>

                        </div>
                      </div>

                      <div className="px-4 py-2 bg-slate-900/60 border-t border-slate-800/80 text-xs text-slate-300 flex items-start gap-2">
                        <Info className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0 mt-0.5" />
                        <div>
                          <span className="font-semibold text-slate-200">Rubric Descriptor for Level {currentScore}: </span>
                          <span>{criterion.descriptors[currentScore]}</span>
                        </div>
                      </div>

                      {isExpanded && (
                        <div className="p-4 bg-slate-900/90 border-t border-slate-800 space-y-3.5 text-xs animate-fadeIn">
                          
                          <div className="space-y-1">
                            <p className="font-bold text-indigo-300 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                              <Edit3 className="w-3.5 h-3.5 text-indigo-400" /> Evaluation Justification
                            </p>
                            <p className="text-slate-300 leading-relaxed bg-slate-950 p-3 rounded-lg border border-slate-800">
                              {evalItem.justification || "No justification provided."}
                            </p>
                          </div>

                          <div className="space-y-1">
                            <p className="font-bold text-emerald-400 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                              <BookOpen className="w-3.5 h-3.5 text-emerald-400" /> Evidence Excerpt / Thesis Quote
                            </p>
                            <blockquote className="text-slate-300 italic leading-relaxed bg-slate-950/80 p-3 rounded-lg border-l-2 border-emerald-500 font-mono text-xs">
                              "{evalItem.summaryExtract || "No direct text excerpt identified."}"
                            </blockquote>
                          </div>

                          <div className="space-y-1">
                            <p className="font-bold text-amber-400 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                              <AlertTriangle className="w-3.5 h-3.5 text-amber-400" /> Actionable Recommendation for Author
                            </p>
                            <p className="text-amber-200/90 leading-relaxed bg-amber-950/20 p-3 rounded-lg border border-amber-500/20">
                              {evalItem.improvementTip || "Maintain current standard."}
                            </p>
                          </div>

                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>

          </div>
        )}

      </main>

      {/* FOOTER */}
      <footer className="bg-slate-900 border-t border-slate-800 py-4 text-center text-xs text-slate-500 mt-auto">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>Thesis Rubric Automated Analysis Platform &copy; {new Date().getFullYear()}</p>
          <p className="text-[11px] text-slate-600">
            Adheres strictly to the 100-mark weighted academic evaluation rubric
          </p>
        </div>
      </footer>

    </div>
  );
}