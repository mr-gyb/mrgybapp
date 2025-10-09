const fs = require('fs');

// Read the file
let content = fs.readFileSync('src/components/GYBStudio.tsx', 'utf8');

// Replace Total Views with conditional
content = content.replace(
  '                <div className="text-sm font-medium">Total Views</div>',
  '                <div className="text-sm font-medium">\n                  {selectedPlatform === \'instagram\' ? \'Followers\' : \'Total Views\'}\n                </div>'
);

// Replace Total Views value with Instagram value
content = content.replace(
  /                  {selectedPlatform === 'youtube' && !isLoadingYouTubeData \n                    \? '382'\n                    : selectedPlatform !== 'all' && !isLoadingYouTubeData \n                    \? platformMetrics\.totalViews\.toLocaleString\(\)\n                    : '100k'\n                  }/g,
  `                  {selectedPlatform === 'instagram' 
                    ? '12.5K'
                    : selectedPlatform === 'youtube' && !isLoadingYouTubeData 
                    ? '382'
                    : selectedPlatform !== 'all' && !isLoadingYouTubeData 
                    ? platformMetrics.totalViews.toLocaleString()
                    : '100k'
                  }`
);

// Replace Total Likes with CTR
content = content.replace(
  '                <div className="text-sm font-medium">Total Likes</div>',
  '                <div className="text-sm font-medium">\n                  {selectedPlatform === \'instagram\' ? \'CTR\' : \'Total Likes\'}\n                </div>'
);

// Replace Total Likes value with CTR value
content = content.replace(
  /                  {selectedPlatform === 'youtube' && !isLoadingYouTubeData \n                    \? '9'\n                    : selectedPlatform !== 'all' && !isLoadingYouTubeData \n                    \? platformMetrics\.totalLikes\.toLocaleString\(\)\n                    : '100k'\n                  }/g,
  `                  {selectedPlatform === 'instagram' 
                    ? '3.2%'
                    : selectedPlatform === 'youtube' && !isLoadingYouTubeData 
                    ? '9'
                    : selectedPlatform !== 'all' && !isLoadingYouTubeData 
                    ? platformMetrics.totalLikes.toLocaleString()
                    : '100k'
                  }`
);

// Replace Total Comments with CPC
content = content.replace(
  '                <div className="text-sm font-medium">Total Comments</div>',
  '                <div className="text-sm font-medium">\n                  {selectedPlatform === \'instagram\' ? \'CPC\' : \'Total Comments\'}\n                </div>'
);

// Replace Total Comments value with CPC value
content = content.replace(
  /                  {selectedPlatform === 'youtube' && !isLoadingYouTubeData \n                    \? '1'\n                    : selectedPlatform !== 'all' && !isLoadingYouTubeData \n                    \? platformMetrics\.totalComments\.toLocaleString\(\)\n                    : '100k'\n                  }/g,
  `                  {selectedPlatform === 'instagram' 
                    ? '$0.45'
                    : selectedPlatform === 'youtube' && !isLoadingYouTubeData 
                    ? '1'
                    : selectedPlatform !== 'all' && !isLoadingYouTubeData 
                    ? platformMetrics.totalComments.toLocaleString()
                    : '100k'
                  }`
);

// Replace Channel Subscribers with Engagement Rate
content = content.replace(
  '                <div className="text-sm font-medium">Channel Subscribers</div>',
  '                <div className="text-sm font-medium">\n                  {selectedPlatform === \'instagram\' ? \'Engagement Rate\' : \'Channel Subscribers\'}\n                </div>'
);

// Replace Channel Subscribers value with Engagement Rate value
content = content.replace(
  /                  {selectedPlatform === 'youtube' && !isLoadingYouTubeData \n                    \? '140,000'\n                    : selectedPlatform !== 'all' && !isLoadingYouTubeData \n                    \? platformMetrics\.channelSubscribers\.toLocaleString\(\)\n                    : '100k'\n                  }/g,
  `                  {selectedPlatform === 'instagram' 
                    ? '4.8%'
                    : selectedPlatform === 'youtube' && !isLoadingYouTubeData 
                    ? '140,000'
                    : selectedPlatform !== 'all' && !isLoadingYouTubeData 
                    ? platformMetrics.channelSubscribers.toLocaleString()
                    : '100k'
                  }`
);

// Write the updated content back
fs.writeFileSync('src/components/GYBStudio.tsx', content);

console.log('Metrics updated successfully!');
