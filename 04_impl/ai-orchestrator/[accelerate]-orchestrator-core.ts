// [accelerate] AI Orchestrator Core Implementation
// Based on contract: /03_contract/[clarify]-system-architecture-schema.md

import { systemicLedger, LedgerEntry } from '../systemic-ledger/[accelerate]-ledger-core';

export interface WisdomInsight {
  id: string;
  insight: string;
  relevance_score: number;
  context_triggers: string[];
  user_preference: Record<string, any>;
  timestamp: string;
  usage_count: number;
}

export interface ContextPrompt {
  minimal_context: string;
  alignment_check: boolean;
  wisdom_injected: WisdomInsight[];
  builder_instructions: string;
}

export interface UserPreference {
  communication_style: 'visual' | 'text' | 'voice' | 'mixed';
  detail_level: 'high' | 'medium' | 'low';
  learning_pace: 'fast' | 'moderate' | 'slow';
  accessibility_needs: string[];
  preferred_feedback: string[];
}

export class AIOrchestrator {
  private wisdomMemory: WisdomInsight[] = [];
  private userPreferences: UserPreference = {
    communication_style: 'mixed',
    detail_level: 'medium',
    learning_pace: 'moderate',
    accessibility_needs: [],
    preferred_feedback: []
  };
  private readonly wisdomStorageKey = 'vision-holder-wisdom-memory';
  private readonly preferencesStorageKey = 'vision-holder-user-preferences';

  constructor() {
    this.loadFromStorage();
  }

  /**
   * Context Engineering: Generate minimal context prompts for builder AIs
   */
  generateContextPrompt(
    task: string,
    builderType: 'code' | 'design' | 'planning' | 'analysis'
  ): ContextPrompt {
    const mission = systemicLedger.getCurrentMission();
    const pillars = systemicLedger.getCurrentPillars();
    const relevantWisdom = this.getRelevantWisdom(task, builderType);

    // Build minimal context
    const context = this.buildMinimalContext(mission, pillars, task, builderType);
    
    // Check alignment
    const alignmentCheck = this.performAlignmentCheck(task, mission, pillars);
    
    // Generate builder instructions
    const builderInstructions = this.generateBuilderInstructions(task, builderType, relevantWisdom);

    return {
      minimal_context: context,
      alignment_check: alignmentCheck.aligned,
      wisdom_injected: relevantWisdom,
      builder_instructions: builderInstructions
    };
  }

  /**
   * Wisdom Memory: Store new insights about user preferences
   */
  addWisdomInsight(
    insight: string,
    context_triggers: string[],
    user_preference: Record<string, any>
  ): WisdomInsight {
    const newInsight: WisdomInsight = {
      id: this.generateId(),
      insight,
      relevance_score: 1.0,
      context_triggers,
      user_preference,
      timestamp: new Date().toISOString(),
      usage_count: 0
    };

    this.wisdomMemory.push(newInsight);
    this.saveToStorage();
    
    return newInsight;
  }

  /**
   * Update user preferences
   */
  updateUserPreferences(preferences: Partial<UserPreference>): void {
    this.userPreferences = { ...this.userPreferences, ...preferences };
    this.saveToStorage();
  }

  /**
   * Get user preferences
   */
  getUserPreferences(): UserPreference {
    return { ...this.userPreferences };
  }

  /**
   * Get wisdom insights
   */
  getWisdomInsights(): WisdomInsight[] {
    return [...this.wisdomMemory];
  }

  /**
   * Perform live alignment check for new proposals
   */
  performLiveAlignmentCheck(
    entry: Omit<LedgerEntry, 'id' | 'timestamp'>
  ): { aligned: boolean; reasons: string[]; suggestions: string[] } {
    const alignment = systemicLedger.checkAlignment(entry);
    const suggestions: string[] = [];

    if (!alignment.aligned) {
      // Generate suggestions based on wisdom memory
      const relevantWisdom = this.wisdomMemory.filter(w => 
        w.context_triggers.some(trigger => 
          entry.seek.toLowerCase().includes(trigger.toLowerCase()) ||
          entry.why.toLowerCase().includes(trigger.toLowerCase())
        )
      );

      suggestions.push(...relevantWisdom.map(w => w.insight));
    }

    return {
      aligned: alignment.aligned,
      reasons: alignment.reasons,
      suggestions
    };
  }

