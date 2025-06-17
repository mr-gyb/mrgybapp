import React, { useState, useEffect } from 'react';
import { ChevronLeft, Flag, Target, Clock, Award, Check } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { getRoadmapProgress, updateMilestoneProgress } from '../lib/firebase/roadmap';
import type { RoadmapPhase } from '../lib/firebase/roadmap';
import RoadmapFilter from './filters/RoadmapFilter';

const RoadMap: React.FC = () => {
  const { user } = useAuth();
  const { isDarkMode } = useTheme();
  const [phases, setPhases] = useState<RoadmapPhase[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadProgress = async () => {
      if (!user) return;
      setIsLoading(true);
      try {
        const progress = await getRoadmapProgress(user.uid);
        if (progress) {
          setPhases(progress);
        }
      } catch (error) {
        console.error('Error loading roadmap progress:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadProgress();
  }, [user]);

  const handleMilestoneToggle = async (
    phaseId: string,
    milestoneId: string,
    completed: boolean
  ) => {
    if (!user) return;

    try {
      await updateMilestoneProgress(user.uid, phaseId, milestoneId, !completed);
      setPhases((prevPhases) =>
        prevPhases.map((phase) => ({
          ...phase,
          milestones: phase.milestones.map((milestone) =>
            milestone.id === milestoneId
              ? { ...milestone, completed: !completed }
              : milestone
          ),
        }))
      );
    } catch (error) {
      console.error('Error updating milestone:', error);
    }
  };

  const getPhaseProgress = (phaseId: string) => {
    const phase = phases.find((p) => p.id === phaseId);
    if (!phase) return 0;
    return (
      (phase.milestones.filter((m) => m.completed).length /
        phase.milestones.length) *
      100
    );
  };

  const getOverallProgress = () => {
    if (!phases.length) return 0;
    
    const totalMilestones = phases.reduce((total, phase) => total + phase.milestones.length, 0);
    const completedMilestones = phases.reduce((total, phase) => 
      total + phase.milestones.filter(m => m.completed).length, 0);
    
    return Math.round((completedMilestones / totalMilestones) * 100);
  };

  if (isLoading) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center ${
          isDarkMode ? 'bg-navy-blue' : 'bg-white'
        }`}
      >
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gold"></div>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen ${
        isDarkMode ? 'bg-navy-blue text-white' : 'bg-white text-navy-blue'
      }`}
    >
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <Link
              to="/dashboard"
              className={`mr-4 ${isDarkMode ? 'text-white' : 'text-navy-blue'}`}
            >
              <ChevronLeft size={24} />
            </Link>
            <h1 className="text-3xl font-bold">4Cs Journey</h1>
          </div>
        </div>

        {/* Progress Timeline - Now at the top */}
        <div className="mb-8">
          <div className="flex items-center justify-center mb-8">
            <h2 className="text-2xl font-bold">Your Journey Progress</h2>
            <span className="ml-4 px-4 py-1 bg-gold text-navy-blue rounded-full font-bold">
              {getOverallProgress()}% Complete
            </span>
          </div>
          <div className="relative">
            <div
              className={`absolute top-1/2 left-0 w-full h-1 ${
                isDarkMode ? 'bg-gray-700' : 'bg-gray-200'
              } -translate-y-1/2`}
            ></div>
            <div className="relative flex justify-between">
              {phases.map((phase) => {
                const progress = getPhaseProgress(phase.id);
                return (
                  <div key={phase.id} className="flex flex-col items-center">
                    <div
                      className={`w-12 h-12 rounded-full ${
                        progress === 100
                          ? 'bg-gold'
                          : progress > 0
                          ? 'bg-blue-500'
                          : isDarkMode
                          ? 'bg-gray-700'
                          : 'bg-gray-300'
                      } flex items-center justify-center mb-4 relative z-10`}
                    >
                      {progress === 100 ? (
                        <Check size={24} className="text-white" />
                      ) : progress > 0 ? (
                        <Clock size={24} className="text-white" />
                      ) : null}
                    </div>
                    <span className="text-sm font-medium text-center">
                      {phase.title}
                    </span>
                    <span
                      className={`text-xs ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-500'
                      } mt-1`}
                    >
                      {progress === 100
                        ? 'Completed'
                        : progress > 0
                        ? 'In Progress'
                        : 'Not Started'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          {phases.map((phase) => (
            <div
              key={phase.id}
              className={`${
                isDarkMode ? 'bg-navy-blue/50' : 'bg-gray-100'
              } rounded-lg p-6 shadow-md w-full`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <Flag size={24} className="text-gold mr-2" />
                  <h2 className="text-2xl font-bold">{phase.title}</h2>
                </div>
                <div className="text-sm text-gold">
                  {Math.round(getPhaseProgress(phase.id))}% Complete
                </div>
              </div>

              <p
                className={`mb-4 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-600'
                }`}
              >
                {phase.description}
              </p>

              <div className="space-y-4">
                {phase.milestones.map((milestone) => (
                  <div
                    key={milestone.id}
                    className={`${
                      isDarkMode ? 'bg-navy-blue' : 'bg-white'
                    } rounded-lg p-4 shadow-sm cursor-pointer transition-all duration-200 hover:shadow-md`}
                    onClick={() =>
                      handleMilestoneToggle(
                        phase.id,
                        milestone.id,
                        milestone.completed || false
                      )
                    }
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Target size={20} className="text-gold mr-2" />
                        <h3 className="font-semibold">{milestone.title}</h3>
                      </div>
                      <div
                        className={`w-6 h-6 rounded-full border-2 ${
                          milestone.completed
                            ? 'bg-gold border-gold'
                            : isDarkMode
                            ? 'border-gray-600'
                            : 'border-gray-300'
                        } flex items-center justify-center`}
                      >
                        {milestone.completed && (
                          <Check size={16} className="text-white" />
                        )}
                      </div>
                    </div>
                    <p
                      className={`mt-2 ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-600'
                      }`}
                    >
                      {milestone.description}
                    </p>
                    {milestone.completed && milestone.completed_at && (
                      <div className="flex items-center mt-2 text-sm text-gold">
                        <Clock size={14} className="mr-1" />
                        Completed on{' '}
                        {new Date(milestone.completed_at).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        <RoadmapFilter />
      </div>
    </div>
  );
};

export default RoadMap;