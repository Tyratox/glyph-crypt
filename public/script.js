const readBase64 = (file, callback) => {
	const reader = new FileReader();
	reader.readAsDataURL(file);
	reader.onload = () => {
		callback(null, reader.result);
	};
	reader.onerror = error => {
		callback(error);
	};
};

$(() => {
	$("#encode").submit(e => {
		e.preventDefault();

		const message = $("#encode-message").val(),
			text = $("#encode-text").val();
		const base64 = message.includes(";base64,")
			? message.split(";base64,")[1]
			: btoa(message);

		fetch("/encode", {
			method: "POST",
			headers: {
				"Content-Type": "application/x-www-form-urlencoded;charset=UTF-8"
			},
			body: `message=${encodeURIComponent(base64)}&text=${encodeURIComponent(
				text
			)}`
		})
			.then(response => response.text())
			.then(text => {
				$("#encode-result").val(text);
			});
	});

	$("#encode-file").change(function() {
		console.log("reading", this.files[0]);
		readBase64(this.files[0], (err, data) => {
			if (err) {
				return console.error(err);
			}

			$("#encode-message").val(data);
		});
	});

	$("#decode").submit(e => {
		e.preventDefault();

		const message = $("#decode-message").val();

		fetch("/decode", {
			method: "POST",
			headers: {
				"Content-Type": "application/x-www-form-urlencoded;charset=UTF-8"
			},
			body: `message=${encodeURIComponent(message)}`
		})
			.then(response => response.text())
			.then(base64 => {
				$("#decode-result").val(atob(base64));
				$("#decode-download").attr(
					"href",
					"data:application/octet-stream;charset=utf-8;base64," + base64
				);
			});
	});
});
