import styled from 'styled-components';

// Main container styles
export const RoadMapContainer = styled.div`
  min-height: 100vh;
  background-color: white;
  color: #11335d;
`;

export const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 1.5rem 1rem;
`;

// Header styles
export const HeaderContainer = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 1.5rem;
`;

export const BackLink = styled(Link)`
  margin-right: 1rem;
  color: #11335d;
  
  &:hover {
    color: rgba(17, 51, 93, 0.8);
  }
`;

export const Title = styled.h1`
  font-size: 1.875rem;
  font-weight: bold;
  color: #11335d;
`;

// Progress section styles
export const ProgressSection = styled.div`
  margin-bottom: 2rem;
`;

export const ProgressHeader = styled.div`
  text-align: center;
  margin-bottom: 1rem;
`;

export const ProgressTitle = styled.h2`
  font-size: 1.25rem;
  font-weight: 600;
  color: #11335d;
  display: inline-block;
  margin-right: 1rem;
`;

export const ProgressBadge = styled.span`
  font-size: 0.875rem;
  color: #11335d;
  background-color: #e3c472;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-weight: 600;
`;

// Timeline styles
export const TimelineContainer = styled.div`
  margin-bottom: 2rem;
`;

export const TimelineWrapper = styled.div`
  position: relative;
`;

export const TimelineLine = styled.div`
  position: absolute;
  top: 1.5rem;
  left: 0;
  width: 100%;
  height: 0.5rem;
  background-color: #d1d5db;
`;

export const TimelineProgress = styled.div<{ width: string }>`
  position: absolute;
  top: 0;
  left: 0;
  height: 0.5rem;
  background-color: #e3c472;
  transition: all 0.3s ease;
  width: ${props => props.width};
`;

export const PhaseIconsContainer = styled.div`
  position: relative;
  display: flex;
  justify-content: space-between;
`;

export const PhaseIconWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

export const PhaseIconContainer = styled.div<{
  isCurrent: boolean;
  isWaiting: boolean;
  progress: number;
}>`
  width: ${props => props.isCurrent ? '5rem' : '3rem'};
  height: ${props => props.isCurrent ? '5rem' : '3rem'};
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1rem;
  position: relative;
  z-index: 10;
  transition: all 0.3s ease;
  
  ${props => {
    if (props.isCurrent) {
      return `
        background-color: #dbeafe;
        border: 4px solid #bfdbfe;
        box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
      `;
    } else if (props.isWaiting) {
      return `
        background-color: #dbeafe;
        border: 4px solid #93c5fd;
        box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
      `;
    } else if (props.progress === 100) {
      return `background-color: #11335d;`;
    } else if (props.progress > 0) {
      return `
        background-color: rgba(227, 196, 114, 0.2);
        border: 2px solid #e3c472;
      `;
    } else {
      return `
        background-color: #d1d5db;
        border: 2px solid #d1d5db;
      `;
    }
  }}
`;

export const PhaseTitle = styled.span<{ isCurrent: boolean }>`
  font-size: ${props => props.isCurrent ? '1.125rem' : '0.875rem'};
  font-weight: ${props => props.isCurrent ? 'bold' : '500'};
  color: #11335d;
  text-align: center;
`;

export const PhaseStatus = styled.span`
  font-size: 0.75rem;
  color: #6b7280;
  margin-top: 0.25rem;
`;

// Custom timer icon styles
export const TimerIconContainer = styled.div`
  position: relative;
  width: 1.5rem;
  height: 1.5rem;
`;

export const TimerBody = styled.div`
  width: 1rem;
  height: 1rem;
  border-radius: 50%;
  margin: 0 auto;
  background-color: #11335d;
`;

export const TimerStem = styled.div`
  position: absolute;
  top: -0.125rem;
  left: 0.5rem;
  width: 0.25rem;
  height: 0.125rem;
  transform: rotate(12deg);
  background-color: #11335d;
`;

export const TimerHand = styled.div`
  position: absolute;
  top: 0.375rem;
  left: 0.375rem;
  width: 0.125rem;
  height: 0.375rem;
  transform: rotate(45deg);
  transform-origin: bottom;
  background-color: #11335d;
