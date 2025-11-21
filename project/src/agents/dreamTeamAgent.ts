/**
 * Dream Team Local Agent
 * 
 * This is a temporary local agent system used to avoid OpenAI API quota issues.
 * It provides placeholder responses based on the selected teammate's specialty.
 * 
 * TODO: Replace this with real training data/model calls when available.
 */

import { OpenAIMessage } from '../types/chat';

/**
 * Agent response type matching the specification
 */
export interface DreamTeamAgentResponse {
  role: 'assistant';
  content: string;
  isFallback?: boolean;
}

// Type alias for compatibility
export type AgentResponse = DreamTeamAgentResponse;

/**
 * Specialty mapping for Dream Team members
 * Matches the exact specifications for the demo
 */
const specialties: Record<string, string> = {
  'Chris': 'strategy, architecture, and product direction',
  'Devin': 'backend systems, AI infrastructure, and data pipelines',
  'Rawan': 'UX, frontend, and overall product experience',
  'Jake': 'content, copy, and marketing strategy',
  // Additional team members from the UI
  'Charlotte': 'human resources management, talent acquisition, employee development, organizational culture, and performance management',
  'Alex': 'business strategy, operations, client relations, project management, and growth initiatives',
  'MR.GYB AI': 'all-in-one business growth assistance, digital marketing, media management, business operations and development, and systems for scaling through automations and AI',
  'Mr.GYB AI': 'all-in-one business growth assistance, digital marketing, media management, business operations and development, and systems for scaling through automations and AI',
  'mrgyb': 'all-in-one business growth assistance, digital marketing, media management, business operations and development, and systems for scaling through automations and AI',
  'mr-gyb-ai': 'all-in-one business growth assistance, digital marketing, media management, business operations and development, and systems for scaling through automations and AI',
};

/**
 * Generate a placeholder response from a Dream Team member
 * 
 * @param message - The user's message
 * @param teammate - The name of the teammate (e.g., "Chris", "Charlotte", etc.)
 * @param history - Optional conversation history for context
 * @returns A placeholder response matching the expected format
 */
export async function dreamTeamAgent(
  message: string,
  teammate: string,
  history?: OpenAIMessage[]
): Promise<DreamTeamAgentResponse> {
  // Normalize teammate name (handle variations)
  const normalizedTeammate = normalizeTeammateName(teammate);
  const specialty = specialties[normalizedTeammate] || 'their area of expertise on the Dream Team';

  // Generate a contextual placeholder response
  const response = generatePlaceholderResponse(message, normalizedTeammate, specialty, history);

  return {
    role: 'assistant',
    content: response,
    isFallback: false, // This is intentional, not a fallback
  };
}

/**
 * Normalize teammate name to handle variations
 */
function normalizeTeammateName(teammate: string): string {
  const normalized = teammate.trim();
  
  // Handle common variations
  if (normalized.toLowerCase().includes('mr') && normalized.toLowerCase().includes('gyb')) {
    return 'MR.GYB AI';
  }
  
  // Capitalize first letter for consistency
  return normalized.charAt(0).toUpperCase() + normalized.slice(1);
}

/**
 * Generate a placeholder response matching the exact specification
 * Simple format: "You are chatting with {teammate}. They specialize in {specialty}.\nYou said: "{message}". (This is a placeholder response for the beta demo until real training data is connected.)"
 */
function generatePlaceholderResponse(
  message: string,
  teammate: string,
  specialty: string,
  history?: OpenAIMessage[]
): string {
  // Use the exact format specified in the requirements
  return `You are chatting with ${teammate}. They specialize in ${specialty}.\nYou said: "${message}". (This is a placeholder response for the beta demo until real training data is connected.)`;
}

// Note: Removed contextual response helpers to match exact specification
// The response format is now simplified to: "You are chatting with {teammate}. They specialize in {specialty}.\nYou said: "{message}". (This is a placeholder response for the beta demo until real training data is connected.)"

