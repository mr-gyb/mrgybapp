package com.example.demo.controller;

import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.http.MediaType;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpEntity;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.HttpServerErrorException;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;
import java.util.logging.Logger;

/**
 * Controller for handling audio transcription requests
 * Integrates with OpenAI Whisper API for speech-to-text conversion
 */
@RestController
@CrossOrigin(origins = "http://localhost:5173")
@RequestMapping("/api")
public class TranscriptionController {

    private static final Logger logger = Logger.getLogger(TranscriptionController.class.getName());
    
    @Value("${openai.api.key:}")
    private String openaiApiKey;
    
    @Value("${openai.api.url:https://api.openai.com/v1}")
    private String openaiApiUrl;
    
    private final RestTemplate restTemplate = new RestTemplate();

    /**
     * Transcribe audio file using OpenAI Whisper API
     * 
     * @param audioFile The audio file to transcribe
     * @return ResponseEntity with transcription result
     */
    @PostMapping(value = "/transcribe", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> transcribeAudio(@RequestParam("audio") MultipartFile audioFile) {
        logger.info("🎤 Received transcription request");
        
        try {
            // Validate input
            if (audioFile == null || audioFile.isEmpty()) {
                logger.warning("❌ No audio file provided");
                return ResponseEntity.badRequest()
                    .body(createErrorResponse("No audio file provided"));
            }
            
            // Check file size (max 25MB for Whisper API)
            if (audioFile.getSize() > 25 * 1024 * 1024) {
                logger.warning("❌ Audio file too large: " + audioFile.getSize() + " bytes");
                return ResponseEntity.status(HttpStatus.PAYLOAD_TOO_LARGE)
                    .body(createErrorResponse("Audio file too large. Maximum size is 25MB."));
            }
            
            // Check API key
            if (openaiApiKey == null || openaiApiKey.isEmpty()) {
                logger.error("❌ OpenAI API key not configured");
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(createErrorResponse("OpenAI API key not configured. Please check server configuration."));
            }
            
            logger.info("📊 Processing audio file: " + audioFile.getOriginalFilename() + 
                       " (" + audioFile.getSize() + " bytes)");
            
            // Prepare request to OpenAI Whisper API
            String transcriptionResult = callOpenAIWhisperAPI(audioFile);
            
            logger.info("✅ Transcription completed successfully");
            
            // Return successful response
            Map<String, String> response = new HashMap<>();
            response.put("text", transcriptionResult);
            response.put("success", "true");
            
            return ResponseEntity.ok(response);
            
        } catch (HttpClientErrorException e) {
            logger.error("❌ OpenAI API client error: " + e.getStatusCode() + " - " + e.getMessage());
            
            String errorMessage = "Transcription failed";
            if (e.getStatusCode().value() == 401) {
                errorMessage = "OpenAI API key invalid or expired";
            } else if (e.getStatusCode().value() == 429) {
                errorMessage = "OpenAI API quota exceeded. Please try again later.";
            } else if (e.getStatusCode().value() == 413) {
                errorMessage = "Audio file too large for processing";
            }
            
            return ResponseEntity.status(e.getStatusCode())
                .body(createErrorResponse(errorMessage));
                
        } catch (HttpServerErrorException e) {
            logger.error("❌ OpenAI API server error: " + e.getStatusCode() + " - " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(createErrorResponse("OpenAI service temporarily unavailable. Please try again later."));
                
        } catch (IOException e) {
            logger.error("❌ File processing error: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(createErrorResponse("Failed to process audio file: " + e.getMessage()));
                
        } catch (Exception e) {
            logger.error("❌ Unexpected error during transcription: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(createErrorResponse("An unexpected error occurred: " + e.getMessage()));
        }
    }
    
    /**
     * Call OpenAI Whisper API to transcribe the audio file
     */
    private String callOpenAIWhisperAPI(MultipartFile audioFile) throws IOException {
        logger.info("🤖 Calling OpenAI Whisper API...");
        
        // Prepare multipart request
        MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
        
        // Add audio file
        Resource audioResource = new ByteArrayResource(audioFile.getBytes()) {
            @Override
            public String getFilename() {
                return audioFile.getOriginalFilename();
            }
        };
        body.add("file", audioResource);
        
        // Add model and parameters
        body.add("model", "whisper-1");
        body.add("language", "en");
        body.add("response_format", "json");
        body.add("temperature", "0.0");
        
        // Prepare headers
        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", "Bearer " + openaiApiKey);
        headers.setContentType(MediaType.MULTIPART_FORM_DATA);
        
        // Create request entity
        HttpEntity<MultiValueMap<String, Object>> requestEntity = new HttpEntity<>(body, headers);
        
        // Make API call
        String apiUrl = openaiApiUrl + "/audio/transcriptions";
        logger.info("📡 Calling OpenAI API: " + apiUrl);
        
        try {
            Map<String, Object> response = restTemplate.postForObject(apiUrl, requestEntity, Map.class);
            
            if (response != null && response.containsKey("text")) {
                String transcription = (String) response.get("text");
                logger.info("✅ OpenAI API response received: " + transcription.length() + " characters");
                return transcription;
            } else {
                logger.error("❌ Invalid response from OpenAI API: " + response);
                throw new RuntimeException("Invalid response from OpenAI API");
            }
            
        } catch (Exception e) {
            logger.error("❌ OpenAI API call failed: " + e.getMessage());
            throw e;
        }
    }
    
    /**
     * Create standardized error response
     */
    private Map<String, String> createErrorResponse(String message) {
        Map<String, String> errorResponse = new HashMap<>();
        errorResponse.put("error", message);
        errorResponse.put("success", "false");
        return errorResponse;
    }
    
    /**
     * Health check endpoint for transcription service
     */
    @GetMapping("/transcribe/health")
    public ResponseEntity<?> healthCheck() {
        Map<String, Object> health = new HashMap<>();
        health.put("status", "healthy");
        health.put("service", "transcription");
        health.put("openai_configured", openaiApiKey != null && !openaiApiKey.isEmpty());
        return ResponseEntity.ok(health);
    }
}
