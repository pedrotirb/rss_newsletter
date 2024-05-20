from flask import Flask, request, jsonify, render_template
import requests
from bs4 import BeautifulSoup
import feedparser
import smtplib
from email.mime.text import MIMEText

app = Flask(__name__)

rss_feeds = []
bookmarked_posts = []
shared_posts = []

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/get_rss_links', methods=['POST'])
def get_rss_links():
    data = request.get_json()
    url = data.get('url')
    
    try:
        response = requests.get(url)
        response.raise_for_status()
        html_content = response.text
        
        soup = BeautifulSoup(html_content, 'html.parser')
        rss_links = []
        for link in soup.find_all('link', type='application/rss+xml'):
            rss_links.append(link.get('href'))
        
        return jsonify({'rss_links': rss_links})
    except requests.RequestException as e:
        return jsonify({'error': str(e)}), 400

@app.route('/add_rss_feed', methods=['POST'])
def add_rss_feed():
    data = request.get_json()
    link = data.get('link')
    
    if link not in rss_feeds:
        rss_feeds.append(link)
        return jsonify({'success': True})
    return jsonify({'success': False})

@app.route('/get_aggregated_posts', methods=['GET'])
def get_aggregated_posts():
    posts = []
    for feed_url in rss_feeds:
        feed = feedparser.parse(feed_url)
        for entry in feed.entries:
            posts.append({
                'title': entry.title,
                'link': entry.link,
                'description': entry.description,
                'pubDate': entry.published,
                'image': entry.media_content[0]['url'] if 'media_content' in entry else 'images/image-placeholder.png'
            })
    return jsonify({'posts': posts})

@app.route('/bookmark_post', methods=['POST'])
def bookmark_post():
    data = request.get_json()
    title = data.get('title')
    link = data.get('link')
    
    if {'title': title, 'link': link} not in bookmarked_posts:
        bookmarked_posts.append({'title': title, 'link': link})
        return jsonify({'success': True})
    return jsonify({'success': False})

@app.route('/get_bookmarked_posts', methods=['GET'])
def get_bookmarked_posts():
    return jsonify({'posts': bookmarked_posts})

@app.route('/share_post', methods=['POST'])
def share_post():
    data = request.get_json()
    title = data.get('title')
    link = data.get('link')
    
    try:
        response = requests.get(link)
        response.raise_for_status()
        html_content = response.text
        
        soup = BeautifulSoup(html_content, 'html.parser')
        content = soup.get_text()
        
        if {'title': title, 'link': link, 'content': content} not in shared_posts:
            shared_posts.append({'title': title, 'link': link, 'content': content})
            return jsonify({'success': True})
    except requests.RequestException as e:
        return jsonify({'error': str(e)}), 400
    
    return jsonify({'success': False})

@app.route('/get_shared_posts', methods=['GET'])
def get_shared_posts():
    return jsonify({'posts': shared_posts})

@app.route('/generate_newsletter', methods=['POST'])
def generate_newsletter():
    data = request.get_json()
    header = data.get('header')
    footer = data.get('footer')
    
    newsletter = f"<h1>{header}</h1>"
    for post in shared_posts:
        newsletter += f"<h2>{post['title']}</h2><p>{post['content']}</p>"
    newsletter += f"<footer>{footer}</footer>"
    return jsonify({'newsletter': newsletter})

@app.route('/send_newsletter', methods=['POST'])
def send_newsletter():
    data = request.get_json()
    recipient_email = data.get('recipient_email')
    newsletter_content = data.get('newsletter_content')
    
    msg = MIMEText(newsletter_content, 'html')
    msg['Subject'] = 'Your Newsletter'
    msg['From'] = 'youremail@example.com'
    msg['To'] = recipient_email

    try:
        with smtplib.SMTP('smtp.example.com') as server:
            server.login('yourusername', 'yourpassword')
            server.sendmail(msg['From'], [msg['To']], msg.as_string())
        return jsonify({'success': True})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)