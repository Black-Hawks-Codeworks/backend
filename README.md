# This project includes exercises and notes for Express.js

---

## Notes

### Initializing a project

There is no Vite.js for express.js project the project must be initialized manually.

```bash
npm init -y
```

Then install Express.js:

```bash
npm i express
```

To run the server on watch mode:
**Don't use this**

```bash
npm i -D nodemon
```

"-D" means "developer dependency". Also we can use:
**Don't use this**

```bash
node --watch server.js
```

If add the start:dev script in the package.json:
**Use this**

```bash
npm run start:dev
```

It does the same thing but nodemon can be customizised

### Route parameters and Query parameters

Both "live" inside the route.

- Route params:
  *www.test.gr/products/onsale/:id*
  To extract that in code, we need to access the req object:

```js
app.get("/api/users/:id", (req, res) => {
	const userId = parseInt(req.params.id, -1);
    ...
```

- Query params:

  We can have one:

  *www.test.gr/users?id=1*

  Or multiple:

  *www.test.gr/users?id=1&sorted=true*

### On Pg

Best practices:

- Use environment variables for database credentials
- Use connection pooling (as shown in the example with Pool)
- Always handle database errors properly
- Use parameterized queries to prevent SQL injection
- Close the pool when shutting down your application:

```javascript
process.on("SIGINT", async () => {
	await pool.end();
	process.exit(0);
});
```
