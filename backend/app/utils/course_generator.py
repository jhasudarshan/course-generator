from app.config.logger_config import logger
from app.config.config import GEMINI_API_KEY
from app.utils.youtube import youtube_worker
from google.api_core.exceptions import ServiceUnavailable, InternalServerError, DeadlineExceeded
from google import genai
import re
import json
import time
import datetime
from typing import Dict, List, Optional
from dataclasses import dataclass

class GeminiSetup:
    def __init__(self):
        self.client = genai.Client(api_key=GEMINI_API_KEY)
        self.youtube_worker = youtube_worker

    def generate_response(self, query, retries=3, backoff=2):
        attempt = 0
        while attempt <= retries:
            try:
                response = self.client.models.generate_content(
                    model="gemini-2.0-flash",
                    contents=[{"role": "user", "parts": [{"text": query}]}]
                )
                if response.candidates:
                    return response.candidates[0].content.parts[0].text
                return ""
            except (ServiceUnavailable, InternalServerError, DeadlineExceeded) as e:
                attempt += 1
                wait_time = backoff ** attempt
                logger.warning(f"Gemini API error: {e}. Retrying in {wait_time} seconds... (Attempt {attempt}/{retries})")
                time.sleep(wait_time)
            except Exception as e:
                logger.error(f"Unhandled exception during Gemini API call: {e}")
                break
        return ""
        
    
    """Generate an optimized prompt based on user input"""
    def optimize_user_input_prompt(self, user_input):
        language_expertise_prompt = f"""
            You are a native {user_input['language']} speaker and an expert in curriculum design.

            Provide brief insights on:
            1. Best practices for structuring educational content in {user_input['language']}
            2. Cultural elements to consider when teaching "{user_input['topic']}" in {user_input['language']}
            3. Common teaching strategies in {user_input['language']}-speaking regions
            4. Key domain-specific terms for "{user_input['topic']}" in {user_input['language']}"
            
            Format the response as a short instructional paragraph.
        """
        
        language_expertise = self.generate_response(language_expertise_prompt)
        
        description = user_input.get("description", "").strip()
        description_part = f"Description: {description}\n" if description else ""
        
        base_prompt = f"""
            Use the following context to generate a high-quality and structured course outline:

            Context:
            {language_expertise}

            Requirements:
            - Topic: {user_input['topic']}
            {description_part}Language: {user_input['language']}
            - Difficulty Level: {user_input['difficulty']}
            - Ensure the course follows standard instructional design principles:
                - Modules must follow a logical progression
                - Learning outcomes must align with cognitive level of the difficulty
                - Maintain cultural and linguistic relevance
                - Use terminology appropriate for {user_input['language']} speakers
            - Structure the course as a progression of well-designed modules

            Your Task:
            Write a directive to generate a complete course outline adhering to these educational and cultural standards.
        """

        
        improved_prompt = self.generate_response(base_prompt).strip()
        logger.info("Generated optimized prompt for course generation")
        return improved_prompt

    def generate_course_outline(self, user_input):
        """Generate a full course outline based on user input"""
        try:
            # optimize the prompt
            improved_prompt = self.optimize_user_input_prompt(user_input)
            difficulty = user_input.get("difficulty")
            module_count = {"Beginner": 7, "Intermediate": 10}.get(difficulty, 14)
            
            prompt = f"""
                {improved_prompt}

                Now, based on the above directive, generate a structured course outline consisting of {module_count} modules.

                For each module:
                1. Give a clear, engaging module title
                2. Provide 4-6 learning objectives in bullet points
                3. Ensure each module builds logically on the previous one

                Format strictly as:
                Module X: [Title]
                Objectives:
                - [Objective 1]
                - [Objective 2]
                ...
                ---
            """
            
            outline_text = self.generate_response(prompt)
            logger.info("Generated course outline text")
            print(outline_text)
            
            modules = self._parse_outline(outline_text)
            
            # Prepare course data structure
            course_data = {
                "title": f"{user_input['language']} Course: {user_input['topic']}",
                "description": user_input.get("description", ""),
                "language": user_input['language'],
                "difficulty": user_input['difficulty'],
                "modules": []
            }
            
            # Process each module
            for index, module in enumerate(modules):
                logger.info(f"Processing module {index+1}: {module.get('title', 'Untitled')}")
                module_data = self._process_module(module, user_input)
                course_data["modules"].append(module_data)
            
            print(course_data)
            return course_data
            
        except Exception as e:
            logger.error(f"Error generating course outline: {e}")
            return {"error": str(e)}

    """Parse the outline text into structured modules"""
    def _parse_outline(self, outline_text):
        modules = []
        current_module = None
        in_objectives = False
        
        # First try to split by module separator if present
        sections = outline_text.split("---")
        
        # If we have clear sections, process each one
        if len(sections) > 1:
            for section in sections:
                section = section.strip()
                if not section:
                    continue
                    
                lines = section.split('\n')
                module_data = self._parse_module_section(lines)
                if module_data and module_data.get("title"):
                    modules.append(module_data)
        else:
            # Process line by line if no clear sections
            lines = outline_text.strip().split('\n')
            i = 0
            
            while i < len(lines):
                line = lines[i].strip()
                
                # Check for module title pattern
                # Handle bold markdown and different formats
                module_title_match = re.search(r"(?:\*\*)?Module\s+\d+:?\s+(.*?)(?:\*\*)?$", line, re.IGNORECASE)
                
                if module_title_match:
                    # If we found a new module and already have one in progress, save it
                    if current_module and current_module.get("title"):
                        modules.append(current_module)
                    
                    # Start a new module
                    current_module = {
                        "title": line.strip(),  # Keep full title with "Module X:" prefix
                        "objectives": []
                    }
                    in_objectives = False
                
                # Check for objectives section
                elif current_module and (
                    line.lower().strip() == "**objectives:**" or 
                    line.lower().strip() == "objectives:" or
                    "**objectives:**" in line.lower()
                ):
                    in_objectives = True
                
                # Collect objectives
                elif current_module and in_objectives:
                    # Handle bullet points in various formats (*, -, •, numbers)
                    if line.startswith('*') or line.startswith('-') or line.startswith('•') or re.match(r'^\d+\.', line):
                        # Clean the bullet point
                        objective = re.sub(r'^[\*\-•]|\d+\.\s*', '', line).strip()
                        if objective:
                            current_module["objectives"].append(objective)
                
                i += 1
            
            # Don't forget to add the last module
            if current_module and current_module.get("title"):
                modules.append(current_module)
        
        return modules
    
    """Parse a single module section from lines of text"""
    def _parse_module_section(self, lines):
        module_data = None
        in_objectives = False
        
        for i, line in enumerate(lines):
            line = line.strip()
            if not line:
                continue
            
            # Look for module title (usually the first non-empty line)
            if not module_data:
                # Various patterns to match module titles with or without markdown
                if "Module" in line and (":" in line or "-" in line):
                    module_data = {
                        "title": line.strip(),
                        "objectives": []
                    }
                continue
            
            # Check for objectives section
            if "objectives" in line.lower() or "**objectives" in line.lower():
                in_objectives = True
                continue
            
            # Collect objectives
            if in_objectives:
                # Check for bullet points or numbered items
                if line.startswith('*') or line.startswith('-') or line.startswith('•') or re.match(r'^\d+\.', line):
                    # Clean the bullet point
                    objective = re.sub(r'^[\*\-•]|\d+\.\s*', '', line).strip()
                    if objective:
                        module_data["objectives"].append(objective)
        
        return module_data

    """Process each module to generate content, videos, quizzes and assignments"""
    def _process_module(self, module, user_input):
        # Generate culturally-appropriate lesson content
        lesson_prompt = (
            f"Create a comprehensive lesson in {user_input['language']} for the topic '{module['title']}' at {user_input['difficulty']} level.\n\n"
            f"Objectives: {', '.join(module['objectives'])}.\n\n"
            f"Instructions:\n"
            f"1. Write in authentic, natural {user_input['language']}\n"
            f"2. Include culturally relevant examples for {user_input['language']} speakers\n"
            f"3. Include clear explanations, practical examples, and exercises\n"
            f"4. Structure with headings, subheadings, and short paragraphs\n"
            f"Write content that a native {user_input['language']} teacher would create."
        )
        
        logger.info(f"Generating lesson content for '{module['title']}'")
        lesson_content = self.generate_response(lesson_prompt)
        
        # Generate YouTube video data
        logger.info(f"Generating YouTube video data for '{module['title']}'")
        youtube_data = self._generate_youtube_video_data(module,user_input,lesson_prompt)
        
        # Generate multilingual quiz content
        quiz_prompt = (
            f"Based on this lesson content about '{module['title']}':\n\n"
            f"{lesson_content[:2000]}... [truncated]\n\n"
            f"Create 10-15 high-quality quiz questions in {user_input['language']} that test understanding of key concepts.\n\n"
            f"Requirements:\n"
            f"1. Include questions covering all learning objectives: {', '.join(module['objectives'])}\n"
            f"2. Mix of question types (conceptual, application, terminology)\n"
            f"3. Each question should have:\n"
            f"   - Clear stem in {user_input['language']}\n"
            f"   - 4 plausible options (A-D)\n"
            f"   - Correct answer marked\n"
            f"   - Brief explanation (why it's correct)\n"
            f"4. Include 2-3 questions requiring critical thinking about cultural aspects\n\n"
            f"Format each question as:\n"
            f"Q1. [Question text]\n"
            f"A. [Option A]\n"
            f"B. [Option B]\n"
            f"C. [Option C]\n"
            f"D. [Option D]\n"
            f"Correct: [Letter]\n"
            f"Explanation: [1-2 sentence explanation]"
        )
        
        logger.info(f"Generating quiz questions for '{module['title']}'")
        quiz_content = self.generate_response(quiz_prompt)
        
        structured_quiz_questions = self.parse_quiz_content(quiz_content)
        
        # Generate assignment with multiple question types
        assignment_prompt = (
            f"Based on this lesson about '{module['title']}':\n\n"
            f"{lesson_content[:2000]}... [truncated]\n\n"
            f"Create 1 comprehensive practice assignment containing:\n"
            f"1. 5-8 short answer questions (3 marks each)\n"
            f"2. 3-5 problem solving questions (6 marks each)\n"
            f"3. 2-4 critical thinking essays (12 marks each)\n\n"
            f"Format requirements:\n"
            f"## Assignment: [Title]\n"
            f"### 3 Mark Questions\n"
            f"[Question 1]\n[Question 2]...\n\n"
            f"### 6 Mark Problems\n"
            f"[Problem 1]\n[Problem 2]...\n\n"
            f"### 12 Mark Essays\n"
            f"[Essay Topic 1]\n[Essay Topic 2]...\n\n"
            f"Include clear instructions for each section."
        )
        
        logger.info(f"Generating assignment for '{module['title']}'")
        assignment_content = self.generate_response(assignment_prompt)
        structured_assignment = self.parse_assignment_content(assignment_content)
        
        # Generate additional resources
        resources_prompt = (
            f"For students learning about '{module['title']}' in {user_input['language']}, recommend 3-5 high-quality resources.\n\n"
            f"Base recommendations on this lesson content:\n\n"
            f"{lesson_content[:1000]}... [truncated]\n\n"
            f"Requirements:\n"
            f"1. Include diverse resource types (book, video, website, tool)\n"
            f"2. All resources must be available in {user_input['language']}\n"
            f"3. For each resource provide:\n"
            f"   - Title/Name\n"
            f"   - Type (book, video, etc.)\n"
            f"   - Brief description (what it covers)\n"
            f"   - Why it's valuable for this topic\n"
            f"   - Where to find it (URL if online)\n\n"
            f"Format each resource as:\n"
            f"- [Type]: [Title]\n"
            f"  Description: [text]\n"
            f"  Value: [text]\n"
            f"  Location: [text/URL]"
        )
        
        logger.info(f"Generating additional resources for '{module['title']}'")
        resources_content = self.generate_response(resources_prompt)
        
        # Assemble module data
        return {
            "module_title": module['title'],
            "objectives": module['objectives'],
            "lesson_content": lesson_content,
            "youtube_data": youtube_data,
            "quiz_questions": structured_quiz_questions,
            "assignments": structured_assignment,
            "additional_resources": resources_content,
            "generation_context": {
                "language": user_input['language'],
                "difficulty": user_input['difficulty'],
                "topic": user_input['topic'],
                "timestamp": datetime.datetime.now().isoformat()
            }
        }
        
        
    def parse_quiz_content(self, quiz_content):
        """Robust quiz parser handling both markdown and plain text formats"""
        logger.info("Starting quiz content parsing")
        quiz_questions = []
        current_question = None
        
        # Flexible patterns that handle markdown and plain formats
        question_pattern = re.compile(
            r'^\*?Q(\d+)\.?\*?\s*[:-]?\s*(.*?)(?:\*?)$', 
            re.IGNORECASE
        )
        option_pattern = re.compile(
            r'^\*?([A-D])[\.\)]\*?\s*(.+?)(?:\*?)$', 
            re.IGNORECASE
        )
        correct_pattern = re.compile(
            r'^(?:Correct|Answer|सही)\s*[:-]?\s*([A-D])', 
            re.IGNORECASE
        )
        explanation_pattern = re.compile(
            r'^(?:Explanation|Explicación|विवरण|समझ)\s*[:-]?\s*(.*)', 
            re.IGNORECASE
        )

        for line_num, line in enumerate(quiz_content.split('\n'), 1):
            raw_line = line.strip()
            line = re.sub(r'\*+', '', raw_line)  # Remove all asterisks
            logger.debug(f"Processing line {line_num}: {raw_line}")

            # Question detection (handles both **Q1** and Q1 formats)
            if match := question_pattern.match(line):
                if current_question:
                    self._validate_and_add_question(current_question, quiz_questions)
                current_question = {
                    "number": int(match.group(1)),
                    "text": match.group(2).strip(),
                    "options": {},
                    "correct": None,
                    "explanation": ""
                }
                logger.debug(f"New question detected: Q{current_question['number']}")
                continue

            if current_question:
                # Option detection (handles A), A., **A.** etc.)
                if match := option_pattern.match(line):
                    opt_letter = match.group(1).upper()
                    current_question["options"][opt_letter] = match.group(2).strip()
                    logger.debug(f"Added option {opt_letter}")
                    continue

                # Correct answer detection
                if match := correct_pattern.match(line):
                    current_question["correct"] = match.group(1).upper()
                    logger.debug(f"Marked correct answer: {current_question['correct']}")
                    continue

                # Explanation detection
                if match := explanation_pattern.match(line):
                    current_question["explanation"] = match.group(1).strip()
                    logger.debug("Explanation added")
                    continue

                # Handle multi-line explanations and options
                if raw_line:  # Only process non-empty lines
                    self._handle_continuation(current_question, raw_line)

        # Add final question
        if current_question:
            self._validate_and_add_question(current_question, quiz_questions)

        logger.info(f"Successfully parsed {len(quiz_questions)} questions")
        return quiz_questions

    def _handle_continuation(self, current_question, line):
        """Handle multi-line content and formatting variations"""
        # Check if we're in explanation continuation
        if current_question["explanation"]:
            current_question["explanation"] += " " + line.strip()
            logger.debug("Extended explanation")
            return
        
        # Check for option continuation without letter
        if current_question["options"]:
            last_option = sorted(current_question["options"].keys())[-1]
            current_question["options"][last_option] += " " + line.strip()
            logger.debug(f"Extended option {last_option}")

    def _validate_and_add_question(self, question, question_list):
        """Validation with comprehensive checks"""
        errors = []
        
        # Required fields check
        if not question.get("options"):
            errors.append("Missing options")
        if not question.get("correct"):
            errors.append("Missing correct answer")
        if not question.get("explanation"):
            errors.append("Missing explanation")
            
        # Answer validity check
        if question.get("correct") and question["correct"] not in question.get("options", {}):
            errors.append(f"Correct answer {question['correct']} not in options")
            
        if errors:
            logger.warning(f"Skipping Q{question.get('number')}: {', '.join(errors)}")
            return False
            
        question_list.append(question)
        return True


    def parse_assignment_content(self, content):
        """Parse assignment with multiple question types and mark values"""
        assignment = {
            "title": "",
            "sections": [],
            "total_marks": 0
        }
        
        current_section = None
        mark_pattern = r'(\d+)\s+Mark\s+(Questions|Problems|Essays)'
        
        lines = content.split('\n')
        for line in lines:
            line = line.strip()
            if not line:
                continue

            # Extract assignment title
            if line.startswith('## Assignment:'):
                assignment['title'] = line.split(':', 1)[-1].strip()
                continue
                
            # Detect new section
            section_match = re.match(r'###\s*(.+)', line)
            if section_match:
                section_title = section_match.group(1)
                marks_match = re.search(mark_pattern, section_title)
                
                current_section = {
                    "type": section_title.split('(')[0].strip(),
                    "marks_per_question": int(marks_match.group(1)) if marks_match else 0,
                    "questions": []
                }
                assignment['sections'].append(current_section)
                continue
                
            # Detect numbered questions
            if current_section and re.match(r'^\d+\.', line):
                question = re.sub(r'^\d+\.\s*', '', line).strip()
                if question:
                    current_section['questions'].append(question)
                    # Update total marks
                    if current_section['marks_per_question'] > 0:
                        assignment['total_marks'] += current_section['marks_per_question']

        # Calculate total marks if not detected
        if assignment['total_marks'] == 0:
            for section in assignment['sections']:
                assignment['total_marks'] += len(section['questions']) * section['marks_per_question']

        return assignment

    def _generate_youtube_video_data(self, module, user_input, lesson_content):
        logger.info(f"Generating YouTube data for: {module['title']}")
        
        # Generate search query directly from lesson content
        prompt = f"""
            Generate precise YouTube search query for "{module['title']}" using these guidelines:
            - Include exact module title: "{module['title']}"z
            - Focus on key concepts: {', '.join(module['objectives'][:3])}
            - Language: {user_input['language']}
            - Difficulty level: {user_input['difficulty']}
            - Educational content types: tutorial, explanation, demonstration
            - Format: 5-8 words, only basic punctuation
            Output only the search query
        """
        try:
            raw_query = self.generate_response(prompt).strip()
            # Clean while preserving non-English characters
            search_query = re.sub(r'[^\w\s\-_।॥.,?]', '', raw_query, flags=re.UNICODE)
            search_query = ' '.join(search_query.split()[:8])  # Limit to 8 words
            logger.info(f"Final search query: {search_query}")
            
            # Get video results with better filtering
            video_data = self.youtube_worker.search_youtube_videos(
                search_query,
                language=user_input['language'].lower()
            )
            
            return {
                "search_query": search_query,
                "video_info": video_data
            }
        
        except Exception as e:
            logger.error(f"Youtube data generation failed: {str(e)}")
            return {
                "search_query": search_query if 'search_query' in locals() else "",
                "video_info": {}
            }

