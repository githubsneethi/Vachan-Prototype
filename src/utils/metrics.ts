/**
 * Objective evaluation metrics for ASR research bench
 * Word Error Rate (WER), Character Error Rate (CER), Levenshtein distance,
 * Accuracy, Precision, Recall, and Confusion Matrix.
 */

export interface EvaluationReport {
  totalSamples: number;
  meanWer: number;
  meanCer: number;
  overallAccuracy: number;
  clearSpeechWer: number;
  unclearSpeechWer: number;
  confusionMatrix: {
    labels: string[];
    matrix: number[][];
  };
  sampleResults: {
    id: string;
    reference: string;
    hypothesis: string;
    category: string;
    wer: number;
    cer: number;
    substitutions: number;
    deletions: number;
    insertions: number;
  }[];
}

/**
 * Computes Levenshtein edit distance between two arrays
 */
export function computeEditDistance<T>(ref: T[], hyp: T[]): {
  distance: number;
  substitutions: number;
  deletions: number;
  insertions: number;
} {
  const n = ref.length;
  const m = hyp.length;
  
  // DP matrix: [i][j] = { cost, op }
  const dp: number[][] = Array.from({ length: n + 1 }, () => Array(m + 1).fill(0));
  const ops: string[][] = Array.from({ length: n + 1 }, () => Array(m + 1).fill(''));

  for (let i = 0; i <= n; i++) dp[i][0] = i;
  for (let j = 0; j <= m; j++) dp[0][j] = j;

  for (let i = 1; i <= n; i++) {
    for (let j = 1; j <= m; j++) {
      if (ref[i - 1] === hyp[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
        ops[i][j] = 'C'; // Correct
      } else {
        const sub = dp[i - 1][j - 1] + 1;
        const del = dp[i - 1][j] + 1;
        const ins = dp[i][j + 1] ? dp[i][j - 1] + 1 : dp[i][j - 1] + 1;

        const min = Math.min(sub, del, ins);
        dp[i][j] = min;
        if (min === sub) ops[i][j] = 'S';
        else if (min === del) ops[i][j] = 'D';
        else ops[i][j] = 'I';
      }
    }
  }

  // Backtrack to count operations
  let i = n;
  let j = m;
  let sub = 0;
  let del = 0;
  let ins = 0;

  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && ref[i - 1] === hyp[j - 1]) {
      i--;
      j--;
    } else if (i > 0 && j > 0 && dp[i][j] === dp[i - 1][j - 1] + 1) {
      sub++;
      i--;
      j--;
    } else if (i > 0 && dp[i][j] === dp[i - 1][j] + 1) {
      del++;
      i--;
    } else {
      ins++;
      j--;
    }
  }

  return {
    distance: dp[n][m],
    substitutions: sub,
    deletions: del,
    insertions: ins,
  };
}

/**
 * Computes Word Error Rate (WER)
 */
export function calculateWER(reference: string, hypothesis: string): {
  wer: number;
  substitutions: number;
  deletions: number;
  insertions: number;
  wordCount: number;
} {
  const cleanRef = reference.toLowerCase().replace(/[^\w\s]/g, '').trim().split(/\s+/).filter(Boolean);
  const cleanHyp = hypothesis.toLowerCase().replace(/[^\w\s]/g, '').trim().split(/\s+/).filter(Boolean);

  if (cleanRef.length === 0) {
    return {
      wer: cleanHyp.length === 0 ? 0 : 1.0,
      substitutions: 0,
      deletions: 0,
      insertions: cleanHyp.length,
      wordCount: 0,
    };
  }

  const { distance, substitutions, deletions, insertions } = computeEditDistance(cleanRef, cleanHyp);
  const wer = Number((distance / cleanRef.length).toFixed(3));

  return {
    wer,
    substitutions,
    deletions,
    insertions,
    wordCount: cleanRef.length,
  };
}

/**
 * Computes Character Error Rate (CER)
 */
export function calculateCER(reference: string, hypothesis: string): number {
  const refChars = reference.toLowerCase().replace(/\s+/g, ' ').trim().split('');
  const hypChars = hypothesis.toLowerCase().replace(/\s+/g, ' ').trim().split('');

  if (refChars.length === 0) return hypChars.length === 0 ? 0 : 1.0;

  const { distance } = computeEditDistance(refChars, hypChars);
  return Number((distance / refChars.length).toFixed(3));
}