`;

// Phase cards styles
export const PhaseCardsGrid = styled.div`
  display: grid;
  gap: 2rem;
  
  @media (min-width: 768px) {
    grid-template-columns: repeat(3, 1fr);
  }
`;

export const PhaseCard = styled.div`
  background-color: white;
  border-radius: 0.75rem;
  padding: 1.5rem;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  border: 1px solid #e5e7eb;
  
  &:hover {
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  }
  
  transition: box-shadow 0.3s ease;
`;

export const PhaseCardHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.5rem;
`;

export const PhaseCardTitleContainer = styled.div`
  display: flex;
  align-items: center;
`;

export const PhaseCardTitle = styled.h2`
  font-size: 1.25rem;
  font-weight: bold;
  color: #11335d;
  margin-left: 0.75rem;
`;

export const PhaseProgressBadge = styled.div`
  font-size: 0.875rem;
  color: #e3c472;
  font-weight: 600;
  background-color: rgba(227, 196, 114, 0.1);
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  border: 1px solid rgba(227, 196, 114, 0.2);
`;

export const PhaseDescription = styled.p`
  color: #6b7280;
  margin-bottom: 1.5rem;
  font-size: 1rem;
  line-height: 1.625;
`;

// Milestone styles
export const MilestonesContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

export const MilestoneItem = styled.div<{ isPhaseLocked: boolean }>`
  background-color: white;
  border-radius: 0.5rem;
  padding: 1rem;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
  transition: all 0.2s ease;
  opacity: ${props => props.isPhaseLocked ? 0.75 : 1};
  
  &:hover {
    box-shadow: ${props => props.isPhaseLocked ? '0 1px 3px 0 rgba(0, 0, 0, 0.1)' : '0 4px 6px -1px rgba(0, 0, 0, 0.1)'};
  }
`;

export const MilestoneHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

export const MilestoneTitleContainer = styled.div`
  display: flex;
  align-items: center;
`;

export const MilestoneTitle = styled.h3<{ isPhaseLocked: boolean }>`
  font-weight: 600;
  color: ${props => props.isPhaseLocked ? '#6b7280' : '#11335d'};
  margin-left: 0.5rem;
`;

export const MilestoneCheckbox = styled.div<{
  isPhaseLocked: boolean;
  isCompleted: boolean;
}>`
  width: 1.5rem;
  height: 1.5rem;
  border-radius: 50%;
  border: 2px solid;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  
  ${props => {
    if (props.isPhaseLocked) {
      return `
        background-color: #e5e7eb;
        border-color: #d1d5db;
        cursor: not-allowed;
      `;
    } else if (props.isCompleted) {
      return `
        background-color: #e3c472;
        border-color: #e3c472;
        cursor: pointer;
      `;
    } else {
      return `
        border-color: #d1d5db;
        cursor: pointer;
        
        &:hover {
          border-color: #e3c472;
          background-color: rgba(227, 196, 114, 0.1);
        }
      `;
    }
  }}
`;

export const MilestoneDescription = styled.p<{ isPhaseLocked: boolean }>`
  margin-top: 0.5rem;
  color: ${props => props.isPhaseLocked ? '#9ca3af' : '#6b7280'};
`;

// Loading styles
export const LoadingContainer = styled.div`
  min-height: 100vh;
  background-color: white;
  color: #11335d;
  display: flex;
  align-items: center;
  justify-content: center;
`;

export const LoadingContent = styled.div`
  text-align: center;
`;

export const LoadingSpinner = styled.div`
  animation: spin 1s linear infinite;
  border-radius: 50%;
  height: 3rem;
  width: 3rem;
  border-bottom: 2px solid #11335d;
  margin: 0 auto 1rem;
`;

export const LoadingText = styled.p`
  color: #11335d;
`;

// Empty state styles
export const EmptyState = styled.div`
  grid-column: 1 / -1;
  text-align: center;
  padding: 2rem 0;
`;

export const EmptyStateText = styled.p`
  color: #6b7280;
`;

// Import Link from react-router-dom for the BackLink component
import { Link } from 'react-router-dom';
