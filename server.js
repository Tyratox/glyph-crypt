const fs = require("fs");
const path = require("path");
const { encode, decode } = require("./lib");

const express = require("express");
const bodyParser = require("body-parser");

const [charPath, verbose = false] = process.argv.slice(2);
const port = process.env.PORT || 8080;

const app = express();

app.get("/", (request, response) => {
	response.sendFile(path.join(__dirname + "/index.html"));
});
app.use(express.static("public"));

const homoglyphs = fs
	.readFileSync(charPath, {
		encoding: "utf8"
	})
	.split("\n");

app.use(bodyParser.urlencoded({ extended: true, limit: "10mb" }));

app.use((err, request, response, next) => {
	response.end(JSON.stringify(err));
});

app.post("/encode", (request, response, next) => {
	const { message, text } = request.body;

	try {
		const buffer = Buffer.from(message, "base64");
		if (buffer.length > 10e6) {
			response.end("message to large");
		}

		fs.writeFileSync(path.join(__dirname, "/input.svg"), buffer);

		response.header("Content-Type", "text/plain; charset=utf-8");
		response.end(encode(buffer, text, homoglyphs, verbose === "true"));
	} catch (err) {
		next(err);
	}
});

app.post("/decode", (request, response, next) => {
	const { message } = request.body;

	try {
		response.header("Content-Type", "text/plain; charset=utf-8");
		response.end(
			decode(message, homoglyphs, verbose === "true").toString("base64")
		);
	} catch (err) {
		next(err);
	}
});

app.listen(port, function() {
	console.log(`glyph-crypt listening on port ${port}!`);
});
