import os 
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError
from urllib.parse import urlparse, parse_qs
from dotenv import load_dotenv

load_dotenv()
DEVELOPER_KEY = os.getenv("YOUTUBE_API_KEY")

def get_comments(video_url, part="snippet"):
    youtube = build("youtube", "v3", developerKey=DEVELOPER_KEY)
    
    # Enhanced URL parsing
    parsed_url = urlparse(video_url)
    
    # Handle different URL patterns
    if parsed_url.path == '/watch':
        # Standard watch URL
        video_id = parse_qs(parsed_url.query)['v'][0]
    elif 'youtu.be' in parsed_url.netloc:
        # Short URL format
        video_id = parsed_url.path.lstrip('/')
    elif '/embed/' in parsed_url.path:
        # Embedded video URL
        video_id = parsed_url.path.split('/embed/')[1]
    else:
        # Extract from path for other formats
        video_id = parsed_url.path.split('/')[-1]
    
    # Remove any additional parameters from video_id
    video_id = video_id.split('?')[0]
    video_id = video_id.split('&')[0]
    regular_comments = set()
    
    try:
        video_response = youtube.videos().list(
            part='statistics',
            id=video_id
        ).execute()
        
        total_comments = int(video_response['items'][0]['statistics']['commentCount'])
        
        next_page_token = None
        while True:
            response = youtube.commentThreads().list(
                part=part,
                videoId=video_id,
                textFormat="plainText",
                maxResults=100,
                pageToken=next_page_token,
                order='time'
            ).execute()
            
            for item in response["items"]:
                comment_text = item["snippet"]["topLevelComment"]["snippet"]["textDisplay"]
                regular_comments.add(comment_text)
                
                if item["snippet"]["totalReplyCount"] > 0:
                    replies_token = None
                    while True:
                        replies = youtube.comments().list(
                            part=part,
                            parentId=item["id"],
                            textFormat="plainText",
                            maxResults=100,
                            pageToken=replies_token
                        ).execute()
                        
                        for reply in replies["items"]:
                            reply_text = reply["snippet"]["textDisplay"]
                            regular_comments.add(reply_text)
                            
                        if 'nextPageToken' not in replies:
                            break
                        replies_token = replies['nextPageToken']
            
            if 'nextPageToken' not in response:
                break
                
            next_page_token = response['nextPageToken']
        
        unavailable_count = total_comments - len(regular_comments)
        
        return {
            "regular_comments": list(regular_comments),
            "total_reported": total_comments,
            "total_fetched": len(regular_comments),
            "unavailable_count": unavailable_count
        }
        
    except HttpError as error:
        print(f"An HTTP error {error.http_status} occurred:\n {error.content}")
        return None
