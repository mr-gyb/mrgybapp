import React, { useState } from 'react';
import { ChevronLeft, Save, Edit2, Plus, Trash2, Flag, Target, Clock, Award } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Milestone {
  id: string;
  title: string;
  description: string;
  deadline: string;
  status: 'pending' | 'in-progress' | 'completed';
}

interface Phase {
  id: string;
  title: string;
  description: string;
  milestones: Milestone[];
  timeline: string;
}

const RoadMapTemplate: React.FC = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [phases, setPhases] = useState<Phase[]>([
    {
      id: '1',
      title: 'Foundation Phase',
      description: 'Establish core business infrastructure and processes',
      timeline: 'Q1 2024',
      milestones: [
        {
          id: '1-1',
          title: 'Business Registration',
          description: 'Complete legal registration and documentation',
          deadline: '2024-01-31',
          status: 'pending'
        },
        {
          id: '1-2',
          title: 'Initial Team Assembly',
          description: 'Hire core team members',
          deadline: '2024-02-15',
          status: 'pending'
        }
      ]
    },
    {
      id: '2',
      title: 'Development Phase',
      description: 'Build and test core products/services',
      timeline: 'Q2 2024',
      milestones: [
        {
          id: '2-1',
          title: 'MVP Launch',
          description: 'Launch minimum viable product',
          deadline: '2024-04-30',
          status: 'pending'
        }
      ]
    },
    {
      id: '3',
      title: 'Growth Phase',
      description: 'Scale operations and expand market presence',
      timeline: 'Q3-Q4 2024',
      milestones: [
        {
          id: '3-1',
          title: 'Market Expansion',
          description: 'Enter new market segments',
          deadline: '2024-09-30',
          status: 'pending'
        }
      ]
    }
  ]);

  const handleAddPhase = () => {
    const newPhase: Phase = {
      id: Date.now().toString(),
      title: 'New Phase',
      description: 'Phase description',
      timeline: '',
      milestones: []
    };
    setPhases([...phases, newPhase]);
  };

  const handleAddMilestone = (phaseId: string) => {
    const newMilestone: Milestone = {
      id: Date.now().toString(),
      title: 'New Milestone',
      description: 'Milestone description',
      deadline: '',
      status: 'pending'
    };
    setPhases(phases.map(phase => 
      phase.id === phaseId 
        ? { ...phase, milestones: [...phase.milestones, newMilestone] }
        : phase
    ));
  };

  const handleUpdatePhase = (phaseId: string, field: keyof Phase, value: string) => {
    setPhases(phases.map(phase =>
      phase.id === phaseId ? { ...phase, [field]: value } : phase
    ));
  };

  const handleUpdateMilestone = (phaseId: string, milestoneId: string, field: keyof Milestone, value: string) => {
    setPhases(phases.map(phase =>
      phase.id === phaseId
        ? {
            ...phase,
            milestones: phase.milestones.map(milestone =>
              milestone.id === milestoneId ? { ...milestone, [field]: value } : milestone
            )
          }
        : phase
    ));
  };

  const handleDeletePhase = (phaseId: string) => {
    setPhases(phases.filter(phase => phase.id !== phaseId));
  };

  const handleDeleteMilestone = (phaseId: string, milestoneId: string) => {
    setPhases(phases.map(phase =>
      phase.id === phaseId
        ? { ...phase, milestones: phase.milestones.filter(m => m.id !== milestoneId) }
        : phase
    ));
  };

  return (
    <div className="bg-white min-h-screen text-navy-blue">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <Link to="/road-map" className="mr-4 text-navy-blue">
              <ChevronLeft size={24} />
            </Link>
            <h1 className="text-3xl font-bold text-navy-blue">Business Road Map</h1>
          </div>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="bg-navy-blue text-white px-4 py-2 rounded-full flex items-center"
          >
            {isEditing ? <Save size={20} className="mr-2" /> : <Edit2 size={20} className="mr-2" />}
            {isEditing ? 'Save Changes' : 'Edit Road Map'}
          </button>
        </div>

        <div className="space-y-8">
          {phases.map((phase, index) => (
            <div key={phase.id} className="bg-gray-100 rounded-lg p-6 shadow-md">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <Flag size={24} className="mr-2 text-navy-blue" />
                  {isEditing ? (
                    <input
                      type="text"
                      value={phase.title}
                      onChange={(e) => handleUpdatePhase(phase.id, 'title', e.target.value)}
                      className="text-2xl font-bold bg-transparent border-b border-navy-blue focus:outline-none"
                    />
                  ) : (
                    <h2 className="text-2xl font-bold">{phase.title}</h2>
                  )}
                </div>
                {isEditing && (
                  <button
                    onClick={() => handleDeletePhase(phase.id)}
                    className="text-red-500 hover:text-red-600"
                  >
                    <Trash2 size={20} />
                  </button>
                )}
              </div>

              <div className="mb-4">
                {isEditing ? (
                  <>
                    <textarea
                      value={phase.description}
                      onChange={(e) => handleUpdatePhase(phase.id, 'description', e.target.value)}
                      className="w-full p-2 rounded border border-gray-300 mb-2"
                      rows={2}
                    />
                    <input
                      type="text"
                      value={phase.timeline}
                      onChange={(e) => handleUpdatePhase(phase.id, 'timeline', e.target.value)}
                      placeholder="Timeline (e.g., Q1 2024)"
                      className="w-full p-2 rounded border border-gray-300"
                    />
                  </>
                ) : (
                  <>
                    <p className="text-gray-600 mb-2">{phase.description}</p>
                    <div className="flex items-center">
                      <Clock size={16} className="mr-2 text-gray-500" />
                      <span className="text-gray-500">{phase.timeline}</span>
                    </div>
                  </>
                )}
              </div>

              <div className="space-y-4">
                {phase.milestones.map((milestone) => (
                  <div key={milestone.id} className="bg-white rounded-lg p-4 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center">
                        <Target size={20} className="mr-2 text-navy-blue" />
                        {isEditing ? (
                          <input
                            type="text"
                            value={milestone.title}
                            onChange={(e) => handleUpdateMilestone(phase.id, milestone.id, 'title', e.target.value)}
                            className="font-semibold bg-transparent border-b border-navy-blue focus:outline-none"
                          />
                        ) : (
                          <h3 className="font-semibold">{milestone.title}</h3>
                        )}
                      </div>
                      {isEditing && (
                        <button
                          onClick={() => handleDeleteMilestone(phase.id, milestone.id)}
                          className="text-red-500 hover:text-red-600"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                    {isEditing ? (
                      <>
                        <textarea
                          value={milestone.description}
                          onChange={(e) => handleUpdateMilestone(phase.id, milestone.id, 'description', e.target.value)}
                          className="w-full p-2 rounded border border-gray-300 mb-2"
                          rows={2}
                        />
                        <input
                          type="date"
                          value={milestone.deadline}
                          onChange={(e) => handleUpdateMilestone(phase.id, milestone.id, 'deadline', e.target.value)}
                          className="w-full p-2 rounded border border-gray-300"
                        />
                      </>
                    ) : (
                      <>
                        <p className="text-gray-600 mb-2">{milestone.description}</p>
                        <div className="flex items-center">
                          <Clock size={16} className="mr-2 text-gray-500" />
                          <span className="text-gray-500">
                            {new Date(milestone.deadline).toLocaleDateString()}
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                ))}
                {isEditing && (
                  <button
                    onClick={() => handleAddMilestone(phase.id)}
                    className="w-full bg-white border-2 border-dashed border-gray-300 rounded-lg p-4 text-gray-500 hover:text-navy-blue hover:border-navy-blue flex items-center justify-center"
                  >
                    <Plus size={20} className="mr-2" />
                    Add Milestone
                  </button>
                )}
              </div>
            </div>
          ))}

          {isEditing && (
            <button
              onClick={handleAddPhase}
              className="w-full bg-navy-blue text-white rounded-lg p-4 flex items-center justify-center"
            >
              <Plus size={24} className="mr-2" />
              Add Phase
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default RoadMapTemplate;