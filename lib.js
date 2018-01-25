const findHomoglyphs = (char, homoglyphs = []) => {
	for (let i = 0; i < homoglyphs.length; i++) {
		for (let homoglpyh of homoglyphs[i]) {
			if (char === homoglpyh) {
				const chars = [];
				for (let char of homoglyphs[i]) {
					chars.push(char);
				}
				return chars;
			}
		}
	}

	return [];
};

const bufferToBitArray = buffer => {
	const bytes = [];

	for (const byte of buffer) {
		bytes.push(
			byte
				.toString(2)
				.padStart(8, "0")
				.split("")
				.map(char => char === "1") //booleans will take up less space than storing all bits in 64bit numbers
		);
	}

	return [].concat.apply([], bytes); //flatten array of bytes
};

const encodeBits = (char, bits, homoglyphSet = [], verbose = false) => {
	const homoglyphs = findHomoglyphs(char, homoglyphSet);

	if (homoglyphs.length <= 1) {
		return { char, bits };
	}

	const bitCount = Math.floor(Math.log2(homoglyphs.length));
	let encodedBits = bits
		.slice(0, bitCount)
		.map(bool => (bool ? "1" : "0"))
		.join("");

	if (bitCount > encodedBits.length) {
		encodedBits = encodedBits.padEnd(bitCount, "0");
		//these additional zeroes are padded right so they will be removed during decoding
	}
	const offset = parseInt(encodedBits, 2);

	verbose &&
		console.log(
			"Found",
			homoglyphs.length,
			"homoglyphs for",
			char,
			"which means we can encode",
			bitCount,
			"bits in this character",
			"We're using offset",
			offset,
			"(",
			encodedBits,
			")",
			"=>",
			homoglyphs[offset]
		);

	return {
		char: homoglyphs[offset],
		bits: bits.slice(bitCount) // remove encoded bits
	};
};

const decodeBits = (char, homoglyphSet, verbose = false) => {
	const homoglyphs = findHomoglyphs(char, homoglyphSet);
	const bitCount = Math.floor(Math.log2(homoglyphs.length));
	const offset = homoglyphs.indexOf(char);

	if (homoglyphs.length <= 1 || offset === -1) {
		return [];
	}

	if (offset !== 0) {
		verbose &&
			console.log(
				"Found",
				homoglyphs.length,
				"homoglypes or",
				bitCount,
				"bits and an offset of",
				offset,
				"for",
				char,
				"which can be decoded as",
				offset.toString(2).padStart(bitCount, "0")
			);
	}

	return offset
		.toString(2)
		.padStart(bitCount, "0")
		.split("")
		.map(char => char === "1");
};

const encode = (buffer, text, homoglyphs = [], verbose = false) => {
	let bits = bufferToBitArray(buffer);
	let output = "";

	for (const char of text) {
		if (bits.length === 0) {
			output += char;
			continue;
		}

		const { char: encodeCharacter, bits: bitsLeft } = encodeBits(
			char,
			bits,
			homoglyphs,
			verbose
		);

		output += encodeCharacter;
		bits = bitsLeft;
	}

	return output;
};
module.exports.encode = encode;

const decode = (message, homoglyphs, verbose = false) => {
	let bits = [];

	for (const char of message) {
		bits.push(decodeBits(char, homoglyphs, verbose));
	}

	bits = [].concat.apply([], bits); //flatten bit array

	let zeroCount = 0;
	for (let i = bits.length - 1; i >= 0; i--) {
		if (bits[i] === false) {
			zeroCount++;
		} else {
			break;
		}
	}

	const zeroTail =
		(bits.length - zeroCount) % 8 === 0 ? 0 : 8 - (bits.length - zeroCount) % 8;

	bits = bits.slice(0, bits.length - zeroCount + zeroTail);

	verbose &&
		console.log(
			"Removed",
			zeroCount,
			"-",
			zeroTail,
			"=",
			zeroCount - zeroTail,
			"bits",
			"to have",
			bits.length,
			"bits"
		);

	const bytes = [];

	for (let i = 0; i < bits.length; i += 8) {
		const byte = [];
		for (let j = 0; j < 8; j++) {
			byte.push(bits[i + j]);
		}
		bytes.push(parseInt(byte.map(bool => (bool ? "1" : "0")).join(""), 2));
	}

	return Buffer.from(bytes);
};
module.exports.decode = decode;
