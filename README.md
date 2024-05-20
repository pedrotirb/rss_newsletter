# RSS Newsletter

This is a simple Flask application that generates and sends newsletters based on shared posts.

## Endpoints

- `/generate_newsletter`: Generates a newsletter from shared posts. The request should be a POST request with a JSON body containing `header` and `footer` fields.

- `/send_newsletter`: Sends the generated newsletter to a recipient. The request should be a POST request with a JSON body containing `recipient_email` and `newsletter_content` fields.

## Running the Application

To run the application, use the following command:

```bash
python app.py