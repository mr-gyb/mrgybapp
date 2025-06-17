import React from 'react';
import { ChevronLeft, Calendar, Clock, Briefcase, DollarSign } from 'lucide-react';
import { Link } from 'react-router-dom';

interface WorkDay {
  date: string;
  hours: number;
  projects: number;
  earnings: number;
}

const workHistory: WorkDay[] = [
  { date: '2023-04-15', hours: 8, projects: 3, earnings: 180 },
  { date: '2023-04-14', hours: 7, projects: 2, earnings: 150 },
  { date: '2023-04-13', hours: 9, projects: 4, earnings: 220 },
];

const WorkHistory: React.FC = () => {
  return (
    <div className="bg-white min-h-screen text-navy-blue">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center mb-6">
          <Link to="/dashboard" className="mr-4 text-navy-blue">
            <ChevronLeft size={24} />
          </Link>
          <h1 className="text-3xl font-bold text-navy-blue">Work History</h1>
        </div>
        <div className="space-y-4">
          {workHistory.map((day, index) => (
            <div key={index} className="bg-navy-blue text-white rounded-lg p-6 shadow-md">
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center">
                  <Calendar size={20} className="mr-2" />
                  <span className="text-xl font-semibold">{day.date}</span>
                </div>
                <div className="flex items-center">
                  <DollarSign size={20} className="mr-1" />
                  <span className="text-xl font-semibold">${day.earnings}</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <Clock size={20} className="mr-2" />
                  <span>{day.hours} hours</span>
                </div>
                <div className="flex items-center">
                  <Briefcase size={20} className="mr-2" />
                  <span>{day.projects} projects</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default WorkHistory;