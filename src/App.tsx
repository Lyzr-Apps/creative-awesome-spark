import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Spinner } from '@/components/ui/spinner'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  RefreshCw,
  Sparkles,
  Download,
  Copy,
  Heart,
  Share2,
  Trash2,
  Calendar,
  FileText,
  Grid3x3,
  Check
} from 'lucide-react'
import { callAIAgent } from '@/utils/aiAgent'
import parseLLMJson from '@/utils/jsonParser'

interface PoemResponse {
  result: {
    poem: string
    title?: string
    style?: string
    stanza_count?: number
    line_count?: number
    formatting_notes?: string
  }
  confidence?: number
  metadata?: {
    processing_time?: string
    model_used?: string
    creative_elements?: string[]
  }
}

interface SavedPoem {
  id: string
  title: string
  content: string
  style?: string
  prompt: string
  timestamp: number
  isFavorite: boolean
}

function App() {
  const [prompt, setPrompt] = useState('')
  const [poem, setPoem] = useState<PoemResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPoem, setShowPoem] = useState(false)
  const [savedPoems, setSavedPoems] = useState<SavedPoem[]>([])
  const [activeTab, setActiveTab] = useState('generate')
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [toneOption, setToneOption] = useState('romantic')
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list')

  // Load saved poems from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('savedPoems')
    if (saved) {
      try {
        setSavedPoems(JSON.parse(saved))
      } catch (e) {
        console.error('Failed to load saved poems')
      }
    }
  }, [])

  // Save poems to localStorage
  useEffect(() => {
    localStorage.setItem('savedPoems', JSON.stringify(savedPoems))
  }, [savedPoems])

  const handleGeneratePoem = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!prompt.trim()) {
      setError('Please enter a topic, theme, or keywords')
      return
    }

    setLoading(true)
    setError('')
    setShowPoem(false)

    try {
      const enhancedPrompt = `Generate a ${toneOption} poem about: ${prompt}`
      const response = await callAIAgent(enhancedPrompt, '68fa2d904f148178b1db38b5')

      if (response && response.response) {
        const parsedData = parseLLMJson(response.response, null) as PoemResponse | null

        if (parsedData && parsedData.result && parsedData.result.poem) {
          setPoem(parsedData)
          setTimeout(() => setShowPoem(true), 50)
        } else {
          setError('Failed to generate poem. Please try again.')
        }
      } else {
        setError('No response from the agent. Please try again.')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while generating the poem')
    } finally {
      setLoading(false)
    }
  }

  const handleClear = () => {
    setPrompt('')
    setPoem(null)
    setError('')
    setShowPoem(false)
  }

  const handleSavePoem = () => {
    if (!poem || !poem.result.poem) return

    const newPoem: SavedPoem = {
      id: Date.now().toString(),
      title: poem.result.title || `Poem - ${new Date().toLocaleDateString()}`,
      content: poem.result.poem,
      style: poem.result.style,
      prompt: prompt,
      timestamp: Date.now(),
      isFavorite: false
    }

    setSavedPoems([newPoem, ...savedPoems])
  }

  const handleDeletePoem = (id: string) => {
    setSavedPoems(savedPoems.filter(p => p.id !== id))
  }

  const handleToggleFavorite = (id: string) => {
    setSavedPoems(savedPoems.map(p =>
      p.id === id ? { ...p, isFavorite: !p.isFavorite } : p
    ))
  }

  const handleCopyPoem = (content: string, id: string) => {
    navigator.clipboard.writeText(content)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const handleDownloadPoem = (title: string, content: string) => {
    const element = document.createElement('a')
    const file = new Blob([content], { type: 'text/plain' })
    element.href = URL.createObjectURL(file)
    element.download = `${title || 'poem'}.txt`
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
  }

  const favorites = savedPoems.filter(p => p.isFavorite).sort((a, b) => b.timestamp - a.timestamp)
  const allSavedPoems = savedPoems.sort((a, b) => b.timestamp - a.timestamp)

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-50 flex flex-col items-center justify-start p-4 md:p-8 relative overflow-hidden">
      {/* Animated gradient orbs background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {/* Primary purple orb - top right */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-purple-400 via-purple-300 to-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-25 animate-blob"></div>

        {/* Secondary indigo orb - bottom left */}
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-indigo-400 via-purple-400 to-indigo-300 rounded-full mix-blend-multiply filter blur-3xl opacity-25 animate-blob animation-delay-2000"></div>

        {/* Tertiary pink orb - top left */}
        <div className="absolute top-20 left-1/4 w-80 h-80 bg-gradient-to-br from-pink-300 via-purple-300 to-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>

        {/* Quaternary violet orb - center right */}
        <div className="absolute top-1/3 right-1/4 w-72 h-72 bg-gradient-to-bl from-violet-400 to-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-3000"></div>

        {/* Quinary blue orb - bottom right */}
        <div className="absolute bottom-1/4 right-0 w-80 h-80 bg-gradient-to-tl from-blue-300 via-purple-300 to-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-15 animate-blob animation-delay-5000"></div>

        {/* Extra lavender orb - center */}
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-gradient-to-br from-purple-300 via-violet-200 to-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-15 animate-blob animation-delay-6000"></div>

        {/* Small accent orb - top center */}
        <div className="absolute top-1/4 left-1/2 w-64 h-64 bg-gradient-to-br from-rose-300 to-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-7000"></div>

        {/* Additional bottom center orb */}
        <div className="absolute bottom-0 left-1/3 w-72 h-72 bg-gradient-to-tr from-purple-400 to-indigo-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-1000"></div>
      </div>

      <style>{`
        @keyframes blob {
          0%, 100% {
            transform: translate(0, 0) scale(1);
            opacity: 0.25;
          }
          33% {
            transform: translate(40px, -60px) scale(1.15);
            opacity: 0.3;
          }
          50% {
            transform: translate(-30px, 40px) scale(0.95);
            opacity: 0.2;
          }
          66% {
            transform: translate(-50px, -30px) scale(1.1);
            opacity: 0.25;
          }
          100% {
            transform: translate(0, 0) scale(1);
            opacity: 0.25;
          }
        }

        .animate-blob {
          animation: blob 12s ease-in-out infinite;
          will-change: transform;
        }

        .animation-delay-1000 { animation-delay: 1s; }
        .animation-delay-2000 { animation-delay: 2s; }
        .animation-delay-3000 { animation-delay: 3s; }
        .animation-delay-4000 { animation-delay: 4s; }
        .animation-delay-5000 { animation-delay: 5s; }
        .animation-delay-6000 { animation-delay: 6s; }
        .animation-delay-7000 { animation-delay: 7s; }

        @keyframes slideIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-slideIn { animation: slideIn 0.6s ease-out; }
      `}</style>

      <div className="w-full max-w-6xl relative z-10">
        {/* Header */}
        <div className="text-center mb-12 md:mb-16 pt-6 md:pt-8 animate-slideIn">
          <div className="flex items-center justify-center gap-3 md:gap-6 mb-6">
            <div className="p-3 md:p-4 bg-gradient-to-br from-purple-500 via-violet-500 to-pink-500 rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-300 group cursor-pointer">
              <Sparkles className="w-7 h-7 md:w-9 md:h-9 text-white group-hover:scale-110 transition-transform duration-300" />
            </div>
            <h1 className="text-4xl md:text-7xl font-black bg-gradient-to-r from-purple-600 via-violet-600 to-pink-600 bg-clip-text text-transparent drop-shadow-2xl">
              Poem Studio
            </h1>
            <div className="p-3 md:p-4 bg-gradient-to-br from-pink-500 via-purple-500 to-violet-500 rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-300 group cursor-pointer">
              <Sparkles className="w-7 h-7 md:w-9 md:h-9 text-white group-hover:scale-110 transition-transform duration-300" />
            </div>
          </div>
          <div className="max-w-2xl mx-auto">
            <p className="text-base md:text-xl font-semibold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
              Create, Collect & Cherish Your Poetry
            </p>
            <div className="h-1 w-24 mx-auto bg-gradient-to-r from-purple-500 via-violet-500 to-pink-500 rounded-full"></div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 md:grid-cols-4 bg-white/50 backdrop-blur-2xl border border-white/50 rounded-2xl mb-8 md:mb-12 shadow-2xl p-1.5 md:p-2">
            <TabsTrigger value="generate" className="text-xs md:text-sm font-semibold rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:via-violet-500 data-[state=active]:to-pink-500 data-[state=active]:text-white data-[state=active]:shadow-xl transition-all duration-300 text-purple-700 hover:text-purple-900">
              <Sparkles className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Create</span>
            </TabsTrigger>
            <TabsTrigger value="library" className="text-xs md:text-sm font-semibold rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:via-violet-500 data-[state=active]:to-pink-500 data-[state=active]:text-white data-[state=active]:shadow-xl transition-all duration-300 text-purple-700 hover:text-purple-900">
              <FileText className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Library</span>
            </TabsTrigger>
            <TabsTrigger value="favorites" className="text-xs md:text-sm font-semibold rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:via-violet-500 data-[state=active]:to-pink-500 data-[state=active]:text-white data-[state=active]:shadow-xl transition-all duration-300 text-purple-700 hover:text-purple-900">
              <Heart className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Favorites</span>
            </TabsTrigger>
            <TabsTrigger value="tips" className="text-xs md:text-sm font-semibold rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:via-violet-500 data-[state=active]:to-pink-500 data-[state=active]:text-white data-[state=active]:shadow-xl transition-all duration-300 text-purple-700 hover:text-purple-900 hidden md:block">
              <Share2 className="w-4 h-4 mr-2" />
              Tips
            </TabsTrigger>
          </TabsList>

          {/* Generate Tab */}
          <TabsContent value="generate" className="space-y-8 animate-slideIn">
            <Card className="bg-white/60 backdrop-blur-3xl border border-white/60 shadow-3xl hover:shadow-4xl transition-all duration-500 rounded-3xl overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-100/20 via-transparent to-pink-100/20 pointer-events-none"></div>
              <form onSubmit={handleGeneratePoem} className="p-8 md:p-12 relative z-10">
                <div className="mb-10">
                  <label htmlFor="prompt" className="block text-purple-900 font-bold mb-4 text-lg md:text-xl">
                    What would you like your poem to be about?
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-200/40 to-pink-200/40 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300 opacity-0 group-hover:opacity-100"></div>
                    <Input
                      id="prompt"
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      placeholder="e.g., moonlight dreams, passionate love, the ocean's whisper..."
                      className="relative w-full bg-white/70 backdrop-blur-xl border border-white/50 text-purple-900 placeholder-purple-400 text-base md:text-lg h-16 md:h-20 focus:ring-2 focus:ring-purple-500 focus:border-transparent rounded-2xl transition-all duration-300 font-medium group-hover:bg-white/80 focus:bg-white/90 shadow-xl"
                      disabled={loading}
                    />
                  </div>
                </div>

                {/* Tone Selector */}
                <div className="mb-10">
                  <label className="block text-purple-900 font-bold mb-5 text-base md:text-lg">
                    Poetry Tone
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {['romantic', 'melancholic', 'inspirational', 'whimsical'].map(tone => (
                      <button
                        key={tone}
                        type="button"
                        onClick={() => setToneOption(tone)}
                        className={`group relative p-4 rounded-2xl font-bold text-sm md:text-base transition-all duration-300 overflow-hidden ${
                          toneOption === tone
                            ? 'bg-gradient-to-r from-purple-500 via-violet-500 to-pink-500 text-white shadow-2xl scale-105'
                            : 'bg-white/50 backdrop-blur-xl text-purple-700 hover:bg-white/70 border border-white/50 hover:border-purple-200 shadow-lg hover:shadow-xl'
                        }`}
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-purple-400/20 to-pink-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        <span className="relative">{tone.charAt(0).toUpperCase() + tone.slice(1)}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Error Message */}
                {error && (
                  <div className="mb-8 p-5 bg-gradient-to-br from-red-100/60 to-red-50/60 backdrop-blur-xl border border-red-200/50 rounded-2xl text-red-700 text-sm md:text-base font-semibold animate-pulse shadow-lg">
                    {error}
                  </div>
                )}

                {/* Buttons */}
                <div className="flex gap-4 md:gap-5 flex-col sm:flex-row pt-4">
                  <Button
                    type="submit"
                    disabled={loading || !prompt.trim()}
                    className="flex-1 bg-gradient-to-r from-purple-600 via-violet-600 to-pink-600 hover:from-purple-700 hover:via-violet-700 hover:to-pink-700 text-white font-bold h-14 md:h-16 text-base md:text-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-2xl hover:shadow-3xl rounded-2xl disabled:from-purple-400 disabled:via-violet-400 disabled:to-pink-400"
                  >
                    {loading ? (
                      <div className="flex items-center gap-3">
                        <Spinner className="w-5 h-5 animate-spin" />
                        <span>Generating your poem...</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-5 h-5" />
                        <span>Generate Poem</span>
                      </div>
                    )}
                  </Button>

                  <Button
                    type="button"
                    onClick={handleClear}
                    disabled={loading}
                    className="bg-white/50 backdrop-blur-xl border border-white/50 text-purple-700 hover:bg-white/70 hover:shadow-2xl font-bold h-14 md:h-16 text-base md:text-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 rounded-2xl shadow-lg"
                  >
                    <div className="flex items-center gap-2">
                      <RefreshCw className="w-5 h-5" />
                      <span>Clear</span>
                    </div>
                  </Button>
                </div>
              </form>
            </Card>

            {/* Poem Display */}
            {poem && (
              <Card className={`bg-white/60 backdrop-blur-3xl border border-white/60 p-8 md:p-12 shadow-3xl transition-all duration-1000 rounded-3xl overflow-hidden ${showPoem ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                <div className="absolute inset-0 bg-gradient-to-br from-purple-100/30 via-transparent to-pink-100/30 pointer-events-none"></div>
                <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                  <div>
                    {poem.result.title && (
                      <h2 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-purple-600 via-violet-600 to-pink-600 bg-clip-text text-transparent mb-2 drop-shadow-lg">
                        {poem.result.title}
                      </h2>
                    )}
                  </div>
                  <div className="flex gap-3">
                    <Button size="sm" variant="outline" className="bg-white/50 backdrop-blur-xl border border-white/50 text-purple-700 hover:bg-white/70 hover:shadow-xl rounded-xl transition-all duration-300 shadow-lg" onClick={() => handleCopyPoem(poem.result.poem, 'current')}>
                      {copiedId === 'current' ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                    </Button>
                    <Button size="sm" variant="outline" className="bg-white/50 backdrop-blur-xl border border-white/50 text-purple-700 hover:bg-white/70 hover:shadow-xl rounded-xl transition-all duration-300 shadow-lg" onClick={() => handleDownloadPoem(poem.result.title || 'poem', poem.result.poem)}>
                      <Download className="w-5 h-5" />
                    </Button>
                    <Button size="sm" variant="outline" className="bg-white/50 backdrop-blur-xl border border-white/50 text-purple-700 hover:bg-white/70 hover:shadow-xl rounded-xl transition-all duration-300 shadow-lg" onClick={handleSavePoem}>
                      <Heart className="w-5 h-5" />
                    </Button>
                  </div>
                </div>

                <div className="relative z-10 bg-white/50 backdrop-blur-2xl rounded-3xl p-8 md:p-12 mb-8 md:mb-10 border border-white/50 shadow-2xl">
                  <p className="text-purple-900 whitespace-pre-wrap font-serif text-xl md:text-2xl leading-relaxed md:leading-loose font-light italic">
                    {poem.result.poem}
                  </p>
                </div>

                <div className="relative z-10 grid grid-cols-2 md:grid-cols-4 gap-4">
                  {poem.result.style && (
                    <div className="bg-white/40 backdrop-blur-xl rounded-2xl p-4 border border-white/50 shadow-lg hover:shadow-xl transition-all duration-300">
                      <span className="text-purple-700 font-bold text-xs block mb-1">Style</span>
                      <span className="text-purple-900 font-semibold text-sm">{poem.result.style}</span>
                    </div>
                  )}
                  <div className="bg-white/40 backdrop-blur-xl rounded-2xl p-4 border border-white/50 shadow-lg hover:shadow-xl transition-all duration-300">
                    <span className="text-purple-700 font-bold text-xs block mb-1">Stanzas</span>
                    <span className="text-purple-900 font-semibold text-sm">{poem.result.stanza_count || 'N/A'}</span>
                  </div>
                  <div className="bg-white/40 backdrop-blur-xl rounded-2xl p-4 border border-white/50 shadow-lg hover:shadow-xl transition-all duration-300">
                    <span className="text-purple-700 font-bold text-xs block mb-1">Lines</span>
                    <span className="text-purple-900 font-semibold text-sm">{poem.result.line_count || 'N/A'}</span>
                  </div>
                  {poem.metadata?.processing_time && (
                    <div className="bg-white/40 backdrop-blur-xl rounded-2xl p-4 border border-white/50 shadow-lg hover:shadow-xl transition-all duration-300">
                      <span className="text-purple-700 font-bold text-xs block mb-1">Processing</span>
                      <span className="text-purple-900 font-semibold text-sm">{poem.metadata.processing_time}</span>
                    </div>
                  )}
                </div>

                {poem.metadata?.creative_elements && poem.metadata.creative_elements.length > 0 && (
                  <div className="relative z-10 mt-8">
                    <span className="text-purple-700 font-bold text-sm block mb-4">Creative Elements:</span>
                    <div className="flex flex-wrap gap-3">
                      {poem.metadata.creative_elements.map((element, idx) => (
                        <span key={idx} className="inline-block bg-gradient-to-r from-purple-500 via-violet-500 to-pink-500 text-white px-4 py-2 rounded-full text-xs font-bold shadow-lg hover:shadow-xl transform hover:scale-110 transition-all duration-300">
                          {element}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </Card>
            )}

            {!poem && !loading && (
              <div className="text-center py-12 md:py-16">
                <p className="text-purple-600 text-lg md:text-2xl font-semibold">
                  Let your creativity flow. Enter a topic to begin your poetic journey.
                </p>
              </div>
            )}
          </TabsContent>

          {/* Library Tab */}
          <TabsContent value="library" className="animate-slideIn">
            {allSavedPoems.length === 0 ? (
              <Card className="bg-white/60 backdrop-blur-3xl border border-white/50 shadow-3xl p-12 md:p-16 text-center rounded-3xl overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-100/30 to-pink-100/30 pointer-events-none"></div>
                <div className="relative z-10">
                  <FileText className="w-16 h-16 text-purple-400 mx-auto mb-6" />
                  <p className="text-purple-700 text-lg md:text-xl font-bold mb-2">No poems yet</p>
                  <p className="text-purple-500 text-base">Generate and save your first poem to build your library</p>
                </div>
              </Card>
            ) : (
              <div className="space-y-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-2xl font-bold text-purple-900">Your Library ({allSavedPoems.length})</h3>
                  <button onClick={() => setViewMode(viewMode === 'list' ? 'grid' : 'list')} className="p-3 bg-white/50 backdrop-blur-xl hover:bg-white/70 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl">
                    {viewMode === 'list' ? <Grid3x3 className="w-5 h-5 text-purple-600" /> : <FileText className="w-5 h-5 text-purple-600" />}
                  </button>
                </div>
                <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 gap-5' : 'space-y-5'}>
                  {allSavedPoems.map(p => (
                    <Card key={p.id} className="bg-white/60 backdrop-blur-2xl border border-white/50 p-6 hover:shadow-2xl transition-all duration-300 group rounded-2xl overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-br from-purple-100/20 to-pink-100/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                      <div className="relative z-10 flex justify-between items-start gap-4">
                        <div className="flex-1">
                          <h4 className="font-bold text-purple-900 group-hover:text-purple-700 transition-colors text-lg mb-2">{p.title}</h4>
                          <p className="text-purple-500 text-sm mb-3">{new Date(p.timestamp).toLocaleDateString()}</p>
                          <p className="text-purple-700 text-sm line-clamp-2">{p.content}</p>
                        </div>
                        <div className="flex gap-2">
                          <button onClick={() => handleToggleFavorite(p.id)} className="p-2 bg-white/50 hover:bg-white/80 rounded-lg transition-all duration-300 shadow-md">
                            <Heart className={`w-5 h-5 ${p.isFavorite ? 'fill-red-500 text-red-500' : 'text-purple-400'}`} />
                          </button>
                          <button onClick={() => handleCopyPoem(p.content, p.id)} className="p-2 bg-white/50 hover:bg-white/80 rounded-lg transition-all duration-300 shadow-md">
                            {copiedId === p.id ? <Check className="w-5 h-5 text-green-500" /> : <Copy className="w-5 h-5 text-purple-400" />}
                          </button>
                          <button onClick={() => handleDownloadPoem(p.title, p.content)} className="p-2 bg-white/50 hover:bg-white/80 rounded-lg transition-all duration-300 shadow-md">
                            <Download className="w-5 h-5 text-purple-400" />
                          </button>
                          <button onClick={() => handleDeletePoem(p.id)} className="p-2 bg-red-100/50 hover:bg-red-200/70 rounded-lg transition-all duration-300 shadow-md">
                            <Trash2 className="w-5 h-5 text-red-500" />
                          </button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>

          {/* Favorites Tab */}
          <TabsContent value="favorites" className="animate-slideIn">
            {favorites.length === 0 ? (
              <Card className="bg-white/60 backdrop-blur-3xl border border-white/50 shadow-3xl p-12 md:p-16 text-center rounded-3xl overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-100/30 to-pink-100/30 pointer-events-none"></div>
                <div className="relative z-10">
                  <Heart className="w-16 h-16 text-purple-400 mx-auto mb-6" />
                  <p className="text-purple-700 text-lg md:text-xl font-bold mb-2">No favorites yet</p>
                  <p className="text-purple-500 text-base">Heart poems to add them to your favorites collection</p>
                </div>
              </Card>
            ) : (
              <div className="space-y-6">
                <h3 className="text-2xl font-bold text-purple-900 mb-6">Your Favorites ({favorites.length})</h3>
                {favorites.map(p => (
                  <Card key={p.id} className="bg-white/60 backdrop-blur-2xl border border-white/50 p-8 hover:shadow-2xl transition-all duration-300 rounded-2xl overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-100/20 to-pink-100/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                    <div className="relative z-10 flex justify-between items-start gap-4 mb-6">
                      <div className="flex-1">
                        <h4 className="font-bold text-purple-900 text-xl mb-2 group-hover:text-purple-700 transition-colors">{p.title}</h4>
                        <p className="text-purple-500 text-sm flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          {new Date(p.timestamp).toLocaleDateString()}
                        </p>
                      </div>
                      <button onClick={() => handleToggleFavorite(p.id)} className="p-2 bg-white/50 hover:bg-white/80 rounded-lg transition-all duration-300 shadow-md">
                        <Heart className="w-6 h-6 fill-red-500 text-red-500" />
                      </button>
                    </div>
                    <div className="bg-white/50 backdrop-blur-xl rounded-2xl p-6 border border-white/50 mb-6 shadow-lg">
                      <p className="text-purple-900 whitespace-pre-wrap font-serif text-base md:text-lg leading-relaxed">{p.content}</p>
                    </div>
                    <div className="flex gap-3">
                      <Button size="sm" variant="outline" className="bg-white/50 backdrop-blur-xl border border-white/50 text-purple-700 hover:bg-white/70 flex-1 rounded-lg shadow-md" onClick={() => handleCopyPoem(p.content, p.id)}>
                        {copiedId === p.id ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
                        {copiedId === p.id ? 'Copied!' : 'Copy'}
                      </Button>
                      <Button size="sm" variant="outline" className="bg-white/50 backdrop-blur-xl border border-white/50 text-purple-700 hover:bg-white/70 flex-1 rounded-lg shadow-md" onClick={() => handleDownloadPoem(p.title, p.content)}>
                        <Download className="w-4 h-4 mr-2" />
                        Download
                      </Button>
                      <Button size="sm" variant="outline" className="bg-red-100/50 backdrop-blur-xl border border-red-200/50 text-red-600 hover:bg-red-200/70 rounded-lg shadow-md" onClick={() => handleDeletePoem(p.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Tips Tab */}
          <TabsContent value="tips" className="animate-slideIn">
            <Card className="bg-white/60 backdrop-blur-3xl border border-white/50 shadow-3xl p-8 md:p-12 rounded-3xl overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-100/30 to-pink-100/30 pointer-events-none"></div>
              <div className="relative z-10">
                <h3 className="text-3xl font-bold text-purple-900 mb-8">Poetry Writing Tips</h3>
                <div className="space-y-5">
                  <div className="bg-white/50 backdrop-blur-xl border border-white/50 p-6 rounded-2xl border-l-4 border-purple-500 shadow-lg hover:shadow-xl transition-all duration-300 group">
                    <h4 className="font-bold text-purple-900 mb-2 text-lg group-hover:text-purple-700 transition-colors">Use Sensory Details</h4>
                    <p className="text-purple-700 text-sm md:text-base">Engage your reader's senses with vivid descriptions of sights, sounds, smells, tastes, and textures.</p>
                  </div>
                  <div className="bg-white/50 backdrop-blur-xl border border-white/50 p-6 rounded-2xl border-l-4 border-violet-500 shadow-lg hover:shadow-xl transition-all duration-300 group">
                    <h4 className="font-bold text-purple-900 mb-2 text-lg group-hover:text-purple-700 transition-colors">Play with Rhythm</h4>
                    <p className="text-purple-700 text-sm md:text-base">Vary line lengths and sentence structures to create natural cadence and emphasis in your poem.</p>
                  </div>
                  <div className="bg-white/50 backdrop-blur-xl border border-white/50 p-6 rounded-2xl border-l-4 border-pink-500 shadow-lg hover:shadow-xl transition-all duration-300 group">
                    <h4 className="font-bold text-purple-900 mb-2 text-lg group-hover:text-purple-700 transition-colors">Show, Don't Tell</h4>
                    <p className="text-purple-700 text-sm md:text-base">Instead of stating emotions, use metaphors and imagery to let readers experience them.</p>
                  </div>
                  <div className="bg-white/50 backdrop-blur-xl border border-white/50 p-6 rounded-2xl border-l-4 border-purple-500 shadow-lg hover:shadow-xl transition-all duration-300 group">
                    <h4 className="font-bold text-purple-900 mb-2 text-lg group-hover:text-purple-700 transition-colors">Experiment with Tone</h4>
                    <p className="text-purple-700 text-sm md:text-base">Different tones create different moods. Try romantic, melancholic, inspirational, or whimsical for variety.</p>
                  </div>
                  <div className="bg-white/50 backdrop-blur-xl border border-white/50 p-6 rounded-2xl border-l-4 border-indigo-500 shadow-lg hover:shadow-xl transition-all duration-300 group">
                    <h4 className="font-bold text-purple-900 mb-2 text-lg group-hover:text-purple-700 transition-colors">Revise and Refine</h4>
                    <p className="text-purple-700 text-sm md:text-base">Don't hesitate to edit your poems. The best poetry comes from multiple revisions and thoughtful refinement.</p>
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

export default App
