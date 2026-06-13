fetch('http://localhost:2000/api/v2/execute', {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({
    language: 'c++',
    version: '10.2.0',
    files: [{
      name: 'main.cpp',
      content: '#include <iostream>\nusing namespace std;\nint main() { cout << "Hello world"; return 0; }'
    }],
    stdin: '1\n'
  })
}).then(res => res.json()).then(console.log).catch(console.error);
