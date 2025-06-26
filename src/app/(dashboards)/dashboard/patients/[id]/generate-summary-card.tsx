'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Sparkles, Loader2 } from 'lucide-react';
import { generateVisitSummary, GenerateVisitSummaryInput } from '@/ai/flows/generate-visit-summary';

// Note: This component now summarizes the entire patient history, not just one visit.
export function GenerateSummaryCard({ patientId, medicalHistory }: GenerateVisitSummaryInput) {
  const [summary, setSummary] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleGenerateSummary = async () => {
    setIsLoading(true);
    setSummary('');
    try {
      if (!medicalHistory || medicalHistory.trim() === '') {
        toast({
          title: 'Cannot Generate Summary',
          description: 'There is no medical history to summarize for this patient.',
          variant: 'destructive',
        });
        setIsLoading(false);
        return;
      }

      const result = await generateVisitSummary({ patientId, medicalHistory });
      setSummary(result.summary);
       toast({
        title: 'Summary Generated',
        description: 'AI-powered patient summary has been created.',
        variant: 'default',
      });
    } catch (error) {
      console.error('Failed to generate summary:', error);
      toast({
        title: 'Error',
        description: 'Could not generate the patient summary. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="bg-primary/5 border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="text-primary" />
          AI Patient Summary
        </CardTitle>
        <CardDescription>
          Generate a concise summary of the patient's entire history to prepare for the consultation.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button onClick={handleGenerateSummary} disabled={isLoading} className="w-full">
          {isLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Sparkles className="mr-2 h-4 w-4" />
          )}
          {isLoading ? 'Generating...' : 'Generate Summary'}
        </Button>
        {(isLoading || summary) && (
            <div className="relative">
                <Textarea
                    readOnly
                    value={summary}
                    placeholder={isLoading ? "The AI is summarizing the patient's records..." : ''}
                    className="w-full h-48 bg-background"
                />
                {isLoading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-background/50">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                )}
            </div>
        )}
      </CardContent>
    </Card>
  );
}
