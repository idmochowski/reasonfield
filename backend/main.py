from fastapi import FastAPI, HTTPException, UploadFile, File, Depends, Header
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from google.oauth2 import id_token
from google.auth.transport import requests as grequests
from google.cloud import firestore
from google.cloud import storage
import os
import json
import google.generativeai as genai
from dotenv import load_dotenv
from typing import List
import PyPDF2
import io

# Load environment variables from root directory
load_dotenv('../.env')

# Initialize FastAPI app
app = FastAPI()

# Allow frontend dev server and production domains
cors_origins = os.getenv("CORS_ORIGINS", "http://localhost:5173").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

db = firestore.Client(project='reasonfield', database="reasonfield-db")
storage_client = storage.Client()

BUCKET_NAME = os.getenv("GCS_BUCKET", "reasonfield-uploads")

# =============================================================================
# CONFIGURATION - MODIFY THESE PLACES:
# =============================================================================

# Bias definitions location
BIAS_DEFINITIONS_DIRECTORY = "papers"  # Change this to your desired directory
BIAS_DEFINITIONS_FILENAME = "bias-definitions.json"  # Change this to your desired filename

# Report generation prompt
REPORT_GENERATION_PROMPT = """
Analyze the provided documents and identify instances of cognitive biases 
based on the bias definitions provided. For each detected bias, provide:
1. The specific context where the bias occurs (including the flagged text)
2. Why this bias might be happening
3. The potential consequences
4. Recommended countermeasures

Focus on identifying specific examples where the biases manifest in the documents.
"""

# =============================================================================
# PYDANTIC MODELS
# =============================================================================

class DetectedBias(BaseModel):
    filename: str
    context: str  # Includes the part flagged as bias
    bias_name: str
    argumentation: str
    consequence: str
    countermeasure: str

class BiasReport(BaseModel):
    detected_biases: List[DetectedBias]
    summary: str
    metadata: dict

# =============================================================================
# HELPER FUNCTIONS
# =============================================================================

# Helper: get user email from token
class TokenRequest(BaseModel):
    credential: str

# =============================================================================
# HEALTH CHECK ENDPOINT
# =============================================================================

@app.get("/health")
async def health_check():
    """Health check endpoint for monitoring and CI/CD verification"""
    return {
        "status": "healthy",
        "service": "reasonfield-backend",
        "version": "1.0.0",
        "timestamp": "2024-01-01T00:00:00Z"
    }

def get_user_email(credential: str) -> str:
    CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")
    if not CLIENT_ID:
        raise ValueError("GOOGLE_CLIENT_ID environment variable is required")
    idinfo = id_token.verify_oauth2_token(credential, grequests.Request(), CLIENT_ID)
    return idinfo["email"]

def is_email_allowed(email: str) -> bool:
    docs = db.collection("allowed_emails").where("email", "==", email).stream()
    return any(True for _ in docs)

async def get_current_user_email(authorization: str = Header(None)):
    if not authorization or not authorization.startswith('Bearer '):
        raise HTTPException(status_code=401, detail="Missing or invalid authorization header")
    token = authorization.split(' ', 1)[1]
    email = get_user_email(token)
    if not is_email_allowed(email):
        raise HTTPException(status_code=403, detail="Email not allowed")
    return email

def get_bias_definitions() -> dict:
    """Download bias definitions JSON from GCS"""
    bucket = storage_client.bucket(BUCKET_NAME)
    blob = bucket.blob(f"{BIAS_DEFINITIONS_DIRECTORY}/{BIAS_DEFINITIONS_FILENAME}")
    
    if not blob.exists():
        raise HTTPException(status_code=404, detail=f"Bias definitions file not found: {BIAS_DEFINITIONS_FILENAME}")
    
    content = blob.download_as_text()
    return json.loads(content)

def get_user_files_content(user_email: str) -> str:
    """Get all user files and combine their content"""
    bucket = storage_client.bucket(BUCKET_NAME)
    blobs = bucket.list_blobs(prefix=f"uploads/{user_email}/")
    
    combined_content = ""
    
    for blob in blobs:
        if blob.name.endswith('/'):
            continue
        
        filename = blob.name.split('/')[-1]
        
        try:
            if filename.endswith('.txt'):
                # Handle text files
                content = blob.download_as_text()
                combined_content += f"\n\n=== FILE: {filename} ===\n{content}\n"
                
            elif filename.endswith('.pdf'):
                # Handle PDF files
                pdf_content = blob.download_as_bytes()
                pdf_reader = PyPDF2.PdfReader(io.BytesIO(pdf_content))
                
                text_content = ""
                for page_num, page in enumerate(pdf_reader.pages):
                    try:
                        page_text = page.extract_text()
                        if page_text.strip():
                            text_content += f"\n--- Page {page_num + 1} ---\n{page_text}\n"
                    except Exception as e:
                        print(f"Error extracting text from page {page_num + 1} of {filename}: {e}")
                        continue
                
                if text_content.strip():
                    combined_content += f"\n\n=== FILE: {filename} ===\n{text_content}\n"
                else:
                    print(f"Warning: No text extracted from PDF {filename}")
                    
            elif filename.endswith('.docx'):
                # Handle DOCX files (basic text extraction)
                try:
                    content = blob.download_as_text()
                    combined_content += f"\n\n=== FILE: {filename} ===\n{content}\n"
                except Exception as e:
                    print(f"Error reading DOCX {filename}: {e}")
                    # For DOCX, we might need a more sophisticated approach
                    combined_content += f"\n\n=== FILE: {filename} ===\n[DOCX file - content extraction not fully supported]\n"
                    
        except Exception as e:
            print(f"Error processing {filename}: {e}")
            continue
    
    return combined_content

