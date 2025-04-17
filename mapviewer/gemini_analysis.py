import google.generativeai as genai
import pandas as pd
from PIL import Image
import cv2
import os

# --- Initialize Gemini API ---
genai.configure(api_key="AIzaSyCRg8kZ_QyTUAkX4KOAA5YnpBNM8gvfwbM")

model = genai.GenerativeModel("gemini-2.0-flash")

# --- System Prompt Engineering ---
SYSTEM_PROMPT = """
You are an expert agronomist and data scientist assistant helping kiwi growers improve crop yield.
Your role is to analyze the uploaded data (CSV, images, videos), understand patterns or issues,
and provide actionable insights on irrigation, fertilization, pest management, and growth stages.
Always mention:
- Current health of the crop
- Suggestions for improvements
- Anything abnormal detected
- Historical trends if applicable
- Confidence level if assumptions are made
"""

# --- Analyze CSV ---
def analyze_csv(file_path, user_prompt):
    df = pd.read_csv(file_path)
    prompt = f"{SYSTEM_PROMPT}\nUser Query: {user_prompt}\nCSV Data Preview:\n{df.head(10).to_string(index=False)}"
    response = model.generate_content(prompt)
    return response.text

# --- Analyze Image ---
def analyze_image(image_path, user_prompt):
    image = Image.open(image_path)
    response = model.generate_content(
        [SYSTEM_PROMPT, user_prompt, image],
        stream=False
    )
    return response.text

# --- Analyze Video (as frame sampling) ---
def analyze_video(video_path, user_prompt, frame_interval=30):
    cap = cv2.VideoCapture(video_path)
    frames = []
    count = 0
    while True:
        ret, frame = cap.read()
        if not ret:
            break
        if count % frame_interval == 0:
            img_path = f"frame_{count}.jpg"
            cv2.imwrite(img_path, frame)
            frames.append(Image.open(img_path))
        count += 1
    cap.release()

    print(f"Sending {len(frames)} frames to Gemini")
    response = model.generate_content(
        [SYSTEM_PROMPT, user_prompt] + frames[:5],  # Send a few frames only
        stream=False
    )

    # Clean temp files
    for f in os.listdir():
        if f.startswith("frame_") and f.endswith(".jpg"):
            os.remove(f)

    return response.text

# --- Dispatcher Function ---
def analyze(data_type, file_path, user_prompt):
    if data_type == "csv":
        return analyze_csv(file_path, user_prompt)
    elif data_type == "image":
        return analyze_image(file_path, user_prompt)
    elif data_type == "video":
        return analyze_video(file_path, user_prompt)
    else:
        return "Unsupported data type."


