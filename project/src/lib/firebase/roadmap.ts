import { collection, getDocs, doc, getDoc, updateDoc, query, where, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import { v4 as uuidv4 } from 'uuid';

export interface RoadmapMilestone {
  id: string;
  phase_id: string;
  title: string;
  description: string;
  order_index: number;
  completed?: boolean;
  completed_at?: string;
}

export interface RoadmapPhase {
  id: string;
  title: string;
  description: string;
  order_index: number;
  milestones: RoadmapMilestone[];
}

// Mock data for initial setup
const mockRoadmap: RoadmapPhase[] = [
  {
    id: '1',
    title: 'Foundation Phase',
    description: 'Establish core business infrastructure and processes',
    order_index: 0,
    milestones: [
      {
        id: '1-1',
        phase_id: '1',
        title: 'Business Registration',
        description: 'Complete legal registration and documentation',
        order_index: 0,
        completed: false
      },
      {
        id: '1-2',
        phase_id: '1',
        title: 'Initial Team Assembly',
        description: 'Hire core team members',
        order_index: 1,
        completed: false
      }
    ]
  },
  {
    id: '2',
    title: 'Development Phase',
    description: 'Build and test core products/services',
    order_index: 1,
    milestones: [
      {
        id: '2-1',
        phase_id: '2',
        title: 'MVP Launch',
        description: 'Launch minimum viable product',
        order_index: 0,
        completed: false
      }
    ]
  },
  {
    id: '3',
    title: 'Growth Phase',
    description: 'Scale operations and expand market presence',
    order_index: 2,
    milestones: [
      {
        id: '3-1',
        phase_id: '3',
        title: 'Market Expansion',
        description: 'Enter new market segments',
        order_index: 0,
        completed: false
      }
    ]
  }
];

export const initializeRoadmap = async (userId: string) => {
  try {
    // Check if roadmap already exists for this user
    const roadmapQuery = query(
      collection(db, 'roadmap_user_progress'),
      where('userId', '==', userId)
    );
    
    const snapshot = await getDocs(roadmapQuery);
    
    if (snapshot.empty) {
      // Create roadmap phases
      for (const phase of mockRoadmap) {
        const phaseRef = await addDoc(collection(db, 'roadmap_phases'), {
          title: phase.title,
          description: phase.description,
          order_index: phase.order_index
        });
        
        // Create milestones for this phase
        for (const milestone of phase.milestones) {
          await addDoc(collection(db, 'roadmap_milestones'), {
            phase_id: phaseRef.id,
            title: milestone.title,
            description: milestone.description,
            order_index: milestone.order_index
          });
        }
      }
    }
  } catch (error) {
    console.error('Error initializing roadmap:', error);
  }
};

export const getRoadmapProgress = async (userId: string) => {
  try {
    // For now, return mock data
    // In a real implementation, you would query Firestore for the user's roadmap progress
    return mockRoadmap;
  } catch (error) {
    console.error('Error getting roadmap progress:', error);
    return [];
  }
};

export const updateMilestoneProgress = async (
  userId: string,
  phaseId: string,
  milestoneId: string,
  completed: boolean
) => {
  try {
    // In a real implementation, you would update the milestone progress in Firestore
    // For now, just update the mock data
    const phase = mockRoadmap.find(p => p.id === phaseId);
    if (phase) {
      const milestone = phase.milestones.find(m => m.id === milestoneId);
      if (milestone) {
        milestone.completed = completed;
        milestone.completed_at = completed ? new Date().toISOString() : undefined;
      }
    }
    return true;
  } catch (error) {
    console.error('Error updating milestone progress:', error);
    return false;
  }
};