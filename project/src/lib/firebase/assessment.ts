import { doc, setDoc, getDoc, updateDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase';

export interface AssessmentCompletion {
  userId: string;
  businessStage: 'Foundation' | 'Development' | 'Growth';
  foundationCompleted: boolean;
  developmentCompleted: boolean;
  completedAt: string;
  answers?: Record<string, string>;
}

export interface AssessmentAnswers {
  legallyRegistered: string;
  definedProduct: string;
  monthlyRevenue: string;
  recurringCustomers: string;
  marketingBudget: string;
  automationTools: string;
  teamSize: string;
  revenueGrowth: string;
  multipleRegions: string;
  scalingProcesses: string;
}

/**
 * Save assessment completion status to database
 */
export const saveAssessmentCompletion = async (
  userId: string,
  businessStage: 'Foundation' | 'Development' | 'Growth',
  answers: AssessmentAnswers
): Promise<void> => {
  try {
    const assessmentData: AssessmentCompletion = {
      userId,
      businessStage,
      foundationCompleted: businessStage === 'Development' || businessStage === 'Growth',
      developmentCompleted: businessStage === 'Growth',
      completedAt: new Date().toISOString(),
      answers
    };

    const assessmentRef = doc(db, 'assessment_completions', userId);
    await setDoc(assessmentRef, assessmentData);
    
    console.log('Assessment completion saved to database:', assessmentData);
  } catch (error) {
    console.error('Error saving assessment completion:', error);
    throw error;
  }
};

/**
 * Check if user has completed assessment
 */
export const getAssessmentCompletion = async (userId: string): Promise<AssessmentCompletion | null> => {
  try {
    const assessmentRef = doc(db, 'assessment_completions', userId);
    const assessmentDoc = await getDoc(assessmentRef);
    
    if (assessmentDoc.exists()) {
      const data = assessmentDoc.data() as AssessmentCompletion;
      console.log('Found assessment completion in database:', data);
      return data;
    }
    
    console.log('No assessment completion found for user:', userId);
    return null;
  } catch (error) {
    console.error('Error getting assessment completion:', error);
    return null;
  }
};

/**
 * Update assessment completion status (if needed)
 */
export const updateAssessmentCompletion = async (
  userId: string,
  updates: Partial<AssessmentCompletion>
): Promise<void> => {
  try {
    const assessmentRef = doc(db, 'assessment_completions', userId);
    await updateDoc(assessmentRef, {
      ...updates,
      updatedAt: new Date().toISOString()
    });
    
    console.log('Assessment completion updated:', updates);
  } catch (error) {
    console.error('Error updating assessment completion:', error);
    throw error;
  }
};

/**
 * Delete assessment completion (for testing purposes)
 */
export const deleteAssessmentCompletion = async (userId: string): Promise<void> => {
  try {
    const assessmentRef = doc(db, 'assessment_completions', userId);
    await setDoc(assessmentRef, {}, { merge: false });
    console.log('Assessment completion deleted for user:', userId);
  } catch (error) {
    console.error('Error deleting assessment completion:', error);
    throw error;
  }
};
