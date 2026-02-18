import { DataRoomFolder } from '@/hooks/useDataRoom';

const KEYWORD_MAP: Array<{ keywords: string[]; categoryPatterns: string[] }> = [
  {
    keywords: ['p&l', 'income', 'financial', 'revenue', 'tax', 'balance', 'cashflow', 'cash flow', 'profit', 'loss', 'statement', 'audit'],
    categoryPatterns: ['financial', 'finance', 'accounts'],
  },
  {
    keywords: ['contract', 'agreement', 'nda', 'legal', 'articles', 'incorporation', 'bylaws', 'constitution', 'shareholder', 'operating'],
    categoryPatterns: ['corporate', 'legal', 'compliance'],
  },
  {
    keywords: ['operations', 'sop', 'process', 'workflow', 'procedure', 'manual', 'playbook'],
    categoryPatterns: ['operations', 'operational'],
  },
  {
    keywords: ['client', 'customer', 'subscription', 'mrr', 'arr', 'retention', 'churn'],
    categoryPatterns: ['client', 'customer', 'contracts'],
  },
  {
    keywords: ['marketing', 'sales', 'pitch', 'deck', 'presentation', 'funnel', 'pipeline', 'leads'],
    categoryPatterns: ['marketing', 'sales', 'commercial'],
  },
  {
    keywords: ['employee', 'hr', 'payroll', 'org chart', 'team', 'staff', 'headcount', 'benefits'],
    categoryPatterns: ['hr', 'human resources', 'team', 'people'],
  },
  {
    keywords: ['ip', 'patent', 'trademark', 'copyright', 'technology', 'software', 'source code'],
    categoryPatterns: ['intellectual property', 'technology', 'ip'],
  },
  {
    keywords: ['asset', 'inventory', 'equipment', 'property', 'real estate'],
    categoryPatterns: ['assets', 'property'],
  },
];

/**
 * Maps a filename to the best matching data room folder ID using keyword matching.
 * Returns null if no folder matches.
 */
export function mapFileToFolder(fileName: string, folders: DataRoomFolder[]): string | null {
  if (!folders || folders.length === 0) return null;

  const nameLower = fileName.toLowerCase();

  for (const mapping of KEYWORD_MAP) {
    const keywordMatch = mapping.keywords.some(kw => nameLower.includes(kw));
    if (!keywordMatch) continue;

    // Find a folder whose name matches any of the category patterns
    const matchedFolder = folders.find(folder => {
      const folderNameLower = folder.name.toLowerCase();
      return mapping.categoryPatterns.some(pattern => folderNameLower.includes(pattern));
    });

    if (matchedFolder) {
      return matchedFolder.id;
    }
  }

  return null;
}
