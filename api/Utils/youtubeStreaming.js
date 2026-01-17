const { google } = require('googleapis');

const initializeYouTubeClient = () => {
  // Check if required environment variables are set
  if (!process.env.YOUTUBE_CLIENT_ID || !process.env.YOUTUBE_CLIENT_SECRET) {
    throw new Error('YouTube API credentials not configured. Please set YOUTUBE_CLIENT_ID and YOUTUBE_CLIENT_SECRET in environment variables.');
  }

  const oauth2Client = new google.auth.OAuth2(
    process.env.YOUTUBE_CLIENT_ID,
    process.env.YOUTUBE_CLIENT_SECRET,
    process.env.YOUTUBE_REDIRECT_URL || 'http://localhost:3000/oauth2callback'
  );

  // Set credentials if available
  if (process.env.YOUTUBE_REFRESH_TOKEN) {
    oauth2Client.setCredentials({
      refresh_token: process.env.YOUTUBE_REFRESH_TOKEN
    });
  }

  const youtube = google.youtube({
    version: 'v3',
    auth: oauth2Client
  });

  return { youtube, oauth2Client };
};

/**
 * Create a YouTube live broadcast
 * @param {Object} sessionData - Session information
 * @param {string} sessionData.title - Title of the broadcast
 * @param {string} sessionData.description - Description of the broadcast
 * @param {Date} sessionData.startTime - Scheduled start time
 * @param {number} sessionData.durationHours - Duration in hours
 * @returns {Promise<Object>} Broadcast details
 */
const createLiveBroadcast = async (sessionData) => {
  try {
    console.log('Initializing YouTube client...');
    const { youtube } = initializeYouTubeClient();
    console.log('YouTube client initialized successfully');
    
    // Format start and end times
    const startTime = sessionData.startTime.toISOString();

    const endTime = new Date(sessionData.startTime.getTime() + sessionData.durationHours * 60 * 60 * 1000).toISOString();
    
    console.log('Formatted times - Start:', startTime, 'End:', endTime);
    
    // Create live broadcast
    console.log('Creating live broadcast...');
    const broadcastResponse = await youtube.liveBroadcasts.insert({
      part: ['snippet,status,contentDetails'],
      requestBody: {
        snippet: {
          title: sessionData.title || 'Tutoring Session',
          description: sessionData.description || 'Live tutoring session',
          scheduledStartTime: startTime,
          scheduledEndTime: endTime
        },
        status: {
          privacyStatus: 'unlisted',
          selfDeclaredMadeForKids: false
        },
        contentDetails: {
          enableAutoStart: true,
          enableAutoStop: true
        }
      }
    });

    console.log('Broadcast created successfully. Response:', broadcastResponse.data);
    const broadcastId = broadcastResponse.data.id;
    
    // Create live stream with correct format
    console.log('Creating live stream...');
    const streamResponse = await youtube.liveStreams.insert({
      part: ['snippet,cdn'],
      requestBody: {
        snippet: {
          title: `${sessionData.title} - Stream`,
          description: sessionData.description || 'Live tutoring session stream'
        },
        cdn: {
            ingestionType: "rtmp",
            resolution: "720p",
            frameRate: "30fps"
        }
      }
    });

    console.log('Stream created successfully. Response:', streamResponse.data);
    const streamId = streamResponse.data.id;
    const streamKey = streamResponse.data.cdn.ingestionInfo.streamName;
    const ingestionAddress = streamResponse.data.cdn.ingestionInfo.ingestionAddress;
    
    // Bind the stream to the broadcast
    console.log('Binding stream to broadcast...');
    await youtube.liveBroadcasts.bind({
      id: broadcastId,
      part: ['id,contentDetails'],
      requestBody: {
        contentDetails: {
          boundStreamId: streamId
        }
      }
    });

    console.log('Stream bound to broadcast successfully');
    
    // Return proper watch URL for viewers
    const broadcastUrl = `https://www.youtube.com/watch?v=${broadcastId}`;
    
    console.log('Returning broadcast data:', {
      broadcastId,
      streamId,
      streamKey,
      broadcastUrl,
      ingestionAddress
    });
    
    // Validate that we have all required data
    if (!broadcastId || !streamId || !streamKey || !broadcastUrl || !ingestionAddress) {
      throw new Error('Missing required data in YouTube API response');
    }
    
    return {
      broadcastId,
      streamId,
      streamKey,
      broadcastUrl,
      ingestionAddress
    };
  } catch (error) {
    console.error('Error creating YouTube live broadcast:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      response: error.response ? error.response.data : null
    });
    
    // Check for specific error messages
    if (error.response && error.response.data && error.response.data.error) {
      const youtubeError = error.response.data.error;
      
      // Handle live streaming not enabled error
      if (youtubeError.message && youtubeError.message.includes('live streaming')) {
        console.error('❌ YouTube Live Streaming is not enabled for this account.');
        console.error('Please enable live streaming on your YouTube channel:');
        console.error('1. Sign in to YouTube Studio with your channel account');
        console.error('2. Go to Content > Live streaming');
        console.error('3. Follow prompts to enable live streaming');
        console.error('4. Verify your phone number if prompted');
        throw new Error('YouTube Live Streaming is not enabled for your channel. Please enable live streaming in YouTube Studio.');
      }
      
      // Handle insufficient permissions error
      if (youtubeError.code === 403) {
        console.error('❌ Insufficient permissions for YouTube API.');
        console.error('Please check that:');
        console.error('- Your OAuth2 credentials have the correct scopes');
        console.error('- Your refresh token is valid');
        console.error('- The YouTube Data API v3 is enabled in Google Cloud Console');
        throw new Error('Insufficient permissions for YouTube API. Please check your credentials and permissions.');
      }
    }
    
    // Re-throw the error - no fallback in production
    throw error;
  }
};

