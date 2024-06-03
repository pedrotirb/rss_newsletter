"""
This module defines the forms used in the application.

Classes:
    FeedForm: A form to input and validate RSS feed URLs.
"""

from django import forms
from .models import Feed

class FeedForm(forms.ModelForm):
    """
    Form to input and validate RSS feed URLs.

    Attributes:
        Meta (class): Defines metadata options for the form.
    """

    class Meta:
        """
        Meta options for FeedForm.

        Attributes:
            model (Feed): The model associated with the form.
            fields (list): The fields of the model to include in the form.
        """
        model = Feed
        fields = ['url']
