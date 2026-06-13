fetch('http://localhost:2000/api/v2/execute', {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({
    language: 'python',
    version: '3.12.0',
    files: [{
      name: 'main.py',
      content: 'print(1)'
    }],
    stdin: '1\n'
  })
}).then(res => res.json()).then(console.log).catch(console.error);
