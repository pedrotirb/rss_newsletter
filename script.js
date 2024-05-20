document.getElementById('scrapeBtn').addEventListener('click', async () => {
    const urlInput = document.getElementById('url-input');
    const targetUrl = urlInput.value.trim();

    try {
        new URL(targetUrl);
        if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
            throw new Error('URL must be absolute.');
        }
        showLoadingMessage();
        await fetchAndDisplayRSSLinks(targetUrl);
    } catch (error) {
        showError('Please enter a valid URL.');
    } finally {
        hideLoadingMessage();
    }
});

async function fetchAndDisplayRSSLinks(url) {
    const proxyUrls = ['https://cors-anywhere.herokuapp.com/', 'https://cors.bridged.cc/', 'http://localhost:8080/proxy?url='];

    for (const proxyUrl of proxyUrls) {
        try {
            const fullUrl = proxyUrl + encodeURIComponent(url);
            const html = await fetchHTML(fullUrl);
            const rssUrls = extractRSSUrls(html, url);
            displayRSSUrls(rssUrls);
            break;
        } catch (error) {
            console.error(`Error fetching RSS links with proxy ${proxyUrl}:`, error);
        }
        }
        }
        
        async function fetchHTML(url) {
        const headers = new Headers({
        ‘User-Agent’: ‘Mozilla/5.0’
        });
        const response = await fetch(url, { headers });
        return await response.text();
        }
        
        function parseContent(content, type) {
        const parser = new DOMParser();
        return parser.parseFromString(content, type);
        }
        
        function extractRSSUrls(html, baseUrl) {
        const doc = parseContent(html, ‘text/html’);
        const linkTags = doc.querySelectorAll(‘link[type=“application/rss+xml”], link[type=“application/atom+xml”], link[rel=“alternate”][type=“application/rss+xml”], link[rel=“alternate”][type=“application/atom+xml”]’);
        const rssUrls = new Set();
        linkTags.forEach(linkTag => {
            let rssUrl = linkTag.getAttribute('href') || '';
            if (rssUrl.startsWith('/')) {
                const urlObj = new URL(baseUrl);
                rssUrl = `${urlObj.protocol}//${urlObj.host}${rssUrl}`;
            }
            rssUrls.add(rssUrl);
        });
        
        return rssUrls;
    }

    function displayRSSUrls(rssUrls) {
    const outputArea = document.getElementById(‘output-area’);
    outputArea.value = Array.from(rssUrls).join(’\n’);
    if (rssUrls.size > 0) {
        showAddFeedModal(rssUrls);
    } else {
        alert('No RSS feeds found.');
    }
}

function showAddFeedModal(rssUrls) {
const feedOptions = document.getElementById(‘feedOptions’);
feedOptions.innerHTML = ‘’;
rssUrls.forEach(url => {
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.value = url;

    const label = document.createElement('label');
    label.textContent = url;

    feedOptions.appendChild(checkbox);
    feedOptions.appendChild(label);
    feedOptions.appendChild(document.createElement('br'));
});

const modal = document.getElementById('addFeedModal');
modal.style.display = 'flex';

document.getElementById('addFeedsBtn').onclick = () => {
    const selectedUrls = Array.from(feedOptions.querySelectorAll('input[type="checkbox"]:checked')).map(input => input.value);
    addFeedsToList(selectedUrls);
    modal.style.display = 'none';
};
}

function addFeedsToList(urls) {
const sidebarFeedsList = document.getElementById(‘sidebar-feeds-list’);
urls.forEach(url => {
    const listItem = document.createElement('li');
    const link = document.createElement('a');
    link.href = '#';
    link.textContent = url;
    link.onclick = async () => {
        await fetchAndDisplayRSSPosts(url);
    };

    listItem.appendChild(link);
    sidebarFeedsList.appendChild(listItem);

    fetchAndDisplayRSSPosts(url);
});
}

async function fetchAndDisplayRSSPosts(url) {
try {
const response = await fetch(url);
const data = await response.text();
const items = parseRSSFeed(data);
displayRSSPosts(items);
} catch (error) {
console.error(‘Error fetching RSS posts:’, error);
}
}

