from django.shortcuts import get_object_or_404
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from .models import ForensicData
import json

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
