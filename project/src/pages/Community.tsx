import React from 'react';
import { useSearchParams } from 'react-router-dom';
import FeedView from '../components/community/FeedView';
import GridView from '../components/community/GridView';
import MapView from '../components/community/MapView';
import CommunityNav from '../components/community/CommunityNav';
import '../styles/community.css';

type View = 'feed' | 'grid' | 'map';

const CommunityPage: React.FC = () => {
  const [params, setParams] = useSearchParams();
  const mapEnabled = import.meta.env.VITE_COMMUNITY_MAP_ENABLED === 'true';

  const rawView = (params.get('view') as View | null) || 'feed';
  const view: View = rawView === 'map' && !mapEnabled ? 'feed' : rawView;

  const setView = (next: View) => {
    const nextView = next === 'map' && !mapEnabled ? 'feed' : next;
    const nextParams = new URLSearchParams(params);
    nextParams.set('view', nextView);
    setParams(nextParams, { replace: true });
  };

  return (
    <div className="community-container">
      <h1 className="community-title">Community</h1>

      <CommunityNav
        activeView={view}
        onViewChange={setView}
        showMap={mapEnabled}
      />

      {view === 'feed' && <FeedView />}
      {view === 'grid' && <GridView />}
      {view === 'map' && mapEnabled && <MapView />}
    </div>
  );
};

export default CommunityPage;