/**
 * Start a YouTube live broadcast
 * @param {string} broadcastId - YouTube broadcast ID
 * @returns {Promise<void>}
 */
const startLiveBroadcast = async (broadcastId) => {
  try {
    // Only proceed if we have valid credentials
    if (!process.env.YOUTUBE_REFRESH_TOKEN) {
      console.warn('YouTube refresh token not configured. Skipping broadcast start.');
      return;
    }
    
    const { youtube } = initializeYouTubeClient();
    
    await youtube.liveBroadcasts.transition({
      id: broadcastId,
      part: ['id,status'],
      requestBody: {
        status: {
          lifeCycleStatus: 'live'
        }
      }
    });
  } catch (error) {
    console.error('Error starting YouTube live broadcast:', error);
    throw new Error(`Failed to start YouTube live broadcast: ${error.message}`);
  }
};

/**
 * End a YouTube live broadcast
 * @param {string} broadcastId - YouTube broadcast ID
 * @returns {Promise<void>}
 */
const endLiveBroadcast = async (broadcastId) => {
  try {
    // Only proceed if we have valid credentials
    if (!process.env.YOUTUBE_REFRESH_TOKEN) {
      console.warn('YouTube refresh token not configured. Skipping broadcast end.');
      return;
    }
    
    const { youtube } = initializeYouTubeClient();
    
    await youtube.liveBroadcasts.transition({
      id: broadcastId,
      part: ['id,status'],
      requestBody: {
        status: {
          lifeCycleStatus: 'complete'
        }
      }
    });
  } catch (error) {
    console.error('Error ending YouTube live broadcast:', error);
    throw new Error(`Failed to end YouTube live broadcast: ${error.message}`);
  }
};

/**
 * Update YouTube live broadcast time
 * @param {string} broadcastId - YouTube broadcast ID
 * @param {Date} startTime - New scheduled start time
 * @param {number} durationHours - Duration in hours
 * @returns {Promise<void>}
 */
