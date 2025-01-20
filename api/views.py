from django.shortcuts import get_object_or_404
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny
from django.contrib.auth.hashers import make_password, check_password
import json
from .models import ForensicData, User
from .serializers import UserSerializer
from .handlers import AiHandler  # Import the AiHandler class

# Initialize AiHandler instance
ai_handler = AiHandler()

@csrf_exempt
def upload_url(request):
    if request.method == 'POST':  # Accept POST requests for URL processing
        try:
            data = json.loads(request.body)  # Parse the JSON body
            url = data.get('url')  # Extract 'url' from the request body

            if not url:
                return JsonResponse({"error": "URL is required"}, status=400)

            # Process the URL using AiHandler
            extracted_content = ai_handler.extract_url(url)
            forensic_report = ai_handler.gen_forensic_report(extracted_content)

            # Save to the database
            forensic_data, created = ForensicData.objects.get_or_create(
                url=url, defaults={"summary": forensic_report}
            )

            return JsonResponse(
                {"url_id": forensic_data.url_id, "url": url, "summary": forensic_report}
            )

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
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        except Exception as e:
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
