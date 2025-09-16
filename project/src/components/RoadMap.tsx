import React, { useState, useEffect, startTransition, useCallback } from 'react';
import { ChevronLeft, Flag, Target, Clock, Check } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getAssessmentCompletion } from '../lib/firebase/assessment';
import { saveRoadmapProgress, getRoadmapProgress, updateMilestoneProgress, initializeRoadmapProgress } from '../lib/firebase/roadmapProgress';
import type { RoadmapPhase } from '../lib/firebase/roadmap';

const RoadMap: React.FC = () => {
  const { user } = useAuth();

  // Default 4Cs Journey phases if no data exists
  const defaultPhases: RoadmapPhase[] = [
    {
      id: 'foundation',
      title: 'Foundation Phase',
      description: 'Establish core business infrastructure and processes',
      order_index: 0,
      milestones: [
        {
          id: 'business-registration',
          phase_id: 'foundation',
          title: 'Business Registration',
          description: 'Complete legal registration and documentation',
          order_index: 0,
          completed: false
        },
        {
          id: 'team-assembly',
          phase_id: 'foundation',
          title: 'Initial Team Assembly',
          description: 'Hire core team members',
          order_index: 1,
          completed: false
        }
      ]
    },
    {
      id: 'development',
      title: 'Development Phase',
      description: 'Build and test core products/services',
      order_index: 1,
      milestones: [
        {
          id: 'mvp-launch',
          phase_id: 'development',
          title: 'MVP Launch',
          description: 'Launch minimum viable product',
          order_index: 0,
          completed: false
        }
      ]
    },
    {
      id: 'growth',
      title: 'Growth Phase',
      description: 'Scale operations and expand market presence',
      order_index: 2,
      milestones: [
        {
          id: 'market-expansion',
          phase_id: 'growth',
          title: 'Market Expansion',
          description: 'Enter new market segments',
          order_index: 0,
          completed: false
        }
      ]
    }
  ];

  const [phases, setPhases] = useState<RoadmapPhase[]>(defaultPhases);
  const [isLoading, setIsLoading] = useState(true);



  // Load roadmap progress from database
  useEffect(() => {
    const loadRoadmapProgress = async () => {
      if (!user) {
        console.log('No user found, using default phases');
        setPhases(defaultPhases);
        setIsLoading(false);
        return;
      }

      try {
        console.log('Loading roadmap progress from database for user:', user.uid);
        
        // Try to load existing progress from database
        const savedProgress = await getRoadmapProgress(user.uid);
        
        if (savedProgress) {
          console.log('Found saved roadmap progress:', savedProgress);
          setPhases(savedProgress.phases);
        } else {
          console.log('No saved progress found, initializing with default phases');
          // Initialize with default phases and save to database
          await initializeRoadmapProgress(user.uid, defaultPhases);
          setPhases(defaultPhases);
        }
      } catch (error) {
        console.error('Error loading roadmap progress:', error);
        // Fallback to default phases
        setPhases(defaultPhases);
      }
      
      setIsLoading(false);
    };

    loadRoadmapProgress();
  }, [user]);

  // Handle URL parameters and assessment completion
  useEffect(() => {
    const processURLParameters = async () => {
      if (!user) return;

      const urlParams = new URLSearchParams(window.location.search);
      const foundationCompleted = urlParams.get('foundationCompleted');
      const developmentCompleted = urlParams.get('developmentCompleted');
      
      console.log('URL Parameters:', { foundationCompleted, developmentCompleted });
      
      // Process URL parameters and update phases accordingly
      if (foundationCompleted === 'true' || developmentCompleted === 'true') {
        try {
          // Get current progress from database
          const currentProgress = await getRoadmapProgress(user.uid);
          const currentPhases = currentProgress?.phases || defaultPhases;
          
          const updatedPhases = currentPhases.map(phase => {
            let shouldComplete = false;
            
            if (foundationCompleted === 'true' && phase.id === 'foundation') {
              shouldComplete = true;
            } else if (developmentCompleted === 'true' && (phase.id === 'foundation' || phase.id === 'development')) {
              shouldComplete = true;
            }
            
            if (shouldComplete) {
              return {
                ...phase,
                milestones: phase.milestones.map(milestone => ({
                  ...milestone,
                  completed: true,
                  completed_at: new Date().toISOString()
                }))
              };
            }
            
            return phase;
          });
          
          console.log('Updated phases from URL parameters:', updatedPhases);
          
          // Calculate overall progress
          const totalMilestones = updatedPhases.reduce((total, phase) => total + phase.milestones.length, 0);
          const completedMilestones = updatedPhases.reduce((total, phase) => 
            total + phase.milestones.filter(milestone => milestone.completed).length, 0
          );
          const overallProgress = totalMilestones > 0 ? Math.round((completedMilestones / totalMilestones) * 100) : 0;
          
          // Save to database
          await saveRoadmapProgress(user.uid, updatedPhases, overallProgress);
          
          // Update local state
          setPhases(updatedPhases);
        } catch (error) {
          console.error('Error processing URL parameters:', error);
        }
      } else {
        // Check for assessment completion from database
        try {
          const assessmentCompletion = await getAssessmentCompletion(user.uid);
          
          if (assessmentCompletion) {
            console.log('Using assessment completion from database');
            
            // Get current progress from database
            const currentProgress = await getRoadmapProgress(user.uid);
            const currentPhases = currentProgress?.phases || defaultPhases;
            
            const updatedPhases = currentPhases.map(phase => {
              let shouldComplete = false;
              
              if (assessmentCompletion.foundationCompleted && phase.id === 'foundation') {
                shouldComplete = true;
              } else if (assessmentCompletion.developmentCompleted && (phase.id === 'foundation' || phase.id === 'development')) {
                shouldComplete = true;
              }
              
              if (shouldComplete) {
                return {
                  ...phase,
                  milestones: phase.milestones.map(milestone => ({
                    ...milestone,
                    completed: true,
                    completed_at: new Date().toISOString()
                  }))
                };
              }
              
              return phase;
            });
            
            // Calculate overall progress
            const totalMilestones = updatedPhases.reduce((total, phase) => total + phase.milestones.length, 0);
            const completedMilestones = updatedPhases.reduce((total, phase) => 
              total + phase.milestones.filter(milestone => milestone.completed).length, 0
            );
            const overallProgress = totalMilestones > 0 ? Math.round((completedMilestones / totalMilestones) * 100) : 0;
            
            // Save to database
            await saveRoadmapProgress(user.uid, updatedPhases, overallProgress);
            
            // Update local state
            setPhases(updatedPhases);
          }
        } catch (error) {
          console.error('Error processing assessment completion:', error);
        }
      }
    };

    if (user) {
      processURLParameters();
    }
  }, [user]);

  const handleMilestoneToggle = useCallback(async (phaseId: string, milestoneId: string, completed: boolean) => {
    console.log('Toggling milestone:', milestoneId, 'from', completed, 'to', !completed);
    
    if (!user) {
      console.log('No user found, cannot save milestone progress');
      return;
    }

    try {
      // Update milestone in database
      await updateMilestoneProgress(user.uid, phaseId, milestoneId, !completed);
      
      // Update local state
      startTransition(() => {
        setPhases(prevPhases => {
          const updatedPhases = prevPhases.map(phase => 
            phase.id === phaseId 
              ? {
                  ...phase,
                  milestones: phase.milestones.map(milestone =>
                    milestone.id === milestoneId
                      ? { 
                          ...milestone, 
                          completed: !completed,
                          completed_at: !completed ? new Date().toISOString() : undefined
                        }
                      : milestone
                  )
                }
              : phase
          );
          
          return updatedPhases;
        });
      });
      
      console.log('Milestone progress updated successfully');
    } catch (error) {
      console.error('Error updating milestone progress:', error);
      // Still update local state even if database save fails
      startTransition(() => {
        setPhases(prevPhases => {
          const updatedPhases = prevPhases.map(phase => 
            phase.id === phaseId 
              ? {
                  ...phase,
                  milestones: phase.milestones.map(milestone =>
                    milestone.id === milestoneId
                      ? { ...milestone, completed: !completed }
                      : milestone
                  )
                }
              : phase
          );
          
          return updatedPhases;
        });
      });
    }
  }, [user]);

  const getPhaseProgress = (phaseId: string) => {
    const phase = phases.find((p) => p.id === phaseId);
    if (!phase) return 0;
    return (
      (phase.milestones.filter((m) => m.completed).length /
        phase.milestones.length) *
      100
    );
  };

  // Determine the current phase (the phase that is in progress)
  const getCurrentPhase = () => {
    const foundationProgress = getPhaseProgress('foundation');
    const developmentProgress = getPhaseProgress('development');
    const growthProgress = getPhaseProgress('growth');
    
    // If Foundation is in progress (not complete and not 0), it's the current phase
    if (foundationProgress > 0 && foundationProgress < 100) {
      return 'foundation';
    }
    // If Development is in progress (not complete and not 0), it's the current phase
    if (developmentProgress > 0 && developmentProgress < 100) {
      return 'development';
    }
    // If Growth is in progress (not complete and not 0), it's the current phase
    if (growthProgress > 0 && growthProgress < 100) {
      return 'growth';
    }
    
    // If no phase is in progress, determine the next phase to start
    if (foundationProgress === 0) {
      return 'foundation';
    }
    if (developmentProgress === 0) {
      return 'development';
    }
    if (growthProgress === 0) {
      return 'growth';
    }
    
    // If all phases are complete, return the last phase
    return 'growth';
  };


  // Determine if a phase is waiting to start (next phase after a completed one)
  const isPhaseWaitingToStart = (phaseId: string) => {
    const foundationProgress = getPhaseProgress('foundation');
    const developmentProgress = getPhaseProgress('development');
    const growthProgress = getPhaseProgress('growth');
    
    // Development is waiting if Foundation is complete but Development is not started
    if (phaseId === 'development') {
      return foundationProgress === 100 && developmentProgress === 0;
    }
    
    // Growth is waiting if Development is complete but Growth is not started
    if (phaseId === 'growth') {
      return developmentProgress === 100 && growthProgress === 0;
    }
    
    return false;
  };

  // Determine if a phase is locked (previous phase that has been completed)
  const isPhaseLocked = (phaseId: string) => {
    const developmentProgress = getPhaseProgress('development');
    const growthProgress = getPhaseProgress('growth');
    
    // Foundation is locked if Development has started (progress > 0)
    if (phaseId === 'foundation') {
      return developmentProgress > 0;
    }
    
    // Development is locked if Growth has started (progress > 0)
    if (phaseId === 'development') {
      return growthProgress > 0;
    }
    
    // Growth is never locked (it's the final phase)
    return false;
  };

  const getOverallProgress = () => {
    if (!phases.length) return 0;
    
    // Calculate progress based on completed phases
    // Foundation Phase = 25% (2 milestones)
    // Development Phase = 50% (2 milestones) 
    // Growth Phase = 25% (2 milestones)
    // Total = 100%
    
    let totalProgress = 0;
    
    phases.forEach(phase => {
      const phaseProgress = getPhaseProgress(phase.id);
      if (phase.id === 'foundation') {
        totalProgress += (phaseProgress / 100) * 25; // Foundation = 25% of total
      } else if (phase.id === 'development') {
        totalProgress += (phaseProgress / 100) * 50; // Development = 50% of total
      } else if (phase.id === 'growth') {
        totalProgress += (phaseProgress / 100) * 25; // Growth = 25% of total
      }
    });
    
    // Check if all phases are completed
    const foundationProgress = getPhaseProgress('foundation');
    const developmentProgress = getPhaseProgress('development');
    const growthProgress = getPhaseProgress('growth');
    
    // If all phases are completed, return 100%
    if (foundationProgress === 100 && developmentProgress === 100 && growthProgress === 100) {
      return 100;
    }
    
    // If Development is completed, Foundation is also completed (logical dependency)
    if (developmentProgress === 100) {
      return 75; // Development completed = 75% progress (Foundation + Development)
    }
    
    return Math.round(totalProgress);
  };

  // Calculate all values before any conditional returns
  const overallProgress = getOverallProgress();
  const currentPhaseValue = getCurrentPhase();
  const visiblePhasesValue = phases;

  // Show loading spinner while processing URL parameters
  if (isLoading) {
    return (
      <div className="min-h-screen bg-white text-navy-blue flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-navy-blue mx-auto mb-4"></div>
          <p className="text-navy-blue">Loading your roadmap...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-navy-blue">
      <div className="container mx-auto px-4 py-6">
        {/* Header with back chevron and 4Cs Journey title */}
        <div className="flex items-center mb-6">
          <Link to="/dashboard" className="mr-4 text-navy-blue hover:text-navy-blue/80">
            <ChevronLeft size={24} />
          </Link>
          <h1 className="text-3xl font-bold text-navy-blue">4Cs Journey</h1>
        </div>


        {/* Overall Progress Section */}
        <div className="mb-8">
          <div className="text-center mb-4">
            <h2 className="text-xl font-semibold text-navy-blue inline-block mr-4">Your Journey Progress</h2>
            <span className="text-sm text-navy-blue bg-gold px-3 py-1 rounded-full font-semibold">
              {overallProgress}% Complete
            </span>
          </div>
        </div>

        {/* Phase Timeline */}
        <div className="mb-8">
          <div className="relative">
            {/* Timeline Line */}
            <div className="absolute top-6 left-0 w-full h-2 bg-gray-300">
              {/* Progress line that extends to completed phases */}
              <div 
                className="absolute top-0 left-0 h-2 bg-gold transition-all duration-300"
                style={{ 
                  width: (() => {
                    if (phases.length === 0) return '0%';
                    
                    // Calculate progress based on completed phases
                    let completedPhases = 0;
                    phases.forEach(phase => {
                      if (getPhaseProgress(phase.id) === 100) {
                        completedPhases++;
                      }
                    });
                    
                    // Return percentage based on completed phases
                    return `${(completedPhases / phases.length) * 100}%`;
                  })()
                }}
              ></div>
            </div>
            
            {/* Phase Icons - Always show all phases */}
            <div className="relative flex justify-between">
              {visiblePhasesValue.map((phase) => {
                const progress = getPhaseProgress(phase.id);
                const isCurrentPhase = phase.id === currentPhaseValue;
                const isWaitingToStart = isPhaseWaitingToStart(phase.id);
                const iconSize = isCurrentPhase ? 40 : 24;
                const containerSize = isCurrentPhase ? 'w-20 h-20' : 'w-12 h-12';
                
                return (
                  <div key={phase.id} className="flex flex-col items-center">
                    <div className={`${containerSize} rounded-full flex items-center justify-center mb-4 relative z-10 transition-all duration-300 ${
                      isCurrentPhase
                        ? 'bg-blue-100 border-4 border-blue-200 shadow-xl' // Entire light blue for current phase
                        : isWaitingToStart
                        ? 'bg-blue-100 border-4 border-blue-300 shadow-lg' // Light blue for waiting phase
                        : progress === 100 
                        ? 'text-white' 
                        : progress > 0 
                        ? 'text-white border-2' 
                        : 'bg-gray-300 border-2 border-gray-300'
                    }`}
                    style={{
                      backgroundColor: progress === 100 || progress > 0 ? '#11335d' : undefined,
                      borderColor: progress > 0 && progress < 100 ? '#11335d' : undefined
                    }}>
                      {progress === 100 ? (
                        <Check size={iconSize} className="text-white" />
                      ) : isCurrentPhase ? (
                        <Clock size={iconSize} className="text-gold" />
                      ) : isWaitingToStart ? (
                        <div className="relative">
                          {/* Custom Timer Icon matching the attached image */}
                          <div className="w-6 h-6 relative">
                            {/* Timer body (dark blue circle) */}
                            <div className="w-4 h-4 rounded-full mx-auto" style={{ backgroundColor: '#11335d' }}></div>
                            {/* Timer stem/button (horizontal line at top, slightly offset right) */}
                            <div className="absolute -top-0.5 left-2 w-1 h-0.5 transform rotate-12" style={{ backgroundColor: '#11335d' }}></div>
                            {/* Timer hand pointing to bottom-right */}
                            <div className="absolute top-1.5 left-1.5 w-0.5 h-1.5 transform rotate-45 origin-bottom" style={{ backgroundColor: '#11335d' }}></div>
                          </div>
                        </div>
                      ) : (
                        <Flag size={iconSize} className="text-gray-600" />
                      )}
                    </div>
                    <span className={`text-sm font-medium text-navy-blue text-center ${isCurrentPhase ? 'font-bold text-lg' : ''}`}>
                      {phase.title}
                    </span>
                    <span className="text-xs text-gray-500 mt-1">
                      {progress === 100
                        ? 'Completed'
                        : isCurrentPhase
                        ? 'In Progress'
                        : isWaitingToStart
                        ? 'Waiting to Start'
                        : 'Not Started'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Phase Cards */}
        <div className="grid gap-8 md:grid-cols-3">
          {visiblePhasesValue.length > 0 ? visiblePhasesValue.map((phase) => (
            <div
              key={phase.id}
              className="bg-white rounded-xl p-6 shadow-lg border border-gray-200 hover:shadow-xl transition-shadow duration-300"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  <Flag size={24} className="text-navy-blue mr-3" />
                  <h2 className="text-xl font-bold text-navy-blue">{phase.title}</h2>
                </div>
                <div className="text-sm text-gold font-semibold bg-gold/10 px-3 py-1 rounded-full border border-gold/20">
                  {Math.round(getPhaseProgress(phase.id))}% Complete
                </div>
              </div>

              <p className="text-gray-600 mb-6 text-base leading-relaxed">
                {phase.description}
              </p>

              <div className="space-y-3">
                {phase.milestones.map((milestone) => {
                  const isPhaseLockedNow = isPhaseLocked(phase.id);
                  console.log('Rendering milestone:', milestone.id, 'completed:', milestone.completed, 'phaseLocked:', isPhaseLockedNow);
                  return (
                    <div
                      key={milestone.id}
                      className={`bg-white rounded-lg p-4 shadow-sm transition-all duration-200 ${
                        isPhaseLockedNow ? 'opacity-75' : 'hover:shadow-md'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <Target size={20} className={isPhaseLockedNow ? "text-gray-400" : "text-gold mr-2"} />
                          <h3 className={`font-semibold ${isPhaseLockedNow ? 'text-gray-500' : 'text-navy-blue'}`}>
                            {milestone.title}
                          </h3>
                        </div>
                        <div
                          className={`w-6 h-6 rounded-full border-2 transition-all duration-200 flex items-center justify-center ${
                            isPhaseLockedNow
                              ? 'bg-gray-200 border-gray-300 cursor-not-allowed'
                              : milestone.completed
                              ? 'bg-gold border-gold cursor-pointer'
                              : 'border-gray-300 hover:border-gold hover:bg-gold/10 cursor-pointer'
                          }`}
                          onClick={() => {
                            if (isPhaseLockedNow) {
                              console.log('Phase is locked, cannot toggle milestone:', milestone.id);
                              return;
                            }
                            console.log('Checkbox clicked:', milestone.id, 'completed:', milestone.completed);
                            handleMilestoneToggle(
                              phase.id,
                              milestone.id,
                              milestone.completed || false
                            );
                          }}
                          title={
                            isPhaseLockedNow
                              ? 'Phase completed - task is locked'
                              : `Click to ${milestone.completed ? 'unmark' : 'mark'} as ${milestone.completed ? 'incomplete' : 'complete'}`
                          }
                        >
                          {milestone.completed && (
                            <Check size={16} className={isPhaseLockedNow ? "text-gray-500" : "text-white"} />
                          )}
                        </div>
                      </div>
                      <p className={`mt-2 ${isPhaseLockedNow ? 'text-gray-400' : 'text-gray-600'}`}>
                        {milestone.description}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          )) : (
            <div className="col-span-full text-center py-8">
              <p className="text-gray-500">No phases available. Please refresh the page.</p>
            </div>
          )}
        </div>

        {/* Roadmap Filter */}
        <div className="mt-8">
          {/* RoadmapFilter removed for simplicity */}
        </div>
      </div>
    </div>
  );
};

export default RoadMap;