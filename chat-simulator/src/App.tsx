import React, { useState, useEffect } from 'react';
import { ChatSimulator } from '@/components/Chat/ChatSimulator';
import { ScenarioTypeSelector } from '@/components/ScenarioTypeSelector';
import { ScenarioEditor } from '@/components/ScenarioEditor';
import { Notification } from '@/components/Notification';
import { ServerStatus } from '@/components/ServerStatus';
import { 
  scenarioTypes,
  getScenarioTypesWithCustom,
  getScenarioByTypeAndPlatform,
  saveCustomScenario,
  deleteCustomScenario,
  getCustomScenarios
} from '@/utils/scenarioLoader';
import type { Scenario } from '@/types/scenario';
import type { ScenarioType } from '@/utils/scenarioLoader';

export default function App() {
  const [selectedTypeId, setSelectedTypeId] = useState<string | null>(null);
  const [selectedPlatform, setSelectedPlatform] = useState<string | null>(null);
  const [showEditor, setShowEditor] = useState(false);
  const [editingScenario, setEditingScenario] = useState<Scenario | undefined>(undefined);
  const [notification, setNotification] = useState<{
    message: string;
    type: 'success' | 'error' | 'info';
  } | null>(null);
  
  const [scenarioTypesWithCustom, setScenarioTypesWithCustom] = useState(getScenarioTypesWithCustom());
  
  const selectedType = scenarioTypesWithCustom.find(type => type.id === selectedTypeId) || null;
  const selectedScenario = selectedTypeId && selectedPlatform 
    ? getScenarioByTypeAndPlatform(selectedTypeId, selectedPlatform, scenarioTypesWithCustom)
    : null;

  useEffect(() => {
    setScenarioTypesWithCustom(getScenarioTypesWithCustom());
  }, []);

  const handleTypeSelect = (typeId: string) => {
    setSelectedTypeId(typeId);
    setSelectedPlatform(null); // Reset platform selection
  };

  const handlePlatformSelect = (platform: string) => {
    setSelectedPlatform(platform);
  };

  const handleCreateScenario = () => {
    setEditingScenario(undefined);
    setShowEditor(true);
  };

  const handleEditScenario = (scenario: Scenario) => {
    setEditingScenario(scenario);
    setShowEditor(true);
  };

  const handleSaveScenario = (scenario: Scenario) => {
    // Generate unique ID for new scenarios
    if (!scenario.id) {
      scenario.id = `custom-${Date.now()}`;
    }
    
    saveCustomScenario(scenario);
    setScenarioTypesWithCustom(getScenarioTypesWithCustom());
    setShowEditor(false);
    setEditingScenario(undefined);
  };

  const handleCancelEditor = () => {
    setShowEditor(false);
    setEditingScenario(undefined);
  };

  const showNotification = (message: string, type: 'success' | 'error' | 'info') => {
    setNotification({ message, type });
  };

  const hideNotification = () => {
    setNotification(null);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar Navigation */}
      <div className="w-80 bg-white shadow-lg flex flex-col">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Scenarios</h2>
          <button
            onClick={handleCreateScenario}
            className="w-full px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors text-sm"
          >
            + Create Custom Scenario
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          <ScenarioTypeSelector
            scenarioTypes={scenarioTypesWithCustom}
            selectedTypeId={selectedTypeId}
            onTypeSelect={handleTypeSelect}
            selectedPlatform={selectedPlatform}
            onPlatformSelect={handlePlatformSelect}
          />
        </div>
        
        <div className="p-4 border-t border-gray-200">
          <ServerStatus />
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <div className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-800">
              Chat Simulator
            </h1>
            <div className="text-sm text-gray-500">
              {selectedScenario ? selectedScenario.title : 'Select a scenario to begin'}
            </div>
          </div>
        </div>

        {/* Main Chat Area */}
        <div className="flex-1 p-6 flex items-center justify-center">
          {selectedScenario ? (
            <div className="w-full max-w-md">
              <ChatSimulator 
                scenario={selectedScenario} 
                theme={selectedScenario.theme}
                showReplayButton={true}
                onGifComplete={(message) => showNotification(message, 'success')}
                onGifError={(message) => showNotification(message, 'error')}
              />
            </div>
          ) : (
            <div className="text-center text-gray-500">
              <div className="text-6xl mb-4">💬</div>
              <h3 className="text-xl font-medium mb-2">Welcome to Chat Simulator</h3>
              <p className="text-gray-400">Select a scenario from the sidebar to start simulating conversations</p>
            </div>
          )}
        </div>
      </div>

      {/* Modals and Notifications */}
      {showEditor && (
        <ScenarioEditor
          onSave={handleSaveScenario}
          onCancel={handleCancelEditor}
          initialScenario={editingScenario}
        />
      )}

      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={hideNotification}
        />
      )}
    </div>
  );
}

