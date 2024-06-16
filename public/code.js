function Urlcheck() {
            const url = document.getElementById('urlInput').value;
            if (!url) {
                alert('Please enter a URL');
                return;
            }

            const resultElement = document.getElementById('result');
            resultElement.textContent = 'Analyzing...';

            fetch('/performance-test', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ url: url })
            })
            .then(response => response.json())
            .then(data => {
                resultElement.textContent = `TTFB: ${data.ttfb} ms, SEO Issues: ${data.seoIssues.join(', ')}, Dead Links: ${data.deadLinks.join(', ')}`;
            })
            .catch(error => {
                resultElement.textContent = 'An error occurred: ' + error;
            });
        }