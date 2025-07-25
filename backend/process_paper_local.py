#!/usr/bin/env python3
"""
Local script to process PDF papers with Gemini 2.5 Pro
Downloads PDF from GCS, processes with AI, saves structured JSON back to GCS
"""

import os
import json
from google.cloud import storage
import google.generativeai as genai
from pydantic import BaseModel
from typing import List
import argparse
from dotenv import load_dotenv

# Load environment variables from root .env file
load_dotenv('../.env')

# =============================================================================
# CONFIGURATION - MODIFY THESE 3 PLACES:
# =============================================================================

# 1. BUCKET DIRECTORY - Where your PDFs are stored
BUCKET_NAME = "reasonfield-uploads"
BUCKET_DIRECTORY = "papers"  # Change this to your desired directory

# 2. PROMPT - What you want Gemini to analyze
PROMPT = """
Analyze this research paper on investors' biasesand extract cognitive biases with detailed descriptions.
For each bias, provide:
1. The name of the bias
2. A detailed description of the bias
3. The outcome of this bias (what happens when this bias occurs)
4. Countermeasures for this bias (how to mitigate this bias)
"""

# 3. JSON STRUCTURE - Define your desired output format
class Bias(BaseModel):
    name: str
    description: str
    outcome: str
    countermeasure: str

class AnalysisResult(BaseModel):
    biases: List[Bias]
    summary: str
    metadata: dict

# =============================================================================
# SCRIPT LOGIC (Don't modify below this line)
# =============================================================================

def get_storage_client():
    """Get Google Cloud Storage client using service account"""
    service_account_path = "service-account.json"
    if not os.path.exists(service_account_path):
        raise FileNotFoundError(f"Service account file {service_account_path} not found")
    
    return storage.Client.from_service_account_json(service_account_path)

def download_pdf_from_gcs(pdf_filename: str) -> bytes:
    """Download PDF from Google Cloud Storage"""
    storage_client = get_storage_client()
    bucket = storage_client.bucket(BUCKET_NAME)
    blob = bucket.blob(f"{BUCKET_DIRECTORY}/{pdf_filename}")
    
    if not blob.exists():
        raise FileNotFoundError(f"PDF file {pdf_filename} not found in {BUCKET_DIRECTORY}/")
    
    return blob.download_as_bytes()

def process_with_gemini(pdf_content: bytes, pdf_filename: str) -> AnalysisResult:
    """Process PDF with Gemini 2.5 Pro"""
    # Configure Gemini
    api_key = os.getenv('GEMINI_API')
    if not api_key:
        raise ValueError("GEMINI_API environment variable not set in .env file")
    
    genai.configure(api_key=api_key)
    model = genai.GenerativeModel('gemini-2.5-pro')
    
    # Create the full prompt with structure instructions
    structure_prompt = f"""
    {PROMPT}
    
    Please respond with a JSON object that has this exact structure:
    {{
        "biases": [
            {{
                "name": "bias name",
                "description": "detailed description",
                "outcome": "what happens when this bias occurs",
                "countermeasure": "how to mitigate this bias"
            }}
        ],
        "summary": "brief summary of the paper",
        "metadata": {{
            "processed_at": "timestamp",
            "paper_name": "{pdf_filename}"
        }}
    }}
    
    Ensure your response is valid JSON and follows this exact structure.
    """
    
    # Process with Gemini
    response = model.generate_content([
        structure_prompt,
        {"mime_type": "application/pdf", "data": pdf_content}
    ])
    
    # Parse the response
    response_text = response.text.strip()
    
    # Try to extract JSON from the response
    try:
        # Find JSON in the response (handle cases where Gemini adds extra text)
        start_idx = response_text.find('{')
        end_idx = response_text.rfind('}') + 1
        json_str = response_text[start_idx:end_idx]
        
        # Parse JSON
        data = json.loads(json_str)
        
        # Validate with Pydantic
        result = AnalysisResult(**data)
        
        # Add metadata
        result.metadata = {
            "processed_at": data.get("metadata", {}).get("processed_at", "unknown"),
            "paper_name": pdf_filename,
            "model_used": "gemini-2.5-pro"
        }
        
        return result
        
    except (json.JSONDecodeError, ValueError) as e:
        print(f"Failed to parse Gemini response as JSON: {e}")
        print(f"Raw response: {response_text}")
        raise

def save_json_to_gcs(result: AnalysisResult, pdf_filename: str):
    """Save JSON result back to Google Cloud Storage"""
    storage_client = get_storage_client()
    bucket = storage_client.bucket(BUCKET_NAME)
    
    # Create JSON filename
    json_filename = pdf_filename.replace('.pdf', '.json')
    blob = bucket.blob(f"{BUCKET_DIRECTORY}/{json_filename}")
    
    # Save JSON
    json_content = json.dumps(result.model_dump(), indent=2)
    blob.upload_from_string(json_content, content_type='application/json')
    
    print(f"✅ JSON saved to: gs://{BUCKET_NAME}/{BUCKET_DIRECTORY}/{json_filename}")

def main():
    parser = argparse.ArgumentParser(description='Process PDF with Gemini 2.5 Pro')
    parser.add_argument('pdf_filename', help='Name of the PDF file in the bucket')
    args = parser.parse_args()
    
    try:
        print(f"📥 Downloading {args.pdf_filename} from gs://{BUCKET_NAME}/{BUCKET_DIRECTORY}/")
        pdf_content = download_pdf_from_gcs(args.pdf_filename)
        
        print(f"🤖 Processing with Gemini 2.5 Pro...")
        result = process_with_gemini(pdf_content, args.pdf_filename)
        
        print(f"💾 Saving results...")
        save_json_to_gcs(result, args.pdf_filename)
        
        print(f"✅ Processing complete!")
        print(f"📊 Found {len(result.biases)} biases")
        print(f"📝 Summary: {result.summary[:100]}...")
        
    except Exception as e:
        print(f"❌ Error: {e}")
        return 1
    
    return 0

if __name__ == "__main__":
    exit(main()) 