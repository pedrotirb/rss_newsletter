"""
This module defines the database models for the application.

Classes:
    Feed: A model to represent an RSS feed.

Example usage:
    from .models import Feed

    # Create a new feed
    new_feed = Feed(url='https://example.com/rss')
    new_feed.save()

    # Retrieve all feeds
    all_feeds = Feed.objects.all()
"""

from django.db import models

class Feed(models.Model):
    """
    Model to represent an RSS feed.

    Attributes:
        url (URLField): The URL of the RSS feed.
    """

    url = models.URLField()

    def __str__(self):
        """
        Returns the URL of the object as a string.

        Returns:
            str: The URL of the object.
        """
        return str(self.url)
