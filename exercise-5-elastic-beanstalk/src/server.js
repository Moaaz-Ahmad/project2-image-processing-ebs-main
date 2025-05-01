import bodyParser from 'body-parser';
import express from 'express';
import { router as imageRoutes } from './routes/imageRoutes.js';
import { router as tweetRoutes } from './routes/tweetRoutes.js';
import { filterImageFromURL, deleteLocalFiles } from './util/util';

(async () => {
  // Create an express application
  const app = express();
  // Default port to listen
  const port = process.env.PORT || 8080;

  // Use middleware so post bodies are accessible as req.body
  app.use(bodyParser.json());
  app.use(express.urlencoded({ extended: true })); // For requests from forms-like data

  // Root URI call
  app.get("/", (req, res) => {
    res.status(200).send("Welcome to the Cloud!");
  });

  // Endpoint to filter an image from a public URL
  app.get("/filteredimage", async (req, res) => {
    const imageUrl = req.query.image_url;
    // Validate the image_url query parameter
    if (!imageUrl) {
      return res.status(400).send("image_url query parameter is required");
    }

    try {
      // Filter the image
      const filteredPath = await filterImageFromURL(imageUrl);
      
      // Send the filtered image file
      res.sendFile(filteredPath, (err) => {
        if (err) {
          console.error("Error sending the processed image:", err);
          res.status(500).send("Error sending the processed image");
        } else {
          // Cleanup the temporary file after sending
          deleteLocalFiles([filteredPath]);
        }
      });
    } catch (error) {
      console.error("Error processing image:", error);
      res.status(422).send("Unable to process image at the provided URL");
    }
  });

  // Use the routes defined in external files
  app.use(tweetRoutes);
  app.use(imageRoutes);

  // Start the Server
  app.listen(port, () => {
    console.log(`server running http://localhost:${port}`);
    console.log(`press CTRL+C to stop server`);
  });
})();