package com.careeros.service;

import com.careeros.model.AnalysisResult;
import com.careeros.model.Resume;
import com.careeros.model.User;
import com.careeros.dto.ExtractedProfileDTO;
import com.careeros.repository.AnalysisResultRepository;
import com.careeros.repository.ResumeRepository;
import com.careeros.repository.UserRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.GetObjectRequest;
import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AIAnalyzerService {

        private final ResumeRepository resumeRepository;
        private final UserRepository userRepository;
        private final AnalysisResultRepository analysisResultRepository;
        private final S3Client s3Client;
        private final ObjectMapper objectMapper;

        @Value("${nvidia.api-key}")
        private String nvidiaApiKey;

        @Value("${aws.s3.bucket-name}")
        private String bucketName;

        public AnalysisResult analyzeResume(Long userId, Long resumeId, String jobDescription,
                        String jobTitle, String companyName) throws Exception {
                User user = userRepository.findById(userId)
                                .orElseThrow(() -> new RuntimeException("User not found"));

                Resume resume = resumeRepository.findByIdAndUserId(resumeId, userId)
                                .orElseThrow(() -> new RuntimeException("Resume not found"));

                String resumeText = downloadResumeFromS3(resume.getS3Key());
                String prompt = buildPrompt(resumeText, jobDescription, jobTitle, companyName);
                String aiResponse = callNvidiaAPI(prompt);
                return parseAndSaveResult(user, resume, jobDescription, jobTitle, companyName, aiResponse);
        }

        public String generateCoverLetter(Long userId, Long resumeId, String jobDescription,
                        String jobTitle, String companyName, String tone) throws Exception {
                Resume resume = resumeRepository.findByIdAndUserId(resumeId, userId)
                                .orElseThrow(() -> new RuntimeException("Resume not found"));

                String resumeText = downloadResumeFromS3(resume.getS3Key());

                String prompt = String.format(
                                """
                                                You are a professional career coach. Write a compelling cover letter based on the resume and job description.
                                                Tone: %s
                                                Job: %s at %s

                                                RESUME:
                                                %s

                                                JOB DESCRIPTION:
                                                %s

                                                Return ONLY the cover letter text. No preamble, no explanation.
                                                """,
                                tone != null ? tone : "professional",
                                jobTitle != null ? jobTitle : "N/A",
                                companyName != null ? companyName : "N/A",
                                resumeText,
                                jobDescription);

                return callNvidiaAPI(prompt);
        }

        private String downloadResumeFromS3(String s3Key) throws Exception {

                GetObjectRequest request = GetObjectRequest.builder()
                                .bucket(bucketName)
                                .key(s3Key)
                                .build();

                byte[] pdfBytes = s3Client
                                .getObjectAsBytes(request)
                                .asByteArray();

                try (PDDocument document = Loader.loadPDF(pdfBytes)) {

                        PDFTextStripper stripper = new PDFTextStripper();

                        String text = stripper.getText(document);

                        if (text.length() > 4000) {
                                text = text.substring(0, 4000);
                        }

                        return text;
                }
        }

        private String buildPrompt(String resumeText, String jobDescription,
                        String jobTitle, String companyName) {
                return String.format(
                                """
                                                You are an expert ATS (Applicant Tracking System) and HR Career Coach.
                                                Analyze the following resume against the job description for %s at %s.

                                                RESUME:
                                                %s

                                                JOB DESCRIPTION:
                                                %s

                                                Return a detailed analysis in VALID JSON format ONLY. Do not include any markdown formatting or explanations outside the JSON.

                                                Expected JSON structure:
                                                {
                                                  "matchScore": 78,
                                                  "atsFriendly": true,
                                                  "hardSkillsFound": ["Java", "Spring Boot", "AWS"],
                                                  "hardSkillsMissing": ["Kubernetes", "Terraform"],
                                                  "softSkillsFound": ["leadership", "communication"],
                                                  "softSkillsMissing": ["agile", "scrum"],
                                                  "experienceMatch": "3 years found, 5 years required",
                                                  "educationMatch": true,
                                                  "keywordDensity": "Java: 3, Microservices: 2",
                                                  "resumeImprovements": ["Add quantifiable achievements", "Include Kubernetes in skills"],
                                                  "coverLetterPoints": ["Highlight AWS S3 experience", "Mention Java 21 knowledge"],
                                                  "interviewQuestions": ["Why Google?", "Explain microservices"],
                                                  "overallVerdict": "Strong candidate but missing cloud-native experience",
                                                  "strengths": "Solid backend foundation",
                                                  "weaknesses": "Missing DevOps tools",
                                                  "suggestions": "Take a Kubernetes certification",
                                                  "missingKeywords": "Kubernetes, Terraform, Docker",
                                                  "summary": "Contextual assessment of the candidate."
                                                }
                                                """,
                                jobTitle != null ? jobTitle : "N/A",
                                companyName != null ? companyName : "N/A",
                                resumeText,
                                jobDescription);
        }

        private String callNvidiaAPI(String prompt) throws Exception {
                System.out.println("Calling NVIDIA API...");
                HttpClient client = HttpClient.newBuilder()
                                .connectTimeout(Duration.ofSeconds(120))
                                .build();

                Map<String, Object> message = new HashMap<>();
                message.put("role", "user");
                message.put("content", prompt);

                Map<String, Object> requestBody = new HashMap<>();
                requestBody.put("model", "meta/llama-3.3-70b-instruct");
                requestBody.put("temperature", 0.1);
                requestBody.put("top_p", 0.7);
                requestBody.put("max_tokens", 1024);
                requestBody.put("stream", false);
                requestBody.put("messages", List.of(message));

                HttpRequest request = HttpRequest.newBuilder()
                                .uri(URI.create("https://integrate.api.nvidia.com/v1/chat/completions"))
                                .header("Content-Type", "application/json")
                                .header("Authorization", "Bearer " + nvidiaApiKey)
                                .timeout(Duration.ofSeconds(180))
                                .POST(HttpRequest.BodyPublishers.ofString(objectMapper.writeValueAsString(requestBody)))
                                .build();

                HttpResponse<String> response = client.send(request,
                                HttpResponse.BodyHandlers.ofString());
                System.out.println("NVIDIA responded");
                if (response.statusCode() != 200) {
                        throw new RuntimeException("NVIDIA API error: " + response.body());
                }

                JsonNode responseJson = objectMapper.readTree(response.body());
                return responseJson.get("choices").get(0).get("message").get("content").asText();
        }

        private AnalysisResult parseAndSaveResult(User user, Resume resume,
                        String jobDescription, String jobTitle, String companyName,
                        String aiResponse) throws Exception {

                String cleanResponse = aiResponse
                                .replaceAll("```json\\s*", "")
                                .replaceAll("```\\s*", "")
                                .trim();

                JsonNode json = objectMapper.readTree(cleanResponse);

                AnalysisResult result = new AnalysisResult();
                result.setUser(user);
                result.setResume(resume);
                result.setJobDescription(jobDescription);
                result.setJobTitle(jobTitle);
                result.setCompanyName(companyName);

                result.setMatchScore(json.has("matchScore") ? json.get("matchScore").asInt() : 0);
                result.setAtsFriendly(json.has("atsFriendly") ? json.get("atsFriendly").asBoolean() : false);

                result.setHardSkillsFound(nodeToString(json.get("hardSkillsFound")));
                result.setHardSkillsMissing(nodeToString(json.get("hardSkillsMissing")));
                result.setSoftSkillsFound(nodeToString(json.get("softSkillsFound")));
                result.setSoftSkillsMissing(nodeToString(json.get("softSkillsMissing")));

                result.setExperienceMatch(json.has("experienceMatch") ? json.get("experienceMatch").asText() : "");
                result.setEducationMatch(json.has("educationMatch") ? json.get("educationMatch").asBoolean() : false);
                result.setKeywordDensity(json.has("keywordDensity") ? json.get("keywordDensity").asText() : "");

                result.setResumeImprovements(nodeToString(json.get("resumeImprovements")));
                result.setCoverLetterPoints(nodeToString(json.get("coverLetterPoints")));
                result.setInterviewQuestions(nodeToString(json.get("interviewQuestions")));

                result.setOverallVerdict(json.has("overallVerdict") ? json.get("overallVerdict").asText() : "");
                result.setStrengths(json.has("strengths") ? json.get("strengths").asText() : "");
                result.setWeaknesses(json.has("weaknesses") ? json.get("weaknesses").asText() : "");
                result.setSuggestions(json.has("suggestions") ? json.get("suggestions").asText() : "");
                result.setMissingKeywords(json.has("missingKeywords") ? json.get("missingKeywords").asText() : "");
                result.setFullAnalysis(json.has("summary") ? json.get("summary").asText() : "");

                return analysisResultRepository.save(result);
        }

        private String nodeToString(JsonNode node) {
                if (node == null || node.isMissingNode())
                        return "";
                if (node.isArray()) {
                        StringBuilder sb = new StringBuilder();
                        for (JsonNode item : node) {
                                if (sb.length() > 0)
                                        sb.append(", ");
                                sb.append(item.asText());
                        }
                        return sb.toString();
                }
                return node.asText();
        }

        public ExtractedProfileDTO extractProfileFromResume(Long userId, Long resumeId) throws Exception {

                System.out.println("STEP 1: Starting extraction");

                User user = userRepository.findById(userId)
                                .orElseThrow(() -> new RuntimeException("User not found"));

                System.out.println("STEP 2: User found");

                Resume resume = resumeRepository.findByIdAndUserId(resumeId, userId)
                                .orElseThrow(() -> new RuntimeException("Resume not found"));

                System.out.println("STEP 3: Resume found");

                String resumeText = downloadResumeFromS3(resume.getS3Key());

                System.out.println("STEP 4: Resume downloaded from S3");

                String prompt = buildAutofillPrompt(resumeText);

                System.out.println("STEP 5: Prompt created");

                String aiResponse = callNvidiaAPI(prompt);

                System.out.println("STEP 6: NVIDIA returned response");

                String cleanResponse = aiResponse
                                .replaceAll("```json\\s*", "")
                                .replaceAll("```\\s*", "")
                                .trim();

                System.out.println("STEP 7: JSON cleaned");

                ExtractedProfileDTO dto = objectMapper.readValue(cleanResponse, ExtractedProfileDTO.class);

                System.out.println("STEP 8: JSON parsed");

                return dto;
        }

        private String buildAutofillPrompt(String resumeText) {
                return "You are an expert resume parser. Extract profile details and skills from the resume below.\n\n"
                                +
                                "RESUME:\n" + resumeText + "\n\n" +
                                "Return ONLY a valid JSON object (no markdown, no explanation) with this exact structure:\n"
                                +
                                "{\n" +
                                "  \"currentTitle\": \"Software Engineer\",\n" +
                                "  \"currentCompany\": \"Google\",\n" +
                                "  \"yearsOfExperience\": 3.5,\n" +
                                "  \"industry\": \"Information Technology\",\n" +
                                "  \"educationLevel\": \"Bachelor's Degree\",\n" +
                                "  \"location\": \"San Francisco, CA\",\n" +
                                "  \"bio\": \"Short professional summary.\",\n" +
                                "  \"linkedinUrl\": \"\",\n" +
                                "  \"githubUrl\": \"\",\n" +
                                "  \"portfolioUrl\": \"\",\n" +
                                "  \"skills\": [\n" +
                                "    {\"name\": \"Java\", \"category\": \"Technical\", \"proficiencyLevel\": \"Advanced\"},\n"
                                +
                                "    {\"name\": \"Communication\", \"category\": \"Soft\", \"proficiencyLevel\": \"Intermediate\"}\n"
                                +
                                "  ]\n" +
                                "}\n" +
                                "Rules: yearsOfExperience is a number. proficiencyLevel must be one of: Beginner, Intermediate, Advanced, Expert. category must be one of: Technical, Soft, Domain.";
        }
}