from django.shortcuts import render, redirect
from .models import Application

def landing_page(request):
    return render(request, 'core/landing.html')

def careers_page(request):
    if request.method == 'POST':
        name = request.POST.get('name')
        email = request.POST.get('email')
        role = request.POST.get('role')
        motivation = request.POST.get('motivation')

        Application.objects.create(
            name=name,
            email=email,
            role=role,
            motivation=motivation
        )

        return redirect('/careers/')

    return render(request, 'core/careers.html', {'success': True})