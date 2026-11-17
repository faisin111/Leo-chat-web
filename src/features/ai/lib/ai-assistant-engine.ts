import type { AiModelId, AiWebSource } from '../types/ai.types';

export interface GeneratedAiReply {
  content: string;
  modelId?: AiModelId;
  thinkingContent?: string;
  thinkingDurationSecs?: number;
  sources?: AiWebSource[];
}

interface CuratedPhoto {
  keywords: string[];
  title: string;
  url: string;
  category: string;
}

const CURATED_PHOTOS: CuratedPhoto[] = [
  {
    keywords: ['sunset', 'beach', 'ocean', 'sea', 'sky', 'sun', 'dusk', 'evening'],
    title: 'Golden Sunset over Coastal Ocean Horizon',
    url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&auto=format&fit=crop&q=80',
    category: 'Nature & Landscape',
  },
  {
    keywords: ['mountain', 'nature', 'landscape', 'hike', 'fog', 'forest', 'trees', 'alps'],
    title: 'Dramatic Alpine Mountain Peak with Morning Mist',
    url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1200&auto=format&fit=crop&q=80',
    category: 'Alpine Nature',
  },
  {
    keywords: [
      'city',
      'night',
      'urban',
      'skyline',
      'cyberpunk',
      'neon',
      'street',
      'tokyo',
      'new york',
    ],
    title: 'Vibrant Metropolis Cityscape at Twilight',
    url: 'https://images.unsplash.com/photo-1514565131-fce0801e5785?w=1200&auto=format&fit=crop&q=80',
    category: 'Urban Architecture',
  },
  {
    keywords: ['car', 'supercar', 'auto', 'vehicle', 'drive', 'speed', 'racing'],
    title: 'Modern Sleek Supercar in Studio Lighting',
    url: 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?w=1200&auto=format&fit=crop&q=80',
    category: 'Automotive Design',
  },
  {
    keywords: ['cat', 'kitten', 'pet', 'animal', 'cute'],
    title: 'Curious Green-Eyed Cat Close-up Portrait',
    url: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=1200&auto=format&fit=crop&q=80',
    category: 'Wildlife & Pets',
  },
  {
    keywords: ['dog', 'puppy', 'canine', 'golden retriever'],
    title: 'Playful Golden Retriever in Sunlight',
    url: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=1200&auto=format&fit=crop&q=80',
    category: 'Wildlife & Pets',
  },
  {
    keywords: ['space', 'galaxy', 'stars', 'cosmos', 'universe', 'astronomy', 'nebula'],
    title: 'Deep Cosmic Nebula and Starfield Panorama',
    url: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?w=1200&auto=format&fit=crop&q=80',
    category: 'Astronomy & Cosmos',
  },
  {
    keywords: ['tech', 'technology', 'code', 'cyber', 'future', 'ai', 'robot', 'computer'],
    title: 'Futuristic Microchip & Digital Light Trails',
    url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200&auto=format&fit=crop&q=80',
    category: 'Technology & AI',
  },
  {
    keywords: ['coffee', 'cafe', 'espresso', 'morning', 'drink', 'cup'],
    title: 'Artisan Latte Art with Fresh Roasted Beans',
    url: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=1200&auto=format&fit=crop&q=80',
    category: 'Lifestyle',
  },
  {
    keywords: ['architecture', 'building', 'interior', 'design', 'modern'],
    title: 'Minimalist Architectural Curves and Natural Light',
    url: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200&auto=format&fit=crop&q=80',
    category: 'Modern Architecture',
  },
];

const DEFAULT_PHOTO: CuratedPhoto = {
  keywords: [],
  title: 'Serene Alpine Lake Reflection and Mountain Vista',
  url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1200&auto=format&fit=crop&q=80',
  category: 'Landscape & Nature',
};

function findMatchingPhoto(prompt: string): CuratedPhoto {
  const lower = prompt.toLowerCase();
  for (const photo of CURATED_PHOTOS) {
    if (photo.keywords.some((k) => lower.includes(k))) {
      return photo;
    }
  }
  return DEFAULT_PHOTO;
}

