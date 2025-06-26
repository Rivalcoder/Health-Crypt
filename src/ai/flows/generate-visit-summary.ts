'use server';

/**
 * @fileOverview A flow to generate a summary of a patient's past medical history and treatments.
 *
 * - generateVisitSummary - A function that generates the visit summary.
 * - GenerateVisitSummaryInput - The input type for the generateVisitSummary function.
 * - GenerateVisitSummaryOutput - The return type for the generateVisitSummary function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateVisitSummaryInputSchema = z.object({
  patientId: z.string().describe('The unique identifier of the patient.'),
  medicalHistory: z.string().describe("The patient's complete medical history, including all visit notes and treatments."),
});

export type GenerateVisitSummaryInput = z.infer<typeof GenerateVisitSummaryInputSchema>;

const GenerateVisitSummaryOutputSchema = z.object({
  summary: z.string().describe("A concise summary of the patient's entire medical history."),
});

export type GenerateVisitSummaryOutput = z.infer<typeof GenerateVisitSummaryOutputSchema>;

export async function generateVisitSummary(input: GenerateVisitSummaryInput): Promise<GenerateVisitSummaryOutput> {
  return generateVisitSummaryFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateVisitSummaryPrompt',
  input: {schema: GenerateVisitSummaryInputSchema},
  output: {schema: GenerateVisitSummaryOutputSchema},
  prompt: `You are an AI assistant helping doctors prepare for patient consultations.

  Please provide a concise summary of the patient's entire medical history based on the information below. The history may contain notes from multiple visits. Synthesize this information into a coherent overview.

  Patient ID: {{{patientId}}}
  
  Full Medical History:
  {{{medicalHistory}}}

  Summary: `,
});

const generateVisitSummaryFlow = ai.defineFlow(
  {
    name: 'generateVisitSummaryFlow',
    inputSchema: GenerateVisitSummaryInputSchema,
    outputSchema: GenerateVisitSummaryOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
