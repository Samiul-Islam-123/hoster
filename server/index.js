const express = require('express');
const app = express();
const Log = require('./Log.js');
const DeployApplication = require('./services/Deployment.js');

app.use(express.json())
const PORT = process.env.PORT || 5500;
const log = new Log();

app.get('/', (req,res) => {
    res.json({
        message : "Hoster Server is running fine",
        success : true
    })
})

app.post('/deploy', async (req, res) => {
    const { repoURL, username, targetFolder, env } = req.body;
    try {
        const output = await DeployApplication(repoURL, username, targetFolder, env);

        // Extract URL from the output
        const urlMatch = output.match(/https?:\/\/[^\s]+/);
        const extractedUrl = urlMatch ? urlMatch[0] : null;

        res.json({
            success: true,
            output: extractedUrl || "URL not found",
            message: extractedUrl ? "Deployed successfully" : "Deployed, but URL extraction failed",
        });
    } catch (error) {
        log.error(error);
        res.status(500).json({
            success: false,
            message: "Deployment failed. Some error occurred :(",
            error: error.message,
        });
    }
});



app.listen(PORT, () => {
    log.info("Server is up and running on PORT : "+PORT)
})