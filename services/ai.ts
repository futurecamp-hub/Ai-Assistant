
import { GoogleGenAI, FunctionDeclaration, Type, Part } from "@google/genai";

export const getGeminiClient = () => {
  const key = process.env.API_KEY;
  if (!key || key === 'undefined') {
    throw new Error("API Key not selected.");
  }
  return new GoogleGenAI({ apiKey: key });
};

export const hasValidKey = async (): Promise<boolean> => {
    if (process.env.API_KEY && process.env.API_KEY !== 'undefined') return true;
    try {
      if (typeof (window as any).aistudio?.hasSelectedApiKey === 'function') {
        return await (window as any).aistudio.hasSelectedApiKey();
      }
      return false;
    } catch {
      return false;
    }
};

export const openApiKeySelector = async () => {
  try {
    if (typeof (window as any).aistudio?.openSelectKey === 'function') {
      await (window as any).aistudio.openSelectKey();
      return true;
    }
    throw new Error("API Selection Bridge not available");
  } catch (e) {
    console.error("API Key selection failed:", e);
    return false;
  }
};

let isSimulationMode = false;
export const setSimulationMode = (enabled: boolean) => {
  isSimulationMode = enabled;
};
export const getSimulationMode = () => isSimulationMode;

const addTaskTool: FunctionDeclaration = {
  name: 'addTask',
  description: 'Добавить новую задачу в список.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      title: { type: Type.STRING },
      description: { type: Type.STRING },
      priority: { type: Type.STRING, enum: ['low', 'medium', 'high'] },
    },
    required: ['title']
  }
};

const addEventTool: FunctionDeclaration = {
  name: 'addEvent',
  description: 'Добавить событие в календарь.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      title: { type: Type.STRING },
      date: { type: Type.STRING },
      time: { type: Type.STRING },
      description: { type: Type.STRING },
    },
    required: ['title', 'date', 'time']
  }
};

const addNoteTool: FunctionDeclaration = {
  name: 'addNote',
  description: 'Создать новую текстовую заметку.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      title: { type: Type.STRING },
      content: { type: Type.STRING }
    },
    required: ['title', 'content']
  }
};

const generateImageTool: FunctionDeclaration = {
  name: 'generateImage',
  description: 'Сгенерировать изображение по описанию.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      prompt: { type: Type.STRING },
      aspectRatio: { type: Type.STRING }
    },
    required: ['prompt']
  }
};

export const tools = [addTaskTool, addEventTool, addNoteTool, generateImageTool];

export const modelConfig = {
  model: 'gemini-3-flash-preview',
  config: {
    systemInstruction: `
*** J.A.R.V.I.S. STRATEGIC BUSINESS ASSISTANT ***
Ты — живой бизнес-ассистент и стратег. Твоя задача — предоставлять глубокую аналитику и управлять воркспейсом.
Стиль: экспертный, детальный. НИКАКИХ ТАБЛИЦ.
`,
    tools: [{ functionDeclarations: tools }, { googleSearch: {} }]
  }
};

// Tool for ConstructorView to design workspace structures
const proposeSystemStructureTool: FunctionDeclaration = {
  name: 'proposeSystemStructure',
  description: 'Спроектировать структуру системы (CRM, База знаний, Трекер проектов и т.д.)',
  parameters: {
    type: Type.OBJECT,
    properties: {
      title: { type: Type.STRING, description: 'Название проектируемой системы' },
      elements: {
        type: Type.ARRAY,
        description: 'Список элементов системы (страницы, базы данных)',
        items: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.STRING, description: 'Уникальный ID элемента' },
            title: { type: Type.STRING, description: 'Название элемента' },
            type: { type: Type.STRING, enum: ['page', 'database', 'dashboard', 'automation'], description: 'Тип элемента' },
            description: { type: Type.STRING, description: 'Краткое описание назначения' },
            properties: { type: Type.ARRAY, items: { type: Type.STRING }, description: 'Свойства/поля (для баз данных)' },
            views: { type: Type.ARRAY, items: { type: Type.STRING }, description: 'Представления (Board, Timeline и т.д.)' }
          },
          required: ['id', 'title', 'type']
        }
      }
    },
    required: ['title', 'elements']
  }
};

export const constructorModelConfig = {
  model: 'gemini-3-pro-preview',
  config: {
    systemInstruction: `
*** J.A.R.V.I.S. ARCHITECT MODULE ***
Ты — элитный архитектор систем управления знаниями и бизнесом. 
Твоя задача — проектировать высокоэффективные структуры воркспейсов (аналог Notion). 
Обязательно используй инструмент proposeSystemStructure для визуализации архитектуры в UI.
Стиль: профессиональный, системный, лаконичный.
`,
    tools: [{ functionDeclarations: [proposeSystemStructureTool] }]
  }
};

