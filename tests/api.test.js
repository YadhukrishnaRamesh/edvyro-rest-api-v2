
const { test, after } = require("node:test");
const assert = require("node:assert/strict");
const { app } = require("../src/server");

let server;
let baseUrl;

const fixture = {
  title: "Test Intern",
  company: "Test Company",
  domain: "Software Development",
  location: "Remote",
  workMode: "Remote",
  description: "A test internship for API regression testing.",
  applyUrl: "https://example.com/apply"
};

test("start test server", async () => {
  server = app.listen(0, "127.0.0.1");
  await new Promise(resolve => server.once("listening", resolve));
  baseUrl = `http://127.0.0.1:${server.address().port}`;
});

test("health endpoint responds successfully", async () => {
  const response = await fetch(`${baseUrl}/api/health`);
  const body = await response.json();

  assert.equal(response.status, 200);
  assert.equal(body.success, true);
  assert.equal(body.data.status, "healthy");
});

test("security headers are present", async () => {
  const response = await fetch(`${baseUrl}/api/health`);

  assert.ok(response.headers.has("x-content-type-options"));
  assert.ok(response.headers.has("x-frame-options"));
});

test("internship list supports pagination", async () => {
  const response = await fetch(
    `${baseUrl}/api/internships?page=1&limit=2`
  );
  const body = await response.json();

  assert.equal(response.status, 200);
  assert.equal(body.success, true);
  assert.ok(Array.isArray(body.data));
  assert.ok(body.data.length <= 2);
});

test("invalid pagination is rejected", async () => {
  const response = await fetch(
    `${baseUrl}/api/internships?page=0&limit=10`
  );

  assert.equal(response.status, 400);
});

test("invalid internship input is rejected", async () => {
  const response = await fetch(`${baseUrl}/api/internships`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title: "" })
  });

  assert.equal(response.status, 400);
});

test("unknown routes return 404", async () => {
  const response = await fetch(`${baseUrl}/api/not-a-real-route`);

  assert.equal(response.status, 404);
});

after(async () => {
  if (server) {
    await new Promise((resolve, reject) => {
      server.close(err => err ? reject(err) : resolve());
    });
  }
});
