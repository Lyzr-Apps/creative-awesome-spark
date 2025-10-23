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
      {/* Animated gradient orbs */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-purple-300 to-purple-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
      <div className="absolute -bottom-8 left-20 w-72 h-72 bg-gradient-to-br from-purple-200 to-purple-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
      <div className="absolute top-1/2 left-1/2 w-80 h-80 bg-gradient-to-br from-purple-300 to-white rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-4000"></div>

      <style>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
        .animate-blob { animation: blob 7s infinite; }
        .animation-delay-2000 { animation-delay: 2s; }
        .animation-delay-4000 { animation-delay: 4s; }
        @keyframes slideIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-slideIn { animation: slideIn 0.6s ease-out; }
      `}</style>

      <div className="w-full max-w-5xl relative z-10">
        {/* Header */}
        <div className="text-center mb-6 md:mb-10 pt-4 animate-slideIn">
          <div className="flex items-center justify-center gap-2 md:gap-4 mb-4">
            <div className="p-2 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full shadow-lg">
              <Sparkles className="w-6 h-6 md:w-8 md:h-8 text-white" />
            </div>
            <h1 className="text-3xl md:text-5xl font-black bg-gradient-to-r from-purple-600 via-purple-500 to-purple-700 bg-clip-text text-transparent">
              Poem Studio
            </h1>
            <div className="p-2 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full shadow-lg">
              <Sparkles className="w-6 h-6 md:w-8 md:h-8 text-white" />
            </div>
          </div>
          <p className="text-purple-600 text-xs md:text-base font-semibold">
            Create, Collect & Cherish Your Poetry
          </p>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 md:grid-cols-4 bg-white/70 backdrop-blur-sm border-2 border-purple-200 rounded-xl mb-6 md:mb-8">
            <TabsTrigger value="generate" className="text-xs md:text-sm rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-purple-600 data-[state=active]:text-white">
              <Sparkles className="w-4 h-4 mr-1" />
              <span className="hidden sm:inline">Create</span>
            </TabsTrigger>
            <TabsTrigger value="library" className="text-xs md:text-sm rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-purple-600 data-[state=active]:text-white">
              <FileText className="w-4 h-4 mr-1" />
              <span className="hidden sm:inline">Library</span>
            </TabsTrigger>
            <TabsTrigger value="favorites" className="text-xs md:text-sm rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-purple-600 data-[state=active]:text-white">
              <Heart className="w-4 h-4 mr-1" />
              <span className="hidden sm:inline">Favorites</span>
            </TabsTrigger>
            <TabsTrigger value="tips" className="text-xs md:text-sm rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-purple-600 data-[state=active]:text-white hidden md:block">
              <Share2 className="w-4 h-4 mr-1" />
              Tips
            </TabsTrigger>
          </TabsList>

          {/* Generate Tab */}
          <TabsContent value="generate" className="space-y-6 animate-slideIn">
            <Card className="bg-white/80 backdrop-blur-xl border-purple-200 shadow-2xl hover:shadow-3xl transition-all duration-300 border-2">
              <form onSubmit={handleGeneratePoem} className="p-6 md:p-10">
                <div className="mb-8">
                  <label htmlFor="prompt" className="block text-purple-900 font-bold mb-4 text-base md:text-lg">
                    What would you like your poem to be about?
                  </label>
                  <div className="relative group">
                    <Input
                      id="prompt"
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      placeholder="e.g., moonlight dreams, passionate love, the ocean's whisper..."
                      className="w-full bg-white border-2 border-purple-200 text-purple-900 placeholder-purple-400 text-base md:text-lg h-14 md:h-16 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 rounded-xl transition-all duration-200 font-medium group-hover:border-purple-300"
                      disabled={loading}
                    />
                  </div>
                </div>

                {/* Tone Selector */}
                <div className="mb-8">
                  <label className="block text-purple-900 font-bold mb-4 text-base md:text-lg">
                    Poetry Tone
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {['romantic', 'melancholic', 'inspirational', 'whimsical'].map(tone => (
                      <button
                        key={tone}
                        type="button"
                        onClick={() => setToneOption(tone)}
                        className={`p-3 rounded-lg font-semibold transition-all duration-200 ${
                          toneOption === tone
                            ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-lg'
                            : 'bg-purple-100 text-purple-700 hover:bg-purple-200 border-2 border-purple-200'
                        }`}
                      >
                        {tone.charAt(0).toUpperCase() + tone.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Error Message */}
                {error && (
                  <div className="mb-8 p-4 bg-gradient-to-br from-red-50 to-red-100 border-2 border-red-300 rounded-lg text-red-700 text-sm md:text-base font-medium animate-pulse">
                    {error}
                  </div>
                )}

                {/* Buttons */}
                <div className="flex gap-3 md:gap-4 flex-col sm:flex-row">
                  <Button
                    type="submit"
                    disabled={loading || !prompt.trim()}
                    className="flex-1 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-bold h-12 md:h-14 text-base md:text-lg disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-xl rounded-xl disabled:from-purple-400 disabled:to-purple-500"
                  >
                    {loading ? (
                      <div className="flex items-center gap-3">
                        <Spinner className="w-5 h-5 animate-spin" />
                        <span>Generating...</span>
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
                    className="bg-gradient-to-r from-purple-100 to-purple-100 border-2 border-purple-300 text-purple-700 hover:from-purple-200 hover:to-purple-200 font-bold h-12 md:h-14 text-base md:text-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 rounded-xl hover:shadow-md"
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
              <Card className={`bg-gradient-to-br from-white to-purple-50/50 border-2 border-purple-200 p-6 md:p-10 shadow-2xl transition-all duration-1000 backdrop-blur-sm ${showPoem ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                  <div>
                    {poem.result.title && (
                      <h2 className="text-3xl md:text-4xl font-black bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent mb-2">
                        {poem.result.title}
                      </h2>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="border-2 border-purple-300 text-purple-700 hover:bg-purple-100 rounded-lg" onClick={() => handleCopyPoem(poem.result.poem, 'current')}>
                      {copiedId === 'current' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </Button>
                    <Button size="sm" variant="outline" className="border-2 border-purple-300 text-purple-700 hover:bg-purple-100 rounded-lg" onClick={() => handleDownloadPoem(poem.result.title || 'poem', poem.result.poem)}>
                      <Download className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="outline" className="border-2 border-purple-300 text-purple-700 hover:bg-purple-100 rounded-lg" onClick={handleSavePoem}>
                      <Heart className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-white rounded-2xl p-8 md:p-10 mb-8 md:mb-10 border-2 border-purple-100 shadow-inner">
                  <p className="text-purple-900 whitespace-pre-wrap font-serif text-lg md:text-2xl leading-relaxed md:leading-loose font-light italic">
                    {poem.result.poem}
                  </p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {poem.result.style && (
                    <div className="bg-purple-50 rounded-lg p-3 border border-purple-100">
                      <span className="text-purple-700 font-bold text-xs block">Style</span>
                      <span className="text-purple-900 font-semibold text-sm">{poem.result.style}</span>
                    </div>
                  )}
                  <div className="bg-purple-50 rounded-lg p-3 border border-purple-100">
                    <span className="text-purple-700 font-bold text-xs block">Stanzas</span>
                    <span className="text-purple-900 font-semibold text-sm">{poem.result.stanza_count || 'N/A'}</span>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-3 border border-purple-100">
                    <span className="text-purple-700 font-bold text-xs block">Lines</span>
                    <span className="text-purple-900 font-semibold text-sm">{poem.result.line_count || 'N/A'}</span>
                  </div>
                  {poem.metadata?.processing_time && (
                    <div className="bg-purple-50 rounded-lg p-3 border border-purple-100">
                      <span className="text-purple-700 font-bold text-xs block">Processing</span>
                      <span className="text-purple-900 font-semibold text-sm">{poem.metadata.processing_time}</span>
                    </div>
                  )}
                </div>

                {poem.metadata?.creative_elements && poem.metadata.creative_elements.length > 0 && (
                  <div className="mt-6">
                    <span className="text-purple-700 font-bold text-sm block mb-3">Creative Elements:</span>
                    <div className="flex flex-wrap gap-2">
                      {poem.metadata.creative_elements.map((element, idx) => (
                        <span key={idx} className="inline-block bg-gradient-to-r from-purple-500 to-purple-600 text-white px-3 py-1 rounded-full text-xs font-bold shadow-md">
                          {element}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </Card>
            )}

            {!poem && !loading && (
              <div className="text-center py-8 md:py-12">
                <p className="text-purple-600 text-base md:text-xl font-semibold">
                  Let your creativity flow. Enter a topic to begin your poetic journey.
                </p>
              </div>
            )}
          </TabsContent>

          {/* Library Tab */}
          <TabsContent value="library" className="animate-slideIn">
            {allSavedPoems.length === 0 ? (
              <Card className="bg-white/80 backdrop-blur-xl border-purple-200 shadow-2xl border-2 p-8 md:p-12 text-center">
                <FileText className="w-12 h-12 text-purple-400 mx-auto mb-4" />
                <p className="text-purple-700 text-lg font-semibold">No poems yet</p>
                <p className="text-purple-500">Generate and save your first poem to build your library</p>
              </Card>
            ) : (
              <div className="space-y-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-bold text-purple-900">Your Library ({allSavedPoems.length})</h3>
                  <button onClick={() => setViewMode(viewMode === 'list' ? 'grid' : 'list')} className="p-2 hover:bg-purple-100 rounded-lg transition-colors">
                    {viewMode === 'list' ? <Grid3x3 className="w-5 h-5 text-purple-600" /> : <FileText className="w-5 h-5 text-purple-600" />}
                  </button>
                </div>
                <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 gap-4' : 'space-y-4'}>
                  {allSavedPoems.map(p => (
                    <Card key={p.id} className="bg-white/80 backdrop-blur-xl border-purple-200 border-2 p-4 hover:shadow-lg transition-all group">
                      <div className="flex justify-between items-start gap-3">
                        <div className="flex-1">
                          <h4 className="font-bold text-purple-900 group-hover:text-purple-600 transition-colors">{p.title}</h4>
                          <p className="text-purple-500 text-sm">{new Date(p.timestamp).toLocaleDateString()}</p>
                          <p className="text-purple-700 text-sm line-clamp-2 mt-2">{p.content}</p>
                        </div>
                        <div className="flex gap-1">
                          <button onClick={() => handleToggleFavorite(p.id)} className="p-2 hover:bg-purple-100 rounded-lg transition-colors">
                            <Heart className={`w-4 h-4 ${p.isFavorite ? 'fill-red-500 text-red-500' : 'text-purple-400'}`} />
                          </button>
                          <button onClick={() => handleCopyPoem(p.content, p.id)} className="p-2 hover:bg-purple-100 rounded-lg transition-colors">
                            {copiedId === p.id ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4 text-purple-400" />}
                          </button>
                          <button onClick={() => handleDownloadPoem(p.title, p.content)} className="p-2 hover:bg-purple-100 rounded-lg transition-colors">
                            <Download className="w-4 h-4 text-purple-400" />
                          </button>
                          <button onClick={() => handleDeletePoem(p.id)} className="p-2 hover:bg-red-100 rounded-lg transition-colors">
                            <Trash2 className="w-4 h-4 text-red-400" />
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
              <Card className="bg-white/80 backdrop-blur-xl border-purple-200 shadow-2xl border-2 p-8 md:p-12 text-center">
                <Heart className="w-12 h-12 text-purple-400 mx-auto mb-4" />
                <p className="text-purple-700 text-lg font-semibold">No favorites yet</p>
                <p className="text-purple-500">Heart poems to add them to your favorites collection</p>
              </Card>
            ) : (
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-purple-900 mb-4">Your Favorites ({favorites.length})</h3>
                {favorites.map(p => (
                  <Card key={p.id} className="bg-white/80 backdrop-blur-xl border-purple-200 border-2 p-6 hover:shadow-lg transition-all">
                    <div className="flex justify-between items-start gap-4 mb-4">
                      <div className="flex-1">
                        <h4 className="font-bold text-purple-900 text-lg">{p.title}</h4>
                        <p className="text-purple-500 text-sm flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          {new Date(p.timestamp).toLocaleDateString()}
                        </p>
                      </div>
                      <button onClick={() => handleToggleFavorite(p.id)} className="p-2 hover:bg-purple-100 rounded-lg transition-colors">
                        <Heart className="w-5 h-5 fill-red-500 text-red-500" />
                      </button>
                    </div>
                    <div className="bg-gradient-to-br from-purple-50 to-white rounded-lg p-4 border border-purple-100 mb-4">
                      <p className="text-purple-900 whitespace-pre-wrap font-serif text-sm md:text-base leading-relaxed">{p.content}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="border-purple-300 text-purple-700 hover:bg-purple-100 flex-1" onClick={() => handleCopyPoem(p.content, p.id)}>
                        {copiedId === p.id ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
                        {copiedId === p.id ? 'Copied!' : 'Copy'}
                      </Button>
                      <Button size="sm" variant="outline" className="border-purple-300 text-purple-700 hover:bg-purple-100 flex-1" onClick={() => handleDownloadPoem(p.title, p.content)}>
                        <Download className="w-4 h-4 mr-2" />
                        Download
                      </Button>
                      <Button size="sm" variant="outline" className="border-red-300 text-red-600 hover:bg-red-100" onClick={() => handleDeletePoem(p.id)}>
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
            <Card className="bg-white/80 backdrop-blur-xl border-purple-200 shadow-2xl border-2 p-6 md:p-10">
              <h3 className="text-2xl font-bold text-purple-900 mb-6">Poetry Writing Tips</h3>
              <div className="space-y-4">
                <div className="bg-gradient-to-r from-purple-50 to-white p-4 rounded-lg border-l-4 border-purple-500">
                  <h4 className="font-bold text-purple-900 mb-2">Use Sensory Details</h4>
                  <p className="text-purple-700 text-sm">Engage your reader's senses with vivid descriptions of sights, sounds, smells, tastes, and textures.</p>
                </div>
                <div className="bg-gradient-to-r from-purple-50 to-white p-4 rounded-lg border-l-4 border-purple-500">
                  <h4 className="font-bold text-purple-900 mb-2">Play with Rhythm</h4>
                  <p className="text-purple-700 text-sm">Vary line lengths and sentence structures to create natural cadence and emphasis in your poem.</p>
                </div>
                <div className="bg-gradient-to-r from-purple-50 to-white p-4 rounded-lg border-l-4 border-purple-500">
                  <h4 className="font-bold text-purple-900 mb-2">Show, Don't Tell</h4>
                  <p className="text-purple-700 text-sm">Instead of stating emotions, use metaphors and imagery to let readers experience them.</p>
                </div>
                <div className="bg-gradient-to-r from-purple-50 to-white p-4 rounded-lg border-l-4 border-purple-500">
                  <h4 className="font-bold text-purple-900 mb-2">Experiment with Tone</h4>
                  <p className="text-purple-700 text-sm">Different tones create different moods. Try romantic, melancholic, inspirational, or whimsical for variety.</p>
                </div>
                <div className="bg-gradient-to-r from-purple-50 to-white p-4 rounded-lg border-l-4 border-purple-500">
                  <h4 className="font-bold text-purple-900 mb-2">Revise and Refine</h4>
                  <p className="text-purple-700 text-sm">Don't hesitate to edit your poems. The best poetry comes from multiple revisions and thoughtful refinement.</p>
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
