"""
This module defines the views for handling RSS feed inputs and displaying posts.

Functions:
    home: Handles the display of the RSS feed form and the latest RSS posts.
"""

from django.shortcuts import render, redirect
from .models import Feed
from .forms import FeedForm
import feedparser

def home(request):
    """
    Handles the display of the RSS feed form and the latest RSS posts.

    If the request method is POST, it processes the form data, saves the new RSS
    feed, and redirects to the home page. Otherwise, it displays the form and the
    latest posts from all stored RSS feeds.

    Args:
        request (HttpRequest): The HTTP request object.

    Returns:
        HttpResponse: The rendered HTML page displaying the form and latest RSS posts.
    """
    if request.method == 'POST':
        form = FeedForm(request.POST)
        if form.is_valid():
            form.save()
            return redirect('home')
    else:
        form = FeedForm()

    feeds = Feed.objects.all()
    entries = []
    for feed in feeds:
        d = feedparser.parse(feed.url)
        entries.extend(d.entries[:10])

    context = {
        'form': form,
        'entries': entries,
    }

    return render(request, 'feeds/home.html', context)