function parseRSSFeed(data) {
const xmlDoc = parseContent(data, ‘text/xml’);
return xmlDoc.querySelectorAll(‘item’);
}

function displayRSSPosts(items) {
const rssFeedContainer = document.getElementById(‘rssPostsFeed’);
rssFeedContainer.innerHTML = ‘’;
const fragment = document.createDocumentFragment();

items.forEach(item => {
    const title = item.querySelector('title').textContent;
    const link = item.querySelector('link').textContent;
    const description = item.querySelector('description').textContent;
    const pubDate = item.querySelector('pubDate').textContent;

    const postElement = createPostElement(title, description, link, pubDate);
    fragment.appendChild(postElement);
});

rssFeedContainer.appendChild(fragment);
}

function createPostElement(title, description, link, pubDate) {
const postElement = document.createElement(‘div’);
postElement.classList.add(‘rssPost’);
postElement.innerHTML = <h3>${title}</h3> <p>${description}</p> <p><strong>Published on:</strong> ${pubDate}</p> <a href="${link}" target="_blank">Read More</a> <button onclick="bookmarkPost('${title}', '${link}')">Bookmark</button> <button onclick="sharePost('${title}', '${link}')">Share</button>;
return postElement;
}

document.getElementById(‘sidebar-all-feeds’).addEventListener(‘click’, async () => {
const urls = Array.from(document.querySelectorAll(’#sidebar-feeds-list a’)).map(a => a.textContent);
const allPosts = [];
for (const url of urls) {
try {
const response = await fetch(url);
const data = await response.text();
const items = parseRSSFeed(data);
allPosts.push(…items);
} catch (error) {
console.error(Error fetching posts from ${url}:, error);
}
}
displayRSSPosts(allPosts);
});

function showLoadingMessage() {
document.getElementById(‘loadingMessage’).style.display = ‘block’;
}

function hideLoadingMessage() {
document.getElementById(‘loadingMessage’).style.display = ‘none’;
}

function showError(message) {
alert(message);
}

async function bookmarkPost(title, link) {
try {
const response = await fetch(’/bookmark_post’, {
method: ‘POST’,
headers: {
‘Content-Type’: ‘application/json’
},
body: JSON.stringify({ title, link })
});
const data = await response.json();
if (data.success) {
alert(‘Post bookmarked successfully!’);
} else {
alert(‘Failed to bookmark post’);
}
} catch (error) {
console.error(‘Error bookmarking post:’, error);
}
}

async function sharePost(title, link) {
try {
const response = await fetch(’/share_post’, {
method: ‘POST’,
headers: {
‘Content-Type’: ‘application/json’
},
body: JSON.stringify({ title, link })
});
const data = await response.json();
if (data.success) {
alert(‘Post shared successfully!’);
} else {
alert(‘Failed to share post’);
}
} catch (error) {
console.error(‘Error sharing post:’, error);
}
}

document.getElementById(‘generateNewsletter’).addEventListener(‘click’, async () => {
const header = document.getElementById(‘newsletterHeader’).value;
const footer = document.getElementById(‘newsletterFooter’).value;
const response = await fetch(’/generate_newsletter’, {
method: ‘POST’,
headers: {
‘Content-Type’: ‘application/json’
},
body: JSON.stringify({ header, footer })
});
const data = await response.json();
document.getElementById(‘newsletterContent’).innerHTML = data.newsletter;
});

document.getElementById(‘sendNewsletter’).addEventListener(‘click’, async () => {
const recipientEmail = document.getElementById(‘recipientEmail’).value;
const newsletterContent = document.getElementById(‘newsletterContent’).innerHTML;
const response = await fetch(’/send_newsletter’, {
method: ‘POST’,
headers: {
‘Content-Type’: ‘application/json’
},
body: JSON.stringify({ recipient_email: recipientEmail, newsletter_content: newsletterContent })
});
const data = await response.json();
if (data.success) {
alert(‘Newsletter sent successfully!’);
} else {
alert(‘Failed to send newsletter’);
}
});