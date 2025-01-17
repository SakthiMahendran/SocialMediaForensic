from rest_framework.permissions import AllowAny
from django.shortcuts import get_object_or_404
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from .models import ForensicData
import json
from django.contrib.auth.hashers import make_password, check_password
from django.shortcuts import get_object_or_404
from django.http import JsonResponse
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import ForensicData, User
from .serializers import UserSerializer

# Class for AI processing (replace this with your implementation)
class AIProcessor:
    @staticmethod
    def process_url(url):
        # Placeholder AI logic
        return f"Summary for {url}"

@csrf_exempt
def upload_url(request):
    if request.method == 'POST':  # Changed to POST to accept body
        try:
            data = json.loads(request.body)  # Parse the JSON body
            url = data.get('url')  # Extract 'url' from the request body
            if not url:
                return JsonResponse({"error": "URL is required"}, status=400)

            # Process the URL and save to the database
            summary = AIProcessor.process_url(url)
            forensic_data, created = ForensicData.objects.get_or_create(
                url=url, defaults={"summary": summary}
            )
            return JsonResponse({"url_id": forensic_data.url_id, "url": url, "summary": summary})

        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)
    return JsonResponse({"error": "Invalid HTTP method"}, status=405)

@csrf_exempt
def history(request):
    if request.method == 'GET':
        data = list(ForensicData.objects.values('url_id', 'url', 'summary'))
        return JsonResponse({"history": data})
    elif request.method == 'DELETE':
        try:
            data = json.loads(request.body)  # Parse the JSON body
            url_id = data.get('url_id')
            if not url_id:
                return JsonResponse({"error": "URL ID is required"}, status=400)

            forensic_data = get_object_or_404(ForensicData, url_id=url_id)
            forensic_data.delete()
            return JsonResponse({"message": "Deleted successfully"})
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)
    return JsonResponse({"error": "Invalid HTTP method"}, status=405)

    




class SignUpView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        try:
            data = request.data.copy()
            if not data.get('password'):
                return Response({'error': 'Password is required'}, status=status.HTTP_400_BAD_REQUEST)

            data['password'] = make_password(data['password'])  # Hash the password
            serializer = UserSerializer(data=data)
            if serializer.is_valid():
                serializer.save()
                return Response({'message': 'User created successfully!'}, status=status.HTTP_201_CREATED)
            else:
                print("Serializer errors:", serializer.errors)  # Debug serializer errors
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        except Exception as e:
            print("Error during signup:", str(e))  # Debug unexpected errors
            return Response({'error': 'Internal server error'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class LoginView(APIView):
    permission_classes = [AllowAny]  # Allow unauthenticated access

    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')
        try:
            user = User.objects.get(username=username)
            if check_password(password, user.password):
                return Response({'message': 'Login successful!'}, status=status.HTTP_200_OK)
            return Response({'error': 'Invalid password.'}, status=status.HTTP_401_UNAUTHORIZED)
        except User.DoesNotExist:
            return Response({'error': 'User not found.'}, status=status.HTTP_404_NOT_FOUND)
