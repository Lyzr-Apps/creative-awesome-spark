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
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-50 flex items-center justify-center p-4 md:p-8 relative overflow-hidden">
      {/* Animated gradient orbs */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-purple-300 to-purple-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
      <div className="absolute -bottom-8 left-20 w-72 h-72 bg-gradient-to-br from-purple-200 to-purple-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
      <div className="absolute top-1/2 left-1/2 w-80 h-80 bg-gradient-to-br from-purple-300 to-white rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-4000"></div>

      <style>{`
        @keyframes blob {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>

      <div className="w-full max-w-2xl relative z-10">
        {/* Header */}
        <div className="text-center mb-8 md:mb-16">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="p-2 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full">
              <Sparkles className="w-8 h-8 md:w-10 md:h-10 text-white" />
            </div>
            <h1 className="text-4xl md:text-6xl font-black bg-gradient-to-r from-purple-600 via-purple-500 to-purple-700 bg-clip-text text-transparent">
              Poem Generator
            </h1>
            <div className="p-2 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full">
              <Sparkles className="w-8 h-8 md:w-10 md:h-10 text-white" />
            </div>
          </div>
          <p className="text-purple-600 text-sm md:text-lg font-semibold">
            Transform your imagination into beautiful poetry
          </p>
        </div>

        {/* Input Card */}
        <Card className="bg-white/80 backdrop-blur-xl border-purple-200 mb-6 md:mb-10 shadow-2xl hover:shadow-3xl transition-all duration-300 border-2">
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
                <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-purple-600 rounded-xl opacity-0 group-hover:opacity-5 pointer-events-none transition-opacity"></div>
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
                className="bg-gradient-to-r from-purple-100 to-purple-100 border-2 border-purple-300 text-purple-700 hover:from-purple-200 hover:to-purple-200 font-bold h-12 md:h-14 text-base md:text-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 rounded-xl hover:shadow-md"
              >
                <div className="flex items-center gap-2">
                  <RefreshCw className="w-5 h-5" />
                  <span>New Prompt</span>
                </div>
              </Button>
            </div>
          </form>
        </Card>

        {/* Poem Display Card */}
        {poem && (
          <Card
            className={`bg-gradient-to-br from-white to-purple-50/50 border-2 border-purple-200 p-6 md:p-10 shadow-2xl transition-all duration-1000 backdrop-blur-sm ${
              showPoem ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
          >
            {/* Title */}
            {poem.result.title && (
              <h2 className="text-3xl md:text-4xl font-black bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent mb-6 md:mb-8">
                {poem.result.title}
              </h2>
            )}

            {/* Poem Text */}
            <div className="bg-gradient-to-br from-purple-50 to-white rounded-2xl p-8 md:p-10 mb-8 md:mb-10 border-2 border-purple-100 shadow-inner">
              <p className="text-purple-900 whitespace-pre-wrap font-serif text-lg md:text-2xl leading-relaxed md:leading-loose font-light italic">
                {poem.result.poem}
              </p>
            </div>

            {/* Metadata */}
            <div className="space-y-4 md:space-y-6">
              {poem.result.style && (
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between bg-purple-50 rounded-xl p-4 border border-purple-100">
                  <span className="text-purple-700 font-bold text-sm md:text-base mb-2 sm:mb-0">Style:</span>
                  <span className="text-purple-900 font-semibold text-base md:text-lg">{poem.result.style}</span>
                </div>
              )}

              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between bg-purple-50 rounded-xl p-4 border border-purple-100">
                <span className="text-purple-700 font-bold text-sm md:text-base mb-2 sm:mb-0">Stanzas:</span>
                <span className="text-purple-900 font-semibold text-base md:text-lg">{poem.result.stanza_count || 'N/A'}</span>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between bg-purple-50 rounded-xl p-4 border border-purple-100">
                <span className="text-purple-700 font-bold text-sm md:text-base mb-2 sm:mb-0">Lines:</span>
                <span className="text-purple-900 font-semibold text-base md:text-lg">{poem.result.line_count || 'N/A'}</span>
              </div>

              {poem.metadata?.processing_time && (
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between bg-purple-50 rounded-xl p-4 border border-purple-100">
                  <span className="text-purple-700 font-bold text-sm md:text-base mb-2 sm:mb-0">Processing Time:</span>
                  <span className="text-purple-900 font-semibold text-base md:text-lg">{poem.metadata.processing_time}</span>
                </div>
              )}

              {poem.metadata?.creative_elements && poem.metadata.creative_elements.length > 0 && (
                <div className="bg-purple-50 rounded-xl p-4 md:p-6 border border-purple-100">
                  <span className="text-purple-700 font-bold text-sm md:text-base block mb-4">Creative Elements:</span>
                  <div className="flex flex-wrap gap-3">
                    {poem.metadata.creative_elements.map((element, idx) => (
                      <span
                        key={idx}
                        className="inline-block bg-gradient-to-r from-purple-500 to-purple-600 text-white px-4 py-2 rounded-full text-xs md:text-sm font-bold shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200"
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
          <div className="text-center py-12 md:py-16">
            <p className="text-purple-600 text-base md:text-xl font-semibold">
              Let your creativity flow. Enter a topic to begin your poetic journey.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default App