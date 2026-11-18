import type { Scenario } from '@/types/scenario';

// Import all scenarios
import { mysteryThrillerScenario } from '@/scenarios/mystery-thriller';
import { romanceComedyScenario } from '@/scenarios/romance-comedy';
import { sciFiAdventureScenario } from '@/scenarios/sci-fi-adventure';
import { familyDramaScenario } from '@/scenarios/family-drama';
import { superheroActionScenario } from '@/scenarios/superhero-action';
import { discordGamingScenario } from '@/scenarios/discord-gaming';
import { slackWorkplaceScenario } from '@/scenarios/slack-workplace';
import { imessageFamilyScenario } from '@/scenarios/imessage-family';

// Discord variants
import { discordMysteryScenario } from '@/scenarios/discord-mystery';
import { discordRomanceScenario } from '@/scenarios/discord-romance';
import { discordScifiScenario } from '@/scenarios/discord-scifi';
import { discordFamilyScenario } from '@/scenarios/discord-family';
import { discordSuperheroScenario } from '@/scenarios/discord-superhero';

// Slack variants
import { slackMysteryScenario } from '@/scenarios/slack-mystery';
import { slackRomanceScenario } from '@/scenarios/slack-romance';
import { slackScifiScenario } from '@/scenarios/slack-scifi';
import { slackFamilyScenario } from '@/scenarios/slack-family';
import { slackSuperheroScenario } from '@/scenarios/slack-superhero';

// iMessage variants
import { imessageMysteryScenario } from '@/scenarios/imessage-mystery';
import { imessageRomanceScenario } from '@/scenarios/imessage-romance';
import { imessageScifiScenario } from '@/scenarios/imessage-scifi';
import { imessageSuperheroScenario } from '@/scenarios/imessage-superhero';

// Signal variants
import { signalMysteryScenario } from '@/scenarios/signal-mystery';
import { signalRomanceScenario } from '@/scenarios/signal-romance';
import { signalScifiScenario } from '@/scenarios/signal-scifi';
import { signalSuperheroScenario } from '@/scenarios/signal-superhero';

// Teams variants
import { teamsMysteryScenario } from '@/scenarios/teams-mystery';
import { teamsRomanceScenario } from '@/scenarios/teams-romance';
import { teamsScifiScenario } from '@/scenarios/teams-scifi';
import { teamsSuperheroScenario } from '@/scenarios/teams-superhero';

export const availableScenarios: Scenario[] = [
  // DEBUG: Log all scenarios when they're loaded
  // Original scenarios
  mysteryThrillerScenario,
  romanceComedyScenario,
  sciFiAdventureScenario,
  familyDramaScenario,
  superheroActionScenario,
  discordGamingScenario,
  slackWorkplaceScenario,
  imessageFamilyScenario,
  
  // Discord variants
  discordMysteryScenario,
  discordRomanceScenario,
  discordScifiScenario,
  discordFamilyScenario,
  discordSuperheroScenario,
  
  // Slack variants
  slackMysteryScenario,
  slackRomanceScenario,
  slackScifiScenario,
  slackFamilyScenario,
  slackSuperheroScenario,
  
  // iMessage variants
  imessageMysteryScenario,
  imessageRomanceScenario,
  imessageScifiScenario,
  imessageSuperheroScenario,
  
  // Signal variants
  signalMysteryScenario,
  signalRomanceScenario,
  signalScifiScenario,
  signalSuperheroScenario,
  
  // Teams variants
  teamsMysteryScenario,
  teamsRomanceScenario,
  teamsScifiScenario,
  teamsSuperheroScenario
];

export const getScenarioById = (id: string): Scenario | undefined => {
  return availableScenarios.find(scenario => scenario.id === id);
};

export const getScenarioTitles = (): Array<{ id: string; title: string }> => {
  return availableScenarios.map(scenario => ({
    id: scenario.id,
    title: scenario.title
  }));
};

