import os 
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError
import pandas as pd
from urllib.parse import urlparse, parse_qs

from dotenv import load_dotenv
load_dotenv()
# Replace with your YouTube API Key
DEVELOPER_KEY = os.getenv("YOUTUBE_API_KEY")


def get_comments(video_url, part="snippet", max_results=100):

    youtube = build("youtube", "v3", developerKey=DEVELOPER_KEY)
    parsed_url = urlparse(video_url)
    video_id = parse_qs(parsed_url.query)['v'][0]
    try:
        # Retrieve comment thread using the youtube.commentThreads().list() method
        response = youtube.commentThreads().list(
            part=part,
            videoId=video_id,
            textFormat="plainText",
            maxResults=max_results
        ).execute()

        comments = []
        for item in response["items"]:
            comment_text = item["snippet"]["topLevelComment"]["snippet"]["textDisplay"]
            comments.append(comment_text)

        return comments
    except HttpError as error:
        print(f"An HTTP error {error.http_status} occurred:\n {error.content}")
    return None