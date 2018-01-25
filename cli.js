const fs = require("fs");
const path = require("path");

const { encode, decode } = require("./lib");

const action = process.argv[2];

if (action === "encode") {
	const [
		textPath,
		messagePath,
		outputPath,
		charPath,
		verbose
	] = process.argv.slice(3);

	fs.writeFileSync(
		outputPath,
		encode(
			fs.readFileSync(messagePath),
			fs.readFileSync(textPath, { encoding: "utf8" }),
			fs
				.readFileSync(charPath, {
					encoding: "utf8"
				})
				.split("\n"),
			verbose === "true"
		)
	);
} else if (action === "decode") {
	const [messagePath, charPath, outputPath, verbose] = process.argv.slice(3);

	fs.writeFileSync(
		outputPath,
		decode(
			fs.readFileSync(messagePath, { encoding: "utf8" }),
			fs
				.readFileSync(charPath, {
					encoding: "utf8"
				})
				.split("\n"),
			verbose === "true"
		)
	);
}
