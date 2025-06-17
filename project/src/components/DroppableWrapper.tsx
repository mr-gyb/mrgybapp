import React from 'react';
import { Droppable, DroppableProps, DroppableProvided, DroppableStateSnapshot } from 'react-beautiful-dnd';

type DroppableWrapperProps = Omit<DroppableProps, 'children'> & {
  children: (provided: DroppableProvided, snapshot: DroppableStateSnapshot) => React.ReactNode;
};

const DroppableWrapper: React.FC<DroppableWrapperProps> = ({ children, ...props }) => {
  return (
    <Droppable {...props}>
      {(provided, snapshot) => children(provided, snapshot)}
    </Droppable>
  );
};

export default DroppableWrapper;