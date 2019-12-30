from django.shortcuts import render

# Create your views here.
def chat(request):
    department = request.GET.get('channel')
    return render(request, 'chatting/index.html', {
        'channel' : department,
    })