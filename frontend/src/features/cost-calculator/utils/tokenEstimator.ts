export const estimateTokens = (text: string): number => {
  if (!text) return 0;
  // A standard rough estimation: 1 word ≈ 1.3 tokens. 
  // Alternatively, 1 token ≈ 4 characters for English text.
  // We'll use character count / 4 for a quick client-side estimation.
  return Math.ceil(text.length / 4);
};
