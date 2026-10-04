import React, { useState, useEffect } from 'react';
import { 
    Search, Plus, Link as LinkIcon, FileText, Code, 
    Trash2, Heart, Copy, CheckCircle2, Sparkles, 
    Command, Globe, Loader2, ArrowRight
} from 'lucide-react';

const INITIAL_ITEMS = [
    {
        id: '1',
        title: 'Framer Motion - React Animation Library',
        summary: 'A production-ready motion library for React that makes creating fluid animations simple and declarative.',
        type: 'URL',
        category: 'Tech & Coding',
        tags: ['react', 'animation', 'frontend'],
        content: 'https://www.framer.com/motion/',
        dateAdded: new Date(Date.now() - 86400000 * 2).toISOString(), // 2 days ago
        isFavorite: true
    },
    {
        id: '2',
        title: 'useDebounce Custom Hook',
        summary: 'A reusable React hook to debounce fast-changing values (like search inputs) to limit API calls.',
        type: 'Code',
        category: 'Code Snippets',
        tags: ['react', 'hooks', 'performance'],
        content: `function useDebounce(value, delay) {\n  const [debouncedValue, setDebouncedValue] = useState(value);\n  useEffect(() => {\n    const handler = setTimeout(() => setDebouncedValue(value), delay);\n    return () => clearTimeout(handler);\n  }, [value, delay]);\n  return debouncedValue;\n}`,
        dateAdded: new Date(Date.now() - 86400000 * 5).toISOString(),
        isFavorite: false
    },
    {
        id: '3',
        title: 'Sony WH-1000XM5 Headphones',
        summary: 'Industry leading noise canceling wireless headphones. Need to check for Black Friday deals.',
        type: 'Note',
        category: 'Shopping Wishlist',
        tags: ['tech', 'audio', 'wishlist'],
        content: 'Sony WH-1000XM5 Headphones - Industry leading noise canceling wireless headphones. Need to check for Black Friday deals.',
        dateAdded: new Date(Date.now() - 86400000 * 10).toISOString(),
        isFavorite: true
    },
    {
        id: '4',
        title: 'Understanding CSS Grid: A Comprehensive Guide',
        summary: 'An in-depth article explaining the core concepts of CSS grid architecture, including grid-template-columns and areas.',
        type: 'URL',
        category: 'Articles to Read',
        tags: ['css', 'web-design', 'learning'],
        content: 'https://css-tricks.com/snippets/css/complete-guide-grid/',
        dateAdded: new Date(Date.now() - 86400000 * 1).toISOString(),
        isFavorite: false
    }
];

