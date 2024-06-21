import express, { Request, Response } from "express";
import fs from "fs";
import path from "path";
import bodyParser from "body-parser";

const app = express();
const port = 3000;
const dbFilePath = path.join(__dirname, "..", "db.json");

app.use(bodyParser.json());

// Entrypoint
app.get("/ping", (req: Request, res: Response) => {
  res.send(true);
});

// Create an entry
app.post("/submit", (req: Request, res: Response) => {
  const { name, email, phone, github_link, stopwatch_time } = req.body;

  if (!name || !email || !phone || !github_link || !stopwatch_time) {
    return res.status(400).json({ error: "All fields are required" });
  }

  const newSubmission = { name, email, phone, github_link, stopwatch_time };

  fs.readFile(dbFilePath, (err, data) => {
    if (err) {
      console.error("Failed to read database:", err);
      return res.status(500).json({ error: "Failed to read database" });
    }

    let submissions = [];
    if (data.length > 0) {
      try {
        submissions = JSON.parse(data.toString());
      } catch (parseErr) {
        console.error("Failed to parse database:", parseErr);
        return res.status(500).json({ error: "Failed to parse database" });
      }
    }
    submissions.push(newSubmission);
    fs.writeFile(dbFilePath, JSON.stringify(submissions, null, 2), (err) => {
      if (err) {
        console.error("Failed to save submission:", err);
        return res.status(500).json({ error: "Failed to save submission" });
      }
      res.status(200).json({ message: "Submission saved successfully" });
    });
  });
});


// Read an entry
app.get("/read", (req: Request, res: Response) => {
  const index = parseInt(req.query.index as string, 10);
  if (isNaN(index) || index < 0) {
    return res.status(400).json({ error: "Invalid index" });
  }

  fs.readFile(dbFilePath, (err, data) => {
    if (err) {
      console.error("Failed to read database:", err);
      return res.status(500).json({ error: "Failed to read database" });
    }
    let submissions = [];
    try {
      submissions = JSON.parse(data.toString());
    } catch (parseErr) {
      console.error("Failed to parse database:", parseErr);
      return res.status(500).json({ error: "Failed to parse database" });
    }
    if (index >= submissions.length) {
      console.error("Submission not found at index:", index);
      return res.status(404).json({ error: "Submission not found" });
    }
    res.status(200).json(submissions[index]);
  });
});


// Deleting an entry
app.delete("/delete/:index", (req: Request, res: Response) => {
  const index = parseInt(req.params.index, 10);
  if (isNaN(index) || index < 0) {
    return res.status(400).json({ error: "Invalid index" });
  }
  fs.readFile(dbFilePath, (err, data) => {
    if (err) {
      console.error("Failed to read database:", err);
      return res.status(500).json({ error: "Failed to read database" });
    }
    let submissions = [];
    try {
      submissions = JSON.parse(data.toString());
    } catch (parseErr) {
      console.error("Failed to parse database:", parseErr);
      return res.status(500).json({ error: "Failed to parse database" });
    }
    if (index >= submissions.length) {
      return res.status(404).json({ error: "Submission not found" });
    }
    submissions.splice(index, 1);
    fs.writeFile(dbFilePath, JSON.stringify(submissions, null, 2), (err) => {
      if (err) {
        console.error("Failed to delete submission:", err);
        return res.status(500).json({ error: "Failed to delete submission" });
      }
      res.status(200).json({ message: "Submission deleted successfully" });
    });
  });
});

// Update an entry
app.put("/update/:index", (req: Request, res: Response) => {
  const index = parseInt(req.params.index, 10);
  const { name, email, phone, github_link, stopwatch_time } = req.body;

  if (isNaN(index) || index < 0) {
    return res.status(400).json({ error: "Invalid index" });
  }

  if (!name || !email || !phone || !github_link || !stopwatch_time) {
    return res.status(400).json({ error: "All fields are required" });
  }

  fs.readFile(dbFilePath, (err, data) => {
    if (err) {
      console.error("Failed to read database:", err);
      return res.status(500).json({ error: "Failed to read database" });
    }

    let submissions = [];
    try {
      submissions = JSON.parse(data.toString());
    } catch (parseErr) {
      console.error("Failed to parse database:", parseErr);
      return res.status(500).json({ error: "Failed to parse database" });
    }

    if (index >= submissions.length) {
      return res.status(404).json({ error: "Submission not found" });
    }

    submissions[index] = { name, email, phone, github_link, stopwatch_time };
    fs.writeFile(dbFilePath, JSON.stringify(submissions, null, 2), (err) => {
      if (err) {
        console.error("Failed to update submission:", err);
        return res.status(500).json({ error: "Failed to update submission" });
      }
      res.status(200).json({ message: "Submission updated successfully" });
    });
  });
});

// Search by email
app.get("/search", (req: Request, res: Response) => {
  const email = req.query.email as string;

  if (!email) {
    return res.status(400).json({ error: "Email is required" });
  }

  fs.readFile(dbFilePath, (err, data) => {
    if (err) {
      console.error("Failed to read database:", err);
      return res.status(500).json({ error: "Failed to read database" });
    }

    let submissions = [];
    try {
      submissions = JSON.parse(data.toString());
    } catch (parseErr) {
      console.error("Failed to parse database:", parseErr);
      return res.status(500).json({ error: "Failed to parse database" });
    }

    const submission = submissions.find((entry: any) => entry.email === email);
    if (!submission) {
      return res.status(404).json({ error: "Submission not found" });
    }

    res.status(200).json(submission);
  });
});



app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
