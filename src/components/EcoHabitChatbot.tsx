import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Sparkles, Leaf, Trash2, Info } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

type Message = {
  role: 'user' | 'assistant';
  content: string;
  contentElement?: JSX.Element;
};

type SuggestedHabit = {
  name: string;
  description: string;
  carbonImpact: string;
};

const GEMINI_API_KEY = 'AIzaSyA2TpSLDoSmxlj8u7mCoR8twcIkgPYEsqM';
const GEMINI_PRO_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

export default function EcoHabitChatbot({ onAddHabit }: { onAddHabit: (habit: SuggestedHabit) => void }) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: "Hi! I'm your Eco-Habit Assistant. Tell me about a habit you'd like to adopt, and I'll help assess its environmental impact and suggest improvements."
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [suggestedHabit, setSuggestedHabit] = useState<SuggestedHabit | null>(null);
  const { toast } = useToast();

  const analyzeHabitWithGemini = async (habitDescription: string): Promise<SuggestedHabit> => {
    console.log('Analyzing habit with Gemini:', habitDescription);
    
    const prompt = `Analyze whether this proposed habit is environmentally sustainable. 

Rules:
1. REJECT if the habit increases carbon footprint
2. REJECT if the habit harms the environment
3. APPROVE only if it reduces environmental impact

If APPROVED, provide:
1. A concise habit name (max 3 words)
2. A 1-sentence benefit description
3. Estimated CO2 savings (kg/month)

If REJECTED, explain why in 1 sentence

Habit idea: "${habitDescription}"

Respond in this JSON format ONLY:
{
  "status": "APPROVED" | "REJECTED",
  "name": "short name" | null,
  "description": "benefit description" | "rejection reason",
  "carbonImpact": "X kg CO2/month" | null
}`;

    try {
      const response = await fetch(`${GEMINI_PRO_API_URL}?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }]
        })
      });

      if (!response.ok) throw new Error('API request failed');

      const data = await response.json();
      const responseText = data.candidates[0].content.parts[0].text;
      
      // Extract JSON from response
      const jsonStart = responseText.indexOf('{');
      const jsonEnd = responseText.lastIndexOf('}') + 1;
      const jsonString = responseText.slice(jsonStart, jsonEnd);
      const result = JSON.parse(jsonString);
      
      if (result.status === 'REJECTED') {
        throw new Error(result.description || 'This habit is not environmentally sustainable');
      }
      
      if (!result.name || !result.description || !result.carbonImpact) {
        throw new Error('Invalid response format');
      }
      
      return {
        name: result.name,
        description: result.description,
        carbonImpact: result.carbonImpact
      };
    } catch (error) {
      console.error('Analysis error:', error);
      throw error;
    }
  };

  const formatResponse = (habit: SuggestedHabit): string => {
    return `Here's your eco-habit analysis:\n\n• Habit Name: ${habit.name}\n• Environmental Benefit: ${habit.description}\n• Estimated Impact: ${habit.carbonImpact}\n\nWould you like to add this to your habits?`;
  };

  const formatRejection = (reason: string): string => {
    return `This habit isn't sustainable:\n\n• ${reason}\n\nSuggestions:\n• Try focusing on reducing waste or energy use\n• Consider transportation alternatives like biking or public transit\n• Look into energy-efficient appliances or renewable energy`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    setIsLoading(true);
    const userMessage: Message = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');

    try {
      const habitAnalysis = await analyzeHabitWithGemini(input);
      
      const assistantMessage: Message = {
        role: 'assistant',
        content: formatResponse(habitAnalysis)
      };

      setMessages(prev => [...prev, assistantMessage]);
      setSuggestedHabit(habitAnalysis);
    } catch (error) {
      console.error('Error analyzing habit:', error);
      toast({
        title: 'Error',
        description: 'Failed to analyze habit. Please try again.',
        variant: 'destructive'
      });
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: formatRejection(error.message)
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddSuggestedHabit = () => {
    if (!suggestedHabit) return;
    onAddHabit(suggestedHabit);
    setSuggestedHabit(null);
    setMessages([
      {
        role: 'assistant',
        content: `"${suggestedHabit.name}" has been added to your habits! What else would you like to improve?`
      }
    ]);
    toast({
      title: 'Habit Added',
      description: `You've adopted: ${suggestedHabit.name}`
    });
  };

  const handleClearConversation = () => {
    setMessages([
      {
        role: 'assistant',
        content: "Hi! I'm your Eco-Habit Assistant. Tell me about a habit you'd like to adopt, and I'll help assess its environmental impact and suggest improvements."
      }
    ]);
    setInput('');
    setSuggestedHabit(null);
  };

  return (
    <Card className="mt-4">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-green-500" />
            <CardTitle>AI Habit Assistant</CardTitle>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="h-4 w-4 text-muted-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent className="max-w-[300px]">
                <p className="font-medium mb-1">How to describe habits:</p>
                <ul className="list-disc pl-4 space-y-1 text-sm">
                  <li>Be specific (e.g. "shorter showers" vs "save water")</li>
                  <li>Include frequency (e.g. "meatless Mondays")</li>
                  <li>Mention current behavior (e.g. "I currently leave lights on")</li>
                  <li>Example: "I want to reduce my shower time from 10 to 5 minutes"</li>
                </ul>
              </TooltipContent>
            </Tooltip>
          </div>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={handleClearConversation}
            className="text-muted-foreground hover:text-destructive"
          >
            <Trash2 className="h-4 w-4 mr-1" />
            Clear
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'assistant' ? 'justify-start' : 'justify-end'}`}>
              <div className={`max-w-[80%] rounded-lg px-4 py-2 ${msg.role === 'assistant' ? 'bg-muted' : 'bg-primary text-primary-foreground'}`}>
                <div className="whitespace-pre-line">{msg.content}</div>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="max-w-[80%] rounded-lg px-4 py-2 bg-muted">
                Analyzing your habit...
              </div>
            </div>
          )}
        </div>
        
        {suggestedHabit && (
          <div className="flex justify-center gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setSuggestedHabit(null)}
            >
              Cancel
            </Button>
            <Button 
              size="sm"
              onClick={handleAddSuggestedHabit}
              className="gap-1"
            >
              <Leaf className="h-4 w-4" />
              Add Habit
            </Button>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <form onSubmit={handleSubmit} className="w-full flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Example: 'I want to reduce my shower time from 10 to 5 minutes'"
            disabled={isLoading}
          />
          <Button type="submit" disabled={isLoading || !input.trim()}>
            Send
          </Button>
        </form>
      </CardFooter>
    </Card>
  );
}
