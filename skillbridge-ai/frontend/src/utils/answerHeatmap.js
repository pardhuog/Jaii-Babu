/**
 * answerHeatmap.js
 * ─────────────────────────────────────────────────────────────
 * UNIQUE FEATURE 2: Answer Precision Heatmap
 *
 * Classifies every word the user speaks/types into 4 categories:
 *   🟢 TECHNICAL — domain keywords, programming terms, etc.
 *   🔴 FILLER    — "um", "uh", "like", "basically", "you know"
 *   🔵 QUANTIFIER — numbers, percentages, time references, metrics
 *   🟡 VAGUE     — "good", "great", "nice", "thing", "stuff", "a lot"
 *   ⬜ NEUTRAL   — everything else
 *
 * Returns:
 *   annotatedWords  — [{word, type, display}]
 *   precision score — penalises fillers/vague, rewards technical/quantifier
 *
 * This is genuinely novel: no interview platform shows the
 * "anatomy" of your answer back to you word-by-word.
 */

/* ── Wordlists ─────────────────────────────────────────────── */
const FILLER_WORDS = new Set([
  'um','uh','ah','er','hmm','mm','like','basically','literally',
  'actually','honestly','obviously','clearly','you','know','sort','of',
  'kind','i','mean','right','so','yeah','okay','well','just',
  'very','really','quite','simply','totally','definitely','absolutely',
]);

const VAGUE_WORDS = new Set([
  'good','great','nice','fine','okay','bad','stuff','things','thing',
  'something','everything','anything','lot','lots','many','few','some',
  'several','various','certain','different','similar','same','big','small',
  'better','best','more','less','alot','kinda','sorta','whatever',
]);

const QUANTIFIER_PATTERN = /^(\d+[\d,.]*%?|[\d,.]+[kKmMbBxX]?|\d+\+|\d+-\d+|first|second|third|twice|once|\d+(st|nd|rd|th))$/i;

// Domain-agnostic technical vocabulary
const TECH_WORDS = new Set([
  // CS fundamentals
  'algorithm','complexity','runtime','memory','cache','recursion','iteration',
  'stack','queue','heap','tree','graph','array','linked','list','hash','map',
  'set','binary','search','sort','bubble','merge','quick','depth','breadth',
  'dynamic','programming','greedy','backtrack','divide','conquer',
  // Systems
  'api','rest','grpc','http','https','tcp','udp','dns','ssl','tls','jwt',
  'oauth','websocket','microservice','monolith','serverless','container',
  'docker','kubernetes','cloud','aws','gcp','azure','lambda','s3','ec2',
  // Databases
  'sql','nosql','postgresql','mysql','mongodb','redis','cassandra','index',
  'query','join','transaction','acid','base','schema','migration','orm',
  'sharding','replication','partition','normalization','denormalization',
  // Programming
  'class','object','interface','abstract','inheritance','polymorphism',
  'encapsulation','solid','dry','function','async','await','promise','thread',
  'concurrent','parallel','mutex','semaphore','callback','event','hook',
  'component','state','props','redux','context','typescript','javascript',
  'python','java','golang','rust','node','react','angular','vue','next',
  // Engineering practices
  'test','unit','integration','e2e','tdd','bdd','ci','cd','pipeline','deploy',
  'rollback','canary','blue','green','ab','monitoring','logging','tracing',
  'observability','sla','slo','sre','incident','postmortem','sprint','agile',
  'scrum','kanban','pr','code','review','lint','refactor','technical','debt',
  // Data / AI
  'model','training','inference','neural','network','deep','learning','machine',
  'feature','engineering','dataset','validation','accuracy','precision','recall',
  'f1','loss','gradient','descent','epoch','batch','overfitting','underfitting',
  'regression','classification','clustering','embedding','transformer','llm',
  'vector','similarity','cosine','euclidean','principal','component',
  // Architecture
  'architecture','design','pattern','singleton','factory','observer','strategy',
  'decorator','facade','adapter','proxy','event','driven','cqrs','saga','mvc',
  'mvvm','repository','service','layer','domain','bounded','context','ddd',
  // Performance
  'latency','throughput','bandwidth','bottleneck','profiling','benchmarking',
  'optimization','scalability','horizontal','vertical','load','balancer',
  'rate','limiting','circuit','breaker','timeout','retry','idempotent',
]);

/* ── Classifier ──────────────────────────────────────────────── */
function classifyWord(raw) {
  // Strip punctuation for matching, keep original for display
  const clean = raw.replace(/[^a-z0-9%+\-.,]/gi, '').toLowerCase();
  if (!clean) return 'neutral';
  if (FILLER_WORDS.has(clean))       return 'filler';
  if (QUANTIFIER_PATTERN.test(clean)) return 'quantifier';
  if (VAGUE_WORDS.has(clean))        return 'vague';
  if (TECH_WORDS.has(clean))         return 'technical';
  return 'neutral';
}

/* ── Main export ─────────────────────────────────────────────── */
export function analyzeAnswer(text) {
  if (!text || typeof text !== 'string') {
    return { annotatedWords: [], precision: 0, counts: {} };
  }

  // Split preserving punctuation groups
  const tokens = text.match(/\S+/g) || [];
  const annotated = tokens.map(word => ({
    word,
    type: classifyWord(word),
  }));

  const counts = { technical: 0, filler: 0, quantifier: 0, vague: 0, neutral: 0 };
  annotated.forEach(({ type }) => counts[type]++);

  const total = tokens.length || 1;

  // Precision score formula:
  //   +3 per technical word (expertise signals)
  //   +2 per quantifier (specificity signals)
  //   -3 per filler word (credibility damage)
  //   -1 per vague word (mild penalty)
  //   neutral = 0
  const raw =
    counts.technical  * 3 +
    counts.quantifier * 2 -
    counts.filler     * 3 -
    counts.vague      * 1;

  // Normalise: max possible is if every word is technical (+3 × total)
  const maxPossible = total * 3;
  const precision = Math.max(0, Math.min(100, Math.round(((raw + maxPossible) / (2 * maxPossible)) * 100)));

  return { annotatedWords: annotated, precision, counts, total };
}

/* ── Style map ───────────────────────────────────────────────── */
export const WORD_STYLES = {
  technical:  { bg: '#E6F4EA', color: '#1E8449', title: 'Technical term ✓' },
  filler:     { bg: '#FCE8E6', color: '#C0392B', title: 'Filler word – avoid these' },
  quantifier: { bg: '#E8F0FE', color: '#1558D6', title: 'Quantifier – great specificity!' },
  vague:      { bg: '#FFF8E1', color: '#B7770D', title: 'Vague word – be more precise' },
  neutral:    { bg: 'transparent', color: 'inherit', title: '' },
};