const updateLiveBroadcastTime = async (broadcastId, startTime, durationHours) => {
  console.log('Updating YouTube live broadcast time...');
  try {
    // Only proceed if we have valid credentials
    if (!process.env.YOUTUBE_REFRESH_TOKEN) {
      console.warn('YouTube refresh token not configured. Skipping broadcast update.');
      return;
    }
    
    const { youtube } = initializeYouTubeClient();
    
    // First, get the current broadcast to preserve title and description
    const currentBroadcast = await youtube.liveBroadcasts.list({
      part: ['snippet'],
      id: broadcastId
    });
    
    if (!currentBroadcast.data.items || currentBroadcast.data.items.length === 0) {
      throw new Error(`Broadcast ${broadcastId} not found`);
    }
    
    const existingSnippet = currentBroadcast.data.items[0].snippet;
    
    // Format start and end times
    const startTimeISO = startTime.toISOString();
    const endTimeISO = new Date(startTime.getTime() + durationHours * 60 * 60 * 1000).toISOString();
    
    // Update the broadcast with all required snippet fields
    await youtube.liveBroadcasts.update({
      part: ['snippet'],
      requestBody: {
        id: broadcastId,
        snippet: {
          title: existingSnippet.title,
          description: existingSnippet.description,
          scheduledStartTime: startTimeISO,
          scheduledEndTime: endTimeISO
        }
      }
    });
    
    console.log(`✅ YouTube broadcast ${broadcastId} time updated successfully`);
  } catch (error) {
    console.error('Error updating YouTube live broadcast time:', error);
    throw new Error(`Failed to update YouTube live broadcast time: ${error.message}`);
  }
};

/**
 * Delete a YouTube live broadcast
 * @param {string} broadcastId - YouTube broadcast ID
 * @returns {Promise<void>}
 */
const deleteLiveBroadcast = async (broadcastId) => {
  try {
    // Only proceed if we have valid credentials
    if (!process.env.YOUTUBE_REFRESH_TOKEN) {
      console.warn('YouTube refresh token not configured. Skipping broadcast deletion.');
      return;
    }
    
    const { youtube } = initializeYouTubeClient();
    
    await youtube.liveBroadcasts.delete({
      id: broadcastId
    });
  } catch (error) {
    console.error('Error deleting YouTube live broadcast:', error);
    throw new Error(`Failed to delete YouTube live broadcast: ${error.message}`);
  }
};

/**
 * Upload a recorded video to YouTube
 * @param {Object} videoData - Video information
 * @param {string} videoData.filePath - Path to the video file
 * @param {string} videoData.title - Title of the video
 * @param {string} videoData.description - Description of the video
 * @returns {Promise<Object>} Upload response
 */
const uploadVideoToYouTube = async (videoData) => {
  try {
    // Only proceed if we have valid credentials
    if (!process.env.YOUTUBE_REFRESH_TOKEN) {
      console.warn('YouTube refresh token not configured. Skipping video upload.');
      throw new Error('YouTube refresh token not configured');
    }
    
    const { youtube, oauth2Client } = initializeYouTubeClient();
    
    // For video upload, we need to use the resumable upload method
    // This is a simplified version - in practice, you'd need to handle the upload process
    
    const response = await youtube.videos.insert({
      part: ['snippet,status'],
      requestBody: {
        snippet: {
          title: videoData.title || 'Recorded Tutoring Session',
          description: videoData.description || 'Recorded tutoring session',
          tags: ['tutoring', 'education'],
          categoryId: '27' // Education category
        },
        status: {
          privacyStatus: 'unlisted',
          embeddable: true,
          license: 'youtube'
        }
      },
      media: {
        body: videoData.filePath // This would need to be the actual file content
      }
    });
    
    return {
      videoId: response.data.id,
      videoUrl: `https://www.youtube.com/watch?v=${response.data.id}`
    };
  } catch (error) {
    console.error('Error uploading video to YouTube:', error);
    throw error;
  }
};

module.exports = {
  createLiveBroadcast,
  startLiveBroadcast,
  endLiveBroadcast,
  updateLiveBroadcastTime,
  deleteLiveBroadcast,
  uploadVideoToYouTube
};