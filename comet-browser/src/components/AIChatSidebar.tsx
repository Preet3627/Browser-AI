"use client";

import React, { useState, useRef, useEffect, useCallback, memo } from 'react';
import { ChatMessage, LLMProviderOptions } from "@/lib/llm/providers/base";
import LLMProviderSettings from './LLMProviderSettings';
import { motion, AnimatePresence } from 'framer-motion';
import { User } from "firebase/auth";
import firebaseService from '@/lib/FirebaseService';
import ThinkingIndicator from './ThinkingIndicator';
import { useAppStore } from '@/store/useAppStore';
import {
  Maximize2, Minimize2, FileText, Download,
  Wifi, WifiOff, X,
  ChevronLeft, ChevronRight, ChevronDown, Zap, Send,
  Plus,
  RotateCw, CopyIcon, Check, Paperclip, Share2,
  FolderOpen, ScanLine,
  MoreVertical,
  Sparkles,
  Image as ImageIcon,
} from 'lucide-react';
import { offlineChatbot } from '@/lib/OfflineChatbot';
import { Security } from '@/lib/Security';
import { BrowserAI } from '@/lib/BrowserAI';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import dracula from 'react-syntax-highlighter/dist/cjs/styles/prism/dracula';
import Tesseract from 'tesseract.js';
import { useRouter } from 'next/navigation';
import { AICommandQueue, AICommand } from './AICommandQueue';
import { prepareCommandsForExecution } from '@/lib/AICommandParser';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const delay = (ms: number) => new Promise<void>((res) => setTimeout(res, ms));

const SYSTEM_INSTRUCTIONS = `
You are the Comet AI Agent, the core intelligence of the Comet Browser.
You have AGENCY and can control the browser via ACTION COMMANDS.

ACTION COMMANDS:
- [NAVIGATE: url] : Goes to a specific URL.
- [SEARCH: query] : Searches using the user's default engine.
- [SET_THEME: dark|light|system] : Changes the UI theme.
- [OPEN_VIEW: browser|workspace|webstore|pdf|media|coding] : Switches the active app view.
- [RELOAD] : Reloads the active tab.
- [GO_BACK] : Navigates back.
- [GO_FORWARD] : Navigates forward.
- [SCREENSHOT_AND_ANALYZE] : Takes a screenshot of the current browser view, performs OCR, and analyzes the content visually.
- [WEB_SEARCH: query] : Performs a real-time web search.
- [READ_PAGE_CONTENT] : Reads the full text content of the current active browser tab.
- [LIST_OPEN_TABS] : Lists all currently open browser tabs.
- [GENERATE_PDF: title | content] : Generates and downloads a PDF with specified title and content.
- [GENERATE_DIAGRAM: mermaid_code] : Generates a visual diagram using Mermaid.js syntax.
- [SHELL_COMMAND: command] : Executes a shell command and returns the output.
- [SET_BRIGHTNESS: percentage] : Sets the operating system's screen brightness (0-100%).
- [SET_VOLUME: percentage] : Sets the operating system's audio volume (0-100%).
- [OPEN_APP: app_name_or_path] : Opens an external application installed on the operating system.
- [FILL_FORM: selector | value] : Fills a form field identified by a CSS selector with the specified value.
- [SCROLL_TO: selector | position] : Scrolls the browser view to a specific element or position ('top', 'bottom').
- [EXTRACT_DATA: selector] : Extracts text content from an element identified by a CSS selector.
- [CREATE_NEW_TAB_GROUP: name | urls] : Creates a new group of tabs.
- [OCR_COORDINATES: x,y,width,height] : Performs OCR on specific pixel coordinates.
- [OCR_SCREEN: x,y,width,height] : Performs OCR on a specific screen region.
- [CLICK_ELEMENT: selector] : Clicks on a browser element using CSS selector or tab ID.
- [FIND_AND_CLICK: text] : Captures the screen, runs OCR, finds visible text, and clicks it.
- [GMAIL_AUTHORIZE] : Authorizes Gmail API access.
- [GMAIL_LIST_MESSAGES: query | maxResults] : Lists Gmail messages.
- [GMAIL_GET_MESSAGE: messageId] : Gets a specific Gmail message.
- [GMAIL_SEND_MESSAGE: to | subject | body | threadId] : Sends a Gmail message.
- [GMAIL_ADD_LABEL: messageId | labelName] : Adds a label to a Gmail message.
- [WAIT: duration_ms] : Pauses AI execution for a specified duration in milliseconds.
- [GUIDE_CLICK: description | x,y,width,height] : Provides guidance for the user to click a specific area.
- [OPEN_PRESENTON: prompt] : Opens the Presentation view and starts a project with the given prompt.
- [EXPLAIN_CAPABILITIES] : Provides a detailed explanation of AI capabilities.

CHAINED EXECUTION:
You can provide MULTIPLE commands in a single response for multi-step tasks.
Example: "[NAVIGATE: https://google.com] [SEARCH: AI news] [OPEN_VIEW: browser]"

FORMATTING & STYLE:
- Use Markdown TABLES for all data comparison, feature lists, or structured information.
- Use **BOLD** and *ITALIC* for emphasis and clear hierarchy.
- Use EMOJIS (integrated naturally) to make the conversation engaging and futuristic 🚀.
- Be concise but extremely helpful and proactive.

COGNITIVE CAPABILITIES:
- HYBRID RAG: You have access to Local Memory (History) AND Online Search Results.
- VISION: You can see the page via [SCREENSHOT_AND_ANALYZE].
- AUTOMATION: You can help manage passwords and settings.

Always combine your local knowledge with online search for the most accurate and updated answers.
`.trim();

const LANGUAGE_MAP: Record<string, string> = {
  hi: 'Hindi', bn: 'Bengali', te: 'Telugu', mr: 'Marathi', ta: 'Tamil',
  gu: 'Gujarati', ur: 'Urdu', kn: 'Kannada', or: 'Odia', ml: 'Malayalam',
  pa: 'Punjabi', as: 'Assamese', mai: 'Maithili', sat: 'Santali', ks: 'Kashmiri',
  ne: 'Nepali', kok: 'Konkani', sd: 'Sindhi', doi: 'Dogri', mni: 'Manipuri',
  sa: 'Sanskrit', brx: 'Bodo',
};

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface Attachment {
  type: 'image' | 'pdf';
  data: string;
  ocrText?: string;
  filename: string;
}

interface Conversation {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: number;
  updatedAt: number;
}

type ExtendedChatMessage = ChatMessage & { attachments?: string[] };

// ---------------------------------------------------------------------------
// Helpers – localStorage (safe wrappers)
// ---------------------------------------------------------------------------

function lsGet<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function lsSet(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Silently ignore (private browsing / quota exceeded)
  }
}

function lsRemove(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch {
    // noop
  }
}

// ---------------------------------------------------------------------------
// Sub-components (module-level to avoid re-mount on each render)
// ---------------------------------------------------------------------------

interface MessageActionsProps {
  content: string;
  index: number;
  copiedIndex: number | null;
  onCopy: (content: string, index: number) => void;
  onShare: (content: string) => void;
}

const MessageActions = memo(function MessageActions({
  content,
  index,
  copiedIndex,
  onCopy,
  onShare,
}: MessageActionsProps) {
  const isCopied = copiedIndex === index;
  return (
    <div className="flex gap-1.5 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
      <button
        onClick={() => onCopy(content, index)}
        className="p-1.5 rounded-lg hover:bg-white/10 transition-colors text-white/60 hover:text-white"
        title={isCopied ? 'Copied!' : 'Copy message'}
      >
        {isCopied ? <Check size={14} /> : <CopyIcon size={14} />}
      </button>
      <button
        onClick={() => onShare(content)}
        className="p-1.5 rounded-lg hover:bg-white/10 transition-colors text-white/60 hover:text-white"
        title="Share message"
      >
        <Share2 size={14} />
      </button>
    </div>
  );
});

