import React, { useState } from 'react';
import { ChevronLeft, Edit2, Save, Plus, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';

interface ResumeSection {
  id: string;
  title: string;
  content: string[];
}

const Resume: React.FC = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [resumeSections, setResumeSections] = useState<ResumeSection[]>([
    {
      id: '1',
      title: 'Professional Summary',
      content: [
        'Results-driven professional with expertise in digital marketing and business growth strategies',
        'Proven track record of implementing successful marketing campaigns and driving ROI',
        'Strong leadership abilities with experience in team management and project coordination'
      ]
    },
    {
      id: '2',
      title: 'Work Experience',
      content: [
        'Senior Marketing Manager at TechCorp (2021-Present)',
        'Digital Marketing Specialist at GrowthCo (2018-2021)',
        'Marketing Coordinator at StartupHub (2016-2018)'
      ]
    },
    {
      id: '3',
      title: 'Education',
      content: [
        'Master of Business Administration (MBA), Marketing - University of Business (2016)',
        'Bachelor of Science in Marketing - State University (2014)'
      ]
    },
    {
      id: '4',
      title: 'Skills',
      content: [
        'Digital Marketing Strategy',
        'Social Media Management',
        'Content Creation',
        'SEO/SEM',
        'Data Analytics',
        'Project Management',
        'Team Leadership'
      ]
    },
    {
      id: '5',
      title: 'Certifications',
      content: [
        'Google Analytics Certified (2023)',
        'HubSpot Inbound Marketing Certification (2023)',
        'Facebook Blueprint Certification (2022)'
      ]
    }
  ]);

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
  };

  const handleSectionUpdate = (id: string, field: 'title' | 'content', value: string | string[]) => {
    setResumeSections(prevSections =>
      prevSections.map(section =>
        section.id === id ? { ...section, [field]: value } : section
      )
    );
  };

  const handleAddSection = () => {
    const newSection: ResumeSection = {
      id: Date.now().toString(),
      title: 'New Section',
      content: ['']
    };
    setResumeSections([...resumeSections, newSection]);
  };

  const handleDeleteSection = (id: string) => {
    setResumeSections(prevSections => prevSections.filter(section => section.id !== id));
  };

  const handleAddContent = (sectionId: string) => {
    setResumeSections(prevSections =>
      prevSections.map(section =>
        section.id === sectionId
          ? { ...section, content: [...section.content, ''] }
          : section
      )
    );
  };

  const handleDeleteContent = (sectionId: string, contentIndex: number) => {
    setResumeSections(prevSections =>
      prevSections.map(section =>
        section.id === sectionId
          ? { ...section, content: section.content.filter((_, index) => index !== contentIndex) }
          : section
      )
    );
  };

  return (
    <div className="bg-white min-h-screen text-navy-blue">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <Link to="/settings" className="mr-4 text-navy-blue">
              <ChevronLeft size={24} />
            </Link>
            <h1 className="text-3xl font-bold text-navy-blue">Professional Resume</h1>
          </div>
          <button
            onClick={handleEditToggle}
            className="bg-navy-blue text-white px-4 py-2 rounded-full flex items-center"
          >
            {isEditing ? <Save size={20} className="mr-2" /> : <Edit2 size={20} className="mr-2" />}
            {isEditing ? 'Save Changes' : 'Edit Resume'}
          </button>
        </div>

        <div className="space-y-6">
          {resumeSections.map((section) => (
            <div key={section.id} className="bg-gray-100 p-6 rounded-lg shadow">
              <div className="flex justify-between items-center mb-4">
                {isEditing ? (
                  <input
                    type="text"
                    value={section.title}
                    onChange={(e) => handleSectionUpdate(section.id, 'title', e.target.value)}
                    className="text-2xl font-bold bg-white p-2 rounded border"
                  />
                ) : (
                  <h2 className="text-2xl font-bold">{section.title}</h2>
                )}
                {isEditing && (
                  <button
                    onClick={() => handleDeleteSection(section.id)}
                    className="text-red-500 hover:text-red-600"
                  >
                    <Trash2 size={20} />
                  </button>
                )}
              </div>

              <div className="space-y-2">
                {section.content.map((item, index) => (
                  <div key={index} className="flex items-center">
                    {isEditing ? (
                      <>
                        <input
                          type="text"
                          value={item}
                          onChange={(e) => {
                            const newContent = [...section.content];
                            newContent[index] = e.target.value;
                            handleSectionUpdate(section.id, 'content', newContent);
                          }}
                          className="flex-grow p-2 rounded border"
                        />
                        <button
                          onClick={() => handleDeleteContent(section.id, index)}
                          className="ml-2 text-red-500 hover:text-red-600"
                        >
                          <Trash2 size={16} />
                        </button>
                      </>
                    ) : (
                      <li className="list-disc ml-4">{item}</li>
                    )}
                  </div>
                ))}
              </div>

              {isEditing && (
                <button
                  onClick={() => handleAddContent(section.id)}
                  className="mt-4 text-navy-blue hover:text-blue-600 flex items-center"
                >
                  <Plus size={16} className="mr-1" />
                  Add Item
                </button>
              )}
            </div>
          ))}

          {isEditing && (
            <button
              onClick={handleAddSection}
              className="bg-navy-blue text-white px-4 py-2 rounded-full flex items-center mx-auto"
            >
              <Plus size={20} className="mr-2" />
              Add Section
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Resume;