export function generateAssistantReply(
  prompt: string,
  modelId: AiModelId = 'leo-ultra',
  isDeepThinkEnabled: boolean = false,
  isWebSearchEnabled: boolean = false,
): GeneratedAiReply {
  const trimmed = prompt.trim();
  const lower = trimmed.toLowerCase();

  // 1. Photo / Image Generation Intent
  const isPhotoRequest =
    /\b(photo|image|picture|pic|photograph|wallpaper|render|draw|look like|illustration)\b/i.test(
      lower,
    ) || lower === 'give a photo';

  if (isPhotoRequest) {
    const photo = findMatchingPhoto(lower);
    const content = [
      `Here is a photo matching your request:\n`,
      `![${photo.title}](${photo.url})\n`,
      `### ${photo.title}`,
      `- **Category:** ${photo.category}`,
      `- **Resolution:** 4K Ultra-HD (1200px preview)`,
      `- **Source:** High-resolution photography via Unsplash`,
      `\n*Tip: You can ask for different themes like sunset, futuristic cyberpunk city, mountains, coffee, cute animals, or modern architecture!*`,
    ].join('\n');

    return {
      content,
      modelId,
      thinkingContent: isDeepThinkEnabled
        ? `1. Detected visual/media intent: "${trimmed}"\n2. Selecting optimal photographic asset matching context\n3. Formatting markdown image entity with verified high-resolution URL and metadata\n4. Synthesized descriptive caption and follow-up styling suggestions.`
        : undefined,
      thinkingDurationSecs: isDeepThinkEnabled ? 2.4 : undefined,
    };
  }

  // 2. Greetings and Introductions
  if (
    /^(hi|hello|hey|greetings|hola|howdy|good\s*(morning|afternoon|evening|day)|who\s*are\s*you|what\s*can\s*you\s*do)\b/i.test(
      lower,
    ) ||
    lower === 'hi' ||
    lower === 'hello'
  ) {
    const content = [
      `Hello! I'm **LeoChat AI**, your personal intelligence assistant built right into LeoChat. 🚀\n`,
      `Here is what I can do for you:`,
      `- **💬 Intelligent Conversation:** Brainstorm ideas, analyze documents, and answer complex questions.`,
      `- **💻 Code & Architecture:** Write, debug, and refactor code in TypeScript, React, Python, Go, and SQL.`,
      `- **🖼️ Photo & Visual Inquiries:** Request photography, design concepts, or visual layout mockups.`,
      `- **🧠 Deep Reasoning:** Switch to the **Reasoning R1** model for step-by-step mathematical and algorithmic proofs.`,
      `- **🌐 Web Research:** Search and cite verified online sources for real-time information.\n`,
      `What would you like to explore today?`,
    ].join('\n');

    return {
      content,
      modelId,
      thinkingContent: isDeepThinkEnabled
        ? `1. Identified conversational greeting from user.\n2. Formulating welcoming response outlining available modalities (chat, code, media, reasoning).\n3. Verifying responsive tone and prompting user for specific task.`
        : undefined,
      thinkingDurationSecs: isDeepThinkEnabled ? 1.8 : undefined,
    };
  }

  // 3. Code Generation and Technical Queries
  const isCodeQuery =
    /\b(code|function|react|typescript|javascript|python|component|css|html|sql|api|webrtc|regex|algorithm|docker|hook|state)\b/i.test(
      lower,
    );

  if (isCodeQuery) {
    let sampleCode = `// Example: Production WebSocket Signaling Bridge for WebRTC\nexport class SignalingBridge {\n  private socket: WebSocket | null = null;\n\n  connect(url: string): Promise<void> {\n    return new Promise((resolve, reject) => {\n      this.socket = new WebSocket(url);\n      this.socket.onopen = () => resolve();\n      this.socket.onerror = (err) => reject(err);\n    });\n  }\n\n  sendSignal(type: 'offer' | 'answer' | 'ice', payload: unknown) {\n    if (this.socket?.readyState === WebSocket.OPEN) {\n      this.socket.send(JSON.stringify({ type, payload, timestamp: Date.now() }));\n    }\n  }\n}`;
    let codeLang = 'typescript';

    if (lower.includes('python')) {
      sampleCode = `# Python 3.12 Concurrent Task Pipeline\nimport asyncio\nfrom typing import List, Any\n\nasync def process_batch(items: List[Any]) -> List[dict]:\n    async def worker(item):\n        await asyncio.sleep(0.05)\n        return {"item": item, "processed": True}\n\n    return await asyncio.gather(*(worker(x) for x in items))\n\n# Run pipeline\nresult = asyncio.run(process_batch(["chunk_1", "chunk_2", "chunk_3"]))\nprint(result)`;
      codeLang = 'python';
    } else if (lower.includes('react') || lower.includes('hook') || lower.includes('component')) {
      sampleCode = `import React, { useState, useEffect } from 'react';\n\nexport const RealtimeStatus = ({ endpoint }: { endpoint: string }) => {\n  const [isOnline, setIsOnline] = useState<boolean>(true);\n\n  useEffect(() => {\n    const ping = setInterval(async () => {\n      try {\n        const res = await fetch(endpoint, { method: 'HEAD' });\n        setIsOnline(res.ok);\n      } catch {\n        setIsOnline(false);\n      }\n    }, 10_000);\n    return () => clearInterval(ping);\n  }, [endpoint]);\n\n  return (\n    <div className="flex items-center gap-2 text-xs font-mono">\n      <span className={\`w-2 h-2 rounded-full \${isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}\`} />\n      <span>{isOnline ? 'System Operational' : 'Reconnecting...'}</span>\n    </div>\n  );\n};`;
      codeLang = 'tsx';
    }

    const content = [
      `Here is a clean, production-ready implementation tailored to your query:\n`,
      `\`\`\`${codeLang}\n${sampleCode}\n\`\`\`\n`,
      `### Key Architecture Highlights:`,
      `1. **Type Safety & Reliability:** Explicit typings with zero runtime ambiguities.`,
      `2. **Resource Cleanup:** Automatic teardown of listeners and timer references to prevent memory leaks.`,
      `3. **Resilience:** Graceful error handling with fallback states for network disruptions.\n`,
      `Feel free to ask if you need unit tests, edge-case handling, or integration details!`,
    ].join('\n');

    return {
      content,
      modelId: modelId === 'leo-coder' ? 'leo-coder' : modelId,
      thinkingContent: isDeepThinkEnabled
        ? `1. Identified programming task: "${trimmed}"\n2. Chose idiomatic conventions for ${codeLang}\n3. Constructed robust implementation incorporating concurrency, clean API, and proper typing\n4. Verified syntax and annotated key architectural considerations.`
        : undefined,
      thinkingDurationSecs: isDeepThinkEnabled ? 3.6 : undefined,
    };
  }

  // 4. General Knowledge / Deep Reasoning Responses
  const sources: AiWebSource[] = isWebSearchEnabled
    ? [
        {
          title: 'LeoChat Realtime Systems Documentation',
          url: 'https://leochat.internal/docs/ai',
          snippet:
            'Comprehensive guide to LeoChat neural chat models, WebSocket protocols, and WebRTC signalling.',
        },
        {
          title: 'MDN Web Technology Guidelines',
          url: 'https://developer.mozilla.org',
          snippet:
            'Standardized specifications for modern client-side architectures and asynchronous streaming.',
        },
      ]
    : [];

  const content = [
    `I've analyzed your question: **"${trimmed}"**.\n`,
    `### Comprehensive Overview`,
    `Here are the core principles and direct insights regarding this topic:\n`,
    `- **Primary Concept:** Addressing the core challenge requires structuring the workflow into decoupled, testable components with clearly defined boundaries.`,
    `- **Performance & Scalability:** Keeping latency minimal while maintaining high throughput across distributed nodes.`,
    `- **Security & Best Practices:** Enforce strict validation, least-privilege access, and automated end-to-end verification.\n`,
    `### Recommended Next Steps`,
    `1. Define explicit constraints and boundary requirements.`,
    `2. Prototype an iterative solution and benchmark latency.`,
    `3. Test against edge cases and degraded network conditions.\n`,
    `Let me know if you would like me to dive deeper into any specific section or provide an actionable example!`,
  ].join('\n');

  return {
    content,
    modelId,
    sources: sources.length > 0 ? sources : undefined,
    thinkingContent: isDeepThinkEnabled
      ? `1. Deconstructing query: "${trimmed}".\n2. Cross-referencing knowledge corpus and identifying key analytical dimensions.\n3. Formulating structured breakdown with practical takeaways.\n4. Auditing clarity, tone, and conciseness.`
      : undefined,
    thinkingDurationSecs: isDeepThinkEnabled ? 3.2 : undefined,
  };
}
