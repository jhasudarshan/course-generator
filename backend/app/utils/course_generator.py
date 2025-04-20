from app.config.logger_config import logger
from app.config.config import GEMINI_API_KEY
from app.utils.youtube import youtube_worker
from google import genai
import re
import json

class GeminiSetup:
    def __init__(self):
        self.client = genai.Client(api_key=GEMINI_API_KEY)
        self.youtube_worker = youtube_worker

    def generate_response(self, query):
        response = self.client.models.generate_content(
            model="gemini-2.0-flash",
            contents=[{"role": "user", "parts": [{"text": query}]}]
        )
        if response.candidates:
            return response.candidates[0].content.parts[0].text
        return ""
    
    """Create a plan for course generation"""
    def plan_course(self, user_input):
        planning_prompt = f"""
        You are an expert course designer. Create a detailed plan for a {user_input['difficulty']} level course on "{user_input['topic']}" in {user_input['language']}.
        
        Course requirements:
        - Target language: {user_input['language']}
        - Difficulty level: {user_input['difficulty']}
        - Description: {user_input.get('description', 'No description provided')}
        - Number of modules: {user_input.get('module_count', 8)}
        
        Provide:
        1. Overall course structure
        2. Key learning outcomes
        3. Module topics (high-level)
        4. Recommended teaching approaches for this subject in {user_input['language']}
        5. Any cultural considerations for teaching this subject in {user_input['language']}
        
        Format as structured JSON with these keys: "structure", "outcomes", "modules", "approaches", "cultural_notes"
        """
        
        plan_response = self.generate_response(planning_prompt)
        
        try:
            # Extract JSON from response (in case there's explanatory text around it)
            json_match = re.search(r'```json\s*([\s\S]*?)\s*```', plan_response)
            if json_match:
                plan_json = json.loads(json_match.group(1))
            else:
                plan_json = json.loads(plan_response)
                
            logger.info("Course plan generated successfully")
            return plan_json
        except json.JSONDecodeError:
            logger.error("Failed to parse course plan as JSON")
            return {"error": "Failed to generate valid course plan"}
        
    
    """Generate an optimized prompt based on user input"""
    def optimize_user_input_prompt(self, user_input):
        language_expertise_prompt = f"""
        As a native {user_input['language']} speaker and education expert, provide guidance on:
        
        1. How to best structure educational content for {user_input['language']} speakers
        2. Any cultural elements to incorporate when teaching "{user_input['topic']}" in {user_input['language']}
        3. Common pedagogical approaches in {user_input['language']}-speaking regions
        4. Key terminology for "{user_input['topic']}" in {user_input['language']}
        
        Format as a concise instruction paragraph.
        """
        
        language_expertise = self.generate_response(language_expertise_prompt)
        
        description = user_input.get("description", "").strip()
        description_part = f"Description: {description}\n" if description else ""
        
        base_prompt = (
            f"Based on these insights about teaching in {user_input['language']}: {language_expertise}\n\n"
            "Create a comprehensive, culturally-appropriate course outline with the following details:\n\n"
            f"Topic: {user_input['topic']}\n"
            f"{description_part}"
            f"Language: {user_input['language']}\n"
            f"Difficulty: {user_input['difficulty']}\n"
            f"Module count: {user_input.get('module_count', 1)}\n\n"
            "Ensure content is culturally relevant and linguistically appropriate. Format as a directive."
        )
        
        improved_prompt = self.generate_response(base_prompt).strip()
        logger.info("Generated optimized prompt for course generation")
        return improved_prompt

    def generate_course_outline(self, user_input):
        """Generate a full course outline based on user input"""
        try:
            # First get the course plan
            # course_plan = self.plan_course(user_input)
            
            # Then optimize the prompt
            improved_prompt = self.optimize_user_input_prompt(user_input)
            
            module_count = user_input.get('module_count', 2)
            
            prompt = (
                f"{improved_prompt}\n\n"
                f"Generate a detailed course outline with {module_count} modules. "
                "For each module include:\n\n"
                "1. A clear, engaging title\n"
                "2. 4-6 specific learning objectives as bullet points\n"
                "3. Each module should build logically on previous ones\n\n"
                "Format each module as:\n"
                "Module X: [Title]\n"
                "Objectives:\n"
                "- [Objective 1]\n"
                "- [Objective 2]\n"
                "...\n"
                "---\n"
            )
            
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
            f"5. Include terminology in both {user_input['language']} and English where helpful\n"
            f"Write content that a native {user_input['language']} teacher would create."
        )
        
        logger.info(f"Generating lesson content for '{module['title']}'")
        lesson_content = self.generate_response(lesson_prompt)
        
        # Generate YouTube video data
        logger.info(f"Generating YouTube video data for '{module['title']}'")
        youtube_data = self._generate_youtube_video_data(module, user_input)
        
        # Generate multilingual quiz content
        quiz_prompt = (
            f"Create 10-20 culturally appropriate multiple-choice quiz questions in {user_input['language']} "
            f"to test understanding of '{module['title']}' at {user_input['difficulty']} level.\n\n"
            f"For each question:\n"
            f"1. Write a clear question in natural {user_input['language']}\n"
            f"2. Provide 4 options (A, B, C, D)\n"
            f"3. Indicate the correct answer\n"
            f"4. Add a brief explanation for why it's correct\n\n"
            f"Format as:\nQ1. [Question]\nA. [Option]\nB. [Option]\nC. [Option]\nD. [Option]\nCorrect: [Letter]\nExplanation: [Brief explanation]"
        )
        
        logger.info(f"Generating quiz questions for '{module['title']}'")
        quiz_content = self.generate_response(quiz_prompt)
        
        # Generate culturally appropriate assignments
        assignment_prompt = (
            f"Design 2 practical assignments for '{module['title']}' in {user_input['language']}, "
            f"aligned with these objectives: {', '.join(module['objectives'])}.\n\n"
            f"Requirements:\n"
            f"1. Make assignments culturally relevant to {user_input['language']} speakers\n"
            f"2. Suitable for {user_input['difficulty']} level learners\n"
            f"3. Include clear instructions, evaluation criteria, and estimated completion time\n"
            f"4. One shorter assignment (30-60 minutes) and one in-depth project (2-3 hours)\n\n"
            f"Format each assignment with title, description, steps, and evaluation criteria."
        )
        
        logger.info(f"Generating assignments for '{module['title']}'")
        assignment_content = self.generate_response(assignment_prompt)
        
        # Generate additional resources
        resources_prompt = (
            f"Recommend 3-5 learning resources for students studying '{module['title']}' in {user_input['language']}.\n\n"
            f"Include a mix of:\n"
            f"1. Books or textbooks in {user_input['language']}\n"
            f"2. Online resources (websites, articles) in {user_input['language']}\n"
            f"3. Tools or software with {user_input['language']} support\n\n"
            f"For each resource, provide title, brief description, and why it's valuable."
        )
        
        logger.info(f"Generating additional resources for '{module['title']}'")
        resources_content = self.generate_response(resources_prompt)
        
        # Assemble module data
        return {
            "module_title": module['title'],
            "objectives": module['objectives'],
            "lesson_content": lesson_content,
            "youtube_data": youtube_data,
            "quiz_questions": quiz_content,
            "assignments": assignment_content,
            "additional_resources": resources_content
        }

    """Generate YouTube search queries and find videos"""
    def _generate_youtube_video_data(self, module, user_input):
        # Generate culturally and linguistically appropriate search queries
        youtube_prompt = (
            f"Generate 3 YouTube search phrases in {user_input['language']} for the topic '{module['title']}'.\n\n"
            f"Guidelines:\n"
            f"1. Each phrase should be 5-8 words\n"
            f"2. Include '{user_input['language']}' as one of the search terms\n"
            f"3. Include terms like 'tutorial', 'lesson', or 'how to' in {user_input['language']}\n"
            f"4. Target {user_input['difficulty']} level content\n\n"
            f"Return only the search phrases, one per line, no numbering or formatting."
        )
        
        search_queries_text = self.generate_response(youtube_prompt)
        search_queries = self._clean_search_queries(search_queries_text)
        
        video_info = None
        if search_queries:
            video_info = self._get_unique_video(search_queries, user_input['language'])
        
        return {
            "search_queries": search_queries,
            "video_info": video_info
        }
    
    """Clean and extract search queries from text"""
    def _clean_search_queries(self, text):
        queries = []
        for line in text.split('\n'):
            line = line.strip()
            if line and not any(line.startswith(c) for c in ['```', '[', '*', '-', '#']):
                queries.append(line)
                if len(queries) >= 3:
                    break
        return queries[:3]

    """Find a unique video from a list of search queries"""
    def _get_unique_video(self, queries, language):
        for query in queries:
            try:
                response = self.youtube_worker.search_youtube_videos(query, language=language)
                if response:
                    return response
            except Exception as e:
                logger.error(f"Error searching for {query}: {e}")
                
        try:
            if queries:
                return self.youtube_worker.search_youtube_videos(queries[0], language=language)
        except Exception:
            pass
            
        return None

course_agent = GeminiSetup()