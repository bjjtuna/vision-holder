'use client';

// [empathize] Roadmap View Component
// Interactive roadmap with 5-level hierarchy (Mission, Pillars, Epics, Sagas, Probes)

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  Map, 
  Plus, 
  Edit3, 
  Trash2, 
  ChevronDown, 
  ChevronRight,
  Target,
  Building,
  BookOpen,
  Sword,
  Search,
  Filter,
  SortAsc,
  Eye,
  EyeOff
} from 'lucide-react';
import { systemicLedgerAPI } from '../services/[accelerate]-service-integration';

// Types from Systemic Ledger API
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

interface RoadmapViewProps {
  className?: string;
  onEntrySelect?: (entry: LedgerEntry) => void;
}

export const RoadmapView: React.FC<RoadmapViewProps> = ({ 
  className = '',
  onEntrySelect 
}) => {
  const [entries, setEntries] = useState<LedgerEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedLevels, setExpandedLevels] = useState<Set<string>>(new Set(['mission', 'pillar']));
  const [selectedEntry, setSelectedEntry] = useState<LedgerEntry | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [filterLevel, setFilterLevel] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'timestamp' | 'level' | 'status'>('timestamp');

  // Load entries from API
  useEffect(() => {
    loadEntries();
  }, []);

  // Filter and sort entries with null safety
  const filteredEntries = (entries || [])
    .filter(entry => filterLevel === 'all' || entry.level === filterLevel)
    .filter(entry => 
      searchTerm === '' || 
      entry.seek.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.why.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.content.statement?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      switch (sortBy) {
        case 'timestamp':
          return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
        case 'level':
          const levelOrder = { mission: 0, pillar: 1, epic: 2, saga: 3, probe: 4 };
          return levelOrder[a.level] - levelOrder[b.level];
        case 'status':
          const statusOrder = { active: 0, proposed: 1, blocked: 2, integrated: 3, archived: 4, dormant: 5 };
          return statusOrder[a.status] - statusOrder[b.status];
        default:
          return 0;
      }
    });

  // Lazy loading state
  const [visibleItems, setVisibleItems] = useState(20);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const observerRef = useRef<IntersectionObserver>();

  // Lazy loading for roadmap entries
  const loadMoreItems = useCallback(async () => {
    if (isLoadingMore) return;
    
    setIsLoadingMore(true);
    // Simulate loading delay for better UX
    await new Promise(resolve => setTimeout(resolve, 200));
    
    setVisibleItems(prev => prev + 20);
    setIsLoadingMore(false);
  }, [isLoadingMore]);

  // Intersection Observer for infinite scroll
  const lastItemRef = useCallback((node: HTMLDivElement) => {
    if (isLoadingMore) return;
    
    if (observerRef.current) observerRef.current.disconnect();
    
    observerRef.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && visibleItems < filteredEntries.length) {
        loadMoreItems();
      }
    }, { threshold: 0.1 });
    
    if (node) observerRef.current.observe(node);
  }, [isLoadingMore, visibleItems, filteredEntries.length, loadMoreItems]);

  const loadEntries = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await systemicLedgerAPI.get<{ data: LedgerEntry[] }>('/ledger/entries');
      setEntries(response.data);
    } catch (err) {
      console.error('Failed to load entries:', err);
      setError('Failed to load roadmap data. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  // Create new entry
  const createEntry = async (entryData: Omit<LedgerEntry, 'id' | 'timestamp'>) => {
    try {
      const newEntry = await systemicLedgerAPI.post<{ data: LedgerEntry }>('/ledger/entries', entryData);
      setEntries(prev => [...prev, newEntry.data]);
      setShowCreateModal(false);
    } catch (err) {
      console.error('Failed to create entry:', err);
      setError('Failed to create entry. Please try again.');
    }
  };

  // Update entry
  const updateEntry = async (id: string, updates: Partial<LedgerEntry>) => {
    try {
      const updatedEntry = await systemicLedgerAPI.put<{ data: LedgerEntry }>(`/ledger/entries/${id}`, updates);
      setEntries(prev => prev.map(entry => 
        entry.id === id ? updatedEntry.data : entry
      ));
      setShowEditModal(false);
      setSelectedEntry(null);
    } catch (err) {
      console.error('Failed to update entry:', err);
      setError('Failed to update entry. Please try again.');
    }
  };

  // Delete entry
  const deleteEntry = async (id: string) => {
    if (!confirm('Are you sure you want to delete this entry?')) return;
    
    try {
      await systemicLedgerAPI.delete(`/ledger/entries/${id}`);
      setEntries(prev => prev.filter(entry => entry.id !== id));
      if (selectedEntry?.id === id) {
        setSelectedEntry(null);
      }
    } catch (err) {
      console.error('Failed to delete entry:', err);
      setError('Failed to delete entry. Please try again.');
    }
  };

  // Toggle level expansion
  const toggleLevel = (level: string) => {
    const newExpanded = new Set(expandedLevels);
    if (newExpanded.has(level)) {
      newExpanded.delete(level);
    } else {
      newExpanded.add(level);
    }
    setExpandedLevels(newExpanded);
  };

  // Group entries by level with null safety
  const groupedEntries = filteredEntries.reduce((acc, entry) => {
    if (!acc[entry.level]) {
      acc[entry.level] = [];
    }
    acc[entry.level].push(entry);
    return acc;
  }, {} as Record<string, LedgerEntry[]>);

  // Get level icon
  const getLevelIcon = (level: string) => {
    switch (level) {
      case 'mission': return <Target className="w-4 h-4" />;
      case 'pillar': return <Building className="w-4 h-4" />;
      case 'epic': return <BookOpen className="w-4 h-4" />;
      case 'saga': return <Sword className="w-4 h-4" />;
      case 'probe': return <Search className="w-4 h-4" />;
      default: return <Map className="w-4 h-4" />;
    }
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 border-green-200 dark:border-green-700';
      case 'proposed': return 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 border-blue-200 dark:border-blue-700';
      case 'blocked': return 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 border-red-200 dark:border-red-700';
      case 'integrated': return 'bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 border-purple-200 dark:border-purple-700';
      case 'archived': return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 border-gray-200 dark:border-gray-600';
      case 'dormant': return 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 border-yellow-200 dark:border-yellow-700';
      default: return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 border-gray-200 dark:border-gray-600';
    }
  };

  // Get purpose tag color
  const getPurposeTagColor = (tag: string) => {
    switch (tag) {
      case '[clarify]': return 'bg-blue-500';
      case '[accelerate]': return 'bg-green-500';
      case '[safeguard]': return 'bg-red-500';
      case '[monetize]': return 'bg-yellow-500';
      case '[empathize]': return 'bg-purple-500';
      case '[delight]': return 'bg-pink-500';
      default: return 'bg-gray-500';
    }
  };

  if (loading) {
    return (
      <div className={`flex items-center justify-center h-full ${className}`}>
        <div className="text-center">
          <Map className="w-8 h-8 text-primary-600 dark:text-primary-400 animate-pulse mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400 text-dyslexia-friendly">Loading roadmap...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`flex items-center justify-center h-full ${className}`}>
        <div className="text-center max-w-md">
          <Map className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 text-dyslexia-friendly">Connection Error</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4 text-dyslexia-friendly">{error}</p>
          <button
            onClick={loadEntries}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-dyslexia-friendly"
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`h-full flex flex-col bg-white dark:bg-gray-800 ${className}`}>
      {/* Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white text-dyslexia-friendly">Vision Roadmap</h1>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-dyslexia-friendly"
          >
            <Plus className="w-4 h-4" />
            Add Entry
          </button>
        </div>

        {/* Filters and Search */}
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-500 dark:text-gray-400" />
            <select
              value={filterLevel}
              onChange={(e) => setFilterLevel(e.target.value)}
              className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-dyslexia-friendly"
            >
              <option value="all">All Levels</option>
              <option value="mission">Mission</option>
              <option value="pillar">Pillars</option>
              <option value="epic">Epics</option>
              <option value="saga">Sagas</option>
              <option value="probe">Probes</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <SortAsc className="w-4 h-4 text-gray-500 dark:text-gray-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-dyslexia-friendly"
            >
              <option value="timestamp">Date</option>
              <option value="level">Level</option>
              <option value="status">Status</option>
            </select>
          </div>

          <div className="flex items-center gap-2 flex-1 max-w-md">
            <Search className="w-4 h-4 text-gray-500 dark:text-gray-400" />
            <input
              type="text"
              placeholder="Search entries..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 text-dyslexia-friendly"
            />
          </div>
        </div>
      </div>

      {/* Roadmap Content */}
      <div className="flex-1 overflow-auto">
        <div className="p-6">
          {Object.keys(groupedEntries).length > 0 ? (
            Object.entries(groupedEntries).map(([level, levelEntries]) => (
              <div key={level} className="mb-6">
                {/* Level Header */}
                <button
                  onClick={() => toggleLevel(level)}
                  className="flex items-center gap-2 w-full p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                >
                  {expandedLevels.has(level) ? (
                    <ChevronDown className="w-4 h-4" />
                  ) : (
                    <ChevronRight className="w-4 h-4" />
                  )}
                  {getLevelIcon(level)}
                  <span className="font-semibold text-gray-900 dark:text-white capitalize text-dyslexia-friendly">
                    {level} ({levelEntries.length})
                  </span>
                </button>

                {/* Level Entries */}
                {expandedLevels.has(level) && (
                  <div className="mt-3 space-y-3">
                    {levelEntries.slice(0, visibleItems).map((entry, index) => (
                      <div
                        key={entry.id}
                        ref={index === levelEntries.length - 1 ? lastItemRef : undefined}
                        className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                          selectedEntry?.id === entry.id
                            ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                            : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700'
                        }`}
                        onClick={() => {
                          setSelectedEntry(entry);
                          onEntrySelect?.(entry);
                        }}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span className={`px-2 py-1 text-xs text-white rounded ${getPurposeTagColor(entry.purpose_tag)}`}>
                                {entry.purpose_tag}
                              </span>
                              <span className={`px-2 py-1 text-xs rounded border ${getStatusColor(entry.status)}`}>
                                {entry.status}
                              </span>
                            </div>
                            
                            <h3 className="font-semibold text-gray-900 dark:text-white mb-1 text-dyslexia-friendly">
                              {entry.content.statement || entry.seek}
                            </h3>
                            
                            <p className="text-gray-600 dark:text-gray-400 text-sm mb-2 text-dyslexia-friendly">
                              {entry.why}
                            </p>
                            
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              {new Date(entry.timestamp).toLocaleDateString()}
                            </div>
                          </div>

                          <div className="flex items-center gap-1">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedEntry(entry);
                                setShowEditModal(true);
                              }}
                              className="p-1 text-gray-400 hover:text-primary-600 dark:hover:text-primary-400"
                              title="Edit"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteEntry(entry.id);
                              }}
                              className="p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))
          ) : null}

          {filteredEntries.length === 0 && (
            <div className="text-center py-12">
              <Map className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400 text-dyslexia-friendly">
                {entries && entries.length > 0 
                  ? "No entries found matching your criteria." 
                  : "No roadmap entries found. Start by adding your first mission or pillar."
                }
              </p>
              {(!entries || entries.length === 0) && (
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="mt-4 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-dyslexia-friendly"
                >
                  <Plus className="w-4 h-4 inline mr-2" />
                  Add First Entry
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Create/Edit Modals would go here */}
      {/* For now, we'll implement these in the next iteration */}
    </div>
  );
};

export default RoadmapView; 