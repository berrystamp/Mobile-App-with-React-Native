export type FaqItem = {
  id: string;
  question: string;
  answer: string;
};

const stripTags = (value: string) =>
  value
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/\s+/g, ' ')
    .trim();

const decodeJsonEscapes = (value: string) => value.replace(/\\u003c/gi, '<').replace(/\\u003e/gi, '>');

const asArray = (value: any): any[] => (Array.isArray(value) ? value : []);

export const extractFaqFromHtml = (html: string): FaqItem[] => {
  if (!html) return [];
  const normalized = decodeJsonEscapes(html);

  const jsonLdMatch = normalized.match(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi) || [];
  for (const block of jsonLdMatch) {
    const scriptContent = block.replace(/^.*?>/, '').replace(/<\/script>$/, '').trim();
    try {
      const parsed = JSON.parse(scriptContent);
      const entities = asArray(parsed).length ? asArray(parsed) : asArray(parsed && parsed.mainEntity);
      const jsonLdItems = entities
        .map((item: any, index: number) => {
          const acceptedAnswer = item && item.acceptedAnswer ? item.acceptedAnswer.text : '';
          return {
            id: String((item && item.id) || (item && item.identifier) || index + 1),
            question: String((item && item.name) || (item && item.question) || '').trim(),
            answer: stripTags(String(acceptedAnswer || (item && item.answer) || '')),
          };
        })
        .filter((item: FaqItem) => item.question && item.answer);

      if (jsonLdItems.length) return jsonLdItems;
    } catch (error) {
      // keep trying other extraction strategies
    }
  }

  const pairRegex = /<(?:h[1-6]|button|summary|div)[^>]*>([^<\n\r]{8,200}\?)<\/[^>]+>[\s\S]{0,200}<(?:p|div)[^>]*>([\s\S]{20,1000}?)<\/(?:p|div)>/gi;
  const items: FaqItem[] = [];
  const seen = new Set<string>();

  let match = pairRegex.exec(normalized);
  while (match) {
    const question = stripTags(match[1] || '');
    const answer = stripTags(match[2] || '');
    const key = `${question}::${answer}`;
    if (question && answer && !seen.has(key)) {
      seen.add(key);
      items.push({ id: String(items.length + 1), question, answer });
    }
    match = pairRegex.exec(normalized);
  }

  return items;
};
