'use client';

import React, { useState } from 'react';
import { Mail, Github, Sparkles, TrendingUp, Clock, Star, Code, Bell, CheckCircle2 } from 'lucide-react';

export default function Home() {
  const [email, setEmail] = useState('');
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);
  const [frequency, setFrequency] = useState('daily');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const languages = [
    'JavaScript', 'TypeScript', 'Python', 'Go', 'Rust', 
    'Java', 'C++', 'Swift', 'Kotlin', 'PHP'
  ];

  const sampleRepos = [
    {
      name: 'vercel/next.js',
      description: 'The React Framework for Production',
      language: 'TypeScript',
      stars: '118k',
      todayStars: '+234',
      summary: 'Next.js 15 introduces major performance improvements with Turbopack, improved caching strategies, and enhanced Server Actions. The framework continues to dominate React development with better DX and deployment integration.'
    },
    {
      name: 'anthropics/anthropic-sdk-python',
      description: 'Python SDK for Claude AI',
      language: 'Python',
      stars: '2.3k',
      todayStars: '+89',
      summary: 'Official Python SDK for integrating Claude AI. Features streaming responses, vision capabilities, and tool use. Growing rapidly due to Claude 3.5 Sonnet popularity in AI applications.'
    },
    {
      name: 'cloudflare/workers-sdk',
      description: 'Build and deploy edge applications',
      language: 'JavaScript',
      stars: '8.9k',
      todayStars: '+45',
      summary: 'Cloudflare Workers SDK enables serverless edge computing. Recent updates include better local development, D1 database support, and improved debugging tools for edge applications.'
    }
  ];

  const handleSubscribe = async () => {
    if (!email || selectedLanguages.length === 0) {
      setError('Please enter email and select at least one language');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          languages: selectedLanguages,
          frequency
        })
      });

      const data = await response.json();

      if (response.ok) {
        setIsSubscribed(true);
        setTimeout(() => {
          setIsSubscribed(false);
          setEmail('');
          setSelectedLanguages([]);
        }, 5000);
      } else {
        setError(data.error || 'Failed to subscribe');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleLanguage = (lang: string) => {
    setSelectedLanguages(prev => 
      prev.includes(lang) 
        ? prev.filter(l => l !== lang)
        : [...prev, lang]
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
      {/* Header */}
      <header className="border-b border-white/10 bg-black/20 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Github className="w-8 h-8 text-purple-400" />
            <div>
              <h1 className="text-xl font-bold">TrendWatch AI</h1>
              <p className="text-xs text-gray-400">GitHub Trending Intelligence</p>
            </div>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-purple-500/20 rounded-full border border-purple-400/30">
            <Sparkles className="w-4 h-4 text-purple-300" />
            <span className="text-sm font-medium">Built by Neeha Agrawal</span>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-6xl mx-auto px-4 py-16 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500/10 rounded-full border border-purple-400/20 mb-6">
          <TrendingUp className="w-4 h-4 text-purple-400" />
          <span className="text-sm text-purple-300">AI-Powered Repository Analysis</span>
        </div>
        
        <h2 className="text-5xl font-bold mb-4 bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
          Never Miss What's Trending
        </h2>
        <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
          Get AI-generated summaries of trending GitHub repos daily. Save hours of browsing, 
          stay ahead of the curve.
        </p>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-6 mb-12 max-w-4xl mx-auto">
          <div className="bg-white/5 backdrop-blur-sm p-6 rounded-xl border border-white/10">
            <Clock className="w-10 h-10 text-purple-400 mb-3 mx-auto" />
            <h3 className="font-semibold mb-2">Daily Digest</h3>
            <p className="text-sm text-gray-400">Curated every morning with fresh insights</p>
          </div>
          <div className="bg-white/5 backdrop-blur-sm p-6 rounded-xl border border-white/10">
            <Sparkles className="w-10 h-10 text-pink-400 mb-3 mx-auto" />
            <h3 className="font-semibold mb-2">AI Summaries</h3>
            <p className="text-sm text-gray-400">Understand repos in seconds, not minutes</p>
          </div>
          <div className="bg-white/5 backdrop-blur-sm p-6 rounded-xl border border-white/10">
            <Code className="w-10 h-10 text-blue-400 mb-3 mx-auto" />
            <h3 className="font-semibold mb-2">Language Filter</h3>
            <p className="text-sm text-gray-400">Only see repos in languages you care about</p>
          </div>
        </div>

        {/* Subscription Form */}
        <div className="max-w-2xl mx-auto bg-white/5 backdrop-blur-sm p-8 rounded-2xl border border-white/10">
          {!isSubscribed ? (
            <div>
              <h3 className="text-2xl font-bold mb-6">Subscribe to Daily Digest</h3>
              
              <div className="mb-6">
                <label className="block text-left text-sm font-medium mb-2">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="dev@example.com"
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent text-white"
                />
              </div>

              <div className="mb-6">
                <label className="block text-left text-sm font-medium mb-2">Delivery Frequency</label>
                <div className="grid grid-cols-3 gap-3">
                  {['daily', 'weekly', 'realtime'].map((freq) => (
                    <button
                      key={freq}
                      type="button"
                      onClick={() => setFrequency(freq)}
                      className={`px-4 py-2 rounded-lg font-medium transition-all ${
                        frequency === freq
                          ? 'bg-purple-500 text-white'
                          : 'bg-white/5 hover:bg-white/10 border border-white/20'
                      }`}
                    >
                      {freq.charAt(0).toUpperCase() + freq.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-left text-sm font-medium mb-2">
                  Programming Languages ({selectedLanguages.length} selected)
                </label>
                <div className="grid grid-cols-5 gap-2">
                  {languages.map((lang) => (
                    <button
                      key={lang}
                      type="button"
                      onClick={() => toggleLanguage(lang)}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                        selectedLanguages.includes(lang)
                          ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                          : 'bg-white/5 hover:bg-white/10 border border-white/20'
                      }`}
                    >
                      {lang}
                    </button>
                  ))}
                </div>
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-300 text-sm">
                  {error}
                </div>
              )}

              <button
                onClick={handleSubscribe}
                disabled={!email || selectedLanguages.length === 0 || isLoading}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-4 rounded-lg font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <Bell className="w-5 h-5" />
                {isLoading ? 'Subscribing...' : 'Subscribe Now - It\'s Free'}
              </button>
            </div>
          ) : (
            <div className="text-center py-8">
              <CheckCircle2 className="w-16 h-16 text-green-400 mx-auto mb-4" />
              <h3 className="text-2xl font-bold mb-2">You're Subscribed!</h3>
              <p className="text-gray-400">Check your inbox for your first digest tomorrow morning.</p>
            </div>
          )}
        </div>
      </section>

      {/* Sample Repos */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <h3 className="text-3xl font-bold mb-8 text-center">
          Today's Trending Repos
          <span className="block text-sm text-gray-400 mt-2 font-normal">
            AI-generated summaries • Updated 2 hours ago
          </span>
        </h3>

        <div className="space-y-4">
          {sampleRepos.map((repo, idx) => (
            <div
              key={idx}
              className="bg-white/5 backdrop-blur-sm p-6 rounded-xl border border-white/10 hover:border-purple-400/50 transition-all"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h4 className="text-xl font-bold text-purple-300 mb-1">{repo.name}</h4>
                  <p className="text-gray-400 text-sm">{repo.description}</p>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-400" />
                    <span>{repo.stars}</span>
                  </div>
                  <div className="text-green-400 font-semibold">{repo.todayStars}</div>
                </div>
              </div>

              <div className="bg-purple-500/10 border border-purple-400/20 rounded-lg p-4 mb-3">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-4 h-4 text-purple-400" />
                  <span className="text-xs font-semibold text-purple-300">AI SUMMARY</span>
                </div>
                <p className="text-sm text-gray-300 leading-relaxed">{repo.summary}</p>
              </div>

              <div className="flex items-center gap-4 text-sm">
                <span className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full">
                  {repo.language}
                </span>
                <a href="#" className="text-purple-400 hover:text-purple-300 transition-colors">
                  View on GitHub →
                </a>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-black/20 backdrop-blur-sm mt-16">
        <div className="max-w-6xl mx-auto px-4 py-8 text-center text-sm text-gray-400">
          <p>Built with Next.js, TypeScript, Claude AI & Supabase</p>
          <p className="mt-2">Scrapes GitHub trending daily • Generates AI summaries • Sends personalized digests</p>
        </div>
      </footer>
    </div>
  );
}