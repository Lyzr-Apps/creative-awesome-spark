import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Spinner } from '@/components/ui/spinner'
import { RefreshCw, Sparkles } from 'lucide-react'
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

function App() {
  const [prompt, setPrompt] = useState('')
  const [poem, setPoem] = useState<PoemResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPoem, setShowPoem] = useState(false)

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
      const response = await callAIAgent(prompt, '68fa2d904f148178b1db38b5')

      if (response && response.response) {
        const parsedData = parseLLMJson(response.response, null) as PoemResponse | null

        if (parsedData && parsedData.result && parsedData.result.poem) {
          setPoem(parsedData)
          // Trigger fade-in animation
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4 md:p-8">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8 md:mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Sparkles className="w-8 h-8 md:w-10 md:h-10 text-blue-400" />
            <h1 className="text-3xl md:text-5xl font-bold text-white">
              Poem Generator
            </h1>
            <Sparkles className="w-8 h-8 md:w-10 md:h-10 text-blue-400" />
          </div>
          <p className="text-slate-400 text-sm md:text-base">
            Transform your thoughts into beautiful poetry
          </p>
        </div>

        {/* Input Card */}
        <Card className="bg-slate-800 border-slate-700 mb-6 md:mb-8 shadow-2xl">
          <form onSubmit={handleGeneratePoem} className="p-6 md:p-8">
            <div className="mb-6">
              <label htmlFor="prompt" className="block text-white font-semibold mb-3 text-base md:text-lg">
                Enter Topic, Theme, or Keywords
              </label>
              <Input
                id="prompt"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="e.g., autumn leaves, lost love, the future..."
                className="bg-slate-700 border-slate-600 text-white placeholder-slate-400 text-base md:text-lg h-12 md:h-14 focus:ring-2 focus:ring-blue-400"
                disabled={loading}
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-red-900 border border-red-700 rounded-lg text-red-200 text-sm md:text-base">
                {error}
              </div>
            )}

            {/* Buttons */}
            <div className="flex gap-3 md:gap-4">
              <Button
                type="submit"
                disabled={loading || !prompt.trim()}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold h-11 md:h-12 text-base md:text-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <Spinner className="w-4 h-4" />
                    Generating...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5" />
                    Generate Poem
                  </div>
                )}
              </Button>

              <Button
                type="button"
                onClick={handleClear}
                disabled={loading}
                variant="outline"
                className="bg-slate-700 border-slate-600 text-white hover:bg-slate-600 font-semibold h-11 md:h-12 text-base md:text-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                <div className="flex items-center gap-2">
                  <RefreshCw className="w-5 h-5" />
                  <span className="hidden sm:inline">Clear</span>
                  <span className="sm:hidden">Reset</span>
                </div>
              </Button>
            </div>
          </form>
        </Card>

        {/* Poem Display Card */}
        {poem && (
          <Card
            className={`bg-slate-800 border-slate-700 p-6 md:p-8 shadow-2xl transition-all duration-1000 ${
              showPoem ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
          >
            {/* Title */}
            {poem.result.title && (
              <h2 className="text-2xl md:text-3xl font-bold text-blue-400 mb-4 md:mb-6">
                {poem.result.title}
              </h2>
            )}

            {/* Poem Text */}
            <div className="bg-slate-700 rounded-lg p-6 md:p-8 mb-6 md:mb-8 border border-slate-600">
              <p className="text-white whitespace-pre-wrap font-serif text-base md:text-xl leading-relaxed md:leading-loose">
                {poem.result.poem}
              </p>
            </div>

            {/* Metadata */}
            <div className="space-y-4 text-sm md:text-base">
              {poem.result.style && (
                <div className="flex flex-col sm:flex-row sm:justify-between">
                  <span className="text-slate-400">Style:</span>
                  <span className="text-white font-semibold">{poem.result.style}</span>
                </div>
              )}

              <div className="flex flex-col sm:flex-row sm:justify-between">
                <span className="text-slate-400">Stanzas:</span>
                <span className="text-white font-semibold">{poem.result.stanza_count || 'N/A'}</span>
              </div>

              <div className="flex flex-col sm:flex-row sm:justify-between">
                <span className="text-slate-400">Lines:</span>
                <span className="text-white font-semibold">{poem.result.line_count || 'N/A'}</span>
              </div>

              {poem.metadata?.processing_time && (
                <div className="flex flex-col sm:flex-row sm:justify-between">
                  <span className="text-slate-400">Processing Time:</span>
                  <span className="text-white font-semibold">{poem.metadata.processing_time}</span>
                </div>
              )}

              {poem.metadata?.creative_elements && poem.metadata.creative_elements.length > 0 && (
                <div className="flex flex-col">
                  <span className="text-slate-400 mb-2">Creative Elements:</span>
                  <div className="flex flex-wrap gap-2">
                    {poem.metadata.creative_elements.map((element, idx) => (
                      <span
                        key={idx}
                        className="inline-block bg-blue-900 text-blue-200 px-3 py-1 rounded-full text-xs md:text-sm font-medium"
                      >
                        {element}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </Card>
        )}

        {/* Empty State */}
        {!poem && !loading && (
          <div className="text-center text-slate-400 py-12">
            <p className="text-base md:text-lg">
              Enter a topic or theme above to generate your poem
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default App