def generate_bias_report(bias_definitions: dict, user_files_content: str) -> BiasReport:
    """Generate bias report using Gemini API"""
    api_key = os.getenv('GEMINI_API')
    if not api_key:
        raise HTTPException(status_code=500, detail="GEMINI_API not configured")
    
    genai.configure(api_key=api_key)
    model = genai.GenerativeModel('gemini-2.5-pro')
    
    # Create the full prompt
    full_prompt = f"""
    {REPORT_GENERATION_PROMPT}
    
    BIAS DEFINITIONS:
    {json.dumps(bias_definitions, indent=2)}
    
    USER DOCUMENTS:
    {user_files_content}
    
    Please respond with a JSON object that has this exact structure:
    {{
        "detected_biases": [
            {{
                "filename": "filename.txt",
                "context": "The specific context including the flagged bias text",
                "bias_name": "Confirmation Bias",
                "argumentation": "Why this bias might be occurring",
                "consequence": "Potential consequences of this bias",
                "countermeasure": "Recommended countermeasure"
            }}
        ],
        "summary": "Brief summary of the analysis",
        "metadata": {{
            "processed_at": "timestamp",
            "total_biases_found": 5
        }}
    }}
    
    Ensure your response is valid JSON and follows this exact structure.
    """
    
    try:
        response = model.generate_content(full_prompt)
        response_text = response.text.strip()
        
        # Extract JSON from response
        start_idx = response_text.find('{')
        end_idx = response_text.rfind('}') + 1
        json_str = response_text[start_idx:end_idx]
        
        data = json.loads(json_str)
        result = BiasReport(**data)
        
        # Add metadata
        result.metadata = {
            "processed_at": data.get("metadata", {}).get("processed_at", "unknown"),
            "total_biases_found": len(result.detected_biases),
            "model_used": "gemini-2.5-pro"
        }
        
        return result
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating report: {str(e)}")

# =============================================================================
# API ENDPOINTS
# =============================================================================

@app.post("/upload")
async def upload_file(file: UploadFile = File(...), user_email: str = Depends(get_current_user_email)):
    # Only allow certain file types
    allowed_types = ["application/pdf", "text/plain", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"]
    if file.content_type not in allowed_types and not file.filename.endswith('.docx'):
        raise HTTPException(status_code=400, detail="File type not allowed")
    
    # Upload to GCS
    bucket = storage_client.bucket(BUCKET_NAME)
    blob = bucket.blob(f"uploads/{user_email}/{file.filename}")
    blob.upload_from_file(file.file, content_type=file.content_type)
    return {"message": "File uploaded successfully", "filename": file.filename}

@app.get("/files")
async def list_files(user_email: str = Depends(get_current_user_email)):
    # List files from GCS for the user
    bucket = storage_client.bucket(BUCKET_NAME)
    blobs = bucket.list_blobs(prefix=f"uploads/{user_email}/")
    
    files = []
    for blob in blobs:
        # Skip the folder itself
        if blob.name.endswith('/'):
            continue
        # Extract filename from path
        filename = blob.name.split('/')[-1]
        files.append({
            "filename": filename,
            "size": blob.size,
            "created": blob.time_created.isoformat() if blob.time_created else None,
            "updated": blob.updated.isoformat() if blob.updated else None
        })
    
    return {"files": files}

@app.delete("/files/{filename}")
async def delete_file(filename: str, user_email: str = Depends(get_current_user_email)):
    # Delete file from GCS for the user
    bucket = storage_client.bucket(BUCKET_NAME)
    blob = bucket.blob(f"uploads/{user_email}/{filename}")
    
    # Check if file exists
    if not blob.exists():
        raise HTTPException(status_code=404, detail="File not found")
    
    # Delete the file
    blob.delete()
    return {"message": "File deleted successfully", "filename": filename}

@app.post("/generate-report")
async def generate_report(user_email: str = Depends(get_current_user_email)):
    """Generate bias report for user's uploaded files"""
    try:
        # Get bias definitions
        bias_definitions = get_bias_definitions()
        
        # Get user files content
        user_files_content = get_user_files_content(user_email)
        
        if not user_files_content.strip():
            raise HTTPException(status_code=400, detail="No readable files found for analysis")
        
        # Generate report
        report = generate_bias_report(bias_definitions, user_files_content)
        
        return report
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating report: {str(e)}")

@app.post("/auth/google")
def google_auth(token_req: TokenRequest):
    try:
        CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")
        if not CLIENT_ID:
            raise HTTPException(status_code=500, detail="GOOGLE_CLIENT_ID not configured")
        idinfo = id_token.verify_oauth2_token(token_req.credential, grequests.Request(), CLIENT_ID)
        user_email = idinfo["email"]
        if not is_email_allowed(user_email):
            raise HTTPException(status_code=403, detail="Email not allowed")
        return {"email": user_email, "name": idinfo.get("name"), "picture": idinfo.get("picture")}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Invalid token: {str(e)}")
# Trigger rebuild
