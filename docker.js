const express = require('express');
const axios = require('axios');

const app = express();
const port = 3000;

// Middleware to parse JSON and URL-encoded data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from the public directory
app.use(express.static('public'));

// Route to render the search form
app.get('/', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Docker Repo Search</title>
        </head>
        <body>
            <h1>Search Docker Repository</h1>
            <form action="/search" method="post">
                <input type="text" name="repoUrl" placeholder="Docker Repo URL or Name" required>
                <button type="submit">Search</button>
            </form>
        </body>
        </html>
    `);
});

// Route to handle search
app.post('/search', async (req, res) => {
    const repoUrl = req.body.repoUrl;
    try {
        const repoData = await fetchDockerRepoData(repoUrl);
        res.send(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Docker Repo Search Result</title>
            </head>
            <body>
                <h1>Repository Tags</h1>
                <ul>
                    ${repoData.map(tag => `<li>${tag.name} - Last updated: ${tag.last_updated}</li>`).join('')}
                </ul>
                <a href="/">Back to search</a>
            </body>
            </html>
        `);
    } catch (error) {
        res.status(500).send('Error fetching repository data');
    }
});

const fetchDockerRepoData = async (repoUrl) => {
    let repoName;
    if (repoUrl.includes('_/')) {
        repoName = repoUrl.split('/').slice(-2).join('/');
    } else {
        repoName = repoUrl.split('/').slice(-2).join('/');
    }

    // Fetch data from Docker Hub API
    const response = await axios.get(`https://hub.docker.com/v2/repositories/${repoName}/tags`, {
        headers: {
            'Authorization': `Bearer YOUR_DOCKER_HUB_TOKEN`
        }
    });
    const tags = response.data.results;

    return tags.map(tag => ({
        name: tag.name,
        last_updated: tag.last_updated,
    }));
};


// Start the server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});