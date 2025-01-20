import requests
from bs4 import BeautifulSoup
from fake_useragent import UserAgent
from langchain_groq import ChatGroq


class AiHandler:
    """
    AI Handler for extracting text from URLs and generating forensic reports.
    """

    def __init__(self):
        """
        Initialize the Groq LLM with the desired model and API key.
        """
        # Initialize the Groq LLM
        self.llm = ChatGroq(
            model="llama3-70b-8192",  # Replace with your desired Groq model
            temperature=0.7,
            api_key="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",
        )

        # Maximum token limit for the model (assume 8192 for this model)
        self.max_context_length = 8192
        self.context_threshold = int(self.max_context_length * 0.95)  # 95% of max context length

    def extract_url(self, url: str) -> str:
        """
        Extract text content from a given URL.

        :param url: The URL to extract content from.
        :return: Extracted text content from the URL.
        """
        try:
            # Generate a random User-Agent to mimic browser behavior
            ua = UserAgent()
            headers = {
                "User-Agent": ua.random,
            }

            # Fetch the content from the URL
            response = requests.get(url, headers=headers, timeout=10)
            response.raise_for_status()  # Raise exception for HTTP errors

            # Parse the content using BeautifulSoup
            soup = BeautifulSoup(response.text, "html.parser")

            # Extract visible text (from <p> tags)
            text = " ".join([element.get_text() for element in soup.find_all("p")])

            if not text.strip():
                raise ValueError("No meaningful content found at the given URL.")

            return text.strip()
        except requests.exceptions.RequestException as e:
            raise RuntimeError(f"HTTP error occurred: {str(e)}")
        except Exception as e:
            raise RuntimeError(f"Error extracting content from URL: {str(e)}")

    def gen_forensic_report(self, url_content: str) -> str:
        """
        Generate a forensic analysis report based on the extracted content from a URL.

        :param url_content: The extracted text content from a URL.
        :return: Forensic analysis and insights as plain text.
        """
        try:
            # Token limits
            # model_limit = 6000  # Total limit for the model
            # buffer_tokens = 1000  # Reserve tokens for prompt and response
            max_input_tokens = 3100

            # Approximate token length calculation
            def approximate_token_count(text: str) -> int:
                return len(text.split())  # Approximation: 1 word = ~1 token

            # Truncate content if necessary
            current_tokens = approximate_token_count(url_content)
            if current_tokens > max_input_tokens:
                truncated_content = " ".join(url_content.split()[:max_input_tokens])
                warning_message = (
                    "The content was too long and has been truncated to fit the model's token limit.\n\n"
                )
            else:
                truncated_content = url_content
                warning_message = ""

            # Prompt engineering for forensic analysis
            prompt = f"""
            You are an AI-powered social media forensic analyst. Your task is to analyze the content extracted from a URL and generate a detailed forensic report. The content may include text related to social media posts, comments, or articles.

            Based on the analysis:
            1. Identify any sensitive, inappropriate, or harmful content present in the text.
            2. Highlight potential ethical, legal, or security concerns based on the context of the content.
            3. Provide actionable recommendations for mitigating risks, improving content quality, or addressing identified concerns.
            4. Suggest best practices for responsible social media content creation and consumption.

            The extracted content is as follows:
            {truncated_content}

            Please respond with a comprehensive forensic report including observations, insights, and suggestions. Avoid using JSON or structured formats—just provide plain text.
            """
            # Invoke the Groq LLM
            response = self.llm.invoke([{"role": "user", "content": prompt}])

            # Combine warning (if any) with the model's response
            return warning_message + response.content
        except Exception as e:
            raise RuntimeError(f"Error generating forensic report: {str(e)}")


# Example Usage
if __name__ == "__main__":
    handler = AiHandler()

    # Example URL
    test_url = "https://en.wikipedia.org/wiki/Artificial_intelligence"

    try:
        # Extract content from the URL
        extracted_content = handler.extract_url(test_url)
        print("Extracted Content:\n", extracted_content)

        # Generate forensic report
        forensic_report = handler.gen_forensic_report(extracted_content)
        print("\nForensic Report:\n", forensic_report)
    except Exception as e:
        print(f"An error occurred: {e}")
