import React from 'react';
import { ChevronLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

interface EarningsOverview {
  today: number;
  thisWeek: number;
  thisMonth: number;
}

interface RecentProject {
  date: string;
  total: number;
  rate: number;
  bonus: number;
}

const Earnings: React.FC = () => {
  const earningsOverview: EarningsOverview = {
    today: 1200,
    thisWeek: 8500,
    thisMonth: 32000,
  };

  const recentProjects: RecentProject[] = [
    { date: '2023-04-15', total: 3000, rate: 2500, bonus: 500 },
    { date: '2023-04-14', total: 2100, rate: 1800, bonus: 300 },
    { date: '2023-04-13', total: 3700, rate: 3000, bonus: 700 },
  ];

  return (
    <div className="bg-navy-blue min-h-screen text-white">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center mb-6">
          <Link to="/dashboard" className="mr-4">
            <ChevronLeft size={24} />
          </Link>
          <h1 className="text-3xl font-bold">Earnings</h1>
        </div>

        <div className="bg-white text-navy-blue rounded-lg p-6 mb-8">
          <h2 className="text-2xl font-bold mb-4">Earnings Overview</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-xl">Today</span>
              <span className="text-2xl font-bold">$ {earningsOverview.today}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xl">This Week</span>
              <span className="text-2xl font-bold">$ {earningsOverview.thisWeek}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xl">This Month</span>
              <span className="text-2xl font-bold">$ {earningsOverview.thisMonth}</span>
            </div>
          </div>
        </div>

        <h2 className="text-2xl font-bold mb-4">Recent Projects</h2>
        <div className="space-y-4">
          {recentProjects.map((project, index) => (
            <div key={index} className="bg-white text-navy-blue rounded-lg p-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xl font-bold">{project.date}</span>
                <span className="text-2xl font-bold">$ {project.total}</span>
              </div>
              <div className="flex justify-between items-center text-gray-600">
                <span>Project Rate: ${project.rate}</span>
                <span>Bonus: ${project.bonus}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Earnings;