import Anthropic from "@anthropic-ai/sdk";
import * as fs from "fs";
import * as path from "path";

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

function createBatchRequest(
  custom_id,
  topic,
  model = "claude-haiku-4-5-20251001",
  systemPrompt,
  userPrompt
) {
  return {
    custom_id: custom_id,
    params: {
      model: model,
      max_tokens: 2000,
      system: systemPrompt,
      messages: [
        {
          role: "user",
          content: userPrompt,
        },
      ],
    },
  };
}

async function submitBatch(requests) {
  if (requests.length === 0) {
    console.log("No requests to batch.");
    return null;
  }

  console.log(`Submitting IAK batch with ${requests.length} requests...`);

  const batch = await client.beta.messages.batches.create({
    requests: requests,
  });

  console.log(`Batch submitted. ID: ${batch.id}`);
  fs.writeFileSync("batch-id.txt", batch.id);

  return batch;
}

async function pollBatchResults(batchId) {
  let batch = await client.beta.messages.batches.retrieve(batchId);

  while (batch.processing_status === "in_progress") {
    console.log(`Batch processing... waiting 60s`);
    await new Promise((resolve) => setTimeout(resolve, 60000));
    batch = await client.beta.messages.batches.retrieve(batchId);
  }

  console.log(`Batch complete. Status: ${batch.processing_status}`);

  if (batch.processing_status === "succeeded") {
    const results = await client.beta.messages.batches.results(batchId);
    const articles = [];

    for await (const result of results) {
      if (result.result.type === "succeeded") {
        articles.push({
          id: result.custom_id,
          content: result.result.message.content[0].text,
          status: "success",
        });
      } else {
        console.error(`Request failed:`, result.result);
        articles.push({
          id: result.custom_id,
          status: "failed",
        });
      }
    }

    return articles;
  }

  return [];
}

function buildArticleHTML(title, content) {
  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  const html = `<!DOCTYPE html>
<html>
<head>
  <title>${title}</title>
  <meta name="description" content="${title}">
  <meta property="og:title" content="${title}">
</head>
<body>
  <article>
    <h1>${title}</h1>
    <time>${new Date().toISOString().split("T")[0]}</time>
    ${content}
  </article>
</body>
</html>`;

  return { slug, html };
}

async function publishArticle(title, content) {
  const { slug, html } = buildArticleHTML(title, content);
  const htmlPath = path.join("articles", `${slug}.html`);

  if (!fs.existsSync("articles")) {
    fs.mkdirSync("articles", { recursive: true });
  }

  fs.writeFileSync(htmlPath, html);
  console.log(`Published IAK article: ${slug}`);

  return slug;
}

function getRandomTopics(count = 3) {
  const topics = [
    "The Future of AI and Human Judgment",
    "Building Personal Authority in Digital Media",
    "Geopolitics of Technology: Who Controls the Narrative?",
    "Strategic Decision-Making Under Uncertainty",
    "The Business of Content: Monetization Models 2024",
    "Personal Branding for Entrepreneurs: First Steps",
    "How to Think Like an Operator, Not a Creator",
    "The Art of Long-Form Content in a Short-Form World",
    "Building Credibility in Crowded Markets",
    "The Psychology of Influence and Persuasion",
  ];

  const shuffled = [...topics].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

async function main() {
  if (process.argv[2] === "retrieve" && fs.existsSync("batch-id.txt")) {
    const batchId = fs.readFileSync("batch-id.txt", "utf-8").trim();
    console.log(`Retrieving IAK batch ${batchId}...`);

    const articles = await pollBatchResults(batchId);

    for (const article of articles) {
      if (article.status === "success") {
        const title = article.id.replace("iak-", "");
        await publishArticle(title, article.content);
      }
    }

    console.log(`Published ${articles.length} IAK articles`);
    fs.unlinkSync("batch-id.txt");
    return;
  }

  console.log("Building IAK batch...");

  const topics = getRandomTopics(3);
  const requests = [];

  for (const topic of topics) {
    const systemPrompt = `You are Imran Ahmed Khan, a strategist and operator writing for imranahmedkhan.com. Your voice is direct, analytical, and grounded in experience. Write about business, strategy, media, and personal transformation.`;

    const userPrompt = `Write an insightful article for imranahmedkhan.com about: "${topic}"

Requirements:
- 1000-1500 words
- Analytical, opinion-driven tone
- Grounded in examples or first-hand observation
- Structure: hook, 3-4 main insights, actionable conclusion
- Format as HTML <p> and <h2> tags
- No filler, only substance`;

    requests.push(
      createBatchRequest(
        `iak-${topic.toLowerCase().replace(/\s+/g, "-")}`,
        topic,
        "claude-haiku-4-5-20251001",
        systemPrompt,
        userPrompt
      )
    );
  }

  const batch = await submitBatch(requests);

  if (batch) {
    console.log(`\nIAK Batch queued. Retrieve with:`);
    console.log(`  node publish.js retrieve`);
    console.log(`Cost: 50% off. Processing 12-24 hours.`);
  }
}

main().catch(console.error);
