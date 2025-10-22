// OpenAI API configuration
const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;
const OPENAI_BASE_URL = 'https://api.openai.com/v1';

export interface AudioTranscriptionResult {
  success: boolean;
  transcript?: string;
  error?: string;
  confidence?: number;
}

export interface AudioRecordingOptions {
  sampleRate?: number;
  channels?: number;
  bitRate?: number;
  maxDuration?: number; // in seconds
}

/**
 * Audio Transcription Service
 * Handles microphone access, audio recording, and transcription using OpenAI Whisper API
 */
export class AudioTranscriptionService {
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private stream: MediaStream | null = null;
  private isRecording = false;

  /**
   * Request microphone permission and test audio access
   */
  async requestMicrophonePermission(): Promise<boolean> {
    try {
      console.log('🎤 Requesting microphone permission...');
      
      // Request microphone access with specific constraints
      this.stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 44100,
          channelCount: 1
        }
      });

      console.log('✅ Microphone permission granted');
      console.log('🎵 Audio stream details:', {
        id: this.stream.id,
        active: this.stream.active,
        tracks: this.stream.getAudioTracks().length,
        trackSettings: this.stream.getAudioTracks()[0]?.getSettings()
      });

      // Test audio levels
      await this.testAudioLevels();
      
      return true;
    } catch (error: any) {
      console.error('❌ Microphone permission denied:', error);
      
      // Provide specific error messages
      if (error.name === 'NotAllowedError') {
        throw new Error('Microphone access denied. Please allow microphone access and try again.');
      } else if (error.name === 'NotFoundError') {
        throw new Error('No microphone found. Please connect a microphone and try again.');
      } else if (error.name === 'NotReadableError') {
        throw new Error('Microphone is being used by another application. Please close other applications and try again.');
      } else {
        throw new Error(`Microphone error: ${error.message}`);
      }
    }
  }

  /**
   * Test audio levels to ensure microphone is working
   */
  private async testAudioLevels(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.stream) {
        reject(new Error('No audio stream available'));
        return;
      }

      const audioContext = new AudioContext();
      const source = audioContext.createMediaStreamSource(this.stream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);

      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      let attempts = 0;
      const maxAttempts = 10;

      const checkLevels = () => {
        analyser.getByteFrequencyData(dataArray);
        const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
        
        console.log('🎵 Audio level:', average);
        
        if (average > 0 || attempts >= maxAttempts) {
          audioContext.close();
          resolve();
        } else {
          attempts++;
          setTimeout(checkLevels, 100);
        }
      };

      checkLevels();
    });
  }

  /**
   * Start audio recording
   */
  async startRecording(options: AudioRecordingOptions = {}): Promise<void> {
    try {
      if (this.isRecording) {
        throw new Error('Recording is already in progress');
      }

      if (!this.stream) {
        throw new Error('No audio stream available. Please request microphone permission first.');
      }

      console.log('🎙️ Starting audio recording...');
      
      // Clear previous chunks
      this.audioChunks = [];

      // Create MediaRecorder with optimal settings
      const mimeType = this.getSupportedMimeType();
      this.mediaRecorder = new MediaRecorder(this.stream, {
        mimeType,
        audioBitsPerSecond: 128000
      });

      // Set up event handlers
      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.audioChunks.push(event.data);
          console.log('📊 Audio chunk received:', event.data.size, 'bytes');
        }
      };

      this.mediaRecorder.onstart = () => {
        console.log('✅ Recording started');
        this.isRecording = true;
      };

      this.mediaRecorder.onstop = () => {
        console.log('⏹️ Recording stopped');
        this.isRecording = false;
      };

      this.mediaRecorder.onerror = (event) => {
        console.error('❌ Recording error:', event);
        this.isRecording = false;
      };

      // Start recording
      this.mediaRecorder.start(1000); // Collect data every second

      // Set up auto-stop if maxDuration is specified
      if (options.maxDuration) {
        setTimeout(() => {
          if (this.isRecording) {
            this.stopRecording();
          }
        }, options.maxDuration * 1000);
      }

    } catch (error: any) {
      console.error('❌ Failed to start recording:', error);
      throw new Error(`Failed to start recording: ${error.message}`);
    }
  }

  /**
   * Stop audio recording
   */
  async stopRecording(): Promise<Blob> {
    return new Promise((resolve, reject) => {
      if (!this.mediaRecorder || !this.isRecording) {
        reject(new Error('No active recording to stop'));
        return;
      }

      this.mediaRecorder.onstop = () => {
        console.log('⏹️ Recording stopped, processing audio...');
        this.isRecording = false;

        if (this.audioChunks.length === 0) {
          reject(new Error('No audio data recorded'));
          return;
        }

        // Combine all audio chunks
        const audioBlob = new Blob(this.audioChunks, { 
          type: this.mediaRecorder?.mimeType || 'audio/webm' 
        });
        
        console.log('🎵 Audio blob created:', {
          size: audioBlob.size,
          type: audioBlob.type
        });

        resolve(audioBlob);
      };

      this.mediaRecorder.stop();
    });
  }

  /**
   * Transcribe audio using OpenAI Whisper API with fallback to Web Speech API
   */
  async transcribeAudio(audioBlob: Blob): Promise<AudioTranscriptionResult> {
    try {
      console.log('🤖 Attempting Whisper API transcription...');
      console.log('📊 Audio details:', {
        size: audioBlob.size,
        type: audioBlob.type
      });

      // Check if OpenAI API key is available
      if (!OPENAI_API_KEY || OPENAI_API_KEY === 'your_openai_api_key_here') {
        console.log('⚠️ OpenAI API key not configured, using Web Speech API fallback');
        return await this.transcribeWithWebSpeechAPI();
      }

      // Create FormData for Whisper API
      const formData = new FormData();
      formData.append('file', audioBlob, 'audio.webm');
      formData.append('model', 'whisper-1');
      formData.append('language', 'en');
      formData.append('response_format', 'json');
      formData.append('temperature', '0.0');

      // Make API request
      const response = await fetch(`${OPENAI_BASE_URL}/audio/transcriptions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
        },
        body: formData
      });

      console.log('📡 Whisper API response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Whisper API error:', {
          status: response.status,
          statusText: response.statusText,
          error: errorText
        });
        
        // Check if it's a quota error
        if (response.status === 429) {
          console.log('⚠️ OpenAI quota exceeded, falling back to Web Speech API');
          return await this.transcribeWithWebSpeechAPI();
        }
        
        throw new Error(`Whisper API error: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const result = await response.json();
      console.log('✅ Whisper transcription successful:', result);

      return {
        success: true,
        transcript: result.text,
        confidence: result.confidence || 0.9
      };

    } catch (error: any) {
      console.error('❌ Whisper API failed, trying Web Speech API fallback:', error);
      
      // Fallback to Web Speech API
      try {
        return await this.transcribeWithWebSpeechAPI();
      } catch (fallbackError: any) {
        console.error('❌ Both transcription methods failed:', fallbackError);
        return {
          success: false,
          error: `Transcription failed: ${error.message}. Fallback also failed: ${fallbackError.message}`
        };
      }
    }
  }

  /**
   * Fallback transcription using Web Speech API
   */
  private async transcribeWithWebSpeechAPI(): Promise<AudioTranscriptionResult> {
    return new Promise((resolve) => {
      console.log('🎤 Using Web Speech API fallback...');
      
      // Check if Web Speech API is supported
      if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
        resolve({
          success: false,
          error: 'Speech recognition not supported in this browser'
        });
        return;
      }

      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        console.log('🎤 Web Speech API started');
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        console.log('✅ Web Speech API transcription:', transcript);
        resolve({
          success: true,
          transcript: transcript,
          confidence: 0.8
        });
      };

      recognition.onerror = (event: any) => {
        console.error('❌ Web Speech API error:', event.error);
        resolve({
          success: false,
          error: `Web Speech API error: ${event.error}`
        });
      };

      recognition.onend = () => {
        console.log('🎤 Web Speech API ended');
      };

      try {
        recognition.start();
      } catch (error: any) {
        console.error('❌ Failed to start Web Speech API:', error);
        resolve({
          success: false,
          error: `Failed to start Web Speech API: ${error.message}`
        });
      }
    });
  }

  /**
   * Complete recording and transcription workflow
   */
  async recordAndTranscribe(options: AudioRecordingOptions = {}): Promise<void> {
    try {
      console.log('🎯 Starting complete recording and transcription workflow...');

      // Request microphone permission
      await this.requestMicrophonePermission();

      // Start recording
      await this.startRecording(options);

      console.log('✅ Recording workflow started successfully');

    } catch (error: any) {
      console.error('❌ Recording and transcription workflow failed:', error);
      throw error;
    }
  }

  /**
   * Complete the transcription process (called after stopRecording)
   */
  async completeTranscription(): Promise<AudioTranscriptionResult> {
    try {
      if (!this.audioChunks.length) {
        throw new Error('No audio data to transcribe');
      }

      // Create audio blob from chunks
      const audioBlob = new Blob(this.audioChunks, { 
        type: this.mediaRecorder?.mimeType || 'audio/webm' 
      });

      // Transcribe using Whisper API
      const result = await this.transcribeAudio(audioBlob);

      // Resolve the promise if it exists
      if ((this as any).transcriptionResolve) {
        (this as any).transcriptionResolve(result);
      }

      return result;

    } catch (error: any) {
      console.error('❌ Failed to complete transcription:', error);
      
      const errorResult = {
        success: false,
        error: error.message
      };

      // Reject the promise if it exists
      if ((this as any).transcriptionReject) {
        (this as any).transcriptionReject(errorResult);
      }

      return errorResult;
    }
  }

  /**
   * Get supported MIME type for MediaRecorder
   */
  private getSupportedMimeType(): string {
    const types = [
      'audio/webm;codecs=opus',
      'audio/webm',
      'audio/mp4',
      'audio/ogg;codecs=opus',
      'audio/wav'
    ];

    for (const type of types) {
      if (MediaRecorder.isTypeSupported(type)) {
        console.log('🎵 Using MIME type:', type);
        return type;
      }
    }

    console.warn('⚠️ No supported MIME type found, using default');
    return 'audio/webm';
  }

  /**
   * Clean up resources
   */
  cleanup(): void {
    console.log('🧹 Cleaning up audio transcription service...');
    
    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      this.mediaRecorder.stop();
    }
    
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }
    
    this.audioChunks = [];
    this.isRecording = false;
    this.mediaRecorder = null;
  }

  /**
   * Check if recording is in progress
   */
  get isCurrentlyRecording(): boolean {
    return this.isRecording;
  }

  /**
   * Get recording status
   */
  getRecordingStatus(): { isRecording: boolean; hasStream: boolean; chunkCount: number } {
    return {
      isRecording: this.isRecording,
      hasStream: !!this.stream,
      chunkCount: this.audioChunks.length
    };
  }
}

// Export singleton instance
export const audioTranscriptionService = new AudioTranscriptionService();
