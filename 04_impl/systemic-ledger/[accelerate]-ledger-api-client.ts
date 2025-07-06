// [accelerate] Systemic Ledger API Client
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

export class SystemicLedgerAPI {
  private readonly apiBaseUrl = 'http://localhost:3001';
  private cache: LedgerEntry[] = [];
  private lastFetch = 0;
  private readonly cacheTimeout = 30000; // 30 seconds

  constructor() {
    this.initializeFromAPI();
  }

  /**
   * Initialize ledger from API
   */
  private async initializeFromAPI(): Promise<void> {
    try {
      await this.refreshCache();
    } catch (error) {
      console.error('Failed to initialize from API:', error);
      // Fallback to empty cache
      this.cache = [];
    }
  }

  /**
   * Refresh cache from API
   */
  private async refreshCache(): Promise<void> {
    const now = Date.now();
    if (now - this.lastFetch < this.cacheTimeout) {
      return; // Use cached data
    }

    try {
      const response = await fetch(`${this.apiBaseUrl}/ledger/entries`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      this.cache = data.entries || [];
      this.lastFetch = now;
    } catch (error) {
      console.error('Failed to refresh cache:', error);
      throw error;
    }
  }

  /**
   * Add a new entry to the ledger via API
   */
  async addEntry(entry: Omit<LedgerEntry, 'id' | 'timestamp'>): Promise<LedgerEntry> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/ledger/entries`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(entry),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      const newEntry = result.entry;
      
      // Update cache
      this.cache.push(newEntry);
      
      return newEntry;
    } catch (error) {
      console.error('Failed to add entry:', error);
      throw error;
    }
  }

  /**
   * Retrieve entries with optional filtering
   */
  async getEntries(filter?: LedgerFilter): Promise<LedgerEntry[]> {
    await this.refreshCache();
    
    let filtered = [...this.cache];

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
   * Update entry status via API
   */
  async updateEntryStatus(id: string, status: LedgerEntry['status']): Promise<LedgerEntry | null> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/ledger/entries/${id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      const updatedEntry = result.entry;
      
      // Update cache
      const index = this.cache.findIndex(entry => entry.id === id);
      if (index !== -1) {
        this.cache[index] = updatedEntry;
      }
      
      return updatedEntry;
    } catch (error) {
      console.error('Failed to update entry status:', error);
      throw error;
    }
  }

  /**
   * Get current mission and pillars
   */
  async getCurrentMission(): Promise<LedgerEntry | null> {
    const missions = await this.getEntries({ level: 'mission', status: 'active' });
    return missions.length > 0 ? missions[0] : null;
  }

  async getCurrentPillars(): Promise<LedgerEntry[]> {
    return await this.getEntries({ level: 'pillar', status: 'active' });
  }

  /**
   * Check if a new entry aligns with current mission and pillars
   */
  async checkAlignment(entry: Omit<LedgerEntry, 'id' | 'timestamp'>): Promise<{ aligned: boolean; reasons: string[] }> {
    const mission = await this.getCurrentMission();
    const pillars = await this.getCurrentPillars();
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
  async getRoadmapData(): Promise<Record<LedgerEntry['level'], LedgerEntry[]>> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/ledger/roadmap`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Failed to get roadmap data:', error);
      // Fallback to filtered queries
      const [mission, pillar, epic, saga, probe] = await Promise.all([
        this.getEntries({ level: 'mission' }),
        this.getEntries({ level: 'pillar' }),
        this.getEntries({ level: 'epic' }),
        this.getEntries({ level: 'saga' }),
        this.getEntries({ level: 'probe' })
      ]);

      return { mission, pillar, epic, saga, probe };
    }
  }

  /**
   * Get specific entry by ID
   */
  async getEntry(id: string): Promise<LedgerEntry | null> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/ledger/entries/${id}`);
      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Failed to get entry:', error);
      throw error;
    }
  }

  /**
   * Health check
   */
  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/health`);
      return response.ok;
    } catch (error) {
      console.error('Health check failed:', error);
      return false;
    }
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
}

// Singleton instance
export const systemicLedgerAPI = new SystemicLedgerAPI(); 