course_agent = GeminiSetup()
    
    
@dataclass
class CourseFeedback:
    completeness_score: float  # 0-1 scale
    cultural_relevance_score: float
    suggested_improvements: List[str]
    
class AutoCourseAgent(GeminiSetup):
    def __init__(self):
        super().__init__()
        self.max_retries = 3
        self.quality_threshold = 0.8  # Minimum acceptable score
    
    def run_agent(self, user_input: Dict) -> Dict:
        """Orchestrate the full automation pipeline"""
        course = None
        feedback = None
        
        for attempt in range(self.max_retries):
            # Generate course
            course = self.generate_course_outline(user_input)
            
            # Self-evaluate
            feedback = self.analyze_course(course, user_input)
            
            # Exit if quality meets threshold
            if feedback.completeness_score >= self.quality_threshold:
                break
                
            # Improve course
            user_input = self._apply_feedback(user_input, feedback)
            time.sleep(2)  # Rate limit handling
        
        return {
            "course": course,
            "feedback": feedback,
            "is_approved": feedback.completeness_score >= self.quality_threshold
        }

    def analyze_course(self, course: Dict, user_input: Dict) -> CourseFeedback:
        """Automatically evaluate course quality"""
        analysis_prompt = f"""
        Analyze this course draft for {user_input['topic']} in {user_input['language']}:
        
        Evaluation Criteria:
        1. **Completeness** (0-1): All modules have objectives, content, assessments
        2. **Cultural Relevance** (0-1): Appropriate for {user_input['language']} speakers
        3. **Pedagogical Soundness**: Follows best teaching practices
        
        Course Content:
        {json.dumps(course, indent=2)}
        
        Respond ONLY with this JSON format:
        {{
            "completeness_score": 0.0-1.0,
            "cultural_relevance_score": 0.0-1.0,
            "suggested_improvements": ["list", "of", "specific", "actions"]
        }}
        """
        
        response = self.generate_response(analysis_prompt)
        try:
            return CourseFeedback(**json.loads(response))
        except:
            return CourseFeedback(0.5, 0.5, ["Analysis failed"])

    def _apply_feedback(self, user_input: Dict, feedback: CourseFeedback) -> Dict:
        """Modify user input based on feedback"""
        improvement_prompt = f"""
        Original Input: {user_input}
        Feedback: {feedback}
        
        Suggest improved input parameters addressing:
        - {', '.join(feedback.suggested_improvements[:3])}
        
        Return ONLY the modified JSON input (preserve all original keys).
        """
        
        improved_input = self.generate_response(improvement_prompt)
        try:
            return {**user_input, **json.loads(improved_input)}
        except:
            return user_input

    # Override for auto-generation
    def _process_module(self, module: Dict, user_input: Dict) -> Dict:
        """Enhanced with automatic quality checks"""
        for attempt in range(2):  # One retry
            module_data = super()._process_module(module, user_input)
            if self._validate_module(module_data, user_input):
                return module_data
        return module_data  # Return even if validation fails

    def _validate_module(self, module: Dict, user_input: Dict) -> bool:
        """Check module meets minimum standards"""
        validation_prompt = f"""
        Verify this module meets requirements for {user_input['language']}:
        - Contains all key components (title, objectives, content)
        - Objectives match content
        - Cultural references appropriate for {user_input['language']}
        
        Module: {json.dumps(module)}
        
        Respond ONLY with "VALID" or "INVALID: [reason]".
        """
        response = self.generate_response(validation_prompt)
        return "VALID" in response