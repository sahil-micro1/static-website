// Shared store for all benchmark leaderboards.
// Key = benchmark id (matches data-benchmark-id on the widget).
window.benchmarks_data = window.benchmarks_data || {};

window.benchmarks_data["medical"] = {
  lastUpdated: "June 18, 2026",
  defaultTab: "best-at-3",
  tabs: [
    {
      id: "best-at-3",
      label: "Best@3 score",
      rows: [
        { name: "Claude Sonnet  5", score: 88.4, iconStyle: "claude" },
        { name: "Muse Spark 1.1 (xhigh)", score: 87.4, iconStyle: "meta" },
        { name: "Claude Opus  4.8", score: 87.3, iconStyle: "claude" },
        { name: "GPT-5.6-sol (xhigh)", score: 84.1, iconStyle: "openai" },
        { name: "Grok 4.5 (high)", score: 83.7, iconStyle: "grok" },
        { name: "GPT-5.5", score: 82.0, iconStyle: "openai" },
        { name: "Inkling (xhigh)", score: 81.2, iconStyle: "thinking-machine" },
        { name: "Gemini 3.5 Flash", score: 80.5, iconStyle: "gemini" },
      ],
    },
    {
      id: "mean",
      label: "Mean score",
      rows: [
        { name: "Claude Sonnet  5", score: 82.8, iconStyle: "claude" },
        { name: "Claude Opus  4.8", score: 82.6, iconStyle: "claude" },
        { name: "Muse Spark 1.1 (xhigh)", score: 82.4, iconStyle: "meta" },
        { name: "Grok 4.5 (high)", score: 79.7, iconStyle: "grok" },
        { name: "GPT-5.6-sol (xhigh)", score: 78.3, iconStyle: "openai" },
        { name: "GPT-5.5", score: 76.2, iconStyle: "openai" },
        { name: "Gemini 3.5 Flash", score: 75.6, iconStyle: "gemini" },
        { name: "Inkling (xhigh)", score: 70.8, iconStyle: "thinking-machine" },
      ],
    },
  ],
};

window.benchmarks_data = window.benchmarks_data || {};

window.benchmarks_data["tax"] = {
  lastUpdated: "July 10, 2026",
  defaultTab: "best-at-3",
  tabs: [
    {
      id: "best-at-3",
      label: "Best@3 score",
      rows: [
        { name: "Claude Fable 5", score: 57.4, iconStyle: "claude" },
        { name: "Claude Opus 4.8", score: 56.2, iconStyle: "claude" },
        { name: "Claude Sonnet 5", score: 55.1, iconStyle: "claude" },
        { name: "GPT-5.6-sol (xhigh)", score: 53.2, iconStyle: "openai" },
        {
          name: "Gemini 3.5-flash-thinking-high",
          score: 51.1,
          iconStyle: "gemini",
        },
        { name: "GPT-5.5-thinking-high", score: 50.0, iconStyle: "openai" },
        {
          name: "Claude Opus 4.7-thinking-adaptive-high",
          score: 49.8,
          iconStyle: "claude",
        },
        { name: "Grok 4.5 (high)", score: 49.2, iconStyle: "grok" },
        { name: "Muse Spark 1.1 (xhigh)", score: 42.5, iconStyle: "meta" },
        { name: "GPT-5.4", score: 41.0, iconStyle: "openai" },
        { name: "Claude Opus 4.6", score: 32.8, iconStyle: "claude" },
        { name: "Gemini 3.1 Pro", score: 32.3, iconStyle: "gemini" },
        { name: "Inkling (xhigh)", score: 28.3, iconStyle: "thinking-machine" },
      ],
    },
    {
      id: "mean",
      label: "Mean score",
      rows: [
        { name: "Claude Fable 5", score: 52.3, iconStyle: "claude" },
        { name: "Claude Sonnet 5", score: 48.1, iconStyle: "claude" },
        { name: "Claude Opus 4.8", score: 47.7, iconStyle: "claude" },
        { name: "GPT-5.6-sol (xhigh)", score: 46.4, iconStyle: "openai" },
        { name: "Claude Opus 4.7", score: 43.5, iconStyle: "claude" },
        { name: "GPT-5.5-thinking-high", score: 42.6, iconStyle: "openai" },
        {
          name: "Gemini 3.5-flash-thinking-high",
          score: 42.5,
          iconStyle: "gemini",
        },
        { name: "Grok 4.5 (high)", score: 42.0, iconStyle: "grok" },
        { name: "Muse Spark 1.1 (xhigh)", score: 34.2, iconStyle: "meta" },
        { name: "GPT-5.4", score: 33.6, iconStyle: "openai" },
        { name: "Claude Opus 4.6", score: 27.5, iconStyle: "claude" },
        { name: "Gemini 3.1 Pro", score: 26.8, iconStyle: "gemini" },
        { name: "Inkling (xhigh)", score: 16.4, iconStyle: "thinking-machine" },
      ],
    },
  ],
};
window.benchmarks_data = window.benchmarks_data || {};