  /**
   * Generate summary report for context continuity
   */
  generateSummaryReport(): string {
    const mission = systemicLedger.getCurrentMission();
    const pillars = systemicLedger.getCurrentPillars();
    const recentEntries = systemicLedger.getEntries().slice(0, 10);
    const topWisdom = this.wisdomMemory
      .sort((a, b) => b.usage_count - a.usage_count)
      .slice(0, 5);

    return `
# Vision Holder Project Summary Report

## Current Mission
${mission ? `- **${mission.content.title || 'Mission'}: ${mission.content.statement}**
- **Seek**: ${mission.seek}
- **Why**: ${mission.why}` : 'No active mission'}

## Active Pillars
${pillars.map(p => `- **${p.content.title || 'Pillar'}: ${p.seek}** - ${p.why}`).join('\n')}

## Recent Activity
${recentEntries.map(e => `- [${e.purpose_tag}] ${e.level}: ${e.seek}`).join('\n')}

## Key Wisdom Insights
${topWisdom.map(w => `- ${w.insight} (Used ${w.usage_count} times)`).join('\n')}

## User Preferences
- Communication Style: ${this.userPreferences.communication_style}
- Detail Level: ${this.userPreferences.detail_level}
- Learning Pace: ${this.userPreferences.learning_pace}

Generated: ${new Date().toISOString()}
    `.trim();
  }

  private buildMinimalContext(
    mission: LedgerEntry | null,
    pillars: LedgerEntry[],
    task: string,
    builderType: string
  ): string {
    let context = `Task: ${task}\nBuilder Type: ${builderType}\n\n`;

    if (mission) {
      context += `Mission: ${mission.content.statement || mission.seek}\n`;
      context += `Mission Seek: ${mission.seek}\n`;
    }

    if (pillars.length > 0) {
      context += `\nKey Principles:\n`;
      pillars.forEach(pillar => {
        context += `- ${pillar.seek}: ${pillar.why}\n`;
      });
    }

    return context;
  }

  private performAlignmentCheck(
    task: string,
    mission: LedgerEntry | null,
    pillars: LedgerEntry[]
  ): { aligned: boolean; reasons: string[] } {
    const reasons: string[] = [];

    if (!mission) {
      reasons.push('No active mission to align with');
      return { aligned: false, reasons };
    }

    // Simple keyword-based alignment check
    const taskKeywords = task.toLowerCase().split(' ');
    const missionKeywords = mission.seek.toLowerCase().split(' ');

    const hasCommonKeywords = taskKeywords.some(tk => 
      missionKeywords.some(mk => mk.includes(tk) || tk.includes(mk))
    );

    if (!hasCommonKeywords) {
      reasons.push(`Task may not align with mission seek: "${mission.seek}"`);
    }

    return {
      aligned: reasons.length === 0,
      reasons
    };
  }

  private generateBuilderInstructions(
    task: string,
    builderType: string,
    wisdom: WisdomInsight[]
  ): string {
    let instructions = `Please complete the following task: ${task}\n\n`;

    // Add wisdom-based instructions
    if (wisdom.length > 0) {
      instructions += `User Preferences & Insights:\n`;
      wisdom.forEach(w => {
        instructions += `- ${w.insight}\n`;
      });
      instructions += '\n';
    }

    // Add builder-specific instructions
    switch (builderType) {
      case 'code':
        instructions += 'Please provide clean, well-documented code with accessibility considerations.';
        break;
      case 'design':
        instructions += 'Please focus on accessibility, clarity, and progressive disclosure.';
        break;
      case 'planning':
        instructions += 'Please provide structured, step-by-step plans with clear milestones.';
        break;
      case 'analysis':
        instructions += 'Please provide clear, actionable insights with visual organization.';
        break;
    }

    return instructions;
  }

  private getRelevantWisdom(task: string, builderType: string): WisdomInsight[] {
    const taskKeywords = task.toLowerCase().split(' ');
    const builderKeywords = builderType.toLowerCase().split(' ');

    return this.wisdomMemory
      .filter(wisdom => {
        const triggerMatch = wisdom.context_triggers.some(trigger => 
          taskKeywords.some(keyword => 
            keyword.includes(trigger.toLowerCase()) || trigger.toLowerCase().includes(keyword)
          ) ||
          builderKeywords.some(keyword => 
            keyword.includes(trigger.toLowerCase()) || trigger.toLowerCase().includes(keyword)
          )
        );

        if (triggerMatch) {
          wisdom.usage_count++;
          return true;
        }
        return false;
      })
      .sort((a, b) => b.relevance_score - a.relevance_score)
      .slice(0, 3); // Return top 3 most relevant insights
  }

  private generateId(): string {
    return `wisdom_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private saveToStorage(): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(this.wisdomStorageKey, JSON.stringify(this.wisdomMemory));
      localStorage.setItem(this.preferencesStorageKey, JSON.stringify(this.userPreferences));
    }
  }

  private loadFromStorage(): void {
    if (typeof window !== 'undefined') {
      try {
        const storedWisdom = localStorage.getItem(this.wisdomStorageKey);
        if (storedWisdom) {
          this.wisdomMemory = JSON.parse(storedWisdom);
        }

        const storedPreferences = localStorage.getItem(this.preferencesStorageKey);
        if (storedPreferences) {
          this.userPreferences = { ...this.userPreferences, ...JSON.parse(storedPreferences) };
        }
      } catch (error) {
        console.error('Failed to load orchestrator data from storage:', error);
      }
    }
  }
}

// Singleton instance
export const aiOrchestrator = new AIOrchestrator(); 