export default function WhereWasItApp() {
    const [items, setItems] = useState(INITIAL_ITEMS);
    const [inputValue, setInputValue] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [activeFilter, setActiveFilter] = useState('All');
    const [isProcessing, setIsProcessing] = useState(false);
    const [copiedId, setCopiedId] = useState(null);

    // Filter options
    const filters = ['All', 'Links', 'Notes', 'Code', 'Favorites'];

    const handleCopy = (text, id) => {
        navigator.clipboard.writeText(text);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    const toggleFavorite = (id) => {
        setItems(items.map(item => 
            item.id === id ? { ...item, isFavorite: !item.isFavorite } : item
        ));
    };

    const deleteItem = (id) => {
        setItems(items.filter(item => item.id !== id));
    };

    const processInput = async (e) => {
        e.preventDefault();
        if (!inputValue.trim()) return;

        setIsProcessing(true);

        try {
            const payload = {
                contents: [{ 
                    parts: [{ 
                        text: `Analyze the following user input and categorize it. Determine if it's a "URL", "Note", or "Code". 
                        Create a concise 'title', a short 1-2 sentence 'summary', a suitable 'category' (e.g., Tech & Coding, Shopping, Ideas, Resources), and an array of 2-4 relevant lowercase 'tags'. 
                        
                        Input to analyze:
                        "${inputValue}"` 
                    }] 
                }],
                generationConfig: {
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: "OBJECT",
                        properties: {
                            title: { type: "STRING" },
                            summary: { type: "STRING" },
                            type: { type: "STRING", description: "Must be 'URL', 'Note', or 'Code'" },
                            category: { type: "STRING" },
                            tags: { type: "ARRAY", items: { type: "STRING" } }
                        },
                        required: ["title", "summary", "type", "category", "tags"]
                    }
                }
            };

            const apiKey = ""; // Left empty as requested for Canvas environment
            const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${apiKey}`;
            
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const result = await response.json();
            
            if (result.candidates && result.candidates[0].content.parts[0].text) {
                const parsedData = JSON.parse(result.candidates[0].content.parts[0].text);
                
                const newItem = {
                    id: Date.now().toString(),
                    ...parsedData,
                    content: inputValue, // Store original input
                    dateAdded: new Date().toISOString(),
                    isFavorite: false
                };

                setItems([newItem, ...items]);
                setInputValue('');
            } else {
                console.error("Failed to parse Gemini response", result);
                // Fallback basic addition if AI fails
                fallbackAddItem(inputValue);
            }
        } catch (error) {
            console.error("Error processing input with Gemini:", error);
            fallbackAddItem(inputValue);
        } finally {
            setIsProcessing(false);
        }
    };

    const fallbackAddItem = (text) => {
        const isUrl = text.startsWith('http');
        const newItem = {
            id: Date.now().toString(),
            title: isUrl ? text.split('/')[2] : 'Saved Snippet',
            summary: text.substring(0, 100) + (text.length > 100 ? '...' : ''),
            type: isUrl ? 'URL' : 'Note',
            category: 'Uncategorized',
            tags: ['raw-input'],
            content: text,
            dateAdded: new Date().toISOString(),
            isFavorite: false
        };
        setItems([newItem, ...items]);
        setInputValue('');
    };

    const filteredItems = items.filter(item => {
        // Filter by active pill
        let matchesFilter = true;
        if (activeFilter === 'Links') matchesFilter = item.type === 'URL';
        else if (activeFilter === 'Notes') matchesFilter = item.type === 'Note';
        else if (activeFilter === 'Code') matchesFilter = item.type === 'Code';
        else if (activeFilter === 'Favorites') matchesFilter = item.isFavorite;

        // Semantic-like Search (checks multiple fields)
        const query = searchQuery.toLowerCase();
        const matchesSearch = 
            item.title.toLowerCase().includes(query) ||
            item.summary.toLowerCase().includes(query) ||
            item.category.toLowerCase().includes(query) ||
            item.tags.some(tag => tag.toLowerCase().includes(query));

        return matchesFilter && matchesSearch;
    });

    const getTypeIcon = (type) => {
        switch (type.toLowerCase()) {
            case 'url': return <LinkIcon className="w-4 h-4 text-blue-400" />;
            case 'code': return <Code className="w-4 h-4 text-emerald-400" />;
            default: return <FileText className="w-4 h-4 text-amber-400" />;
        }
    };

    return (
        <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans selection:bg-indigo-500/30">
            {/* Top Navigation Bar */}
            <nav className="sticky top-0 z-50 bg-zinc-950/80 backdrop-blur-md border-b border-zinc-900/50">
                <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-indigo-400">
                        <Command className="w-6 h-6" />
                        <span className="text-xl font-bold tracking-tight text-white">WhereWasIt</span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-zinc-400">
                        <span>{items.length} bits saved</span>
                    </div>
                </div>
            </nav>

            <main className="max-w-6xl mx-auto px-6 py-12 space-y-12">
                
                {/* Hero & Quick Save */}
                <section className="max-w-3xl mx-auto text-center space-y-6">
                    <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-zinc-100">
                        Dump it here. <span className="text-indigo-400">Find it later.</span>
                    </h1>
                    <p className="text-zinc-400 text-lg">
                        Paste any link, text, or code snippet. AI categorizes and tags it automatically.
                    </p>

                    <form onSubmit={processInput} className="relative mt-8 group">
                        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 rounded-2xl blur-xl transition-all opacity-0 group-hover:opacity-100 duration-500"></div>
                        <div className="relative flex items-center bg-zinc-900/80 border border-zinc-800 rounded-2xl p-2 shadow-2xl focus-within:border-indigo-500/50 transition-colors">
                            <div className="p-3 text-zinc-500">
                                {isProcessing ? <Loader2 className="w-5 h-5 animate-spin text-indigo-400" /> : <Sparkles className="w-5 h-5" />}
                            </div>
                            <input
                                type="text"
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                placeholder="Paste a URL, note, or code block..."
                                className="flex-1 bg-transparent border-none outline-none text-zinc-100 placeholder:text-zinc-600 px-2 py-3 text-lg"
                                disabled={isProcessing}
                            />
                            <button
                                type="submit"
                                disabled={!inputValue.trim() || isProcessing}
                                className="bg-indigo-600 hover:bg-indigo-500 text-white p-3 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                                <span className="hidden sm:inline font-medium pr-1">Save</span>
                                <ArrowRight className="w-5 h-5" />
                            </button>
                        </div>
                    </form>
                </section>

                {}
                <section className="space-y-6">
                    <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-zinc-900/30 p-2 rounded-2xl border border-zinc-800/50">
                        
                        {/* Filters */}
                        <div className="flex flex-wrap gap-2 p-2">
                            {filters.map(filter => (
                                <button
                                    key={filter}
                                    onClick={() => setActiveFilter(filter)}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                                        activeFilter === filter 
                                        ? 'bg-zinc-800 text-zinc-100 shadow-sm border border-zinc-700' 
                                        : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50 border border-transparent'
                                    }`}
                                >
                                    {filter}
                                </button>
                            ))}
                        </div>

                        {/* Search Bar */}
                        <div className="relative w-full md:w-72 p-2">
                            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search naturally..."
                                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-zinc-700 transition-colors placeholder:text-zinc-600"
                            />
                        </div>
                    </div>

                    {}
                    {filteredItems.length === 0 ? (
                        <div className="text-center py-20 text-zinc-600">
                            <p>No items found matching your criteria.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 auto-rows-max">
                            {filteredItems.map(item => (
                                <div 
                                    key={item.id} 
                                    className="group relative bg-zinc-900/40 border border-zinc-800 rounded-2xl p-5 hover:bg-zinc-900/80 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-black/50 flex flex-col gap-4"
                                >
                                    {/* Card Header */}
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-zinc-950 rounded-xl border border-zinc-800/80">
                                                {getTypeIcon(item.type)}
                                            </div>
                                            <div>
                                                <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">{item.category}</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button 
                                                onClick={() => toggleFavorite(item.id)}
                                                className="p-1.5 text-zinc-500 hover:text-rose-400 transition-colors"
                                                title="Favorite"
                                            >
                                                <Heart className={`w-4 h-4 ${item.isFavorite ? 'fill-rose-400 text-rose-400' : ''}`} />
                                            </button>
                                            <button 
                                                onClick={() => deleteItem(item.id)}
                                                className="p-1.5 text-zinc-500 hover:text-red-400 transition-colors"
                                                title="Delete"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Card Body */}
                                    <div>
                                        <h3 className="text-lg font-medium text-zinc-100 mb-2 leading-snug line-clamp-2">
                                            {item.title}
                                        </h3>
                                        <p className="text-sm text-zinc-400 line-clamp-3">
                                            {item.summary}
                                        </p>
                                    </div>

                                    {/* Code Block Preview (if type is code) */}
                                    {item.type === 'Code' && (
                                        <div className="bg-zinc-950 border border-zinc-800/80 rounded-xl p-3 overflow-hidden text-xs font-mono text-zinc-500 opacity-70">
                                            <pre className="line-clamp-3">
                                                {item.content}
                                            </pre>
                                        </div>
                                    )}

                                    {/* Card Footer (Tags & Actions) */}
                                    <div className="mt-auto pt-4 flex items-center justify-between border-t border-zinc-800/50">
                                        <div className="flex flex-wrap gap-1.5 overflow-hidden max-w-[70%]">
                                            {item.tags.slice(0, 3).map((tag, idx) => (
                                                <span key={idx} className="px-2 py-0.5 bg-zinc-800/50 text-zinc-400 text-xs rounded-md border border-zinc-700/50">
                                                    #{tag}
                                                </span>
                                            ))}
                                            {item.tags.length > 3 && (
                                                <span className="px-2 py-0.5 text-zinc-500 text-xs">+{item.tags.length - 3}</span>
                                            )}
                                        </div>
                                        
                                        <button 
                                            onClick={() => handleCopy(item.content, item.id)}
                                            className="flex items-center gap-1.5 text-xs font-medium text-zinc-400 hover:text-indigo-400 transition-colors bg-zinc-950 py-1.5 px-3 rounded-lg border border-zinc-800/80"
                                        >
                                            {copiedId === item.id ? (
                                                <>
                                                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                                                    <span className="text-emerald-400">Copied</span>
                                                </>
                                            ) : (
                                                <>
                                                    <Copy className="w-3.5 h-3.5" />
                                                    <span>Copy</span>
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </section>
            </main>
        </div>
    );
}