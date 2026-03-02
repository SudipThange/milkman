"""
Minimal CORS middleware for local frontend <-> backend development.
"""


class DevCORSMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        if request.method == "OPTIONS":
            response = self._build_preflight_response()
        else:
            response = self.get_response(request)

        self._add_cors_headers(request, response)
        return response

    def _build_preflight_response(self):
        from django.http import HttpResponse

        return HttpResponse(status=200)

    def _add_cors_headers(self, request, response):
        origin = request.headers.get("Origin")
        if origin:
            response["Access-Control-Allow-Origin"] = origin
            response["Vary"] = "Origin"
            response["Access-Control-Allow-Credentials"] = "true"
        else:
            response["Access-Control-Allow-Origin"] = "*"
            req_method = request.headers.get("Access-Control-Request-Method")
            req_headers = request.headers.get("Access-Control-Request-Headers")
            if req_method:
                response["Access-Control-Allow-Methods"] = req_method
            else:
                response["Access-Control-Allow-Methods"] = "GET, POST, PUT, PATCH, DELETE, OPTIONS"
            if req_headers:
                response["Access-Control-Allow-Headers"] = req_headers
            else:
                response["Access-Control-Allow-Headers"] = (
                    "Authorization, Content-Type, Accept, Origin, X-Requested-With"
                )
            response["Access-Control-Max-Age"] = "600"
