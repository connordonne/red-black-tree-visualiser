// src/types/visualiser.ts

export type WidgetId = 'tree' | 'memory' | 'explanation' | 'player' | 'controls' | 'pseudocode';

export interface ViewState {
    showTree: boolean;
    showMemory: boolean;
    showExplanation: boolean;
    showPseudocode: boolean;
    showControls: boolean;
}

export interface VisualSettings {
    colorBlindMode: boolean;
    showAddresses: boolean;
    showNils: boolean;
    showIsomorphic: boolean; 
}