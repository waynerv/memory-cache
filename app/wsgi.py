# import os
#
# from dotenv import load_dotenv
#
# dotenv_path = os.path.join(os.path.dirname(__file__), '.env')
# if os.path.exists(dotenv_path):
#     load_dotenv(dotenv_path)

from memory_cache import create_app

app = create_app('production')
