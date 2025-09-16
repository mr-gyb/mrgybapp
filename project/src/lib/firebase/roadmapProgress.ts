import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import type { RoadmapPhase } from './roadmap';

export interface RoadmapProgress {
  userId: string;
  phases: RoadmapPhase[];
  lastUpdated: string;
  overallProgress: number;
}

/**
 * Save roadmap progress to database
 */
export const saveRoadmapProgress = async (
  userId: string,
  phases: RoadmapPhase[],
  overallProgress: number
): Promise<void> => {
  try {
    const progressData: RoadmapProgress = {
      userId,
      phases,
      lastUpdated: new Date().toISOString(),
      overallProgress
    };

    const progressRef = doc(db, 'roadmap_progress', userId);
    await setDoc(progressRef, progressData);
    
    console.log('Roadmap progress saved to database:', progressData);
  } catch (error) {
    console.error('Error saving roadmap progress:', error);
    throw error;
  }
};

/**
 * Get roadmap progress from database
 */
export const getRoadmapProgress = async (userId: string): Promise<RoadmapProgress | null> => {
  try {
    const progressRef = doc(db, 'roadmap_progress', userId);
    const progressDoc = await getDoc(progressRef);
    
    if (progressDoc.exists()) {
      const data = progressDoc.data() as RoadmapProgress;
      console.log('Found roadmap progress in database:', data);
      return data;
    }
    
    console.log('No roadmap progress found for user:', userId);
    return null;
  } catch (error) {
    console.error('Error getting roadmap progress:', error);
    return null;
  }
};

/**
 * Update specific milestone completion status
 */
export const updateMilestoneProgress = async (
  userId: string,
  phaseId: string,
  milestoneId: string,
  completed: boolean
): Promise<void> => {
  try {
    // First get current progress
    const currentProgress = await getRoadmapProgress(userId);
    
    if (!currentProgress) {
      console.log('No existing progress found, cannot update milestone');
      return;
    }

    // Update the specific milestone
    const updatedPhases = currentProgress.phases.map(phase => {
      if (phase.id === phaseId) {
        return {
          ...phase,
          milestones: phase.milestones.map(milestone => 
            milestone.id === milestoneId 
              ? { 
                  ...milestone, 
                  completed,
                  completed_at: completed ? new Date().toISOString() : undefined
                }
              : milestone
          )
        };
      }
      return phase;
    });

    // Calculate new overall progress
    const totalMilestones = updatedPhases.reduce((total, phase) => total + phase.milestones.length, 0);
    const completedMilestones = updatedPhases.reduce((total, phase) => 
      total + phase.milestones.filter(milestone => milestone.completed).length, 0
    );
    const newOverallProgress = totalMilestones > 0 ? Math.round((completedMilestones / totalMilestones) * 100) : 0;

    // Save updated progress
    await saveRoadmapProgress(userId, updatedPhases, newOverallProgress);
    
    console.log('Milestone progress updated:', { phaseId, milestoneId, completed });
  } catch (error) {
    console.error('Error updating milestone progress:', error);
    throw error;
  }
};

/**
 * Initialize roadmap progress for a new user
 */
export const initializeRoadmapProgress = async (
  userId: string,
  defaultPhases: RoadmapPhase[]
): Promise<void> => {
  try {
    // Check if progress already exists
    const existingProgress = await getRoadmapProgress(userId);
    
    if (existingProgress) {
      console.log('Roadmap progress already exists for user:', userId);
      return;
    }

    // Initialize with default phases
    await saveRoadmapProgress(userId, defaultPhases, 0);
    console.log('Roadmap progress initialized for user:', userId);
  } catch (error) {
    console.error('Error initializing roadmap progress:', error);
    throw error;
  }
};
