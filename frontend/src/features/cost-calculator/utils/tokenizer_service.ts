import { get_encoding } from 'tiktoken';

// Cache encoders
let o200kEncoder: any = null;
let cl100kEncoder: any = null;

try {
  o200kEncoder = get_encoding('o200k_base');
  cl100kEncoder = get_encoding('cl100k_base');
} catch (error) {
  console.warn("Failed to initialize tiktoken encoders. Fallbacks will be used.", error);
}

export function estimateTextTokens(text: string, providerSlug: string): number {
  if (!text) return 0;

  const slug = providerSlug.toLowerCase();

  if (slug.includes('openai') || slug === 'openai') {
    if (o200kEncoder) {
      try {
        return o200kEncoder.encode(text).length;
      } catch (e) {
        // Fallback
      }
    }
    return Math.ceil(text.length * 0.25);
  } else if (slug.includes('anthropic') || slug === 'anthropic') {
    if (cl100kEncoder) {
      try {
        return cl100kEncoder.encode(text).length;
      } catch (e) {
        // Fallback
      }
    }
    return Math.ceil(text.length * 0.25);
  } else if (slug.includes('google') || slug === 'gemini') {
    return Math.ceil(text.length * 0.255);
  } else {
    // Generic fallback for others
    if (cl100kEncoder) {
        try {
            return cl100kEncoder.encode(text).length;
        } catch(e) {}
    }
    return Math.ceil(text.length * 0.25);
  }
}

export type ImageResolution = 'low' | 'medium' | 'high';

const resMap = {
  'low': { w: 512, h: 512 },
  'medium': { w: 1024, h: 1024 },
  'high': { w: 2048, h: 2048 }
};

export function estimateImageTokens(count: number, resolution: ImageResolution, providerSlug: string): number {
  if (count <= 0) return 0;

  const { w, h } = resMap[resolution];
  let perImageTokens = 0;
  const slug = providerSlug.toLowerCase();

  if (slug.includes('openai') || slug === 'openai') {
    let scaledW = w;
    let scaledH = h;
    
    if (scaledW > 2048 || scaledH > 2048) {
      const scale = 2048 / Math.max(scaledW, scaledH);
      scaledW = Math.round(scaledW * scale);
      scaledH = Math.round(scaledH * scale);
    }
    
    if (Math.min(scaledW, scaledH) > 768) {
      const scale = 768 / Math.min(scaledW, scaledH);
      scaledW = Math.round(scaledW * scale);
      scaledH = Math.round(scaledH * scale);
    }
    
    const tiles = Math.ceil(scaledW / 512) * Math.ceil(scaledH / 512);
    perImageTokens = 85 + (170 * tiles);
  } else if (slug.includes('anthropic') || slug === 'anthropic') {
    perImageTokens = Math.ceil(w / 28) * Math.ceil(h / 28);
  } else if (slug.includes('google') || slug === 'gemini') {
    if (w <= 384 && h <= 384) {
      perImageTokens = 258;
    } else {
      perImageTokens = Math.ceil(w / 768) * Math.ceil(h / 768) * 258;
    }
  } else {
    // Generic fallback
    perImageTokens = 1000;
  }

  return perImageTokens * count;
}
