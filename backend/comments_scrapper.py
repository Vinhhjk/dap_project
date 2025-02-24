import os
import pandas as pd
from dotenv import load_dotenv
load_dotenv(dotenv_path='.env')
DEVELOPER_KEY = os.getenv("YOUTUBE_API_KEY")