export const fileToGenerativePart = async (file: File): Promise<Part> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64Data = (reader.result as string).split(',')[1];
      resolve({
        inlineData: {
          data: base64Data,
          mimeType: file.type,
        },
      });
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

export const generateImage = async (prompt: string, aspectRatio: string = "1:1"): Promise<string | null> => {
  const ai = getGeminiClient();
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: { parts: [{ text: prompt }] },
    config: { imageConfig: { aspectRatio: aspectRatio as any } }
  });

  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) return part.inlineData.data;
  }
  return null;
};

export const generateDailyBriefing = async (sector: string): Promise<string> => {
  if (isSimulationMode) return `### 🟢 Сводка (РФ): ${sector}\nДанные в режиме симуляции.`;
  
  const ai = getGeminiClient();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Сделай краткий оперативный обзор рынка РФ для сектора: "${sector}". Выдели 3 главных новости за последние 48 часов.`,
    config: { tools: [{ googleSearch: {} }] }
  });
  return response.text || "Нет данных.";
};

export const generateDetailedMarketAnalysis = async (sector: string): Promise<string> => {
  if (isSimulationMode) return `# 📊 Отчет: ${sector}\nДанные симуляции.`;
  
  const ai = getGeminiClient();
  
  const systemPrompt = `
Роль: Ты — профессиональный аналитик рынка, стратегический консультант и бизнес-советник собственника / CEO. Твоя задача — предоставить максимально подробный, прикладной и стратегически полезный анализ рынка.

ВАЖНОЕ ТРЕБОВАНИЕ ПО ОБЪЕМУ: Каждый из 12 блоков должен быть максимально развернутым, глубоким и детальным (стремись к объему минимум 800 слов на каждый пункт, используя факты, логические цепочки и глубокие выводы). Не лей воду, а расширяй контекст, приводи примеры и проводи глубокую декомпозицию. Твой отчет должен быть фундаментальным трудом.

ОБЯЗАТЕЛЬНАЯ СТРУКТУРА ОТВЕТА (12 ПУНКТОВ):

1. Executive summary (для руководителя): Глубокий синтез текущей ситуации, стратегический вердикт, критические факторы успеха.
2. Общая характеристика рынка: Детальная сегментация, микро-ниши, Value Chain в разрезе 2024-2025, скрытые потребности ЦА, анализ стратегий лидеров.
3. Информация, актуальная для России: Зрелость, влияние санкций, импортозамещение, логистические узлы, специфика спроса в регионах, кадровый дефицит и регуляторные ловушки.
4. Информация, актуальная для остального мира: Глобальные бенчмарки, западные и азиатские модели, технологический стек лидеров.
5. Ключевые тренды и драйверы: Ранние сигналы, разбор хайп-циклов, макро-драйверы (экономика, демография).
6. Прогноз развития рынка и будущие тренды: Сценарии (Оптимистичный/Базовый/Стресс). Роль человеческого капитала, институциональные изменения, ИИ как инструмент эффективности.
7. Возможности для бизнеса руководителя: Карта прибыльных зон на 1, 3 и 5 лет. Точки нелинейного роста.
8. Предложения по оптимизации и повышению эффективности: Аудит неэффективности, "утечки" маржи, внедрение бережливых AI-подходов.
9. Инвестиционные возможности в секторе: Оценка доходности, риски M&A, партнерские экосистемы.
10. Как заработать на этой информации: Конкретные бизнес-модели, стратегии быстрого входа (Go-to-market), захват доли рынка.
11. Мысли ассистента: Стратегическое моделирование, творческие гипотезы, план внедрения, оценка KPI и рисков.
12. Что можно сделать сегодня: Финальный блок. 1–3 конкретных действия; применимых прямо сейчас; без долгих стратегий.

СТИЛЬ: Язык CEO, структурно, экспертно, без таблиц. Только качественный Markdown.
`;

  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: `Сформируй максимально объемный и подробный стратегический отчет по сектору: "${sector}" согласно твоим инструкциям (12 пунктов, каждый по ~800 слов).`,
    config: { 
      tools: [{ googleSearch: {} }],
      systemInstruction: systemPrompt,
      thinkingConfig: { thinkingBudget: 32768 }
    }
  });
  
  return response.text || "Не удалось сформировать отчет. Попробуйте позже.";
};
