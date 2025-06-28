import os
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from supabase_py_async import AsyncClient  # Assuming supabase_client.py uses this or similar
from supabase import create_client, Client # Or the sync client if appropriate for context
from dotenv import load_dotenv
from jose import JWTError, jwt # Keep for now if Supabase uses JWTs that can be decoded this way for inspection

# It's better to get the supabase client instance from a shared module if possible
# For now, re-initialize, but ideally, this would come from supabase_client.py or a similar setup
load_dotenv()
SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_SERVICE_ROLE_KEY = os.environ.get("SUPABASE_KEY") # Assuming SUPABASE_KEY in .env is the service role key

if not SUPABASE_URL or not SUPABASE_SERVICE_ROLE_KEY:
    raise RuntimeError("Supabase URL or Service Role Key not configured in environment variables.")

# This client is for backend validation using service_role key
# Note: The supabase client in supabase_client.py might be async, adjust as needed.
# For simplicity, using sync client here for get_user, but an async version would be:
# supabase_admin_client: AsyncClient = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, http_client=httpx.AsyncClient())
supabase_admin_client: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

security = HTTPBearer()

# This function will replace the old get_current_user
# It validates the Supabase JWT and returns the Supabase user object
async def get_current_supabase_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """
    Validates Supabase JWT token and returns the user associated with it.
    This should be used as a dependency in protected FastAPI routes.
    """
    token = credentials.credentials
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication token not provided",
            headers={"WWW-Authenticate": "Bearer"},
        )

    try:
        # Validate the token and get user data using Supabase client
        # The user object returned by Supabase's getUser might vary.
        # Typically, it contains id, email, aud, role, etc.
        user_response = supabase_admin_client.auth.get_user(token)
        if asyncio.iscoroutine(user_response):
            user_response = await user_response

        if not user_response or not user_response.user:
             raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid authentication token or user not found",
                headers={"WWW-Authenticate": "Bearer"},
            )

        # You might want to fetch additional profile information from your 'profiles' table here
        # For example:
        # profile_response = supabase_admin_client.table('profiles').select('*').eq('id', user_response.user.id).single().execute()
        # if profile_response.data:
        #     user_response.user.profile = profile_response.data
        # else: # Handle case where profile might not exist, though it should after signup
        #     user_response.user.profile = None


        # Return the Supabase user object. Adjust as per actual object structure.
        # The important part is that this user is now authenticated by Supabase.
        # FastAPI endpoints can then use user.id for RLS or other checks.
        return user_response.user

    except JWTError as e: # If supabase_admin_client.auth.get_user throws JWTError or similar
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid token: {e}",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except Exception as e: # Catch other potential errors from Supabase client
        # Log the actual error for debugging
        print(f"Error validating Supabase token: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Could not validate credentials due to an internal error.",
            headers={"WWW-Authenticate": "Bearer"},
        )

# Old functions like verify_password, get_password_hash, create_access_token, authenticate_user
# are no longer needed as Supabase handles these. They can be removed.