// Custom scenario management
const CUSTOM_SCENARIOS_KEY = 'chat-simulator-custom-scenarios';

export const saveCustomScenario = (scenario: Scenario): void => {
  const customScenarios = getCustomScenarios();
  const existingIndex = customScenarios.findIndex(s => s.id === scenario.id);
  
  if (existingIndex >= 0) {
    customScenarios[existingIndex] = scenario;
  } else {
    customScenarios.push(scenario);
  }
  
  localStorage.setItem(CUSTOM_SCENARIOS_KEY, JSON.stringify(customScenarios));
};

export const getCustomScenarios = (): Scenario[] => {
  try {
    const stored = localStorage.getItem(CUSTOM_SCENARIOS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

export const deleteCustomScenario = (scenarioId: string): void => {
  const customScenarios = getCustomScenarios();
  const filtered = customScenarios.filter(s => s.id !== scenarioId);
  localStorage.setItem(CUSTOM_SCENARIOS_KEY, JSON.stringify(filtered));
};

export const getAllScenarios = (): Scenario[] => {
  return [...availableScenarios, ...getCustomScenarios()];
};

// Scenario organization by type and platform
export interface ScenarioType {
  id: string;
  name: string;
  description: string;
  icon: string;
  platforms: Array<{
    platform: string;
    theme: string;
    scenarioId: string;
  }>;
}

export const scenarioTypes: ScenarioType[] = [
  {
    id: 'mystery',
    name: 'Mystery Investigation',
    description: 'Detective stories and crime solving',
    icon: '🔍',
    platforms: [
      { platform: 'WhatsApp', theme: 'whatsapp', scenarioId: 'mystery-thriller' },
      { platform: 'Discord', theme: 'discord', scenarioId: 'discord-mystery' },
      { platform: 'iMessage', theme: 'imessage', scenarioId: 'imessage-mystery' }
    ]
  },
  {
    id: 'romance',
    name: 'Coffee Shop Romance',
    description: 'Sweet meet-cute stories',
    icon: '💕',
    platforms: [
      { platform: 'WhatsApp', theme: 'whatsapp', scenarioId: 'romance-comedy' },
      { platform: 'Discord', theme: 'discord', scenarioId: 'discord-romance' },
      { platform: 'iMessage', theme: 'imessage', scenarioId: 'imessage-romance' }
    ]
  },
  {
    id: 'scifi',
    name: 'Space Mission',
    description: 'Sci-fi adventures and space exploration',
    icon: '🚀',
    platforms: [
      { platform: 'WhatsApp', theme: 'whatsapp', scenarioId: 'sci-fi-adventure' },
      { platform: 'Discord', theme: 'discord', scenarioId: 'discord-scifi' },
      { platform: 'iMessage', theme: 'imessage', scenarioId: 'imessage-scifi' }
    ]
  }
];

export const getScenarioByTypeAndPlatform = (typeId: string, platform: string, scenarioTypesToUse?: ScenarioType[]): Scenario | undefined => {
  const typesToUse = scenarioTypesToUse || scenarioTypes;
  const scenarioType = typesToUse.find(type => type.id === typeId);
  if (!scenarioType) return undefined;
  
  const platformConfig = scenarioType.platforms.find(p => p.platform === platform);
  if (!platformConfig) return undefined;
  
  return getScenarioById(platformConfig.scenarioId);
};

// Add custom scenarios to the type system
export const getScenarioTypesWithCustom = (): ScenarioType[] => {
  const customScenarios = getCustomScenarios();
  const customType: ScenarioType = {
    id: 'custom',
    name: 'Custom Scenarios',
    description: 'Your created scenarios',
    icon: '✨',
    platforms: customScenarios.map(scenario => ({
      platform: scenario.title,
      theme: scenario.theme,
      scenarioId: scenario.id
    }))
  };
  
  return [...scenarioTypes, customType];
};