window.benchmarks_data["legal"] = {
  lastUpdated: "July 10, 2026",
  defaultTab: "best-at-3",
  tabs: [
    {
      id: "best-at-3",
      label: "Best@3 score",
      rows: [
        { name: "Claude Fable 5", score: 63.4, iconStyle: "claude" },
        { name: "GPT-5.6-sol (xhigh)", score: 53.9, iconStyle: "openai" },
        { name: "Muse Spark 1.1 (xhigh)", score: 50.2, iconStyle: "meta" },
        { name: "Grok 4.5 (high)", score: 49.2, iconStyle: "grok" },
        { name: "Claude Sonnet 5", score: 47.3, iconStyle: "claude" },
        { name: "Claude Opus 4.8", score: 43.6, iconStyle: "claude" },
        { name: "Claude Opus 4.7", score: 41.0, iconStyle: "claude" },
        { name: "GPT-5.5", score: 39.4, iconStyle: "openai" },
        { name: "Gemini 3.1 Pro", score: 26.9, iconStyle: "gemini" },
      ],
    },
    {
      id: "mean",
      label: "Mean score",
      rows: [
        { name: "Claude Fable 5", score: 55.7, iconStyle: "claude" },
        { name: "GPT-5.6-sol (xhigh)", score: 48.5, iconStyle: "openai" },
        { name: "Grok 4.5 (high)", score: 43.2, iconStyle: "grok" },
        { name: "Muse Spark 1.1 (xhigh)", score: 42.3, iconStyle: "meta" },
        { name: "Claude Sonnet 5", score: 40.9, iconStyle: "claude" },
        { name: "Claude Opus 4.8", score: 38.2, iconStyle: "claude" },
        { name: "Claude Opus 4.7", score: 35.8, iconStyle: "claude" },
        { name: "GPT-5.5", score: 35.1, iconStyle: "openai" },
        { name: "Gemini 3.1 Pro", score: 21.9, iconStyle: "gemini" },
      ],
    },
  ],
};

window.benchmarks_data = window.benchmarks_data || {};

window.benchmarks_data["finance"] = {
  lastUpdated: "July 10, 2026",
  defaultTab: "best-at-3",
  tabs: [
    {
      id: "best-at-3",
      label: "Best@3 score",
      rows: [
        { name: "Muse Spark 1.1 (xhigh)", score: 53.7, iconStyle: "meta" },
        { name: "Claude Fable 5", score: 51.2, iconStyle: "claude" },
        { name: "GPT-5.5", score: 50.8, iconStyle: "openai" },
        { name: "Claude Sonnet 5", score: 50.0, iconStyle: "claude" },
        { name: "Claude Opus 4.8", score: 49.5, iconStyle: "claude" },
        { name: "Grok 4.5 (high)", score: 48.6, iconStyle: "grok" },
        { name: "GPT-5.6-sol (xhigh)", score: 48.5, iconStyle: "openai" },
        { name: "Claude Opus 4.7", score: 48.4, iconStyle: "claude" },
        { name: "Gemini 3.1 Pro", score: 46.8, iconStyle: "gemini" },
        { name: "Inkling (xhigh)", score: 33.1, iconStyle: "thinking-machine" },
      ],
    },
    {
      id: "mean",
      label: "Mean score",
      rows: [
        { name: "Claude Fable 5", score: 47.8, iconStyle: "claude" },
        { name: "Muse Spark 1.1 (xhigh)", score: 45.0, iconStyle: "meta" },
        { name: "GPT-5.6-sol (xhigh)", score: 44.8, iconStyle: "openai" },
        { name: "GPT-5.5", score: 44.3, iconStyle: "openai" },
        { name: "Claude Sonnet 5", score: 43.2, iconStyle: "claude" },
        { name: "Claude Opus 4.8", score: 43.1, iconStyle: "claude" },
        { name: "Grok 4.5 (high)", score: 43.1, iconStyle: "grok" },
        { name: "Claude Opus 4.7", score: 40.9, iconStyle: "claude" },
        { name: "Gemini 3.1 Pro", score: 39.6, iconStyle: "gemini" },
        { name: "Inkling (xhigh)", score: 22.5, iconStyle: "thinking-machine" },
      ],
    },
  ],
};

window.benchmarks_data = window.benchmarks_data || {};

window.benchmarks_data["contract"] = {
  lastUpdated: "July 10, 2026",
  defaultTab: "mean",
  tabs: [
    {
      id: "mean",
      label: "Mean score",
      rows: [
        { name: "GPT-5.5", score: 50.5, iconStyle: "openai" },
        { name: "Claude Fable 5*", score: 47.3, iconStyle: "claude" },
        { name: "Gemini 3.5 Flash", score: 45.1, iconStyle: "gemini" },
        { name: "Claude Opus 4.8", score: 44.4, iconStyle: "claude" },
      ],
    },
  ],
};

window.benchmarks_data = window.benchmarks_data || {};

window.benchmarks_data["long-extraction"] = {
  lastUpdated: "July 10, 2026",
  defaultTab: "recall",
  tabs: [
    {
      id: "recall",
      label: "Recall",
      rows: [
        { name: "Reducto Deep Extract", score: 99.6, iconStyle: "reducto" },
        { name: "Extend MAX", score: 92.7, iconStyle: "extend" },
        {
          name: "LlamaExtract - Agentic",
          score: 77.5,
          iconStyle: "llama-extract",
        },
        { name: "Claude Opus 4.8", score: 70.7, iconStyle: "claude" },
        { name: "GPT-5.5", score: 52.7, iconStyle: "openai" },
        { name: "Gemini 3.1 Pro", score: 48.6, iconStyle: "gemini" },
        {
          name: "Datalab Extract - Balanced",
          score: 33.8,
          iconStyle: "datalab-extract",
        },
      ],
    },
  ],
};