interface ConversationHistoryPanelProps {
  show: boolean;
  conversations: Conversation[];
  activeId: string | null;
  onClose: () => void;
  onLoad: (id: string) => void;
  onDelete: (id: string) => void;
  onNew: () => void;
}

const ConversationHistoryPanel = memo(function ConversationHistoryPanel({
  show,
  conversations,
  activeId,
  onClose,
  onLoad,
  onDelete,
  onNew,
}: ConversationHistoryPanelProps) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ x: -300, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -300, opacity: 0 }}
          className="absolute left-0 top-0 bottom-0 w-64 bg-deep-space border-r border-white/10 z-50 overflow-y-auto modern-scrollbar backdrop-blur-xl"
        >
          <div className="p-4 border-b border-white/10 flex items-center justify-between">
            <h3 className="text-sm font-bold text-white">Chat History</h3>
            <button onClick={onClose} className="text-white/60 hover:text-white">
              <X size={16} />
            </button>
          </div>
          <div className="p-2 space-y-1">
            <button
              onClick={onNew}
              className="w-full p-3 mb-2 rounded-lg bg-sky-500/20 hover:bg-sky-500/30 transition-colors text-sm font-medium flex items-center gap-2 text-sky-400"
            >
              <Plus size={16} />
              New Chat
            </button>
            {conversations.map((conv) => (
              <div
                key={conv.id}
                className={`flex items-center rounded-lg p-2 transition-colors group ${
                  activeId === conv.id ? 'bg-white/10' : 'hover:bg-white/5'
                }`}
              >
                <div
                  onClick={() => onLoad(conv.id)}
                  className="flex-1 cursor-pointer min-w-0"
                >
                  <div className="text-xs font-medium text-white truncate">{conv.title}</div>
                  <div className="text-[10px] text-white/40 mt-1">
                    {new Date(conv.updatedAt).toLocaleDateString()}
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(conv.id);
                  }}
                  className="p-1.5 opacity-0 group-hover:opacity-100 hover:bg-red-500/20 rounded transition-all text-white/40 hover:text-red-400"
                >
                  <X size={12} />
                </button>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
});

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface AIChatSidebarProps {
  studentMode: boolean;
  toggleStudentMode: () => void;
  isCollapsed: boolean;
  toggleCollapse: () => void;
  selectedEngine: string;
  setSelectedEngine: (engine: string) => void;
  theme: 'dark' | 'light' | 'system';
  setTheme: (theme: 'dark' | 'light' | 'system') => void;
  backgroundImage: string;
  setBackgroundImage: (imageUrl: string) => void;
  backend: 'firebase' | 'mysql';
  setBackend: (backend: 'firebase' | 'mysql') => void;
  mysqlConfig: any;
  setMysqlConfig: (config: any) => void;
  side?: 'left' | 'right';
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

const AIChatSidebar: React.FC<AIChatSidebarProps> = (props) => {
  const router = useRouter();
  const store = useAppStore();

  // Core state
  const [messages, setMessages] = useState<ExtendedChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [isDragOver, setIsDragOver] = useState(false);

  // Command queue
  const [commandQueue, setCommandQueue] = useState<AICommand[]>([]);
  const [currentCommandIndex, setCurrentCommandIndex] = useState(0);
  const processingQueueRef = useRef(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const tesseractWorkerRef = useRef<Tesseract.Worker | null>(null);

  // RAG / reading
  const [ragContextItems, setRagContextItems] = useState<any[]>([]);
  const [showRagPanel, setShowRagPanel] = useState(false);
  const [isReadingPage, setIsReadingPage] = useState(false);
  const [permissionPending, setPermissionPending] = useState<{ resolve: (val: boolean) => void } | null>(null);

  // UI toggles
  const [showSettings, setShowSettings] = useState(false);
  const [showLLMProviderSettings, setShowLLMProviderSettings] = useState(false);
  const [showActionsMenu, setShowActionsMenu] = useState(false);
  const [showConversationHistory, setShowConversationHistory] = useState(false);

  // Misc
  const [groqSpeed, setGroqSpeed] = useState<string | null>(null);
  const [ollamaModels, setOllamaModels] = useState<{ name: string; modified_at: string }[]>([]);
  const [isMermaidLoaded, setIsMermaidLoaded] = useState(false);
  const [copiedMessageIndex, setCopiedMessageIndex] = useState<number | null>(null);

  // Attachments
  const [attachments, setAttachments] = useState<Attachment[]>([]);

  // Conversations
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);

  // ---------------------------------------------------------------------------
  // Effects
  // ---------------------------------------------------------------------------

  // Load mermaid
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/mermaid/dist/mermaid.min.js';
    script.async = true;
    script.onload = () => {
      const mermaid = (window as any).mermaid;
      if (mermaid) {
        mermaid.initialize({ startOnLoad: false, theme: 'dark', securityLevel: 'loose', fontFamily: 'inherit' });
        setIsMermaidLoaded(true);
        setTimeout(() => mermaid.run(), 500);
      }
    };
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  // Scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Tesseract worker – fixed memory leak: track cancellation
  useEffect(() => {
    let cancelled = false;
    let worker: Tesseract.Worker | null = null;

    const init = async () => {
      try {
        worker = await Tesseract.createWorker('eng', 1, {
          workerPath: 'https://cdn.jsdelivr.net/npm/tesseract.js@v5.0.0/dist/worker.min.js',
          langPath: 'https://tessdata.projectnaptha.com/4.0.0',
          corePath: 'https://cdn.jsdelivr.net/npm/tesseract.js-core@v5.0.0/tesseract-core.wasm.js',
          logger: (m) => console.log('[Tesseract]', m),
        });
        if (cancelled) {
          worker.terminate();
        } else {
          tesseractWorkerRef.current = worker;
        }
      } catch (err) {
        console.error('Failed to initialize Tesseract worker:', err);
      }
    };

    init();

    return () => {
      cancelled = true;
      tesseractWorkerRef.current?.terminate();
      tesseractWorkerRef.current = null;
    };
  }, []);

  // Auth state
  useEffect(() => {
    const unsubscribe = firebaseService.onAuthStateChanged((user: User | null) => {
      if (window.electronAPI) {
        window.electronAPI.setUserId(user ? user.uid : null);
      }
    });
    return () => unsubscribe();
  }, []);

  // Online/offline detection
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Load conversation list on mount
  useEffect(() => {
    setConversations(lsGet<Conversation[]>('conversations_list', []));
  }, []);

  // AI provider initialisation
  useEffect(() => {
    const initAI = async () => {
      if (!window.electronAPI || !store.aiProvider) return;

      await window.electronAPI.setActiveLLMProvider(store.aiProvider);
      let config: LLMProviderOptions = {};

      if (store.aiProvider === 'local-tfjs') {
        config = { type: 'local-tfjs' };
      } else if (store.aiProvider === 'ollama') {
        config = { baseUrl: store.ollamaBaseUrl, model: store.ollamaModel };
        const { models, error } = await window.electronAPI.ollamaListModels();
        if (models) setOllamaModels(models);
        else if (error) console.error('Ollama list models error:', error);
      } else if (store.aiProvider === 'openai-compatible') {
        config = { apiKey: store.openaiApiKey, baseUrl: store.localLLMBaseUrl, model: store.localLLMModel };
      } else if (store.aiProvider.startsWith('gemini')) {
        config = { apiKey: store.geminiApiKey, model: store.localLLMModel || 'gemini-2.5-flash-preview' };
      } else if (store.aiProvider === 'claude' || store.aiProvider === 'anthropic' || store.aiProvider.startsWith('claude')) {
        config = { apiKey: store.anthropicApiKey, model: store.localLLMModel || 'claude-sonnet-4-6' };
      } else if (store.aiProvider === 'groq') {
        config = { apiKey: store.groqApiKey, model: store.localLLMModel || 'llama-3.3-70b-versatile' };
      }

      await window.electronAPI.configureLLMProvider(store.aiProvider, config);
    };

    initAI();
  }, [
    store.aiProvider,
    store.ollamaBaseUrl,
    store.ollamaModel,
    store.openaiApiKey,
    store.localLLMBaseUrl,
    store.localLLMModel,
    store.geminiApiKey,
    store.anthropicApiKey,
    store.groqApiKey,
  ]);

  // ---------------------------------------------------------------------------
  // Core send handler (memoized to avoid stale closures in effects)
  // ---------------------------------------------------------------------------

  const handleSendMessage = useCallback(
    async (customContent?: string) => {
      const contentToUse = (customContent ?? inputMessage).trim();
      if (!contentToUse && attachments.length === 0) return;

      const { content: protectedContent, wasProtected } = Security.fortress(contentToUse);

      const userMessage: ExtendedChatMessage = {
        role: 'user',
        content:
          protectedContent + (attachments.length > 0 ? `\n[Attached ${attachments.length} files]` : ''),
        attachments: attachments.map((a) => a.data),
      };

      if (wasProtected) {
        setMessages((prev) => [
          ...prev,
          { role: 'model', content: '🛡️ **AI Fortress Active**: Sensitive data protected.' },
        ]);
      }

      setMessages((prev) => [...prev, userMessage]);

      if (!customContent) {
        setInputMessage('');
        setAttachments([]);
      }

      setIsLoading(true);
      setError(null);

      if (!store.hasSeenAiMistakeWarning && messages.length === 0) {
        store.setShowAiMistakeWarning(true);
      }

      // Shortcut: EXPLAIN_CAPABILITIES typed directly
      if (
        protectedContent.toUpperCase().includes('[EXPLAIN-CAPABILITIES]') ||
        protectedContent.toUpperCase().includes('[EXPLAIN_CAPABILITIES]')
      ) {
        const fakeCmd: AICommand = {
          id: `cmd-${Date.now()}-explain`,
          type: 'EXPLAIN_CAPABILITIES',
          value: '',
          status: 'pending',
          timestamp: Date.now(),
        };
        setCommandQueue([fakeCmd]);
        setCurrentCommandIndex(0);
        processingQueueRef.current = true;
        processCommandQueue([fakeCmd]);
        setIsLoading(false);
        return;
      }

      try {
        if (!window.electronAPI) {
          setError('AI Engine not connected. Use the Comet Desktop App for full AI features.');
          return;
        }

        // RAG context
        const contextItems = await BrowserAI.retrieveContext(contentToUse);
        setRagContextItems(contextItems);
        if (contextItems.length > 0) setShowRagPanel(true);

        // Dynamic page scraping
        let pageContext = '';
        const readKeywords = ['this page', 'summarize', 'explain', 'analyze', 'read'];
        if (readKeywords.some((k) => contentToUse.toLowerCase().includes(k))) {
          let shouldRead = !store.askForAiPermission;
          if (store.askForAiPermission) {
            const permission = await new Promise<boolean>((resolve) => {
              setPermissionPending({ resolve });
            });
            shouldRead = permission;
          }
          if (shouldRead) {
            setIsReadingPage(true);
            const extraction = await window.electronAPI.extractPageContent();
            pageContext = (extraction.content || '').substring(0, 5000);
            if (extraction.content && extraction.content.length > 5000) pageContext += '...';
            setTimeout(() => setIsReadingPage(false), 2000);
          }
        }

        // Web search RAG
        let webSearchContext = '';
        const searchKeywords = [
          'latest', 'current', 'today', '2025', '2026', 'news', 'price',
          'status', 'who is', 'what happened', '?',
        ];
        if (searchKeywords.some((k) => contentToUse.toLowerCase().includes(k))) {
          try {
            const searchResults = await window.electronAPI.webSearchRag(contentToUse);
            if (searchResults?.length) {
              webSearchContext = searchResults
                .map((s: string, i: number) => `[Web Result ${i + 1}]: ${s}`)
                .join('\n');
            }
          } catch (e) {
            console.error('Web Search RAG failed:', e);
          }
        }

        const ragContextText = contextItems
          .map((c) => `[Relevance: ${c.score.toFixed(2)}] ${c.text}`)
          .join('\n- ');
        const recentHistory = store.history
          .slice(-15)
          .reverse()
          .map((h) => `- [${h.title || 'Untitled'}](${h.url})`)
          .join('\n');
        const currentTab = store.tabs.find((t) => t.id === store.activeTabId);

        const ragContext = `
[CURRENT CONTEXT]
Active Tab: ${currentTab?.title || 'Unknown'} (${store.currentUrl})

[ONLINE SEARCH RESULTS (LIVE)]
${webSearchContext || 'No online context retrieved.'}

[RECENT BROWSING HISTORY]
${recentHistory || 'No recent history.'}

[LOCAL KNOWLEDGE BASE (RAG)]
${ragContextText || 'No relevant local memories.'}

[PAGE CONTENT SNIPPET]
${pageContext || 'Content not loaded. Use [READ_PAGE_CONTENT] to read full page.'}
`.trim();

        const langName = LANGUAGE_MAP[store.selectedLanguage] || store.selectedLanguage;
        const languageInstructions =
          store.selectedLanguage !== 'en'
            ? `\nIMPORTANT: Respond ONLY in ${langName}. Always translate your findings to ${langName}.`
            : '';

        const platform = window.electronAPI.getPlatform?.() ?? 'unknown';
        const safetyStatus = store.aiSafetyMode
          ? 'ENABLED (High-Risk commands require user approval)'
          : 'DISABLED (Autonomous Mode)';
        const platformInstructions = `\n[SYSTEM INFO]\nUser Platform: ${platform}.\nAI Safety Mode: ${safetyStatus}`;

        const messageHistory: ChatMessage[] = [
          { role: 'system', content: SYSTEM_INSTRUCTIONS + languageInstructions + platformInstructions },
          ...(store.additionalAIInstructions
            ? [{ role: 'system', content: store.additionalAIInstructions }]
            : []),
          ...messages.map((m) => ({ role: m.role, content: m.content })),
          { role: 'user', content: userMessage.content + (ragContext ? `\n\n${ragContext}` : '') },
        ];

        const startTime = Date.now();
        const response = await window.electronAPI.generateChatContent(messageHistory);
        const elapsed = Date.now() - startTime;

        if (store.aiProvider === 'groq') {
          const tokens = response.text ? response.text.length / 4 : 0;
          setGroqSpeed(`${(tokens / (elapsed / 1000)).toFixed(1)} tok/s`);
        } else {
          setGroqSpeed(null);
        }

        if (response.error) {
          setError(response.error);
          return;
        }

        if (!response.text) return;

        // Persist to AI memory
        window.electronAPI.addAiMemory({
          role: 'user',
          content: userMessage.content,
          url: store.currentUrl,
          response: response.text,
          provider: store.aiProvider,
        });

        // Parse and execute commands
        const { commands, responseText } = prepareCommandsForExecution(response.text);

        if (responseText.trim()) {
          setMessages((prev) => [...prev, { role: 'model', content: responseText }]);
        }

        if (commands.length > 0) {
          const aiCommands: AICommand[] = commands.map((cmd, idx) => ({
            id: `cmd-${Date.now()}-${idx}-${Math.random().toString(36).substr(2, 9)}`,
            type: cmd.type,
            value: cmd.value,
            status: 'pending',
            timestamp: Date.now(),
          }));
          setCommandQueue(aiCommands);
          setCurrentCommandIndex(0);
          processingQueueRef.current = true;
          processCommandQueue(aiCommands);
        }

        // YouTube unavailable fallback
        if (store.currentUrl.includes('youtube.com') && response.text.toLowerCase().includes('not available')) {
          const videoId = store.currentUrl.match(/[?&]v=([^&]+)/)?.[1] || 'video';
          const searchQuery = `${videoId} video alternative`;
          setMessages((prev) => [
            ...prev,
            { role: 'model', content: `⚠️ YouTube content unavailable. Searching for alternatives...[SEARCH: ${searchQuery}]` },
          ]);
          await delay(2000);
          const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(searchQuery)}`;
          store.setCurrentUrl(searchUrl);
          await window.electronAPI.navigateBrowserView({ tabId: store.activeTabId, url: searchUrl });
        }

        // Re-render mermaid diagrams if any
        if (response.text.includes('mermaid') || response.text.includes('[GENERATE_DIAGRAM:')) {
          setTimeout(() => {
            const mermaid = (window as any).mermaid;
            if (mermaid) {
              mermaid
                .run({ querySelector: '.mermaid', suppressErrors: false })
                .catch((err: any) => console.error('[Mermaid] Render error:', err));
            }
          }, 500);
        }
      } catch (err: any) {
        setError(`Response Error: ${err.message}`);
      } finally {
        setIsLoading(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [inputMessage, attachments, messages, store],
  );

  // ---------------------------------------------------------------------------
  // Effects that depend on handleSendMessage (must come after its definition)
  // ---------------------------------------------------------------------------

  // electronAPI listeners
  useEffect(() => {
    if (!window.electronAPI?.on) return;

    const cleanupText = window.electronAPI.on('ai-chat-input-text', (text: string) => {
      setInputMessage(text);
    });

    const cleanupRemote = window.electronAPI.onRemoteAiPrompt((data: any) => {
      if (data?.prompt) {
        setInputMessage(data.prompt);
        handleSendMessage(data.prompt);
      }
    });

    return () => {
      cleanupText?.();
      cleanupRemote?.();
    };
  }, [handleSendMessage]);

  // Tab-loaded search results handler
  useEffect(() => {
    if (!window.electronAPI) return;

    const cleanup = window.electronAPI.onTabLoaded(async ({ tabId, url }: { tabId: string; url: string }) => {
      if (tabId !== store.activeTabId || !url.includes('google.com/search?q=')) return;
      await delay(1500);
      const { success, results, error } = await window.electronAPI.extractSearchResults(tabId);
      if (success && results?.length) {
        const ctx = results
          .map((r: any, i: number) => `Result ${i + 1}: ${r.title} - ${r.url} - ${r.snippet}`)
          .join('\n');
        await handleSendMessage(`Analyze these top search results:\n${ctx}`);
      } else if (error) {
        console.error('[AI] Failed to extract search results:', error);
        setError(`Failed to extract search results: ${error}`);
      }
    });

    return cleanup;
  }, [store.activeTabId, handleSendMessage]);

  // ---------------------------------------------------------------------------
  // Command queue processor
  // ---------------------------------------------------------------------------

  const processCommandQueue = useCallback(
    async (commands: AICommand[]) => {
      if (!processingQueueRef.current) return;

      const controller = new AbortController();
      abortControllerRef.current = controller;

      for (let i = 0; i < commands.length; i++) {
        if (controller.signal.aborted || !processingQueueRef.current) break;

        const cmd = commands[i];
        setCurrentCommandIndex(i);
        setCommandQueue((prev) => prev.map((c) => (c.id === cmd.id ? { ...c, status: 'executing' } : c)));

        try {
          let result = '';

          switch (cmd.type) {
            case 'NAVIGATE': {
              const url = cmd.value;
              store.setCurrentUrl(url);
              if (url.startsWith('comet://')) {
                const resourcePath = url.substring('comet://'.length);
                router.push(`/${resourcePath}`);
                store.setActiveView('browser');
                result = `Navigated to internal page: /${resourcePath}`;
              } else {
                store.setActiveView('browser');
                if (window.electronAPI) {
                  await window.electronAPI.navigateBrowserView({ tabId: store.activeTabId, url });
                }
                result = `Navigated to ${url}`;
              }
              await delay(1000);
              break;
            }

            case 'SEARCH':
            case 'WEB_SEARCH': {
              const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(cmd.value)}`;
              store.setCurrentUrl(searchUrl);
              store.setActiveView('browser');
              if (window.electronAPI) {
                await window.electronAPI.navigateBrowserView({ tabId: store.activeTabId, url: searchUrl });
              }
              result = `Searched for: ${cmd.value}`;
              await delay(1000);
              break;
            }

            case 'SET_THEME':
              store.setTheme(cmd.value.toLowerCase() as any);
              result = `Theme set to ${cmd.value}`;
              break;

            case 'OPEN_VIEW':
              store.setActiveView(cmd.value.toLowerCase());
              result = `Opened ${cmd.value} view`;
              break;

            case 'RELOAD':
              window.electronAPI?.reload();
              result = 'Reloaded page';
              await delay(500);
              break;

            case 'GO_BACK':
              window.electronAPI?.goBack();
              result = 'Navigated back';
              await delay(500);
              break;

            case 'GO_FORWARD':
              window.electronAPI?.goForward();
              result = 'Navigated forward';
              await delay(500);
              break;

            case 'READ_PAGE_CONTENT': {
              if (!window.electronAPI) throw new Error('API not available');
              const extraction = await window.electronAPI.extractPageContent();
              if (!extraction.content) throw new Error('Failed to read page content');
              BrowserAI.addToVectorMemory(extraction.content, { type: 'page_content', url: store.currentUrl });
              setMessages((prev) => [
                ...prev,
                { role: 'model', content: `\n\n[PAGE_CONTENT_READ]: ${extraction.content.substring(0, 500)}... (saved to memory)` },
              ]);
              result = 'Read page content';
              break;
            }

            case 'SCREENSHOT_AND_ANALYZE': {
              if (!window.electronAPI) throw new Error('API not available');
              const screenshot = await window.electronAPI.captureBrowserViewScreenshot();
              if (!screenshot || !tesseractWorkerRef.current) throw new Error('Failed to capture or analyze screenshot');
              const { data: { text: ocrText } } = await tesseractWorkerRef.current.recognize(screenshot);
              BrowserAI.addToVectorMemory(ocrText, { type: 'screenshot_ocr', url: store.currentUrl });
              setMessages((prev) => [...prev, { role: 'model', content: `\n\n[SCREENSHOT_ANALYSIS]: ${ocrText}` }]);
              result = 'Analyzed screenshot';
              break;
            }

            case 'LIST_OPEN_TABS': {
              if (!window.electronAPI) break;
              const openTabs = await window.electronAPI.getOpenTabs();
              if (openTabs) {
                const tabsList = openTabs.map((t: any) => `- ${t.title} (${t.url})`).join('\n');
                setMessages((prev) => [...prev, { role: 'model', content: `\n\n[OPEN_TABS]:\n${tabsList}` }]);
                result = `Listed ${openTabs.length} tabs`;
              } else {
                result = 'No open tabs';
              }
              break;
            }

            case 'SET_VOLUME':
            case 'SET_BRIGHTNESS': {
              if (!window.electronAPI) throw new Error('API not available');
              const percentage = parseInt(cmd.value, 10);
              const isBrightness = cmd.type === 'SET_BRIGHTNESS';
              const label = isBrightness ? 'Brightness' : 'Volume';
              const platform = navigator.platform;
              let shellCmd = '';

              if (platform.includes('Win')) {
                shellCmd = isBrightness
                  ? `powershell -Command "(Get-WmiObject -Namespace root/WMI -Class WmiMonitorBrightnessMethods).WmiSetBrightness(1,${percentage})"`
                  : `nircmd.exe setsysvolume ${Math.round((percentage / 100) * 65535)}`;
              } else if (platform.includes('Mac')) {
                shellCmd = isBrightness
                  ? `brightness ${percentage / 100}`
                  : `osascript -e "set volume output volume ${percentage}"`;
              } else {
                shellCmd = isBrightness ? `brightnessctl set ${percentage}%` : `amixer set 'Master' ${percentage}%`;
              }

              if (!shellCmd) throw new Error('Platform not supported');
              await window.electronAPI.executeShellCommand(shellCmd);
              result = `Set ${label} to ${percentage}%`;
              break;
            }

            case 'SHELL_COMMAND': {
              if (!window.electronAPI) throw new Error('API not available');
              const output = await window.electronAPI.executeShellCommand(cmd.value);
              if (!output?.success) throw new Error(output?.error || 'Command failed');
              result = 'Command executed successfully';
              break;
            }

            case 'OPEN_APP': {
              if (!window.electronAPI) throw new Error('API not available');
              const res = await window.electronAPI.openExternalApp(cmd.value);
              if (!res.success) throw new Error(res.error || 'Failed to open app');
              result = `Opened ${cmd.value}`;
              break;
            }

            case 'FILL_FORM': {
              if (!window.electronAPI) throw new Error('API not available');
              const [selector, value] = cmd.value.split('|').map((s) => s.trim());
              // FIX: Use JSON.stringify to safely escape values and prevent XSS
              const script = `
                (function() {
                  const el = document.querySelector(${JSON.stringify(selector)});
                  if (!el) return false;
                  el.value = ${JSON.stringify(value)};
                  el.dispatchEvent(new Event('input', { bubbles: true }));
                  el.dispatchEvent(new Event('change', { bubbles: true }));
                  return true;
                })()
              `;
              const res = await window.electronAPI.executeJavaScript(script);
              if (!res) throw new Error(`Element ${selector} not found`);
              result = `Filled form field ${selector}`;
              break;
            }

            case 'SCROLL_TO': {
              if (!window.electronAPI) throw new Error('API not available');
              const [target, offsetStr] = cmd.value.split('|').map((s) => s.trim());
              const offset = parseInt(offsetStr || '0', 10);
              // FIX: Use JSON.stringify for the selector to prevent XSS
              const script = `
                (function() {
                  const target = ${JSON.stringify(target)};
                  const offset = ${offset};
                  if (target === 'top') {
                    window.scrollTo({ top: offset, behavior: 'smooth' });
                  } else if (target === 'bottom') {
                    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
                  } else {
                    const el = document.querySelector(target);
                    if (el) {
                      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                      if (offset !== 0) window.scrollBy(0, offset);
                    }
                  }
                })()
              `;
              await window.electronAPI.executeJavaScript(script);
              result = `Scrolled to ${target}`;
              break;
            }

            case 'EXTRACT_DATA': {
              if (!window.electronAPI) throw new Error('API not available');
              // FIX: Use JSON.stringify for the selector
              const script = `document.querySelector(${JSON.stringify(cmd.value)})?.innerText`;
              const text = await window.electronAPI.executeJavaScript(script);
              if (!text) throw new Error('Element not found or empty');
              BrowserAI.addToVectorMemory(text, { type: 'extracted_data', url: store.currentUrl, selector: cmd.value });
              setMessages((prev) => [...prev, { role: 'model', content: `\n\n[EXTRACTED]: ${text}` }]);
              result = 'Data extracted';
              break;
            }

            case 'CREATE_NEW_TAB_GROUP':
              result = `Created tab group: ${cmd.value.split('|')[0]}`;
              break;

            case 'OCR_COORDINATES':
            case 'OCR_SCREEN': {
              if (!window.electronAPI) throw new Error('API not available');
              const screenshot = await window.electronAPI.captureBrowserViewScreenshot();
              if (screenshot && tesseractWorkerRef.current) {
                const { data: { text } } = await tesseractWorkerRef.current.recognize(screenshot);
                setMessages((prev) => [...prev, { role: 'model', content: `\n\n[OCR]: ${text}` }]);
                result = 'OCR completed';
              }
              break;
            }

            case 'FIND_AND_CLICK': {
              if (!window.electronAPI?.findAndClickText) throw new Error('API not available');
              const res = await window.electronAPI.findAndClickText(cmd.value);
              if (!res.success) throw new Error(res.error || 'Failed to find text');
              result = `Clicked "${cmd.value}"`;
              break;
            }

            case 'GMAIL_AUTHORIZE': {
              if (!window.electronAPI) throw new Error('API not available');
              const res = await window.electronAPI.gmailAuthorize();
              if (!res.success) throw new Error(res.error);
              result = 'Gmail authorized';
              break;
            }

            case 'GMAIL_LIST_MESSAGES': {
              if (!window.electronAPI) throw new Error('API not available');
              const [q, max] = cmd.value.split('|');
              const res = await window.electronAPI.gmailListMessages(q, parseInt(max) || 10);
              if (!res.success) throw new Error(res.error);
              const list = (res.messages || []).map((m: any) => m.id).join('\n');
              setMessages((prev) => [...prev, { role: 'model', content: `\n\n[EMAILS]:\n${list}` }]);
              result = `Listed ${(res.messages || []).length} emails`;
              break;
            }

            case 'GUIDE_CLICK':
              result = 'Guidance provided';
              await delay(3000);
              break;

            case 'WAIT':
              await delay(parseInt(cmd.value, 10));
              result = `Waited ${cmd.value}ms`;
              break;

            case 'GENERATE_PDF': {
              if (!window.electronAPI) throw new Error('API not available');
              const [title, content] = cmd.value.split('|').map((s) => s.trim());
              const res = await window.electronAPI.generatePDF(title, content);
              if (!res.success) throw new Error(res.error || 'Failed to generate PDF');
              setMessages((prev) => [
                ...prev,
                { role: 'model', content: `✅ [PDF_GENERATED]: Document "${title}" has been created and saved.` },
              ]);
              result = `Generated PDF: ${title}`;
              break;
            }

            case 'OPEN_PRESENTON':
              store.setActiveView('presenton');
              lsSet('presenton_auto_prompt', cmd.value);
              window.dispatchEvent(new CustomEvent('comet-launch-presenton', { detail: { prompt: cmd.value } }));
              result = `Launching Presenton with prompt: ${cmd.value}`;
              break;

            case 'EXPLAIN_CAPABILITIES': {
              const addMsg = (content: string) =>
                setMessages((prev) => [...prev, { role: 'model', content }]);

              addMsg('🚀 **I am the Comet AI Agent.** Let me demonstrate my advanced capabilities!');
              await delay(1500);
              addMsg('📄 **1. Document Generation:** I can create PDFs dynamically...');

              if (window.electronAPI) {
                try {
                  const pdfContent =
                    '<h1>Comet AI Capabilities</h1><ul><li>Autonomous Browsing</li><li>Desktop Automation</li><li>File Generation</li><li>Local Memory Integration</li></ul>';
                  const pdfRes = await window.electronAPI.generatePDF('Comet_Capabilities_Demo', pdfContent);
                  if (pdfRes.success) {
                    addMsg('✅ [PDF_GENERATED]: Document "Comet_Capabilities_Demo.pdf" saved to Downloads.');
                  }
                } catch (e) {
                  console.error('PDF generation in capabilities demo failed:', e);
                }
              }

              await delay(2000);
              addMsg('⚙️ **2. OS Automation:** I can interact with your operating system. Opening Calculator...');

              if (window.electronAPI) {
                try {
                  const platform = navigator.platform;
                  const calcApp = platform.includes('Win')
                    ? 'calc.exe'
                    : platform.includes('Mac')
                    ? 'Calculator.app'
                    : 'gnome-calculator';
                  const appRes = await window.electronAPI.openExternalApp(calcApp);
                  if (appRes?.success) addMsg('✅ [APP_OPENED]: Calculator launched.');
                } catch (e) {
                  console.error('Open app in capabilities demo failed:', e);
                }
              }

              await delay(2000);
              addMsg('🧠 **3. Local Intelligence:** I remember your browsing and can retrieve context even offline.');
              await delay(2000);
              addMsg("🎯 **4. Action-Oriented:** I don't just chat, I *do*. Ask me to change themes, adjust volume, manage emails, or browse autonomously!");
              result = 'Capabilities explained comprehensively';
              break;
            }

            default:
              result = 'Command executed';
          }

          setCommandQueue((prev) =>
            prev.map((c) => (c.id === cmd.id ? { ...c, status: 'completed', output: result } : c)),
          );
        } catch (err: any) {
          console.error(`Command failed: ${cmd.type}`, err);
          setCommandQueue((prev) =>
            prev.map((c) => (c.id === cmd.id ? { ...c, status: 'failed', error: err.message } : c)),
          );
        }
      }

      setTimeout(() => {
        setCommandQueue([]);
        processingQueueRef.current = false;
        abortControllerRef.current = null;
      }, 5000);
    },
    [router, store],
  );

  const cancelActions = useCallback(() => {
    abortControllerRef.current?.abort();
    setCommandQueue([]);
    processingQueueRef.current = false;
    abortControllerRef.current = null;
  }, []);

  // ---------------------------------------------------------------------------
  // File helpers
  // ---------------------------------------------------------------------------

  const fileToBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  const performOCR = useCallback(async (base64Image: string): Promise<string> => {
    try {
      if (!tesseractWorkerRef.current) return '';
      const { data: { text } } = await tesseractWorkerRef.current.recognize(base64Image);
      return text;
    } catch (err) {
      console.error('[OCR] Error:', err);
      return '';
    }
  }, []);

  const extractPDFText = useCallback(async (base64PDF: string): Promise<string> => {
    try {
      const pdfjsLib = await import('pdfjs-dist');
      const pdfData = atob(base64PDF.split(',')[1]);
      const pdf = await pdfjsLib.getDocument({ data: pdfData }).promise;
      let fullText = '';
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        fullText += content.items.map((item: any) => item.str).join(' ') + '\n';
      }
      return fullText;
    } catch (err) {
      console.error('[PDF] Error:', err);
      return '';
    }
  }, []);

  const handleFileUpload = useCallback(
    async (filesOrEvent: React.ChangeEvent<HTMLInputElement> | File[]) => {
      const files: File[] = Array.isArray(filesOrEvent)
        ? filesOrEvent
        : Array.from((filesOrEvent.target as HTMLInputElement).files || []);

      for (const file of files) {
        try {
          const base64 = await fileToBase64(file);
          if (file.type.startsWith('image/')) {
            const ocrText = await performOCR(base64);
            setAttachments((prev) => [...prev, { type: 'image', data: base64, ocrText, filename: file.name }]);
          } else if (file.type === 'application/pdf') {
            const ocrText = await extractPDFText(base64);
            setAttachments((prev) => [...prev, { type: 'pdf', data: base64, ocrText, filename: file.name }]);
          }
        } catch (err) {
          console.error('[File Upload] Error:', err);
          setError(`Failed to process ${file.name}`);
        }
      }
    },
    [performOCR, extractPDFText],
  );

  const handleDrop = useCallback(
    async (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragOver(false);
      if (e.dataTransfer.files?.length) {
        await handleFileUpload(Array.from(e.dataTransfer.files));
      }
      e.dataTransfer.clearData();
    },
    [handleFileUpload],
  );

  const removeAttachment = useCallback((index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  }, []);

  // ---------------------------------------------------------------------------
  // Conversation management
  // ---------------------------------------------------------------------------

  const getAllConversations = useCallback((): Conversation[] => {
    return lsGet<Conversation[]>('conversations_list', []);
  }, []);

  const saveCurrentConversation = useCallback(() => {
    if (messages.length === 0) return;
    const convId = activeConversationId || `conv_${Date.now()}`;
    const existing = conversations.find((c) => c.id === convId);
    const conversation: Conversation = {
      id: convId,
      title: messages[0]?.content.slice(0, 50) || 'New Chat',
      messages,
      createdAt: existing?.createdAt || Date.now(),
      updatedAt: Date.now(),
    };
    lsSet(`conversation_${convId}`, conversation);
    const allConvs = getAllConversations();
    const idx = allConvs.findIndex((c) => c.id === convId);
    if (idx >= 0) allConvs[idx] = conversation;
    else allConvs.unshift(conversation);
    lsSet('conversations_list', allConvs);
    setConversations(allConvs);
    if (!activeConversationId) setActiveConversationId(convId);
  }, [messages, activeConversationId, conversations, getAllConversations]);

  const loadConversation = useCallback(
    (id: string) => {
      const saved = lsGet<Conversation | null>(`conversation_${id}`, null);
      if (saved) {
        setMessages(saved.messages);
        setActiveConversationId(id);
        setShowConversationHistory(false);
      }
    },
    [],
  );

  const deleteConversation = useCallback(
    (id: string) => {
      lsRemove(`conversation_${id}`);
      const updated = getAllConversations().filter((c) => c.id !== id);
      lsSet('conversations_list', updated);
      setConversations(updated);
      if (activeConversationId === id) {
        setMessages([]);
        setActiveConversationId(null);
      }
    },
    [activeConversationId, getAllConversations],
  );

  const createNewConversation = useCallback(() => {
    setMessages([]);
    setActiveConversationId(null);
    setShowConversationHistory(false);
  }, []);

  // ---------------------------------------------------------------------------
  // Message actions
  // ---------------------------------------------------------------------------

  const handleCopyMessage = useCallback((content: string, index: number) => {
    navigator.clipboard.writeText(content);
    setCopiedMessageIndex(index);
    setTimeout(() => setCopiedMessageIndex(null), 2000);
  }, []);

  const handleShareMessage = useCallback(async (content: string) => {
    if (navigator.share) {
      try {
        await navigator.share({ title: 'Comet AI Response', text: content });
      } catch {
        // User cancelled
      }
    } else {
      navigator.clipboard.writeText(content);
    }
  }, []);

  const handleSendWithAttachments = useCallback(async () => {
    let messageContent = inputMessage;
    if (attachments.length > 0) {
      messageContent += '\n\n**Attached Files:**\n';
      attachments.forEach((att) => {
        messageContent += `\n**${att.filename}** (${att.type}):\n${att.ocrText || 'No text extracted'}\n`;
      });
    }
    setInputMessage('');
    setAttachments([]);
    await handleSendMessage(messageContent);
  }, [inputMessage, attachments, handleSendMessage]);

  // ---------------------------------------------------------------------------
  // Export helpers
  // ---------------------------------------------------------------------------

  const handleExportTxt = useCallback(async () => {
    if (!messages.length) return;
    const success = await window.electronAPI?.exportChatAsTxt(messages);
    if (success) alert('Exported as TXT');
  }, [messages]);

  const handleExportPdf = useCallback(async () => {
    if (!messages.length) return;
    const success = await window.electronAPI?.exportChatAsPdf(messages);
    if (success) alert('Exported as PDF');
  }, [messages]);

  const handleExportDiagram = useCallback(
    async (mermaidCode: string, resolution = 1080) => {
      try {
        const mermaid = (window as any).mermaid;
        if (!isMermaidLoaded || !mermaid) {
          setError('Mermaid.js is not loaded.');
          return;
        }
        const { svg } = await mermaid.render('diagram-export-id', mermaidCode);
        const wrapper = document.createElement('div');
        wrapper.innerHTML = svg;
        document.body.appendChild(wrapper);
        const svgEl = wrapper.querySelector('svg');
        const svgWidth = svgEl?.clientWidth || 800;
        const svgHeight = svgEl?.clientHeight || 600;
        document.body.removeChild(wrapper);

        const scale = resolution / svgHeight;
        const canvas = document.createElement('canvas');
        canvas.width = svgWidth * scale;
        canvas.height = resolution;
        const ctx = canvas.getContext('2d');
        if (!ctx) { setError('Failed to get canvas context.'); return; }

        const blob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const img = new Image();
        img.onload = () => {
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          URL.revokeObjectURL(url);
          canvas.toBlob(async (pngBlob) => {
            if (!pngBlob || !window.electronAPI) { setError('Failed to export diagram.'); return; }
            const reader = new FileReader();
            reader.onloadend = async () => {
              const filename = `mermaid-diagram-${Date.now()}.png`;
              const success = await window.electronAPI.triggerDownload(reader.result as string, filename);
              if (success) alert(`Diagram exported as ${filename} at ${resolution}p.`);
              else setError('Failed to trigger diagram download.');
            };
            reader.readAsDataURL(pngBlob);
          }, 'image/png', 1);
        };
        img.onerror = () => setError('Failed to load SVG into image for canvas.');
        img.src = url;
      } catch (err: any) {
        setError(`Failed to export diagram: ${err.message}`);
      }
    },
    [isMermaidLoaded],
  );

  // ---------------------------------------------------------------------------
  // Collapsed state
  // ---------------------------------------------------------------------------

  if (props.isCollapsed) {
    return (
      <div className="flex flex-col items-center h-full py-4 space-y-6">
        <button
          onClick={props.toggleCollapse}
          className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 hover:bg-white/10 text-white/40"
        >
          {props.side === 'right' ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
        </button>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div
      className={`flex flex-col h-full gap-4 p-4 bg-black/60 border-r border-transparent transition-all duration-500 z-[100]
        ${isFullScreen ? 'fixed inset-0 z-[9999] bg-[#020205] shadow-2xl overflow-hidden' : ''}
        ${isDragOver ? 'border-accent/50 bg-accent/5' : ''}
      `}
      style={{
        backdropFilter: isFullScreen ? 'none' : 'blur(20px)',
        WebkitBackdropFilter: isFullScreen ? 'none' : 'blur(20px)',
        transform: 'translateZ(0)',
        willChange: 'transform',
      }}
      onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
      onDragLeave={() => setIsDragOver(false)}
      onDrop={handleDrop}
    >
      {/* Conversation History Panel */}
      <ConversationHistoryPanel
        show={showConversationHistory}
        conversations={conversations}
        activeId={activeConversationId}
        onClose={() => setShowConversationHistory(false)}
        onLoad={loadConversation}
        onDelete={deleteConversation}
        onNew={createNewConversation}
      />

      {/* Resize Handle */}
      {!isFullScreen && !props.isCollapsed && (
        <div
          className={`absolute top-0 ${props.side === 'right' ? 'left-0' : 'right-0'} w-1 h-full cursor-col-resize hover:bg-deep-space-accent-neon/50 transition-colors z-[110]`}
          onMouseDown={(e) => {
            e.preventDefault();
            const startX = e.clientX;
            const startWidth = store.sidebarWidth;
            const onMove = (ev: MouseEvent) => {
              const delta = props.side === 'right' ? startX - ev.clientX : ev.clientX - startX;
              const newWidth = Math.min(800, Math.max(300, startWidth + delta));
              store.setSidebarWidth(newWidth);
              window.dispatchEvent(new Event('resize'));
            };
            const onUp = () => {
              document.removeEventListener('mousemove', onMove);
              document.removeEventListener('mouseup', onUp);
            };
            document.addEventListener('mousemove', onMove);
            document.addEventListener('mouseup', onUp);
          }}
        />
      )}

      <style>{`
        .modern-scrollbar::-webkit-scrollbar { width: 6px; }
        .modern-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .modern-scrollbar::-webkit-scrollbar-thumb { background-color: rgba(255,255,255,0.1); border-radius: 6px; }
        .modern-scrollbar::-webkit-scrollbar-thumb:hover { background-color: rgba(255,255,255,0.2); }
      `}</style>

      {/* Header */}
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center">
            <img src="icon.png" alt="Comet AI" className="w-full h-full object-contain" />
          </div>
          <h2 className="text-sm font-black uppercase tracking-[0.2em] text-white text-neon">Comet AI</h2>
          {isOnline ? <Wifi size={12} className="text-green-400" /> : <WifiOff size={12} className="text-orange-400" />}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowLLMProviderSettings((v) => !v)}
            className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/40 transition-all no-drag-region"
            title="LLM Provider Settings"
          >
            <MoreVertical size={18} />
          </button>
          <button
            onClick={() => setIsFullScreen((v) => !v)}
            className="p-2 text-secondary-text hover:text-primary-text transition-colors"
          >
            {isFullScreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
          </button>
          <button onClick={props.toggleCollapse} className="p-2 text-secondary-text hover:text-primary-text transition-colors">
            <X size={16} />
          </button>
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto modern-scrollbar space-y-4 relative pr-2">
        {/* RAG Panel */}
        <AnimatePresence>
          {showRagPanel && ragContextItems.length > 0 && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="mx-2 mb-2 rounded-xl bg-deep-space-accent-neon/5 overflow-hidden"
            >
              <div
                className="px-3 py-2 flex items-center justify-between cursor-pointer bg-deep-space-accent-neon/10"
                onClick={() => setShowRagPanel((v) => !v)}
              >
                <div className="flex items-center gap-2">
                  <Sparkles size={12} className="text-deep-space-accent-neon animate-pulse" />
                  <span className="text-[9px] font-black uppercase tracking-widest text-deep-space-accent-neon">
                    Neural Context Active ({ragContextItems.length})
                  </span>
                </div>
                <ChevronDown size={12} className="text-deep-space-accent-neon opacity-50" />
              </div>
              <div className="p-3 space-y-2">
                {ragContextItems.map((item, i) => (
                  <div key={i} className="text-[10px] text-white/50 leading-tight pl-2 border-l-2 border-deep-space-accent-neon/20">
                    {item.text.substring(0, 120)}...
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Message list */}
        {messages.map((msg, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div
              className={`max-w-[85%] p-4 rounded-3xl text-sm leading-[1.6] relative group ${
                msg.role === 'user'
                  ? 'bg-sky-500/10 text-white border border-sky-500/20 shadow-[0_0_20px_rgba(56,189,248,0.1)]'
                  : 'bg-white/[0.03] text-slate-200 border border-white/5'
              }`}
            >
              <ReactMarkdown
                remarkPlugins={[remarkGfm, remarkMath]}
                rehypePlugins={[rehypeKatex]}
                components={{
                  code({ node, className, children, ...rest }) {
                    const match = /language-(\w+)/.exec(className || '');
                    const codeString = String(children).replace(/\n$/, '');

                    if (match?.[1] === 'mermaid' && isMermaidLoaded) {
                      return (
                        <div
                          className="relative group bg-black/40 p-4 rounded-xl my-4 text-center overflow-x-auto"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="mermaid bg-white p-4 rounded-lg inline-block">{codeString}</div>
                          <button
                            onClick={(e) => { e.stopPropagation(); handleExportDiagram(codeString); }}
                            className="absolute top-2 right-2 p-1.5 rounded-full bg-black/60 text-white/70 hover:bg-black/90 hover:text-white transition-all opacity-0 group-hover:opacity-100"
                            title="Export Diagram"
                          >
                            <Download size={14} />
                          </button>
                        </div>
                      );
                    }

                    return node && match ? (
                      <SyntaxHighlighter style={dracula as any} language={match[1]} PreTag="div">
                        {codeString}
                      </SyntaxHighlighter>
                    ) : (
                      <code className={className} {...rest}>
                        {children}
                      </code>
                    );
                  },
                }}
              >
                {msg.content}
              </ReactMarkdown>

              {msg.role === 'model' && (
                <MessageActions
                  content={msg.content}
                  index={i}
                  copiedIndex={copiedMessageIndex}
                  onCopy={handleCopyMessage}
                  onShare={handleShareMessage}
                />
              )}
            </div>

            {msg.role === 'model' && i === messages.length - 1 && groqSpeed && (
              <div className="mt-1 ml-2 flex items-center gap-1 text-[9px] font-bold text-deep-space-accent-neon opacity-60">
                <Zap size={10} /> {groqSpeed}
              </div>
            )}
          </motion.div>
        ))}

        {isLoading && <ThinkingIndicator />}
        {error && (
          <div className="text-[10px] text-red-400 bg-red-400/10 p-2 rounded-lg border border-red-500/20">
            ⚠️ {error}
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* LLM Provider Settings */}
      <LLMProviderSettings
        {...props}
        ollamaModels={ollamaModels}
        setOllamaModels={setOllamaModels}
        setError={setError}
        showSettings={showLLMProviderSettings}
        setShowSettings={setShowLLMProviderSettings}
      />

      {/* Footer */}
      <footer className="space-y-4 mt-auto">
        {/* Attachment previews */}
        {attachments.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-2 p-2 bg-white/5 rounded-xl border border-white/10 max-h-32 overflow-y-auto modern-scrollbar">
            {attachments.map((att, idx) => (
              <div
                key={idx}
                className="flex items-center gap-2 px-3 py-1.5 bg-white/10 rounded-lg text-[10px] text-white/80 group"
              >
                {att.type === 'image' ? <ImageIcon size={12} /> : <FileText size={12} />}
                <span className="max-w-[100px] truncate">{att.filename}</span>
                <button onClick={() => removeAttachment(idx)} className="hover:text-red-400 transition-colors">
                  <X size={10} />
                </button>
              </div>
            ))}
          </div>
        )}

        <textarea
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSendWithAttachments();
            }
          }}
          placeholder="Neural prompt..."
          className="w-full neural-prompt rounded-2xl p-4 text-xs text-white focus:outline-none h-24 resize-none border border-white/5 focus:border-accent/30 transition-all"
        />

        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            {/* Attach */}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="p-2.5 rounded-xl bg-white/5 text-white/40 hover:bg-white/10 hover:text-white transition-all shadow-lg border border-white/5"
              title="Attach Files"
            >
              <Paperclip size={16} />
            </button>

            {/* History */}
            <button
              onClick={() => setShowConversationHistory(true)}
              className="p-2.5 rounded-xl bg-white/5 text-white/40 hover:bg-white/10 hover:text-white transition-all shadow-lg border border-white/5"
              title="Conversation History"
            >
              <FolderOpen size={16} />
            </button>

            {/* Actions menu */}
            <div className="relative">
              <button
                onClick={() => setShowActionsMenu((v) => !v)}
                className="p-2.5 rounded-xl bg-white/5 text-white/40 hover:bg-white/10 hover:text-white transition-all shadow-lg border border-white/5"
                title="AI Command Center"
              >
                <MoreVertical size={14} />
              </button>

              {showActionsMenu && (
                <div className="absolute bottom-full mb-2 w-48 bg-black/80 backdrop-blur-md border border-white/10 rounded-lg shadow-lg z-50">
                  {[
                    {
                      icon: '📎',
                      label: 'Attach File',
                      action: () => { fileInputRef.current?.click(); setShowActionsMenu(false); },
                    },
                    {
                      icon: <CopyIcon size={14} />,
                      label: 'Copy Last Response',
                      action: () => {
                        const last = [...messages].reverse().find((m) => m.role === 'model');
                        if (last) navigator.clipboard.writeText(last.content);
                        setShowActionsMenu(false);
                      },
                    },
                    {
                      icon: <Share2 size={14} />,
                      label: 'Share Last Response',
                      action: () => {
                        const last = [...messages].reverse().find((m) => m.role === 'model');
                        if (last && navigator.share) navigator.share({ title: 'Comet AI Response', text: last.content });
                        setShowActionsMenu(false);
                      },
                    },
                    {
                      icon: <ScanLine size={14} />,
                      label: 'Find & Click Text (OCR)',
                      action: () => { handleSendMessage('[FIND_AND_CLICK: ]'); setShowActionsMenu(false); },
                    },
                    {
                      icon: <Download size={14} />,
                      label: 'Save Last Response',
                      action: () => {
                        const last = [...messages].reverse().find((m) => m.role === 'model');
                        if (last && window.electronAPI) window.electronAPI.saveAiResponse(last.content);
                        setShowActionsMenu(false);
                      },
                    },
                    null, // divider
                    {
                      icon: <FileText size={14} />,
                      label: 'Export as Text',
                      action: () => { handleExportTxt(); setShowActionsMenu(false); },
                    },
                    {
                      icon: <FileText size={14} />,
                      label: 'Export as PDF',
                      action: () => { handleExportPdf(); setShowActionsMenu(false); },
                    },
                    null, // divider
                    {
                      icon: <ScanLine size={14} />,
                      label: 'Find & Click (OCR)',
                      action: () => {
                        setShowActionsMenu(false);
                        if (window.electronAPI?.findAndClickText) {
                          const text = window.prompt('Enter text to find and click on screen:');
                          if (text?.trim()) {
                            window.electronAPI.findAndClickText(text.trim()).then((r: { success?: boolean; error?: string }) => {
                              setMessages((prev) => [
                                ...prev,
                                {
                                  role: 'model',
                                  content: r.success
                                    ? '✅ **Find & Click:** Clicked successfully.'
                                    : `⚠️ **Find & Click:** ${r.error || 'Failed'}`,
                                },
                              ]);
                            });
                          }
                        }
                      },
                    },
                  ].map((item, idx) =>
                    item === null ? (
                      <div key={`div-${idx}`} className="h-[1px] bg-white/10 my-1" />
                    ) : (
                      <button
                        key={item.label}
                        onClick={item.action}
                        className="w-full flex items-center gap-2 px-4 py-2 text-xs text-left text-white/80 hover:bg-white/10"
                      >
                        {typeof item.icon === 'string' ? item.icon : item.icon}
                        <span>{item.label}</span>
                      </button>
                    ),
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Wi-Fi sync broadcast */}
          <button
            type="button"
            onClick={async () => {
              if (inputMessage.trim() && window.electronAPI) {
                await window.electronAPI.wifiSyncBroadcast({ type: 'agent-task', task: inputMessage });
                setInputMessage('');
              }
            }}
            disabled={!inputMessage.trim() || isLoading}
            className="p-2.5 rounded-xl bg-accent/20 text-accent hover:bg-accent/30 transition-all border border-accent/30 disabled:opacity-40 disabled:cursor-not-allowed"
            title="Send Task to Mobile Agent"
          >
            <Zap size={16} className="animate-pulse" />
          </button>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            className="hidden"
            multiple
          />

          {/* Send */}
          <button
            type="button"
            onClick={handleSendWithAttachments}
            disabled={(!inputMessage.trim() && attachments.length === 0) || isLoading}
            className="group relative px-5 py-2.5 rounded-full bg-gradient-to-r from-deep-space-accent-neon to-accent overflow-hidden transition-all hover:shadow-[0_0_30px_rgba(0,255,255,0.6)] disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700" />
            <div className="relative flex items-center gap-2 text-black font-bold text-[10px] uppercase tracking-wider">
              <Send size={12} className="group-hover:rotate-12 transition-transform" />
              <span>Launch</span>
            </div>
          </button>
        </div>
      </footer>

      <AICommandQueue
        commands={commandQueue}
        currentCommandIndex={currentCommandIndex}
        onCancel={cancelActions}
      />
    </div>
  );
};

export default AIChatSidebar;
