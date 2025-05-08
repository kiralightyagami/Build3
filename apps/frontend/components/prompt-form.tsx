"use client"

import * as React from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "../components/ui/button"
import { Textarea } from "../components/ui/textarea"
import { Sparkles } from "lucide-react"
import axios from "axios"

const API_URL = (import.meta as any).env.VITE_API_URL || 'http://localhost:3000'

const examplePrompts = [
  "Create a todo app",
  "Build a simple calculator",
  "Make a portfolio site with project showcase and contact form"
]

export default function PromptForm() {
  const navigate = useNavigate()
  const [prompt, setPrompt] = React.useState("")
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (prompt.trim().length === 0) return
    
    setLoading(true)
    setError(null)
    
    try {
      // First get the template
      const templateResponse = await axios.post(`${API_URL}/api/v1/gemini/template`, {
        prompt,
      })

      const { prompts, uiPrompts } = templateResponse.data

      // Then generate the full project
      const chatResponse = await axios.post(`${API_URL}/api/v1/gemini/generate`, {
        messages: [
          ...prompts.map((content: string) => ({
            role: 'user',
            parts: [{ text: content }]
          })),
          {
            role: 'user',
            parts: [{ text: prompt }]
          }
        ]
      })

      // Store the response in localStorage for the results page
      localStorage.setItem('generationResult', JSON.stringify({
        template: templateResponse.data,
        generation: chatResponse.data
      }))

      // Redirect to results page
      navigate('/results')
    } catch (err) {
      console.error('Error generating website:', err)
      setError('Failed to generate website. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleExampleClick = (example: string) => {
    setPrompt(example)
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-3xl mx-auto">
      <Textarea
        placeholder="Describe the website you want to create..."
        className="min-h-32 p-4 text-lg bg-background/50 backdrop-blur-sm border border-border focus-visible:ring-primary resize-none transition-all duration-300"
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
      />
      
      {error && (
        <div className="mt-4 text-sm text-red-500">
          {error}
        </div>
      )}
      
      <div className="mt-4 flex flex-wrap gap-2">
        <span className="text-sm text-muted-foreground">Try:</span>
        {examplePrompts.map((example, i) => (
          <Button 
            key={i} 
            type="button" 
            variant="outline" 
            size="sm" 
            onClick={() => handleExampleClick(example)}
            className="text-xs"
          >
            {example}
          </Button>
        ))}
      </div>
      
      <div className="mt-6 flex justify-center">
        <Button 
          type="submit" 
          size="lg" 
          disabled={prompt.trim().length === 0 || loading}
          className="px-8 py-6 text-lg font-medium relative overflow-hidden group transition-all duration-300"
        >
          <span className="relative z-10 flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            {loading ? "Generating..." : "Generate Website"}
          </span>
          <span className="absolute inset-0 bg-gradient-to-r from-primary/80 to-primary group-hover:translate-y-0 -translate-y-full transition-transform duration-300"></span>
        </Button>
      </div>
    </form>
  )
} 