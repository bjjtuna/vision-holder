// [accelerate] Systemic Ledger Core Implementation
// Based on contract: /03_contract/[clarify]-system-architecture-schema.md

export interface LedgerEntry {
  id: string;
  timestamp: string;
  purpose_tag: '[clarify]' | '[accelerate]' | '[safeguard]' | '[monetize]' | '[empathize]' | '[delight]';
  level: 'mission' | 'pillar' | 'epic' | 'saga' | 'probe';
  seek: string;
  why: string;
  content: Record<string, any>;
  status: 'proposed' | 'active' | 'blocked' | 'integrated' | 'archived' | 'dormant';
}

export interface LedgerFilter {
  level?: LedgerEntry['level'];
  purpose_tag?: LedgerEntry['purpose_tag'];
  status?: LedgerEntry['status'];
  startDate?: string;
  endDate?: string;
}

export class SystemicLedger {
  private entries: LedgerEntry[] = [];
  private readonly storageKey = 'vision-holder-systemic-ledger';

  constructor() {
    this.loadFromStorage();
  }

  /**
   * Add a new entry to the ledger (append-only)
   */
  addEntry(entry: Omit<LedgerEntry, 'id' | 'timestamp'>): LedgerEntry {
    const newEntry: LedgerEntry = {
      ...entry,
      id: this.generateId(),
      timestamp: new Date().toISOString()
    };

    this.entries.push(newEntry);
    this.saveToStorage();
    
    return newEntry;
  }

  /**
   * Retrieve entries with optional filtering
   */
  getEntries(filter?: LedgerFilter): LedgerEntry[] {
    let filtered = [...this.entries];

    if (filter?.level) {
      filtered = filtered.filter(entry => entry.level === filter.level);
    }

    if (filter?.purpose_tag) {
      filtered = filtered.filter(entry => entry.purpose_tag === filter.purpose_tag);
    }

    if (filter?.status) {
      filtered = filtered.filter(entry => entry.status === filter.status);
    }

    if (filter?.startDate) {
      filtered = filtered.filter(entry => entry.timestamp >= filter.startDate!);
    }

    if (filter?.endDate) {
      filtered = filtered.filter(entry => entry.timestamp <= filter.endDate!);
    }

    return filtered.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  /**
   * Update entry status (only status can be modified)
   */
  updateEntryStatus(id: string, status: LedgerEntry['status']): LedgerEntry | null {
    const entryIndex = this.entries.findIndex(entry => entry.id === id);
    if (entryIndex === -1) return null;

    this.entries[entryIndex].status = status;
    this.saveToStorage();
    
    return this.entries[entryIndex];
  }

  /**
   * Get current mission and pillars
   */
  getCurrentMission(): LedgerEntry | null {
    const missions = this.getEntries({ level: 'mission', status: 'active' });
    return missions.length > 0 ? missions[0] : null;
  }

  getCurrentPillars(): LedgerEntry[] {
    return this.getEntries({ level: 'pillar', status: 'active' });
  }

  /**
   * Check if a new entry aligns with current mission and pillars
   */
  checkAlignment(entry: Omit<LedgerEntry, 'id' | 'timestamp'>): { aligned: boolean; reasons: string[] } {
    const mission = this.getCurrentMission();
    const pillars = this.getCurrentPillars();
    const reasons: string[] = [];

    if (!mission) {
      reasons.push('No active mission found');
      return { aligned: false, reasons };
    }

    // Check if entry purpose aligns with mission seek
    if (entry.seek && mission.content.seek && !this.seeksAlign(entry.seek, mission.content.seek)) {
      reasons.push(`Entry seek "${entry.seek}" may not align with mission seek "${mission.content.seek}"`);
    }

    // Check if entry aligns with pillars
    for (const pillar of pillars) {
      if (pillar.content.seek && !this.seeksAlign(entry.seek, pillar.content.seek)) {
        reasons.push(`Entry may conflict with pillar: ${pillar.content.title || pillar.id}`);
      }
    }

    return {
      aligned: reasons.length === 0,
      reasons
    };
  }

  /**
   * Get entries by level for roadmap display
   */
  getRoadmapData(): Record<LedgerEntry['level'], LedgerEntry[]> {
    return {
      mission: this.getEntries({ level: 'mission' }),
      pillar: this.getEntries({ level: 'pillar' }),
      epic: this.getEntries({ level: 'epic' }),
      saga: this.getEntries({ level: 'saga' }),
      probe: this.getEntries({ level: 'probe' })
    };
  }

  /**
   * Export ledger for backup or analysis
   */
  exportLedger(): LedgerEntry[] {
    return [...this.entries];
  }

  /**
   * Import ledger entries (for migration or backup restoration)
   */
  importLedger(entries: LedgerEntry[]): void {
    this.entries = [...this.entries, ...entries];
    this.saveToStorage();
  }

  private generateId(): string {
    return `entry_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private seeksAlign(entrySeek: string, targetSeek: string): boolean {
    // Simple alignment check - can be enhanced with semantic analysis
    const seekKeywords: Record<string, string[]> = {
      'establish': ['establish', 'create', 'initiate', 'found'],
      'validate': ['validate', 'test', 'verify', 'confirm'],
      'protect': ['protect', 'safeguard', 'secure', 'defend'],
      'accelerate': ['accelerate', 'speed', 'optimize', 'improve'],
      'clarify': ['clarify', 'understand', 'explain', 'document'],
      'empathize': ['empathize', 'understand', 'support', 'help'],
      'delight': ['delight', 'satisfy', 'please', 'enjoy']
    };

    const entryKeywords = seekKeywords[entrySeek.toLowerCase()] || [entrySeek.toLowerCase()];
    const targetKeywords = seekKeywords[targetSeek.toLowerCase()] || [targetSeek.toLowerCase()];

    return entryKeywords.some((keyword: string) => 
      targetKeywords.some((target: string) => target.includes(keyword) || keyword.includes(target))
    );
  }

  private saveToStorage(): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(this.storageKey, JSON.stringify(this.entries));
    }
  }

  private loadFromStorage(): void {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        try {
          this.entries = JSON.parse(stored);
        } catch (error) {
          console.error('Failed to load ledger from storage:', error);
          this.entries = [];
        }
      }
    }
  }
}

// Singleton instance
export const systemicLedger = new SystemicLedger(); 