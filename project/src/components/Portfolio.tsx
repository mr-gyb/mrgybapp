import React, { useState } from 'react';
import { ChevronLeft, Plus, X, Edit2, Save, Move } from 'lucide-react';
import { Link } from 'react-router-dom';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

interface PortfolioItem {
  id: string;
  title: string;
  description: string;
  image: string;
  who: string;
  what: string;
  where: string;
  when: string;
  why: string;
}

const Portfolio: React.FC = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [portfolioItems, setPortfolioItems] = useState<PortfolioItem[]>([
    {
      id: '1',
      title: 'Digital Marketing Campaign',
      description: 'Led a comprehensive digital marketing campaign for a major retail client',
      image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
      who: 'Marketing Team Lead',
      what: 'Developed and executed multi-channel marketing strategy',
      where: 'National Campaign',
      when: 'Q4 2023',
      why: 'Increase brand awareness and drive online sales'
    },
    {
      id: '2',
      title: 'E-commerce Platform Launch',
      description: 'Designed and launched a new e-commerce platform',
      image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
      who: 'Project Manager',
      what: 'Full e-commerce solution implementation',
      where: 'Global Market',
      when: 'Q1 2024',
      why: 'Modernize online shopping experience'
    }
  ]);

  const handleDragEnd = (result: any) => {
    if (!result.destination || !isEditing) return;

    const items = Array.from(portfolioItems);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setPortfolioItems(items);
  };

  const handleAddItem = () => {
    const newItem: PortfolioItem = {
      id: Date.now().toString(),
      title: 'New Project',
      description: 'Project description',
      image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
      who: '',
      what: '',
      where: '',
      when: '',
      why: ''
    };
    setPortfolioItems([...portfolioItems, newItem]);
  };

  const handleDeleteItem = (id: string) => {
    setPortfolioItems(portfolioItems.filter(item => item.id !== id));
  };

  const handleUpdateItem = (id: string, field: keyof PortfolioItem, value: string) => {
    setPortfolioItems(portfolioItems.map(item =>
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  return (
    <div className="bg-white min-h-screen text-navy-blue">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <Link to="/settings" className="mr-4 text-navy-blue">
              <ChevronLeft size={24} />
            </Link>
            <h1 className="text-3xl font-bold text-navy-blue">Portfolio</h1>
          </div>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="bg-navy-blue text-white px-4 py-2 rounded-full flex items-center"
          >
            {isEditing ? <Save size={20} className="mr-2" /> : <Edit2 size={20} className="mr-2" />}
            {isEditing ? 'Save Changes' : 'Edit Portfolio'}
          </button>
        </div>

        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="portfolio">
            {(provided) => (
              <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-6">
                {portfolioItems.map((item, index) => (
                  <Draggable key={item.id} draggableId={item.id} index={index} isDragDisabled={!isEditing}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        className={`bg-gray-100 p-6 rounded-lg ${snapshot.isDragging ? 'shadow-lg' : 'shadow'}`}
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-grow">
                            {isEditing ? (
                              <input
                                type="text"
                                value={item.title}
                                onChange={(e) => handleUpdateItem(item.id, 'title', e.target.value)}
                                className="text-xl font-bold mb-2 w-full bg-white p-2 rounded"
                              />
                            ) : (
                              <h2 className="text-xl font-bold mb-2">{item.title}</h2>
                            )}
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div>
                                <img
                                  src={item.image}
                                  alt={item.title}
                                  className="w-full h-48 object-cover rounded-lg mb-4"
                                />
                                {isEditing && (
                                  <input
                                    type="text"
                                    value={item.image}
                                    onChange={(e) => handleUpdateItem(item.id, 'image', e.target.value)}
                                    placeholder="Image URL"
                                    className="w-full p-2 rounded border"
                                  />
                                )}
                              </div>
                              
                              <div className="space-y-4">
                                {isEditing ? (
                                  <textarea
                                    value={item.description}
                                    onChange={(e) => handleUpdateItem(item.id, 'description', e.target.value)}
                                    className="w-full p-2 rounded border"
                                    rows={3}
                                  />
                                ) : (
                                  <p className="text-gray-600">{item.description}</p>
                                )}

                                <div className="grid grid-cols-2 gap-4">
                                  {['who', 'what', 'where', 'when', 'why'].map((field) => (
                                    <div key={field} className="col-span-2">
                                      <label className="block text-sm font-medium text-gray-700 capitalize mb-1">
                                        {field}
                                      </label>
                                      {isEditing ? (
                                        <input
                                          type="text"
                                          value={item[field as keyof PortfolioItem]}
                                          onChange={(e) => handleUpdateItem(item.id, field as keyof PortfolioItem, e.target.value)}
                                          className="w-full p-2 rounded border"
                                        />
                                      ) : (
                                        <p className="text-gray-600">{item[field as keyof PortfolioItem]}</p>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          {isEditing && (
                            <div className="flex items-center ml-4">
                              <div {...provided.dragHandleProps}>
                                <Move size={20} className="text-gray-500 cursor-move" />
                              </div>
                              <button
                                onClick={() => handleDeleteItem(item.id)}
                                className="ml-2 text-red-500 hover:text-red-600"
                              >
                                <X size={20} />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>

        {isEditing && (
          <button
            onClick={handleAddItem}
            className="mt-6 bg-navy-blue text-white px-4 py-2 rounded-full flex items-center mx-auto"
          >
            <Plus size={20} className="mr-2" />
            Add Portfolio Item
          </button>
        )}
      </div>
    </div>
  );
};

export default Portfolio;