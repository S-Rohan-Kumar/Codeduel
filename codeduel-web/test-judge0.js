const code = `#include <iostream>
using namespace std;
int main() { cout << "1\\n"; return 0; }`;

fetch('http://localhost:2358/submissions?wait=true', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    source_code: code,
    language_id: 54,
    stdin: "1\n",
    expected_output: "1\n"
  })
}).then(res => res.json()).then(console.log).catch(console.error);
